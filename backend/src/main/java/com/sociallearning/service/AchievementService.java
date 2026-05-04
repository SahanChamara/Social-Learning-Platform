package com.sociallearning.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sociallearning.entity.Achievement;
import com.sociallearning.entity.LearningStreak;
import com.sociallearning.entity.User;
import com.sociallearning.entity.UserAchievement;
import com.sociallearning.repository.AchievementRepository;
import com.sociallearning.repository.EnrollmentRepository;
import com.sociallearning.repository.LearningStreakRepository;
import com.sociallearning.repository.ProgressRepository;
import com.sociallearning.repository.UserAchievementRepository;
import com.sociallearning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for evaluating and awarding user achievements.
 *
 * Supported criteria JSON format:
 * {
 *   "type": "COURSE_COMPLETION|LESSON_COMPLETION|COURSE_ENROLLMENT|STUDY_MINUTES|STREAK_DAYS",
 *   "target": 5
 * }
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ProgressRepository progressRepository;
    private final LearningStreakRepository learningStreakRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Evaluate all active achievements for the user and award any newly unlocked ones.
     *
     * @param userId user identifier
     * @return list of newly unlocked user-achievement records
     */
    @Transactional
    public List<UserAchievement> checkAchievements(Long userId) {
        return checkAchievements(userId, "UNKNOWN_EVENT");
    }

    /**
     * Evaluate all active achievements for the user and award any newly unlocked ones.
     *
     * @param userId user identifier
     * @param eventType triggering event type (for logs/diagnostics)
     * @return list of newly unlocked user-achievement records
     */
    @Transactional
    public List<UserAchievement> checkAchievements(Long userId, String eventType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        List<Achievement> activeAchievements = achievementRepository.findByIsActiveTrue();
        log.debug("Checking {} active achievements for user {} on event {}",
                activeAchievements.size(), userId, eventType);

        List<UserAchievement> newlyUnlocked = activeAchievements.stream()
                .map(achievement -> evaluateAchievement(user, achievement, eventType))
                .filter(this::isNewlyUnlockedAndNeedsNotification)
                .toList();

        for (UserAchievement unlocked : newlyUnlocked) {
            sendAchievementNotification(unlocked, eventType);
        }

        if (!newlyUnlocked.isEmpty()) {
            log.info("User {} unlocked {} achievement(s) on event {}",
                    userId, newlyUnlocked.size(), eventType);
        }

        return newlyUnlocked;
    }

    @Transactional(readOnly = true)
    public List<Achievement> getActiveAchievements() {
        return achievementRepository.findByIsActiveTrue()
                .stream()
                .filter(achievement -> !Boolean.TRUE.equals(achievement.getIsHidden()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserAchievement> getUserAchievements(Long userId) {
        return userAchievementRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    private UserAchievement evaluateAchievement(User user, Achievement achievement, String eventType) {
        UserAchievement userAchievement = userAchievementRepository
                .findByUserIdAndAchievementId(user.getId(), achievement.getId())
                .orElseGet(() -> UserAchievement.builder()
                        .user(user)
                        .achievement(achievement)
                        .build());

        Map<String, Object> criteria = parseCriteria(achievement);
        String type = readRequiredString(criteria, "type", achievement.getSlug());
        int target = readPositiveTarget(criteria, achievement.getSlug());
        long metricValue = resolveMetricValue(type, user.getId());

        BigDecimal progressPercentage = toProgressPercentage(metricValue, target);
        userAchievement.updateProgress(progressPercentage);
        userAchievement.setProgressJson(buildProgressJson(type, metricValue, target, eventType));

        return userAchievementRepository.save(userAchievement);
    }

    private boolean isNewlyUnlockedAndNeedsNotification(UserAchievement userAchievement) {
        return Boolean.TRUE.equals(userAchievement.getIsUnlocked()) && userAchievement.getNotifiedAt() == null;
    }

    private void sendAchievementNotification(UserAchievement userAchievement, String eventType) {
        userAchievement.setNotifiedAt(LocalDateTime.now());
        userAchievementRepository.save(userAchievement);

        log.info("Achievement unlocked notification: userId={}, achievement={}, eventType={}",
                userAchievement.getUser().getId(),
                userAchievement.getAchievement().getSlug(),
                eventType);
    }

    private Map<String, Object> parseCriteria(Achievement achievement) {
        try {
            return objectMapper.readValue(achievement.getCriteriaJson(), new TypeReference<>() {});
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException(
                    "Invalid criteria JSON for achievement '" + achievement.getSlug() + "'", ex);
        }
    }

    private String readRequiredString(Map<String, Object> criteria, String key, String achievementSlug) {
        Object value = criteria.get(key);
        if (!(value instanceof String stringValue) || stringValue.isBlank()) {
            throw new IllegalStateException(
                    "Missing or invalid '" + key + "' in criteria for achievement '" + achievementSlug + "'");
        }
        return stringValue;
    }

    private int readPositiveTarget(Map<String, Object> criteria, String achievementSlug) {
        Object value = criteria.get("target");
        if (!(value instanceof Number numberValue)) {
            throw new IllegalStateException(
                    "Missing numeric 'target' in criteria for achievement '" + achievementSlug + "'");
        }

        int target = numberValue.intValue();
        if (target <= 0) {
            throw new IllegalStateException(
                    "Criteria target must be greater than 0 for achievement '" + achievementSlug + "'");
        }

        return target;
    }

    private long resolveMetricValue(String criteriaType, Long userId) {
        return switch (criteriaType) {
            case "COURSE_COMPLETION" -> enrollmentRepository.countCompletedCoursesByUserId(userId);
            case "COURSE_ENROLLMENT" -> enrollmentRepository.countByUserId(userId);
            case "LESSON_COMPLETION" -> progressRepository.countByUserIdAndCompletedTrue(userId);
            case "STUDY_MINUTES" -> {
                Integer totalWatchTimeSeconds = progressRepository.getTotalWatchTimeByUserId(userId);
                yield totalWatchTimeSeconds == null ? 0 : totalWatchTimeSeconds / 60;
            }
            case "STREAK_DAYS" -> learningStreakRepository.findByUserId(userId)
                    .map(LearningStreak::getCurrentStreakDays)
                    .orElse(0);
            default -> throw new IllegalStateException("Unsupported achievement criteria type: " + criteriaType);
        };
    }

    private BigDecimal toProgressPercentage(long current, int target) {
        if (target <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal value = BigDecimal.valueOf(current)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(target), 2, RoundingMode.HALF_UP);

        if (value.compareTo(BigDecimal.valueOf(100)) > 0) {
            return BigDecimal.valueOf(100);
        }
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        return value;
    }

    private String buildProgressJson(String type, long metricValue, int target, String eventType) {
        Map<String, Object> progress = new HashMap<>();
        progress.put("type", type);
        progress.put("metricValue", metricValue);
        progress.put("target", target);
        progress.put("eventType", eventType);
        progress.put("checkedAt", LocalDateTime.now().toString());

        try {
            return objectMapper.writeValueAsString(progress);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to serialize achievement progress JSON", ex);
        }
    }
}

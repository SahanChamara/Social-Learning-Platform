package com.sociallearning.service;

import com.sociallearning.entity.LearningStreak;
import com.sociallearning.entity.User;
import com.sociallearning.repository.LearningStreakRepository;
import com.sociallearning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Service for tracking and maintaining user learning streaks.
 *
 * Responsibilities:
 * - Record daily learning activity
 * - Reset current streak when an inactivity gap is detected
 * - Keep longest streak synchronized via entity logic
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StreakService {

    private final LearningStreakRepository learningStreakRepository;
    private final UserRepository userRepository;

    /**
     * Record activity for "today".
     */
    @Transactional
    public LearningStreak recordDailyActivity(Long userId) {
        return recordDailyActivity(userId, LocalDate.now());
    }

    /**
     * Record activity for a specific date.
     * Intended for deterministic testing and backfill workflows.
     */
    @Transactional
    public LearningStreak recordDailyActivity(Long userId, LocalDate activityDate) {
        if (activityDate == null) {
            throw new IllegalArgumentException("Activity date is required");
        }

        LearningStreak streak = getOrCreateStreak(userId);
        streak.recordActivity(activityDate);
        LearningStreak saved = learningStreakRepository.save(streak);

        log.debug("Updated streak for user {}: current={}, longest={}, totalActiveDays={}, lastActivity={}",
                userId,
                saved.getCurrentStreakDays(),
                saved.getLongestStreakDays(),
                saved.getTotalActiveDays(),
                saved.getLastActivityDate());

        return saved;
    }

    /**
     * Get user's streak and reset current streak if an inactivity gap exists.
     */
    @Transactional
    public LearningStreak getCurrentStreak(Long userId) {
        LearningStreak streak = getOrCreateStreak(userId);
        applyInactivityReset(streak, LocalDate.now());
        return learningStreakRepository.save(streak);
    }

    /**
     * Reset current streak when user has been inactive for 2+ days.
     *
     * @return true if reset happened, false otherwise
     */
    @Transactional
    public boolean resetIfInactive(Long userId) {
        LearningStreak streak = getOrCreateStreak(userId);
        boolean reset = applyInactivityReset(streak, LocalDate.now());
        if (reset) {
            learningStreakRepository.save(streak);
            log.info("Streak reset due to inactivity for user {}", userId);
        }
        return reset;
    }

    private LearningStreak getOrCreateStreak(Long userId) {
        return learningStreakRepository.findByUserId(userId)
                .orElseGet(() -> learningStreakRepository.save(LearningStreak.builder()
                        .user(resolveUser(userId))
                        .build()));
    }

    private User resolveUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
    }

    private boolean applyInactivityReset(LearningStreak streak, LocalDate referenceDate) {
        if (streak.getLastActivityDate() == null || streak.getCurrentStreakDays() == null) {
            return false;
        }

        if (streak.getCurrentStreakDays() <= 0) {
            return false;
        }

        if (referenceDate.isAfter(streak.getLastActivityDate().plusDays(1))) {
            streak.resetCurrentStreak();
            return true;
        }

        return false;
    }
}

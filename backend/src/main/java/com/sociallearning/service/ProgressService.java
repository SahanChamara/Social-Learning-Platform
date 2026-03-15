package com.sociallearning.service;

import com.sociallearning.entity.Enrollment;
import com.sociallearning.entity.Lesson;
import com.sociallearning.entity.Progress;
import com.sociallearning.repository.LessonRepository;
import com.sociallearning.repository.ProgressRepository;
import com.sociallearning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for handling learner lesson progress operations.
 *
 * Provides business logic for:
 * - Marking lessons as completed
 * - Updating enrollment-level progress percentages
 * - Triggering post-progress hooks (achievements, etc.)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProgressService {

    private static final String USER_NOT_FOUND_MSG = "User not found with ID: ";
    private static final String LESSON_NOT_FOUND_MSG = "Lesson not found with ID: ";

    private final ProgressRepository progressRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final EnrollmentService enrollmentService;

    /**
     * Mark a lesson as completed for a learner.
     *
     * Flow:
     * - Validate user and lesson
     * - Resolve learner enrollment for the lesson's course
     * - Create progress record if missing (handles lessons added post-enrollment)
     * - Mark lesson complete
     * - Recalculate enrollment percentage and completion status
     * - Trigger achievement hook
     *
     * @param userId Learner ID
     * @param lessonId Lesson ID
     * @return Updated lesson progress record
     * @throws IllegalArgumentException if user/lesson/enrollment is not found
     */
    @Transactional
    public Progress markLessonComplete(Long userId, Long lessonId) {
        log.info("Marking lesson ID: {} complete for user ID: {}", lessonId, userId);

        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND_MSG + userId));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException(LESSON_NOT_FOUND_MSG + lessonId));

        Long courseId = lesson.getModule().getCourse().getId();
        Enrollment enrollment = enrollmentService.getEnrollment(userId, courseId);

        Progress progress = getOrCreateProgressRecord(enrollment, lesson);
        boolean wasCompleted = Boolean.TRUE.equals(progress.getCompleted());

        progress.markAccessed();
        progress.markCompleted();
        progress = progressRepository.save(progress);

        Enrollment updatedEnrollment = enrollmentService.calculateProgress(enrollment.getId());

        if (!wasCompleted) {
            triggerAchievementCheck(userId, updatedEnrollment);
        }

        log.info("Lesson completion recorded: lessonId={}, userId={}, enrollmentId={}, progress={}%%",
                lessonId,
                userId,
                updatedEnrollment.getId(),
                updatedEnrollment.getProgressPercentage());

        return progress;
    }

    /**
     * Get all lesson progress records for an enrollment.
     *
     * @param enrollmentId Enrollment ID
     * @return Ordered progress records with lesson details
     */
    @Transactional(readOnly = true)
    public List<Progress> getEnrollmentProgress(Long enrollmentId) {
        return progressRepository.findByEnrollmentIdWithLessonDetails(enrollmentId);
    }

    private Progress getOrCreateProgressRecord(Enrollment enrollment, Lesson lesson) {
        return progressRepository.findByEnrollmentIdAndLessonId(enrollment.getId(), lesson.getId())
                .orElseGet(() -> Progress.builder()
                        .enrollment(enrollment)
                        .user(enrollment.getUser())
                        .lesson(lesson)
                        .completed(false)
                        .build());
    }

    private void triggerAchievementCheck(Long userId, Enrollment enrollment) {
        // Placeholder for Phase 6 AchievementService integration.
        if (enrollment.isCompleted()) {
            log.info("Achievement hook: user {} completed course {}", userId, enrollment.getCourse().getId());
        } else {
            log.debug("Achievement hook: user {} progressed to {}%% in course {}",
                    userId,
                    enrollment.getProgressPercentage(),
                    enrollment.getCourse().getId());
        }
    }
}
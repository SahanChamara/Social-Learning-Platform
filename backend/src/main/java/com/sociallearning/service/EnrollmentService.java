package com.sociallearning.service;

import com.sociallearning.entity.Course;
import com.sociallearning.entity.Enrollment;
import com.sociallearning.entity.Lesson;
import com.sociallearning.entity.Progress;
import com.sociallearning.entity.User;
import com.sociallearning.enums.EnrollmentStatus;
import com.sociallearning.repository.CourseRepository;
import com.sociallearning.repository.EnrollmentRepository;
import com.sociallearning.repository.LessonRepository;
import com.sociallearning.repository.ProgressRepository;
import com.sociallearning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for handling enrollment operations.
 *
 * Provides business logic for:
 * - Enrolling a learner in a course
 * - Creating initial lesson progress records
 * - Calculating and updating enrollment progress
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    private static final String ENROLLMENT_NOT_FOUND_MSG = "Enrollment not found with ID: ";

    /**
     * Enroll a learner in a course.
     *
     * Business rules:
     * - A learner can only have one enrollment per course
     * - Progress records are pre-created for all course lessons
     * - Enrollment progress is initialized to 0%
     *
     * @param userId Learner ID
     * @param courseId Course ID
     * @return Created enrollment
     * @throws IllegalArgumentException if user/course not found or already enrolled
     */
    @Transactional
    public Enrollment enrollCourse(Long userId, Long courseId) {
        log.info("Enrolling user ID: {} in course ID: {}", userId, courseId);

        if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new IllegalArgumentException("User is already enrolled in this course");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with ID: " + courseId));

        List<Lesson> lessons = lessonRepository.findByCourseId(courseId);

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .build();

        enrollment.initializeLessonProgress(lessons.size());
        enrollment.markAccessed();
        enrollment = enrollmentRepository.save(enrollment);

        if (!lessons.isEmpty()) {
            List<Progress> progressRecords = createInitialProgressRecords(enrollment, lessons);
            progressRepository.saveAll(progressRecords);
        }

        course.incrementEnrollmentCount();
        courseRepository.save(course);

        log.info("Enrollment created successfully with ID: {} ({} lessons initialized)",
                enrollment.getId(), lessons.size());

        return enrollment;
    }

    /**
     * Calculate and persist enrollment progress percentage.
     *
     * @param enrollmentId Enrollment ID
     * @return Updated enrollment
     * @throws IllegalArgumentException if enrollment not found
     */
    @Transactional
    public Enrollment calculateProgress(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new IllegalArgumentException(ENROLLMENT_NOT_FOUND_MSG + enrollmentId));

        long totalLessons = progressRepository.countByEnrollmentId(enrollmentId);
        long completedLessons = progressRepository.countByEnrollmentIdAndCompletedTrue(enrollmentId);

        enrollment.updateProgress((int) completedLessons, (int) totalLessons);

        Integer totalWatchTimeSeconds = progressRepository.getTotalWatchTimeByEnrollmentId(enrollmentId);
        int totalWatchTimeMinutes = totalWatchTimeSeconds != null ? totalWatchTimeSeconds / 60 : 0;
        enrollment.setTimeSpentMinutes(Math.max(totalWatchTimeMinutes, 0));

        enrollment = enrollmentRepository.save(enrollment);

        log.debug("Enrollment progress recalculated: enrollmentId={}, completed={}/{}, progress={}%%",
                enrollmentId,
                enrollment.getCompletedLessons(),
                enrollment.getTotalLessons(),
                enrollment.getProgressPercentage());

        return enrollment;
    }

    /**
     * Get all enrollments for a learner, newest first.
     *
     * @param userId Learner ID
     * @return Enrollment list
     */
    @Transactional(readOnly = true)
    public List<Enrollment> getUserEnrollments(Long userId) {
        return enrollmentRepository.findByUserIdWithCourse(userId);
    }

    /**
     * Get a learner enrollment for a specific course.
     *
     * @param userId Learner ID
     * @param courseId Course ID
     * @return Enrollment
     * @throws IllegalArgumentException if enrollment not found
     */
    @Transactional(readOnly = true)
    public Enrollment getEnrollment(Long userId, Long courseId) {
        return enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Enrollment not found for user " + userId + " and course " + courseId));
    }

    /**
     * Get learner enrollments filtered by status.
     *
     * @param userId Learner ID
     * @param status Enrollment status
     * @return Filtered enrollment list
     */
    @Transactional(readOnly = true)
    public List<Enrollment> getUserEnrollments(Long userId, EnrollmentStatus status) {
        if (status == null) {
            return getUserEnrollments(userId);
        }

        return enrollmentRepository.findByUserIdAndStatusOrderByEnrolledAtDesc(userId, status);
    }

    /**
     * Unenroll a learner from a course.
     *
     * @param userId Learner ID
     * @param courseId Course ID
     * @throws IllegalArgumentException if enrollment is not found
     */
    @Transactional
    public void unenrollCourse(Long userId, Long courseId) {
        log.info("Unenrolling user ID: {} from course ID: {}", userId, courseId);

        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Enrollment not found for user " + userId + " and course " + courseId));

        Course course = enrollment.getCourse();

        progressRepository.deleteByEnrollmentId(enrollment.getId());
        enrollmentRepository.delete(enrollment);

        course.decrementEnrollmentCount();
        courseRepository.save(course);

        log.info("Unenrollment completed for user ID: {} and course ID: {}", userId, courseId);
    }

    private List<Progress> createInitialProgressRecords(Enrollment enrollment, List<Lesson> lessons) {
        List<Progress> progressRecords = new ArrayList<>(lessons.size());

        for (Lesson lesson : lessons) {
            Progress progress = Progress.builder()
                    .enrollment(enrollment)
                    .user(enrollment.getUser())
                    .lesson(lesson)
                    .completed(false)
                    .build();

            progressRecords.add(progress);
        }

        return progressRecords;
    }
}
package com.sociallearning.graphql;

import com.sociallearning.entity.Enrollment;
import com.sociallearning.entity.Progress;
import com.sociallearning.enums.EnrollmentStatus;
import com.sociallearning.security.SecurityUtils;
import com.sociallearning.service.EnrollmentService;
import com.sociallearning.service.ProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * GraphQL resolver for enrollment and progress operations.
 *
 * Handles:
 * - Course enrollment and unenrollment
 * - Lesson completion progress updates
 * - Current learner enrollments query
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class EnrollmentResolver {

    private final EnrollmentService enrollmentService;
    private final ProgressService progressService;

    /**
     * Enroll current learner in a course.
     *
     * @param courseId Course ID
     * @return Created enrollment
     */
    @MutationMapping
    public Enrollment enrollCourse(@Argument Long courseId) {
        Long userId = getRequiredUserId();
        log.info("GraphQL mutation: enrollCourse(courseId={}) by user {}", courseId, userId);

        return enrollmentService.enrollCourse(userId, courseId);
    }

    /**
     * Unenroll current learner from a course.
     *
     * @param courseId Course ID
     * @return true when operation succeeds
     */
    @MutationMapping
    public Boolean unenrollCourse(@Argument Long courseId) {
        Long userId = getRequiredUserId();
        log.info("GraphQL mutation: unenrollCourse(courseId={}) by user {}", courseId, userId);

        enrollmentService.unenrollCourse(userId, courseId);
        return true;
    }

    /**
     * Mark a lesson as complete for current learner.
     *
     * @param lessonId Lesson ID
     * @return Updated progress record
     */
    @MutationMapping
    public Progress markLessonComplete(@Argument Long lessonId) {
        Long userId = getRequiredUserId();
        log.info("GraphQL mutation: markLessonComplete(lessonId={}) by user {}", lessonId, userId);

        return progressService.markLessonComplete(userId, lessonId);
    }

    /**
     * Get enrollments for the currently authenticated learner.
     *
     * @param status Optional status filter
     * @return Enrollment list
     */
    @QueryMapping
    public List<Enrollment> myEnrollments(@Argument EnrollmentStatus status) {
        Long userId = getRequiredUserId();
        log.debug("GraphQL query: myEnrollments(status={}) by user {}", status, userId);

        return enrollmentService.getUserEnrollments(userId, status);
    }

    private Long getRequiredUserId() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new SecurityException("Authentication required");
        }
        return userId;
    }
}

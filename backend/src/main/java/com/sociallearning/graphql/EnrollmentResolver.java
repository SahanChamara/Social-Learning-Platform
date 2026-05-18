package com.sociallearning.graphql;

import com.sociallearning.entity.Enrollment;
import com.sociallearning.entity.Progress;
import com.sociallearning.enums.EnrollmentStatus;
import com.sociallearning.repository.ProgressRepository;
import com.sociallearning.security.SecurityUtils;
import com.sociallearning.service.EnrollmentService;
import com.sociallearning.service.ProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * GraphQL resolver for learner enrollment and lesson progress operations.
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class EnrollmentResolver {

    private final EnrollmentService enrollmentService;
    private final ProgressService progressService;
    private final ProgressRepository progressRepository;

    @QueryMapping
    public List<Enrollment> myEnrollments(@Argument EnrollmentStatus status) {
        Long userId = requireCurrentUser();
        log.info("GraphQL query: myEnrollments(userId={}, status={})", userId, status);
        return enrollmentService.getUserEnrollments(userId, status);
    }

    @QueryMapping
    public Enrollment enrollmentStatus(@Argument Long courseId) {
        Long userId = requireCurrentUser();
        log.info("GraphQL query: enrollmentStatus(userId={}, courseId={})", userId, courseId);
        return enrollmentService.findEnrollment(userId, courseId).orElse(null);
    }

    @QueryMapping
    public Enrollment courseEnrollment(@Argument Long courseId) {
        Long userId = requireCurrentUser();
        log.info("GraphQL query: courseEnrollment(userId={}, courseId={})", userId, courseId);
        return enrollmentService.findEnrollment(userId, courseId).orElse(null);
    }

    @MutationMapping
    public Enrollment enrollCourse(@Argument Long courseId) {
        Long userId = requireCurrentUser();
        log.info("GraphQL mutation: enrollCourse(userId={}, courseId={})", userId, courseId);
        return enrollmentService.enrollCourse(userId, courseId);
    }

    @MutationMapping
    public Boolean unenrollCourse(@Argument Long courseId) {
        Long userId = requireCurrentUser();
        log.info("GraphQL mutation: unenrollCourse(userId={}, courseId={})", userId, courseId);
        return enrollmentService.unenrollCourse(userId, courseId);
    }

    @MutationMapping
    public Progress markLessonComplete(@Argument Long lessonId) {
        Long userId = requireCurrentUser();
        log.info("GraphQL mutation: markLessonComplete(userId={}, lessonId={})", userId, lessonId);
        return progressService.markLessonComplete(userId, lessonId);
    }

    @SchemaMapping(typeName = "Enrollment", field = "progressRecords")
    public List<Progress> progressRecords(Enrollment enrollment) {
        return progressRepository.findByEnrollmentIdWithLessonDetails(enrollment.getId());
    }

    private Long requireCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new SecurityException("Authentication required");
        }

        return userId;
    }
}

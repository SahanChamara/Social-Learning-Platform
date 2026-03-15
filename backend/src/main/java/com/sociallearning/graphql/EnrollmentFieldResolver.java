package com.sociallearning.graphql;

import com.sociallearning.entity.Enrollment;
import com.sociallearning.entity.Progress;
import com.sociallearning.service.ProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * GraphQL field resolver for Enrollment type.
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class EnrollmentFieldResolver {

    private final ProgressService progressService;

    /**
     * Resolve progress percentage from enrollment value object.
     *
     * Explicit resolver added per implementation task requirement.
     *
     * @param enrollment Parent enrollment entity
     * @return Progress percentage as float-compatible value
     */
    @SchemaMapping(typeName = "Enrollment", field = "progressPercentage")
    public Double enrollmentProgressPercentage(Enrollment enrollment) {
        if (enrollment.getProgressPercentage() == null) {
            return 0.0;
        }

        return enrollment.getProgressPercentage().doubleValue();
    }

    /**
     * Resolve lesson-level progress records for an enrollment.
     *
     * @param enrollment Parent enrollment entity
     * @return Ordered list of progress records
     */
    @SchemaMapping(typeName = "Enrollment", field = "progressRecords")
    public List<Progress> enrollmentProgressRecords(Enrollment enrollment) {
        log.debug("Resolving progressRecords for enrollment ID: {}", enrollment.getId());
        return progressService.getEnrollmentProgress(enrollment.getId());
    }
}

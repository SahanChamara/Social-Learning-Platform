package com.sociallearning.graphql;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Converts validation and input exceptions into consistent GraphQL errors.
 */
@Slf4j
@Component
public class GraphqlExceptionResolver extends DataFetcherExceptionResolverAdapter {

    @Override
    protected GraphQLError resolveToSingleError(Throwable ex, DataFetchingEnvironment env) {
        if (ex instanceof BindException bindException) {
            return buildValidationError(bindException, env);
        }
        if (ex instanceof ConstraintViolationException violationException) {
            return buildConstraintViolationError(violationException, env);
        }
        if (ex instanceof IllegalArgumentException illegalArgumentException) {
            return GraphqlErrorBuilder.newError(env)
                    .errorType(ErrorType.BAD_REQUEST)
                    .message(illegalArgumentException.getMessage())
                    .extensions(Map.of("code", "BAD_REQUEST"))
                    .build();
        }
        if (ex instanceof SecurityException securityException) {
            return GraphqlErrorBuilder.newError(env)
                    .errorType(ErrorType.FORBIDDEN)
                    .message(securityException.getMessage())
                    .extensions(Map.of("code", "FORBIDDEN"))
                    .build();
        }

        log.error("Unhandled GraphQL error", ex);
        return GraphqlErrorBuilder.newError(env)
                .errorType(ErrorType.INTERNAL_ERROR)
                .message("Internal server error")
                .extensions(Map.of("code", "INTERNAL_ERROR"))
                .build();
    }

    private GraphQLError buildValidationError(BindException ex, DataFetchingEnvironment env) {
        List<Map<String, String>> errors = ex.getFieldErrors()
                .stream()
                .map(this::toFieldError)
                .toList();

        return GraphqlErrorBuilder.newError(env)
                .errorType(ErrorType.BAD_REQUEST)
                .message("Validation failed")
                .extensions(Map.of(
                        "code", "VALIDATION_ERROR",
                        "errors", errors
                ))
                .build();
    }

    private GraphQLError buildConstraintViolationError(ConstraintViolationException ex, DataFetchingEnvironment env) {
        List<Map<String, String>> errors = ex.getConstraintViolations()
                .stream()
                .map(this::toConstraintError)
                .toList();

        return GraphqlErrorBuilder.newError(env)
                .errorType(ErrorType.BAD_REQUEST)
                .message("Validation failed")
                .extensions(Map.of(
                        "code", "VALIDATION_ERROR",
                        "errors", errors
                ))
                .build();
    }

    private Map<String, String> toFieldError(FieldError fieldError) {
        Map<String, String> result = new LinkedHashMap<>();
        result.put("field", fieldError.getField());
        result.put("message", fieldError.getDefaultMessage() != null ? fieldError.getDefaultMessage() : "Invalid value");
        return result;
    }

    private Map<String, String> toConstraintError(ConstraintViolation<?> violation) {
        Map<String, String> result = new LinkedHashMap<>();
        result.put("field", violation.getPropertyPath().toString());
        result.put("message", violation.getMessage());
        return result;
    }
}

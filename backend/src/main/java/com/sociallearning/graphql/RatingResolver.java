package com.sociallearning.graphql;

import com.sociallearning.entity.Rating;
import com.sociallearning.security.InputSanitizer;
import com.sociallearning.security.SecurityUtils;
import com.sociallearning.service.RatingService;
import com.sociallearning.service.RatingService.RatingStats;
import com.sociallearning.service.SubscriptionPublisher;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * GraphQL resolver for rating and review operations.
 * 
 * Handles:
 * - Rating courses (create/update)
 * - Managing reviews
 * - Fetching ratings with pagination
 * - Rating statistics
 * - Publishing subscription events
 */
@Slf4j
@Controller
@Validated
@RequiredArgsConstructor
public class RatingResolver {

    private final RatingService ratingService;
    private final SubscriptionPublisher subscriptionPublisher;
    private final InputSanitizer inputSanitizer;

    // ============================================
    // Mutations
    // ============================================

    /**
     * Rate a course (creates or updates existing rating).
     * Publishes a subscription event when rating is added/updated.
     * 
     * GraphQL Mutation:
     * mutation RateCourse($input: RateCourseInput!) {
     *   rateCourse(input: $input) {
     *     id
     *     ratingValue
     *     reviewTitle
     *     reviewContent
     *     isVerifiedPurchase
     *     user { id username }
     *     createdAt
     *   }
     * }
     */
    @MutationMapping
    public Rating rateCourse(@Argument("input") @Valid RateCourseInput input) {
        Long userId = requireAuthentication();
        Long courseId = Long.parseLong(input.courseId());
        
        log.info("GraphQL rateCourse mutation: userId={}, courseId={}, rating={}", 
                userId, courseId, input.ratingValue());
        
        // Check if this is a new rating or an update
        boolean isNew = ratingService.getUserCourseRating(userId, courseId).isEmpty();
        
        Rating rating = ratingService.rateCourse(
                userId,
                courseId,
                input.ratingValue(),
                inputSanitizer.sanitizeNullable(input.reviewTitle()),
                inputSanitizer.sanitizeNullable(input.reviewContent())
        );
        
        // Publish subscription event
        subscriptionPublisher.publishRatingEvent(rating, isNew);
        
        return rating;
    }

    /**
     * Update an existing rating.
     * Authorization: Only the rating author can update.
     * Publishes a subscription event when rating is updated.
     * 
     * GraphQL Mutation:
     * mutation UpdateRating($id: ID!, $input: UpdateRatingInput!) {
     *   updateRating(id: $id, input: $input) {
     *     id
     *     ratingValue
     *     reviewTitle
     *     reviewContent
     *     isEdited
     *     editedAt
     *   }
     * }
     */
    @MutationMapping
    public Rating updateRating(
            @Argument @NotNull @Positive Long id,
            @Argument("input") @Valid UpdateRatingInput input) {
        Long userId = requireAuthentication();
        
        log.info("GraphQL updateRating mutation: userId={}, ratingId={}", userId, id);
        
        Rating rating = null;
        
        // Update rating value if provided
        if (input.ratingValue() != null) {
            rating = ratingService.updateRating(userId, id, input.ratingValue());
        }
        
        // Update review if provided
        if (input.reviewTitle() != null || input.reviewContent() != null) {
            rating = ratingService.updateReview(
                    userId,
                    id,
                    inputSanitizer.sanitizeNullable(input.reviewTitle()),
                    inputSanitizer.sanitizeNullable(input.reviewContent())
            );
        }
        
        if (rating == null) {
            // No updates provided, just return the existing rating
            return ratingService.getUserCourseRating(userId, id)
                    .orElseThrow(() -> new IllegalArgumentException("Rating not found"));
        }
        
        // Publish subscription event
        subscriptionPublisher.publishRatingEvent(rating, false);
        
        return rating;
    }

    /**
     * Delete a rating.
     * Authorization: Only the rating author can delete.
     * 
     * GraphQL Mutation:
     * mutation DeleteRating($id: ID!) {
     *   deleteRating(id: $id)
     * }
     */
    @MutationMapping
    public boolean deleteRating(@Argument @NotNull @Positive Long id) {
        Long userId = requireAuthentication();
        
        log.info("GraphQL deleteRating mutation: userId={}, ratingId={}", userId, id);
        
        ratingService.deleteRating(userId, id);
        return true;
    }

    /**
     * Mark a review as helpful.
     * 
     * GraphQL Mutation:
     * mutation MarkReviewHelpful($id: ID!) {
     *   markReviewHelpful(id: $id) {
     *     id
     *     helpfulCount
     *   }
     * }
     */
    @MutationMapping
    public Rating markReviewHelpful(@Argument @NotNull @Positive Long id) {
        requireAuthentication();
        
        log.info("GraphQL markReviewHelpful mutation: ratingId={}", id);
        
        ratingService.markReviewHelpful(id);
        
        // Return the updated rating
        return ratingService.getUserCourseRating(SecurityUtils.getCurrentUserId(), id)
                .orElse(null);
    }

    // ============================================
    // Queries
    // ============================================

    /**
     * Get ratings for a course with pagination.
     * 
     * GraphQL Query:
     * query GetCourseRatings($courseId: ID!, $page: Int, $size: Int) {
     *   courseRatings(courseId: $courseId, page: $page, size: $size) {
     *     content {
     *       id
     *       ratingValue
     *       reviewTitle
     *       reviewContent
     *       user { id username avatarUrl }
     *       helpfulCount
     *       isVerifiedPurchase
     *       createdAt
     *     }
     *     totalElements
     *     totalPages
     *     hasNext
     *   }
     * }
     */
    @QueryMapping
    public Map<String, Object> courseRatings(
            @Argument @NotNull @Positive Long courseId,
            @Argument @Min(0) Integer page,
            @Argument @Min(1) @Max(50) Integer size) {
        
        log.info("GraphQL courseRatings query: courseId={}, page={}, size={}", courseId, page, size);
        
        int pageNumber = (page != null) ? page : 0;
        int pageSize = (size != null && size > 0) ? Math.min(size, 50) : 20;
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        
        Page<Rating> ratingPage = ratingService.getCourseRatings(courseId, pageable);
        
        return toPageResult(ratingPage);
    }

    /**
     * Get reviews (ratings with content) for a course.
     * 
     * GraphQL Query:
     * query GetCourseReviews($courseId: ID!, $page: Int, $size: Int) {
     *   courseReviews(courseId: $courseId, page: $page, size: $size) {
     *     content {
     *       id
     *       ratingValue
     *       reviewTitle
     *       reviewContent
     *       user { id username }
     *     }
     *     totalElements
     *   }
     * }
     */
    @QueryMapping
    public Map<String, Object> courseReviews(
            @Argument @NotNull @Positive Long courseId,
            @Argument @Min(0) Integer page,
            @Argument @Min(1) @Max(50) Integer size) {
        
        log.info("GraphQL courseReviews query: courseId={}, page={}, size={}", courseId, page, size);
        
        int pageNumber = (page != null) ? page : 0;
        int pageSize = (size != null && size > 0) ? Math.min(size, 50) : 20;
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        
        Page<Rating> reviewPage = ratingService.getCourseReviews(courseId, pageable);
        
        return toPageResult(reviewPage);
    }

    /**
     * Get rating statistics for a course.
     * 
     * GraphQL Query:
     * query GetCourseRatingStats($courseId: ID!) {
     *   courseRatingStats(courseId: $courseId) {
     *     average
     *     totalCount
     *     fiveStarCount
     *     fourStarCount
     *     threeStarCount
     *     twoStarCount
     *     oneStarCount
     *   }
     * }
     */
    @QueryMapping
    public Map<String, Object> courseRatingStats(@Argument @NotNull @Positive Long courseId) {
        log.info("GraphQL courseRatingStats query: courseId={}", courseId);
        
        RatingStats stats = ratingService.getRatingStats(courseId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("average", stats.average() != null ? stats.average() : 0.0);
        result.put("totalCount", stats.totalCount());
        result.put("fiveStarCount", stats.fiveStarCount());
        result.put("fourStarCount", stats.fourStarCount());
        result.put("threeStarCount", stats.threeStarCount());
        result.put("twoStarCount", stats.twoStarCount());
        result.put("oneStarCount", stats.oneStarCount());
        
        return result;
    }

    /**
     * Get the current user's rating for a course.
     * 
     * GraphQL Query:
     * query GetMyRating($courseId: ID!) {
     *   myRating(courseId: $courseId) {
     *     id
     *     ratingValue
     *     reviewTitle
     *     reviewContent
     *   }
     * }
     */
    @QueryMapping
    public Rating myRating(@Argument @NotNull @Positive Long courseId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return null;
        }
        
        log.debug("GraphQL myRating query: userId={}, courseId={}", userId, courseId);
        
        Optional<Rating> rating = ratingService.getUserCourseRating(userId, courseId);
        return rating.orElse(null);
    }

    // ============================================
    // Helper Methods
    // ============================================

    private Long requireAuthentication() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new IllegalArgumentException("Authentication required");
        }
        return userId;
    }

    private Map<String, Object> toPageResult(Page<Rating> page) {
        Map<String, Object> result = new HashMap<>();
        result.put("content", page.getContent());
        result.put("totalElements", page.getTotalElements());
        result.put("totalPages", page.getTotalPages());
        result.put("pageNumber", page.getNumber());
        result.put("pageSize", page.getSize());
        result.put("hasNext", page.hasNext());
        result.put("hasPrevious", page.hasPrevious());
        return result;
    }

    // ============================================
    // Input Records
    // ============================================

    public record RateCourseInput(
        @NotBlank(message = "Course ID is required")
        @Pattern(regexp = "^\\d+$", message = "Course ID must be a numeric value")
        String courseId,
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        int ratingValue,
        @Size(max = 200, message = "Review title must not exceed 200 characters")
        String reviewTitle,
        @Size(max = 5000, message = "Review content must not exceed 5000 characters")
        String reviewContent
    ) {}

    public record UpdateRatingInput(
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        Integer ratingValue,
        @Size(max = 200, message = "Review title must not exceed 200 characters")
        String reviewTitle,
        @Size(max = 5000, message = "Review content must not exceed 5000 characters")
        String reviewContent
    ) {}
}

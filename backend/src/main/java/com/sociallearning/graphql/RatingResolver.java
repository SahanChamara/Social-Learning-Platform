package com.sociallearning.graphql;

import com.sociallearning.entity.Rating;
import com.sociallearning.security.SecurityUtils;
import com.sociallearning.service.RatingService;
import com.sociallearning.service.RatingService.RatingStats;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

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
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class RatingResolver {

    private final RatingService ratingService;

    // ============================================
    // Mutations
    // ============================================

    /**
     * Rate a course (creates or updates existing rating).
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
    public Rating rateCourse(@Argument("input") RateCourseInput input) {
        Long userId = requireAuthentication();
        
        log.info("GraphQL rateCourse mutation: userId={}, courseId={}, rating={}", 
                userId, input.courseId(), input.ratingValue());
        
        return ratingService.rateCourse(
                userId,
                Long.parseLong(input.courseId()),
                input.ratingValue(),
                input.reviewTitle(),
                input.reviewContent()
        );
    }

    /**
     * Update an existing rating.
     * Authorization: Only the rating author can update.
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
    public Rating updateRating(@Argument Long id, @Argument("input") UpdateRatingInput input) {
        Long userId = requireAuthentication();
        
        log.info("GraphQL updateRating mutation: userId={}, ratingId={}", userId, id);
        
        Rating rating = null;
        
        // Update rating value if provided
        if (input.ratingValue() != null) {
            rating = ratingService.updateRating(userId, id, input.ratingValue());
        }
        
        // Update review if provided
        if (input.reviewTitle() != null || input.reviewContent() != null) {
            rating = ratingService.updateReview(userId, id, input.reviewTitle(), input.reviewContent());
        }
        
        if (rating == null) {
            // No updates provided, just return the existing rating
            return ratingService.getUserCourseRating(userId, id)
                    .orElseThrow(() -> new IllegalArgumentException("Rating not found"));
        }
        
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
    public boolean deleteRating(@Argument Long id) {
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
    public Rating markReviewHelpful(@Argument Long id) {
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
            @Argument Long courseId,
            @Argument Integer page,
            @Argument Integer size) {
        
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
            @Argument Long courseId,
            @Argument Integer page,
            @Argument Integer size) {
        
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
    public Map<String, Object> courseRatingStats(@Argument Long courseId) {
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
    public Rating myRating(@Argument Long courseId) {
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
        String courseId,
        int ratingValue,
        String reviewTitle,
        String reviewContent
    ) {}

    public record UpdateRatingInput(
        Integer ratingValue,
        String reviewTitle,
        String reviewContent
    ) {}
}

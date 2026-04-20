package com.sociallearning.service;

import com.sociallearning.entity.Course;
import com.sociallearning.entity.Rating;
import com.sociallearning.entity.User;
import com.sociallearning.repository.CourseRepository;
import com.sociallearning.repository.EnrollmentRepository;
import com.sociallearning.repository.RatingRepository;
import com.sociallearning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

/**
 * Service for handling course rating and review operations.
 *
 * Provides business logic for:
 * - Adding/updating ratings with validation (1-5 stars)
 * - Managing reviews
 * - Updating denormalized rating counts and averages
 * - Fetching ratings with pagination and filtering
 * - Moderation features (hide, feature reviews)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    private static final String USER_NOT_FOUND_MSG = "User not found with ID: ";
    private static final String COURSE_NOT_FOUND_MSG = "Course not found with ID: ";
    private static final String RATING_NOT_FOUND_MSG = "Rating not found with ID: ";
    private static final int MIN_RATING = 1;
    private static final int MAX_RATING = 5;

    // ============================================
    // Rate Course Methods
    // ============================================

    /**
     * Rate a course (create or update rating).
     * If user has already rated the course, updates the existing rating.
     * Automatically marks as verified purchase if user is enrolled.
     *
     * @param userId User ID
     * @param courseId Course ID
     * @param ratingValue Rating value (1-5)
     * @return Created or updated rating
     */
    @Transactional
    public Rating rateCourse(Long userId, Long courseId, int ratingValue) {
        return rateCourse(userId, courseId, ratingValue, null, null);
    }

    /**
     * Rate a course with optional review.
     * If user has already rated, updates the existing rating.
     *
     * @param userId User ID
     * @param courseId Course ID
     * @param ratingValue Rating value (1-5)
     * @param reviewTitle Optional review title
     * @param reviewContent Optional review content
     * @return Created or updated rating
     */
    @Transactional
    public Rating rateCourse(Long userId, Long courseId, int ratingValue, 
                             String reviewTitle, String reviewContent) {
        log.info("Rating course: userId={}, courseId={}, ratingValue={}", userId, courseId, ratingValue);

        // Validate rating value
        validateRatingValue(ratingValue);

        User user = getUser(userId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));

        // Check if user has already rated this course
        Optional<Rating> existingRating = ratingRepository.findByUserIdAndCourseId(userId, courseId);

        Rating rating;
        boolean isNewRating;

        if (existingRating.isPresent()) {
            // Update existing rating
            rating = existingRating.get();
            rating.setRatingValue(ratingValue);
            
            // Update review if provided
            if (reviewTitle != null || reviewContent != null) {
                rating.setReviewTitle(reviewTitle);
                rating.setReviewContent(reviewContent);
                rating.markAsEdited();
            }
            
            isNewRating = false;
            log.info("Updating existing rating: ratingId={}", rating.getId());
        } else {
            // Create new rating
            boolean isEnrolled = enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
            
            rating = Rating.builder()
                    .user(user)
                    .course(course)
                    .ratingValue(ratingValue)
                    .reviewTitle(reviewTitle)
                    .reviewContent(reviewContent)
                    .isVerifiedPurchase(isEnrolled)
                    .build();
            
            isNewRating = true;
            log.info("Creating new rating for course: courseId={}, verified={}", courseId, isEnrolled);
        }

        rating = ratingRepository.save(rating);

        // Update denormalized counts on course
        updateCourseRatingStats(course, isNewRating);

        log.info("Rating saved: ratingId={}", rating.getId());
        return rating;
    }

    /**
     * Add or update a review for an existing rating.
     *
     * @param userId User ID
     * @param courseId Course ID
     * @param reviewTitle Review title
     * @param reviewContent Review content
     * @return Updated rating
     */
    @Transactional
    public Rating addReview(Long userId, Long courseId, String reviewTitle, String reviewContent) {
        log.info("Adding review: userId={}, courseId={}", userId, courseId);

        Rating rating = ratingRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Must rate the course before adding a review"));

        rating.setReviewTitle(reviewTitle);
        rating.setReviewContent(reviewContent);
        
        if (rating.getId() != null) {
            rating.markAsEdited();
        }

        rating = ratingRepository.save(rating);

        log.info("Review added: ratingId={}", rating.getId());
        return rating;
    }

    // ============================================
    // Update Rating Methods
    // ============================================

    /**
     * Update a rating's value.
     *
     * @param userId User ID (for authorization)
     * @param ratingId Rating ID
     * @param newRatingValue New rating value (1-5)
     * @return Updated rating
     */
    @Transactional
    public Rating updateRating(Long userId, Long ratingId, int newRatingValue) {
        log.info("Updating rating: userId={}, ratingId={}, newValue={}", userId, ratingId, newRatingValue);

        validateRatingValue(newRatingValue);

        Rating rating = getRatingWithAuthorization(ratingId, userId);
        
        rating.setRatingValue(newRatingValue);
        rating.markAsEdited();
        rating = ratingRepository.save(rating);

        // Update course stats
        updateCourseRatingStats(rating.getCourse(), false);

        log.info("Rating updated: ratingId={}", ratingId);
        return rating;
    }

    /**
     * Update a rating's review.
     *
     * @param userId User ID (for authorization)
     * @param ratingId Rating ID
     * @param reviewTitle New review title
     * @param reviewContent New review content
     * @return Updated rating
     */
    @Transactional
    public Rating updateReview(Long userId, Long ratingId, String reviewTitle, String reviewContent) {
        log.info("Updating review: userId={}, ratingId={}", userId, ratingId);

        Rating rating = getRatingWithAuthorization(ratingId, userId);

        rating.setReviewTitle(reviewTitle);
        rating.setReviewContent(reviewContent);
        rating.markAsEdited();

        rating = ratingRepository.save(rating);

        log.info("Review updated: ratingId={}", ratingId);
        return rating;
    }

    // ============================================
    // Delete Rating Methods
    // ============================================

    /**
     * Delete a rating.
     *
     * @param userId User ID (for authorization)
     * @param ratingId Rating ID
     */
    @Transactional
    public void deleteRating(Long userId, Long ratingId) {
        log.info("Deleting rating: userId={}, ratingId={}", userId, ratingId);

        Rating rating = getRatingWithAuthorization(ratingId, userId);
        Course course = rating.getCourse();

        ratingRepository.delete(rating);

        // Update course stats (decrement count)
        updateCourseRatingStatsAfterDelete(course);

        log.info("Rating deleted: ratingId={}", ratingId);
    }

    /**
     * Admin delete rating (bypasses authorization).
     *
     * @param ratingId Rating ID
     */
    @Transactional
    public void adminDeleteRating(Long ratingId) {
        log.info("Admin deleting rating: ratingId={}", ratingId);

        Rating rating = ratingRepository.findByIdWithDetails(ratingId)
                .orElseThrow(() -> new IllegalArgumentException(RATING_NOT_FOUND_MSG + ratingId));
        
        Course course = rating.getCourse();

        ratingRepository.delete(rating);
        updateCourseRatingStatsAfterDelete(course);

        log.info("Rating deleted by admin: ratingId={}", ratingId);
    }

    // ============================================
    // Fetch Rating Methods
    // ============================================

    /**
     * Get a user's rating for a course.
     *
     * @param userId User ID
     * @param courseId Course ID
     * @return Optional rating
     */
    @Transactional(readOnly = true)
    public Optional<Rating> getUserCourseRating(Long userId, Long courseId) {
        return ratingRepository.findByUserIdAndCourseId(userId, courseId);
    }

    /**
     * Check if user has rated a course.
     *
     * @param userId User ID
     * @param courseId Course ID
     * @return true if rated
     */
    @Transactional(readOnly = true)
    public boolean hasUserRatedCourse(Long userId, Long courseId) {
        return ratingRepository.existsByUserIdAndCourseId(userId, courseId);
    }

    /**
     * Get ratings for a course with pagination.
     *
     * @param courseId Course ID
     * @param pageable Pagination parameters
     * @return Page of ratings
     */
    @Transactional(readOnly = true)
    public Page<Rating> getCourseRatings(Long courseId, Pageable pageable) {
        return ratingRepository.findByCourseIdAndIsHiddenFalse(courseId, pageable);
    }

    /**
     * Get reviews (ratings with content) for a course.
     *
     * @param courseId Course ID
     * @param pageable Pagination parameters
     * @return Page of reviews
     */
    @Transactional(readOnly = true)
    public Page<Rating> getCourseReviews(Long courseId, Pageable pageable) {
        return ratingRepository.findReviewsByCourseId(courseId, pageable);
    }

    /**
     * Get featured reviews for a course.
     *
     * @param courseId Course ID
     * @return List of featured reviews
     */
    @Transactional(readOnly = true)
    public List<Rating> getFeaturedReviews(Long courseId) {
        return ratingRepository.findFeaturedReviewsByCourseId(courseId);
    }

    /**
     * Get verified purchase reviews for a course.
     *
     * @param courseId Course ID
     * @param pageable Pagination parameters
     * @return Page of verified reviews
     */
    @Transactional(readOnly = true)
    public Page<Rating> getVerifiedReviews(Long courseId, Pageable pageable) {
        return ratingRepository.findVerifiedReviewsByCourseId(courseId, pageable);
    }

    /**
     * Get ratings by rating value for a course.
     *
     * @param courseId Course ID
     * @param ratingValue Rating value (1-5)
     * @param pageable Pagination parameters
     * @return Page of ratings
     */
    @Transactional(readOnly = true)
    public Page<Rating> getCourseRatingsByValue(Long courseId, int ratingValue, Pageable pageable) {
        validateRatingValue(ratingValue);
        return ratingRepository.findByCourseIdAndRatingValue(courseId, ratingValue, pageable);
    }

    /**
     * Get positive reviews (4-5 stars) for a course.
     *
     * @param courseId Course ID
     * @param pageable Pagination parameters
     * @return Page of positive reviews
     */
    @Transactional(readOnly = true)
    public Page<Rating> getPositiveReviews(Long courseId, Pageable pageable) {
        return ratingRepository.findPositiveReviews(courseId, pageable);
    }

    /**
     * Get critical reviews (1-2 stars) for a course.
     *
     * @param courseId Course ID
     * @param pageable Pagination parameters
     * @return Page of critical reviews
     */
    @Transactional(readOnly = true)
    public Page<Rating> getCriticalReviews(Long courseId, Pageable pageable) {
        return ratingRepository.findCriticalReviews(courseId, pageable);
    }

    /**
     * Get all ratings by a user.
     *
     * @param userId User ID
     * @param pageable Pagination parameters
     * @return Page of ratings
     */
    @Transactional(readOnly = true)
    public Page<Rating> getUserRatings(Long userId, Pageable pageable) {
        return ratingRepository.findByUserId(userId, pageable);
    }

    // ============================================
    // Statistics Methods
    // ============================================

    /**
     * Get average rating for a course.
     *
     * @param courseId Course ID
     * @return Average rating or null if no ratings
     */
    @Transactional(readOnly = true)
    public Double getAverageRating(Long courseId) {
        return ratingRepository.calculateAverageRating(courseId);
    }

    /**
     * Get rating count for a course.
     *
     * @param courseId Course ID
     * @return Rating count
     */
    @Transactional(readOnly = true)
    public long getRatingCount(Long courseId) {
        return ratingRepository.countByCourseIdAndIsHiddenFalse(courseId);
    }

    /**
     * Get rating distribution for a course.
     *
     * @param courseId Course ID
     * @return List of [ratingValue, count] arrays
     */
    @Transactional(readOnly = true)
    public List<Object[]> getRatingDistribution(Long courseId) {
        return ratingRepository.getRatingDistribution(courseId);
    }

    /**
     * Get comprehensive rating statistics for a course.
     * Returns: [average, total, count5star, count4star, count3star, count2star, count1star]
     *
     * @param courseId Course ID
     * @return Statistics array
     */
    @Transactional(readOnly = true)
    public RatingStats getRatingStats(Long courseId) {
        Object[] stats = ratingRepository.getRatingStats(courseId);
        
        if (stats == null || stats[0] == null) {
            return new RatingStats(0.0, 0L, 0L, 0L, 0L, 0L, 0L);
        }

        return new RatingStats(
            ((Number) stats[0]).doubleValue(),  // average
            ((Number) stats[1]).longValue(),    // total
            stats[2] != null ? ((Number) stats[2]).longValue() : 0L,  // 5 stars
            stats[3] != null ? ((Number) stats[3]).longValue() : 0L,  // 4 stars
            stats[4] != null ? ((Number) stats[4]).longValue() : 0L,  // 3 stars
            stats[5] != null ? ((Number) stats[5]).longValue() : 0L,  // 2 stars
            stats[6] != null ? ((Number) stats[6]).longValue() : 0L   // 1 star
        );
    }

    /**
     * Rating statistics record.
     */
    public record RatingStats(
        Double average,
        Long totalCount,
        Long fiveStarCount,
        Long fourStarCount,
        Long threeStarCount,
        Long twoStarCount,
        Long oneStarCount
    ) {}

    // ============================================
    // Helpful Vote Methods
    // ============================================

    /**
     * Mark a review as helpful.
     * In a full implementation, this would track which users found it helpful.
     *
     * @param ratingId Rating ID
     */
    @Transactional
    public void markReviewHelpful(Long ratingId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new IllegalArgumentException(RATING_NOT_FOUND_MSG + ratingId));
        
        rating.incrementHelpfulCount();
        ratingRepository.save(rating);

        log.debug("Review marked helpful: ratingId={}, helpfulCount={}", 
                ratingId, rating.getHelpfulCount());
    }

    /**
     * Remove helpful mark from a review.
     *
     * @param ratingId Rating ID
     */
    @Transactional
    public void unmarkReviewHelpful(Long ratingId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new IllegalArgumentException(RATING_NOT_FOUND_MSG + ratingId));
        
        rating.decrementHelpfulCount();
        ratingRepository.save(rating);

        log.debug("Review helpful unmarked: ratingId={}, helpfulCount={}", 
                ratingId, rating.getHelpfulCount());
    }

    // ============================================
    // Moderation Methods
    // ============================================

    /**
     * Hide a review (soft moderation).
     *
     * @param ratingId Rating ID
     */
    @Transactional
    public void hideReview(Long ratingId) {
        log.info("Hiding review: ratingId={}", ratingId);
        
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new IllegalArgumentException(RATING_NOT_FOUND_MSG + ratingId));

        rating.setIsHidden(true);
        ratingRepository.save(rating);

        // Update course stats
        updateCourseRatingStats(rating.getCourse(), false);

        log.info("Review hidden: ratingId={}", ratingId);
    }

    /**
     * Unhide a review.
     *
     * @param ratingId Rating ID
     */
    @Transactional
    public void unhideReview(Long ratingId) {
        log.info("Unhiding review: ratingId={}", ratingId);
        
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new IllegalArgumentException(RATING_NOT_FOUND_MSG + ratingId));

        rating.setIsHidden(false);
        ratingRepository.save(rating);

        // Update course stats
        updateCourseRatingStats(rating.getCourse(), false);

        log.info("Review unhidden: ratingId={}", ratingId);
    }

    /**
     * Feature a review (show prominently).
     *
     * @param ratingId Rating ID
     * @param featured Whether to feature
     */
    @Transactional
    public void setReviewFeatured(Long ratingId, boolean featured) {
        log.info("Setting review featured status: ratingId={}, featured={}", ratingId, featured);
        
        ratingRepository.setFeatured(ratingId, featured);
    }

    /**
     * Add admin response to a review.
     *
     * @param ratingId Rating ID
     * @param response Admin response text
     */
    @Transactional
    public void addAdminResponse(Long ratingId, String response) {
        log.info("Adding admin response: ratingId={}", ratingId);
        
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new IllegalArgumentException(RATING_NOT_FOUND_MSG + ratingId));

        rating.addAdminResponse(response);
        ratingRepository.save(rating);

        log.info("Admin response added: ratingId={}", ratingId);
    }

    /**
     * Get reviews that need admin response (low ratings without response).
     *
     * @return List of ratings needing response
     */
    @Transactional(readOnly = true)
    public List<Rating> getReviewsNeedingResponse() {
        return ratingRepository.findRatingsNeedingResponse();
    }

    // ============================================
    // Denormalized Stats Update Methods
    // ============================================

    /**
     * Update the denormalized rating statistics on a course.
     *
     * @param course Course entity
     * @param isNewRating Whether this is a new rating (increments count)
     */
    private void updateCourseRatingStats(Course course, boolean isNewRating) {
        // Recalculate average and count from database
        Double averageRating = ratingRepository.calculateAverageRating(course.getId());
        long ratingCount = ratingRepository.countByCourseIdAndIsHiddenFalse(course.getId());

        // Update course entity
        if (averageRating != null) {
            course.setAverageRating(BigDecimal.valueOf(averageRating)
                    .setScale(2, RoundingMode.HALF_UP));
        } else {
            course.setAverageRating(BigDecimal.ZERO);
        }
        course.setRatingCount((int) ratingCount);

        courseRepository.save(course);

        log.debug("Course rating stats updated: courseId={}, avg={}, count={}", 
                course.getId(), averageRating, ratingCount);
    }

    /**
     * Update course stats after a rating is deleted.
     *
     * @param course Course entity
     */
    private void updateCourseRatingStatsAfterDelete(Course course) {
        updateCourseRatingStats(course, false);
    }

    /**
     * Recalculate and update rating stats for a course.
     * Use for data consistency checks or repairs.
     *
     * @param courseId Course ID
     */
    @Transactional
    public void recalculateCourseRatingStats(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));

        updateCourseRatingStats(course, false);

        log.info("Course rating stats recalculated: courseId={}", courseId);
    }

    // ============================================
    // Batch Methods
    // ============================================

    /**
     * Get course IDs that a user has rated.
     *
     * @param userId User ID
     * @return List of rated course IDs
     */
    @Transactional(readOnly = true)
    public List<Long> getRatedCourseIdsByUser(Long userId) {
        return ratingRepository.findRatedCourseIdsByUserId(userId);
    }

    /**
     * Check which courses from a list the user has rated.
     *
     * @param userId User ID
     * @param courseIds Course IDs to check
     * @return List of rated course IDs
     */
    @Transactional(readOnly = true)
    public List<Long> getRatedCourseIds(Long userId, List<Long> courseIds) {
        if (courseIds == null || courseIds.isEmpty()) {
            return List.of();
        }
        return ratingRepository.findRatedCourseIds(userId, courseIds);
    }

    // ============================================
    // Helper Methods
    // ============================================

    private void validateRatingValue(int ratingValue) {
        if (ratingValue < MIN_RATING || ratingValue > MAX_RATING) {
            throw new IllegalArgumentException(
                    String.format("Rating must be between %d and %d", MIN_RATING, MAX_RATING));
        }
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND_MSG + userId));
    }

    private Rating getRatingWithAuthorization(Long ratingId, Long userId) {
        Rating rating = ratingRepository.findByIdWithDetails(ratingId)
                .orElseThrow(() -> new IllegalArgumentException(RATING_NOT_FOUND_MSG + ratingId));

        if (!rating.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to modify this rating");
        }

        if (rating.getIsHidden()) {
            throw new IllegalArgumentException("Cannot modify a hidden rating");
        }

        return rating;
    }
}

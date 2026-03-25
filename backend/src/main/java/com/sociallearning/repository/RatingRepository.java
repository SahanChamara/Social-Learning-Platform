package com.sociallearning.repository;

import com.sociallearning.entity.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Rating entity
 * Provides data access methods for course ratings and reviews
 */
@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    // ============================================
    // Basic Queries
    // ============================================

    /**
     * Find rating by user and course
     */
    Optional<Rating> findByUserIdAndCourseId(Long userId, Long courseId);

    /**
     * Check if user has rated a course
     */
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    /**
     * Find rating by ID with user and course eagerly loaded
     */
    @Query("SELECT r FROM Rating r LEFT JOIN FETCH r.user LEFT JOIN FETCH r.course WHERE r.id = :id")
    Optional<Rating> findByIdWithDetails(@Param("id") Long id);

    // ============================================
    // Course Queries
    // ============================================

    /**
     * Find all ratings for a course
     */
    List<Rating> findByCourseIdAndIsHiddenFalse(Long courseId);

    /**
     * Find all ratings for a course with pagination
     */
    Page<Rating> findByCourseIdAndIsHiddenFalse(Long courseId, Pageable pageable);

    /**
     * Find all ratings for a course ordered by most recent
     */
    @Query("SELECT r FROM Rating r WHERE r.course.id = :courseId AND r.isHidden = false " +
           "ORDER BY r.createdAt DESC")
    Page<Rating> findByCourseIdOrderByRecent(@Param("courseId") Long courseId, Pageable pageable);

    /**
     * Find all ratings for a course ordered by most helpful
     */
    @Query("SELECT r FROM Rating r WHERE r.course.id = :courseId AND r.isHidden = false " +
           "ORDER BY r.helpfulCount DESC, r.createdAt DESC")
    Page<Rating> findByCourseIdOrderByHelpful(@Param("courseId") Long courseId, Pageable pageable);

    /**
     * Find ratings with reviews for a course
     */
    @Query("SELECT r FROM Rating r WHERE r.course.id = :courseId AND r.isHidden = false " +
           "AND r.reviewContent IS NOT NULL AND r.reviewContent != '' ORDER BY r.createdAt DESC")
    Page<Rating> findReviewsByCourseId(@Param("courseId") Long courseId, Pageable pageable);

    /**
     * Find featured reviews for a course
     */
    @Query("SELECT r FROM Rating r WHERE r.course.id = :courseId AND r.isFeatured = true " +
           "AND r.isHidden = false ORDER BY r.createdAt DESC")
    List<Rating> findFeaturedReviewsByCourseId(@Param("courseId") Long courseId);

    /**
     * Find verified purchase reviews for a course
     */
    @Query("SELECT r FROM Rating r WHERE r.course.id = :courseId AND r.isVerifiedPurchase = true " +
           "AND r.isHidden = false ORDER BY r.createdAt DESC")
    Page<Rating> findVerifiedReviewsByCourseId(@Param("courseId") Long courseId, Pageable pageable);

    // ============================================
    // Rating Statistics
    // ============================================

    /**
     * Calculate average rating for a course
     */
    @Query("SELECT AVG(r.ratingValue) FROM Rating r WHERE r.course.id = :courseId AND r.isHidden = false")
    Double calculateAverageRating(@Param("courseId") Long courseId);

    /**
     * Count ratings for a course
     */
    long countByCourseIdAndIsHiddenFalse(Long courseId);

    /**
     * Count ratings by value for a course (for distribution)
     */
    @Query("SELECT r.ratingValue, COUNT(r) FROM Rating r WHERE r.course.id = :courseId " +
           "AND r.isHidden = false GROUP BY r.ratingValue ORDER BY r.ratingValue DESC")
    List<Object[]> getRatingDistribution(@Param("courseId") Long courseId);

    /**
     * Get rating statistics for a course
     */
    @Query("SELECT AVG(r.ratingValue), COUNT(r), " +
           "SUM(CASE WHEN r.ratingValue = 5 THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN r.ratingValue = 4 THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN r.ratingValue = 3 THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN r.ratingValue = 2 THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN r.ratingValue = 1 THEN 1 ELSE 0 END) " +
           "FROM Rating r WHERE r.course.id = :courseId AND r.isHidden = false")
    Object[] getRatingStats(@Param("courseId") Long courseId);

    // ============================================
    // User Queries
    // ============================================

    /**
     * Find all ratings by a user
     */
    List<Rating> findByUserId(Long userId);

    /**
     * Find all ratings by a user with pagination
     */
    Page<Rating> findByUserId(Long userId, Pageable pageable);

    /**
     * Count ratings by a user
     */
    long countByUserId(Long userId);

    // ============================================
    // Filter Queries
    // ============================================

    /**
     * Find ratings by rating value for a course
     */
    @Query("SELECT r FROM Rating r WHERE r.course.id = :courseId AND r.ratingValue = :ratingValue " +
           "AND r.isHidden = false ORDER BY r.createdAt DESC")
    Page<Rating> findByCourseIdAndRatingValue(
        @Param("courseId") Long courseId,
        @Param("ratingValue") Integer ratingValue,
        Pageable pageable
    );

    /**
     * Find positive reviews (4-5 stars) for a course
     */
    @Query("SELECT r FROM Rating r WHERE r.course.id = :courseId AND r.ratingValue >= 4 " +
           "AND r.isHidden = false ORDER BY r.helpfulCount DESC")
    Page<Rating> findPositiveReviews(@Param("courseId") Long courseId, Pageable pageable);

    /**
     * Find critical reviews (1-2 stars) for a course
     */
    @Query("SELECT r FROM Rating r WHERE r.course.id = :courseId AND r.ratingValue <= 2 " +
           "AND r.isHidden = false ORDER BY r.createdAt DESC")
    Page<Rating> findCriticalReviews(@Param("courseId") Long courseId, Pageable pageable);

    // ============================================
    // Moderation Queries
    // ============================================

    /**
     * Find hidden ratings (for moderation)
     */
    Page<Rating> findByIsHiddenTrue(Pageable pageable);

    /**
     * Find ratings without admin response
     */
    @Query("SELECT r FROM Rating r WHERE r.adminResponse IS NULL AND r.ratingValue <= 2 " +
           "AND r.isHidden = false ORDER BY r.createdAt ASC")
    List<Rating> findRatingsNeedingResponse();

    // ============================================
    // Update Queries
    // ============================================

    /**
     * Update helpful count for a rating
     */
    @Modifying
    @Query("UPDATE Rating r SET r.helpfulCount = :count WHERE r.id = :id")
    void updateHelpfulCount(@Param("id") Long id, @Param("count") Integer count);

    /**
     * Toggle featured status
     */
    @Modifying
    @Query("UPDATE Rating r SET r.isFeatured = :featured WHERE r.id = :id")
    void setFeatured(@Param("id") Long id, @Param("featured") Boolean featured);

    /**
     * Hide a rating
     */
    @Modifying
    @Query("UPDATE Rating r SET r.isHidden = true WHERE r.id = :id")
    void hide(@Param("id") Long id);

    /**
     * Unhide a rating
     */
    @Modifying
    @Query("UPDATE Rating r SET r.isHidden = false WHERE r.id = :id")
    void unhide(@Param("id") Long id);

    // ============================================
    // Batch Queries
    // ============================================

    /**
     * Find courses that a user has rated
     */
    @Query("SELECT r.course.id FROM Rating r WHERE r.user.id = :userId")
    List<Long> findRatedCourseIdsByUserId(@Param("userId") Long userId);

    /**
     * Check which courses from a list the user has rated
     */
    @Query("SELECT r.course.id FROM Rating r WHERE r.user.id = :userId AND r.course.id IN :courseIds")
    List<Long> findRatedCourseIds(@Param("userId") Long userId, @Param("courseIds") List<Long> courseIds);
}

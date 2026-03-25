package com.sociallearning.repository;

import com.sociallearning.entity.Like;
import com.sociallearning.enums.LikeableType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Like entity
 * Provides data access methods for likes with polymorphic support
 */
@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    // ============================================
    // Basic Queries
    // ============================================

    /**
     * Find a like by user, type, and target ID
     */
    Optional<Like> findByUserIdAndLikeableTypeAndLikeableId(
        Long userId,
        LikeableType likeableType,
        Long likeableId
    );

    /**
     * Check if a user has liked a specific target
     */
    boolean existsByUserIdAndLikeableTypeAndLikeableId(
        Long userId,
        LikeableType likeableType,
        Long likeableId
    );

    /**
     * Delete a like by user, type, and target ID
     */
    void deleteByUserIdAndLikeableTypeAndLikeableId(
        Long userId,
        LikeableType likeableType,
        Long likeableId
    );

    // ============================================
    // Polymorphic Queries (by target type and ID)
    // ============================================

    /**
     * Find all likes for a specific target
     */
    List<Like> findByLikeableTypeAndLikeableId(LikeableType likeableType, Long likeableId);

    /**
     * Find all likes for a target with pagination
     */
    Page<Like> findByLikeableTypeAndLikeableId(
        LikeableType likeableType,
        Long likeableId,
        Pageable pageable
    );

    /**
     * Count likes for a specific target
     */
    long countByLikeableTypeAndLikeableId(LikeableType likeableType, Long likeableId);

    // ============================================
    // User Queries
    // ============================================

    /**
     * Find all likes by a user
     */
    List<Like> findByUserId(Long userId);

    /**
     * Find all likes by a user for a specific type
     */
    List<Like> findByUserIdAndLikeableType(Long userId, LikeableType likeableType);

    /**
     * Find all likes by a user with pagination
     */
    Page<Like> findByUserId(Long userId, Pageable pageable);

    /**
     * Count likes by a user
     */
    long countByUserId(Long userId);

    /**
     * Count likes by a user for a specific type
     */
    long countByUserIdAndLikeableType(Long userId, LikeableType likeableType);

    // ============================================
    // Course-specific Queries
    // ============================================

    /**
     * Check if user has liked a course
     */
    default boolean hasUserLikedCourse(Long userId, Long courseId) {
        return existsByUserIdAndLikeableTypeAndLikeableId(userId, LikeableType.COURSE, courseId);
    }

    /**
     * Find user's like for a course
     */
    default Optional<Like> findUserCourseLike(Long userId, Long courseId) {
        return findByUserIdAndLikeableTypeAndLikeableId(userId, LikeableType.COURSE, courseId);
    }

    /**
     * Count likes for a course
     */
    default long countCourseLikes(Long courseId) {
        return countByLikeableTypeAndLikeableId(LikeableType.COURSE, courseId);
    }

    /**
     * Find courses liked by a user
     */
    default List<Like> findUserLikedCourses(Long userId) {
        return findByUserIdAndLikeableType(userId, LikeableType.COURSE);
    }

    // ============================================
    // Lesson-specific Queries
    // ============================================

    /**
     * Check if user has liked a lesson
     */
    default boolean hasUserLikedLesson(Long userId, Long lessonId) {
        return existsByUserIdAndLikeableTypeAndLikeableId(userId, LikeableType.LESSON, lessonId);
    }

    /**
     * Find user's like for a lesson
     */
    default Optional<Like> findUserLessonLike(Long userId, Long lessonId) {
        return findByUserIdAndLikeableTypeAndLikeableId(userId, LikeableType.LESSON, lessonId);
    }

    /**
     * Count likes for a lesson
     */
    default long countLessonLikes(Long lessonId) {
        return countByLikeableTypeAndLikeableId(LikeableType.LESSON, lessonId);
    }

    /**
     * Find lessons liked by a user
     */
    default List<Like> findUserLikedLessons(Long userId) {
        return findByUserIdAndLikeableType(userId, LikeableType.LESSON);
    }

    // ============================================
    // Comment-specific Queries
    // ============================================

    /**
     * Check if user has liked a comment
     */
    default boolean hasUserLikedComment(Long userId, Long commentId) {
        return existsByUserIdAndLikeableTypeAndLikeableId(userId, LikeableType.COMMENT, commentId);
    }

    /**
     * Find user's like for a comment
     */
    default Optional<Like> findUserCommentLike(Long userId, Long commentId) {
        return findByUserIdAndLikeableTypeAndLikeableId(userId, LikeableType.COMMENT, commentId);
    }

    /**
     * Count likes for a comment
     */
    default long countCommentLikes(Long commentId) {
        return countByLikeableTypeAndLikeableId(LikeableType.COMMENT, commentId);
    }

    /**
     * Delete like for a comment
     */
    default void deleteCommentLike(Long userId, Long commentId) {
        deleteByUserIdAndLikeableTypeAndLikeableId(userId, LikeableType.COMMENT, commentId);
    }

    // ============================================
    // Batch Queries
    // ============================================

    /**
     * Find which targets from a list the user has liked
     */
    @Query("SELECT l.likeableId FROM Like l WHERE l.user.id = :userId AND l.likeableType = :type " +
           "AND l.likeableId IN :targetIds")
    List<Long> findLikedTargetIds(
        @Param("userId") Long userId,
        @Param("type") LikeableType type,
        @Param("targetIds") List<Long> targetIds
    );

    /**
     * Count likes for multiple targets
     */
    @Query("SELECT l.likeableId, COUNT(l) FROM Like l WHERE l.likeableType = :type " +
           "AND l.likeableId IN :targetIds GROUP BY l.likeableId")
    List<Object[]> countLikesForTargets(
        @Param("type") LikeableType type,
        @Param("targetIds") List<Long> targetIds
    );

    // ============================================
    // Statistics Queries
    // ============================================

    /**
     * Get like statistics by type for a user
     */
    @Query("SELECT l.likeableType, COUNT(l) FROM Like l WHERE l.user.id = :userId GROUP BY l.likeableType")
    List<Object[]> getLikeStatsByUser(@Param("userId") Long userId);

    /**
     * Find most liked courses
     */
    @Query("SELECT l.likeableId, COUNT(l) as likeCount FROM Like l WHERE l.likeableType = 'COURSE' " +
           "GROUP BY l.likeableId ORDER BY likeCount DESC")
    Page<Object[]> findMostLikedCourses(Pageable pageable);
}

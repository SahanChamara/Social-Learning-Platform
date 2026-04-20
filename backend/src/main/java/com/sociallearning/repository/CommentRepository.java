package com.sociallearning.repository;

import com.sociallearning.entity.Comment;
import com.sociallearning.entity.User;
import com.sociallearning.enums.CommentableType;
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
 * Repository for Comment entity
 * Provides data access methods for comments with threading support
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // ============================================
    // Basic Queries
    // ============================================

    /**
     * Find a comment by ID with user eagerly loaded
     */
    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.user WHERE c.id = :id")
    Optional<Comment> findByIdWithUser(@Param("id") Long id);

    /**
     * Find a comment by ID with user and parent eagerly loaded
     */
    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.user LEFT JOIN FETCH c.parent WHERE c.id = :id")
    Optional<Comment> findByIdWithUserAndParent(@Param("id") Long id);

    // ============================================
    // Polymorphic Queries (by target type and ID)
    // ============================================

    /**
     * Find all root comments for a specific target (course, lesson, etc.)
     */
    @Query("SELECT c FROM Comment c WHERE c.commentableType = :type AND c.commentableId = :targetId " +
           "AND c.parent IS NULL AND c.isDeleted = false ORDER BY c.isPinned DESC, c.createdAt DESC")
    Page<Comment> findRootCommentsByTarget(
        @Param("type") CommentableType type,
        @Param("targetId") Long targetId,
        Pageable pageable
    );

    /**
     * Find all root comments for a target with user eagerly loaded
     */
    @Query("SELECT DISTINCT c FROM Comment c LEFT JOIN FETCH c.user " +
           "WHERE c.commentableType = :type AND c.commentableId = :targetId " +
           "AND c.parent IS NULL AND c.isDeleted = false ORDER BY c.isPinned DESC, c.createdAt DESC")
    List<Comment> findRootCommentsByTargetWithUser(
        @Param("type") CommentableType type,
        @Param("targetId") Long targetId
    );

    /**
     * Find all comments (including deleted) for a target
     */
    @Query("SELECT c FROM Comment c WHERE c.commentableType = :type AND c.commentableId = :targetId " +
           "AND c.parent IS NULL ORDER BY c.isPinned DESC, c.createdAt DESC")
    List<Comment> findAllRootCommentsByTarget(
        @Param("type") CommentableType type,
        @Param("targetId") Long targetId
    );

    /**
     * Count comments for a target (excluding deleted)
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.commentableType = :type AND c.commentableId = :targetId " +
           "AND c.isDeleted = false")
    long countByTarget(@Param("type") CommentableType type, @Param("targetId") Long targetId);

    /**
     * Count root comments for a target
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.commentableType = :type AND c.commentableId = :targetId " +
           "AND c.parent IS NULL AND c.isDeleted = false")
    long countRootCommentsByTarget(@Param("type") CommentableType type, @Param("targetId") Long targetId);

    // ============================================
    // Threading Queries
    // ============================================

    /**
     * Find replies to a comment
     */
    @Query("SELECT c FROM Comment c WHERE c.parent.id = :parentId AND c.isDeleted = false ORDER BY c.createdAt ASC")
    List<Comment> findRepliesByParentId(@Param("parentId") Long parentId);

    /**
     * Find replies to a comment with user eagerly loaded
     */
    @Query("SELECT DISTINCT c FROM Comment c LEFT JOIN FETCH c.user " +
           "WHERE c.parent.id = :parentId AND c.isDeleted = false ORDER BY c.createdAt ASC")
    List<Comment> findRepliesByParentIdWithUser(@Param("parentId") Long parentId);

    /**
     * Find all comments in a thread (by root comment)
     */
    @Query("SELECT c FROM Comment c WHERE c.rootComment.id = :rootId AND c.isDeleted = false ORDER BY c.createdAt ASC")
    List<Comment> findCommentsByRootId(@Param("rootId") Long rootId);

    /**
     * Count replies to a comment
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.parent.id = :parentId AND c.isDeleted = false")
    long countRepliesByParentId(@Param("parentId") Long parentId);

    /**
     * Count all comments in a thread
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.rootComment.id = :rootId AND c.isDeleted = false")
    long countCommentsInThread(@Param("rootId") Long rootId);

    // ============================================
    // User Queries
    // ============================================

    /**
     * Find comments by user
     */
    @Query("SELECT c FROM Comment c WHERE c.user.id = :userId AND c.isDeleted = false ORDER BY c.createdAt DESC")
    Page<Comment> findByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Find comments by user for a specific target type
     */
    @Query("SELECT c FROM Comment c WHERE c.user.id = :userId AND c.commentableType = :type " +
           "AND c.isDeleted = false ORDER BY c.createdAt DESC")
    List<Comment> findByUserIdAndType(@Param("userId") Long userId, @Param("type") CommentableType type);

    /**
     * Count comments by user
     */
    long countByUserIdAndIsDeletedFalse(Long userId);

    // ============================================
    // Course-specific Queries
    // ============================================

    /**
     * Find root comments for a course
     */
    default Page<Comment> findCourseComments(Long courseId, Pageable pageable) {
        return findRootCommentsByTarget(CommentableType.COURSE, courseId, pageable);
    }

    /**
     * Count comments for a course
     */
    default long countCourseComments(Long courseId) {
        return countByTarget(CommentableType.COURSE, courseId);
    }

    // ============================================
    // Lesson-specific Queries
    // ============================================

    /**
     * Find root comments for a lesson
     */
    default Page<Comment> findLessonComments(Long lessonId, Pageable pageable) {
        return findRootCommentsByTarget(CommentableType.LESSON, lessonId, pageable);
    }

    /**
     * Count comments for a lesson
     */
    default long countLessonComments(Long lessonId) {
        return countByTarget(CommentableType.LESSON, lessonId);
    }

    // ============================================
    // Moderation Queries
    // ============================================

    /**
     * Find pinned comments for a target
     */
    @Query("SELECT c FROM Comment c WHERE c.commentableType = :type AND c.commentableId = :targetId " +
           "AND c.isPinned = true AND c.isDeleted = false ORDER BY c.createdAt DESC")
    List<Comment> findPinnedComments(
        @Param("type") CommentableType type,
        @Param("targetId") Long targetId
    );

    /**
     * Find recent comments (for moderation)
     */
    @Query("SELECT c FROM Comment c WHERE c.isDeleted = false ORDER BY c.createdAt DESC")
    Page<Comment> findRecentComments(Pageable pageable);

    // ============================================
    // Update Queries
    // ============================================

    /**
     * Update reply count for a comment
     */
    @Modifying
    @Query("UPDATE Comment c SET c.replyCount = :count WHERE c.id = :id")
    void updateReplyCount(@Param("id") Long id, @Param("count") Integer count);

    /**
     * Update like count for a comment
     */
    @Modifying
    @Query("UPDATE Comment c SET c.likeCount = :count WHERE c.id = :id")
    void updateLikeCount(@Param("id") Long id, @Param("count") Integer count);

    /**
     * Soft delete a comment
     */
    @Modifying
    @Query("UPDATE Comment c SET c.isDeleted = true, c.content = '[deleted]' WHERE c.id = :id")
    void softDelete(@Param("id") Long id);

    /**
     * Pin/unpin a comment
     */
    @Modifying
    @Query("UPDATE Comment c SET c.isPinned = :pinned WHERE c.id = :id")
    void setPinned(@Param("id") Long id, @Param("pinned") Boolean pinned);
}

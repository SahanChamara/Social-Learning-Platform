package com.sociallearning.service;

import com.sociallearning.entity.Comment;
import com.sociallearning.entity.Course;
import com.sociallearning.entity.Lesson;
import com.sociallearning.entity.User;
import com.sociallearning.enums.CommentableType;
import com.sociallearning.repository.CommentRepository;
import com.sociallearning.repository.CourseRepository;
import com.sociallearning.repository.LessonRepository;
import com.sociallearning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for handling comment operations.
 *
 * Provides business logic for:
 * - Adding comments with threading support
 * - Deleting comments with authorization
 * - Updating comments
 * - Fetching comments with pagination
 * - Managing reply counts
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    private static final String COMMENT_NOT_FOUND_MSG = "Comment not found with ID: ";
    private static final String USER_NOT_FOUND_MSG = "User not found with ID: ";
    private static final int MAX_THREAD_DEPTH = 5; // Maximum nesting level for replies

    // ============================================
    // Add Comment Methods
    // ============================================

    /**
     * Add a comment to a course.
     *
     * @param userId User ID
     * @param courseId Course ID
     * @param content Comment content
     * @return Created comment
     */
    @Transactional
    public Comment addCourseComment(Long userId, Long courseId, String content) {
        log.info("Adding course comment: userId={}, courseId={}", userId, courseId);

        User user = getUser(userId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with ID: " + courseId));

        Comment comment = Comment.builder()
                .user(user)
                .commentableType(CommentableType.COURSE)
                .commentableId(courseId)
                .content(content)
                .depthLevel(0)
                .build();

        // Root comments reference themselves
        comment = commentRepository.save(comment);
        comment.setRootComment(comment);
        comment = commentRepository.save(comment);

        log.info("Course comment created with ID: {}", comment.getId());
        return comment;
    }

    /**
     * Add a comment to a lesson.
     *
     * @param userId User ID
     * @param lessonId Lesson ID
     * @param content Comment content
     * @return Created comment
     */
    @Transactional
    public Comment addLessonComment(Long userId, Long lessonId, String content) {
        log.info("Adding lesson comment: userId={}, lessonId={}", userId, lessonId);

        User user = getUser(userId);
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found with ID: " + lessonId));

        Comment comment = Comment.builder()
                .user(user)
                .commentableType(CommentableType.LESSON)
                .commentableId(lessonId)
                .content(content)
                .depthLevel(0)
                .build();

        // Root comments reference themselves
        comment = commentRepository.save(comment);
        comment.setRootComment(comment);
        comment = commentRepository.save(comment);

        log.info("Lesson comment created with ID: {}", comment.getId());
        return comment;
    }

    /**
     * Add a reply to an existing comment.
     *
     * Threading logic:
     * - Sets parent to the comment being replied to
     * - Sets rootComment to the top-level comment in the thread
     * - Calculates depthLevel based on parent
     * - Updates reply count on parent
     *
     * @param userId User ID
     * @param parentCommentId Parent comment ID
     * @param content Reply content
     * @return Created reply
     */
    @Transactional
    public Comment addReply(Long userId, Long parentCommentId, String content) {
        log.info("Adding reply: userId={}, parentCommentId={}", userId, parentCommentId);

        User user = getUser(userId);
        Comment parent = commentRepository.findByIdWithUser(parentCommentId)
                .orElseThrow(() -> new IllegalArgumentException(COMMENT_NOT_FOUND_MSG + parentCommentId));

        if (parent.getIsDeleted()) {
            throw new IllegalArgumentException("Cannot reply to a deleted comment");
        }

        // Calculate depth level
        int newDepth = parent.getDepthLevel() + 1;
        if (newDepth > MAX_THREAD_DEPTH) {
            // If max depth reached, reply to the parent's parent instead (flatten)
            // Or we can throw an exception - here we flatten
            log.warn("Max thread depth reached, flattening reply");
            newDepth = MAX_THREAD_DEPTH;
        }

        // Determine root comment
        Comment rootComment = parent.isRootComment() ? parent : parent.getRootComment();

        Comment reply = Comment.builder()
                .user(user)
                .commentableType(parent.getCommentableType())
                .commentableId(parent.getCommentableId())
                .content(content)
                .parent(parent)
                .rootComment(rootComment)
                .depthLevel(newDepth)
                .build();

        reply = commentRepository.save(reply);

        // Update parent's reply count
        parent.incrementReplyCount();
        commentRepository.save(parent);

        log.info("Reply created with ID: {} (depth: {})", reply.getId(), newDepth);
        return reply;
    }

    /**
     * Generic method to add a comment to any target.
     *
     * @param userId User ID
     * @param targetType Commentable type
     * @param targetId Target entity ID
     * @param content Comment content
     * @param parentCommentId Optional parent comment ID for replies
     * @return Created comment
     */
    @Transactional
    public Comment addComment(Long userId, CommentableType targetType, Long targetId,
                              String content, Long parentCommentId) {
        if (parentCommentId != null) {
            return addReply(userId, parentCommentId, content);
        }

        return switch (targetType) {
            case COURSE -> addCourseComment(userId, targetId, content);
            case LESSON -> addLessonComment(userId, targetId, content);
            case COMMENT -> addReply(userId, targetId, content);
        };
    }

    // ============================================
    // Update Comment Methods
    // ============================================

    /**
     * Update a comment's content.
     *
     * Authorization: Only the comment author can edit.
     *
     * @param userId User requesting the update
     * @param commentId Comment ID
     * @param newContent New content
     * @return Updated comment
     */
    @Transactional
    public Comment updateComment(Long userId, Long commentId, String newContent) {
        log.info("Updating comment: userId={}, commentId={}", userId, commentId);

        Comment comment = commentRepository.findByIdWithUser(commentId)
                .orElseThrow(() -> new IllegalArgumentException(COMMENT_NOT_FOUND_MSG + commentId));

        // Authorization check - only author can edit
        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to edit this comment");
        }

        if (comment.getIsDeleted()) {
            throw new IllegalArgumentException("Cannot edit a deleted comment");
        }

        comment.setContent(newContent);
        comment.markAsEdited();

        comment = commentRepository.save(comment);

        log.info("Comment updated: commentId={}", commentId);
        return comment;
    }

    // ============================================
    // Delete Comment Methods
    // ============================================

    /**
     * Delete a comment (soft delete).
     *
     * Authorization: Comment author OR admin can delete.
     * Soft delete preserves thread structure by replacing content with "[deleted]".
     *
     * @param userId User requesting deletion
     * @param commentId Comment ID
     * @param isAdmin Whether the user is an admin
     */
    @Transactional
    public void deleteComment(Long userId, Long commentId, boolean isAdmin) {
        log.info("Deleting comment: userId={}, commentId={}, isAdmin={}", userId, commentId, isAdmin);

        Comment comment = commentRepository.findByIdWithUserAndParent(commentId)
                .orElseThrow(() -> new IllegalArgumentException(COMMENT_NOT_FOUND_MSG + commentId));

        // Authorization check - author or admin can delete
        if (!isAdmin && !comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to delete this comment");
        }

        if (comment.getIsDeleted()) {
            log.warn("Comment already deleted: commentId={}", commentId);
            return;
        }

        // Soft delete
        comment.softDelete();
        commentRepository.save(comment);

        // Update parent's reply count if this is a reply
        if (comment.getParent() != null) {
            Comment parent = comment.getParent();
            parent.decrementReplyCount();
            commentRepository.save(parent);
        }

        log.info("Comment soft deleted: commentId={}", commentId);
    }

    /**
     * Hard delete a comment and all its replies.
     *
     * Authorization: Admin only.
     * Use with caution - this permanently removes comments.
     *
     * @param commentId Comment ID
     */
    @Transactional
    public void hardDeleteComment(Long commentId) {
        log.warn("Hard deleting comment and replies: commentId={}", commentId);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException(COMMENT_NOT_FOUND_MSG + commentId));

        // Update parent's reply count
        if (comment.getParent() != null) {
            Comment parent = comment.getParent();
            parent.decrementReplyCount();
            commentRepository.save(parent);
        }

        // Delete the comment (cascades to replies due to orphanRemoval)
        commentRepository.delete(comment);

        log.info("Comment hard deleted: commentId={}", commentId);
    }

    // ============================================
    // Fetch Comment Methods
    // ============================================

    /**
     * Get root comments for a course with pagination.
     *
     * @param courseId Course ID
     * @param pageable Pagination parameters
     * @return Page of comments
     */
    @Transactional(readOnly = true)
    public Page<Comment> getCourseComments(Long courseId, Pageable pageable) {
        return commentRepository.findRootCommentsByTarget(CommentableType.COURSE, courseId, pageable);
    }

    /**
     * Get root comments for a lesson with pagination.
     *
     * @param lessonId Lesson ID
     * @param pageable Pagination parameters
     * @return Page of comments
     */
    @Transactional(readOnly = true)
    public Page<Comment> getLessonComments(Long lessonId, Pageable pageable) {
        return commentRepository.findRootCommentsByTarget(CommentableType.LESSON, lessonId, pageable);
    }

    /**
     * Get comments for any target with pagination.
     *
     * @param targetType Commentable type
     * @param targetId Target entity ID
     * @param pageable Pagination parameters
     * @return Page of comments
     */
    @Transactional(readOnly = true)
    public Page<Comment> getComments(CommentableType targetType, Long targetId, Pageable pageable) {
        return commentRepository.findRootCommentsByTarget(targetType, targetId, pageable);
    }

    /**
     * Get replies to a comment.
     *
     * @param commentId Parent comment ID
     * @return List of replies
     */
    @Transactional(readOnly = true)
    public List<Comment> getReplies(Long commentId) {
        return commentRepository.findRepliesByParentIdWithUser(commentId);
    }

    /**
     * Get all comments in a thread (by root comment).
     *
     * @param rootCommentId Root comment ID
     * @return List of all comments in the thread
     */
    @Transactional(readOnly = true)
    public List<Comment> getThread(Long rootCommentId) {
        return commentRepository.findCommentsByRootId(rootCommentId);
    }

    /**
     * Get a single comment by ID with user loaded.
     *
     * @param commentId Comment ID
     * @return Comment
     */
    @Transactional(readOnly = true)
    public Comment getComment(Long commentId) {
        return commentRepository.findByIdWithUser(commentId)
                .orElseThrow(() -> new IllegalArgumentException(COMMENT_NOT_FOUND_MSG + commentId));
    }

    /**
     * Get comments by a specific user.
     *
     * @param userId User ID
     * @param pageable Pagination parameters
     * @return Page of comments
     */
    @Transactional(readOnly = true)
    public Page<Comment> getUserComments(Long userId, Pageable pageable) {
        return commentRepository.findByUserId(userId, pageable);
    }

    // ============================================
    // Count Methods
    // ============================================

    /**
     * Count comments for a target.
     *
     * @param targetType Commentable type
     * @param targetId Target entity ID
     * @return Comment count
     */
    @Transactional(readOnly = true)
    public long countComments(CommentableType targetType, Long targetId) {
        return commentRepository.countByTarget(targetType, targetId);
    }

    /**
     * Count root comments for a target.
     *
     * @param targetType Commentable type
     * @param targetId Target entity ID
     * @return Root comment count
     */
    @Transactional(readOnly = true)
    public long countRootComments(CommentableType targetType, Long targetId) {
        return commentRepository.countRootCommentsByTarget(targetType, targetId);
    }

    /**
     * Count replies to a comment.
     *
     * @param commentId Comment ID
     * @return Reply count
     */
    @Transactional(readOnly = true)
    public long countReplies(Long commentId) {
        return commentRepository.countRepliesByParentId(commentId);
    }

    // ============================================
    // Moderation Methods
    // ============================================

    /**
     * Pin a comment (admin only).
     *
     * @param commentId Comment ID
     * @param pinned Whether to pin or unpin
     */
    @Transactional
    public void pinComment(Long commentId, boolean pinned) {
        log.info("Setting comment pin status: commentId={}, pinned={}", commentId, pinned);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException(COMMENT_NOT_FOUND_MSG + commentId));

        // Only root comments can be pinned
        if (!comment.isRootComment()) {
            throw new IllegalArgumentException("Only root comments can be pinned");
        }

        comment.setIsPinned(pinned);
        commentRepository.save(comment);

        log.info("Comment pin status updated: commentId={}, pinned={}", commentId, pinned);
    }

    /**
     * Get pinned comments for a target.
     *
     * @param targetType Commentable type
     * @param targetId Target entity ID
     * @return List of pinned comments
     */
    @Transactional(readOnly = true)
    public List<Comment> getPinnedComments(CommentableType targetType, Long targetId) {
        return commentRepository.findPinnedComments(targetType, targetId);
    }

    // ============================================
    // Count Update Methods
    // ============================================

    /**
     * Recalculate reply count for a comment.
     *
     * @param commentId Comment ID
     */
    @Transactional
    public void recalculateReplyCount(Long commentId) {
        long actualCount = commentRepository.countRepliesByParentId(commentId);
        commentRepository.updateReplyCount(commentId, (int) actualCount);
        log.debug("Reply count recalculated: commentId={}, count={}", commentId, actualCount);
    }

    /**
     * Update like count for a comment.
     * Called by LikeService when likes change.
     *
     * @param commentId Comment ID
     * @param count New like count
     */
    @Transactional
    public void updateLikeCount(Long commentId, int count) {
        commentRepository.updateLikeCount(commentId, count);
        log.debug("Like count updated: commentId={}, count={}", commentId, count);
    }

    // ============================================
    // Helper Methods
    // ============================================

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND_MSG + userId));
    }
}

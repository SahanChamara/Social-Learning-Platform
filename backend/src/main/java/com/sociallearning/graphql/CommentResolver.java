package com.sociallearning.graphql;

import com.sociallearning.entity.Comment;
import com.sociallearning.enums.CommentableType;
import com.sociallearning.security.InputSanitizer;
import com.sociallearning.security.SecurityUtils;
import com.sociallearning.service.CommentService;
import com.sociallearning.service.LikeService;
import com.sociallearning.service.SubscriptionPublisher;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * GraphQL resolver for comment operations.
 * 
 * Handles:
 * - Adding comments to courses, lessons, or as replies
 * - Updating and deleting comments
 * - Fetching comments with pagination
 * - Pinning comments (admin/creator)
 * - Publishing subscription events
 */
@Slf4j
@Controller
@Validated
@RequiredArgsConstructor
public class CommentResolver {

    private final CommentService commentService;
    private final LikeService likeService;
    private final SubscriptionPublisher subscriptionPublisher;
    private final InputSanitizer inputSanitizer;

    // ============================================
    // Mutations
    // ============================================

    /**
     * Add a comment to a course, lesson, or as a reply to another comment.
     * Publishes a subscription event when comment is added.
     * 
     * GraphQL Mutation:
     * mutation AddComment($input: AddCommentInput!) {
     *   addComment(input: $input) {
     *     id
     *     content
     *     user { id username }
     *     createdAt
     *   }
     * }
     */
    @MutationMapping
    public Comment addComment(@Argument("input") @Valid AddCommentInput input) {
        Long userId = requireAuthentication();
        
        log.info("GraphQL addComment mutation: userId={}, targetType={}, targetId={}", 
                userId, input.targetType(), input.targetId());
        
        String sanitizedContent = inputSanitizer.sanitize(input.content());
        Long parentId = input.parentCommentId();
        Long targetId = input.targetId();

        Comment comment = commentService.addComment(
                userId,
                input.targetType(),
                targetId,
                sanitizedContent,
                parentId
        );
        
        // Publish subscription event
        subscriptionPublisher.publishCommentAdded(comment, input.targetType().name(), targetId);
        
        return comment;
    }

    /**
     * Update a comment's content.
     * Authorization: Only the comment author can update.
     * Publishes a subscription event when comment is updated.
     * 
     * GraphQL Mutation:
     * mutation UpdateComment($id: ID!, $input: UpdateCommentInput!) {
     *   updateComment(id: $id, input: $input) {
     *     id
     *     content
     *     isEdited
     *     editedAt
     *   }
     * }
     */
    @MutationMapping
    public Comment updateComment(
            @Argument @NotNull @Positive Long id,
            @Argument("input") @Valid UpdateCommentInput input) {
        Long userId = requireAuthentication();
        
        log.info("GraphQL updateComment mutation: userId={}, commentId={}", userId, id);
        
        Comment comment = commentService.updateComment(userId, id, inputSanitizer.sanitize(input.content()));
        
        // Publish subscription event
        subscriptionPublisher.publishCommentUpdated(comment);
        
        return comment;
    }

    /**
     * Delete a comment (soft delete).
     * Authorization: Comment author or admin can delete.
     * Publishes a subscription event when comment is deleted.
     * 
     * GraphQL Mutation:
     * mutation DeleteComment($id: ID!) {
     *   deleteComment(id: $id)
     * }
     */
    @MutationMapping
    public boolean deleteComment(@Argument @NotNull @Positive Long id) {
        Long userId = requireAuthentication();
        boolean isAdmin = SecurityUtils.hasRole("ADMIN");
        
        log.info("GraphQL deleteComment mutation: userId={}, commentId={}, isAdmin={}", 
                userId, id, isAdmin);
        
        // Get comment before deletion for the event
        Comment comment = commentService.getComment(id);
        
        commentService.deleteComment(userId, id, isAdmin);
        
        // Publish subscription event
        subscriptionPublisher.publishCommentDeleted(comment);
        
        return true;
    }

    /**
     * Pin or unpin a comment.
     * Authorization: Admin or course creator only.
     * 
     * GraphQL Mutation:
     * mutation PinComment($id: ID!, $pinned: Boolean!) {
     *   pinComment(id: $id, pinned: $pinned) {
     *     id
     *     isPinned
     *   }
     * }
     */
    @MutationMapping
    public Comment pinComment(@Argument @NotNull @Positive Long id, @Argument boolean pinned) {
        requireAuthentication();
        // TODO: Add authorization check for admin/course creator
        
        log.info("GraphQL pinComment mutation: commentId={}, pinned={}", id, pinned);
        
        commentService.pinComment(id, pinned);
        return commentService.getComment(id);
    }

    // ============================================
    // Queries
    // ============================================

    /**
     * Get comments for a course or lesson with pagination.
     * 
     * GraphQL Query:
     * query GetComments($targetType: CommentableType!, $targetId: ID!, $page: Int, $size: Int) {
     *   comments(targetType: $targetType, targetId: $targetId, page: $page, size: $size) {
     *     content {
     *       id
     *       content
     *       user { id username avatarUrl }
     *       likeCount
     *       replyCount
     *       isLikedByMe
     *       createdAt
     *     }
     *     totalElements
     *     totalPages
     *     hasNext
     *   }
     * }
     */
    @QueryMapping
    public Map<String, Object> comments(
            @Argument @NotNull CommentableType targetType,
            @Argument @NotNull @Positive Long targetId,
            @Argument @Min(0) Integer page,
            @Argument @Min(1) @Max(50) Integer size) {
        
        log.info("GraphQL comments query: targetType={}, targetId={}, page={}, size={}", 
                targetType, targetId, page, size);
        
        int pageNumber = (page != null) ? page : 0;
        int pageSize = (size != null && size > 0) ? Math.min(size, 50) : 20;
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        
        Page<Comment> commentPage = commentService.getComments(targetType, targetId, pageable);
        
        return toPageResult(commentPage);
    }

    /**
     * Get replies to a specific comment.
     * 
     * GraphQL Query:
     * query GetReplies($commentId: ID!) {
     *   commentReplies(commentId: $commentId) {
     *     id
     *     content
     *     user { id username }
     *     depthLevel
     *   }
     * }
     */
    @QueryMapping
    public List<Comment> commentReplies(@Argument @NotNull @Positive Long commentId) {
        log.info("GraphQL commentReplies query: commentId={}", commentId);
        return commentService.getReplies(commentId);
    }

    /**
     * Get a single comment by ID.
     * 
     * GraphQL Query:
     * query GetComment($id: ID!) {
     *   comment(id: $id) {
     *     id
     *     content
     *     user { id username }
     *   }
     * }
     */
    @QueryMapping
    public Comment comment(@Argument @NotNull @Positive Long id) {
        log.info("GraphQL comment query: id={}", id);
        try {
            return commentService.getComment(id);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    // ============================================
    // Field Resolvers
    // ============================================

    /**
     * Resolve whether the current user has liked this comment.
     */
    @SchemaMapping(typeName = "Comment", field = "isLikedByMe")
    public boolean isLikedByMe(Comment comment) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return false;
        }
        return likeService.hasUserLikedComment(userId, comment.getId());
    }

    /**
     * Resolve replies for a comment.
     */
    @SchemaMapping(typeName = "Comment", field = "replies")
    public List<Comment> replies(Comment comment) {
        return commentService.getReplies(comment.getId());
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

    private Map<String, Object> toPageResult(Page<Comment> page) {
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

    public record AddCommentInput(
        @NotBlank(message = "Comment content is required")
        @Size(min = 1, max = 5000, message = "Comment content must be between 1 and 5000 characters")
        String content,
        @NotNull(message = "Target type is required")
        CommentableType targetType,
        @NotNull(message = "Target ID is required")
        @Positive(message = "Target ID must be positive")
        Long targetId,
        @Positive(message = "Parent comment ID must be positive")
        Long parentCommentId
    ) {}

    public record UpdateCommentInput(
        @NotBlank(message = "Comment content is required")
        @Size(min = 1, max = 5000, message = "Comment content must be between 1 and 5000 characters")
        String content
    ) {}
}

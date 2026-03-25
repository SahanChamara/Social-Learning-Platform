package com.sociallearning.entity;

import com.sociallearning.enums.CommentableType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Comment Entity - Represents a comment in the Social Learning Platform
 * Supports polymorphic relationships (can be attached to courses, lessons, or other comments)
 * Supports threading via parent/rootComment relationships
 */
@Entity
@Table(name = "comments", indexes = {
    @Index(name = "idx_comments_user", columnList = "user_id"),
    @Index(name = "idx_comments_target", columnList = "commentable_type, commentable_id"),
    @Index(name = "idx_comments_parent", columnList = "parent_id"),
    @Index(name = "idx_comments_root", columnList = "root_comment_id"),
    @Index(name = "idx_comments_created_at", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "parent", "rootComment", "replies"})
@EqualsAndHashCode(of = "id")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user who wrote the comment
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;

    /**
     * Type of entity this comment belongs to (COURSE, LESSON, COMMENT)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "commentable_type", nullable = false, length = 20)
    @NotNull(message = "Commentable type is required")
    private CommentableType commentableType;

    /**
     * ID of the entity this comment belongs to
     */
    @Column(name = "commentable_id", nullable = false)
    @NotNull(message = "Commentable ID is required")
    private Long commentableId;

    /**
     * The comment content (supports basic HTML/markdown)
     */
    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 5000, message = "Content must be between 1 and 5000 characters")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    /**
     * Parent comment (for replies/threading)
     * Null if this is a top-level comment
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Comment parent;

    /**
     * Root comment of the thread
     * Points to the top-level comment in a thread
     * Self-referential for top-level comments
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "root_comment_id")
    private Comment rootComment;

    /**
     * Replies to this comment
     */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Comment> replies = new ArrayList<>();

    /**
     * Depth level in the thread (0 for root comments)
     */
    @Column(name = "depth_level", nullable = false)
    @Builder.Default
    private Integer depthLevel = 0;

    /**
     * Number of likes on this comment (denormalized for performance)
     */
    @Column(name = "like_count", nullable = false)
    @Builder.Default
    private Integer likeCount = 0;

    /**
     * Number of replies to this comment (denormalized for performance)
     */
    @Column(name = "reply_count", nullable = false)
    @Builder.Default
    private Integer replyCount = 0;

    /**
     * Whether the comment is edited
     */
    @Column(name = "is_edited", nullable = false)
    @Builder.Default
    private Boolean isEdited = false;

    /**
     * Whether the comment is deleted (soft delete)
     * Deleted comments show "[deleted]" but preserve thread structure
     */
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    /**
     * Whether the comment is pinned (only for root comments)
     */
    @Column(name = "is_pinned", nullable = false)
    @Builder.Default
    private Boolean isPinned = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * When the comment was edited (different from updatedAt which tracks any change)
     */
    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    // ============================================
    // Convenience Methods
    // ============================================

    /**
     * Check if this is a top-level comment
     */
    public boolean isRootComment() {
        return parent == null;
    }

    /**
     * Check if this comment has replies
     */
    public boolean hasReplies() {
        return replyCount > 0;
    }

    /**
     * Increment the like count
     */
    public void incrementLikeCount() {
        this.likeCount++;
    }

    /**
     * Decrement the like count
     */
    public void decrementLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }

    /**
     * Increment the reply count
     */
    public void incrementReplyCount() {
        this.replyCount++;
    }

    /**
     * Decrement the reply count
     */
    public void decrementReplyCount() {
        if (this.replyCount > 0) {
            this.replyCount--;
        }
    }

    /**
     * Mark the comment as edited
     */
    public void markAsEdited() {
        this.isEdited = true;
        this.editedAt = LocalDateTime.now();
    }

    /**
     * Soft delete the comment
     */
    public void softDelete() {
        this.isDeleted = true;
        this.content = "[deleted]";
    }

    /**
     * Get display content (handles deleted state)
     */
    public String getDisplayContent() {
        return isDeleted ? "[deleted]" : content;
    }
}

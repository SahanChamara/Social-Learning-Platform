package com.sociallearning.entity;

import com.sociallearning.enums.LikeableType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Like Entity - Represents a like/upvote in the Social Learning Platform
 * Supports polymorphic relationships (can be attached to courses, lessons, or comments)
 */
@Entity
@Table(name = "likes",
    indexes = {
        @Index(name = "idx_likes_user", columnList = "user_id"),
        @Index(name = "idx_likes_target", columnList = "likeable_type, likeable_id"),
        @Index(name = "idx_likes_created_at", columnList = "created_at")
    },
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_likes_user_target",
            columnNames = {"user_id", "likeable_type", "likeable_id"}
        )
    }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user"})
@EqualsAndHashCode(of = "id")
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user who liked the entity
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;

    /**
     * Type of entity that was liked (COURSE, LESSON, COMMENT)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "likeable_type", nullable = false, length = 20)
    @NotNull(message = "Likeable type is required")
    private LikeableType likeableType;

    /**
     * ID of the entity that was liked
     */
    @Column(name = "likeable_id", nullable = false)
    @NotNull(message = "Likeable ID is required")
    private Long likeableId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ============================================
    // Convenience Methods
    // ============================================

    /**
     * Check if this like is for a course
     */
    public boolean isCourseLike() {
        return likeableType == LikeableType.COURSE;
    }

    /**
     * Check if this like is for a lesson
     */
    public boolean isLessonLike() {
        return likeableType == LikeableType.LESSON;
    }

    /**
     * Check if this like is for a comment
     */
    public boolean isCommentLike() {
        return likeableType == LikeableType.COMMENT;
    }

    /**
     * Static factory method for creating a course like
     */
    public static Like forCourse(User user, Long courseId) {
        return Like.builder()
            .user(user)
            .likeableType(LikeableType.COURSE)
            .likeableId(courseId)
            .build();
    }

    /**
     * Static factory method for creating a lesson like
     */
    public static Like forLesson(User user, Long lessonId) {
        return Like.builder()
            .user(user)
            .likeableType(LikeableType.LESSON)
            .likeableId(lessonId)
            .build();
    }

    /**
     * Static factory method for creating a comment like
     */
    public static Like forComment(User user, Long commentId) {
        return Like.builder()
            .user(user)
            .likeableType(LikeableType.COMMENT)
            .likeableId(commentId)
            .build();
    }
}

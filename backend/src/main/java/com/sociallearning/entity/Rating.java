package com.sociallearning.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Rating Entity - Represents a course rating/review in the Social Learning Platform
 * Users can rate courses from 1-5 stars and optionally leave a review
 */
@Entity
@Table(name = "ratings",
    indexes = {
        @Index(name = "idx_ratings_user", columnList = "user_id"),
        @Index(name = "idx_ratings_course", columnList = "course_id"),
        @Index(name = "idx_ratings_value", columnList = "rating_value"),
        @Index(name = "idx_ratings_created_at", columnList = "created_at")
    },
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_ratings_user_course",
            columnNames = {"user_id", "course_id"}
        )
    }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "course"})
@EqualsAndHashCode(of = "id")
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user who submitted the rating
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;

    /**
     * The course being rated
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @NotNull(message = "Course is required")
    private Course course;

    /**
     * Rating value (1-5 stars)
     */
    @Column(name = "rating_value", nullable = false)
    @NotNull(message = "Rating value is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer ratingValue;

    /**
     * Optional review title
     */
    @Size(max = 200, message = "Review title must not exceed 200 characters")
    @Column(name = "review_title", length = 200)
    private String reviewTitle;

    /**
     * Optional review content
     */
    @Size(max = 5000, message = "Review must not exceed 5000 characters")
    @Column(name = "review_content", columnDefinition = "TEXT")
    private String reviewContent;

    /**
     * Number of users who found this review helpful (denormalized)
     */
    @Column(name = "helpful_count", nullable = false)
    @Builder.Default
    private Integer helpfulCount = 0;

    /**
     * Whether the review is edited
     */
    @Column(name = "is_edited", nullable = false)
    @Builder.Default
    private Boolean isEdited = false;

    /**
     * Whether the review is verified (user completed the course)
     */
    @Column(name = "is_verified_purchase", nullable = false)
    @Builder.Default
    private Boolean isVerifiedPurchase = false;

    /**
     * Whether the review is featured by admin
     */
    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;

    /**
     * Whether the review is hidden (flagged/moderated)
     */
    @Column(name = "is_hidden", nullable = false)
    @Builder.Default
    private Boolean isHidden = false;

    /**
     * Admin response to the review (if any)
     */
    @Size(max = 2000, message = "Response must not exceed 2000 characters")
    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    /**
     * When the admin responded
     */
    @Column(name = "admin_responded_at")
    private LocalDateTime adminRespondedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * When the review was edited (different from updatedAt)
     */
    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    // ============================================
    // Convenience Methods
    // ============================================

    /**
     * Check if this rating has a written review
     */
    public boolean hasReview() {
        return reviewContent != null && !reviewContent.trim().isEmpty();
    }

    /**
     * Check if this is a positive rating (4+ stars)
     */
    public boolean isPositive() {
        return ratingValue >= 4;
    }

    /**
     * Check if this is a negative rating (2 or less stars)
     */
    public boolean isNegative() {
        return ratingValue <= 2;
    }

    /**
     * Check if this is a neutral rating (3 stars)
     */
    public boolean isNeutral() {
        return ratingValue == 3;
    }

    /**
     * Increment the helpful count
     */
    public void incrementHelpfulCount() {
        this.helpfulCount++;
    }

    /**
     * Decrement the helpful count
     */
    public void decrementHelpfulCount() {
        if (this.helpfulCount > 0) {
            this.helpfulCount--;
        }
    }

    /**
     * Mark the review as edited
     */
    public void markAsEdited() {
        this.isEdited = true;
        this.editedAt = LocalDateTime.now();
    }

    /**
     * Add admin response
     */
    public void addAdminResponse(String response) {
        this.adminResponse = response;
        this.adminRespondedAt = LocalDateTime.now();
    }

    /**
     * Get star label (e.g., "5 stars", "1 star")
     */
    public String getStarLabel() {
        return ratingValue + (ratingValue == 1 ? " star" : " stars");
    }
}

package com.sociallearning.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Progress Entity - Tracks a learner's progress for a single lesson.
 *
 * One progress record exists per enrollment + lesson pair.
 */
@Entity
@Table(name = "lesson_progress", uniqueConstraints = {
    @UniqueConstraint(name = "uk_progress_enrollment_lesson", columnNames = {"enrollment_id", "lesson_id"})
}, indexes = {
    @Index(name = "idx_progress_enrollment_id", columnList = "enrollment_id"),
    @Index(name = "idx_progress_user_id", columnList = "user_id"),
    @Index(name = "idx_progress_lesson_id", columnList = "lesson_id"),
    @Index(name = "idx_progress_completed", columnList = "completed"),
    @Index(name = "idx_progress_completed_at", columnList = "completed_at")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"enrollment", "user", "lesson"})
@EqualsAndHashCode(of = "id")
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Progress must belong to an enrollment")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @NotNull(message = "Progress must have a user")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Progress must belong to a lesson")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(nullable = false)
    @Builder.Default
    private Boolean completed = false;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    @Min(value = 0, message = "Watch time cannot be negative")
    @Column(name = "watch_time_seconds", nullable = false)
    @Builder.Default
    private Integer watchTimeSeconds = 0;

    @Min(value = 0, message = "Attempt count cannot be negative")
    @Column(name = "attempt_count", nullable = false)
    @Builder.Default
    private Integer attemptCount = 0;

    @DecimalMin(value = "0.0", message = "Score percentage must be between 0 and 100")
    @DecimalMax(value = "100.0", message = "Score percentage must be between 0 and 100")
    @Column(name = "score_percentage", precision = 5, scale = 2)
    private BigDecimal scorePercentage;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    private void syncUserFromEnrollment() {
        if (this.enrollment != null && this.enrollment.getUser() != null) {
            this.user = this.enrollment.getUser();
        }
    }

    /**
     * Mark this lesson progress as started/accessed.
     */
    public void markAccessed() {
        this.lastAccessedAt = LocalDateTime.now();
        if (this.startedAt == null) {
            this.startedAt = this.lastAccessedAt;
        }
    }

    /**
     * Mark lesson as completed and update completion counters.
     */
    public void markCompleted() {
        if (!Boolean.TRUE.equals(this.completed)) {
            this.completed = true;
            this.completedAt = LocalDateTime.now();
            if (this.startedAt == null) {
                this.startedAt = this.completedAt;
            }
            if (this.lesson != null) {
                this.lesson.incrementCompletionCount();
            }
        }
    }

    /**
     * Mark lesson as incomplete.
     */
    public void markIncomplete() {
        this.completed = false;
        this.completedAt = null;
    }

    /**
     * Increase attempt count for quizzes/assignments.
     */
    public void incrementAttemptCount() {
        this.attemptCount++;
    }

    /**
     * Add watch/study time for this lesson.
     */
    public void addWatchTime(int seconds) {
        if (seconds > 0) {
            this.watchTimeSeconds += seconds;
        }
    }

    public boolean isForLesson(Long lessonId) {
        return this.lesson != null && this.lesson.getId().equals(lessonId);
    }
}

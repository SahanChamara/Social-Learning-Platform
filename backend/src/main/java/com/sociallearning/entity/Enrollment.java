package com.sociallearning.entity;

import com.sociallearning.enums.EnrollmentStatus;
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
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Enrollment Entity - Represents a learner's enrollment in a course.
 *
 * Stores denormalized progress fields for fast dashboard and query operations.
 */
@Entity
@Table(name = "enrollments", uniqueConstraints = {
    @UniqueConstraint(name = "uk_enrollments_user_course", columnNames = {"user_id", "course_id"})
}, indexes = {
    @Index(name = "idx_enrollments_user_id", columnList = "user_id"),
    @Index(name = "idx_enrollments_course_id", columnList = "course_id"),
    @Index(name = "idx_enrollments_status", columnList = "status"),
    @Index(name = "idx_enrollments_progress", columnList = "progress_percentage"),
    @Index(name = "idx_enrollments_enrolled_at", columnList = "enrolled_at")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "course", "progressRecords"})
@EqualsAndHashCode(of = "id")
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Enrollment must have a user")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Enrollment must have a course")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @NotNull(message = "Enrollment status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EnrollmentStatus status = EnrollmentStatus.ENROLLED;

    @DecimalMin(value = "0.0", message = "Progress percentage must be between 0 and 100")
    @DecimalMax(value = "100.0", message = "Progress percentage must be between 0 and 100")
    @Column(name = "progress_percentage", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal progressPercentage = BigDecimal.ZERO;

    @Min(value = 0, message = "Completed lessons cannot be negative")
    @Column(name = "completed_lessons", nullable = false)
    @Builder.Default
    private Integer completedLessons = 0;

    @Min(value = 0, message = "Total lessons cannot be negative")
    @Column(name = "total_lessons", nullable = false)
    @Builder.Default
    private Integer totalLessons = 0;

    @NotNull
    @Column(name = "enrolled_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime enrolledAt = LocalDateTime.now();

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    @Min(value = 0, message = "Time spent cannot be negative")
    @Column(name = "time_spent_minutes", nullable = false)
    @Builder.Default
    private Integer timeSpentMinutes = 0;

    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<Progress> progressRecords = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Initialize enrollment lesson counters when enrollment is first created.
     */
    public void initializeLessonProgress(int lessonCount) {
        this.totalLessons = Math.max(lessonCount, 0);
        this.completedLessons = 0;
        this.progressPercentage = BigDecimal.ZERO;
        this.status = EnrollmentStatus.ENROLLED;
        this.completedAt = null;
    }

    /**
     * Recalculate enrollment progress using completed and total lesson counts.
     */
    public void updateProgress(int completedLessonCount, int totalLessonCount) {
        this.completedLessons = Math.max(completedLessonCount, 0);
        this.totalLessons = Math.max(totalLessonCount, 0);

        if (this.totalLessons == 0) {
            this.progressPercentage = BigDecimal.ZERO;
            return;
        }

        this.progressPercentage = BigDecimal
            .valueOf(this.completedLessons)
            .multiply(BigDecimal.valueOf(100))
            .divide(BigDecimal.valueOf(this.totalLessons), 2, RoundingMode.HALF_UP)
            .min(BigDecimal.valueOf(100));

        if (this.completedLessons > 0 && this.startedAt == null) {
            this.startedAt = LocalDateTime.now();
        }

        if (this.progressPercentage.compareTo(BigDecimal.valueOf(100)) >= 0) {
            markCompleted();
        }
    }

    /**
     * Mark enrollment as completed.
     */
    public void markCompleted() {
        this.status = EnrollmentStatus.COMPLETED;
        this.progressPercentage = BigDecimal.valueOf(100);
        if (this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
        }
        if (this.startedAt == null) {
            this.startedAt = LocalDateTime.now();
        }
    }

    /**
     * Mark enrollment as dropped.
     */
    public void markDropped() {
        this.status = EnrollmentStatus.DROPPED;
    }

    /**
     * Track learner access for activity and streak calculations.
     */
    public void markAccessed() {
        this.lastAccessedAt = LocalDateTime.now();
        if (this.startedAt == null) {
            this.startedAt = this.lastAccessedAt;
        }
    }

    /**
     * Add tracked study time in minutes.
     */
    public void addTimeSpent(int minutes) {
        if (minutes > 0) {
            this.timeSpentMinutes += minutes;
        }
    }

    public boolean isCompleted() {
        return this.status == EnrollmentStatus.COMPLETED;
    }
}

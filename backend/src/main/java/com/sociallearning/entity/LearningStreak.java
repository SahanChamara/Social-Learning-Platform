package com.sociallearning.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * LearningStreak Entity - Stores daily streak metrics for a user.
 */
@Entity
@Table(name = "learning_streaks", uniqueConstraints = {
    @UniqueConstraint(name = "uk_learning_streak_user", columnNames = {"user_id"})
}, indexes = {
    @Index(name = "idx_learning_streaks_user_id", columnList = "user_id"),
    @Index(name = "idx_learning_streaks_current_days", columnList = "current_streak_days"),
    @Index(name = "idx_learning_streaks_last_activity", columnList = "last_activity_date")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user"})
@EqualsAndHashCode(of = "id")
public class LearningStreak {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Min(value = 0, message = "Current streak days must be non-negative")
    @Column(name = "current_streak_days", nullable = false)
    @Builder.Default
    private Integer currentStreakDays = 0;

    @Min(value = 0, message = "Longest streak days must be non-negative")
    @Column(name = "longest_streak_days", nullable = false)
    @Builder.Default
    private Integer longestStreakDays = 0;

    @Min(value = 0, message = "Total active days must be non-negative")
    @Column(name = "total_active_days", nullable = false)
    @Builder.Default
    private Integer totalActiveDays = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "streak_start_date")
    private LocalDate streakStartDate;

    @Column(name = "last_reset_at")
    private LocalDateTime lastResetAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Register daily learning activity and update streak counters.
     */
    public void recordActivity(LocalDate activityDate) {
        if (activityDate == null) {
            return;
        }

        if (lastActivityDate == null) {
            currentStreakDays = 1;
            longestStreakDays = Math.max(longestStreakDays, currentStreakDays);
            totalActiveDays++;
            streakStartDate = activityDate;
            lastActivityDate = activityDate;
            return;
        }

        if (activityDate.isEqual(lastActivityDate)) {
            return;
        }

        if (activityDate.isEqual(lastActivityDate.plusDays(1))) {
            currentStreakDays++;
            totalActiveDays++;
        } else if (activityDate.isAfter(lastActivityDate.plusDays(1))) {
            currentStreakDays = 1;
            totalActiveDays++;
            streakStartDate = activityDate;
            lastResetAt = LocalDateTime.now();
        }

        longestStreakDays = Math.max(longestStreakDays, currentStreakDays);
        lastActivityDate = activityDate;
    }

    /**
     * Reset current streak after inactivity.
     */
    public void resetCurrentStreak() {
        currentStreakDays = 0;
        streakStartDate = null;
        lastResetAt = LocalDateTime.now();
    }
}

package com.sociallearning.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * UserAchievement Entity - Tracks a user's progress and unlock state for a specific achievement.
 */
@Entity
@Table(name = "user_achievements", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_achievement_user_achievement", columnNames = {"user_id", "achievement_id"})
}, indexes = {
    @Index(name = "idx_user_achievements_user_id", columnList = "user_id"),
    @Index(name = "idx_user_achievements_achievement_id", columnList = "achievement_id"),
    @Index(name = "idx_user_achievements_is_unlocked", columnList = "is_unlocked"),
    @Index(name = "idx_user_achievements_earned_at", columnList = "earned_at")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "achievement"})
@EqualsAndHashCode(of = "id")
public class UserAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Achievement is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "achievement_id", nullable = false)
    private Achievement achievement;

    @DecimalMin(value = "0.0", message = "Progress percentage must be between 0 and 100")
    @DecimalMax(value = "100.0", message = "Progress percentage must be between 0 and 100")
    @Column(name = "progress_percentage", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal progressPercentage = BigDecimal.ZERO;

    /**
     * Optional flexible progress JSON to support complex criteria.
     */
    @Column(name = "progress_json", columnDefinition = "TEXT")
    private String progressJson;

    @Column(name = "is_unlocked", nullable = false)
    @Builder.Default
    private Boolean isUnlocked = false;

    @Column(name = "earned_at")
    private LocalDateTime earnedAt;

    @Column(name = "notified_at")
    private LocalDateTime notifiedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Mark this achievement as unlocked for the user.
     */
    public void unlock() {
        this.isUnlocked = true;
        this.progressPercentage = BigDecimal.valueOf(100);
        if (this.earnedAt == null) {
            this.earnedAt = LocalDateTime.now();
        }
    }

    /**
     * Track user progress toward unlocking.
     */
    public void updateProgress(BigDecimal progress) {
        if (progress == null) {
            return;
        }
        BigDecimal normalized = progress.max(BigDecimal.ZERO).min(BigDecimal.valueOf(100));
        this.progressPercentage = normalized;
        if (normalized.compareTo(BigDecimal.valueOf(100)) >= 0 && !Boolean.TRUE.equals(this.isUnlocked)) {
            unlock();
        }
    }
}

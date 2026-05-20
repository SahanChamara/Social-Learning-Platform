package com.sociallearning.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Achievement Entity - Defines an achievement/badge in the platform.
 * Criteria are stored as JSON for flexible rule evaluation.
 */
@Entity
@Table(name = "achievements", indexes = {
    @Index(name = "idx_achievements_slug", columnList = "slug"),
    @Index(name = "idx_achievements_category", columnList = "category"),
    @Index(name = "idx_achievements_is_active", columnList = "is_active"),
    @Index(name = "idx_achievements_created_at", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"userAchievements"})
@EqualsAndHashCode(of = "id")
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Achievement name is required")
    @Size(min = 3, max = 120, message = "Achievement name must be between 3 and 120 characters")
    @Column(nullable = false, length = 120)
    private String name;

    @NotBlank(message = "Achievement slug is required")
    @Size(max = 150, message = "Slug must not exceed 150 characters")
    @Column(nullable = false, unique = true, length = 150)
    private String slug;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Column(length = 500)
    private String description;

    @Size(max = 255, message = "Category must not exceed 255 characters")
    @Column(length = 255)
    private String category;

    @Size(max = 500, message = "Icon URL must not exceed 500 characters")
    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Size(max = 30, message = "Badge color must not exceed 30 characters")
    @Column(name = "badge_color", length = 30)
    private String badgeColor;

    /**
     * Flexible criteria JSON for achievement rules.
     * Example: {"type":"COURSE_COMPLETION","target":5}
     */
    @Column(name = "criteria_json", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String criteriaJson = "{}";

    @Min(value = 0, message = "Points must be non-negative")
    @Column(nullable = false)
    @Builder.Default
    private Integer points = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_hidden", nullable = false)
    @Builder.Default
    private Boolean isHidden = false;

    @Column(name = "is_secret", nullable = false)
    @Builder.Default
    private Boolean isSecret = false;

    @OneToMany(mappedBy = "achievement", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserAchievement> userAchievements = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

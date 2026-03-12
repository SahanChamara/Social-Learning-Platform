package com.sociallearning.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Tag Entity - Represents a tag for categorizing and labeling courses
 * Tags are more flexible than categories and allow many-to-many relationships
 * Example tags: "beginner-friendly", "hands-on", "javascript", "react"
 */
@Entity
@Table(name = "tags", indexes = {
    @Index(name = "idx_tags_name", columnList = "name"),
    @Index(name = "idx_tags_slug", columnList = "slug"),
    @Index(name = "idx_tags_usage_count", columnList = "usageCount")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"courses"})
@EqualsAndHashCode(of = "id")
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tag name is required")
    @Size(min = 2, max = 50, message = "Tag name must be between 2 and 50 characters")
    @Column(nullable = false, length = 50)
    private String name;

    @NotBlank(message = "Slug is required")
    @Size(max = 50, message = "Slug must not exceed 50 characters")
    @Column(unique = true, nullable = false, length = 50)
    private String slug;

    @Column(length = 255)
    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    /**
     * Color code for displaying tag badges in UI
     * Example: "#3B82F6" for blue
     */
    @Column(length = 7)
    @Size(max = 7, message = "Color must be a valid hex code")
    private String color;

    /**
     * Courses that have this tag
     * Many-to-many relationship with Course
     */
    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Course> courses = new HashSet<>();

    /**
     * Denormalized count of how many times this tag is used
     * Updated when courses are tagged/untagged
     */
    @Column(name = "usage_count", nullable = false)
    @Builder.Default
    private Integer usageCount = 0;

    /**
     * Whether this tag is active and visible to users
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /**
     * Whether this is a featured/promoted tag
     * Featured tags might be highlighted in the UI
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean featured = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Helper method to add a course
     * Maintains bidirectional relationship and updates usage count
     */
    public void addCourse(Course course) {
        courses.add(course);
        course.getTags().add(this);
        this.usageCount++;
    }

    /**
     * Helper method to remove a course
     * Maintains bidirectional relationship and updates usage count
     */
    public void removeCourse(Course course) {
        courses.remove(course);
        course.getTags().remove(this);
        this.usageCount--;
    }

    /**
     * Check if this tag is popular (used frequently)
     * Threshold can be adjusted based on application needs
     */
    public boolean isPopular() {
        return usageCount >= 10;
    }
}

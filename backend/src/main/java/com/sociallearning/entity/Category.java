package com.sociallearning.entity;

import jakarta.persistence.*;
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
 * Category Entity - Represents a hierarchical category for organizing courses
 * Supports parent-child relationships for nested categories
 * Example: Programming > Web Development > Frontend
 */
@Entity
@Table(name = "categories", indexes = {
    @Index(name = "idx_categories_name", columnList = "name"),
    @Index(name = "idx_categories_slug", columnList = "slug"),
    @Index(name = "idx_categories_parent_id", columnList = "parent_id")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"parent", "children", "courses"})
@EqualsAndHashCode(of = "id")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Slug is required")
    @Size(max = 100, message = "Slug must not exceed 100 characters")
    @Column(unique = true, nullable = false, length = 100)
    private String slug;

    @Column(length = 500)
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Column(name = "icon_url", length = 255)
    private String iconUrl;

    /**
     * Self-referencing relationship for hierarchical categories
     * A category can have one parent category
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    /**
     * Child categories (subcategories)
     * Bidirectional relationship with parent
     */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Category> children = new ArrayList<>();

    /**
     * Courses in this category
     * Bidirectional relationship will be defined in Course entity
     */
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Course> courses = new ArrayList<>();

    @Column(name = "course_count", nullable = false)
    @Builder.Default
    private Integer courseCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Helper method to add a child category
     * Maintains bidirectional relationship
     */
    public void addChild(Category child) {
        children.add(child);
        child.setParent(this);
    }

    /**
     * Helper method to remove a child category
     * Maintains bidirectional relationship
     */
    public void removeChild(Category child) {
        children.remove(child);
        child.setParent(null);
    }

    /**
     * Helper method to add a course
     * Maintains bidirectional relationship and updates count
     */
    public void addCourse(Course course) {
        courses.add(course);
        course.setCategory(this);
        this.courseCount++;
    }

    /**
     * Helper method to remove a course
     * Maintains bidirectional relationship and updates count
     */
    public void removeCourse(Course course) {
        courses.remove(course);
        course.setCategory(null);
        this.courseCount--;
    }

    /**
     * Check if this is a root category (no parent)
     */
    public boolean isRoot() {
        return parent == null;
    }

    /**
     * Check if this category has children
     */
    public boolean hasChildren() {
        return children != null && !children.isEmpty();
    }

    /**
     * Get the full path of the category (for breadcrumbs)
     * Example: "Programming / Web Development / Frontend"
     */
    public String getFullPath() {
        if (parent == null) {
            return name;
        }
        return parent.getFullPath() + " / " + name;
    }
}

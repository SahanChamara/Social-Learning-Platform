package com.sociallearning.entity;

import com.sociallearning.enums.CourseDifficulty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Course Entity - Represents a course in the Social Learning Platform
 * A course belongs to a creator, has a category, can have multiple tags,
 * and contains multiple modules which contain lessons.
 */
@Entity
@Table(name = "courses", indexes = {
    @Index(name = "idx_courses_slug", columnList = "slug"),
    @Index(name = "idx_courses_creator_id", columnList = "creator_id"),
    @Index(name = "idx_courses_category_id", columnList = "category_id"),
    @Index(name = "idx_courses_published", columnList = "published"),
    @Index(name = "idx_courses_difficulty", columnList = "difficulty"),
    @Index(name = "idx_courses_average_rating", columnList = "averageRating"),
    @Index(name = "idx_courses_enrollment_count", columnList = "enrollmentCount"),
    @Index(name = "idx_courses_created_at", columnList = "createdAt")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"creator", "category", "tags", "modules"})
@EqualsAndHashCode(of = "id")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic Information
    @NotBlank(message = "Course title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank(message = "Slug is required")
    @Size(max = 250, message = "Slug must not exceed 250 characters")
    @Column(unique = true, nullable = false, length = 250)
    private String slug;

    @NotBlank(message = "Course description is required")
    @Size(min = 50, max = 5000, message = "Description must be between 50 and 5000 characters")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Size(max = 1000, message = "Thumbnail URL must not exceed 1000 characters")
    @Column(name = "thumbnail_url", length = 1000)
    private String thumbnailUrl;

    // Relationships
    @NotNull(message = "Course must have a creator")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @NotNull(message = "Course must belong to a category")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "course_tags",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<Module> modules = new ArrayList<>();

    // Metadata
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CourseDifficulty difficulty = CourseDifficulty.BEGINNER;

    @Min(value = 0, message = "Duration must be non-negative")
    @Column(nullable = false)
    @Builder.Default
    private Integer totalDurationMinutes = 0;

    @Size(max = 10, message = "Language code must not exceed 10 characters")
    @Column(nullable = false, length = 10)
    @Builder.Default
    private String language = "en";

    @Column(columnDefinition = "TEXT")
    private String requirements; // Prerequisites or requirements (plain text or JSON array)

    @Column(columnDefinition = "TEXT")
    private String learningOutcomes; // What students will learn (plain text or JSON array)

    // Denormalized Counts and Ratings (for performance)
    @Min(value = 0, message = "Enrollment count cannot be negative")
    @Column(name = "enrollment_count", nullable = false)
    @Builder.Default
    private Integer enrollmentCount = 0;

    @Min(value = 0, message = "Rating count cannot be negative")
    @Column(name = "rating_count", nullable = false)
    @Builder.Default
    private Integer ratingCount = 0;

    @DecimalMin(value = "0.0", message = "Average rating must be between 0 and 5")
    @DecimalMax(value = "5.0", message = "Average rating must be between 0 and 5")
    @Column(name = "average_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Min(value = 0, message = "View count cannot be negative")
    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @Min(value = 0, message = "Comment count cannot be negative")
    @Column(name = "comment_count", nullable = false)
    @Builder.Default
    private Integer commentCount = 0;

    @Min(value = 0, message = "Like count cannot be negative")
    @Column(name = "like_count", nullable = false)
    @Builder.Default
    private Integer likeCount = 0;

    // Status Flags
    @Column(nullable = false)
    @Builder.Default
    private Boolean published = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean draft = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean archived = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean featured = false;

    // Timestamps
    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper Methods

    /**
     * Add a tag to the course
     */
    public void addTag(Tag tag) {
        this.tags.add(tag);
        tag.getCourses().add(this);
    }

    /**
     * Remove a tag from the course
     */
    public void removeTag(Tag tag) {
        this.tags.remove(tag);
        tag.getCourses().remove(this);
    }

    /**
     * Add a module to the course
     */
    public void addModule(Module module) {
        this.modules.add(module);
        module.setCourse(this);
    }

    /**
     * Remove a module from the course
     */
    public void removeModule(Module module) {
        this.modules.remove(module);
        module.setCourse(null);
    }

    /**
     * Publish the course
     */
    public void publish() {
        this.published = true;
        this.draft = false;
        if (this.publishedAt == null) {
            this.publishedAt = LocalDateTime.now();
        }
    }

    /**
     * Unpublish the course (revert to draft)
     */
    public void unpublish() {
        this.published = false;
        this.draft = true;
    }

    /**
     * Archive the course
     */
    public void archive() {
        this.archived = true;
        this.published = false;
    }

    /**
     * Check if the course is ready to be published
     * (has at least one module with lessons)
     */
    public boolean isReadyToPublish() {
        return !modules.isEmpty() && 
               modules.stream().anyMatch(module -> !module.getLessons().isEmpty());
    }

    /**
     * Get the total number of lessons in this course
     */
    public int getTotalLessons() {
        return modules.stream()
                      .mapToInt(module -> module.getLessons().size())
                      .sum();
    }

    /**
     * Check if user is the creator of this course
     */
    public boolean isCreatedBy(User user) {
        return this.creator != null && this.creator.getId().equals(user.getId());
    }

    /**
     * Increment enrollment count
     */
    public void incrementEnrollmentCount() {
        this.enrollmentCount++;
    }

    /**
     * Decrement enrollment count
     */
    public void decrementEnrollmentCount() {
        if (this.enrollmentCount > 0) {
            this.enrollmentCount--;
        }
    }

    /**
     * Increment view count
     */
    public void incrementViewCount() {
        this.viewCount++;
    }
}

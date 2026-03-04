package com.sociallearning.entity;

import com.sociallearning.enums.LessonType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Lesson Entity - Represents a single lesson within a module
 * Supports multiple content types: VIDEO, TEXT, QUIZ, ASSIGNMENT, RESOURCE
 * Each lesson belongs to a module and is ordered by orderIndex
 */
@Entity
@Table(name = "lessons", indexes = {
    @Index(name = "idx_lessons_module_id", columnList = "module_id"),
    @Index(name = "idx_lessons_order_index", columnList = "orderIndex"),
    @Index(name = "idx_lessons_type", columnList = "type"),
    @Index(name = "idx_lessons_published", columnList = "published")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"module"})
@EqualsAndHashCode(of = "id")
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic Information
    @NotBlank(message = "Lesson title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    @Column(nullable = false, length = 200)
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    @Column(columnDefinition = "TEXT")
    private String description;

    // Relationships
    @NotNull(message = "Lesson must belong to a module")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    // Ordering
    @NotNull(message = "Order index is required")
    @Min(value = 0, message = "Order index must be non-negative")
    @Column(nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;

    // Content Type
    @NotNull(message = "Lesson type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private LessonType type = LessonType.TEXT;

    // Duration
    @Min(value = 0, message = "Duration must be non-negative")
    @Column(name = "duration_minutes", nullable = false)
    @Builder.Default
    private Integer durationMinutes = 0;

    // Content Fields (type-specific)
    
    /**
     * For VIDEO type lessons - URL to the video file
     */
    @Size(max = 1000, message = "Video URL must not exceed 1000 characters")
    @Column(name = "video_url", length = 1000)
    private String videoUrl;

    /**
     * For VIDEO type lessons - Thumbnail/poster image URL
     */
    @Size(max = 1000, message = "Video thumbnail URL must not exceed 1000 characters")
    @Column(name = "video_thumbnail_url", length = 1000)
    private String videoThumbnailUrl;

    /**
     * For TEXT type lessons - Rich text content (Markdown or HTML)
     */
    @Column(name = "text_content", columnDefinition = "TEXT")
    private String textContent;

    /**
     * For QUIZ type lessons - Quiz data (JSON format with questions, answers, correct answers)
     */
    @Column(name = "quiz_data", columnDefinition = "TEXT")
    private String quizData;

    /**
     * For ASSIGNMENT type lessons - Assignment instructions
     */
    @Column(name = "assignment_instructions", columnDefinition = "TEXT")
    private String assignmentInstructions;

    /**
     * For ASSIGNMENT type lessons - Max points for grading
     */
    @Min(value = 0, message = "Max points must be non-negative")
    @Column(name = "assignment_max_points")
    private Integer assignmentMaxPoints;

    /**
     * For RESOURCE type lessons - URL to external resource or downloadable file
     */
    @Size(max = 1000, message = "Resource URL must not exceed 1000 characters")
    @Column(name = "resource_url", length = 1000)
    private String resourceUrl;

    /**
     * Additional resources (JSON array of objects with name and url)
     * Example: [{"name": "Slides", "url": "https://..."}, {"name": "Code", "url": "https://..."}]
     */
    @Column(name = "additional_resources", columnDefinition = "TEXT")
    private String additionalResources;

    /**
     * Transcript for video lessons (plain text)
     */
    @Column(columnDefinition = "TEXT")
    private String transcript;

    // Status Flags
    @Column(nullable = false)
    @Builder.Default
    private Boolean published = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isFree = false; // Free preview lessons

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDownloadable = false;

    // Completion tracking
    @Min(value = 0, message = "Completion count cannot be negative")
    @Column(name = "completion_count", nullable = false)
    @Builder.Default
    private Integer completionCount = 0;

    @Min(value = 0, message = "View count cannot be negative")
    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    // Timestamps
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper Methods

    /**
     * Check if this lesson is a video lesson
     */
    public boolean isVideoLesson() {
        return this.type == LessonType.VIDEO;
    }

    /**
     * Check if this lesson is a text lesson
     */
    public boolean isTextLesson() {
        return this.type == LessonType.TEXT;
    }

    /**
     * Check if this lesson is a quiz
     */
    public boolean isQuiz() {
        return this.type == LessonType.QUIZ;
    }

    /**
     * Check if this lesson is an assignment
     */
    public boolean isAssignment() {
        return this.type == LessonType.ASSIGNMENT;
    }

    /**
     * Check if this lesson is a resource
     */
    public boolean isResource() {
        return this.type == LessonType.RESOURCE;
    }

    /**
     * Check if this lesson has content based on its type
     */
    public boolean hasContent() {
        return switch (this.type) {
            case VIDEO -> this.videoUrl != null && !this.videoUrl.isEmpty();
            case TEXT -> this.textContent != null && !this.textContent.isEmpty();
            case QUIZ -> this.quizData != null && !this.quizData.isEmpty();
            case ASSIGNMENT -> this.assignmentInstructions != null && !this.assignmentInstructions.isEmpty();
            case RESOURCE -> this.resourceUrl != null && !this.resourceUrl.isEmpty();
        };
    }

    /**
     * Increment completion count
     */
    public void incrementCompletionCount() {
        this.completionCount++;
    }

    /**
     * Increment view count
     */
    public void incrementViewCount() {
        this.viewCount++;
    }

    /**
     * Get the course this lesson belongs to (through module)
     */
    public Course getCourse() {
        return this.module != null ? this.module.getCourse() : null;
    }

    /**
     * Check if the lesson is ready to be published
     */
    public boolean isReadyToPublish() {
        return hasContent();
    }
}


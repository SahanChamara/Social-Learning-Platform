package com.sociallearning.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Module Entity - Represents a section/module in a course
 * Each module belongs to a course and contains multiple lessons
 * Modules are ordered by orderIndex
 */
@Entity
@Table(name = "modules", indexes = {
    @Index(name = "idx_modules_course_id", columnList = "course_id"),
    @Index(name = "idx_modules_order_index", columnList = "orderIndex")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"course", "lessons"})
@EqualsAndHashCode(of = "id")
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic Information
    @NotBlank(message = "Module title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    @Column(nullable = false, length = 200)
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    @Column(columnDefinition = "TEXT")
    private String description;

    // Relationships
    @NotNull(message = "Module must belong to a course")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<Lesson> lessons = new ArrayList<>();

    // Ordering
    @NotNull(message = "Order index is required")
    @Min(value = 0, message = "Order index must be non-negative")
    @Column(nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;

    // Metadata
    @Min(value = 0, message = "Duration must be non-negative")
    @Column(nullable = false)
    @Builder.Default
    private Integer durationMinutes = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean published = false;

    // Timestamps
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper Methods

    /**
     * Add a lesson to the module
     */
    public void addLesson(Lesson lesson) {
        this.lessons.add(lesson);
        lesson.setModule(this);
    }

    /**
     * Remove a lesson from the module
     */
    public void removeLesson(Lesson lesson) {
        this.lessons.remove(lesson);
        lesson.setModule(null);
    }

    /**
     * Get the total number of lessons in this module
     */
    public int getLessonCount() {
        return lessons.size();
    }

    /**
     * Calculate total duration by summing all lesson durations
     */
    public void calculateDuration() {
        this.durationMinutes = lessons.stream()
                                      .mapToInt(Lesson::getDurationMinutes)
                                      .sum();
    }

    /**
     * Check if the module has any lessons
     */
    public boolean hasLessons() {
        return !lessons.isEmpty();
    }

    /**
     * Get the next available order index for a new lesson
     */
    public int getNextLessonOrderIndex() {
        return lessons.stream()
                      .mapToInt(Lesson::getOrderIndex)
                      .max()
                      .orElse(-1) + 1;
    }

    /**
     * Reorder lessons in the module
     */
    public void reorderLessons() {
        for (int i = 0; i < lessons.size(); i++) {
            lessons.get(i).setOrderIndex(i);
        }
    }
}

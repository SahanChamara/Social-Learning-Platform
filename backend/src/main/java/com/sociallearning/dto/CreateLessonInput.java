package com.sociallearning.dto;

import com.sociallearning.enums.LessonType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Input DTO for creating a lesson.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateLessonInput {
    
    /**
     * Lesson title (required).
     */
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;
    
    /**
     * Lesson description (optional).
     */
    private String description;
    
    /**
     * Content type (required).
     */
    @NotNull(message = "Type is required")
    private com.sociallearning.enums.LessonType type;
    
    /**
     * Duration in minutes (optional).
     */
    @Min(value = 0, message = "Duration must be non-negative")
    private Integer durationMinutes;
    
    /**
     * Whether lesson is free preview (default false).
     */
    private Boolean isFree = false;
}

package com.sociallearning.dto;

import com.sociallearning.enums.CourseDifficulty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Input DTO for creating a course.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCourseInput {
    
    /**
     * Course title (required, 5-200 characters).
     */
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;
    
    /**
     * Course description (required).
     */
    @NotBlank(message = "Description is required")
    @Size(min = 20, message = "Description must be at least 20 characters")
    private String description;
    
    /**
     * Category ID (required).
     */
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    /**
     * Difficulty level (required).
     */
    @NotNull(message = "Difficulty is required")
    private com.sociallearning.enums.CourseDifficulty difficulty;
    
    /**
     * Course language (required).
     */
    @NotBlank(message = "Language is required")
    @Size(max = 50, message = "Language must not exceed 50 characters")
    private String language;
    
    /**
     * Thumbnail URL (optional).
     */
    private String thumbnailUrl;
    
    /**
     * Course requirements (optional).
     */
    private String requirements;
    
    /**
     * Learning outcomes (optional).
     */
    private String learningOutcomes;
    
    /**
     * Price in cents (0 for free, default 0).
     */
    @Min(value = 0, message = "Price must be non-negative")
    private Integer priceInCents = 0;
}

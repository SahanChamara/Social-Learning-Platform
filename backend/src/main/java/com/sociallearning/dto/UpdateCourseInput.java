package com.sociallearning.dto;

import com.sociallearning.enums.CourseDifficulty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Input DTO for updating a course.
 * All fields are optional to allow partial updates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCourseInput {
    
    /**
     * Course title (optional).
     */
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;
    
    /**
     * Course description (optional).
     */
    @Size(min = 20, message = "Description must be at least 20 characters")
    private String description;
    
    /**
     * Category ID (optional).
     */
    private Long categoryId;
    
    /**
     * Difficulty level (optional).
     */
    private CourseDifficulty difficulty;
    
    /**
     * Course language (optional).
     */
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
}

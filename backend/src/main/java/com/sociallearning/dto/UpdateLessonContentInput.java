package com.sociallearning.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Input DTO for updating lesson content.
 * All fields are optional to allow type-specific updates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLessonContentInput {
    
    /**
     * Video URL (for VIDEO type).
     */
    private String videoUrl;
    
    /**
     * Video thumbnail URL.
     */
    private String videoThumbnailUrl;
    
    /**
     * Text content (for TEXT type).
     */
    private String textContent;
    
    /**
     * Quiz data in JSON (for QUIZ type).
     */
    private String quizData;
    
    /**
     * Assignment instructions (for ASSIGNMENT type).
     */
    private String assignmentInstructions;
    
    /**
     * Maximum points for assignment.
     */
    @Min(value = 0, message = "Max points must be non-negative")
    private Integer assignmentMaxPoints;
    
    /**
     * Resource URL (for RESOURCE type).
     */
    private String resourceUrl;
    
    /**
     * Additional resources in JSON array.
     */
    private String additionalResources;
    
    /**
     * Video transcript.
     */
    private String transcript;
    
    /**
     * Whether content is downloadable.
     */
    private Boolean isDownloadable;
}

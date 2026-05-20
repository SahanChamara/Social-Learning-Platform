package com.sociallearning.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
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
    @Size(max = 1000, message = "Video URL must not exceed 1000 characters")
    private String videoUrl;
    
    /**
     * Video thumbnail URL.
     */
    @Size(max = 1000, message = "Video thumbnail URL must not exceed 1000 characters")
    private String videoThumbnailUrl;
    
    /**
     * Text content (for TEXT type).
     */
    @Size(max = 50000, message = "Text content is too long")
    private String textContent;
    
    /**
     * Quiz data in JSON (for QUIZ type).
     */
    @Size(max = 50000, message = "Quiz data is too long")
    private String quizData;
    
    /**
     * Assignment instructions (for ASSIGNMENT type).
     */
    @Size(max = 20000, message = "Assignment instructions are too long")
    private String assignmentInstructions;
    
    /**
     * Maximum points for assignment.
     */
    @Min(value = 0, message = "Max points must be non-negative")
    private Integer assignmentMaxPoints;
    
    /**
     * Resource URL (for RESOURCE type).
     */
    @Size(max = 1000, message = "Resource URL must not exceed 1000 characters")
    private String resourceUrl;
    
    /**
     * Additional resources in JSON array.
     */
    @Size(max = 10000, message = "Additional resources are too long")
    private String additionalResources;
    
    /**
     * Video transcript.
     */
    @Size(max = 50000, message = "Transcript is too long")
    private String transcript;
    
    /**
     * Whether content is downloadable.
     */
    private Boolean isDownloadable;
}

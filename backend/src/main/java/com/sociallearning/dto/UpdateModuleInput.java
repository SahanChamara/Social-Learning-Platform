package com.sociallearning.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Input DTO for updating a module.
 * All fields are optional to allow partial updates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateModuleInput {
    
    /**
     * Module title (optional).
     */
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;
    
    /**
     * Module description (optional).
     */
    private String description;
    
    /**
     * Whether module is published (optional).
     */
    private Boolean isPublished;
}

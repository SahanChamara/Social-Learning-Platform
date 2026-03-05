package com.sociallearning.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Input DTO for creating a module.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateModuleInput {
    
    /**
     * Module title (required).
     */
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;
    
    /**
     * Module description (optional).
     */
    private String description;
}

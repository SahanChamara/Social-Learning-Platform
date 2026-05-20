package com.sociallearning.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Input DTO for user login.
 * Accepts either email or username along with password.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginInput {
    
    /**
     * Email or username for login.
     */
    @NotBlank(message = "Email or username is required")
    @Size(max = 255, message = "Email or username must not exceed 255 characters")
    private String emailOrUsername;
    
    /**
     * Password for authentication.
     */
    @NotBlank(message = "Password is required")
    @Size(max = 255, message = "Password must not exceed 255 characters")
    private String password;
}

package com.sociallearning.dto;

import jakarta.validation.constraints.NotBlank;
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
    private String emailOrUsername;
    
    /**
     * Password for authentication.
     */
    @NotBlank(message = "Password is required")
    private String password;
}

package com.sociallearning.dto;

import com.sociallearning.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication response payload.
 * Contains JWT tokens and user information after successful authentication.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthPayload {
    
    /**
     * JWT access token for API authentication.
     */
    private String token;
    
    /**
     * JWT refresh token for obtaining new access tokens.
     */
    private String refreshToken;
    
    /**
     * Authenticated user information.
     */
    private User user;
}

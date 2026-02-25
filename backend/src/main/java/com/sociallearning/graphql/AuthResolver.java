package com.sociallearning.graphql;

import com.sociallearning.dto.AuthPayload;
import com.sociallearning.dto.LoginInput;
import com.sociallearning.dto.RegisterInput;
import com.sociallearning.entity.User;
import com.sociallearning.security.SecurityUtils;
import com.sociallearning.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

/**
 * GraphQL resolver for authentication operations.
 * 
 * Handles:
 * - User registration
 * - User login
 * - Token refresh
 * - Current user query
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class AuthResolver {

    private final AuthService authService;

    /**
     * Register a new user account.
     * 
     * GraphQL Mutation:
     * mutation Register($input: RegisterInput!) {
     *   register(input: $input) {
     *     token
     *     refreshToken
     *     user {
     *       id
     *       username
     *       email
     *       fullName
     *       role
     *     }
     *   }
     * }
     * 
     * @param input Registration data
     * @return AuthPayload with tokens and user info
     */
    @MutationMapping
    public AuthPayload register(@Argument("input") @Valid RegisterInput input) {
        log.info("GraphQL register mutation called for email: {}", input.getEmail());
        try {
            return authService.register(input);
        } catch (IllegalArgumentException e) {
            log.error("Registration failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during registration", e);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    /**
     * Login with email/username and password.
     * 
     * GraphQL Mutation:
     * mutation Login($input: LoginInput!) {
     *   login(input: $input) {
     *     token
     *     refreshToken
     *     user {
     *       id
     *       username
     *       email
     *       fullName
     *       role
     *     }
     *   }
     * }
     * 
     * @param input Login credentials
     * @return AuthPayload with tokens and user info
     */
    @MutationMapping
    public AuthPayload login(@Argument("input") @Valid LoginInput input) {
        log.info("GraphQL login mutation called for: {}", input.getEmailOrUsername());
        try {
            return authService.login(input);
        } catch (IllegalArgumentException e) {
            log.error("Login failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during login", e);
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    /**
     * Refresh access token using refresh token.
     * 
     * GraphQL Mutation:
     * mutation RefreshToken($refreshToken: String!) {
     *   refreshToken(refreshToken: $refreshToken) {
     *     token
     *     refreshToken
     *     user {
     *       id
     *       username
     *       email
     *     }
     *   }
     * }
     * 
     * @param refreshToken The refresh token
     * @return AuthPayload with new tokens
     */
    @MutationMapping
    public AuthPayload refreshToken(@Argument String refreshToken) {
        log.info("GraphQL refreshToken mutation called");
        try {
            return authService.refreshToken(refreshToken);
        } catch (IllegalArgumentException e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during token refresh", e);
            throw new RuntimeException("Token refresh failed: " + e.getMessage());
        }
    }

    /**
     * Get currently authenticated user.
     * 
     * GraphQL Query:
     * query Me {
     *   me {
     *     id
     *     username
     *     email
     *     fullName
     *     role
     *     bio
     *     avatarUrl
     *     isVerified
     *   }
     * }
     * 
     * @return Current user or null if not authenticated
     */
    @QueryMapping
    public User me() {
        Long userId = SecurityUtils.getCurrentUserId();
        
        if (userId == null) {
            log.debug("No authenticated user found");
            return null;
        }
        
        log.debug("GraphQL me query called for user ID: {}", userId);
        return authService.getUserById(userId);
    }

    /**
     * Get user by ID.
     * 
     * GraphQL Query:
     * query User($id: ID!) {
     *   user(id: $id) {
     *     id
     *     username
     *     fullName
     *     bio
     *     avatarUrl
     *     role
     *     isVerified
     *   }
     * }
     * 
     * @param id User ID
     * @return User entity
     */
    @QueryMapping
    public User user(@Argument String id) {
        log.debug("GraphQL user query called for ID: {}", id);
        return authService.getUserById(Long.parseLong(id));
    }
}

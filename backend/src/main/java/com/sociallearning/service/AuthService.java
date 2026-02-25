package com.sociallearning.service;

import com.sociallearning.dto.AuthPayload;
import com.sociallearning.dto.LoginInput;
import com.sociallearning.dto.RegisterInput;
import com.sociallearning.entity.User;
import com.sociallearning.repository.UserRepository;
import com.sociallearning.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service for handling authentication operations.
 * 
 * Provides business logic for:
 * - User registration
 * - User login
 * - Token refresh
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Register a new user.
     * 
     * @param input Registration input data
     * @return AuthPayload with tokens and user info
     * @throws IllegalArgumentException if username or email already exists
     */
    @Transactional
    public AuthPayload register(RegisterInput input) {
        log.info("Attempting to register user with email: {}", input.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(input.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        
        // Check if username already exists
        if (userRepository.existsByUsername(input.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }
        
        // Create new user
        User user = User.builder()
                .username(input.getUsername())
                .email(input.getEmail())
                .passwordHash(passwordEncoder.encode(input.getPassword()))
                .fullName(input.getFullName())
                .role(User.UserRole.LEARNER) // Default role
                .isVerified(false)
                .isActive(true)
                .build();
        
        // Save user to database
        user = userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());
        
        // Update last login
        user.updateLastLogin();
        userRepository.save(user);
        
        // Generate tokens
        String token = jwtTokenProvider.generateToken(
                user.getId(), 
                user.getEmail(), 
                user.getRole().name()
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        
        // Return authentication payload
        return AuthPayload.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(user)
                .build();
    }

    /**
     * Authenticate user with email/username and password.
     * 
     * @param input Login input data
     * @return AuthPayload with tokens and user info
     * @throws IllegalArgumentException if credentials are invalid
     */
    @Transactional
    public AuthPayload login(LoginInput input) {
        log.info("Attempting login for: {}", input.getEmailOrUsername());
        
        // Find user by email or username
        User user = userRepository.findByEmail(input.getEmailOrUsername())
                .or(() -> userRepository.findByUsername(input.getEmailOrUsername()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        
        // Check if account is active
        if (!user.getIsActive()) {
            throw new IllegalArgumentException("Account is deactivated");
        }
        
        // Verify password
        if (!passwordEncoder.matches(input.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        
        log.info("Login successful for user: {}", user.getEmail());
        
        // Update last login timestamp
        user.updateLastLogin();
        userRepository.save(user);
        
        // Generate tokens
        String token = jwtTokenProvider.generateToken(
                user.getId(), 
                user.getEmail(), 
                user.getRole().name()
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        
        // Return authentication payload
        return AuthPayload.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(user)
                .build();
    }

    /**
     * Refresh access token using refresh token.
     * 
     * @param refreshToken The refresh token
     * @return AuthPayload with new tokens
     * @throws IllegalArgumentException if refresh token is invalid
     */
    @Transactional
    public AuthPayload refreshToken(String refreshToken) {
        log.info("Attempting to refresh token");
        
        // Validate refresh token
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        
        // Extract user ID from token
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        
        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Check if account is active
        if (!user.getIsActive()) {
            throw new IllegalArgumentException("Account is deactivated");
        }
        
        log.info("Token refreshed for user: {}", user.getEmail());
        
        // Generate new tokens
        String newToken = jwtTokenProvider.generateToken(
                user.getId(), 
                user.getEmail(), 
                user.getRole().name()
        );
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        
        // Return authentication payload
        return AuthPayload.builder()
                .token(newToken)
                .refreshToken(newRefreshToken)
                .user(user)
                .build();
    }

    /**
     * Get user by ID.
     * 
     * @param userId The user ID
     * @return User entity
     * @throws IllegalArgumentException if user not found
     */
    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}

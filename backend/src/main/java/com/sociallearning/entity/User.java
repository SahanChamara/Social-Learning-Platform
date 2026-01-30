package com.sociallearning.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * User Entity - Represents a user in the Social Learning Platform
 * Supports multiple roles: LEARNER, CREATOR, ADMIN
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email"),
    @Index(name = "idx_users_username", columnList = "username"),
    @Index(name = "idx_users_role", columnList = "role"),
    @Index(name = "idx_users_created_at", columnList = "createdAt")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"passwordHash"})
@EqualsAndHashCode(of = "id")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    @Column(unique = true, nullable = false, length = 255)
    private String email;

    @NotBlank(message = "Password is required")
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Size(max = 500, message = "Avatar URL must not exceed 500 characters")
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserRole role = UserRole.LEARNER;

    @Size(max = 255, message = "Expertise must not exceed 255 characters")
    @Column(length = 255)
    private String expertise; // Comma-separated or JSON for multiple areas

    @Size(max = 500, message = "Website URL must not exceed 500 characters")
    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Size(max = 500, message = "GitHub URL must not exceed 500 characters")
    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Size(max = 500, message = "LinkedIn URL must not exceed 500 characters")
    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Size(max = 500, message = "Twitter URL must not exceed 500 characters")
    @Column(name = "twitter_url", length = 500)
    private String twitterUrl;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // NOTE: Relationships will be added in later phases when the related entities are created
    // Phase 2: Course, Module, Lesson entities
    // Phase 3: Enrollment, Progress entities
    // Phase 4: Comment, Like, Rating, Bookmark entities
    // Phase 6: Achievement, LearningStreak, Notification entities
    
    /**
     * User roles in the system
     */
    public enum UserRole {
        LEARNER,   // Regular user who takes courses
        CREATOR,   // User who can create and publish courses
        ADMIN      // System administrator with full access
    }

    /**
     * Convenience methods
     */
    public boolean isCreator() {
        return role == UserRole.CREATOR || role == UserRole.ADMIN;
    }

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }

    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }
}

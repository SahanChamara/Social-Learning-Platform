package com.sociallearning.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility class for security-related operations.
 * 
 * Provides helper methods to access authenticated user information
 * from the Spring Security context.
 */
public class SecurityUtils {

    private SecurityUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Get the ID of the currently authenticated user.
     * 
     * @return User ID or null if not authenticated
     */
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() 
                && authentication.getPrincipal() instanceof Long) {
            return (Long) authentication.getPrincipal();
        }
        
        return null;
    }

    /**
     * Check if the current user is authenticated.
     * 
     * @return true if user is authenticated, false otherwise
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() 
                && !(authentication.getPrincipal() instanceof String);
    }

    /**
     * Check if the current user has a specific role.
     * 
     * @param role The role to check (e.g., "ADMIN", "CREATOR")
     * @return true if user has the role, false otherwise
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
        }
        
        return false;
    }

    /**
     * Get the Authentication object from SecurityContext.
     * 
     * @return Authentication or null if not authenticated
     */
    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }
}

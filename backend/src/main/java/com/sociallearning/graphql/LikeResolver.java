package com.sociallearning.graphql;

import com.sociallearning.enums.LikeableType;
import com.sociallearning.security.SecurityUtils;
import com.sociallearning.service.LikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

/**
 * GraphQL resolver for like operations.
 * 
 * Handles:
 * - Toggle like on courses, lessons, and comments
 * - Query like status and counts
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class LikeResolver {

    private final LikeService likeService;

    // ============================================
    // Mutations
    // ============================================

    /**
     * Toggle like on a course, lesson, or comment.
     * If already liked, removes the like. If not liked, adds a like.
     * 
     * GraphQL Mutation:
     * mutation ToggleLike($targetType: LikeableType!, $targetId: ID!) {
     *   toggleLike(targetType: $targetType, targetId: $targetId) {
     *     liked
     *     likeCount
     *   }
     * }
     */
    @MutationMapping
    public Map<String, Object> toggleLike(
            @Argument String targetType,
            @Argument Long targetId) {
        
        Long userId = requireAuthentication();
        
        log.info("GraphQL toggleLike mutation: userId={}, targetType={}, targetId={}", 
                userId, targetType, targetId);
        
        LikeableType type = LikeableType.valueOf(targetType);
        boolean isLiked = likeService.toggleLike(userId, type, targetId);
        long likeCount = likeService.getLikeCount(type, targetId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("liked", isLiked);
        result.put("likeCount", likeCount);
        
        log.info("Toggle like result: liked={}, likeCount={}", isLiked, likeCount);
        return result;
    }

    // ============================================
    // Queries
    // ============================================

    /**
     * Check if the current user has liked a specific target.
     * 
     * GraphQL Query:
     * query HasLiked($targetType: LikeableType!, $targetId: ID!) {
     *   hasLiked(targetType: $targetType, targetId: $targetId)
     * }
     */
    @QueryMapping
    public boolean hasLiked(
            @Argument String targetType,
            @Argument Long targetId) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return false;
        }
        
        log.debug("GraphQL hasLiked query: userId={}, targetType={}, targetId={}", 
                userId, targetType, targetId);
        
        LikeableType type = LikeableType.valueOf(targetType);
        return likeService.hasUserLiked(userId, type, targetId);
    }

    /**
     * Get the like count for a specific target.
     * 
     * GraphQL Query:
     * query LikeCount($targetType: LikeableType!, $targetId: ID!) {
     *   likeCount(targetType: $targetType, targetId: $targetId)
     * }
     */
    @QueryMapping
    public long likeCount(
            @Argument String targetType,
            @Argument Long targetId) {
        
        log.debug("GraphQL likeCount query: targetType={}, targetId={}", targetType, targetId);
        
        LikeableType type = LikeableType.valueOf(targetType);
        return likeService.getLikeCount(type, targetId);
    }

    // ============================================
    // Helper Methods
    // ============================================

    private Long requireAuthentication() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new IllegalArgumentException("Authentication required");
        }
        return userId;
    }
}

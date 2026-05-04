package com.sociallearning.graphql;

import com.sociallearning.entity.Achievement;
import com.sociallearning.entity.LearningStreak;
import com.sociallearning.entity.User;
import com.sociallearning.entity.UserAchievement;
import com.sociallearning.security.SecurityUtils;
import com.sociallearning.service.AchievementService;
import com.sociallearning.service.StreakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * GraphQL resolver for gamification queries and user-achievement field resolution.
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class GamificationResolver {

    private final AchievementService achievementService;
    private final StreakService streakService;

    @QueryMapping
    public List<Achievement> achievements() {
        log.info("GraphQL query: achievements()");
        return achievementService.getActiveAchievements();
    }

    @QueryMapping
    public List<UserAchievement> myAchievements() {
        Long userId = requireAuthentication();
        log.info("GraphQL query: myAchievements(userId={})", userId);

        achievementService.checkAchievements(userId, "QUERY_MY_ACHIEVEMENTS");
        return achievementService.getUserAchievements(userId);
    }

    @QueryMapping
    public LearningStreak learningStreak() {
        Long userId = requireAuthentication();
        log.info("GraphQL query: learningStreak(userId={})", userId);
        return streakService.getCurrentStreak(userId);
    }

    @SchemaMapping(typeName = "User", field = "achievements")
    public List<UserAchievement> userAchievements(User user) {
        if (user == null || user.getId() == null) {
            return List.of();
        }
        return achievementService.getUserAchievements(user.getId());
    }

    private Long requireAuthentication() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new IllegalArgumentException("Authentication required");
        }
        return userId;
    }
}

package com.sociallearning.repository;

import com.sociallearning.entity.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for UserAchievement entity.
 */
@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {

    Optional<UserAchievement> findByUserIdAndAchievementId(Long userId, Long achievementId);

    List<UserAchievement> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndIsUnlockedTrue(Long userId);
}

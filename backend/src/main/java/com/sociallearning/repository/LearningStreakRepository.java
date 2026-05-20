package com.sociallearning.repository;

import com.sociallearning.entity.LearningStreak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for LearningStreak entity.
 */
@Repository
public interface LearningStreakRepository extends JpaRepository<LearningStreak, Long> {

    Optional<LearningStreak> findByUserId(Long userId);
}

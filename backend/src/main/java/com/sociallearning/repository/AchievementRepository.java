package com.sociallearning.repository;

import com.sociallearning.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Achievement entity.
 */
@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {

    Optional<Achievement> findBySlug(String slug);

    List<Achievement> findByIsActiveTrue();
}

package com.sociallearning.repository;

import com.sociallearning.entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Progress entity.
 *
 * Supports lesson-level progress tracking for each enrollment.
 */
@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {

    Optional<Progress> findByEnrollmentIdAndLessonId(Long enrollmentId, Long lessonId);

    boolean existsByEnrollmentIdAndLessonId(Long enrollmentId, Long lessonId);

    List<Progress> findByEnrollmentId(Long enrollmentId);

    @Query("SELECT p FROM Progress p " +
           "JOIN FETCH p.lesson l " +
           "JOIN FETCH l.module m " +
           "WHERE p.enrollment.id = :enrollmentId " +
           "ORDER BY m.orderIndex ASC, l.orderIndex ASC")
    List<Progress> findByEnrollmentIdWithLessonDetails(@Param("enrollmentId") Long enrollmentId);

    @Query("SELECT p FROM Progress p " +
           "JOIN p.lesson l " +
           "JOIN l.module m " +
           "WHERE p.enrollment.id = :enrollmentId AND p.completed = false " +
           "ORDER BY m.orderIndex ASC, l.orderIndex ASC")
    List<Progress> findIncompleteProgressByEnrollmentId(@Param("enrollmentId") Long enrollmentId);

    List<Progress> findByUserId(Long userId);

    List<Progress> findByUserIdAndCompletedTrue(Long userId);

    long countByEnrollmentId(Long enrollmentId);

    long countByEnrollmentIdAndCompletedTrue(Long enrollmentId);

    @Query("SELECT COALESCE(SUM(p.watchTimeSeconds), 0) FROM Progress p WHERE p.enrollment.id = :enrollmentId")
    Integer getTotalWatchTimeByEnrollmentId(@Param("enrollmentId") Long enrollmentId);

    @Query("SELECT COALESCE(SUM(p.watchTimeSeconds), 0) FROM Progress p WHERE p.user.id = :userId")
    Integer getTotalWatchTimeByUserId(@Param("userId") Long userId);

    void deleteByEnrollmentId(Long enrollmentId);
}

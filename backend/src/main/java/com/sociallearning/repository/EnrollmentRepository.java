package com.sociallearning.repository;

import com.sociallearning.entity.Enrollment;
import com.sociallearning.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Enrollment entity.
 *
 * Provides enrollment lookups for duplicate checks, dashboards, and progress aggregation.
 */
@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    List<Enrollment> findByUserIdOrderByEnrolledAtDesc(Long userId);

    List<Enrollment> findByUserIdAndStatusOrderByEnrolledAtDesc(Long userId, EnrollmentStatus status);

    @Query("SELECT e FROM Enrollment e LEFT JOIN FETCH e.course WHERE e.user.id = :userId ORDER BY e.enrolledAt DESC")
    List<Enrollment> findByUserIdWithCourse(@Param("userId") Long userId);

    @Query("SELECT e FROM Enrollment e LEFT JOIN FETCH e.progressRecords WHERE e.id = :id")
    Optional<Enrollment> findByIdWithProgress(@Param("id") Long id);

    long countByCourseId(Long courseId);

    long countByCourseIdAndStatus(Long courseId, EnrollmentStatus status);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.user.id = :userId AND e.status = 'COMPLETED'")
    long countCompletedCoursesByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(AVG(e.progressPercentage), 0) FROM Enrollment e WHERE e.user.id = :userId")
    Double getAverageProgressByUserId(@Param("userId") Long userId);

    void deleteByUserIdAndCourseId(Long userId, Long courseId);
}

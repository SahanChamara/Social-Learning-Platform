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

    @Query("SELECT e FROM Enrollment e " +
           "LEFT JOIN FETCH e.course c " +
           "LEFT JOIN FETCH c.category " +
           "LEFT JOIN FETCH c.creator " +
           "WHERE e.user.id = :userId " +
           "ORDER BY e.enrolledAt DESC")
    List<Enrollment> findByUserIdWithCourseDetails(@Param("userId") Long userId);

    @Query("SELECT e FROM Enrollment e LEFT JOIN FETCH e.progressRecords WHERE e.id = :id")
    Optional<Enrollment> findByIdWithProgress(@Param("id") Long id);

    @Query(value = """
            SELECT e2.course_id
            FROM enrollments e1
            JOIN enrollments e2 ON e1.user_id = e2.user_id
            JOIN courses c2 ON c2.id = e2.course_id
            WHERE e1.user_id <> :userId
              AND e1.course_id IN (:seedCourseIds)
              AND e2.course_id NOT IN (:seedCourseIds)
              AND c2.published = true
              AND c2.archived = false
            GROUP BY e2.course_id
            ORDER BY COUNT(*) DESC, MAX(c2.average_rating) DESC, MAX(c2.enrollment_count) DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Long> findCollaborativeRecommendedCourseIds(@Param("userId") Long userId,
                                                     @Param("seedCourseIds") List<Long> seedCourseIds,
                                                     @Param("limit") int limit);

    long countByCourseId(Long courseId);

    long countByCourseIdAndStatus(Long courseId, EnrollmentStatus status);

    long countByUserId(Long userId);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.user.id = :userId AND e.status = 'COMPLETED'")
    long countCompletedCoursesByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(AVG(e.progressPercentage), 0) FROM Enrollment e WHERE e.user.id = :userId")
    Double getAverageProgressByUserId(@Param("userId") Long userId);

    void deleteByUserIdAndCourseId(Long userId, Long courseId);
}

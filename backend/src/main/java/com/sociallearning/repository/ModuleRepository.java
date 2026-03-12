package com.sociallearning.repository;

import com.sociallearning.entity.Course;
import com.sociallearning.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Module entity
 * Provides data access methods for course modules
 */
@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {

    /**
     * Find all modules for a specific course, ordered by orderIndex
     * @param course The course entity
     * @return List of modules
     */
    List<Module> findByCourseOrderByOrderIndexAsc(Course course);

    /**
     * Find all modules for a course by course ID
     * @param courseId The course ID
     * @return List of modules ordered by index
     */
    @Query("SELECT m FROM Module m WHERE m.course.id = :courseId ORDER BY m.orderIndex ASC")
    List<Module> findByCourseIdOrderByOrderIndex(@Param("courseId") Long courseId);

    /**
     * Find published modules for a course
     * @param courseId The course ID
     * @return List of published modules
     */
    @Query("SELECT m FROM Module m WHERE m.course.id = :courseId AND m.published = true ORDER BY m.orderIndex ASC")
    List<Module> findPublishedModulesByCourseId(@Param("courseId") Long courseId);

    /**
     * Find a module by ID with lessons eagerly loaded
     * @param id The module ID
     * @return Optional module with lessons
     */
    @Query("SELECT m FROM Module m LEFT JOIN FETCH m.lessons WHERE m.id = :id")
    Optional<Module> findByIdWithLessons(@Param("id") Long id);

    /**
     * Find all modules with their lessons for a course
     * @param courseId The course ID
     * @return List of modules with lessons loaded
     */
    @Query("SELECT DISTINCT m FROM Module m LEFT JOIN FETCH m.lessons WHERE m.course.id = :courseId ORDER BY m.orderIndex ASC")
    List<Module> findByCourseIdWithLessons(@Param("courseId") Long courseId);

    /**
     * Count modules in a course
     * @param courseId The course ID
     * @return Number of modules
     */
    long countByCourseId(Long courseId);

    /**
     * Count published modules in a course
     * @param courseId The course ID
     * @return Number of published modules
     */
    @Query("SELECT COUNT(m) FROM Module m WHERE m.course.id = :courseId AND m.published = true")
    long countPublishedModulesByCourseId(@Param("courseId") Long courseId);

    /**
     * Find modules by title containing search term (case-insensitive)
     * @param searchTerm The search term
     * @param courseId The course ID
     * @return List of matching modules
     */
    @Query("SELECT m FROM Module m WHERE m.course.id = :courseId AND LOWER(m.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY m.orderIndex ASC")
    List<Module> searchModulesByTitle(@Param("courseId") Long courseId, @Param("searchTerm") String searchTerm);

    /**
     * Delete all modules for a course
     * @param courseId The course ID
     */
    void deleteByCourseId(Long courseId);

    /**
     * Check if a module exists in a course
     * @param id Module ID
     * @param courseId Course ID
     * @return true if module exists in the course
     */
    @Query("SELECT COUNT(m) > 0 FROM Module m WHERE m.id = :id AND m.course.id = :courseId")
    boolean existsByIdAndCourseId(@Param("id") Long id, @Param("courseId") Long courseId);

    /**
     * Get the maximum order index for modules in a course
     * @param courseId The course ID
     * @return Maximum order index, or 0 if no modules exist
     */
    @Query("SELECT COALESCE(MAX(m.orderIndex), 0) FROM Module m WHERE m.course.id = :courseId")
    int getMaxOrderIndex(@Param("courseId") Long courseId);

    /**
     * Find all published modules
     * @return List of all published modules
     */
    List<Module> findByPublishedTrue();

    /**
     * Calculate total duration of all modules in a course
     * @param courseId The course ID
     * @return Total duration in minutes
     */
    @Query("SELECT COALESCE(SUM(m.durationMinutes), 0) FROM Module m WHERE m.course.id = :courseId")
    int getTotalDurationByCourseId(@Param("courseId") Long courseId);
}

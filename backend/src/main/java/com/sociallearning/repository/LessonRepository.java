package com.sociallearning.repository;

import com.sociallearning.entity.Lesson;
import com.sociallearning.entity.LessonType;
import com.sociallearning.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Lesson entity
 * Provides data access methods for course lessons
 */
@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    /**
     * Find all lessons for a specific module, ordered by orderIndex
     * @param module The module entity
     * @return List of lessons
     */
    List<Lesson> findByModuleOrderByOrderIndexAsc(Module module);

    /**
     * Find all lessons for a module by module ID
     * @param moduleId The module ID
     * @return List of lessons ordered by index
     */
    @Query("SELECT l FROM Lesson l WHERE l.module.id = :moduleId ORDER BY l.orderIndex ASC")
    List<Lesson> findByModuleIdOrderByOrderIndex(@Param("moduleId") Long moduleId);

    /**
     * Find published lessons for a module
     * @param moduleId The module ID
     * @return List of published lessons
     */
    @Query("SELECT l FROM Lesson l WHERE l.module.id = :moduleId AND l.published = true ORDER BY l.orderIndex ASC")
    List<Lesson> findPublishedLessonsByModuleId(@Param("moduleId") Long moduleId);

    /**
     * Find free preview lessons for a course
     * @param courseId The course ID
     * @return List of free lessons
     */
    @Query("SELECT l FROM Lesson l WHERE l.module.course.id = :courseId AND l.isFree = true AND l.published = true ORDER BY l.module.orderIndex ASC, l.orderIndex ASC")
    List<Lesson> findFreeLessonsByCourseId(@Param("courseId") Long courseId);

    /**
     * Find lessons by type in a module
     * @param moduleId The module ID
     * @param type The lesson type
     * @return List of lessons of the specified type
     */
    @Query("SELECT l FROM Lesson l WHERE l.module.id = :moduleId AND l.type = :type ORDER BY l.orderIndex ASC")
    List<Lesson> findByModuleIdAndType(@Param("moduleId") Long moduleId, @Param("type") LessonType type);

    /**
     * Find all lessons for a course (across all modules)
     * @param courseId The course ID
     * @return List of all lessons in the course
     */
    @Query("SELECT l FROM Lesson l WHERE l.module.course.id = :courseId ORDER BY l.module.orderIndex ASC, l.orderIndex ASC")
    List<Lesson> findByCourseId(@Param("courseId") Long courseId);

    /**
     * Find published lessons for a course
     * @param courseId The course ID
     * @return List of published lessons
     */
    @Query("SELECT l FROM Lesson l WHERE l.module.course.id = :courseId AND l.published = true ORDER BY l.module.orderIndex ASC, l.orderIndex ASC")
    List<Lesson> findPublishedLessonsByCourseId(@Param("courseId") Long courseId);

    /**
     * Count lessons in a module
     * @param moduleId The module ID
     * @return Number of lessons
     */
    long countByModuleId(Long moduleId);

    /**
     * Count published lessons in a module
     * @param moduleId The module ID
     * @return Number of published lessons
     */
    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.module.id = :moduleId AND l.published = true")
    long countPublishedLessonsByModuleId(@Param("moduleId") Long moduleId);

    /**
     * Count total lessons in a course (across all modules)
     * @param courseId The course ID
     * @return Total number of lessons
     */
    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.module.course.id = :courseId")
    long countByCourseId(@Param("courseId") Long courseId);

    /**
     * Find lessons by title containing search term (case-insensitive)
     * @param searchTerm The search term
     * @param moduleId The module ID
     * @return List of matching lessons
     */
    @Query("SELECT l FROM Lesson l WHERE l.module.id = :moduleId AND LOWER(l.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY l.orderIndex ASC")
    List<Lesson> searchLessonsByTitle(@Param("moduleId") Long moduleId, @Param("searchTerm") String searchTerm);

    /**
     * Find the next lesson after the current one in the module
     * @param moduleId The module ID
     * @param currentOrderIndex Current lesson's order index
     * @return Optional next lesson
     */
    @Query("SELECT l FROM Lesson l WHERE l.module.id = :moduleId AND l.orderIndex > :currentOrderIndex AND l.published = true ORDER BY l.orderIndex ASC LIMIT 1")
    Optional<Lesson> findNextLesson(@Param("moduleId") Long moduleId, @Param("currentOrderIndex") Integer currentOrderIndex);

    /**
     * Find the previous lesson before the current one in the module
     * @param moduleId The module ID
     * @param currentOrderIndex Current lesson's order index
     * @return Optional previous lesson
     */
    @Query("SELECT l FROM Lesson l WHERE l.module.id = :moduleId AND l.orderIndex < :currentOrderIndex AND l.published = true ORDER BY l.orderIndex DESC LIMIT 1")
    Optional<Lesson> findPreviousLesson(@Param("moduleId") Long moduleId, @Param("currentOrderIndex") Integer currentOrderIndex);

    /**
     * Delete all lessons for a module
     * @param moduleId The module ID
     */
    void deleteByModuleId(Long moduleId);

    /**
     * Check if a lesson exists in a module
     * @param id Lesson ID
     * @param moduleId Module ID
     * @return true if lesson exists in the module
     */
    @Query("SELECT COUNT(l) > 0 FROM Lesson l WHERE l.id = :id AND l.module.id = :moduleId")
    boolean existsByIdAndModuleId(@Param("id") Long id, @Param("moduleId") Long moduleId);

    /**
     * Get the maximum order index for lessons in a module
     * @param moduleId The module ID
     * @return Maximum order index, or 0 if no lessons exist
     */
    @Query("SELECT COALESCE(MAX(l.orderIndex), 0) FROM Lesson l WHERE l.module.id = :moduleId")
    int getMaxOrderIndex(@Param("moduleId") Long moduleId);

    /**
     * Find all published lessons
     * @return List of all published lessons
     */
    List<Lesson> findByPublishedTrue();

    /**
     * Find all free preview lessons
     * @return List of all free lessons
     */
    @Query("SELECT l FROM Lesson l WHERE l.isFree = true AND l.published = true")
    List<Lesson> findAllFreeLessons();

    /**
     * Find downloadable lessons in a course
     * @param courseId The course ID
     * @return List of downloadable lessons
     */
    @Query("SELECT l FROM Lesson l WHERE l.module.course.id = :courseId AND l.isDownloadable = true AND l.published = true")
    List<Lesson> findDownloadableLessonsByCourseId(@Param("courseId") Long courseId);

    /**
     * Calculate total duration of all lessons in a module
     * @param moduleId The module ID
     * @return Total duration in minutes
     */
    @Query("SELECT COALESCE(SUM(l.durationMinutes), 0) FROM Lesson l WHERE l.module.id = :moduleId")
    int getTotalDurationByModuleId(@Param("moduleId") Long moduleId);

    /**
     * Calculate total duration of all lessons in a course
     * @param courseId The course ID
     * @return Total duration in minutes
     */
    @Query("SELECT COALESCE(SUM(l.durationMinutes), 0) FROM Lesson l WHERE l.module.course.id = :courseId")
    int getTotalDurationByCourseId(@Param("courseId") Long courseId);

    /**
     * Find video lessons in a course
     * @param courseId The course ID
     * @return List of video lessons
     */
    @Query("SELECT l FROM Lesson l WHERE l.module.course.id = :courseId AND l.type = 'VIDEO' AND l.published = true ORDER BY l.module.orderIndex ASC, l.orderIndex ASC")
    List<Lesson> findVideoLessonsByCourseId(@Param("courseId") Long courseId);

    /**
     * Find quiz lessons in a course
     * @param courseId The course ID
     * @return List of quiz lessons
     */
    @Query("SELECT l FROM Lesson l WHERE l.module.course.id = :courseId AND l.type = 'QUIZ' AND l.published = true ORDER BY l.module.orderIndex ASC, l.orderIndex ASC")
    List<Lesson> findQuizLessonsByCourseId(@Param("courseId") Long courseId);

    /**
     * Get lessons with most completions (popular lessons)
     * @param limit Number of results to return
     * @return List of popular lessons
     */
    @Query("SELECT l FROM Lesson l WHERE l.published = true ORDER BY l.completionCount DESC LIMIT :limit")
    List<Lesson> findTopCompletedLessons(@Param("limit") int limit);

    /**
     * Get lessons with most views
     * @param limit Number of results to return
     * @return List of most viewed lessons
     */
    @Query("SELECT l FROM Lesson l WHERE l.published = true ORDER BY l.viewCount DESC LIMIT :limit")
    List<Lesson> findTopViewedLessons(@Param("limit") int limit);
}

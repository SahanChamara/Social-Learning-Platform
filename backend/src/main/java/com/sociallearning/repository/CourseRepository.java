package com.sociallearning.repository;

import com.sociallearning.entity.Category;
import com.sociallearning.entity.Course;
import com.sociallearning.entity.User;
import com.sociallearning.enums.CourseDifficulty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Course entity
 * Provides data access methods for courses with advanced querying capabilities
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    /**
     * Find a course by slug (for SEO-friendly URLs)
     * @param slug The course slug
     * @return Optional course
     */
    Optional<Course> findBySlug(String slug);

    Optional<Course> findCourseById(Long Id);

    /**
     * Check if a course with the given slug exists
     * @param slug The course slug
     * @return true if exists
     */
    boolean existsBySlug(String slug);

    /**
     * Find a course by slug with creator eagerly loaded
     * @param slug The course slug
     * @return Optional course with creator
     */
    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.creator WHERE c.slug = :slug")
    Optional<Course> findBySlugWithCreator(@Param("slug") String slug);

    /**
     * Find a course by slug with all relationships loaded
     * @param slug The course slug
     * @return Optional course with creator, category, tags, modules
     */
    @Query("SELECT DISTINCT c FROM Course c " +
           "LEFT JOIN FETCH c.creator " +
           "LEFT JOIN FETCH c.category " +
           "LEFT JOIN FETCH c.tags " +
           "LEFT JOIN FETCH c.modules " +
           "WHERE c.slug = :slug")
    Optional<Course> findBySlugWithDetails(@Param("slug") String slug);

    /**
     * Find all courses by a specific creator
     * @param creator The user who created the courses
     * @return List of courses
     */
    List<Course> findByCreator(User creator);

    /**
     * Find courses by creator ID
     * @param creatorId The creator's user ID
     * @return List of courses
     */
    List<Course> findByCreatorId(Long creatorId);

    /**
     * Find published courses by creator ID
     * @param creatorId The creator's user ID
     * @return List of published courses
     */
    @Query("SELECT c FROM Course c WHERE c.creator.id = :creatorId AND c.published = true ORDER BY c.createdAt DESC")
    List<Course> findPublishedCoursesByCreatorId(@Param("creatorId") Long creatorId);

    /**
     * Find all published courses
     * @return List of published courses
     */
    List<Course> findByPublishedTrue();

    /**
     * Find all published courses with pagination
     * @param pageable Pagination parameters
     * @return Page of published courses
     */
    Page<Course> findByPublishedTrue(Pageable pageable);

    /**
     * Find courses by category
     * @param category The category
     * @return List of courses
     */
    List<Course> findByCategory(Category category);

    /**
     * Find published courses by category
     * @param categoryId The category ID
     * @param pageable Pagination parameters
     * @return Page of courses
     */
    @Query("SELECT c FROM Course c WHERE c.category.id = :categoryId AND c.published = true ORDER BY c.createdAt DESC")
    Page<Course> findPublishedCoursesByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    /**
     * Find courses by difficulty level
     * @param difficulty The difficulty level
     * @param pageable Pagination parameters
     * @return Page of courses
     */
    @Query("SELECT c FROM Course c WHERE c.difficulty = :difficulty AND c.published = true ORDER BY c.averageRating DESC")
    Page<Course> findByDifficulty(@Param("difficulty") com.sociallearning.enums.CourseDifficulty difficulty, Pageable pageable);

    /**
     * Find courses by language
     * @param language The language code (e.g., "en", "es")
     * @param pageable Pagination parameters
     * @return Page of courses
     */
    @Query("SELECT c FROM Course c WHERE c.language = :language AND c.published = true ORDER BY c.createdAt DESC")
    Page<Course> findByLanguage(@Param("language") String language, Pageable pageable);

    /**
     * Search courses by title or description (case-insensitive)
     * @param searchTerm The search term
     * @param pageable Pagination parameters
     * @return Page of matching courses
     */
    @Query("SELECT c FROM Course c WHERE c.published = true AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY c.averageRating DESC, c.enrollmentCount DESC")
    Page<Course> searchCourses(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Find courses by multiple filters
     * @param categoryId Optional category ID
     * @param difficulty Optional difficulty level
     * @param language Optional language
     * @param minRating Minimum average rating
     * @param pageable Pagination parameters
     * @return Page of filtered courses
     */
    @Query("SELECT c FROM Course c WHERE c.published = true " +
           "AND (:categoryId IS NULL OR c.category.id = :categoryId) " +
           "AND (:difficulty IS NULL OR c.difficulty = :difficulty) " +
           "AND (:language IS NULL OR c.language = :language) " +
           "AND c.averageRating >= :minRating " +
           "ORDER BY c.averageRating DESC, c.enrollmentCount DESC")
    Page<Course> findCoursesWithFilters(
        @Param("categoryId") Long categoryId,
        @Param("difficulty") CourseDifficulty difficulty,
        @Param("language") String language,
        @Param("minRating") Double minRating,
        Pageable pageable
    );

    /**
     * Find featured courses
     * @return List of featured courses
     */
    @Query("SELECT c FROM Course c WHERE c.featured = true AND c.published = true ORDER BY c.averageRating DESC")
    List<Course> findFeaturedCourses();

    /**
     * Find trending courses (most enrollments in recent period)
     * @param limit Number of courses to return
     * @return List of trending courses
     */
    @Query("SELECT c FROM Course c WHERE c.published = true ORDER BY c.enrollmentCount DESC, c.viewCount DESC LIMIT :limit")
    List<Course> findTrendingCourses(@Param("limit") int limit);

    /**
     * Find popular courses (highest rated with minimum enrollments)
     * @param minEnrollments Minimum enrollment count
     * @param limit Number of courses to return
     * @return List of popular courses
     */
    @Query("SELECT c FROM Course c WHERE c.published = true AND c.enrollmentCount >= :minEnrollments " +
           "ORDER BY c.averageRating DESC, c.enrollmentCount DESC LIMIT :limit")
    List<Course> findPopularCourses(@Param("minEnrollments") int minEnrollments, @Param("limit") int limit);

    /**
     * Find new courses (recently published)
     * @param limit Number of courses to return
     * @return List of new courses
     */
    @Query("SELECT c FROM Course c WHERE c.published = true ORDER BY c.publishedAt DESC LIMIT :limit")
    List<Course> findNewCourses(@Param("limit") int limit);

    /**
     * Find courses with a specific tag
     * @param tagId The tag ID
     * @param pageable Pagination parameters
     * @return Page of courses with the tag
     */
    @Query("SELECT c FROM Course c JOIN c.tags t WHERE t.id = :tagId AND c.published = true ORDER BY c.averageRating DESC")
    Page<Course> findByTagId(@Param("tagId") Long tagId, Pageable pageable);

    /**
     * Find courses by tag slug
     * @param tagSlug The tag slug
     * @param pageable Pagination parameters
     * @return Page of courses
     */
    @Query("SELECT c FROM Course c JOIN c.tags t WHERE t.slug = :tagSlug AND c.published = true ORDER BY c.averageRating DESC")
    Page<Course> findByTagSlug(@Param("tagSlug") String tagSlug, Pageable pageable);

    /**
     * Get recommended courses based on category (excluding specific course)
     * @param categoryId The category ID
     * @param excludeCourseId Course to exclude
     * @param limit Number of recommendations
     * @return List of recommended courses
     */
    @Query("SELECT c FROM Course c WHERE c.category.id = :categoryId AND c.id != :excludeCourseId " +
           "AND c.published = true ORDER BY c.averageRating DESC, c.enrollmentCount DESC LIMIT :limit")
    List<Course> findRecommendedCoursesByCategory(
        @Param("categoryId") Long categoryId,
        @Param("excludeCourseId") Long excludeCourseId,
        @Param("limit") int limit
    );

    /**
     * Count total published courses
     * @return Number of published courses
     */
    long countByPublishedTrue();

    /**
     * Count courses by creator
     * @param creatorId The creator's user ID
     * @return Number of courses
     */
    long countByCreatorId(Long creatorId);

    /**
     * Count published courses by creator
     * @param creatorId The creator's user ID
     * @return Number of published courses
     */
    @Query("SELECT COUNT(c) FROM Course c WHERE c.creator.id = :creatorId AND c.published = true")
    long countPublishedCoursesByCreatorId(@Param("creatorId") Long creatorId);

    /**
     * Count courses by category
     * @param categoryId The category ID
     * @return Number of courses
     */
    long countByCategoryId(Long categoryId);

    /**
     * Find draft courses by creator
     * @param creatorId The creator's user ID
     * @return List of draft courses
     */
    @Query("SELECT c FROM Course c WHERE c.creator.id = :creatorId AND c.draft = true ORDER BY c.updatedAt DESC")
    List<Course> findDraftCoursesByCreatorId(@Param("creatorId") Long creatorId);

    /**
     * Find archived courses by creator
     * @param creatorId The creator's user ID
     * @return List of archived courses
     */
    @Query("SELECT c FROM Course c WHERE c.creator.id = :creatorId AND c.archived = true ORDER BY c.updatedAt DESC")
    List<Course> findArchivedCoursesByCreatorId(@Param("creatorId") Long creatorId);

    /**
     * Calculate average rating for all courses
     * @return Average rating across all published courses
     */
    @Query("SELECT AVG(c.averageRating) FROM Course c WHERE c.published = true AND c.ratingCount > 0")
    Double getOverallAverageRating();

    /**
     * Get total enrollment count across all courses
     * @return Total enrollments
     */
    @Query("SELECT SUM(c.enrollmentCount) FROM Course c WHERE c.published = true")
    Long getTotalEnrollmentCount();

    /**
     * Get courses requiring content (no modules or lessons)
     * @param creatorId The creator's user ID
     * @return List of incomplete courses
     */
    @Query("SELECT c FROM Course c WHERE c.creator.id = :creatorId AND SIZE(c.modules) = 0")
    List<Course> findCoursesWithoutContent(@Param("creatorId") Long creatorId);
}

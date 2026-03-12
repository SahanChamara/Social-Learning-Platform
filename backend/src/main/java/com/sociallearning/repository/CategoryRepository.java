package com.sociallearning.repository;

import com.sociallearning.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Category entity.
 * Provides CRUD operations and custom query methods for category data access.
 * Supports hierarchical category queries (parent-child relationships).
 * 
 * Spring Data JPA automatically implements this interface at runtime.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    /**
     * Find a category by its slug.
     * Slugs are unique identifiers used in URLs.
     * 
     * @param slug the slug to search for
     * @return Optional containing the category if found, empty otherwise
     */
    Optional<Category> findBySlug(String slug);
    
    /**
     * Check if a category exists with the given slug.
     * Used for duplicate checking when creating or updating categories.
     * 
     * @param slug the slug to check
     * @return true if a category with this slug exists, false otherwise
     */
    boolean existsBySlug(String slug);
    
    /**
     * Find all root categories (categories without a parent).
     * Used for building the main category navigation.
     * 
     * @return List of root categories
     */
    List<Category> findByParentIsNull();
    
    /**
     * Find all child categories of a given parent category.
     * Used for building category hierarchies and navigation.
     * 
     * @param parent the parent category
     * @return List of child categories
     */
    List<Category> findByParent(Category parent);
    
    /**
     * Find all child categories of a given parent by parent ID.
     * More efficient than loading the parent entity first.
     * 
     * @param parentId the ID of the parent category
     * @return List of child categories
     */
    @Query("SELECT c FROM Category c WHERE c.parent.id = :parentId")
    List<Category> findByParentId(@Param("parentId") Long parentId);
    
    /**
     * Find all active categories.
     * Used for displaying categories to users.
     * 
     * @return List of active categories
     */
    List<Category> findByActiveTrue();
    
    /**
     * Find all active root categories (no parent and active).
     * Most common query for displaying main category navigation.
     * 
     * @return List of active root categories
     */
    @Query("SELECT c FROM Category c WHERE c.parent IS NULL AND c.active = true ORDER BY c.name ASC")
    List<Category> findActiveRootCategories();
    
    /**
     * Find categories by name (case-insensitive, partial match).
     * Used for category search and autocomplete.
     * 
     * @param name the name pattern to search for
     * @return List of matching categories
     */
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Category> findByNameContainingIgnoreCase(@Param("name") String name);
    
    /**
     * Find categories with course count greater than a threshold.
     * Used for finding popular categories.
     * 
     * @param minCourseCount minimum number of courses
     * @return List of popular categories
     */
    List<Category> findByCourseCountGreaterThanEqual(Integer minCourseCount);
    
    /**
     * Get category with all its children (eager loading).
     * Be careful with deep hierarchies - may cause performance issues.
     * 
     * @param id the category ID
     * @return Optional containing the category with children if found
     */
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.children WHERE c.id = :id")
    Optional<Category> findByIdWithChildren(@Param("id") Long id);
    
    /**
     * Find all categories ordered by course count (most popular first).
     * Used for analytics and trending categories.
     * 
     * @return List of categories ordered by popularity
     */
    @Query("SELECT c FROM Category c WHERE c.active = true ORDER BY c.courseCount DESC")
    List<Category> findAllByOrderByCourseCountDesc();
    
    /**
     * Find all active categories ordered by name.
     * Used for displaying categories in alphabetical order.
     * 
     * @return List of active categories ordered by name
     */
    List<Category> findAllByActiveTrueOrderByNameAsc();
}

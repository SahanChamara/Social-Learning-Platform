package com.sociallearning.repository;

import com.sociallearning.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Repository interface for Tag entity.
 * Provides CRUD operations and custom query methods for tag data access.
 * Supports tag search, filtering, and popularity queries.
 * 
 * Spring Data JPA automatically implements this interface at runtime.
 */
@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    
    /**
     * Find a tag by its slug.
     * Slugs are unique identifiers used in URLs and API queries.
     * 
     * @param slug the slug to search for
     * @return Optional containing the tag if found, empty otherwise
     */
    Optional<Tag> findBySlug(String slug);
    
    /**
     * Find a tag by its name (case-insensitive, exact match).
     * Used for duplicate checking and tag normalization.
     * 
     * @param name the tag name to search for
     * @return Optional containing the tag if found, empty otherwise
     */
    Optional<Tag> findByNameIgnoreCase(String name);
    
    /**
     * Check if a tag exists with the given slug.
     * Used for duplicate checking when creating or updating tags.
     * 
     * @param slug the slug to check
     * @return true if a tag with this slug exists, false otherwise
     */
    boolean existsBySlug(String slug);
    
    /**
     * Check if a tag exists with the given name (case-insensitive).
     * Used for duplicate checking when creating tags.
     * 
     * @param name the tag name to check
     * @return true if a tag with this name exists, false otherwise
     */
    boolean existsByNameIgnoreCase(String name);
    
    /**
     * Find all active tags.
     * Used for displaying tags to users in tag selection interfaces.
     * 
     * @return List of active tags
     */
    List<Tag> findByActiveTrue();
    
    /**
     * Find all featured tags.
     * Featured tags are highlighted in the UI for better discoverability.
     * 
     * @return List of featured tags
     */
    List<Tag> findByFeaturedTrue();
    
    /**
     * Find all active and featured tags.
     * Most common query for displaying promoted tags.
     * 
     * @return List of active, featured tags
     */
    List<Tag> findByActiveTrueAndFeaturedTrue();
    
    /**
     * Find tags by name (case-insensitive, partial match).
     * Used for tag search and autocomplete functionality.
     * 
     * @param name the name pattern to search for
     * @return List of matching tags
     */
    @Query("SELECT t FROM Tag t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%')) AND t.active = true")
    List<Tag> searchByName(@Param("name") String name);
    
    /**
     * Find multiple tags by their slugs.
     * Efficient bulk lookup for tag selection in forms.
     * 
     * @param slugs set of slugs to search for
     * @return List of matching tags
     */
    List<Tag> findBySlugIn(Set<String> slugs);
    
    /**
     * Find multiple tags by their IDs.
     * Used for bulk tag operations.
     * 
     * @param ids set of tag IDs
     * @return List of matching tags
     */
    List<Tag> findByIdIn(Set<Long> ids);
    
    /**
     * Find popular tags (usage count above threshold).
     * Used for displaying trending or popular tags.
     * 
     * @param minUsageCount minimum usage count threshold
     * @return List of popular tags
     */
    List<Tag> findByUsageCountGreaterThanEqual(Integer minUsageCount);
    
    /**
     * Find all tags ordered by usage count (most popular first).
     * Used for tag cloud and analytics displays.
     * 
     * @param limit maximum number of tags to return
     * @return List of tags ordered by popularity
     */
    @Query("SELECT t FROM Tag t WHERE t.active = true ORDER BY t.usageCount DESC LIMIT :limit")
    List<Tag> findTopByUsageCount(@Param("limit") int limit);
    
    /**
     * Find all active tags ordered by name.
     * Used for alphabetically sorted tag listings.
     * 
     * @return List of active tags ordered by name
     */
    @Query("SELECT t FROM Tag t WHERE t.active = true ORDER BY t.name ASC")
    List<Tag> findAllActiveOrderByName();
    
    /**
     * Find tags that are not used by any course.
     * Useful for cleanup and maintenance tasks.
     * 
     * @return List of unused tags
     */
    @Query("SELECT t FROM Tag t WHERE t.usageCount = 0")
    List<Tag> findUnusedTags();
    
    /**
     * Get tag usage statistics (count of tags by usage ranges).
     * Can be used for analytics dashboards.
     * 
     * @return List of usage count statistics
     */
    @Query("SELECT t.usageCount as count, COUNT(t) as tagCount FROM Tag t GROUP BY t.usageCount ORDER BY t.usageCount DESC")
    List<Object[]> getUsageStatistics();
    
    /**
     * Find all tags ordered by usage count (most used first).
     * Used for displaying popular tags.
     * 
     * @return List of tags ordered by usage count descending
     */
    List<Tag> findAllByOrderByUsageCountDesc();
}

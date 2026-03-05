package com.sociallearning.graphql;

import com.sociallearning.entity.Category;
import com.sociallearning.entity.Course;
import com.sociallearning.enums.CourseDifficulty;
import com.sociallearning.entity.Tag;
import com.sociallearning.repository.CategoryRepository;
import com.sociallearning.repository.TagRepository;
import com.sociallearning.service.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * GraphQL resolver for course queries.
 * 
 * Handles:
 * - Course retrieval (by slug, ID, search)
 * - Course discovery (trending, popular, new, featured, recommended)
 * - Category and tag queries
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class CourseQueryResolver {

    private final CourseService courseService;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    /**
     * Get a single course by slug.
     * 
     * GraphQL Query:
     * query GetCourse($slug: String!) {
     *   course(slug: $slug) {
     *     id
     *     title
     *     slug
     *     description
     *     # ... other fields
     *   }
     * }
     * 
     * @param slug Course slug
     * @return Course or null if not found
     */
    @QueryMapping
    public Course course(@Argument String slug) {
        log.info("GraphQL query: course(slug={})", slug);
        return courseService.findCourseWithDetails(slug);
    }

    /**
     * Get a single course by ID.
     * 
     * GraphQL Query:
     * query GetCourseById($id: ID!) {
     *   courseById(id: $id) {
     *     id
     *     title
     *     # ... other fields
     *   }
     * }
     * 
     * @param id Course ID
     * @return Course or null if not found
     */
    @QueryMapping
    public Course courseById(@Argument Long id) {
        log.info("GraphQL query: courseById(id={})", id);
        return courseService.findCourseById(id);
    }

    /**
     * Search and filter courses with pagination.
     * 
     * GraphQL Query:
     * query SearchCourses(
     *   $searchTerm: String
     *   $categoryId: ID
     *   $difficulty: CourseDifficulty
     *   $page: Int
     *   $size: Int
     * ) {
     *   courses(
     *     searchTerm: $searchTerm
     *     categoryId: $categoryId
     *     difficulty: $difficulty
     *     page: $page
     *     size: $size
     *   ) {
     *     content {
     *       id
     *       title
     *       slug
     *     }
     *     totalElements
     *     totalPages
     *     pageNumber
     *   }
     * }
     * 
     * @param searchTerm Search term
     * @param categoryId Category filter
     * @param difficulty Difficulty filter
     * @param language Language filter
     * @param minRating Minimum rating filter
     * @param page Page number (0-indexed, default 0)
     * @param size Page size (default 20)
     * @return Paginated course results
     */
    @QueryMapping
    public Map<String, Object> courses(
            @Argument String searchTerm,
            @Argument Long categoryId,
            @Argument CourseDifficulty difficulty,
            @Argument String language,
            @Argument Double minRating,
            @Argument Integer page,
            @Argument Integer size) {
        
        log.info("GraphQL query: courses(searchTerm={}, categoryId={}, difficulty={}, page={}, size={})",
                searchTerm, categoryId, difficulty, page, size);
        
        // Default pagination parameters
        int pageNumber = (page != null) ? page : 0;
        int pageSize = (size != null && size > 0) ? size : 20;
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        
        Page<Course> coursePage = courseService.searchCourses(
                searchTerm, categoryId, difficulty, language, minRating, pageable);
        
        // Convert to GraphQL CoursePage type
        Map<String, Object> result = new HashMap<>();
        result.put("content", coursePage.getContent());
        result.put("totalElements", coursePage.getTotalElements());
        result.put("totalPages", coursePage.getTotalPages());
        result.put("pageNumber", coursePage.getNumber());
        result.put("pageSize", coursePage.getSize());
        result.put("hasNext", coursePage.hasNext());
        result.put("hasPrevious", coursePage.hasPrevious());
        
        return result;
    }

    /**
     * Get courses created by a specific user.
     * 
     * @param creatorId Creator user ID
     * @param publishedOnly Whether to return only published courses
     * @return List of courses
     */
    @QueryMapping
    public List<Course> coursesByCreator(
            @Argument Long creatorId,
            @Argument Boolean publishedOnly) {
        
        log.info("GraphQL query: coursesByCreator(creatorId={}, publishedOnly={})",
                creatorId, publishedOnly);
        
        if (publishedOnly != null && publishedOnly) {
            return courseService.findPublishedCoursesByCreator(creatorId);
        } else {
            return courseService.findCoursesByCreator(creatorId);
        }
    }

    /**
     * Get trending courses based on enrollments and views.
     * 
     * @param limit Maximum number of courses to return (default 10)
     * @return List of trending courses
     */
    @QueryMapping
    public List<Course> trendingCourses(@Argument Integer limit) {
        int maxResults = (limit != null && limit > 0) ? limit : 10;
        log.info("GraphQL query: trendingCourses(limit={})", maxResults);
        return courseService.findTrendingCourses(maxResults);
    }

    /**
     * Get popular courses based on ratings.
     * 
     * @param minEnrollments Minimum enrollment count (default 10)
     * @param limit Maximum number of courses to return (default 10)
     * @return List of popular courses
     */
    @QueryMapping
    public List<Course> popularCourses(
            @Argument Integer minEnrollments,
            @Argument Integer limit) {
        
        int minEnroll = (minEnrollments != null && minEnrollments > 0) ? minEnrollments : 10;
        int maxResults = (limit != null && limit > 0) ? limit : 10;
        
        log.info("GraphQL query: popularCourses(minEnrollments={}, limit={})",
                minEnroll, maxResults);
        
        return courseService.findPopularCourses(minEnroll, maxResults);
    }

    /**
     * Get newly published courses.
     * 
     * @param limit Maximum number of courses to return (default 10)
     * @return List of new courses
     */
    @QueryMapping
    public List<Course> newCourses(@Argument Integer limit) {
        int maxResults = (limit != null && limit > 0) ? limit : 10;
        log.info("GraphQL query: newCourses(limit={})", maxResults);
        return courseService.findNewCourses(maxResults);
    }

    /**
     * Get featured courses.
     * 
     * @param limit Maximum number of courses to return (default 10)
     * @return List of featured courses
     */
    @QueryMapping
    public List<Course> featuredCourses(@Argument Integer limit) {
        int maxResults = (limit != null && limit > 0) ? limit : 10;
        log.info("GraphQL query: featuredCourses(limit={})", maxResults);
        return courseService.findFeaturedCourses()
                .stream()
                .limit(maxResults)
                .toList();
    }

    /**
     * Get recommended courses based on a specific course.
     * 
     * @param courseId Course ID to base recommendations on
     * @param limit Maximum number of courses to return (default 5)
     * @return List of recommended courses
     */
    @QueryMapping
    public List<Course> recommendedCourses(
            @Argument Long courseId,
            @Argument Integer limit) {
        
        int maxResults = (limit != null && limit > 0) ? limit : 5;
        log.info("GraphQL query: recommendedCourses(courseId={}, limit={})",
                courseId, maxResults);
        
        return courseService.findRecommendedCourses(courseId, maxResults);
    }

    /**
     * Get all active categories.
     * 
     * @return List of categories
     */
    @QueryMapping
    public List<Category> categories() {
        log.info("GraphQL query: categories()");
        return categoryRepository.findAllByIsActiveTrueOrderByNameAsc();
    }

    /**
     * Get a category by ID.
     * 
     * @param id Category ID
     * @return Category or null if not found
     */
    @QueryMapping
    public Category category(@Argument Long id) {
        log.info("GraphQL query: category(id={})", id);
        return categoryRepository.findById(id).orElse(null);
    }

    /**
     * Get all tags ordered by usage count.
     * 
     * @return List of tags
     */
    @QueryMapping
    public List<Tag> tags() {
        log.info("GraphQL query: tags()");
        return tagRepository.findAllByOrderByUsageCountDesc();
    }

    /**
     * Get a tag by ID.
     * 
     * @param id Tag ID
     * @return Tag or null if not found
     */
    @QueryMapping
    public Tag tag(@Argument Long id) {
        log.info("GraphQL query: tag(id={})", id);
        return tagRepository.findById(id).orElse(null);
    }
}

package com.sociallearning.service;

import com.sociallearning.entity.*;
import com.sociallearning.enums.CourseDifficulty;
import com.sociallearning.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Service for handling course operations.
 * 
 * Provides business logic for:
 * - Course creation and updates
 * - Course publishing and archiving
 * - Course querying with filters
 * - Module and lesson management
 * - Slug generation
 * - Authorization checks
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern MULTIPLE_DASHES = Pattern.compile("-{2,}");
    private static final String COURSE_NOT_FOUND_MSG = "Course not found with ID: ";

    /**
     * Create a new course.
     * 
     * @param title Course title
     * @param description Course description
     * @param creatorId ID of the user creating the course
     * @param categoryId ID of the category
     * @param difficulty Course difficulty level
     * @param language Course language code
     * @return Created course
     * @throws IllegalArgumentException if creator or category not found
     */
    @Transactional
    public Course createCourse(String title, String description, Long creatorId,
                               Long categoryId, CourseDifficulty difficulty, String language) {
        log.info("Creating course: {} by user ID: {}", title, creatorId);
        
        // Validate creator exists
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("Creator not found with ID: " + creatorId));
        
        // Validate category exists
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + categoryId));
        
        // Generate unique slug
        String slug = generateUniqueSlug(title);
        
        // Create course
        Course course = Course.builder()
                .title(title)
                .slug(slug)
                .description(description)
                .creator(creator)
                .category(category)
                .difficulty(difficulty != null ? difficulty : CourseDifficulty.BEGINNER)
                .language(language != null ? language : "en")
                .published(false)
                .draft(true)
                .archived(false)
                .featured(false)
                .build();
        
        // Save course
        course = courseRepository.save(course);
        
        // Update category course count
        category.setCourseCount(category.getCourseCount() + 1);
        categoryRepository.save(category);
        
        log.info("Course created successfully with ID: {} and slug: {}", course.getId(), course.getSlug());
        return course;
    }

    /**
     * Update an existing course.
     * 
     * @param courseId Course ID
     * @param userId ID of the user attempting the update
     * @param title New title (optional)
     * @param description New description (optional)
     * @param categoryId New category ID (optional)
     * @param difficulty New difficulty (optional)
     * @param language New language (optional)
     * @param thumbnailUrl New thumbnail URL (optional)
     * @param requirements New requirements (optional)
     * @param learningOutcomes New learning outcomes (optional)
     * @return Updated course
     * @throws IllegalArgumentException if course not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public Course updateCourse(Long courseId, Long userId, String title, String description,
                               Long categoryId, CourseDifficulty difficulty, String language,
                               String thumbnailUrl, String requirements, String learningOutcomes) {
        log.info("Updating course ID: {} by user ID: {}", courseId, userId);
        
        // Find course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));
        
        // Authorization check
        if (!course.getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to update this course");
        }
        
        // Update fields if provided
        if (title != null && !title.equals(course.getTitle())) {
            course.setTitle(title);
            // Regenerate slug if title changed
            String newSlug = generateUniqueSlug(title);
            course.setSlug(newSlug);
        }
        
        if (description != null) {
            course.setDescription(description);
        }
        
        if (categoryId != null && !categoryId.equals(course.getCategory().getId())) {
            // Update category counts
            Category oldCategory = course.getCategory();
            oldCategory.setCourseCount(Math.max(0, oldCategory.getCourseCount() - 1));
            categoryRepository.save(oldCategory);
            
            Category newCategory = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + categoryId));
            course.setCategory(newCategory);
            
            newCategory.setCourseCount(newCategory.getCourseCount() + 1);
            categoryRepository.save(newCategory);
        }
        
        if (difficulty != null) {
            course.setDifficulty(difficulty);
        }
        
        if (language != null) {
            course.setLanguage(language);
        }
        
        if (thumbnailUrl != null) {
            course.setThumbnailUrl(thumbnailUrl);
        }
        
        if (requirements != null) {
            course.setRequirements(requirements);
        }
        
        if (learningOutcomes != null) {
            course.setLearningOutcomes(learningOutcomes);
        }
        
        // Save updated course
        course = courseRepository.save(course);
        log.info("Course updated successfully: {}", courseId);
        
        return course;
    }

    /**
     * Delete a course.
     * 
     * @param courseId Course ID
     * @param userId ID of the user attempting deletion
     * @throws IllegalArgumentException if course not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public void deleteCourse(Long courseId, Long userId) {
        log.info("Deleting course ID: {} by user ID: {}", courseId, userId);
        
        // Find course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));
        
        // Authorization check
        if (!course.getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to delete this course");
        }
        
        // Update category course count
        Category category = course.getCategory();
        category.setCourseCount(Math.max(0, category.getCourseCount() - 1));
        categoryRepository.save(category);
        
        // Update tag usage counts
        for (Tag tag : course.getTags()) {
            tag.setUsageCount(Math.max(0, tag.getUsageCount() - 1));
            tagRepository.save(tag);
        }
        
        // Delete course (will cascade to modules and lessons)
        courseRepository.delete(course);
        log.info("Course deleted successfully: {}", courseId);
    }

    /**
     * Publish a course.
     * 
     * @param courseId Course ID
     * @param userId ID of the user attempting to publish
     * @return Published course
     * @throws IllegalArgumentException if course not found or not ready to publish
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public Course publishCourse(Long courseId, Long userId) {
        log.info("Publishing course ID: {} by user ID: {}", courseId, userId);
        
        // Find course with modules
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));
        
        // Authorization check
        if (!course.getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to publish this course");
        }
        
        // Validate course is ready to publish
        if (!course.isReadyToPublish()) {
            throw new IllegalArgumentException("Course must have at least one module with lessons to be published");
        }
        
        // Publish course
        course.publish();
        course = courseRepository.save(course);
        
        log.info("Course published successfully: {}", courseId);
        return course;
    }

    /**
     * Unpublish a course (revert to draft).
     * 
     * @param courseId Course ID
     * @param userId ID of the user attempting to unpublish
     * @return Unpublished course
     * @throws IllegalArgumentException if course not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public Course unpublishCourse(Long courseId, Long userId) {
        log.info("Unpublishing course ID: {} by user ID: {}", courseId, userId);
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));
        
        // Authorization check
        if (!course.getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to unpublish this course");
        }
        
        course.unpublish();
        course = courseRepository.save(course);
        
        log.info("Course unpublished successfully: {}", courseId);
        return course;
    }

    /**
     * Archive a course.
     * 
     * @param courseId Course ID
     * @param userId ID of the user attempting to archive
     * @return Archived course
     * @throws IllegalArgumentException if course not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public Course archiveCourse(Long courseId, Long userId) {
        log.info("Archiving course ID: {} by user ID: {}", courseId, userId);
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));
        
        // Authorization check
        if (!course.getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to archive this course");
        }
        
        course.archive();
        course = courseRepository.save(course);
        
        log.info("Course archived successfully: {}", courseId);
        return course;
    }

    /**
     * Add tags to a course.
     * 
     * @param courseId Course ID
     * @param userId ID of the user attempting the operation
     * @param tagIds List of tag IDs to add
     * @return Updated course
     * @throws IllegalArgumentException if course or tags not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public Course addTagsToCourse(Long courseId, Long userId, List<Long> tagIds) {
        log.info("Adding tags to course ID: {}", courseId);
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));
        
        // Authorization check
        if (!course.getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to modify this course");
        }
        
        // Find and add tags
        List<Tag> tags = tagRepository.findAllById(tagIds);
        for (Tag tag : tags) {
            if (!course.getTags().contains(tag)) {
                course.addTag(tag);
                tag.setUsageCount(tag.getUsageCount() + 1);
                tagRepository.save(tag);
            }
        }
        
        course = courseRepository.save(course);
        log.info("Tags added to course successfully");
        
        return course;
    }

    /**
     * Remove tags from a course.
     * 
     * @param courseId Course ID
     * @param userId ID of the user attempting the operation
     * @param tagIds List of tag IDs to remove
     * @return Updated course
     * @throws IllegalArgumentException if course not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public Course removeTagsFromCourse(Long courseId, Long userId, List<Long> tagIds) {
        log.info("Removing tags from course ID: {}", courseId);
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));
        
        // Authorization check
        if (!course.getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to modify this course");
        }
        
        // Find and remove tags
        List<Tag> tags = tagRepository.findAllById(tagIds);
        for (Tag tag : tags) {
            if (course.getTags().contains(tag)) {
                course.removeTag(tag);
                tag.setUsageCount(Math.max(0, tag.getUsageCount() - 1));
                tagRepository.save(tag);
            }
        }
        
        course = courseRepository.save(course);
        log.info("Tags removed from course successfully");
        
        return course;
    }

    /**
     * Find a course by slug.
     * 
     * @param slug Course slug
     * @return Course if found
     * @throws IllegalArgumentException if course not found
     */
    @Transactional(readOnly = true)
    public Course findCourseBySlug(String slug) {
        return courseRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with slug: " + slug));
    }

    @Transactional(readOnly = true)
    public Course findCourseById(Long id){
        return courseRepository.findCourseById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course Not Found in This Id "+ id));
    }

    /**
     * Find a course by slug with all details eagerly loaded.
     * 
     * @param slug Course slug
     * @return Course with details
     * @throws IllegalArgumentException if course not found
     */
    @Transactional(readOnly = true)
    public Course findCourseWithDetails(String slug) {
        Course course = courseRepository.findBySlugWithDetails(slug)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with slug: " + slug));
        
        // Increment view count
        course.incrementViewCount();
        courseRepository.save(course);
        
        return course;
    }

    /**
     * Find courses by creator.
     * 
     * @param creatorId Creator user ID
     * @return List of courses
     */
    @Transactional(readOnly = true)
    public List<Course> findCoursesByCreator(Long creatorId) {
        return courseRepository.findByCreatorId(creatorId);
    }

    /**
     * Find published courses by creator.
     * 
     * @param creatorId Creator user ID
     * @return List of published courses
     */
    @Transactional(readOnly = true)
    public List<Course> findPublishedCoursesByCreator(Long creatorId) {
        return courseRepository.findPublishedCoursesByCreatorId(creatorId);
    }

    /**
     * Search courses with filters and pagination.
     * 
     * @param searchTerm Search term (optional)
     * @param categoryId Category ID filter (optional)
     * @param difficulty Difficulty filter (optional)
     * @param language Language filter (optional)
     * @param minRating Minimum rating filter
     * @param pageable Pagination parameters
     * @return Page of courses
     */
    @Transactional(readOnly = true)
    public Page<Course> searchCourses(String searchTerm, Long categoryId, CourseDifficulty difficulty,
                                      String language, Double minRating, Pageable pageable) {
        if (searchTerm != null && !searchTerm.isEmpty()) {
            return courseRepository.searchCourses(searchTerm, pageable);
        } else {
            return courseRepository.findCoursesWithFilters(
                    categoryId, 
                    difficulty, 
                    language, 
                    minRating != null ? minRating : 0.0, 
                    pageable
            );
        }
    }

    /**
     * Get all published courses with pagination.
     * 
     * @param pageable Pagination parameters
     * @return Page of published courses
     */
    @Transactional(readOnly = true)
    public Page<Course> findPublishedCourses(Pageable pageable) {
        return courseRepository.findByPublishedTrue(pageable);
    }

    /**
     * Get trending courses.
     * 
     * @param limit Number of courses to return
     * @return List of trending courses
     */
    @Transactional(readOnly = true)
    public List<Course> findTrendingCourses(int limit) {
        return courseRepository.findTrendingCourses(limit);
    }

    /**
     * Get popular courses.
     * 
     * @param minEnrollments Minimum enrollment count
     * @param limit Number of courses to return
     * @return List of popular courses
     */
    @Transactional(readOnly = true)
    public List<Course> findPopularCourses(int minEnrollments, int limit) {
        return courseRepository.findPopularCourses(minEnrollments, limit);
    }

    /**
     * Get new courses.
     * 
     * @param limit Number of courses to return
     * @return List of new courses
     */
    @Transactional(readOnly = true)
    public List<Course> findNewCourses(int limit) {
        return courseRepository.findNewCourses(limit);
    }

    /**
     * Get featured courses.
     * 
     * @return List of featured courses
     */
    @Transactional(readOnly = true)
    public List<Course> findFeaturedCourses() {
        return courseRepository.findFeaturedCourses();
    }

    /**
     * Get recommended courses based on a course.
     * 
     * @param courseId Course ID to base recommendations on
     * @param limit Number of recommendations
     * @return List of recommended courses
     */
    @Transactional(readOnly = true)
    public List<Course> findRecommendedCourses(Long courseId, int limit) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));
        
        return courseRepository.findRecommendedCoursesByCategory(
                course.getCategory().getId(), 
                courseId, 
                limit
        );
    }

    /**
     * Generate a unique slug from a title.
     * 
     * @param title Course title
     * @return Unique slug
     */
    private String generateUniqueSlug(String title) {
        String baseSlug = toSlug(title);
        String slug = baseSlug;
        int counter = 1;
        
        // Keep trying with incrementing counter until we find a unique slug
        while (courseRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        
        return slug;
    }

    /**
     * Convert a string to a URL-friendly slug.
     * 
     * @param input Input string
     * @return Slug
     */
    private String toSlug(String input) {
        if (input == null) {
            return "";
        }
        
        // Normalize string (remove accents)
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        
        // Convert to lowercase
        String lowercase = normalized.toLowerCase(Locale.ENGLISH);
        
        // Replace whitespace with dashes
        String withDashes = WHITESPACE.matcher(lowercase).replaceAll("-");
        
        // Remove non-latin characters
        String slug = NON_LATIN.matcher(withDashes).replaceAll("");
        
        // Remove multiple consecutive dashes
        slug = MULTIPLE_DASHES.matcher(slug).replaceAll("-");
        
        // Remove leading/trailing dashes
        slug = slug.replaceAll("(^-)|(-$)", "");
        
        // Limit length to 200 characters
        if (slug.length() > 200) {
            slug = slug.substring(0, 200);
            // Remove trailing dash if any
            slug = slug.replaceAll("-$", "");
        }
        
        return slug;
    }

    /**
     * Calculate and update total duration for a course.
     * 
     * @param courseId Course ID
     */
    @Transactional
    public void updateCourseDuration(Long courseId) {
        int totalDuration = moduleRepository.getTotalDurationByCourseId(courseId);
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));
        
        course.setTotalDurationMinutes(totalDuration);
        courseRepository.save(course);
        
        log.info("Updated course duration for course {}: {} minutes", courseId, totalDuration);
    }

    /**
     * Check if user is the creator of a course.
     * 
     * @param courseId Course ID
     * @param userId User ID
     * @return true if user is the creator
     */
    @Transactional(readOnly = true)
    public boolean isCreator(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));
        
        return course.isCreatedBy(userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId)));
    }

    /**
     * Increment enrollment count for a course.
     * 
     * @param courseId Course ID
     */
    @Transactional
    public void incrementEnrollmentCount(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));
        
        course.incrementEnrollmentCount();
        courseRepository.save(course);
        
        log.info("Incremented enrollment count for course {}", courseId);
    }

    /**
     * Decrement enrollment count for a course.
     * 
     * @param courseId Course ID
     */
    @Transactional
    public void decrementEnrollmentCount(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));
        
        course.decrementEnrollmentCount();
        courseRepository.save(course);
        
        log.info("Decremented enrollment count for course {}", courseId);
    }
}

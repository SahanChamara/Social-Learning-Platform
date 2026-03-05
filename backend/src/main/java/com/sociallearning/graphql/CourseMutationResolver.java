package com.sociallearning.graphql;

import com.sociallearning.dto.*;
import com.sociallearning.entity.Course;
import com.sociallearning.entity.Lesson;
import com.sociallearning.entity.Module;
import com.sociallearning.security.SecurityUtils;
import com.sociallearning.service.CourseService;
import com.sociallearning.service.LessonService;
import com.sociallearning.service.ModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * GraphQL resolver for course, module, and lesson mutations.
 * 
 * Handles:
 * - Course CRUD and lifecycle operations
 * - Module CRUD and ordering
 * - Lesson CRUD and ordering
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class CourseMutationResolver {

    private final CourseService courseService;
    private final ModuleService moduleService;
    private final LessonService lessonService;

    // ============================================
    // Course Mutations
    // ============================================

    /**
     * Create a new course.
     * 
     * GraphQL Mutation:
     * mutation CreateCourse($input: CreateCourseInput!) {
     *   createCourse(input: $input) {
     *     id
     *     title
     *     slug
     *   }
     * }
     * 
     * @param input Course creation data
     * @return Created course
     */
    @MutationMapping
    public Course createCourse(@Argument("input") @Valid CreateCourseInput input) {
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: createCourse by user {}", userId);
        
        return courseService.createCourse(
                input.getTitle(),
                input.getDescription(),
                userId,
                input.getCategoryId(),
                input.getDifficulty(),
                input.getLanguage()
/*              input.getThumbnailUrl(),
                input.getRequirements(),
                input.getLearningOutcomes(),
                input.getPriceInCents() != null ? input.getPriceInCents() : 0*/
        );
    }

    /**
     * Update an existing course.
     * 
     * @param id Course ID
     * @param input Course update data
     * @return Updated course
     */
    @MutationMapping
    public Course updateCourse(
            @Argument Long id,
            @Argument("input") @Valid UpdateCourseInput input) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: updateCourse(id={}) by user {}", id, userId);
        
        return courseService.updateCourse(
                id,
                userId,
                input.getTitle(),
                input.getDescription(),
                input.getCategoryId(),
                input.getDifficulty(),
                input.getLanguage(),
                input.getThumbnailUrl(),
                input.getRequirements(),
                input.getLearningOutcomes()
        );
    }

    /**
     * Delete a course.
     * 
     * @param id Course ID
     * @return True if deleted successfully
     */
    @MutationMapping
    public Boolean deleteCourse(@Argument Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: deleteCourse(id={}) by user {}", id, userId);
        
        courseService.deleteCourse(id, userId);
        return true;
    }

    /**
     * Publish a course.
     * 
     * @param id Course ID
     * @return Published course
     */
    @MutationMapping
    public Course publishCourse(@Argument Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: publishCourse(id={}) by user {}", id, userId);
        
        return courseService.publishCourse(id, userId);
    }

    /**
     * Unpublish a course.
     * 
     * @param id Course ID
     * @return Unpublished course
     */
    @MutationMapping
    public Course unpublishCourse(@Argument Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: unpublishCourse(id={}) by user {}", id, userId);
        
        return courseService.unpublishCourse(id, userId);
    }

    /**
     * Archive a course.
     * 
     * @param id Course ID
     * @return Archived course
     */
    @MutationMapping
    public Course archiveCourse(@Argument Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: archiveCourse(id={}) by user {}", id, userId);
        
        return courseService.archiveCourse(id, userId);
    }

    /**
     * Add tags to a course.
     * 
     * @param courseId Course ID
     * @param tagIds List of tag IDs to add
     * @return Updated course
     */
    @MutationMapping
    public Course addTagsToCourse(
            @Argument Long courseId,
            @Argument List<Long> tagIds) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: addTagsToCourse(courseId={}, tagIds={}) by user {}",
                courseId, tagIds, userId);
        
        return courseService.addTagsToCourse(courseId, userId, tagIds);
    }

    /**
     * Remove tags from a course.
     * 
     * @param courseId Course ID
     * @param tagIds List of tag IDs to remove
     * @return Updated course
     */
    @MutationMapping
    public Course removeTagsFromCourse(
            @Argument Long courseId,
            @Argument List<Long> tagIds) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: removeTagsFromCourse(courseId={}, tagIds={}) by user {}",
                courseId, tagIds, userId);
        
        return courseService.removeTagsFromCourse(courseId, userId, tagIds);
    }

    // ============================================
    // Module Mutations
    // ============================================

    /**
     * Create a new module in a course.
     * 
     * @param courseId Course ID
     * @param input Module creation data
     * @return Created module
     */
    @MutationMapping
    public Module createModule(
            @Argument Long courseId,
            @Argument("input") @Valid CreateModuleInput input) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: createModule(courseId={}) by user {}", courseId, userId);
        
        return moduleService.createModule(
                courseId,
                userId,
                input.getTitle(),
                input.getDescription()
        );
    }

    /**
     * Update a module.
     * 
     * @param id Module ID
     * @param input Module update data
     * @return Updated module
     */
    @MutationMapping
    public Module updateModule(
            @Argument Long id,
            @Argument("input") @Valid UpdateModuleInput input) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: updateModule(id={}) by user {}", id, userId);
        
        return moduleService.updateModule(
                id,
                userId,
                input.getTitle(),
                input.getDescription(),
                input.getIsPublished()
        );
    }

    /**
     * Delete a module.
     * 
     * @param id Module ID
     * @return True if deleted successfully
     */
    @MutationMapping
    public Boolean deleteModule(@Argument Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: deleteModule(id={}) by user {}", id, userId);
        
        moduleService.deleteModule(id, userId);
        return true;
    }

    /**
     * Reorder modules in a course.
     * 
     * @param courseId Course ID
     * @param moduleIds Ordered list of module IDs
     * @return Reordered modules
     */
    @MutationMapping
    public List<Module> reorderModules(
            @Argument Long courseId,
            @Argument List<Long> moduleIds) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: reorderModules(courseId={}, moduleIds={}) by user {}",
                courseId, moduleIds, userId);
        
        moduleService.reorderModules(courseId, userId, moduleIds);
        return moduleService.getModulesByCourse(courseId);
    }

    // ============================================
    // Lesson Mutations
    // ============================================

    /**
     * Create a new lesson in a module.
     * 
     * @param moduleId Module ID
     * @param input Lesson creation data
     * @return Created lesson
     */
    @MutationMapping
    public Lesson createLesson(
            @Argument Long moduleId,
            @Argument("input") @Valid CreateLessonInput input) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: createLesson(moduleId={}) by user {}", moduleId, userId);
        
        return lessonService.createLesson(
                moduleId,
                userId,
                input.getTitle(),
                input.getDescription(),
                input.getType(),
                input.getDurationMinutes()
        );
    }

    /**
     * Update a lesson.
     * 
     * @param id Lesson ID
     * @param input Lesson update data
     * @return Updated lesson
     */
    @MutationMapping
    public Lesson updateLesson(
            @Argument Long id,
            @Argument("input") @Valid CreateLessonInput input) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: updateLesson(id={}) by user {}", id, userId);
        
        return lessonService.updateLesson(
                id,
                userId,
                input.getTitle(),
                input.getDescription(),
                input.getType(),
                input.getDurationMinutes(),
                null, // published - not in CreateLessonInput
                input.getIsFree(),
                null  // isDownloadable - not in CreateLessonInput
        );
    }

    /**
     * Update lesson content (type-specific fields).
     * 
     * @param id Lesson ID
     * @param input Lesson content update data
     * @return Updated lesson
     */
    @MutationMapping
    public Lesson updateLessonContent(
            @Argument Long id,
            @Argument("input") @Valid UpdateLessonContentInput input) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: updateLessonContent(id={}) by user {}", id, userId);
        
        return lessonService.updateLessonContent(
                id,
                userId,
                input.getVideoUrl(),
                input.getVideoThumbnailUrl(),
                input.getTextContent(),
                input.getQuizData(),
                input.getAssignmentInstructions(),
                input.getAssignmentMaxPoints(),
                input.getResourceUrl(),
                input.getAdditionalResources(),
                input.getTranscript()
                //input.getIsDownloadable()
        );
    }

    /**
     * Delete a lesson.
     * 
     * @param id Lesson ID
     * @return True if deleted successfully
     */
    @MutationMapping
    public Boolean deleteLesson(@Argument Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: deleteLesson(id={}) by user {}", id, userId);
        
        lessonService.deleteLesson(id, userId);
        return true;
    }

    /**
     * Reorder lessons in a module.
     * 
     * @param moduleId Module ID
     * @param lessonIds Ordered list of lesson IDs
     * @return Reordered lessons
     */
    @MutationMapping
    public List<Lesson> reorderLessons(
            @Argument Long moduleId,
            @Argument List<Long> lessonIds) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("GraphQL mutation: reorderLessons(moduleId={}, lessonIds={}) by user {}",
                moduleId, lessonIds, userId);
        
        lessonService.reorderLessons(moduleId, userId, lessonIds);
        return lessonService.getLessonsByModule(moduleId);
    }
}

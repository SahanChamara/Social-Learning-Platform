package com.sociallearning.service;

import com.sociallearning.entity.Lesson;
import com.sociallearning.entity.Module;
import com.sociallearning.enums.LessonType;
import com.sociallearning.repository.LessonRepository;
import com.sociallearning.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for handling lesson operations.
 * 
 * Provides business logic for:
 * - Lesson creation and updates
 * - Lesson ordering and navigation
 * - Lesson deletion
 * - Authorization checks
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final ModuleRepository moduleRepository;
    private final ModuleService moduleService;
    
    private static final String LESSON_NOT_FOUND_MSG = "Lesson not found with ID: ";

    /**
     * Create a new lesson in a module.
     * 
     * @param moduleId Module ID
     * @param userId ID of the user creating the lesson
     * @param title Lesson title
     * @param description Lesson description
     * @param type Lesson type
     * @param durationMinutes Lesson duration
     * @return Created lesson
     * @throws IllegalArgumentException if module not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public Lesson createLesson(Long moduleId, Long userId, String title, String description,
                               LessonType type, Integer durationMinutes) {
        log.info("Creating lesson in module ID: {} by user ID: {}", moduleId, userId);
        
        // Find module
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found with ID: " + moduleId));
        
        // Authorization check
        if (!module.getCourse().getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to modify this course");
        }
        
        // Get next order index
        int nextOrderIndex = lessonRepository.getMaxOrderIndex(moduleId) + 1;
        
        // Create lesson
        Lesson lesson = Lesson.builder()
                .title(title)
                .description(description)
                .module(module)
                .type(type != null ? type : LessonType.TEXT)
                .durationMinutes(durationMinutes != null ? durationMinutes : 0)
                .orderIndex(nextOrderIndex)
                .published(false)
                .isFree(false)
                .isDownloadable(false)
                .build();
        
        lesson = lessonRepository.save(lesson);
        
        // Update module duration
        moduleService.updateModuleDuration(moduleId);
        
        log.info("Lesson created successfully with ID: {}", lesson.getId());
        return lesson;
    }

    /**
     * Update an existing lesson.
     * 
     * @param lessonId Lesson ID
     * @param userId ID of the user attempting the update
     * @param title New title (optional)
     * @param description New description (optional)
     * @param type New type (optional)
     * @param durationMinutes New duration (optional)
     * @param published New published status (optional)
     * @param isFree New free status (optional)
     * @param isDownloadable New downloadable status (optional)
     * @return Updated lesson
     * @throws IllegalArgumentException if lesson not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public Lesson updateLesson(Long lessonId, Long userId, String title, String description,
                               LessonType type, Integer durationMinutes, Boolean published,
                               Boolean isFree, Boolean isDownloadable) {
        log.info("Updating lesson ID: {} by user ID: {}", lessonId, userId);
        
        // Find lesson
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException(LESSON_NOT_FOUND_MSG + lessonId));
        
        // Authorization check
        if (!lesson.getModule().getCourse().getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to modify this lesson");
        }
        
        boolean durationChanged = false;
        
        // Update fields if provided
        if (title != null) {
            lesson.setTitle(title);
        }
        
        if (description != null) {
            lesson.setDescription(description);
        }
        
        if (type != null) {
            lesson.setType(type);
        }
        
        if (durationMinutes != null && !durationMinutes.equals(lesson.getDurationMinutes())) {
            lesson.setDurationMinutes(durationMinutes);
            durationChanged = true;
        }
        
        if (published != null) {
            lesson.setPublished(published);
        }
        
        if (isFree != null) {
            lesson.setIsFree(isFree);
        }
        
        if (isDownloadable != null) {
            lesson.setIsDownloadable(isDownloadable);
        }
        
        lesson = lessonRepository.save(lesson);
        
        // Update module duration if lesson duration changed
        if (durationChanged) {
            moduleService.updateModuleDuration(lesson.getModule().getId());
        }
        
        log.info("Lesson updated successfully: {}", lessonId);
        return lesson;
    }

    /**
     * Update lesson content based on type.
     * 
     * @param lessonId Lesson ID
     * @param userId ID of the user attempting the update
     * @param videoUrl Video URL (for VIDEO type)
     * @param videoThumbnailUrl Video thumbnail URL
     * @param textContent Text content (for TEXT type)
     * @param quizData Quiz data JSON (for QUIZ type)
     * @param assignmentInstructions Assignment instructions (for ASSIGNMENT type)
     * @param assignmentMaxPoints Assignment max points
     * @param resourceUrl Resource URL (for RESOURCE type)
     * @param additionalResources Additional resources JSON
     * @param transcript Video transcript
     * @return Updated lesson
     * @throws IllegalArgumentException if lesson not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public Lesson updateLessonContent(Long lessonId, Long userId, String videoUrl, 
                                      String videoThumbnailUrl, String textContent, String quizData,
                                      String assignmentInstructions, Integer assignmentMaxPoints,
                                      String resourceUrl, String additionalResources, String transcript) {
        log.info("Updating lesson content for lesson ID: {}", lessonId);
        
        // Find lesson
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException(LESSON_NOT_FOUND_MSG + lessonId));
        
        // Authorization check
        if (!lesson.getModule().getCourse().getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to modify this lesson");
        }
        
        // Update content fields
        if (videoUrl != null) {
            lesson.setVideoUrl(videoUrl);
        }
        
        if (videoThumbnailUrl != null) {
            lesson.setVideoThumbnailUrl(videoThumbnailUrl);
        }
        
        if (textContent != null) {
            lesson.setTextContent(textContent);
        }
        
        if (quizData != null) {
            lesson.setQuizData(quizData);
        }
        
        if (assignmentInstructions != null) {
            lesson.setAssignmentInstructions(assignmentInstructions);
        }
        
        if (assignmentMaxPoints != null) {
            lesson.setAssignmentMaxPoints(assignmentMaxPoints);
        }
        
        if (resourceUrl != null) {
            lesson.setResourceUrl(resourceUrl);
        }
        
        if (additionalResources != null) {
            lesson.setAdditionalResources(additionalResources);
        }
        
        if (transcript != null) {
            lesson.setTranscript(transcript);
        }
        
        lesson = lessonRepository.save(lesson);
        log.info("Lesson content updated successfully");
        
        return lesson;
    }

    /**
     * Delete a lesson.
     * 
     * @param lessonId Lesson ID
     * @param userId ID of the user attempting deletion
     * @throws IllegalArgumentException if lesson not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public void deleteLesson(Long lessonId, Long userId) {
        log.info("Deleting lesson ID: {} by user ID: {}", lessonId, userId);
        
        // Find lesson
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException(LESSON_NOT_FOUND_MSG + lessonId));
        
        // Authorization check
        if (!lesson.getModule().getCourse().getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to delete this lesson");
        }
        
        Long moduleId = lesson.getModule().getId();
        
        // Delete lesson
        lessonRepository.delete(lesson);
        
        // Reorder remaining lessons
        reorderLessons(moduleId);
        
        // Update module duration
        moduleService.updateModuleDuration(moduleId);
        
        log.info("Lesson deleted successfully: {}", lessonId);
    }

    /**
     * Reorder lessons in a module.
     * 
     * @param moduleId Module ID
     * @param userId ID of the user attempting reordering
     * @param lessonIds Ordered list of lesson IDs
     * @throws IllegalArgumentException if module or lessons not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public void reorderLessons(Long moduleId, Long userId, List<Long> lessonIds) {
        log.info("Reordering lessons in module ID: {}", moduleId);
        
        // Find module
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found with ID: " + moduleId));
        
        // Authorization check
        if (!module.getCourse().getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to modify this course");
        }
        
        // Update order indices
        for (int i = 0; i < lessonIds.size(); i++) {
            Long lessonId = lessonIds.get(i);
            Lesson lesson = lessonRepository.findById(lessonId)
                    .orElseThrow(() -> new IllegalArgumentException(LESSON_NOT_FOUND_MSG + lessonId));
            
            // Verify lesson belongs to the module
            if (!lesson.getModule().getId().equals(moduleId)) {
                throw new IllegalArgumentException("Lesson " + lessonId + " does not belong to module " + moduleId);
            }
            
            lesson.setOrderIndex(i);
            lessonRepository.save(lesson);
        }
        
        log.info("Lessons reordered successfully");
    }

    /**
     * Reorder lessons after deletion (private helper).
     * 
     * @param moduleId Module ID
     */
    private void reorderLessons(Long moduleId) {
        List<Lesson> lessons = lessonRepository.findByModuleIdOrderByOrderIndex(moduleId);
        for (int i = 0; i < lessons.size(); i++) {
            lessons.get(i).setOrderIndex(i);
            lessonRepository.save(lessons.get(i));
        }
    }

    /**
     * Get all lessons for a module.
     * 
     * @param moduleId Module ID
     * @return List of lessons
     */
    @Transactional(readOnly = true)
    public List<Lesson> getLessonsByModule(Long moduleId) {
        return lessonRepository.findByModuleIdOrderByOrderIndex(moduleId);
    }

    /**
     * Get published lessons for a module.
     * 
     * @param moduleId Module ID
     * @return List of published lessons
     */
    @Transactional(readOnly = true)
    public List<Lesson> getPublishedLessonsByModule(Long moduleId) {
        return lessonRepository.findPublishedLessonsByModuleId(moduleId);
    }

    /**
     * Get a lesson by ID.
     * 
     * @param lessonId Lesson ID
     * @return Lesson
     * @throws IllegalArgumentException if lesson not found
     */
    @Transactional(readOnly = true)
    public Lesson getLessonById(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException(LESSON_NOT_FOUND_MSG + lessonId));
        
        // Increment view count
        lesson.incrementViewCount();
        lessonRepository.save(lesson);
        
        return lesson;
    }

    /**
     * Get the next lesson in a module.
     * 
     * @param lessonId Current lesson ID
     * @return Next lesson if available
     */
    @Transactional(readOnly = true)
    public Optional<Lesson> getNextLesson(Long lessonId) {
        Lesson currentLesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException(LESSON_NOT_FOUND_MSG + lessonId));
        
        return lessonRepository.findNextLesson(
                currentLesson.getModule().getId(), 
                currentLesson.getOrderIndex()
        );
    }

    /**
     * Get the previous lesson in a module.
     * 
     * @param lessonId Current lesson ID
     * @return Previous lesson if available
     */
    @Transactional(readOnly = true)
    public Optional<Lesson> getPreviousLesson(Long lessonId) {
        Lesson currentLesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException(LESSON_NOT_FOUND_MSG + lessonId));
        
        return lessonRepository.findPreviousLesson(
                currentLesson.getModule().getId(), 
                currentLesson.getOrderIndex()
        );
    }

    /**
     * Get free preview lessons for a course.
     * 
     * @param courseId Course ID
     * @return List of free lessons
     */
    @Transactional(readOnly = true)
    public List<Lesson> getFreeLessonsByCourse(Long courseId) {
        return lessonRepository.findFreeLessonsByCourseId(courseId);
    }

    /**
     * Mark a lesson as completed (increment completion count).
     * 
     * @param lessonId Lesson ID
     */
    @Transactional
    public void markLessonCompleted(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException(LESSON_NOT_FOUND_MSG + lessonId));
        
        lesson.incrementCompletionCount();
        lessonRepository.save(lesson);
        
        log.info("Marked lesson {} as completed", lessonId);
    }
}

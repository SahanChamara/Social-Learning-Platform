package com.sociallearning.service;

import com.sociallearning.entity.Course;
import com.sociallearning.entity.Lesson;
import com.sociallearning.entity.Module;
import com.sociallearning.repository.CourseRepository;
import com.sociallearning.repository.LessonRepository;
import com.sociallearning.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for handling module operations.
 * 
 * Provides business logic for:
 * - Module creation and updates
 * - Module ordering and reordering
 * - Module deletion
 * - Authorization checks
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    
    private static final String MODULE_NOT_FOUND_MSG = "Module not found with ID: ";

    /**
     * Create a new module in a course.
     * 
     * @param courseId Course ID
     * @param userId ID of the user creating the module
     * @param title Module title
     * @param description Module description
     * @return Created module
     * @throws IllegalArgumentException if course not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public Module createModule(Long courseId, Long userId, String title, String description) {
        log.info("Creating module in course ID: {} by user ID: {}", courseId, userId);
        
        // Find course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with ID: " + courseId));
        
        // Authorization check
        if (!course.getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to modify this course");
        }
        
        // Get next order index
        int nextOrderIndex = moduleRepository.getMaxOrderIndex(courseId) + 1;
        
        // Create module
        Module module = Module.builder()
                .title(title)
                .description(description)
                .course(course)
                .orderIndex(nextOrderIndex)
                .published(false)
                .build();
        
        module = moduleRepository.save(module);
        
        log.info("Module created successfully with ID: {}", module.getId());
        return module;
    }

    /**
     * Update an existing module.
     * 
     * @param moduleId Module ID
     * @param userId ID of the user attempting the update
     * @param title New title (optional)
     * @param description New description (optional)
     * @param published New published status (optional)
     * @return Updated module
     * @throws IllegalArgumentException if module not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public Module updateModule(Long moduleId, Long userId, String title, 
                               String description, Boolean published) {
        log.info("Updating module ID: {} by user ID: {}", moduleId, userId);
        
        // Find module with course
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException(MODULE_NOT_FOUND_MSG + moduleId));
        
        // Authorization check
        if (!module.getCourse().getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to modify this module");
        }
        
        // Update fields if provided
        if (title != null) {
            module.setTitle(title);
        }
        
        if (description != null) {
            module.setDescription(description);
        }
        
        if (published != null) {
            module.setPublished(published);
        }
        
        module = moduleRepository.save(module);
        log.info("Module updated successfully: {}", moduleId);
        
        return module;
    }

    /**
     * Delete a module.
     * 
     * @param moduleId Module ID
     * @param userId ID of the user attempting deletion
     * @throws IllegalArgumentException if module not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public void deleteModule(Long moduleId, Long userId) {
        log.info("Deleting module ID: {} by user ID: {}", moduleId, userId);
        
        // Find module
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException(MODULE_NOT_FOUND_MSG + moduleId));
        
        // Authorization check
        if (!module.getCourse().getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to delete this module");
        }
        
        Long courseId = module.getCourse().getId();
        
        // Delete module (will cascade to lessons)
        moduleRepository.delete(module);
        
        // Reorder remaining modules
        reorderModules(courseId);
        
        log.info("Module deleted successfully: {}", moduleId);
    }

    /**
     * Reorder modules in a course.
     * 
     * @param courseId Course ID
     * @param userId ID of the user attempting reordering
     * @param moduleIds Ordered list of module IDs
     * @throws IllegalArgumentException if course or modules not found
     * @throws SecurityException if user is not the creator
     */
    @Transactional
    public void reorderModules(Long courseId, Long userId, List<Long> moduleIds) {
        log.info("Reordering modules in course ID: {}", courseId);
        
        // Find course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with ID: " + courseId));
        
        // Authorization check
        if (!course.getCreator().getId().equals(userId)) {
            throw new SecurityException("User is not authorized to modify this course");
        }
        
        // Update order indices
        for (int i = 0; i < moduleIds.size(); i++) {
            Long moduleId = moduleIds.get(i);
            Module module = moduleRepository.findById(moduleId)
                    .orElseThrow(() -> new IllegalArgumentException(MODULE_NOT_FOUND_MSG + moduleId));
            
            // Verify module belongs to the course
            if (!module.getCourse().getId().equals(courseId)) {
                throw new IllegalArgumentException("Module " + moduleId + " does not belong to course " + courseId);
            }
            
            module.setOrderIndex(i);
            moduleRepository.save(module);
        }
        
        log.info("Modules reordered successfully");
    }

    /**
     * Reorder modules after deletion (private helper).
     * 
     * @param courseId Course ID
     */
    private void reorderModules(Long courseId) {
        List<Module> modules = moduleRepository.findByCourseIdOrderByOrderIndex(courseId);
        for (int i = 0; i < modules.size(); i++) {
            modules.get(i).setOrderIndex(i);
            moduleRepository.save(modules.get(i));
        }
    }

    /**
     * Get all modules for a course.
     * 
     * @param courseId Course ID
     * @return List of modules
     */
    @Transactional(readOnly = true)
    public List<Module> getModulesByCourse(Long courseId) {
        return moduleRepository.findByCourseIdOrderByOrderIndex(courseId);
    }

    /**
     * Get published modules for a course.
     * 
     * @param courseId Course ID
     * @return List of published modules
     */
    @Transactional(readOnly = true)
    public List<Module> getPublishedModulesByCourse(Long courseId) {
        return moduleRepository.findPublishedModulesByCourseId(courseId);
    }

    /**
     * Get a module with its lessons.
     * 
     * @param moduleId Module ID
     * @return Module with lessons
     * @throws IllegalArgumentException if module not found
     */
    @Transactional(readOnly = true)
    public Module getModuleWithLessons(Long moduleId) {
        return moduleRepository.findByIdWithLessons(moduleId)
                .orElseThrow(() -> new IllegalArgumentException(MODULE_NOT_FOUND_MSG + moduleId));
    }

    /**
     * Calculate and update duration for a module.
     * 
     * @param moduleId Module ID
     */
    @Transactional
    public void updateModuleDuration(Long moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException(MODULE_NOT_FOUND_MSG + moduleId));
        
        module.calculateDuration();
        moduleRepository.save(module);
        
        log.info("Updated module duration for module {}: {} minutes", moduleId, module.getDurationMinutes());
    }
}

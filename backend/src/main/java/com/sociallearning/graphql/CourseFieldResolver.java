package com.sociallearning.graphql;

import com.sociallearning.entity.Category;
import com.sociallearning.entity.Course;
import com.sociallearning.entity.Lesson;
import com.sociallearning.entity.Module;
import com.sociallearning.entity.User;
import com.sociallearning.service.LessonService;
import com.sociallearning.service.ModuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dataloader.DataLoader;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.graphql.execution.BatchLoaderRegistry;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * GraphQL field resolver for nested course data.
 * Handles loading of related entities when they are requested in GraphQL queries.
 * Uses DataLoaders to prevent N+1 query problems by batching database queries.
 */

@Slf4j
@Controller
@RequiredArgsConstructor
public class CourseFieldResolver {

    private final ModuleService moduleService;
    private final LessonService lessonService;

    /**
     * Resolve the creator field for a Course using DataLoader.
     * 
     * This prevents N+1 queries when loading courses with their creators.
     * Multiple creator loads are batched into a single database query.
     * 
     * @param course The parent course entity
     * @param userDataLoader DataLoader for batch-loading User entities
     * @return CompletableFuture containing the creator User
     */
    @SchemaMapping(typeName = "Course", field = "creator")
    public CompletableFuture<User> courseCreator(Course course, DataLoader<Long, User> userDataLoader) {
        Long creatorId = course.getCreator().getId();
        log.debug("Queuing creator load for course '{}': user ID {}", course.getTitle(), creatorId);
        return userDataLoader.load(creatorId);
    }

    /**
     * Resolve the category field for a Course using DataLoader.
     * 
     * This prevents N+1 queries when loading courses with their categories.
     * Multiple category loads are batched into a single database query.
     * 
     * @param course The parent course entity
     * @param categoryDataLoader DataLoader for batch-loading Category entities
     * @return CompletableFuture containing the Category
     */
    @SchemaMapping(typeName = "Course", field = "category")
    public CompletableFuture<Category> courseCategory(Course course, DataLoader<Long, Category> categoryDataLoader) {
        Long categoryId = course.getCategory().getId();
        log.debug("Queuing category load for course '{}': category ID {}", course.getTitle(), categoryId);
        return categoryDataLoader.load(categoryId);
    }

    /**
     * Resolve the modules field for a Course.
     * 
     * Called when a GraphQL query requests the modules of a course.
     * 
     * @param course The parent course entity
     * @return List of modules belonging to the course
     */
    @SchemaMapping(typeName = "Course", field = "modules")
    public List<Module> courseModules(Course course) {
        log.debug("Resolving modules for course ID: {}", course.getId());
        return moduleService.getModulesByCourse(course.getId());
    }

    /**
     * Resolve the lessons field for a Module.
     * 
     * Called when a GraphQL query requests the lessons of a module.
     * 
     * @param module The parent module entity
     * @return List of lessons belonging to the module
     */
    @SchemaMapping(typeName = "Module", field = "lessons")
    public List<Lesson> moduleLessons(Module module) {
        log.debug("Resolving lessons for module ID: {}", module.getId());
        return lessonService.getLessonsByModule(module.getId());
    }
}

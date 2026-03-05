package com.sociallearning.graphql;

import com.sociallearning.entity.Course;
import com.sociallearning.entity.Lesson;
import com.sociallearning.entity.Module;
import com.sociallearning.service.LessonService;
import com.sociallearning.service.ModuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * GraphQL field resolver for nested course data.
 * Handles loading of related entities when they are requested in GraphQL queries.
 * These resolvers are called when nested fields are queried.
 */

@Slf4j
@Controller
@RequiredArgsConstructor
public class CourseFieldResolver {

    private final ModuleService moduleService;
    private final LessonService lessonService;

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

    /**
     * Note: creator, category, and tags are already loaded via JPA relationships
     * in the Course entity, so we don't need explicit field resolvers for them.
     * 
     * However, if we implement DataLoader for N+1 prevention (Task 2.6),
     * we would add field resolvers here like:
     * 
     * @SchemaMapping(typeName = "Course", field = "creator")
     * public CompletableFuture<User> courseCreator(Course course, DataLoader<Long, User> userDataLoader) {
     *     return userDataLoader.load(course.getCreator().getId());
     * }
     */
}

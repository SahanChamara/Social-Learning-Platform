package com.sociallearning.config;

import com.sociallearning.entity.Category;
import com.sociallearning.entity.Course;
import com.sociallearning.entity.Lesson;
import com.sociallearning.entity.Module;
import com.sociallearning.entity.Tag;
import com.sociallearning.entity.User;
import com.sociallearning.entity.User.UserRole;
import com.sociallearning.enums.CourseDifficulty;
import com.sociallearning.enums.LessonType;
import com.sociallearning.repository.CategoryRepository;
import com.sociallearning.repository.CourseRepository;
import com.sociallearning.repository.TagRepository;
import com.sociallearning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Seeds realistic first-version content for local demos and beta review environments.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DemoDataSeedConfig {

    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    @ConditionalOnProperty(prefix = "app.seed.demo-data", name = "enabled", havingValue = "true")
    public CommandLineRunner seedDemoData() {
        return args -> {
            User creator = getOrCreateCreator();
            Map<String, Category> categories = seedCategories();
            Map<String, Tag> tags = seedTags();

            seedCourse(
                    creator,
                    categories.get("web-development"),
                    List.of(tags.get("react"), tags.get("project-based"), tags.get("beginner-friendly")),
                    new DemoCourse(
                            "practical-react-foundations",
                            "Practical React Foundations",
                            "Build a reliable React foundation by creating components, composing screens, managing state, and connecting UI behavior to real product workflows.",
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
                            CourseDifficulty.BEGINNER,
                            "English",
                            "Comfortable with HTML, CSS, and basic JavaScript syntax.",
                            "Create reusable components\nManage local state and events\nStructure a small React application\nUnderstand route-based product flows",
                            0,
                            true,
                            BigDecimal.valueOf(4.8),
                            42,
                            684,
                            List.of(
                                    new DemoModule(
                                            "React product basics",
                                            "Set up the mental model for components, props, state, and screen composition.",
                                            List.of(
                                                    new DemoLesson("How React thinks about UI", "Understand components as product building blocks.", LessonType.VIDEO, 12, true),
                                                    new DemoLesson("Props and reusable cards", "Build reusable course-card style UI.", LessonType.TEXT, 16, false),
                                                    new DemoLesson("State and events", "Wire user actions to visible interface changes.", LessonType.VIDEO, 18, false)
                                            )
                                    ),
                                    new DemoModule(
                                            "Build the course browser",
                                            "Turn the basics into a small, navigable course discovery experience.",
                                            List.of(
                                                    new DemoLesson("Filterable course lists", "Create a browsable list with clear empty states.", LessonType.VIDEO, 22, false),
                                                    new DemoLesson("Course detail layout", "Organize outcomes, curriculum, trust, and CTA sections.", LessonType.TEXT, 20, false)
                                            )
                                    )
                            )
                    )
            );

            seedCourse(
                    creator,
                    categories.get("data"),
                    List.of(tags.get("analytics"), tags.get("career-skills"), tags.get("beginner-friendly")),
                    new DemoCourse(
                            "data-analysis-for-product-decisions",
                            "Data Analysis for Product Decisions",
                            "Learn how to turn product data into decisions by reading funnels, comparing cohorts, and communicating insights with practical dashboards.",
                            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
                            CourseDifficulty.INTERMEDIATE,
                            "English",
                            "Basic spreadsheet comfort and curiosity about product metrics.",
                            "Read acquisition and activation funnels\nCompare user cohorts\nChoose useful product metrics\nPresent clear recommendations",
                            0,
                            true,
                            BigDecimal.valueOf(4.7),
                            31,
                            428,
                            List.of(
                                    new DemoModule(
                                            "Metrics that matter",
                                            "Separate useful product signals from noisy vanity metrics.",
                                            List.of(
                                                    new DemoLesson("From events to decisions", "Map raw activity to meaningful product questions.", LessonType.VIDEO, 14, true),
                                                    new DemoLesson("Funnel analysis", "Spot where learners or users drop off.", LessonType.TEXT, 18, false)
                                            )
                                    ),
                                    new DemoModule(
                                            "Cohorts and communication",
                                            "Compare groups and turn findings into recommendations.",
                                            List.of(
                                                    new DemoLesson("Cohort comparison", "Measure retention and behavior over time.", LessonType.VIDEO, 24, false),
                                                    new DemoLesson("Write the insight brief", "Summarize findings so a team can act.", LessonType.ASSIGNMENT, 30, false)
                                            )
                                    )
                            )
                    )
            );

            seedCourse(
                    creator,
                    categories.get("career"),
                    List.of(tags.get("career-skills"), tags.get("project-based")),
                    new DemoCourse(
                            "portfolio-projects-for-junior-developers",
                            "Portfolio Projects for Junior Developers",
                            "Plan, scope, build, and present portfolio projects that show practical product thinking instead of isolated code snippets.",
                            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
                            CourseDifficulty.BEGINNER,
                            "English",
                            "Basic programming experience and one project idea.",
                            "Choose portfolio projects with a clear user problem\nScope work into weekly milestones\nWrite readable case studies\nPrepare project walkthroughs",
                            0,
                            false,
                            BigDecimal.valueOf(4.6),
                            18,
                            290,
                            List.of(
                                    new DemoModule(
                                            "Choose and scope",
                                            "Pick project ideas that prove applied learning.",
                                            List.of(
                                                    new DemoLesson("What a portfolio project should prove", "Connect a project to a user and outcome.", LessonType.VIDEO, 15, true),
                                                    new DemoLesson("Scope a one-week build", "Define what belongs in version one.", LessonType.TEXT, 19, false)
                                            )
                                    ),
                                    new DemoModule(
                                            "Present the work",
                                            "Turn a project into a clear case study and interview story.",
                                            List.of(
                                                    new DemoLesson("Write the project case study", "Document tradeoffs, constraints, and outcomes.", LessonType.ASSIGNMENT, 28, false),
                                                    new DemoLesson("Practice the walkthrough", "Prepare a concise project demo.", LessonType.RESOURCE, 12, false)
                                            )
                                    )
                            )
                    )
            );

            log.info("First-version demo data seed completed.");
        };
    }

    private User getOrCreateCreator() {
        return userRepository.findByUsername("maya_creator").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("maya_creator")
                        .email("maya.creator@example.com")
                        .passwordHash(passwordEncoder.encode("DemoCreator123!"))
                        .fullName("Maya Chen")
                        .bio("Product-minded educator focused on practical learning paths.")
                        .expertise("React, product analytics, portfolio coaching")
                        .role(UserRole.CREATOR)
                        .isVerified(true)
                        .isActive(true)
                        .build())
        );
    }

    private Map<String, Category> seedCategories() {
        return Map.of(
                "web-development", getOrCreateCategory(
                        "Web Development",
                        "web-development",
                        "Frontend and backend skills for building practical web products."
                ),
                "data", getOrCreateCategory(
                        "Data",
                        "data",
                        "Analytics, metrics, and decision-making skills."
                ),
                "career", getOrCreateCategory(
                        "Career",
                        "career",
                        "Professional skills for building a strong learning and work portfolio."
                )
        );
    }

    private Category getOrCreateCategory(String name, String slug, String description) {
        return categoryRepository.findBySlug(slug).orElseGet(() ->
                categoryRepository.save(Category.builder()
                        .name(name)
                        .slug(slug)
                        .description(description)
                        .active(true)
                        .courseCount(0)
                        .build())
        );
    }

    private Map<String, Tag> seedTags() {
        return Map.of(
                "react", getOrCreateTag("React", "react", "Modern React application development.", "#2563EB"),
                "project-based", getOrCreateTag("Project Based", "project-based", "Courses built around practical projects.", "#059669"),
                "beginner-friendly", getOrCreateTag("Beginner Friendly", "beginner-friendly", "Approachable courses for newer learners.", "#7C3AED"),
                "analytics", getOrCreateTag("Analytics", "analytics", "Data analysis and metrics practice.", "#DB2777"),
                "career-skills", getOrCreateTag("Career Skills", "career-skills", "Practical professional development.", "#EA580C")
        );
    }

    private Tag getOrCreateTag(String name, String slug, String description, String color) {
        return tagRepository.findBySlug(slug).orElseGet(() ->
                tagRepository.save(Tag.builder()
                        .name(name)
                        .slug(slug)
                        .description(description)
                        .color(color)
                        .active(true)
                        .featured(true)
                        .usageCount(0)
                        .build())
        );
    }

    private void seedCourse(User creator, Category category, List<Tag> tags, DemoCourse demoCourse) {
        if (courseRepository.existsBySlug(demoCourse.slug())) {
            return;
        }

        Course course = Course.builder()
                .title(demoCourse.title())
                .slug(demoCourse.slug())
                .description(demoCourse.description())
                .thumbnailUrl(demoCourse.thumbnailUrl())
                .creator(creator)
                .category(category)
                .difficulty(demoCourse.difficulty())
                .language(demoCourse.language())
                .requirements(demoCourse.requirements())
                .learningOutcomes(demoCourse.learningOutcomes())
                .priceInCents(demoCourse.priceInCents())
                .published(true)
                .draft(false)
                .archived(false)
                .featured(demoCourse.featured())
                .averageRating(demoCourse.averageRating())
                .ratingCount(demoCourse.ratingCount())
                .enrollmentCount(demoCourse.enrollmentCount())
                .viewCount(demoCourse.enrollmentCount() * 6)
                .publishedAt(LocalDateTime.now().minusDays(14))
                .build();

        int totalDuration = 0;
        for (int moduleIndex = 0; moduleIndex < demoCourse.modules().size(); moduleIndex++) {
            DemoModule demoModule = demoCourse.modules().get(moduleIndex);
            Module module = Module.builder()
                    .title(demoModule.title())
                    .description(demoModule.description())
                    .orderIndex(moduleIndex)
                    .published(true)
                    .build();

            int moduleDuration = 0;
            for (int lessonIndex = 0; lessonIndex < demoModule.lessons().size(); lessonIndex++) {
                DemoLesson demoLesson = demoModule.lessons().get(lessonIndex);
                Lesson lesson = Lesson.builder()
                        .title(demoLesson.title())
                        .description(demoLesson.description())
                        .type(demoLesson.type())
                        .durationMinutes(demoLesson.durationMinutes())
                        .orderIndex(lessonIndex)
                        .published(true)
                        .isFree(demoLesson.freePreview())
                        .isDownloadable(false)
                        .viewCount(demoCourse.enrollmentCount() * 2)
                        .completionCount(Math.max(0, demoCourse.enrollmentCount() - (lessonIndex * 4)))
                        .build();
                module.addLesson(lesson);
                moduleDuration += demoLesson.durationMinutes();
            }

            module.setDurationMinutes(moduleDuration);
            course.addModule(module);
            totalDuration += moduleDuration;
        }

        course.setTotalDurationMinutes(totalDuration);
        for (Tag tag : tags) {
            course.addTag(tag);
        }

        category.setCourseCount(category.getCourseCount() + 1);
        courseRepository.save(course);
        categoryRepository.save(category);
        tagRepository.saveAll(tags);
    }

    private record DemoCourse(
            String slug,
            String title,
            String description,
            String thumbnailUrl,
            CourseDifficulty difficulty,
            String language,
            String requirements,
            String learningOutcomes,
            int priceInCents,
            boolean featured,
            BigDecimal averageRating,
            int ratingCount,
            int enrollmentCount,
            List<DemoModule> modules
    ) {}

    private record DemoModule(String title, String description, List<DemoLesson> lessons) {}

    private record DemoLesson(
            String title,
            String description,
            LessonType type,
            int durationMinutes,
            boolean freePreview
    ) {}
}

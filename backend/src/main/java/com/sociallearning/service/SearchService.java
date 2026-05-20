package com.sociallearning.service;

import com.sociallearning.entity.Category;
import com.sociallearning.entity.Course;
import com.sociallearning.entity.Tag;
import com.sociallearning.enums.CourseDifficulty;
import com.sociallearning.enums.CourseSortBy;
import com.sociallearning.enums.SortDirection;
import com.sociallearning.repository.CategoryRepository;
import com.sociallearning.repository.CourseRepository;
import com.sociallearning.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Search service with PostgreSQL full-text backed course search and
 * lightweight multi-entity discovery (courses/categories/tags).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    @Transactional(readOnly = true)
    public Page<Course> searchCourses(String searchTerm,
                                      Long categoryId,
                                      CourseDifficulty difficulty,
                                      String language,
                                      Double minRating,
                                      CourseSortBy sortBy,
                                      SortDirection sortDirection,
                                      Pageable pageable) {
        String normalizedSearchTerm = normalizeSearchTerm(searchTerm);
        String normalizedLanguage = normalizeLanguage(language);
        String difficultyValue = difficulty != null ? difficulty.name() : null;
        String sortByValue = sortBy != null ? sortBy.name() : CourseSortBy.RELEVANCE.name();
        String directionValue = sortDirection != null ? sortDirection.name() : SortDirection.DESC.name();
        double effectiveMinRating = minRating != null ? Math.max(minRating, 0.0) : 0.0;

        log.debug("Searching courses with term='{}', categoryId={}, difficulty={}, language={}, minRating={}, sortBy={}, direction={}",
                normalizedSearchTerm, categoryId, difficultyValue, normalizedLanguage, effectiveMinRating, sortByValue, directionValue);

        return courseRepository.searchPublishedCoursesFullText(
                normalizedSearchTerm,
                categoryId,
                difficultyValue,
                normalizedLanguage,
                effectiveMinRating,
                sortByValue,
                directionValue,
                pageable
        );
    }

    @Transactional(readOnly = true)
    public SearchResults searchAcrossEntities(String searchTerm, int limitPerEntity) {
        int safeLimit = Math.max(1, limitPerEntity);
        String normalizedSearchTerm = normalizeSearchTerm(searchTerm);

        Page<Course> courses = searchCourses(
                normalizedSearchTerm,
                null,
                null,
                null,
                0.0,
                CourseSortBy.RELEVANCE,
                SortDirection.DESC,
                PageRequest.of(0, safeLimit)
        );

        List<Category> categories = normalizedSearchTerm == null
                ? List.of()
                : categoryRepository.findByNameContainingIgnoreCase(normalizedSearchTerm)
                .stream()
                .filter(Category::getActive)
                .limit(safeLimit)
                .toList();

        List<Tag> tags = normalizedSearchTerm == null
                ? List.of()
                : tagRepository.searchByName(normalizedSearchTerm)
                .stream()
                .limit(safeLimit)
                .toList();

        return new SearchResults(courses, categories, tags);
    }

    private String normalizeSearchTerm(String searchTerm) {
        if (searchTerm == null) {
            return null;
        }
        String trimmed = searchTerm.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeLanguage(String language) {
        if (language == null) {
            return null;
        }
        String trimmed = language.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public record SearchResults(
            Page<Course> courses,
            List<Category> categories,
            List<Tag> tags
    ) {}
}

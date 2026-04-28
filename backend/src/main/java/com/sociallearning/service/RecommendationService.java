package com.sociallearning.service;

import com.sociallearning.entity.Course;
import com.sociallearning.entity.Enrollment;
import com.sociallearning.repository.CourseRepository;
import com.sociallearning.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Recommendation service for personalized course discovery.
 *
 * Strategy:
 * 1) Enrollment-history affinity (categories/tags learners consumed)
 * 2) Creator affinity (learners often follow creators through enrollments)
 * 3) Collaborative filtering (similar users also enrolled in ...)
 * 4) Popular fallback in user-preferred categories
 * 5) Global popular fallback
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    public List<Course> recommendForUser(Long userId, int limit) {
        int safeLimit = Math.max(1, limit);

        List<Enrollment> history = enrollmentRepository.findByUserIdWithCourseDetails(userId);
        if (history.isEmpty()) {
            return fallbackPopular(safeLimit);
        }

        Set<Long> excludedCourseIds = history.stream()
                .map(enrollment -> enrollment.getCourse().getId())
                .collect(LinkedHashSet::new, Set::add, Set::addAll);

        LinkedHashSet<Course> recommendations = new LinkedHashSet<>();

        addCreatorAffinityRecommendations(recommendations, history, excludedCourseIds, safeLimit);
        addCategoryAffinityRecommendations(recommendations, history, excludedCourseIds, safeLimit);
        addCollaborativeRecommendations(recommendations, userId, excludedCourseIds, safeLimit);
        addPopularInPreferredCategories(recommendations, history, excludedCourseIds, safeLimit);
        addGlobalFallback(recommendations, excludedCourseIds, safeLimit);

        return recommendations.stream().limit(safeLimit).toList();
    }

    @Transactional(readOnly = true)
    public List<Course> recommendBasedOnCourse(Long courseId, int limit) {
        int safeLimit = Math.max(1, limit);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with ID: " + courseId));

        List<Course> byCategory = courseRepository.findRecommendedByCategoryIds(
                List.of(course.getCategory().getId()),
                List.of(courseId),
                PageRequest.of(0, safeLimit)
        );

        if (byCategory.size() >= safeLimit) {
            return byCategory.subList(0, safeLimit);
        }

        LinkedHashSet<Course> combined = new LinkedHashSet<>(byCategory);
        List<Course> fallback = courseRepository.findByPublishedTrueAndArchivedFalseOrderByEnrollmentCountDescAverageRatingDesc(
                PageRequest.of(0, safeLimit * 2)
        );
        for (Course candidate : fallback) {
            if (!candidate.getId().equals(courseId)) {
                combined.add(candidate);
            }
            if (combined.size() >= safeLimit) {
                break;
            }
        }
        return combined.stream().limit(safeLimit).toList();
    }

    private void addCreatorAffinityRecommendations(Set<Course> recommendations,
                                                   List<Enrollment> history,
                                                   Set<Long> excludedCourseIds,
                                                   int limit) {
        List<Long> creatorIds = history.stream()
                .map(enrollment -> enrollment.getCourse().getCreator().getId())
                .distinct()
                .toList();

        if (creatorIds.isEmpty()) {
            return;
        }

        List<Course> candidates = courseRepository.findRecommendedByCreatorIds(
                creatorIds,
                toExcludedList(excludedCourseIds),
                PageRequest.of(0, limit * 2)
        );
        addCourses(recommendations, excludedCourseIds, candidates, limit);
    }

    private void addCategoryAffinityRecommendations(Set<Course> recommendations,
                                                    List<Enrollment> history,
                                                    Set<Long> excludedCourseIds,
                                                    int limit) {
        Map<Long, Integer> categoryWeights = new HashMap<>();
        for (Enrollment enrollment : history) {
            Long categoryId = enrollment.getCourse().getCategory().getId();
            categoryWeights.merge(categoryId, enrollment.isCompleted() ? 3 : 1, Integer::sum);
        }

        List<Long> prioritizedCategoryIds = categoryWeights.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue(Comparator.reverseOrder()))
                .map(Map.Entry::getKey)
                .toList();

        if (prioritizedCategoryIds.isEmpty()) {
            return;
        }

        List<Course> candidates = courseRepository.findRecommendedByCategoryIds(
                prioritizedCategoryIds,
                toExcludedList(excludedCourseIds),
                PageRequest.of(0, limit * 3)
        );
        addCourses(recommendations, excludedCourseIds, candidates, limit);
    }

    private void addCollaborativeRecommendations(Set<Course> recommendations,
                                                 Long userId,
                                                 Set<Long> excludedCourseIds,
                                                 int limit) {
        List<Long> seedCourseIds = new ArrayList<>(excludedCourseIds);
        if (seedCourseIds.isEmpty()) {
            return;
        }

        List<Long> collaborativeCourseIds = enrollmentRepository.findCollaborativeRecommendedCourseIds(
                userId,
                seedCourseIds,
                limit * 3
        );
        if (collaborativeCourseIds.isEmpty()) {
            return;
        }

        List<Course> collaborativeCourses = courseRepository.findByIdInAndPublishedTrueAndArchivedFalse(collaborativeCourseIds);
        Map<Long, Integer> positionById = new HashMap<>();
        for (int i = 0; i < collaborativeCourseIds.size(); i++) {
            positionById.put(collaborativeCourseIds.get(i), i);
        }
        collaborativeCourses.sort(Comparator.comparingInt(course -> positionById.getOrDefault(course.getId(), Integer.MAX_VALUE)));
        addCourses(recommendations, excludedCourseIds, collaborativeCourses, limit);
    }

    private void addPopularInPreferredCategories(Set<Course> recommendations,
                                                 List<Enrollment> history,
                                                 Set<Long> excludedCourseIds,
                                                 int limit) {
        List<Long> categoryIds = history.stream()
                .map(enrollment -> enrollment.getCourse().getCategory().getId())
                .distinct()
                .toList();
        if (categoryIds.isEmpty()) {
            return;
        }

        List<Course> candidates = courseRepository.findRecommendedByCategoryIds(
                categoryIds,
                toExcludedList(excludedCourseIds),
                PageRequest.of(0, limit * 2)
        );
        addCourses(recommendations, excludedCourseIds, candidates, limit);
    }

    private void addGlobalFallback(Set<Course> recommendations,
                                   Set<Long> excludedCourseIds,
                                   int limit) {
        List<Course> fallback = fallbackPopular(limit * 2);
        addCourses(recommendations, excludedCourseIds, fallback, limit);
    }

    private List<Course> fallbackPopular(int limit) {
        return courseRepository.findByPublishedTrueAndArchivedFalseOrderByEnrollmentCountDescAverageRatingDesc(
                PageRequest.of(0, Math.max(1, limit))
        );
    }

    private void addCourses(Set<Course> recommendations,
                            Set<Long> excludedCourseIds,
                            List<Course> candidates,
                            int limit) {
        for (Course candidate : candidates) {
            if (excludedCourseIds.contains(candidate.getId())) {
                continue;
            }
            recommendations.add(candidate);
            if (recommendations.size() >= limit) {
                return;
            }
        }
    }

    private List<Long> toExcludedList(Set<Long> excludedCourseIds) {
        if (excludedCourseIds.isEmpty()) {
            return List.of(-1L);
        }
        return new ArrayList<>(new HashSet<>(excludedCourseIds));
    }
}

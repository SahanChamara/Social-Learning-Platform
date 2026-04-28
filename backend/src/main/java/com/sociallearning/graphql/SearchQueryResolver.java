package com.sociallearning.graphql;

import com.sociallearning.entity.Course;
import com.sociallearning.service.CourseService;
import com.sociallearning.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

/**
 * GraphQL resolver for search and cursor-based discovery queries.
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class SearchQueryResolver {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 50;
    private static final int MAX_FETCH_SIZE = 250;
    private static final String CURSOR_PREFIX = "cursor:";

    private final SearchService searchService;
    private final CourseService courseService;

    @QueryMapping
    public SearchResultPage search(@Argument String query,
                                   @Argument Integer first,
                                   @Argument String after) {
        int pageSize = normalizePageSize(first);
        int startIndex = decodeStartIndex(after);
        int fetchSize = Math.min(Math.max(startIndex + pageSize + 1, pageSize), MAX_FETCH_SIZE);

        log.info("GraphQL query: search(query='{}', first={}, after={})", query, pageSize, after);

        SearchService.SearchResults results = searchService.searchAcrossEntities(query, fetchSize);

        List<Object> combined = new ArrayList<>();
        combined.addAll(results.courses().getContent());
        combined.addAll(results.categories());
        combined.addAll(results.tags());

        return toSearchResultPage(combined, startIndex, pageSize);
    }

    @QueryMapping
    public CourseConnection trendingCoursesConnection(@Argument Integer first,
                                                      @Argument String after) {
        int pageSize = normalizePageSize(first);
        int startIndex = decodeStartIndex(after);
        int fetchSize = Math.min(Math.max(startIndex + pageSize + 1, pageSize), MAX_FETCH_SIZE);

        log.info("GraphQL query: trendingCoursesConnection(first={}, after={})", pageSize, after);

        List<Course> courses = courseService.findTrendingCourses(fetchSize);
        return toCourseConnection(courses, startIndex, pageSize);
    }

    @QueryMapping
    public CourseConnection recommendedCoursesConnection(@Argument Long courseId,
                                                         @Argument Integer first,
                                                         @Argument String after) {
        int pageSize = normalizePageSize(first);
        int startIndex = decodeStartIndex(after);
        int fetchSize = Math.min(Math.max(startIndex + pageSize + 1, pageSize), MAX_FETCH_SIZE);

        log.info("GraphQL query: recommendedCoursesConnection(courseId={}, first={}, after={})",
                courseId, pageSize, after);

        List<Course> courses = courseService.findRecommendedCourses(courseId, fetchSize);
        return toCourseConnection(courses, startIndex, pageSize);
    }

    private int normalizePageSize(Integer first) {
        if (first == null || first <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(first, MAX_PAGE_SIZE);
    }

    private int decodeStartIndex(String after) {
        if (after == null || after.isBlank()) {
            return 0;
        }

        try {
            String decoded = new String(Base64.getDecoder().decode(after), StandardCharsets.UTF_8);
            if (!decoded.startsWith(CURSOR_PREFIX)) {
                throw new IllegalArgumentException("Invalid cursor format");
            }
            int index = Integer.parseInt(decoded.substring(CURSOR_PREFIX.length()));
            return Math.max(index + 1, 0);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid cursor: " + after, ex);
        }
    }

    private String encodeCursor(int index) {
        String raw = CURSOR_PREFIX + index;
        return Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    private SearchResultPage toSearchResultPage(List<Object> nodes, int startIndex, int pageSize) {
        int total = nodes.size();
        int from = Math.min(Math.max(startIndex, 0), total);
        int to = Math.min(from + pageSize, total);

        List<SearchEdge> edges = new ArrayList<>(Math.max(to - from, 0));
        for (int i = from; i < to; i++) {
            edges.add(new SearchEdge(encodeCursor(i), nodes.get(i)));
        }

        PageInfo pageInfo = new PageInfo(to < total, edges.isEmpty() ? null : edges.get(edges.size() - 1).cursor());
        return new SearchResultPage(edges, pageInfo, total);
    }

    private CourseConnection toCourseConnection(List<Course> courses, int startIndex, int pageSize) {
        int total = courses.size();
        int from = Math.min(Math.max(startIndex, 0), total);
        int to = Math.min(from + pageSize, total);

        List<CourseEdge> edges = new ArrayList<>(Math.max(to - from, 0));
        for (int i = from; i < to; i++) {
            edges.add(new CourseEdge(encodeCursor(i), courses.get(i)));
        }

        PageInfo pageInfo = new PageInfo(to < total, edges.isEmpty() ? null : edges.get(edges.size() - 1).cursor());
        return new CourseConnection(edges, pageInfo, total);
    }

    public record PageInfo(boolean hasNextPage, String endCursor) {}

    public record SearchEdge(String cursor, Object node) {}

    public record SearchResultPage(List<SearchEdge> edges, PageInfo pageInfo, int totalCount) {}

    public record CourseEdge(String cursor, Course node) {}

    public record CourseConnection(List<CourseEdge> edges, PageInfo pageInfo, int totalCount) {}
}

package com.sociallearning.service;

import com.sociallearning.entity.Comment;
import com.sociallearning.entity.Course;
import com.sociallearning.entity.Lesson;
import com.sociallearning.entity.Like;
import com.sociallearning.entity.User;
import com.sociallearning.enums.LikeableType;
import com.sociallearning.repository.CommentRepository;
import com.sociallearning.repository.CourseRepository;
import com.sociallearning.repository.LessonRepository;
import com.sociallearning.repository.LikeRepository;
import com.sociallearning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for handling like/upvote operations.
 *
 * Provides business logic for:
 * - Toggle like functionality (like/unlike)
 * - Like status checks
 * - Updating denormalized like counts on target entities
 * - Fetching likes with pagination
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final CommentRepository commentRepository;

    private static final String USER_NOT_FOUND_MSG = "User not found with ID: ";
    private static final String COURSE_NOT_FOUND_MSG = "Course not found with ID: ";
    private static final String LESSON_NOT_FOUND_MSG = "Lesson not found with ID: ";
    private static final String COMMENT_NOT_FOUND_MSG = "Comment not found with ID: ";

    // ============================================
    // Toggle Like Methods
    // ============================================

    /**
     * Toggle like on a course.
     * If user has liked the course, removes the like.
     * If user hasn't liked, adds a like.
     *
     * @param userId User ID
     * @param courseId Course ID
     * @return true if liked, false if unliked
     */
    @Transactional
    public boolean toggleCourseLike(Long userId, Long courseId) {
        log.info("Toggling course like: userId={}, courseId={}", userId, courseId);

        User user = getUser(userId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));

        Optional<Like> existingLike = likeRepository.findUserCourseLike(userId, courseId);

        if (existingLike.isPresent()) {
            // Unlike
            likeRepository.delete(existingLike.get());
            updateCourseLikeCount(course, -1);
            log.info("Course unliked: userId={}, courseId={}", userId, courseId);
            return false;
        } else {
            // Like
            Like like = Like.forCourse(user, courseId);
            likeRepository.save(like);
            updateCourseLikeCount(course, 1);
            log.info("Course liked: userId={}, courseId={}", userId, courseId);
            return true;
        }
    }

    /**
     * Toggle like on a lesson.
     *
     * @param userId User ID
     * @param lessonId Lesson ID
     * @return true if liked, false if unliked
     */
    @Transactional
    public boolean toggleLessonLike(Long userId, Long lessonId) {
        log.info("Toggling lesson like: userId={}, lessonId={}", userId, lessonId);

        User user = getUser(userId);
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException(LESSON_NOT_FOUND_MSG + lessonId));

        Optional<Like> existingLike = likeRepository.findUserLessonLike(userId, lessonId);

        if (existingLike.isPresent()) {
            // Unlike
            likeRepository.delete(existingLike.get());
            log.info("Lesson unliked: userId={}, lessonId={}", userId, lessonId);
            return false;
        } else {
            // Like
            Like like = Like.forLesson(user, lessonId);
            likeRepository.save(like);
            log.info("Lesson liked: userId={}, lessonId={}", userId, lessonId);
            return true;
        }
    }

    /**
     * Toggle like on a comment.
     * Updates denormalized like count on the comment.
     *
     * @param userId User ID
     * @param commentId Comment ID
     * @return true if liked, false if unliked
     */
    @Transactional
    public boolean toggleCommentLike(Long userId, Long commentId) {
        log.info("Toggling comment like: userId={}, commentId={}", userId, commentId);

        User user = getUser(userId);
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException(COMMENT_NOT_FOUND_MSG + commentId));

        if (comment.getIsDeleted()) {
            throw new IllegalArgumentException("Cannot like a deleted comment");
        }

        Optional<Like> existingLike = likeRepository.findUserCommentLike(userId, commentId);

        if (existingLike.isPresent()) {
            // Unlike
            likeRepository.delete(existingLike.get());
            comment.decrementLikeCount();
            commentRepository.save(comment);
            log.info("Comment unliked: userId={}, commentId={}", userId, commentId);
            return false;
        } else {
            // Like
            Like like = Like.forComment(user, commentId);
            likeRepository.save(like);
            comment.incrementLikeCount();
            commentRepository.save(comment);
            log.info("Comment liked: userId={}, commentId={}", userId, commentId);
            return true;
        }
    }

    /**
     * Generic toggle like method.
     *
     * @param userId User ID
     * @param targetType Type of target entity
     * @param targetId Target entity ID
     * @return true if liked, false if unliked
     */
    @Transactional
    public boolean toggleLike(Long userId, LikeableType targetType, Long targetId) {
        return switch (targetType) {
            case COURSE -> toggleCourseLike(userId, targetId);
            case LESSON -> toggleLessonLike(userId, targetId);
            case COMMENT -> toggleCommentLike(userId, targetId);
        };
    }

    // ============================================
    // Like Status Check Methods
    // ============================================

    /**
     * Check if user has liked a course.
     *
     * @param userId User ID
     * @param courseId Course ID
     * @return true if liked
     */
    @Transactional(readOnly = true)
    public boolean hasUserLikedCourse(Long userId, Long courseId) {
        return likeRepository.hasUserLikedCourse(userId, courseId);
    }

    /**
     * Check if user has liked a lesson.
     *
     * @param userId User ID
     * @param lessonId Lesson ID
     * @return true if liked
     */
    @Transactional(readOnly = true)
    public boolean hasUserLikedLesson(Long userId, Long lessonId) {
        return likeRepository.hasUserLikedLesson(userId, lessonId);
    }

    /**
     * Check if user has liked a comment.
     *
     * @param userId User ID
     * @param commentId Comment ID
     * @return true if liked
     */
    @Transactional(readOnly = true)
    public boolean hasUserLikedComment(Long userId, Long commentId) {
        return likeRepository.hasUserLikedComment(userId, commentId);
    }

    /**
     * Check if user has liked a target.
     *
     * @param userId User ID
     * @param targetType Type of target entity
     * @param targetId Target entity ID
     * @return true if liked
     */
    @Transactional(readOnly = true)
    public boolean hasUserLiked(Long userId, LikeableType targetType, Long targetId) {
        return likeRepository.existsByUserIdAndLikeableTypeAndLikeableId(userId, targetType, targetId);
    }

    // ============================================
    // Batch Check Methods
    // ============================================

    /**
     * Get IDs of targets that user has liked from a list.
     *
     * @param userId User ID
     * @param targetType Type of target entities
     * @param targetIds List of target IDs to check
     * @return List of liked target IDs
     */
    @Transactional(readOnly = true)
    public List<Long> getLikedTargetIds(Long userId, LikeableType targetType, List<Long> targetIds) {
        if (targetIds == null || targetIds.isEmpty()) {
            return List.of();
        }
        return likeRepository.findLikedTargetIds(userId, targetType, targetIds);
    }

    /**
     * Get IDs of courses that user has liked from a list.
     *
     * @param userId User ID
     * @param courseIds Course IDs to check
     * @return List of liked course IDs
     */
    @Transactional(readOnly = true)
    public List<Long> getLikedCourseIds(Long userId, List<Long> courseIds) {
        return getLikedTargetIds(userId, LikeableType.COURSE, courseIds);
    }

    /**
     * Get IDs of comments that user has liked from a list.
     *
     * @param userId User ID
     * @param commentIds Comment IDs to check
     * @return List of liked comment IDs
     */
    @Transactional(readOnly = true)
    public List<Long> getLikedCommentIds(Long userId, List<Long> commentIds) {
        return getLikedTargetIds(userId, LikeableType.COMMENT, commentIds);
    }

    // ============================================
    // Count Methods
    // ============================================

    /**
     * Get like count for a target.
     *
     * @param targetType Type of target entity
     * @param targetId Target entity ID
     * @return Like count
     */
    @Transactional(readOnly = true)
    public long getLikeCount(LikeableType targetType, Long targetId) {
        return likeRepository.countByLikeableTypeAndLikeableId(targetType, targetId);
    }

    /**
     * Get like count for a course.
     *
     * @param courseId Course ID
     * @return Like count
     */
    @Transactional(readOnly = true)
    public long getCourseLikeCount(Long courseId) {
        return likeRepository.countCourseLikes(courseId);
    }

    /**
     * Get like count for a lesson.
     *
     * @param lessonId Lesson ID
     * @return Like count
     */
    @Transactional(readOnly = true)
    public long getLessonLikeCount(Long lessonId) {
        return likeRepository.countLessonLikes(lessonId);
    }

    /**
     * Get like count for a comment.
     *
     * @param commentId Comment ID
     * @return Like count
     */
    @Transactional(readOnly = true)
    public long getCommentLikeCount(Long commentId) {
        return likeRepository.countCommentLikes(commentId);
    }

    /**
     * Get total likes by a user.
     *
     * @param userId User ID
     * @return Total like count
     */
    @Transactional(readOnly = true)
    public long getUserTotalLikes(Long userId) {
        return likeRepository.countByUserId(userId);
    }

    /**
     * Get like count by user for a specific type.
     *
     * @param userId User ID
     * @param targetType Type of target
     * @return Like count
     */
    @Transactional(readOnly = true)
    public long getUserLikesByType(Long userId, LikeableType targetType) {
        return likeRepository.countByUserIdAndLikeableType(userId, targetType);
    }

    // ============================================
    // Fetch Likes Methods
    // ============================================

    /**
     * Get all courses liked by a user.
     *
     * @param userId User ID
     * @return List of likes for courses
     */
    @Transactional(readOnly = true)
    public List<Like> getUserLikedCourses(Long userId) {
        return likeRepository.findUserLikedCourses(userId);
    }

    /**
     * Get all lessons liked by a user.
     *
     * @param userId User ID
     * @return List of likes for lessons
     */
    @Transactional(readOnly = true)
    public List<Like> getUserLikedLessons(Long userId) {
        return likeRepository.findUserLikedLessons(userId);
    }

    /**
     * Get all likes by a user with pagination.
     *
     * @param userId User ID
     * @param pageable Pagination parameters
     * @return Page of likes
     */
    @Transactional(readOnly = true)
    public Page<Like> getUserLikes(Long userId, Pageable pageable) {
        return likeRepository.findByUserId(userId, pageable);
    }

    /**
     * Get likes for a target with pagination.
     *
     * @param targetType Type of target entity
     * @param targetId Target entity ID
     * @param pageable Pagination parameters
     * @return Page of likes
     */
    @Transactional(readOnly = true)
    public Page<Like> getTargetLikes(LikeableType targetType, Long targetId, Pageable pageable) {
        return likeRepository.findByLikeableTypeAndLikeableId(targetType, targetId, pageable);
    }

    // ============================================
    // Statistics Methods
    // ============================================

    /**
     * Get like statistics for a user by type.
     *
     * @param userId User ID
     * @return List of [LikeableType, count] arrays
     */
    @Transactional(readOnly = true)
    public List<Object[]> getUserLikeStats(Long userId) {
        return likeRepository.getLikeStatsByUser(userId);
    }

    /**
     * Get most liked courses.
     *
     * @param pageable Pagination parameters
     * @return Page of [courseId, likeCount] arrays
     */
    @Transactional(readOnly = true)
    public Page<Object[]> getMostLikedCourses(Pageable pageable) {
        return likeRepository.findMostLikedCourses(pageable);
    }

    // ============================================
    // Denormalized Count Update Methods
    // ============================================

    /**
     * Update the denormalized like count on a course.
     *
     * @param course Course entity
     * @param delta Change in count (+1 or -1)
     */
    private void updateCourseLikeCount(Course course, int delta) {
        int newCount = course.getLikeCount() + delta;
        if (newCount < 0) newCount = 0;
        course.setLikeCount(newCount);
        courseRepository.save(course);
        log.debug("Course like count updated: courseId={}, count={}", course.getId(), newCount);
    }

    /**
     * Recalculate and update the like count for a course.
     * Use for data consistency checks or repairs.
     *
     * @param courseId Course ID
     */
    @Transactional
    public void recalculateCourseLikeCount(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_FOUND_MSG + courseId));

        long actualCount = likeRepository.countCourseLikes(courseId);
        course.setLikeCount((int) actualCount);
        courseRepository.save(course);

        log.info("Course like count recalculated: courseId={}, count={}", courseId, actualCount);
    }

    /**
     * Recalculate and update the like count for a comment.
     * Use for data consistency checks or repairs.
     *
     * @param commentId Comment ID
     */
    @Transactional
    public void recalculateCommentLikeCount(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException(COMMENT_NOT_FOUND_MSG + commentId));

        long actualCount = likeRepository.countCommentLikes(commentId);
        comment.setLikeCount((int) actualCount);
        commentRepository.save(comment);

        log.info("Comment like count recalculated: commentId={}, count={}", commentId, actualCount);
    }

    // ============================================
    // Helper Methods
    // ============================================

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND_MSG + userId));
    }
}

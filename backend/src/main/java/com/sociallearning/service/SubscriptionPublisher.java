package com.sociallearning.service;

import com.sociallearning.entity.Comment;
import com.sociallearning.entity.Rating;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

/**
 * Service for publishing GraphQL subscription events.
 * 
 * Uses Project Reactor's Sinks to manage hot publishers that can
 * multicast events to multiple subscribers.
 * 
 * Supports:
 * - Comment added/updated/deleted events
 * - Rating added events
 * - Like toggle events
 */
@Slf4j
@Service
public class SubscriptionPublisher {

    // Sinks for different event types - using multicast to support multiple subscribers
    private final Sinks.Many<CommentEvent> commentSink;
    private final Sinks.Many<RatingEvent> ratingSink;
    private final Sinks.Many<LikeEvent> likeSink;

    public SubscriptionPublisher() {
        // Create multicast sinks with replay of 0 (no history for new subscribers)
        this.commentSink = Sinks.many().multicast().onBackpressureBuffer();
        this.ratingSink = Sinks.many().multicast().onBackpressureBuffer();
        this.likeSink = Sinks.many().multicast().onBackpressureBuffer();
        
        log.info("SubscriptionPublisher initialized");
    }

    // ============================================
    // Comment Events
    // ============================================

    /**
     * Publish a comment added event.
     * 
     * @param comment The new comment
     * @param targetType Type of entity (COURSE, LESSON)
     * @param targetId ID of the target entity
     */
    public void publishCommentAdded(Comment comment, String targetType, Long targetId) {
        CommentEvent event = new CommentEvent(
                CommentEventType.ADDED,
                comment,
                targetType,
                targetId
        );
        
        Sinks.EmitResult result = commentSink.tryEmitNext(event);
        
        if (result.isFailure()) {
            log.warn("Failed to publish comment added event: {}", result);
        } else {
            log.debug("Published comment added event: commentId={}, targetType={}, targetId={}", 
                    comment.getId(), targetType, targetId);
        }
    }

    /**
     * Publish a comment updated event.
     * 
     * @param comment The updated comment
     */
    public void publishCommentUpdated(Comment comment) {
        CommentEvent event = new CommentEvent(
                CommentEventType.UPDATED,
                comment,
                comment.getCommentableType().name(),
                comment.getCommentableId()
        );
        
        Sinks.EmitResult result = commentSink.tryEmitNext(event);
        
        if (result.isFailure()) {
            log.warn("Failed to publish comment updated event: {}", result);
        } else {
            log.debug("Published comment updated event: commentId={}", comment.getId());
        }
    }

    /**
     * Publish a comment deleted event.
     * 
     * @param comment The deleted comment
     */
    public void publishCommentDeleted(Comment comment) {
        CommentEvent event = new CommentEvent(
                CommentEventType.DELETED,
                comment,
                comment.getCommentableType().name(),
                comment.getCommentableId()
        );
        
        Sinks.EmitResult result = commentSink.tryEmitNext(event);
        
        if (result.isFailure()) {
            log.warn("Failed to publish comment deleted event: {}", result);
        } else {
            log.debug("Published comment deleted event: commentId={}", comment.getId());
        }
    }

    /**
     * Get a Flux of comment events for a specific target.
     * 
     * @param targetType Type of entity (COURSE, LESSON)
     * @param targetId ID of the target entity
     * @return Flux of comment events
     */
    public Flux<CommentEvent> getCommentEventsForTarget(String targetType, Long targetId) {
        return commentSink.asFlux()
                .filter(event -> event.targetType().equals(targetType) 
                        && event.targetId().equals(targetId));
    }

    /**
     * Get a Flux of all comment events.
     * 
     * @return Flux of all comment events
     */
    public Flux<CommentEvent> getAllCommentEvents() {
        return commentSink.asFlux();
    }

    // ============================================
    // Rating Events
    // ============================================

    /**
     * Publish a rating added/updated event.
     * 
     * @param rating The new or updated rating
     * @param isNew Whether this is a new rating
     */
    public void publishRatingEvent(Rating rating, boolean isNew) {
        RatingEvent event = new RatingEvent(
                isNew ? RatingEventType.ADDED : RatingEventType.UPDATED,
                rating,
                rating.getCourse().getId()
        );
        
        Sinks.EmitResult result = ratingSink.tryEmitNext(event);
        
        if (result.isFailure()) {
            log.warn("Failed to publish rating event: {}", result);
        } else {
            log.debug("Published rating {} event: ratingId={}, courseId={}", 
                    isNew ? "added" : "updated", rating.getId(), rating.getCourse().getId());
        }
    }

    /**
     * Get a Flux of rating events for a specific course.
     * 
     * @param courseId Course ID
     * @return Flux of rating events
     */
    public Flux<RatingEvent> getRatingEventsForCourse(Long courseId) {
        return ratingSink.asFlux()
                .filter(event -> event.courseId().equals(courseId));
    }

    // ============================================
    // Like Events
    // ============================================

    /**
     * Publish a like toggle event.
     * 
     * @param targetType Type of entity (COURSE, LESSON, COMMENT)
     * @param targetId ID of the target
     * @param userId User who toggled the like
     * @param isLiked Whether the entity is now liked
     * @param newLikeCount New total like count
     */
    public void publishLikeToggled(String targetType, Long targetId, Long userId, 
                                    boolean isLiked, long newLikeCount) {
        LikeEvent event = new LikeEvent(
                targetType,
                targetId,
                userId,
                isLiked,
                newLikeCount
        );
        
        Sinks.EmitResult result = likeSink.tryEmitNext(event);
        
        if (result.isFailure()) {
            log.warn("Failed to publish like event: {}", result);
        } else {
            log.debug("Published like toggle event: targetType={}, targetId={}, liked={}", 
                    targetType, targetId, isLiked);
        }
    }

    /**
     * Get a Flux of like events for a specific target.
     * 
     * @param targetType Type of entity
     * @param targetId ID of the target
     * @return Flux of like events
     */
    public Flux<LikeEvent> getLikeEventsForTarget(String targetType, Long targetId) {
        return likeSink.asFlux()
                .filter(event -> event.targetType().equals(targetType) 
                        && event.targetId().equals(targetId));
    }

    // ============================================
    // Event Types
    // ============================================

    public enum CommentEventType {
        ADDED,
        UPDATED,
        DELETED
    }

    public enum RatingEventType {
        ADDED,
        UPDATED
    }

    // ============================================
    // Event Records
    // ============================================

    public record CommentEvent(
        CommentEventType eventType,
        Comment comment,
        String targetType,
        Long targetId
    ) {}

    public record RatingEvent(
        RatingEventType eventType,
        Rating rating,
        Long courseId
    ) {}

    public record LikeEvent(
        String targetType,
        Long targetId,
        Long userId,
        boolean isLiked,
        long likeCount
    ) {}
}

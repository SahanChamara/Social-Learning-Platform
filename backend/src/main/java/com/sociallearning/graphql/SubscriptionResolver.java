package com.sociallearning.graphql;

import com.sociallearning.enums.CommentableType;
import com.sociallearning.enums.LikeableType;
import com.sociallearning.service.SubscriptionPublisher;
import com.sociallearning.service.SubscriptionPublisher.CommentEvent;
import com.sociallearning.service.SubscriptionPublisher.LikeEvent;
import com.sociallearning.service.SubscriptionPublisher.RatingEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;

/**
 * GraphQL resolver for subscription operations.
 * 
 * Handles real-time subscriptions for:
 * - Comment events (added, updated, deleted)
 * - Like toggle events
 * - Rating events (added, updated)
 * 
 * Uses WebSocket transport for persistent connections.
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class SubscriptionResolver {

    private final SubscriptionPublisher subscriptionPublisher;

    // ============================================
    // Comment Subscriptions
    // ============================================

    /**
     * Subscribe to new comments on a specific target.
     * Only returns ADDED events.
     * 
     * GraphQL Subscription:
     * subscription OnCommentAdded($targetType: CommentableType!, $targetId: ID!) {
     *   commentAdded(targetType: $targetType, targetId: $targetId) {
     *     eventType
     *     comment {
     *       id
     *       content
     *       user { id username avatarUrl }
     *       createdAt
     *     }
     *     targetType
     *     targetId
     *   }
     * }
     */
    @SubscriptionMapping
    public Flux<CommentEvent> commentAdded(
            @Argument String targetType,
            @Argument Long targetId) {
        
        log.info("New subscription: commentAdded(targetType={}, targetId={})", targetType, targetId);
        
        return subscriptionPublisher.getCommentEventsForTarget(targetType, targetId)
                .filter(event -> event.eventType() == SubscriptionPublisher.CommentEventType.ADDED)
                .doOnSubscribe(s -> log.debug("Client subscribed to commentAdded: targetType={}, targetId={}", 
                        targetType, targetId))
                .doOnCancel(() -> log.debug("Client unsubscribed from commentAdded: targetType={}, targetId={}", 
                        targetType, targetId));
    }

    /**
     * Subscribe to all comment events on a specific target.
     * Returns ADDED, UPDATED, and DELETED events.
     * 
     * GraphQL Subscription:
     * subscription OnCommentEvents($targetType: CommentableType!, $targetId: ID!) {
     *   commentEvents(targetType: $targetType, targetId: $targetId) {
     *     eventType
     *     comment {
     *       id
     *       content
     *       isDeleted
     *       isEdited
     *     }
     *     targetType
     *     targetId
     *   }
     * }
     */
    @SubscriptionMapping
    public Flux<CommentEvent> commentEvents(
            @Argument String targetType,
            @Argument Long targetId) {
        
        log.info("New subscription: commentEvents(targetType={}, targetId={})", targetType, targetId);
        
        return subscriptionPublisher.getCommentEventsForTarget(targetType, targetId)
                .doOnSubscribe(s -> log.debug("Client subscribed to commentEvents: targetType={}, targetId={}", 
                        targetType, targetId))
                .doOnCancel(() -> log.debug("Client unsubscribed from commentEvents: targetType={}, targetId={}", 
                        targetType, targetId));
    }

    // ============================================
    // Like Subscriptions
    // ============================================

    /**
     * Subscribe to like toggle events on a specific target.
     * 
     * GraphQL Subscription:
     * subscription OnLikeToggled($targetType: LikeableType!, $targetId: ID!) {
     *   likeToggled(targetType: $targetType, targetId: $targetId) {
     *     targetType
     *     targetId
     *     userId
     *     isLiked
     *     likeCount
     *   }
     * }
     */
    @SubscriptionMapping
    public Flux<LikeEvent> likeToggled(
            @Argument String targetType,
            @Argument Long targetId) {
        
        log.info("New subscription: likeToggled(targetType={}, targetId={})", targetType, targetId);
        
        return subscriptionPublisher.getLikeEventsForTarget(targetType, targetId)
                .doOnSubscribe(s -> log.debug("Client subscribed to likeToggled: targetType={}, targetId={}", 
                        targetType, targetId))
                .doOnCancel(() -> log.debug("Client unsubscribed from likeToggled: targetType={}, targetId={}", 
                        targetType, targetId));
    }

    // ============================================
    // Rating Subscriptions
    // ============================================

    /**
     * Subscribe to rating events for a specific course.
     * Returns ADDED and UPDATED events.
     * 
     * GraphQL Subscription:
     * subscription OnRatingEvent($courseId: ID!) {
     *   ratingEvent(courseId: $courseId) {
     *     eventType
     *     rating {
     *       id
     *       ratingValue
     *       reviewTitle
     *       reviewContent
     *       user { id username avatarUrl }
     *       isVerifiedPurchase
     *       createdAt
     *     }
     *     courseId
     *   }
     * }
     */
    @SubscriptionMapping
    public Flux<RatingEvent> ratingEvent(@Argument Long courseId) {
        log.info("New subscription: ratingEvent(courseId={})", courseId);
        
        return subscriptionPublisher.getRatingEventsForCourse(courseId)
                .doOnSubscribe(s -> log.debug("Client subscribed to ratingEvent: courseId={}", courseId))
                .doOnCancel(() -> log.debug("Client unsubscribed from ratingEvent: courseId={}", courseId));
    }
}

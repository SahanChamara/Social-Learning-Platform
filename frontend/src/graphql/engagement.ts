import { gql } from '@apollo/client';
import { USER_FRAGMENT } from './auth';

// ============================================
// GraphQL Fragments
// ============================================

/**
 * Comment information used by engagement operations.
 */
export const COMMENT_FRAGMENT = gql`
  ${USER_FRAGMENT}
  fragment CommentFields on Comment {
    id
    content
    commentableType
    commentableId
    user {
      ...UserFields
    }
    parent {
      id
    }
    depthLevel
    likeCount
    replyCount
    isEdited
    isDeleted
    isPinned
    isLikedByMe
    createdAt
    updatedAt
    editedAt
  }
`;

/**
 * Rating information used by engagement operations.
 */
export const RATING_FRAGMENT = gql`
  ${USER_FRAGMENT}
  fragment RatingFields on Rating {
    id
    ratingValue
    reviewTitle
    reviewContent
    helpfulCount
    isEdited
    isVerifiedPurchase
    isFeatured
    user {
      ...UserFields
    }
    course {
      id
      averageRating
      ratingCount
    }
    adminResponse
    adminRespondedAt
    createdAt
    updatedAt
    editedAt
  }
`;

/**
 * Comment event payload used by comment subscriptions.
 */
export const COMMENT_EVENT_FRAGMENT = gql`
  ${COMMENT_FRAGMENT}
  fragment CommentEventFields on CommentEvent {
    eventType
    comment {
      ...CommentFields
    }
    targetType
    targetId
  }
`;

// ============================================
// GraphQL Mutations
// ============================================

/**
 * Add a new comment to a course, lesson, or comment thread.
 */
export const ADD_COMMENT_MUTATION = gql`
  ${COMMENT_FRAGMENT}
  mutation AddComment($input: AddCommentInput!) {
    addComment(input: $input) {
      ...CommentFields
    }
  }
`;

/**
 * Toggle like status for a target (course, lesson, comment).
 */
export const TOGGLE_LIKE_MUTATION = gql`
  mutation ToggleLike($targetType: LikeableType!, $targetId: ID!) {
    toggleLike(targetType: $targetType, targetId: $targetId) {
      liked
      likeCount
    }
  }
`;

/**
 * Create or update the current user's rating for a course.
 */
export const RATE_COURSE_MUTATION = gql`
  ${RATING_FRAGMENT}
  mutation RateCourse($input: RateCourseInput!) {
    rateCourse(input: $input) {
      ...RatingFields
    }
  }
`;

// ============================================
// GraphQL Subscriptions
// ============================================

/**
 * Subscribe to newly-added comments for a target.
 */
export const COMMENT_ADDED_SUBSCRIPTION = gql`
  ${COMMENT_EVENT_FRAGMENT}
  subscription CommentAdded($targetType: CommentableType!, $targetId: ID!) {
    commentAdded(targetType: $targetType, targetId: $targetId) {
      ...CommentEventFields
    }
  }
`;

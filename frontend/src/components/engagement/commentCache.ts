export type CommentableType = 'COURSE' | 'LESSON';

export interface UserSummary {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface CommentNode {
  id: string;
  content: string;
  commentableType?: string;
  commentableId?: string;
  user: UserSummary;
  parent?: { id: string } | null;
  depthLevel: number;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  isLikedByMe?: boolean;
  createdAt: string;
  updatedAt?: string;
  editedAt?: string | null;
  replies: CommentNode[];
}

export interface CommentPageData {
  content: CommentNode[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CommentsQueryResponse {
  comments: CommentPageData;
}

export interface CommentsQueryVariables {
  targetType: CommentableType;
  targetId: string;
  page?: number;
  size?: number;
}

export function commentExists(comments: CommentNode[], commentId: string): boolean {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return true;
    }
    if (commentExists(comment.replies, commentId)) {
      return true;
    }
  }
  return false;
}

export function appendReply(
  comments: CommentNode[],
  reply: CommentNode,
): { updated: CommentNode[]; inserted: boolean } {
  let inserted = false;

  const updated = comments.map((comment) => {
    if (comment.id === reply.parent?.id) {
      inserted = true;
      return {
        ...comment,
        replyCount: comment.replyCount + 1,
        replies: [reply, ...comment.replies],
      };
    }

    if (comment.replies.length === 0) {
      return comment;
    }

    const nested = appendReply(comment.replies, reply);
    if (!nested.inserted) {
      return comment;
    }

    inserted = true;
    return {
      ...comment,
      replies: nested.updated,
    };
  });

  return { updated, inserted };
}

export function insertCommentIntoPage(
  previous: CommentsQueryResponse,
  incomingComment: CommentNode,
): CommentsQueryResponse {
  if (commentExists(previous.comments.content, incomingComment.id)) {
    return previous;
  }

  if (incomingComment.parent?.id) {
    const appended = appendReply(previous.comments.content, incomingComment);
    if (!appended.inserted) {
      return previous;
    }

    return {
      ...previous,
      comments: {
        ...previous.comments,
        content: appended.updated,
      },
    };
  }

  return {
    ...previous,
    comments: {
      ...previous.comments,
      content: [incomingComment, ...previous.comments.content],
      totalElements: previous.comments.totalElements + 1,
    },
  };
}

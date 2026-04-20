import { useApolloClient, useQuery, useSubscription } from '@apollo/client/react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import { useMemo, useState } from 'react';
import { COMMENTS_QUERY, COMMENT_ADDED_SUBSCRIPTION } from '@/graphql';

type CommentableType = 'COURSE' | 'LESSON';

interface UserSummary {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
}

interface CommentNode {
  id: string;
  content: string;
  user: UserSummary;
  parent?: { id: string } | null;
  depthLevel: number;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  createdAt: string;
  replies: CommentNode[];
}

interface CommentPageData {
  content: CommentNode[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface CommentsQueryResponse {
  comments: CommentPageData;
}

interface CommentsQueryVariables {
  targetType: CommentableType;
  targetId: string;
  page?: number;
  size?: number;
}

interface CommentAddedSubscriptionResponse {
  commentAdded: {
    comment: Omit<CommentNode, 'replies'>;
  };
}

interface CommentAddedSubscriptionVariables {
  targetType: CommentableType;
  targetId: string;
}

interface CommentListProps {
  targetType: CommentableType;
  targetId: string;
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
}

function formatCommentTime(dateValue: string): string {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return 'just now';
  }
  return formatDistanceToNow(parsed, { addSuffix: true });
}

function authorInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

function commentExists(comments: CommentNode[], commentId: string): boolean {
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

function appendReply(comments: CommentNode[], reply: CommentNode): { updated: CommentNode[]; inserted: boolean } {
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

function initialsOrFallback(fullName: string, username: string): string {
  const initials = authorInitials(fullName);
  if (initials.length > 0) {
    return initials;
  }
  return username.slice(0, 2).toUpperCase();
}

function CommentThread({
  comments,
  depth,
}: Readonly<{ comments: CommentNode[]; depth: number }>) {
  const [openState, setOpenState] = useState<Record<string, boolean>>({});

  return (
    <div className={depth > 0 ? 'mt-3 border-l border-slate-200 pl-4 sm:pl-5' : 'space-y-4'}>
      {comments.map((comment) => {
        const repliesCount = comment.replies.length;
        const isOpen = openState[comment.id] ?? true;

        return (
          <article key={comment.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
            <header className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {initialsOrFallback(comment.user.fullName, comment.user.username)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{comment.user.fullName}</p>
                  <p className="text-xs text-slate-500">
                    @{comment.user.username} · {formatCommentTime(comment.createdAt)}
                    {comment.isEdited ? ' · edited' : ''}
                  </p>
                </div>
              </div>
              {comment.isPinned && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                  Pinned
                </span>
              )}
            </header>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {comment.isDeleted ? 'This comment has been deleted.' : comment.content}
            </p>

            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
              <span>{comment.likeCount} likes</span>
              <span>{comment.replyCount} replies</span>
            </div>

            {repliesCount > 0 && (
              <Collapsible.Root
                open={isOpen}
                onOpenChange={(open) => {
                  setOpenState((previous) => ({
                    ...previous,
                    [comment.id]: open,
                  }));
                }}
                className="mt-3"
              >
                <Collapsible.Trigger className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800">
                  {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  {isOpen ? 'Hide replies' : 'Show replies'} ({repliesCount})
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <CommentThread comments={comment.replies} depth={depth + 1} />
                </Collapsible.Content>
              </Collapsible.Root>
            )}
          </article>
        );
      })}
    </div>
  );
}

export function CommentList({
  targetType,
  targetId,
  pageSize = 20,
  className,
  emptyMessage = 'No comments yet. Start the conversation.',
}: Readonly<CommentListProps>) {
  const client = useApolloClient();
  const variables = useMemo<CommentsQueryVariables>(
    () => ({
      targetType,
      targetId,
      page: 0,
      size: pageSize,
    }),
    [pageSize, targetId, targetType],
  );

  const { data, loading, error } = useQuery<CommentsQueryResponse, CommentsQueryVariables>(
    COMMENTS_QUERY,
    {
      variables,
      notifyOnNetworkStatusChange: true,
    },
  );

  useSubscription<CommentAddedSubscriptionResponse, CommentAddedSubscriptionVariables>(
    COMMENT_ADDED_SUBSCRIPTION,
    {
      variables: {
        targetType,
        targetId,
      },
      onData: ({ data: subscriptionPayload }) => {
        const incomingComment = subscriptionPayload.data?.commentAdded.comment;
        if (!incomingComment) {
          return;
        }

        const normalizedIncoming: CommentNode = {
          ...incomingComment,
          replies: [],
        };

        client.cache.updateQuery<CommentsQueryResponse, CommentsQueryVariables>(
          {
            query: COMMENTS_QUERY,
            variables,
          },
          (previous) => {
            if (!previous?.comments) {
              return previous;
            }

            if (commentExists(previous.comments.content, normalizedIncoming.id)) {
              return previous;
            }

            if (normalizedIncoming.parent?.id) {
              const appended = appendReply(previous.comments.content, normalizedIncoming);
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
                content: [normalizedIncoming, ...previous.comments.content],
                totalElements: previous.comments.totalElements + 1,
              },
            };
          },
        );
      },
    },
  );

  if (loading && !data) {
    return (
      <section className={className}>
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
          <div className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
        </div>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className={className}>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load comments right now.
        </div>
      </section>
    );
  }

  const comments = data?.comments.content ?? [];

  if (comments.length === 0) {
    return (
      <section className={className}>
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <MessageSquare className="mx-auto h-5 w-5 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">{emptyMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      <CommentThread comments={comments} depth={0} />
    </section>
  );
}

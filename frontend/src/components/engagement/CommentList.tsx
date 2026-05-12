import { useApolloClient, useQuery, useSubscription } from '@apollo/client/react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import { useMemo, useState } from 'react';
import { COMMENT_ADDED_SUBSCRIPTION, COMMENTS_QUERY } from '@/graphql';
import { SkeletonCommentList } from '@/components/skeletons';
import { CommentForm } from './CommentForm';
import { LikeButton } from './LikeButton';
import type { CommentNode, CommentableType, CommentsQueryResponse, CommentsQueryVariables } from './commentCache';
import { insertCommentIntoPage } from './commentCache';

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

function initialsOrFallback(fullName: string, username: string): string {
  const initials = authorInitials(fullName);
  if (initials.length > 0) {
    return initials;
  }
  return username.slice(0, 2).toUpperCase();
}

interface CommentThreadProps {
  comments: CommentNode[];
  depth: number;
  targetType: CommentableType;
  targetId: string;
  pageSize: number;
}

function CommentThread({ comments, depth, targetType, targetId, pageSize }: Readonly<CommentThreadProps>) {
  const [openState, setOpenState] = useState<Record<string, boolean>>({});
  const [replyFormOpen, setReplyFormOpen] = useState<Record<string, boolean>>({});

  return (
    <div className={depth > 0 ? 'mt-3 border-l border-slate-200 pl-4 sm:pl-5' : 'space-y-4'}>
      {comments.map((comment) => {
        const repliesCount = comment.replies.length;
        const isOpen = openState[comment.id] ?? true;
        const isReplyOpen = replyFormOpen[comment.id] ?? false;

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
              {!comment.isDeleted ? (
                <LikeButton
                  targetType="COMMENT"
                  targetId={comment.id}
                  initialLiked={comment.isLikedByMe ?? false}
                  initialLikeCount={comment.likeCount}
                  className="inline-flex"
                />
              ) : (
                <span>{comment.likeCount} likes</span>
              )}
              <span>{comment.replyCount} replies</span>
            </div>

            {!comment.isDeleted && depth < 5 && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setReplyFormOpen((previous) => ({
                      ...previous,
                      [comment.id]: !isReplyOpen,
                    }));
                  }}
                  className="text-xs font-semibold text-blue-700 transition hover:text-blue-800"
                >
                  {isReplyOpen ? 'Cancel reply' : 'Reply'}
                </button>
              </div>
            )}

            {isReplyOpen && (
              <div className="mt-3">
                <CommentForm
                  targetType={targetType}
                  targetId={targetId}
                  parentCommentId={comment.id}
                  pageSize={pageSize}
                  submitLabel="Post reply"
                  onCancel={() => {
                    setReplyFormOpen((previous) => ({
                      ...previous,
                      [comment.id]: false,
                    }));
                  }}
                  onSubmitted={() => {
                    setReplyFormOpen((previous) => ({
                      ...previous,
                      [comment.id]: false,
                    }));
                    setOpenState((previous) => ({
                      ...previous,
                      [comment.id]: true,
                    }));
                  }}
                />
              </div>
            )}

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
                  <CommentThread
                    comments={comment.replies}
                    depth={depth + 1}
                    targetType={targetType}
                    targetId={targetId}
                    pageSize={pageSize}
                  />
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

  const { data, loading, error } = useQuery<CommentsQueryResponse, CommentsQueryVariables>(COMMENTS_QUERY, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  useSubscription<CommentAddedSubscriptionResponse, CommentAddedSubscriptionVariables>(COMMENT_ADDED_SUBSCRIPTION, {
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
          return insertCommentIntoPage(previous, normalizedIncoming);
        },
      );
    },
  });

  if (loading && !data) {
    return (
      <section className={className}>
        <SkeletonCommentList />
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
      <CommentThread comments={comments} depth={0} targetType={targetType} targetId={targetId} pageSize={pageSize} />
    </section>
  );
}

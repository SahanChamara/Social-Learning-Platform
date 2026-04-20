import { useMutation } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ADD_COMMENT_MUTATION, COMMENTS_QUERY } from '@/graphql';
import { useAuth } from '@/hooks';
import { useToast } from '@/hooks/useToast';
import type { User } from '@/types/auth';
import type { CommentNode, CommentableType, CommentsQueryResponse, CommentsQueryVariables } from './commentCache';
import { insertCommentIntoPage } from './commentCache';

interface AddCommentMutationResponse {
  addComment: Omit<CommentNode, 'replies'>;
}

interface AddCommentMutationVariables {
  input: {
    content: string;
    targetType: CommentableType;
    targetId: string;
    parentCommentId?: string;
  };
}

interface CommentFormProps {
  targetType: CommentableType;
  targetId: string;
  parentCommentId?: string;
  pageSize?: number;
  className?: string;
  placeholder?: string;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmitted?: (commentId: string) => void;
}

function toOptimisticUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    bio: user.bio ?? null,
    expertise: user.expertise ?? null,
    isVerified: user.isVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export function CommentForm({
  targetType,
  targetId,
  parentCommentId,
  pageSize = 20,
  className,
  placeholder,
  submitLabel = 'Post comment',
  onCancel,
  onSubmitted,
}: Readonly<CommentFormProps>) {
  const [content, setContent] = useState('');
  const { toast } = useToast();
  const { isAuthenticated, user, isLoading } = useAuth();

  const queryVariables = useMemo<CommentsQueryVariables>(
    () => ({
      targetType,
      targetId,
      page: 0,
      size: pageSize,
    }),
    [pageSize, targetId, targetType],
  );

  const [addComment, { loading }] = useMutation<AddCommentMutationResponse, AddCommentMutationVariables>(
    ADD_COMMENT_MUTATION,
    {
      update(cache, { data }) {
        const incoming = data?.addComment;
        if (!incoming) {
          return;
        }

        const normalizedIncoming: CommentNode = {
          ...incoming,
          replies: [],
        };

        cache.updateQuery<CommentsQueryResponse, CommentsQueryVariables>(
          {
            query: COMMENTS_QUERY,
            variables: queryVariables,
          },
          (previous) => {
            if (!previous?.comments) {
              return previous;
            }
            return insertCommentIntoPage(previous, normalizedIncoming);
          },
        );
      },
    },
  );

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          You need to{' '}
          <Link to="/auth/login" className="font-semibold text-blue-700 hover:text-blue-800">
            sign in
          </Link>{' '}
          to post comments.
        </div>
      </div>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    const optimisticId = `temp-comment-${Date.now()}`;
    const nowIso = new Date().toISOString();

    try {
      const result = await addComment({
        variables: {
          input: {
            content: trimmed,
            targetType,
            targetId,
            parentCommentId,
          },
        },
        optimisticResponse: {
          addComment: {
            id: optimisticId,
            content: trimmed,
            commentableType: targetType,
            commentableId: targetId,
            user: toOptimisticUser(user),
            parent: parentCommentId ? { id: parentCommentId } : null,
            depthLevel: parentCommentId ? 1 : 0,
            likeCount: 0,
            replyCount: 0,
            isEdited: false,
            isDeleted: false,
            isPinned: false,
            isLikedByMe: false,
            createdAt: nowIso,
            updatedAt: nowIso,
            editedAt: null,
          },
        },
      });

      setContent('');
      onSubmitted?.(result.data?.addComment.id ?? optimisticId);
    } catch {
      toast({
        title: 'Unable to post comment',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={submit} className={className}>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={placeholder ?? (parentCommentId ? 'Write a reply...' : 'Write a comment...')}
        rows={parentCommentId ? 3 : 4}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-hidden transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
      <div className="mt-2 flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || content.trim().length === 0}
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Posting...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

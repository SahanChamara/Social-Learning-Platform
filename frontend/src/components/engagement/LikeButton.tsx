import { useMutation } from '@apollo/client/react';
import * as Toggle from '@radix-ui/react-toggle';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TOGGLE_LIKE_MUTATION } from '@/graphql';
import { useAuth } from '@/hooks';
import { useToast } from '@/hooks/useToast';

type LikeableType = 'COURSE' | 'LESSON' | 'COMMENT';

interface ToggleLikeMutationResponse {
  toggleLike: {
    liked: boolean;
    likeCount: number;
  };
}

interface ToggleLikeMutationVariables {
  targetType: LikeableType;
  targetId: string;
}

interface LikeButtonProps {
  targetType: LikeableType;
  targetId: string;
  initialLiked?: boolean;
  initialLikeCount?: number;
  showCount?: boolean;
  className?: string;
}

export function LikeButton({
  targetType,
  targetId,
  initialLiked = false,
  initialLikeCount = 0,
  showCount = true,
  className,
}: Readonly<LikeButtonProps>) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  const [toggleLike, { loading }] = useMutation<ToggleLikeMutationResponse, ToggleLikeMutationVariables>(
    TOGGLE_LIKE_MUTATION,
  );

  const handleToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like this content.',
      });
      return;
    }

    if (loading) {
      return;
    }

    const previousLiked = liked;
    const previousCount = likeCount;
    const nextLiked = !previousLiked;
    const nextCount = Math.max(0, previousCount + (nextLiked ? 1 : -1));

    setLiked(nextLiked);
    setLikeCount(nextCount);

    try {
      const { data } = await toggleLike({
        variables: {
          targetType,
          targetId,
        },
        optimisticResponse: {
          toggleLike: {
            liked: nextLiked,
            likeCount: nextCount,
          },
        },
      });

      if (data?.toggleLike) {
        setLiked(data.toggleLike.liked);
        setLikeCount(data.toggleLike.likeCount);
      }
    } catch {
      setLiked(previousLiked);
      setLikeCount(previousCount);
      toast({
        title: 'Unable to update like',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={className}>
      <Toggle.Root
        type="button"
        pressed={liked}
        onPressedChange={handleToggle}
        aria-label={liked ? 'Unlike' : 'Like'}
        className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-xs font-medium text-slate-600 transition hover:text-rose-600 data-[state=on]:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
      >
        <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
        {showCount ? <span>{likeCount}</span> : null}
      </Toggle.Root>
    </div>
  );
}

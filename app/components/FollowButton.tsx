'use client';

import { useState, useTransition } from 'react';
import { toggleFollow } from '@/app/actions';

export default function FollowButton({ 
  username, 
  initialFollowing 
}: { 
  username: string; 
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  const handleFollow = () => {
    startTransition(async () => {
      const result = await toggleFollow(username);
      if (result.success) {
        setFollowing(result.following || false);
      }
    });
  };

  return (
    <button 
      onClick={handleFollow}
      disabled={isPending}
      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded font-mono font-bold text-xs sm:text-sm transition-colors disabled:opacity-50 ${
        following 
          ? 'border border-[#00ff41]/30 text-[#00ff41] hover:bg-red-500/10 hover:border-red-500 hover:text-red-500' 
          : 'military-border bg-[#00ff41]/10 text-[#00ff41] hover:bg-[#00ff41]/20'
      }`}
    >
      {isPending ? '[ ... ]' : following ? '[ FOLLOWING ]' : '[ FOLLOW ]'}
    </button>
  );
}

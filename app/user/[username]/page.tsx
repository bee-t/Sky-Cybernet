import { notFound, redirect } from 'next/navigation';
import prisma from '@/app/lib/db';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';
import ProfileTabs from '@/app/components/ProfileTabs';
import FollowButton from '@/app/components/FollowButton';
import ProfilePageHeader from '@/app/components/ProfilePageHeader';
import { getUserReplies, getUserLikes, getUserReposts, getUserMedia } from '@/app/actions';
import { getCurrentUser } from '@/app/lib/auth';

async function getUser(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatar: true,
      verified: true,
      location: true,
      website: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
  };
}

async function getUserPosts(userId: string) {
  const posts = await prisma.post.findMany({
    where: {
      authorId: userId,
      parentId: null, // Only top-level posts
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          verified: true,
        },
      },
      media: true,
      reactions: {
        select: {
          id: true,
          userId: true,
          type: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const currentUser = await getCurrentUser();

  return posts.map(post => {
    const userLiked = currentUser ? post.reactions.some(r => r.userId === currentUser.id && r.type === 'like') : false;
    const userReposted = currentUser ? post.reactions.some(r => r.userId === currentUser.id && r.type === 'repost') : false;

    return {
      ...post,
      createdAt: post.createdAt.toISOString(),
      media: post.media.map(m => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
      userLiked,
      userReposted,
      likeCount: post.reactions.filter(r => r.type === 'like').length,
      repostCount: post.reactions.filter(r => r.type === 'repost').length,
      replyCount: post._count.replies,
      reactions: undefined,
      _count: undefined,
    };
  });
}

async function isFollowing(targetUsername: string) {
  const currentUser = await getCurrentUser();
  const targetUser = await prisma.user.findUnique({ where: { username: targetUsername } });

  if (!currentUser || !targetUser) return false;

  const follow = await prisma.follows.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUser.id,
        followingId: targetUser.id,
      },
    },
  });

  return !!follow;
}

export default async function UserProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  // Check authentication first
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/auth/login');
  }
  
  const user = await getUser(username);
  
  if (!user) {
    notFound();
  }

  // Fetch all user activity data
  const [posts, replies, likes, reposts, media, following] = await Promise.all([
    getUserPosts(user.id),
    getUserReplies(username),
    getUserLikes(username),
    getUserReposts(username),
    getUserMedia(username),
    isFollowing(username),
  ]);
  
  const isOwnProfile = currentUser?.username === username;

  const joinDate = new Date(user.createdAt);
  const joinDateStr = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(joinDate);

  return (
    <div className="min-h-screen bg-black relative z-10">
      <div className="max-w-2xl mx-auto border-x border-[#00ff41]/20 min-h-screen relative">
        {/* Header with Mobile Nav */}
        <ProfilePageHeader 
          displayName={user.displayName}
          postCount={user._count.posts}
        />

        {/* Cover Photo */}
        <div className="h-24 sm:h-48 lg:h-56 bg-black border-b border-[#00ff41]/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>

        {/* Profile Info */}
        <div className="px-2 sm:px-4 relative">
          {/* Avatar - Centered */}
          <div className="flex justify-center -mt-10 sm:-mt-16 lg:-mt-20 mb-3 sm:mb-6">
            <div className="w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded border-4 border-[#00ff41] bg-black flex items-center justify-center shadow-xl shadow-[#00ff41]/30 relative z-10">
              <svg className="w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-[#00ff41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          {/* Follow/Edit Button - Positioned properly for all screens */}
          <div className="flex justify-center sm:justify-end sm:absolute sm:top-2 sm:right-4 mb-3 sm:mb-0">
            {isOwnProfile ? (
              <button className="px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-[#00ff41] bg-black hover:bg-[#00ff41] hover:text-black rounded font-mono text-[#00ff41] transition-all duration-200 text-xs sm:text-sm">
                [ CONFIGURE ]
              </button>
            ) : (
              <FollowButton username={username} initialFollowing={following} />
            )}
          </div>

          {/* User Details - Centered */}
          <div className="mb-2 sm:mb-4 text-center">
            <h2 className="text-lg sm:text-2xl font-bold text-[#00ff41] font-mono tracking-wide military-glow">{user.displayName}</h2>
            <p className="text-xs sm:text-base text-[#00ff41]/60 font-mono">@{user.username}</p>
          </div>

          {user.bio && (
            <p className="mb-2 sm:mb-3 whitespace-pre-wrap text-[#00ff41]/80 font-mono text-center text-xs sm:text-sm">{user.bio}</p>
          )}

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-[#00ff41]/60 text-xs sm:text-sm mb-2 sm:mb-3 font-mono">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-[#00ff41]/70" />
                <span className="truncate max-w-[120px] sm:max-w-none">{user.location}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-1 min-w-0">
                <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 text-[#00ff41]/70 flex-shrink-0" />
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-[#00ff41] hover:text-[#00ff41]/80 hover:underline transition-colors truncate">
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#00ff41]/70" />
              <span className="whitespace-nowrap">Connected {joinDateStr}</span>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm mb-3 sm:mb-4 font-mono justify-center">
            <Link href={`/user/${user.username}/following`} className="hover:underline">
              <span className="font-bold text-[#00ff41]">{user._count.following}</span> <span className="text-[#00ff41]/60">Following</span>
            </Link>
            <Link href={`/user/${user.username}/followers`} className="hover:underline">
              <span className="font-bold text-[#00ff41]">{user._count.followers}</span> <span className="text-[#00ff41]/60">Followers</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <ProfileTabs 
          posts={posts} 
          replies={replies}
          likes={likes}
          reposts={reposts}
          media={media}
          username={user.username}
          currentUserId={currentUser.id}
        />
      </div>
    </div>
  );
}

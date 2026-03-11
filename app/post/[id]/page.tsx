import { notFound, redirect } from 'next/navigation';
import prisma from '@/app/lib/db';
import PostDetail from '@/app/components/PostDetail';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '@/app/lib/auth';

async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
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
    },
  });

  if (!post) return null;

  // Get current user for reaction status
  const currentUser = await getCurrentUser();
  
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
    reactions: undefined,
  };
}

async function getReplies(postId: string) {
  const replies = await prisma.post.findMany({
    where: { parentId: postId },
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
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const currentUser = await prisma.user.findFirst({ where: { username: 'alice' } });

  return replies.map(reply => {
    const userLiked = currentUser ? reply.reactions.some(r => r.userId === currentUser.id && r.type === 'like') : false;
    const userReposted = currentUser ? reply.reactions.some(r => r.userId === currentUser.id && r.type === 'repost') : false;

    return {
      ...reply,
      createdAt: reply.createdAt.toISOString(),
      media: reply.media.map(m => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
      userLiked,
      userReposted,
      reactions: undefined,
    };
  });
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Check authentication first
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/auth/login');
  }
  
  const post = await getPost(id);
  
  if (!post) {
    notFound();
  }

  const replies = await getReplies(id);

  return (
    <div className="min-h-screen bg-black relative z-10">
      <div className="max-w-2xl mx-auto border-x border-[#00ff41]/20 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-lg bg-black/90 border-b-2 border-[#00ff41]/30 shadow-[0_2px_10px_rgba(0,255,65,0.1)]">
          <div className="flex items-center gap-4 p-4">
            <Link href="/" className="hover:bg-[#00ff41]/10 rounded-lg p-2 -m-2 transition-all duration-200">
              <ArrowLeft className="w-5 h-5 text-[#00ff41]/70 hover:text-[#00ff41]" />
            </Link>
            <h1 className="text-xl font-bold text-[#00ff41] font-mono tracking-widest">TRANSMISSION</h1>
          </div>
        </div>

        {/* Main post */}
        <PostDetail post={post} currentUserId={currentUser.id} />

        {/* Replies */}
        {replies.length > 0 && (
          <div className="border-t-8 border-[#00ff41]/10">
            <div className="divide-y divide-[#00ff41]/20">
              {replies.map((reply) => (
                <PostDetail key={reply.id} post={reply} isReply currentUserId={currentUser.id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

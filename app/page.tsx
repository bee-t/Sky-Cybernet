import { redirect } from 'next/navigation';
import ComposeBox from './components/ComposeBox';
import Feed from './components/Feed';
import PageHeader from './components/PageHeader';
import prisma from './lib/db';
import { getCurrentUser } from './lib/auth';

async function getInitialPosts() {
  const posts = await prisma.post.findMany({
    where: {
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
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });
  
  // Get current user
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
      reactions: undefined,
    };
  });
}

export default async function Home() {
  const currentUser = await getCurrentUser();
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    redirect('/auth/login');
  }
  
  const initialPosts = await getInitialPosts();

  return (
    <div className="min-h-screen relative z-10">
      <PageHeader currentUser={currentUser} />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          {/* Main Feed - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-6">
            {/* Compose Terminal */}
            <ComposeBox />
            
            {/* Mission Briefings Feed */}
            <Feed initialPosts={initialPosts} currentUserId={currentUser.id} />
          </div>

          {/* Tactical Info Sidebar */}
          <div className="hidden lg:block space-y-4">
            {/* System Status */}
            <div className="border-2 border-[#00ff41]/30 bg-black/50 backdrop-blur-sm p-4 rounded">
              <h3 className="text-[#00ff41] font-mono font-bold text-sm mb-3 flex items-center gap-2">
                <span className="text-lg">◆</span> SYSTEM STATUS
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#00ff41]/60">Network:</span>
                  <span className="text-[#00ff41]">SECURE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#00ff41]/60">Encryption:</span>
                  <span className="text-[#00ff41]">AES-256</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#00ff41]/60">Active Users:</span>
                  <span className="text-[#00ff41]">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#00ff41]/60">Uptime:</span>
                  <span className="text-[#00ff41]">99.9%</span>
                </div>
              </div>
            </div>

            {/* Quick Commands */}
            <div className="border-2 border-[#00ff41]/30 bg-black/50 backdrop-blur-sm p-4 rounded">
              <h3 className="text-[#00ff41] font-mono font-bold text-sm mb-3 flex items-center gap-2">
                <span className="text-lg">◆</span> QUICK ACCESS
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <button className="w-full text-left px-3 py-2 border border-[#00ff41]/30 hover:border-[#00ff41] hover:bg-[#00ff41]/10 transition-all rounded text-[#00ff41]/80 hover:text-[#00ff41]">
                  &gt; View All Transmissions
                </button>
                <button className="w-full text-left px-3 py-2 border border-[#00ff41]/30 hover:border-[#00ff41] hover:bg-[#00ff41]/10 transition-all rounded text-[#00ff41]/80 hover:text-[#00ff41]">
                  &gt; Active Operations
                </button>
                <button className="w-full text-left px-3 py-2 border border-[#00ff41]/30 hover:border-[#00ff41] hover:bg-[#00ff41]/10 transition-all rounded text-[#00ff41]/80 hover:text-[#00ff41]">
                  &gt; Personnel Directory
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


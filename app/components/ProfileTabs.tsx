'use client';

import { useState } from 'react';
import PostDetail from './PostDetail';

type Media = {
  id: string;
  type: string;
  url: string;
  width?: number | null;
  height?: number | null;
  createdAt: string;
};

type Post = {
  id: string;
  content: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  repostCount: number;
  userLiked: boolean;
  userReposted: boolean;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string | null;
    verified: boolean;
  };
  media: Media[];
};

type ParentPost = {
  id: string;
  content: string;
  author: {
    username: string;
    displayName: string;
  };
};

type Reply = Post & {
  parent: ParentPost | null;
};

type TabType = 'posts' | 'replies' | 'media' | 'likes' | 'reposts';

export default function ProfileTabs({ 
  posts, 
  replies,
  likes,
  reposts,
  media,
  username,
  currentUserId
}: { 
  posts: Post[]; 
  replies: Reply[];
  likes: Post[];
  reposts: Post[];
  media: Post[];
  username: string;
  currentUserId?: string;
}) {
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'posts', label: 'Transmissions', count: posts.length },
    { id: 'replies', label: 'Responses', count: replies.length },
    { id: 'reposts', label: 'Reposts', count: reposts.length },
    { id: 'likes', label: 'Approvals', count: likes.length },
    { id: 'media', label: 'Media', count: media.length },
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-[#00ff41]/20 flex overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-fit py-3 sm:py-4 px-2 sm:px-4 font-mono text-[10px] sm:text-sm hover:bg-[#00ff41]/10 transition-all duration-200 relative ${ 
              activeTab === tab.id ? 'text-[#00ff41]' : 'text-[#00ff41]/60'
            }`}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.count > 0 && (
                <span className="text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-[#00ff41]/10 rounded text-[#00ff41]/60 border border-[#00ff41]/20">
                  {tab.count}
                </span>
              )}
            </div>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-[#00ff41] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4 pt-4">
        {activeTab === 'posts' && (
          <>
            {posts.length > 0 ? (
              posts.map(post => (
                <PostDetail key={post.id} post={post} isReply currentUserId={currentUserId} />
              ))
            ) : (
              <div className="p-8 text-center text-[#00ff41]/60">
                <p className="text-2xl font-bold mb-2 text-[#00ff41] font-mono">&gt; NO TRANSMISSIONS</p>
                <p className="font-mono">When @{username} transmits, signals will appear here.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'replies' && (
          <>
            {replies.length > 0 ? (
              replies.map(reply => (
                <div key={reply.id}>
                  {reply.parent && (
                    <div className="mb-2">
                      <div className="text-[#00ff41]/50 text-sm font-mono flex items-center gap-1">
                        <span>↳ Replying to</span>
                        <span className="text-[#00ff41]">@{reply.parent.author.username}</span>
                      </div>
                    </div>
                  )}
                  <PostDetail post={reply} isReply currentUserId={currentUserId} />
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[#00ff41]/60">
                <p className="text-2xl font-bold mb-2 text-[#00ff41] font-mono">&gt; NO RESPONSES</p>
                <p className="font-mono">Responses will appear here.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'reposts' && (
          <>
            {reposts.length > 0 ? (
              reposts.map(post => (
                <div key={post.id}>
                  <div className="mb-2">
                    <div className="text-[#00ff41]/50 text-sm font-mono flex items-center gap-1">
                      <span>↻ Reposted by @{username}</span>
                    </div>
                  </div>
                  <PostDetail post={post} isReply currentUserId={currentUserId} />
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[#00ff41]/60">
                <p className="text-2xl font-bold mb-2 text-[#00ff41] font-mono">&gt; NO REPOSTS</p>
                <p className="font-mono">Reposted transmissions will appear here.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'likes' && (
          <>
            {likes.length > 0 ? (
              likes.map(post => (
                <PostDetail key={post.id} post={post} isReply currentUserId={currentUserId} />
              ))
            ) : (
              <div className="p-8 text-center text-[#00ff41]/60">
                <p className="text-2xl font-bold mb-2 text-[#00ff41] font-mono">&gt; NO APPROVALS</p>
                <p className="font-mono">Approved transmissions will appear here.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'media' && (
          <>
            {media.length > 0 ? (
              media.map(post => (
                <PostDetail key={post.id} post={post} isReply currentUserId={currentUserId} />
              ))
            ) : (
              <div className="p-8 text-center text-[#00ff41]/60">
                <p className="text-2xl font-bold mb-2 text-[#00ff41] font-mono">&gt; NO MEDIA</p>
                <p className="font-mono">Media transmissions will appear here.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

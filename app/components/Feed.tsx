'use client';

import { useEffect, useState, useRef } from 'react';
import { getPosts, toggleLike, toggleRepost, createReply, deletePost, editPost } from '../actions';
import { Heart, MessageCircle, Repeat2, Share, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import PostDetailModal from './PostDetailModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { useRouter } from 'next/navigation';
import { useSocket } from '../lib/SocketProvider';

type Media = {
  id: string;
  type: string;
  url: string;
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

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function Feed({ initialPosts, currentUserId }: { initialPosts: Post[]; currentUserId: string }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { socket } = useSocket();

  // Update posts when initialPosts change (e.g., after router.refresh())
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openMenuId]);

  // Listen for real-time post updates
  useEffect(() => {
    if (!socket) return;

    const handlePostUpdate = (data: { 
      postId: string; 
      likeCount?: number; 
      repostCount?: number; 
      replyCount?: number;
      type: string;
    }) => {
      setPosts(prev => prev.map(post => {
        if (post.id === data.postId) {
          const updates: Partial<Post> = {};
          
          if (data.likeCount !== undefined) {
            updates.likeCount = data.likeCount;
          }
          if (data.repostCount !== undefined) {
            updates.repostCount = data.repostCount;
          }
          if (data.replyCount !== undefined) {
            updates.replyCount = data.replyCount;
          }
          
          return { ...post, ...updates };
        }
        return post;
      }));
    };

    // Listen to all posts in the feed
    posts.forEach(post => {
      socket.on(`post:${post.id}:update`, handlePostUpdate);
    });

    // Cleanup
    return () => {
      posts.forEach(post => {
        socket.off(`post:${post.id}:update`, handlePostUpdate);
      });
    };
  }, [socket, posts]);

  // Listen for real-time post updates
  useEffect(() => {
    if (!socket) return;

    // Set up listeners for all posts in the feed
    const handlePostUpdate = (data: { postId: string; likeCount?: number; repostCount?: number; replyCount?: number; type: string }) => {
      setPosts(prev => prev.map(p => {
        if (p.id === data.postId) {
          const updates: Partial<Post> = {};
          if (data.likeCount !== undefined) updates.likeCount = data.likeCount;
          if (data.repostCount !== undefined) updates.repostCount = data.repostCount;
          if (data.replyCount !== undefined) updates.replyCount = data.replyCount;
          return { ...p, ...updates };
        }
        return p;
      }));
    };

    // Listen for updates on all posts
    posts.forEach(post => {
      socket.on(`post:${post.id}:update`, handlePostUpdate);
    });

    return () => {
      // Clean up listeners
      posts.forEach(post => {
        socket.off(`post:${post.id}:update`, handlePostUpdate);
      });
    };
  }, [socket, posts]);

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      if (posts.length === 0) return;
      
      // Get the timestamp of the most recent post
      const latestPostTime = posts[0].createdAt;
      
      // Before fetching new posts, save scroll position
      const container = containerRef.current;
      let scrollAnchor: { id: string; offset: number } | null = null;
      
      if (container) {
        const children = Array.from(container.children);
        for (const child of children) {
          const rect = child.getBoundingClientRect();
          if (rect.top >= 0) {
            scrollAnchor = {
              id: child.getAttribute('data-post-id') || '',
              offset: rect.top
            };
            break;
          }
        }
      }
      
      // Fetch new posts
      const newPosts = await getPosts(latestPostTime);
      
      if (newPosts.length > 0) {
        setPosts(prev => [...newPosts, ...prev]);
        
        // Restore scroll position after state update
        if (scrollAnchor && container) {
          setTimeout(() => {
            const anchorElement = container.querySelector(`[data-post-id="${scrollAnchor.id}"]`);
            if (anchorElement) {
              const rect = anchorElement.getBoundingClientRect();
              const scrollAdjustment = rect.top - scrollAnchor.offset;
              window.scrollBy(0, scrollAdjustment);
            }
          }, 0);
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [posts]);

  const handleReply = async (postId: string) => {
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const result = await createReply(postId, replyContent);
    
    if (result.success) {
      setReplyContent('');
      setReplyingToId(null);
      // Update reply count
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, replyCount: p.replyCount + 1 }
          : p
      ));
      router.refresh();
    } else {
      alert(result.error || 'Failed to post reply');
    }
    setIsSubmitting(false);
  };

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 px-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00ff41]/30"></div>
        <span className="text-[#00ff41]/60 font-mono text-xs tracking-widest">ACTIVE TRANSMISSIONS</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00ff41]/30"></div>
      </div>

      {posts.map((post) => (
        <div 
          key={post.id} 
          data-post-id={post.id} 
          className="border-2 border-[#00ff41]/30 bg-black/50 backdrop-blur-sm rounded overflow-hidden hover:border-[#00ff41]/50 hover:shadow-lg hover:shadow-[#00ff41]/10 transition-all duration-300 group"
        >
          {/* Card Header */}
          <div className="bg-[#00ff41]/5 border-b border-[#00ff41]/30 px-2 sm:px-4 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-black border-2 border-[#00ff41] flex items-center justify-center flex-shrink-0 group-hover:border-[#00ff41] group-hover:shadow-md group-hover:shadow-[#00ff41]/30 transition-all">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#00ff41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs sm:text-sm text-[#00ff41] truncate">{post.author.displayName}</span>
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 border border-[#00ff41]/30 rounded text-[#00ff41]/60 font-mono truncate">@{post.author.username}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                  <span className="text-[#00ff41]/40 font-mono text-[10px] sm:text-xs">ID: {post.id.slice(0, 6)}</span>
                  <span className="text-[#00ff41]/30">•</span>
                  <span className="text-[#00ff41]/40 font-mono text-[10px] sm:text-xs">{formatTimeAgo(post.createdAt)}</span>
                  <span className="text-[#00ff41]/30">•</span>
                  <div className="flex items-center gap-1">
                    <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-[#00ff41] opacity-60 animate-pulse"></div>
                    <span className="text-[#00ff41]/60 font-mono text-[9px] sm:text-[10px]">LIVE</span>
                  </div>
                </div>
              </div>
            </div>
            {post.author.id === currentUserId && (
              <div className="relative flex-shrink-0" ref={openMenuId === post.id ? menuRef : null}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === post.id ? null : post.id);
                  }}
                  className="p-1.5 hover:bg-[#00ff41]/10 rounded transition-all duration-200 border border-transparent hover:border-[#00ff41]/30"
                >
                  <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-[#00ff41]/70" />
                </button>
                {openMenuId === post.id && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-black border-2 border-[#00ff41]/50 rounded shadow-xl shadow-[#00ff41]/20 min-w-[160px] overflow-hidden">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPostId(post.id);
                        setEditContent(post.content);
                        setOpenMenuId(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#00ff41]/10 transition-all font-mono text-xs text-[#00ff41]/90 hover:text-[#00ff41]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>EDIT</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        setPostToDelete(post);
                        setDeleteDialogOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-all font-mono text-xs text-red-500/90 hover:text-red-500 border-t border-[#00ff41]/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>DELETE</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className={`p-2 sm:p-4 ${editingPostId === post.id ? '' : 'cursor-pointer'}`} onClick={() => {
            if (editingPostId !== post.id) {
              setSelectedPostId(post.id);
            }
          }}>
            {editingPostId === post.id ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-black border-2 border-[#00ff41]/40 rounded p-3 text-[#00ff41]/90 font-mono text-xs sm:text-sm focus:border-[#00ff41] focus:outline-none resize-none"
                  rows={4}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const result = await editPost(post.id, editContent);
                      if (result.success) {
                        setPosts(prev => prev.map(p => 
                          p.id === post.id ? { ...p, content: editContent } : p
                        ));
                        setEditingPostId(null);
                        setEditContent('');
                      } else {
                        alert(result.error || 'Failed to edit post');
                      }
                    }}
                    className="px-4 py-1.5 bg-[#00ff41]/10 border border-[#00ff41] text-[#00ff41] rounded font-mono text-xs hover:bg-[#00ff41]/20 transition-all"
                  >
                    SAVE
                  </button>
                  <button
                    onClick={() => {
                      setEditingPostId(null);
                      setEditContent('');
                    }}
                    className="px-4 py-1.5 border border-[#00ff41]/30 text-[#00ff41]/70 rounded font-mono text-xs hover:bg-[#00ff41]/10 transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            ) : (
              <>
                {post.content && (
                  <p className="text-xs sm:text-sm leading-relaxed break-words text-[#00ff41]/90 font-mono mb-2 sm:mb-3">
                    {post.content}
                  </p>
                )}
              </>
            )}
              
              {/* Media attachments */}
              {post.media.length > 0 && (
                <div className={`mt-3 grid gap-1 rounded overflow-hidden border border-[#00ff41]/20 ${
                  post.media.length === 1 ? 'grid-cols-1' : 
                  post.media.length === 2 ? 'grid-cols-2' : 
                  post.media.length === 3 ? 'grid-cols-2' :
                  'grid-cols-2'
                }`}>
                  {post.media.map((media, index) => (
                    <div 
                      key={media.id} 
                      className={`relative bg-black ${
                        post.media.length === 3 && index === 0 ? 'col-span-2' : ''
                      } ${post.media.length === 1 ? 'aspect-video max-h-[500px]' : 'aspect-square'}`}
                    >
                      {media.type === 'image' ? (
                        <img 
                          src={media.url} 
                          alt="Post image" 
                          className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => window.open(media.url, '_blank')}
                        />
                      ) : (
                        <video 
                          src={media.url} 
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-[#00ff41]/20 flex items-center justify-between flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button 
                    className="group flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded border border-[#00ff41]/30 hover:border-[#00ff41] hover:bg-[#00ff41]/10 transition-all duration-200 font-mono text-[10px] flex-shrink-0 min-w-[60px] sm:min-w-[75px] justify-center"
                    onClick={() => {
                      setReplyingToId(replyingToId === post.id ? null : post.id);
                      setReplyContent('');
                    }}
                  >
                    <MessageCircle className="w-3 h-3 text-[#00ff41]/70 group-hover:text-[#00ff41] transition-colors" />
                    <span className="text-[#00ff41]/70 group-hover:text-[#00ff41] hidden sm:inline text-[10px]">REPLY</span>
                    {post.replyCount > 0 && (
                      <span className="px-1 py-0.5 bg-[#00ff41]/20 rounded text-[#00ff41] text-[9px] leading-none">
                        {post.replyCount}
                      </span>
                    )}
                  </button>

                  <button 
                    className={`group flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded border transition-all duration-200 font-mono text-[10px] flex-shrink-0 min-w-[60px] sm:min-w-[90px] justify-center ${
                      replyingToId === post.id
                        ? 'border-[#00ff41]/20 bg-[#00ff41]/5 text-[#00ff41]/30 opacity-50 cursor-not-allowed'
                        : post.userReposted 
                          ? 'border-[#00ff41] bg-[#00ff41]/20 text-[#00ff41]' 
                          : 'border-[#00ff41]/30 hover:border-[#00ff41] hover:bg-[#00ff41]/10 text-[#00ff41]/70'
                    }`}
                    disabled={replyingToId === post.id}
                    onClick={async () => {
                      // Optimistic update
                      setPosts(prev => prev.map(p => 
                        p.id === post.id 
                          ? {
                              ...p,
                              userReposted: !p.userReposted,
                              repostCount: p.userReposted ? p.repostCount - 1 : p.repostCount + 1
                            }
                          : p
                      ));
                      
                      await toggleRepost(post.id);
                    }}
                  >
                    <Repeat2 className={`w-3 h-3 transition-colors ${
                      replyingToId === post.id
                        ? 'text-[#00ff41]/30'
                        : post.userReposted ? 'text-[#00ff41]' : 'group-hover:text-[#00ff41]'
                    }`} />
                    <span className={`hidden sm:inline text-[10px] whitespace-nowrap ${replyingToId === post.id
                      ? 'text-[#00ff41]/30'
                      : post.userReposted ? 'text-[#00ff41]' : 'group-hover:text-[#00ff41]'
                    }`}>
                      {post.userReposted ? 'REPOSTED' : 'REPOST'}
                    </span>
                    {post.repostCount > 0 && (
                      <span className={`px-1 py-0.5 rounded text-[9px] leading-none ${
                        post.userReposted ? 'bg-[#00ff41]/30 text-[#00ff41]' : 'bg-[#00ff41]/20 text-[#00ff41]'
                      }`}>
                        {post.repostCount}
                      </span>
                    )}
                  </button>

                  <button 
                    className={`group flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded border transition-all duration-200 font-mono text-[10px] flex-shrink-0 min-w-[60px] sm:min-w-[90px] justify-center ${
                      replyingToId === post.id
                        ? 'border-[#00ff41]/20 bg-[#00ff41]/5 text-[#00ff41]/30 opacity-50 cursor-not-allowed'
                        : post.userLiked 
                          ? 'border-[#00ff41] bg-[#00ff41]/20 text-[#00ff41]' 
                          : 'border-[#00ff41]/30 hover:border-[#00ff41] hover:bg-[#00ff41]/10 text-[#00ff41]/70'
                    }`}
                    disabled={replyingToId === post.id}
                  onClick={async () => {
                    // Optimistic update
                    setPosts(prev => prev.map(p => 
                      p.id === post.id 
                        ? {
                            ...p,
                            userLiked: !p.userLiked,
                            likeCount: p.userLiked ? p.likeCount - 1 : p.likeCount + 1
                          }
                        : p
                    ));
                    
                    await toggleLike(post.id);
                  }}
                >
                  <Heart className={`w-3 h-3 transition-all ${
                    replyingToId === post.id
                      ? 'text-[#00ff41]/30'
                      : post.userLiked 
                        ? 'fill-[#00ff41] text-[#00ff41]' 
                        : 'group-hover:text-[#00ff41]'
                  }`} />
                  <span className={`hidden sm:inline text-[10px] whitespace-nowrap ${replyingToId === post.id
                    ? 'text-[#00ff41]/30'
                    : post.userLiked ? 'text-[#00ff41]' : 'group-hover:text-[#00ff41]'
                  }`}>
                    {post.userLiked ? 'APPROVED' : 'APPROVE'}
                  </span>
                  {post.likeCount > 0 && (
                    <span className={`px-1 py-0.5 rounded text-[9px] leading-none ${
                      post.userLiked ? 'bg-[#00ff41]/30 text-[#00ff41]' : 'bg-[#00ff41]/20 text-[#00ff41]'
                    }`}>
                      {post.likeCount}
                    </span>
                  )}
                </button>
                </div>

                <button 
                  className="group flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded border border-[#00ff41]/30 hover:border-[#00ff41] hover:bg-[#00ff41]/10 transition-all duration-200 font-mono text-[10px] text-[#00ff41]/70 hover:text-[#00ff41] flex-shrink-0 min-w-[60px] sm:min-w-[75px] justify-center"
                  onClick={() => {
                    // Share action - could copy link or show share menu
                    if (navigator.share) {
                      navigator.share({
                        title: `Post by ${post.author.displayName}`,
                        text: post.content,
                        url: window.location.href
                      });
                    } else {
                      // Fallback: copy to clipboard
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                >  <Share className="w-3 h-3" />
                  <span className="hidden sm:inline text-[10px]">SHARE</span>
                </button>
              </div>

              {/* Reply Input */}
              {replyingToId === post.id && (
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[#00ff41]/20" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <span className="text-[#00ff41] font-mono text-sm flex-shrink-0 mt-1">&gt;</span>
                    <div className="flex-1">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Enter reply transmission..."
                        className="w-full resize-none overflow-hidden bg-transparent border-none text-sm leading-relaxed outline-none placeholder:text-[#00ff41]/40 text-[#00ff41] font-mono"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyContent('');
                          }}
                          className="px-3 py-1.5 rounded text-xs font-mono hover:bg-[#00ff41]/10 transition-colors border border-[#00ff41]/30 text-[#00ff41]"
                        >
                          CANCEL
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReply(post.id)}
                          disabled={!replyContent.trim() || isSubmitting}
                          className="px-3 py-1.5 bg-[#00ff41]/10 text-[#00ff41] rounded text-xs font-mono font-bold hover:bg-[#00ff41]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-[#00ff41]/30"
                        >
                          {isSubmitting ? 'SENDING...' : '◢ TRANSMIT ◣'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
      ))}

      {/* Post Detail Modal */}
      <PostDetailModal 
        postId={selectedPostId}
        isOpen={selectedPostId !== null}
        onClose={() => setSelectedPostId(null)}
        currentUserId={currentUserId}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={async () => {
          if (postToDelete) {
            setPosts(prev => prev.filter(p => p.id !== postToDelete.id));
            const result = await deletePost(postToDelete.id);
            if (!result.success) {
              setPosts(prev => [...prev, postToDelete].sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              ));
              alert(result.error || 'Failed to delete post');
            }
            setPostToDelete(null);
          }
        }}
      />
    </div>
  );
}

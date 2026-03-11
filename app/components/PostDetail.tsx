'use client';

import { useState, useRef, useEffect } from 'react';
import { toggleLike, toggleRepost, createReply, deletePost, editPost } from '../actions';
import { Heart, MessageCircle, Repeat2, Share, BadgeCheck, Trash2, MoreVertical, Pencil } from 'lucide-react';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

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

export default function PostDetail({ post, isReply = false, currentUserId }: { post: Post; isReply?: boolean; currentUserId?: string }) {
  const [liked, setLiked] = useState(post.userLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [reposted, setReposted] = useState(post.userReposted);
  const [repostCount, setRepostCount] = useState(post.repostCount);
  const [replyCount, setReplyCount] = useState(post.replyCount);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [openMenu, setOpenMenu] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    }

    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openMenu]);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

    const result = await toggleLike(post.id);
    if (!result.success) {
      setLiked(!newLiked);
      setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
    }
  };

  const handleRepost = async () => {
    const newReposted = !reposted;
    setReposted(newReposted);
    setRepostCount(prev => newReposted ? prev + 1 : prev - 1);

    const result = await toggleRepost(post.id);
    if (!result.success) {
      setReposted(!newReposted);
      setRepostCount(prev => newReposted ? prev - 1 : prev + 1);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const result = await createReply(post.id, replyContent);
    
    if (result.success) {
      setReplyContent('');
      setShowReplyBox(false);
      setReplyCount(prev => prev + 1);
      router.refresh();
    } else {
      alert(result.error || 'Failed to post reply');
    }
    setIsSubmitting(false);
  };

  return (
    <>
    <article className="border-2 border-[#00ff41]/30 bg-black/50 backdrop-blur-sm rounded overflow-hidden hover:border-[#00ff41]/50 hover:shadow-lg hover:shadow-[#00ff41]/10 transition-all duration-300 group">
      {/* Card Header */}
      <div className="bg-[#00ff41]/5 border-b border-[#00ff41]/30 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/user/${post.author.username}`}>
            <div className="w-10 h-10 rounded bg-black border-2 border-[#00ff41] flex items-center justify-center flex-shrink-0 group-hover:border-[#00ff41] group-hover:shadow-md group-hover:shadow-[#00ff41]/30 transition-all">
              <svg className="w-6 h-6 text-[#00ff41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/user/${post.author.username}`} className="font-mono font-bold text-sm text-[#00ff41] hover:underline">
                {post.author.displayName}
              </Link>
              <span className="text-xs px-2 py-0.5 border border-[#00ff41]/30 rounded text-[#00ff41]/60 font-mono">@{post.author.username}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[#00ff41]/40 font-mono text-xs">ID: {post.id.slice(0, 8)}</span>
              <span className="text-[#00ff41]/30">•</span>
              <span className="text-[#00ff41]/40 font-mono text-xs">{formatTimeAgo(post.createdAt)}</span>
              <span className="text-[#00ff41]/30">•</span>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-[#00ff41] opacity-60 animate-pulse"></div>
                <span className="text-[#00ff41]/60 font-mono text-[10px]">LIVE</span>
              </div>
            </div>
          </div>
        </div>
        {currentUserId && post.author.id === currentUserId && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="p-1.5 hover:bg-[#00ff41]/10 rounded transition-colors text-[#00ff41]/60 hover:text-[#00ff41]"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {openMenu && (
              <div className="absolute right-0 top-full mt-1 bg-black/95 border border-[#00ff41]/30 rounded shadow-lg min-w-[140px] z-50">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setOpenMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-[#00ff41]/10 transition-colors flex items-center gap-2 text-[#00ff41]/70 hover:text-[#00ff41] font-mono text-xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    setDeleteDialogOpen(true);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-red-500/10 transition-colors flex items-center gap-2 text-red-500/70 hover:text-red-500 font-mono text-xs border-t border-[#00ff41]/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-black/30 border border-[#00ff41]/20 rounded px-3 py-2 outline-none resize-none text-sm placeholder:text-[#00ff41]/40 text-[#00ff41]/90 font-mono focus:border-[#00ff41]/40 transition-colors"
              rows={4}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                }}
                className="px-3 py-1.5 rounded text-xs font-mono hover:bg-[#00ff41]/10 transition-colors border border-[#00ff41]/30 text-[#00ff41]/70 hover:text-[#00ff41]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const result = await editPost(post.id, editContent);
                  if (result.success) {
                    post.content = editContent;
                    setIsEditing(false);
                    router.refresh();
                  } else {
                    alert(result.error || 'Failed to update post');
                  }
                }}
                disabled={!editContent.trim() || editContent === post.content}
                className="px-3 py-1.5 border-2 border-[#00ff41]/30 bg-[#00ff41]/10 text-[#00ff41] rounded text-xs font-mono hover:bg-[#00ff41]/20 hover:border-[#00ff41]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          post.content && (
            <p className="text-sm leading-relaxed break-words text-[#00ff41]/90 font-mono mb-3">
              {post.content}
            </p>
          )
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
        <div className="mt-4 pt-3 border-t border-[#00ff41]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              className="group flex items-center gap-1 px-3 py-2 rounded border border-[#00ff41]/30 hover:border-[#00ff41] hover:bg-[#00ff41]/10 transition-all duration-200 font-mono text-[10px] flex-shrink-0 min-w-[75px] justify-center"
              onClick={() => setShowReplyBox(!showReplyBox)}
            >
              <MessageCircle className="w-3 h-3 text-[#00ff41]/70 group-hover:text-[#00ff41] transition-colors" />
              <span className="text-[#00ff41]/70 group-hover:text-[#00ff41]">REPLY</span>
              {replyCount > 0 && (
                <span className="px-1 py-0.5 bg-[#00ff41]/20 rounded text-[#00ff41] text-[9px] leading-none">
                  {replyCount}
                </span>
              )}
            </button>

            <button 
              className={`group flex items-center gap-1 px-3 py-2 rounded border transition-all duration-200 font-mono text-[10px] flex-shrink-0 min-w-[90px] justify-center ${
                reposted 
                  ? 'border-[#00ff41] bg-[#00ff41]/20 text-[#00ff41]' 
                  : 'border-[#00ff41]/30 hover:border-[#00ff41] hover:bg-[#00ff41]/10 text-[#00ff41]/70'
              }`}
              onClick={handleRepost}
            >
              <Repeat2 className={`w-3 h-3 transition-colors ${
                reposted ? 'text-[#00ff41]' : 'group-hover:text-[#00ff41]'
              }`} />
              <span className={`whitespace-nowrap ${
                reposted ? 'text-[#00ff41]' : 'group-hover:text-[#00ff41]'
              }`}>
                {reposted ? 'REPOSTED' : 'REPOST'}
              </span>
              {repostCount > 0 && (
                <span className={`px-1 py-0.5 rounded text-[9px] leading-none ${
                  reposted ? 'bg-[#00ff41]/30 text-[#00ff41]' : 'bg-[#00ff41]/20 text-[#00ff41]'
                }`}>
                  {repostCount}
                </span>
              )}
            </button>

            <button 
              className={`group flex items-center gap-1 px-3 py-2 rounded border transition-all duration-200 font-mono text-[10px] flex-shrink-0 min-w-[90px] justify-center ${
                liked 
                  ? 'border-[#00ff41] bg-[#00ff41]/20 text-[#00ff41]' 
                  : 'border-[#00ff41]/30 hover:border-[#00ff41] hover:bg-[#00ff41]/10 text-[#00ff41]/70'
              }`}
              onClick={handleLike}
            >
              <Heart className={`w-3 h-3 transition-colors ${
                liked ? 'text-[#00ff41] fill-[#00ff41]' : 'group-hover:text-[#00ff41]'
              }`} />
              <span className={`whitespace-nowrap ${
                liked ? 'text-[#00ff41]' : 'group-hover:text-[#00ff41]'
              }`}>
                {liked ? 'APPROVED' : 'APPROVE'}
              </span>
              {likeCount > 0 && (
                <span className={`px-1 py-0.5 rounded text-[9px] leading-none ${
                  liked ? 'bg-[#00ff41]/30 text-[#00ff41]' : 'bg-[#00ff41]/20 text-[#00ff41]'
                }`}>
                  {likeCount}
                </span>
              )}
            </button>
          </div>

            <button className="group flex items-center gap-1 px-3 py-2 rounded border border-[#00ff41]/30 hover:border-[#00ff41] hover:bg-[#00ff41]/10 transition-all duration-200 font-mono text-[10px] flex-shrink-0 min-w-[75px] justify-center">
              <Share className="w-3 h-3 text-[#00ff41]/70 group-hover:text-[#00ff41] transition-colors" />
              <span className="text-[#00ff41]/70 group-hover:text-[#00ff41]">SHARE</span>
            </button>
        </div>

        {/* Reply Box */}
        {showReplyBox && (
          <form onSubmit={handleReply} className="mt-4 pt-4 border-t border-[#00ff41]/20">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded bg-black border-2 border-[#00ff41] flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#00ff41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Transmit your response..."
                  className="w-full bg-black/30 border border-[#00ff41]/20 rounded px-3 py-2 outline-none resize-none text-sm placeholder:text-[#00ff41]/40 text-[#00ff41]/90 font-mono focus:border-[#00ff41]/40 transition-colors"
                  rows={3}
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setShowReplyBox(false)}
                    className="px-4 py-1.5 rounded text-xs font-mono hover:bg-[#00ff41]/10 transition-colors border border-[#00ff41]/30 text-[#00ff41]/70 hover:text-[#00ff41]"
                  >
                    [ CANCEL ]
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim() || isSubmitting}
                    className="px-4 py-1.5 border-2 border-[#00ff41]/30 bg-[#00ff41]/10 text-[#00ff41] rounded text-xs font-mono font-bold hover:bg-[#00ff41]/20 hover:border-[#00ff41]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? '[ SENDING... ]' : '[ TRANSMIT ]'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </article>

    <DeleteConfirmDialog
      isOpen={deleteDialogOpen}
      onClose={() => setDeleteDialogOpen(false)}
      onConfirm={async () => {
        const result = await deletePost(post.id);
        if (result.success) {
          window.location.href = '/';
        } else {
          alert(result.error || 'Failed to delete post');
        }
      }}
    />
  </>
  );
}

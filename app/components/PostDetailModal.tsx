'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, MoreVertical, Pencil } from 'lucide-react';
import { getPostWithReplies, deletePost, editPost } from '../actions';
import DeleteConfirmDialog from './DeleteConfirmDialog';

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
  replies?: Post[];
};

export default function PostDetailModal({ 
  postId, 
  isOpen, 
  onClose,
  currentUserId
}: { 
  postId: string | null; 
  isOpen: boolean; 
  onClose: () => void;
  currentUserId?: string;
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [openMenu, setOpenMenu] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isOpen || !postId) {
      return;
    }

    let cancelled = false;

    async function loadPost() {
      if (!postId) return; // Type guard
      const data = await getPostWithReplies(postId);
      if (!cancelled) {
        setPost(data);
        setEditContent(data?.content || '');
        setLoading(false);
      }
    }

    loadPost();

    return () => {
      cancelled = true;
    };
  }, [isOpen, postId]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof window === 'undefined') return null;

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] z-10">
        <div className="border-2 border-[#00ff41]/50 bg-black rounded-lg overflow-hidden shadow-2xl shadow-[#00ff41]/20">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#00ff41]/30 bg-[#00ff41]/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00ff41] animate-pulse"></div>
              <h2 className="text-lg font-bold text-[#00ff41] font-mono tracking-widest military-glow">
                ◢ TRANSMISSION DETAILS ◣
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {currentUserId && post && post.author.id === currentUserId && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setOpenMenu(!openMenu)}
                    className="p-2 hover:bg-[#00ff41]/10 rounded transition-colors text-[#00ff41]/60 hover:text-[#00ff41]"
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
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#00ff41]/10 rounded transition-all duration-200 border border-transparent hover:border-[#00ff41]/30"
              >
                <X className="w-5 h-5 text-[#00ff41]/70 hover:text-[#00ff41]" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-[#00ff41] font-mono">Loading transmission...</div>
              </div>
            ) : post ? (
              <div className="space-y-4">
                {/* Main Post */}
                <div className="border-2 border-[#00ff41]/40 rounded p-4 bg-black/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded bg-black border-2 border-[#00ff41] flex items-center justify-center flex-shrink-0">
                      <svg className="w-7 h-7 text-[#00ff41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#00ff41]">{post.author.displayName}</span>
                        <span className="text-xs px-2 py-0.5 border border-[#00ff41]/30 rounded text-[#00ff41]/60 font-mono">
                          @{post.author.username}
                        </span>
                      </div>
                      <div className="text-[#00ff41]/40 font-mono text-xs">
                        {new Date(post.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="mt-3">
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
                              setPost({ ...post, content: editContent });
                              setIsEditing(false);
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
                    <p className="text-[#00ff41]/90 font-mono text-sm leading-relaxed mt-3">{post.content}</p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#00ff41]/20 text-[#00ff41]/60 font-mono text-xs">
                    <span>{post.replyCount} replies</span>
                    <span>{post.repostCount} reposts</span>
                    <span>{post.likeCount} approvals</span>
                  </div>
                </div>

                {/* Replies */}
                {post.replies && post.replies.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00ff41]/30"></div>
                      <span className="text-[#00ff41]/60 font-mono text-xs tracking-widest">REPLIES</span>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00ff41]/30"></div>
                    </div>
                    {post.replies.map((reply) => (
                      <div key={reply.id} className="border border-[#00ff41]/30 rounded p-3 bg-black/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded bg-black border border-[#00ff41] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#00ff41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-[#00ff41]">{reply.author.displayName}</span>
                              <span className="text-xs text-[#00ff41]/60 font-mono">@{reply.author.username}</span>
                            </div>
                            <div className="text-[#00ff41]/40 font-mono text-xs">
                              {new Date(reply.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <p className="text-[#00ff41]/80 font-mono text-sm">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-[#00ff41]/60 font-mono">
                Transmission not found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
        document.body
      )}

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async () => {
          if (post) {
            const result = await deletePost(post.id);
            if (result.success) {
              onClose();
              window.location.reload();
            } else {
              alert(result.error || 'Failed to delete post');
            }
          }
        }}
      />
    </>
  );
}

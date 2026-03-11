'use server';

import { revalidatePath } from 'next/cache';
import prisma from './lib/db';
import { optimizeImage, optimizeVideo } from './lib/media';
import { rateLimit } from './lib/ratelimit';
import { cacheGet, cacheSet, cacheInvalidatePattern } from './lib/cache';
import { headers } from 'next/headers';
import { getCurrentUser } from './lib/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function getClientIdentifier(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

// Helper function to create notifications
async function createNotification(type: string, senderId: string, recipientId: string, postId?: string) {
  // Don't notify yourself
  if (senderId === recipientId) return;
  
  // Check if a similar notification already exists (prevent duplicates)
  const existing = await prisma.notification.findFirst({
    where: {
      type,
      senderId,
      recipientId,
      postId,
      createdAt: {
        gte: new Date(Date.now() - 60000), // Within last minute
      },
    },
  });
  
  if (existing) return;
  
  // Create the notification
  const notification = await prisma.notification.create({
    data: {
      type,
      senderId,
      recipientId,
      postId,
    },
    include: {
      sender: {
        select: {
          username: true,
          displayName: true,
          avatar: true,
          verified: true,
        },
      },
    },
  });
  
  // Emit real-time notification via Socket.IO
  try {
    const io = (global as any).io;
    if (io) {
      io.to(`user:${recipientId}`).emit('notification', {
        id: notification.id,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
        postId: notification.postId,
        sender: notification.sender,
      });
    }
  } catch (error) {
    console.error('Error emitting notification:', error);
  }
}

export async function createPost(formData: FormData) {
  try {
    // Rate limiting
    const identifier = await getClientIdentifier();
    const rateLimitResult = await rateLimit(identifier, 10, 60000); // 10 posts per minute
    
    if (!rateLimitResult.success) {
      return { 
        success: false, 
        error: 'Too many requests. Please try again later.',
        rateLimit: rateLimitResult 
      };
    }

    // Get the current logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const content = formData.get('content') as string;
    
    // Create the post
    const post = await prisma.post.create({
      data: {
        content,
        authorId: user.id,
      },
    });

    // Handle media files with optimization
    const files = formData.getAll('media') as File[];
    
    for (const file of files) {
      if (file.size > 0) {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          throw new Error('File size exceeds 10MB limit');
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Determine media type and optimize
        if (file.type.startsWith('image/')) {
          const optimized = await optimizeImage(buffer, file.name);
          
          await prisma.media.create({
            data: {
              postId: post.id,
              type: 'image',
              url: optimized.url,
              width: optimized.width,
              height: optimized.height,
            },
          });
        } else if (file.type.startsWith('video/')) {
          const saved = await optimizeVideo(buffer, file.name);
          
          await prisma.media.create({
            data: {
              postId: post.id,
              type: 'video',
              url: saved.url,
            },
          });
        }
      }
    }

    // Invalidate cache
    await cacheInvalidatePattern('posts:*');

    revalidatePath('/');
    return { success: true, rateLimit: rateLimitResult };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create post' };
  }
}

export async function getPosts(since?: string) {
  try {
    const cacheKey = since ? `posts:since:${since}` : 'posts:latest';
    
    // Try cache first
    const cached = await cacheGet<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const posts = await prisma.post.findMany({
      where: since ? {
        createdAt: {
          gt: new Date(since)
        },
        parentId: null, // Only top-level posts, not replies
      } : {
        parentId: null, // Only top-level posts, not replies
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            verified: true,
          }
        },
        media: {
          select: {
            id: true,
            type: true,
            url: true,
            width: true,
            height: true,
            createdAt: true,
          }
        },
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
      take: since ? undefined : 50, // Limit initial load
    });
    
    // Get current user for reaction status
    const currentUser = await getCurrentUser();
    
    const result = posts.map(post => {
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
        reactions: undefined, // Don't send all reactions to client
      };
    });

    // Cache for 10 seconds
    await cacheSet(cacheKey, result, 10);

    return result;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

// ========== REACTIONS ==========

export async function toggleLike(postId: string) {
  try {
    const identifier = await getClientIdentifier();
    const rateLimitResult = await rateLimit(identifier, 30, 60000); // 30 likes per minute
    
    if (!rateLimitResult.success) {
      return { success: false, error: 'Too many requests' };
    }

    // Get current user
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Check if already liked
    const existingLike = await prisma.reaction.findUnique({
      where: {
        userId_postId_type: {
          userId: user.id,
          postId,
          type: 'like',
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.reaction.delete({ where: { id: existingLike.id } });
      const post = await prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
      
      // Emit real-time update
      try {
        const io = (global as any).io;
        if (io) {
          io.emit(`post:${postId}:update`, { 
            postId, 
            likeCount: post.likeCount,
            type: 'unlike' 
          });
        }
      } catch (error) {
        console.error('Error emitting post update:', error);
      }
      
      await cacheInvalidatePattern('posts:*');
      return { success: true, liked: false };
    } else {
      // Like
      await prisma.reaction.create({
        data: {
          userId: user.id,
          postId,
          type: 'like',
        },
      });
      const post = await prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      });
      
      // Create notification for post author
      const postAuthor = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      });
      if (postAuthor) {
        await createNotification('like', user.id, postAuthor.authorId, postId);
      }
      
      // Emit real-time update
      try {
        const io = (global as any).io;
        if (io) {
          io.emit(`post:${postId}:update`, { 
            postId, 
            likeCount: post.likeCount,
            type: 'like' 
          });
        }
      } catch (error) {
        console.error('Error emitting post update:', error);
      }
      
      await cacheInvalidatePattern('posts:*');
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return { success: false, error: 'Failed to toggle like' };
  }
}

export async function toggleRepost(postId: string) {
  try {
    const identifier = await getClientIdentifier();
    const rateLimitResult = await rateLimit(identifier, 20, 60000);
    
    if (!rateLimitResult.success) {
      return { success: false, error: 'Too many requests' };
    }

    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const existingRepost = await prisma.reaction.findUnique({
      where: {
        userId_postId_type: {
          userId: user.id,
          postId,
          type: 'repost',
        },
      },
    });

    if (existingRepost) {
      await prisma.reaction.delete({ where: { id: existingRepost.id } });
      const post = await prisma.post.update({
        where: { id: postId },
        data: { repostCount: { decrement: 1 } },
      });
      
      // Emit real-time update
      try {
        const io = (global as any).io;
        if (io) {
          io.emit(`post:${postId}:update`, { 
            postId, 
            repostCount: post.repostCount,
            type: 'unrepost' 
          });
        }
      } catch (error) {
        console.error('Error emitting post update:', error);
      }
      
      await cacheInvalidatePattern('posts:*');
      return { success: true, reposted: false };
    } else {
      await prisma.reaction.create({
        data: {
          userId: user.id,
          postId,
          type: 'repost',
        },
      });
      const post = await prisma.post.update({
        where: { id: postId },
        data: { repostCount: { increment: 1 } },
      });
      
      // Create notification for post author
      const postAuthor = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      });
      if (postAuthor) {
        await createNotification('repost', user.id, postAuthor.authorId, postId);
      }
      
      // Emit real-time update
      try {
        const io = (global as any).io;
        if (io) {
          io.emit(`post:${postId}:update`, { 
            postId, 
            repostCount: post.repostCount,
            type: 'repost' 
          });
        }
      } catch (error) {
        console.error('Error emitting post update:', error);
      }
      
      await cacheInvalidatePattern('posts:*');
      return { success: true, reposted: true };
    }
  } catch (error) {
    console.error('Error toggling repost:', error);
    return { success: false, error: 'Failed to toggle repost' };
  }
}

export async function deletePost(postId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, media: true },
    });

    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    if (post.authorId !== user.id) {
      return { success: false, error: 'You can only delete your own posts' };
    }

    // Delete associated media files
    if (post.media && post.media.length > 0) {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      for (const media of post.media) {
        try {
          const filePath = path.join(process.cwd(), 'public', media.url);
          await fs.unlink(filePath);
        } catch (error) {
          console.error('Error deleting media file:', error);
          // Continue even if file deletion fails
        }
      }
    }

    // Delete the post (cascade will delete media records, reactions, notifications, and replies)
    await prisma.post.delete({
      where: { id: postId },
    });

    // Emit real-time update to remove the post from feeds
    try {
      const io = (global as any).io;
      if (io) {
        io.emit('post:deleted', { postId });
      }
    } catch (error) {
      console.error('Error emitting post deletion:', error);
    }

    // Invalidate cache
    await cacheInvalidatePattern('posts:*');

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

export async function editPost(postId: string, newContent: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    if (post.authorId !== user.id) {
      return { success: false, error: 'You can only edit your own posts' };
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { content: newContent },
    });

    // Emit real-time update
    try {
      const io = (global as any).io;
      if (io) {
        io.emit('post:edited', { 
          postId, 
          content: newContent 
        });
      }
    } catch (error) {
      console.error('Error emitting post edit:', error);
    }

    // Invalidate cache
    await cacheInvalidatePattern('posts:*');

    revalidatePath('/');
    return { success: true, post: updatedPost };
  } catch (error) {
    console.error('Error editing post:', error);
    return { success: false, error: 'Failed to edit post' };
  }
}

// ========== REPLIES ==========

export async function createReply(parentId: string, content: string) {
  try {
    const identifier = await getClientIdentifier();
    const rateLimitResult = await rateLimit(identifier, 10, 60000);
    
    if (!rateLimitResult.success) {
      return { success: false, error: 'Too many requests' };
    }

    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Get parent post to notify author
    const parentPost = await prisma.post.findUnique({
      where: { id: parentId },
      select: { authorId: true },
    });

    // Create reply
    await prisma.post.create({
      data: {
        content,
        authorId: user.id,
        parentId,
      },
    });

    // Increment reply count on parent
    const post = await prisma.post.update({
      where: { id: parentId },
      data: { replyCount: { increment: 1 } },
    });

    // Create notification for parent post author
    if (parentPost) {
      await createNotification('reply', user.id, parentPost.authorId, parentId);
    }

    // Emit real-time update
    try {
      const io = (global as any).io;
      if (io) {
        io.emit(`post:${parentId}:update`, { 
          postId: parentId, 
          replyCount: post.replyCount,
          type: 'reply' 
        });
      }
    } catch (error) {
      console.error('Error emitting post update:', error);
    }

    await cacheInvalidatePattern('posts:*');
    return { success: true };
  } catch (error) {
    console.error('Error creating reply:', error);
    return { success: false, error: 'Failed to create reply' };
  }
}

export async function getReplies(postId: string) {
  try {
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
        reactions: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return replies.map(reply => ({
      ...reply,
      createdAt: reply.createdAt.toISOString(),
      media: reply.media.map(m => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    }));
  } catch (error) {
    console.error('Error fetching replies:', error);
    return [];
  }
}

export async function getPostWithReplies(postId: string) {
  try {
    // Fetch the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
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

    if (!post) {
      return null;
    }

    // Fetch replies
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

    // Get current user for like/repost status
    const currentUser = await getCurrentUser();
    
    const formatPost = (p: any) => {
      const userLiked = currentUser ? p.reactions.some((r: any) => r.userId === currentUser.id && r.type === 'like') : false;
      const userReposted = currentUser ? p.reactions.some((r: any) => r.userId === currentUser.id && r.type === 'repost') : false;
      
      return {
        ...p,
        createdAt: p.createdAt.toISOString(),
        media: p.media.map((m: any) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        })),
        userLiked,
        userReposted,
        likeCount: p.reactions.filter((r: any) => r.type === 'like').length,
        repostCount: p.reactions.filter((r: any) => r.type === 'repost').length,
        reactions: undefined,
      };
    };

    return {
      ...formatPost(post),
      replies: replies.map(formatPost),
    };
  } catch (error) {
    console.error('Error fetching post with replies:', error);
    return null;
  }
}

// ========== USER PROFILES & FOLLOWS ==========

export async function getUserProfile(username: string) {
  try {
    const cacheKey = `user:${username}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) return cached;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
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

    const result = {
      ...user,
      createdAt: user.createdAt.toISOString(),
    };

    await cacheSet(cacheKey, result, 60);
    return result;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function getUserPosts(username: string) {
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return [];

    const posts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        parentId: null, // Only top-level posts, not replies
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
        reactions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return posts.map(post => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      media: post.media.map(m => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    }));
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
}

export async function getUserReplies(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) return [];

    const replies = await prisma.post.findMany({
      where: {
        authorId: user.id,
        parentId: { not: null }, // Only replies
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
        reactions: true,
        parent: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                username: true,
                displayName: true,
              },
            },
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
      take: 50,
    });

    const currentUser = await getCurrentUser();

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
        parent: reply.parent ? {
          ...reply.parent,
        } : null,
        userLiked,
        userReposted,
        likeCount: reply.reactions.filter(r => r.type === 'like').length,
        repostCount: reply.reactions.filter(r => r.type === 'repost').length,
        replyCount: reply._count.replies,
        reactions: undefined,
        _count: undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching user replies:', error);
    return [];
  }
}

export async function getUserLikes(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) return [];

    const likes = await prisma.reaction.findMany({
      where: {
        userId: user.id,
        type: 'like',
      },
      include: {
        post: {
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
            reactions: true,
            _count: {
              select: {
                replies: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    const currentUser = await getCurrentUser();

    return likes.map(like => {
      const userLiked = currentUser ? like.post.reactions.some(r => r.userId === currentUser.id && r.type === 'like') : false;
      const userReposted = currentUser ? like.post.reactions.some(r => r.userId === currentUser.id && r.type === 'repost') : false;

      return {
        ...like.post,
        createdAt: like.post.createdAt.toISOString(),
        media: like.post.media.map(m => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        })),
        userLiked,
        userReposted,
        likeCount: like.post.reactions.filter(r => r.type === 'like').length,
        repostCount: like.post.reactions.filter(r => r.type === 'repost').length,
        replyCount: like.post._count.replies,
        reactions: undefined,
        _count: undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching user likes:', error);
    return [];
  }
}

export async function getUserReposts(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) return [];

    const reposts = await prisma.reaction.findMany({
      where: {
        userId: user.id,
        type: 'repost',
      },
      include: {
        post: {
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
            reactions: true,
            _count: {
              select: {
                replies: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    const currentUser = await getCurrentUser();

    return reposts.map(repost => {
      const userLiked = currentUser ? repost.post.reactions.some(r => r.userId === currentUser.id && r.type === 'like') : false;
      const userReposted = currentUser ? repost.post.reactions.some(r => r.userId === currentUser.id && r.type === 'repost') : false;

      return {
        ...repost.post,
        createdAt: repost.post.createdAt.toISOString(),
        media: repost.post.media.map(m => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        })),
        userLiked,
        userReposted,
        likeCount: repost.post.reactions.filter(r => r.type === 'like').length,
        repostCount: repost.post.reactions.filter(r => r.type === 'repost').length,
        replyCount: repost.post._count.replies,
        reactions: undefined,
        _count: undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching user reposts:', error);
    return [];
  }
}

export async function getUserMedia(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) return [];

    const posts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        media: {
          some: {}, // Has at least one media item
        },
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
        reactions: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
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
  } catch (error) {
    console.error('Error fetching user media:', error);
    return [];
  }
}

export async function toggleFollow(targetUsername: string) {
  try {
    const identifier = await getClientIdentifier();
    const rateLimitResult = await rateLimit(identifier, 20, 60000);
    
    if (!rateLimitResult.success) {
      return { success: false, error: 'Too many requests' };
    }

    // Get current user
    const currentUser = await getCurrentUser();
    const targetUser = await prisma.user.findUnique({ where: { username: targetUsername } });

    if (!currentUser || !targetUser) {
      return { success: false, error: 'User not found' };
    }

    if (currentUser.id === targetUser.id) {
      return { success: false, error: 'Cannot follow yourself' };
    }

    // Check if already following
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follows.delete({ where: { id: existingFollow.id } });
      await cacheInvalidatePattern(`user:*`);
      return { success: true, following: false };
    } else {
      // Follow
      await prisma.follows.create({
        data: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      });
      await cacheInvalidatePattern(`user:*`);
      return { success: true, following: true };
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return { success: false, error: 'Failed to toggle follow' };
  }
}

export async function checkIfFollowing(targetUsername: string): Promise<boolean> {
  try {
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
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

// DEBUG FUNCTION - Check database state
export async function debugReplies() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('[DEBUG] User not found');
      return { error: 'Not authenticated' };
    }

    // Get ALL posts by this user
    const allPosts = await prisma.post.findMany({
      where: { authorId: user.id },
      select: {
        id: true,
        content: true,
        parentId: true,
        authorId: true,
      },
    });

    // Get only replies
    const replies = await prisma.post.findMany({
      where: {
        authorId: user.id,
        parentId: { not: null },
      },
      select: {
        id: true,
        content: true,
        parentId: true,
        authorId: true,
      },
    });

    console.log('[DEBUG] User ID:', user.id);
    console.log('[DEBUG] Total posts by user:', allPosts.length);
    console.log('[DEBUG] All posts:', JSON.stringify(allPosts, null, 2));
    console.log('[DEBUG] Replies by user:', replies.length);
    console.log('[DEBUG] Replies:', JSON.stringify(replies, null, 2));

    return {
      userId: user.id,
      username: user.username,
      totalPosts: allPosts.length,
      allPosts,
      totalReplies: replies.length,
      replies,
    };
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    return { error: String(error) };
  }
}

// ========== NOTIFICATIONS ==========

export async function getNotifications() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const notifications = await prisma.notification.findMany({
      where: { recipientId: user.id },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            verified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      success: true,
      notifications: notifications.map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: 'Failed to fetch notifications' };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await prisma.notification.update({
      where: {
        id: notificationId,
        recipientId: user.id, // Ensure user owns this notification
      },
      data: { read: true },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: 'Failed to mark notification as read' };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    await prisma.notification.updateMany({
      where: {
        recipientId: user.id,
        read: false,
      },
      data: { read: true },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: 'Failed to mark all notifications as read' };
  }
}

export async function getUnreadNotificationCount() {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    const count = await prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

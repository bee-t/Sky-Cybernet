'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Repeat2, MessageCircle, User } from 'lucide-react';
import { markNotificationAsRead } from '@/app/actions';

type NotificationItemProps = {
  notification: {
    id: string;
    type: string;
    read: boolean;
    createdAt: string;
    postId: string | null;
    sender: {
      username: string;
      displayName: string;
      avatar: string | null;
      verified: boolean;
    };
  };
};

export default function NotificationItem({ notification }: NotificationItemProps) {
  const [isRead, setIsRead] = useState(notification.read);

  const handleClick = async () => {
    if (!isRead) {
      setIsRead(true);
      await markNotificationAsRead(notification.id);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="w-5 h-5 text-[#00ff41]/70" />;
      case 'repost':
        return <Repeat2 className="w-5 h-5 text-[#00ff41]/70" />;
      case 'reply':
        return <MessageCircle className="w-5 h-5 text-[#00ff41]/70" />;
      case 'follow':
        return <User className="w-5 h-5 text-[#00ff41]/70" />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    switch (notification.type) {
      case 'like':
        return 'liked your transmission';
      case 'repost':
        return 'reposted your transmission';
      case 'reply':
        return 'replied to your transmission';
      case 'follow':
        return 'followed you';
      default:
        return 'interacted with you';
    }
  };

  const getLink = () => {
    if (notification.type === 'follow') {
      return `/user/${notification.sender.username}`;
    }
    return notification.postId ? `/post/${notification.postId}` : '#';
  };

  const timeAgo = () => {
    const now = new Date();
    const created = new Date(notification.createdAt);
    const seconds = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <Link
      href={getLink()}
      onClick={handleClick}
      className={`block hover:bg-[#00ff41]/5 transition-colors border-l-4 ${
        isRead ? 'border-transparent' : 'border-[#00ff41]/50 bg-[#00ff41]/5'
      }`}
    >
      <div className="p-4 flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full border-2 border-[#00ff41]/40 flex items-center justify-center bg-black flex-shrink-0">
              <User className="w-5 h-5 text-[#00ff41]/70" />
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#00ff41]/90 font-mono">
                <span className="font-bold">{notification.sender.displayName}</span>{' '}
                <span className="text-[#00ff41]/60">{getMessage()}</span>
              </p>
              <p className="text-xs text-[#00ff41]/40 font-mono mt-1">{timeAgo()}</p>
            </div>
          </div>
        </div>

        {/* Unread indicator */}
        {!isRead && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#00ff41] military-glow"></div>
          </div>
        )}
      </div>
    </Link>
  );
}

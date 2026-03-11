'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '../lib/SocketProvider';
import { getUnreadNotificationCount } from '../actions';

type NotificationBellProps = {
  className?: string;
};

export default function NotificationBell({ 
  className = 'w-4 h-4'
}: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();

  // Fetch initial unread count
  useEffect(() => {
    getUnreadNotificationCount().then(count => setUnreadCount(count));
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      setUnreadCount(prev => prev + 1);
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [socket]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <Bell className={className} />
      {unreadCount > 0 && (
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00ff41] text-black text-[9px] font-bold font-mono rounded-sm min-w-[16px] h-[16px] px-1 flex items-center justify-center border border-black shadow-[0_0_8px_rgba(0,255,65,0.6)] animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
}

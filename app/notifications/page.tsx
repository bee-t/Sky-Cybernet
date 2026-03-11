import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell } from 'lucide-react';
import { getCurrentUser } from '@/app/lib/auth';
import { getNotifications, markAllNotificationsAsRead } from '@/app/actions';
import NotificationItem from './NotificationItem';

export default async function NotificationsPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/auth/login');
  }

  const result = await getNotifications();
  const notifications = result.success ? result.notifications || [] : [];

  return (
    <div className="min-h-screen bg-black relative z-10">
      <div className="max-w-2xl mx-auto border-x border-[#00ff41]/20 min-h-screen relative">
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-sm bg-black/90 border-b border-[#00ff41]/20">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:bg-[#00ff41]/10 rounded p-2 -m-2 transition-all duration-200">
                <ArrowLeft className="w-5 h-5 text-[#00ff41]/70" />
              </Link>
              <h1 className="text-xl font-bold text-[#00ff41] military-glow font-mono tracking-wider">
                ALERTS
              </h1>
            </div>
            {notifications.length > 0 && (
              <form action={async () => {
                'use server';
                await markAllNotificationsAsRead();
              }}>
                <button
                  type="submit"
                  className="text-xs text-[#00ff41]/70 hover:text-[#00ff41] font-mono transition-colors"
                >
                  MARK ALL READ
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-[#00ff41]/10">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Bell className="w-16 h-16 text-[#00ff41]/20 mb-4" />
              <p className="text-[#00ff41]/50 font-mono text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

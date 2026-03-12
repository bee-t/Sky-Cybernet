'use client';

import { useEffect, useState } from 'react';
import { Activity, UserPlus, FileText, Heart, Share2, Bell } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'user_join' | 'post_create' | 'reaction' | 'follow';
  user: string;
  target?: string;
  timestamp: string;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        // Simulate fetching recent activity (you can create an API endpoint for this)
        const response = await fetch('/api/admin/analytics');
        if (!response.ok) throw new Error('Failed to fetch');
        
        // For now, we'll show placeholder data
        // In a real app, create a dedicated endpoint for recent activity
        setActivities([]);
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_join':
        return <UserPlus className="w-4 h-4" />;
      case 'post_create':
        return <FileText className="w-4 h-4" />;
      case 'reaction':
        return <Heart className="w-4 h-4" />;
      case 'follow':
        return <Share2 className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_join':
        return 'text-green-400 bg-green-500/20';
      case 'post_create':
        return 'text-blue-400 bg-blue-500/20';
      case 'reaction':
        return 'text-pink-400 bg-pink-500/20';
      case 'follow':
        return 'text-purple-400 bg-purple-500/20';
      default:
        return 'text-cyan-400 bg-cyan-500/20';
    }
  };

  return (
    <div className="military-border bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
        <h2 className="text-2xl font-bold military-glow" style={{ color: 'var(--color-primary)' }}>
          RECENT ACTIVITY
        </h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg animate-pulse">
              <div className="w-10 h-10 rounded-full" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}></div>
                <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(var(--color-primary-rgb), 0.3)' }} />
          <p className="text-gray-400">
            System activity will appear here
          </p>
          <p className="text-sm mt-1 text-gray-500">
            Configure activity tracking in your admin settings
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 bg-gray-800/20 hover:bg-gray-800/40 rounded-lg transition-colors"
            >
              <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-cyan-100">
                  <span className="font-semibold">{activity.user}</span>
                  {' '}{activity.target && `→ ${activity.target}`}
                </p>
                <p className="text-xs text-cyan-600/70">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

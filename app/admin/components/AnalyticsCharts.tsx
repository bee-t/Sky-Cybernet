'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, MapPin } from 'lucide-react';

interface AnalyticsData {
  userGrowth: { date: string; count: number }[];
  postActivity: { date: string; count: number }[];
  topLocations: { location: string; count: number }[];
}

export default function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/admin/analytics');
        if (!response.ok) throw new Error('Failed to fetch');
        const analytics = await response.json();
        setData({
          userGrowth: analytics.userGrowth || [],
          postActivity: analytics.postActivity || [],
          topLocations: analytics.topLocations || [],
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="military-border bg-gray-900/30 rounded-lg p-6 animate-pulse backdrop-blur-sm">
          <div className="h-64 rounded" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}></div>
        </div>
        <div className="military-border bg-gray-900/30 rounded-lg p-6 animate-pulse backdrop-blur-sm">
          <div className="h-64 rounded" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Calculate max values for scaling
  const maxUserGrowth = Math.max(...data.userGrowth.map(d => d.count), 1);
  const maxPostActivity = Math.max(...data.postActivity.map(d => d.count), 1);
  const maxLocation = Math.max(...data.topLocations.map(l => l.count), 1);

  return (
    <div className="space-y-6 mb-8">
      {/* User Growth and Post Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="military-border bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <h3 className="text-lg font-bold military-glow" style={{ color: 'var(--color-primary)' }}>
              USER GROWTH (30 Days)
            </h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-1">
            {data.userGrowth.slice(-30).map((item, index) => {
              const height = (item.count / maxUserGrowth) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 rounded-t transition-all duration-200 relative group"
                  style={{ 
                    height: `${Math.max(height, 2)}%`,
                    backgroundColor: 'rgba(var(--color-primary-rgb), 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.2)';
                  }}
                  title={`${item.date}: ${item.count} users`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap military-border" style={{ color: 'var(--color-primary)' }}>
                    {new Date(item.date).toLocaleDateString()}: {item.count}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-center" style={{ color: 'var(--color-secondary-dark)' }}>
            Last 30 days
          </div>
        </div>

        {/* Post Activity Chart */}
        <div className="military-border bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <h3 className="text-lg font-bold military-glow" style={{ color: 'var(--color-primary)' }}>
              POST ACTIVITY (30 Days)
            </h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-1">
            {data.postActivity.slice(-30).map((item, index) => {
              const height = (item.count / maxPostActivity) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 rounded-t transition-all duration-200 relative group"
                  style={{ 
                    height: `${Math.max(height, 2)}%`,
                    backgroundColor: 'rgba(var(--color-primary-rgb), 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.2)';
                  }}
                  title={`${item.date}: ${item.count} posts`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap military-border" style={{ color: 'var(--color-primary)' }}>
                    {new Date(item.date).toLocaleDateString()}: {item.count}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-center text-gray-500">
            Last 30 days
          </div>
        </div>
      </div>

      {/* Top Locations */}
      <div className="military-border bg-gray-900/30 rounded-lg p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          <h3 className="text-lg font-bold military-glow" style={{ color: 'var(--color-primary)' }}>
            TOP LOCATIONS
          </h3>
        </div>
        <div className="space-y-3">
          {data.topLocations.slice(0, 10).map((location, index) => {
            const percentage = (location.count / maxLocation) * 100;
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-primary)' }}>{location.location}</span>
                  <span className="font-mono" style={{ color: 'var(--color-primary)' }}>{location.count}</span>
                </div>
                <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percentage}%`,
                      background: `linear-gradient(to right, var(--color-primary-dark), var(--color-primary))`
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

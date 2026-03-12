'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, Heart, TrendingUp, Activity } from 'lucide-react';

interface OverviewStats {
  totalUsers: number;
  totalPosts: number;
  totalReactions: number;
  activeUsersToday: number;
  activeUsersWeek: number;
}

export default function StatsOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/analytics');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setStats(data.overview);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="military-border bg-gray-900/30 rounded-lg p-6 animate-pulse backdrop-blur-sm"
          >
            <div className="h-12 rounded mb-2" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}></div>
            <div className="h-8 rounded" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8 backdrop-blur-sm">
        <p className="text-red-400">Failed to load statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'cyan',
      change: '+12%',
    },
    {
      label: 'Total Posts',
      value: stats.totalPosts.toLocaleString(),
      icon: FileText,
      color: 'purple',
      change: '+8%',
    },
    {
      label: 'Total Reactions',
      value: stats.totalReactions.toLocaleString(),
      icon: Heart,
      color: 'pink',
      change: '+15%',
    },
    {
      label: 'Active Today',
      value: stats.activeUsersToday.toLocaleString(),
      icon: Activity,
      color: 'green',
      change: `${((stats.activeUsersToday / stats.totalUsers) * 100).toFixed(1)}%`,
    },
    {
      label: 'Active Week',
      value: stats.activeUsersWeek.toLocaleString(),
      icon: TrendingUp,
      color: 'blue',
      change: `${((stats.activeUsersWeek / stats.totalUsers) * 100).toFixed(1)}%`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="military-border bg-gray-900/30 rounded-lg p-6 hover:shadow-lg transition-all duration-200 backdrop-blur-sm"
          style={{ borderColor: 'rgba(var(--color-primary-rgb), 0.3)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <stat.icon className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
            <span className="text-xs px-2 py-1 rounded" style={{ 
              color: 'var(--color-primary)', 
              backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' 
            }}>
              {stat.change}
            </span>
          </div>
          <p className="text-2xl font-bold mb-1 military-glow" style={{ color: 'var(--color-primary)' }}>
            {stat.value}
          </p>
          <p className="text-sm text-gray-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

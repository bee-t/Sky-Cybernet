/**
 * Admin Dashboard Page
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/app/lib/admin';
import StatsOverview from './components/StatsOverview';
import UserManagement from './components/UserManagement';
import AnalyticsCharts from './components/AnalyticsCharts';
import RecentActivity from './components/RecentActivity';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const adminAccess = await isAdmin();

  if (!adminAccess) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold military-glow tracking-wider" style={{ color: 'var(--color-primary)' }}>
            ADMIN DASHBOARD
          </h1>
          <p className="mt-2 text-gray-400">
            System Overview & Management Console
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview />

        {/* Analytics Charts */}
        <AnalyticsCharts />

        {/* User Management */}
        <UserManagement />

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  );
}

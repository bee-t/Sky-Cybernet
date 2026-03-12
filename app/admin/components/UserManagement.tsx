'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, Search, Filter, Shield, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  role: string;
  verified: boolean;
  location?: string;
  avatar?: string;
  createdAt: string;
  lastActive: string;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search,
        role: roleFilter,
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function getTimeSince(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
  }

  return (
    <div className="military-border bg-gray-900/30 rounded-lg p-6 mb-8 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
        <h2 className="text-2xl font-bold military-glow" style={{ color: 'var(--color-primary)' }}>
          USER MANAGEMENT
        </h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(var(--color-primary-rgb), 0.5)' }} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full military-border bg-gray-900/50 rounded-lg pl-10 pr-4 py-2 placeholder-gray-600 focus:outline-none transition-all"
            style={{ 
              borderColor: 'rgba(var(--color-primary-rgb), 0.3)',
              color: 'var(--color-primary)'
            }}
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(var(--color-primary-rgb), 0.5)' }} />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full military-border bg-gray-900/50 rounded-lg pl-10 pr-4 py-2 focus:outline-none appearance-none transition-all"
            style={{ 
              borderColor: 'rgba(var(--color-primary-rgb), 0.3)',
              color: 'var(--color-primary)'
            }}
          >
            <option value="all" className="bg-gray-900 text-gray-200">All Roles</option>
            <option value="user" className="bg-gray-900 text-gray-200">Users</option>
            <option value="admin" className="bg-gray-900 text-gray-200">Admins</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-800/30 rounded-lg p-4 animate-pulse">
              <div className="h-12 rounded" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}></div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No users found
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(var(--color-primary-rgb), 0.3)' }}>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Stats</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Location</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Last Active</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid rgba(var(--color-primary-rgb), 0.1)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: `linear-gradient(to bottom right, var(--color-primary), var(--color-primary-dark))` }}>
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>{user.displayName}</p>
                            {user.verified && (
                              <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                            )}
                          </div>
                          <p className="text-sm text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                          user.role === 'ADMIN'
                            ? 'bg-red-500/20 text-red-400'
                            : ''
                        }`}
                        style={user.role !== 'ADMIN' ? {
                          backgroundColor: 'rgba(var(--color-primary-rgb), 0.2)',
                          color: 'var(--color-primary)'
                        } : {}}
                      >
                        {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-4 text-sm text-gray-300">
                        <span>{user._count.posts} posts</span>
                        <span>{user._count.followers} followers</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-200">
                      {user.location || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {getTimeSince(user.lastActive)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6" style={{ borderTop: '1px solid rgba(var(--color-primary-rgb), 0.3)' }}>
              <div className="text-sm text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 military-border bg-gray-900/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === page
                              ? ''
                              : 'military-border bg-gray-900/50'
                          }`}
                          style={currentPage === page ? {
                            backgroundColor: 'rgba(var(--color-primary-rgb), 0.2)',
                            color: 'var(--color-primary)',
                            border: '1px solid var(--color-primary)'
                          } : {
                            color: 'var(--color-primary)'
                          }}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 military-border bg-gray-900/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Home, Search, Bell, Mail, User, Settings, LogOut, MoreHorizontal, Shield } from 'lucide-react';
import ComposeModal from './ComposeModal';
import NotificationBell from './NotificationBell';

type User = {
  username: string;
  displayName: string;
  avatar?: string | null;
};

export default function Navigation({ currentUser, isAdmin }: { currentUser: User; isAdmin?: boolean }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { icon: Home, label: 'Base', href: '/', code: 'CMD-01' },
    { icon: Search, label: 'Recon', href: '/explore', code: 'CMD-02' },
    { icon: Bell, label: 'Alerts', href: '/notifications', code: 'CMD-03' },
    { icon: Mail, label: 'Comms', href: '/messages', code: 'CMD-04' },
    { icon: User, label: 'Operator', href: `/user/${currentUser.username}`, code: 'CMD-05' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-72 border-r-2 border-[#00ff41]/30 flex flex-col bg-black">
      {/* Terminal Header */}
      <div className="border-b-2 border-[#00ff41]/30 bg-[#00ff41]/5 p-4">
        <Link href="/" className="block group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-black border-2 border-[#00ff41] rounded flex items-center justify-center text-sm font-bold text-[#00ff41] group-hover:shadow-lg group-hover:shadow-[#00ff41]/30 transition-all">
              SC
            </div>
            <div>
              <div className="text-lg font-bold text-[#00ff41] military-glow tracking-widest font-mono">
                SKY-CYBERNET
              </div>
              <div className="text-[10px] text-[#00ff41]/60 font-mono tracking-wider">
                STRATEGIC CYBER NETWORK
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#00ff41]/50">TERMINAL v2.5.1</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse"></div>
              <span className="text-[#00ff41]/70">ONLINE</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Command List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-[10px] text-[#00ff41]/40 font-mono tracking-widest mb-3 px-2">
          ▸ SYSTEM COMMANDS
        </div>
        {navItems.map(({ icon: Icon, label, href, code }) => (
          <Link
            key={href}
            href={href}
            className="block group"
          >
            <div className="border border-[#00ff41]/20 hover:border-[#00ff41] bg-black hover:bg-[#00ff41]/5 transition-all duration-200 rounded overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 border border-[#00ff41]/40 rounded flex items-center justify-center flex-shrink-0 group-hover:border-[#00ff41] group-hover:bg-[#00ff41]/10 transition-all">
                  {label === 'Alerts' ? (
                    <NotificationBell className="w-4 h-4 text-[#00ff41]/70 group-hover:text-[#00ff41]" />
                  ) : (
                    <Icon className="w-4 h-4 text-[#00ff41]/70 group-hover:text-[#00ff41]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-[#00ff41]/90 group-hover:text-[#00ff41] truncate">
                    {label.toUpperCase()}
                  </div>
                  <div className="text-[10px] text-[#00ff41]/40 font-mono">
                    {code}
                  </div>
                </div>
                <div className="text-[#00ff41]/30 group-hover:text-[#00ff41]/70 transition-colors text-lg">
                  ›
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Transmit Button */}
        <div className="pt-4">
          <button
            onClick={() => setShowComposeModal(true)}
            className="block w-full"
          >
            <div className="relative border-2 border-[#00ff41] bg-[#00ff41]/10 hover:bg-[#00ff41]/30 text-[#00ff41] rounded overflow-hidden transition-all duration-200 group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ff41]/0 via-[#00ff41]/20 to-[#00ff41]/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative py-4 text-center">
                <div className="text-sm font-mono font-bold tracking-widest military-glow">
                  ◢ NEW TRANSMISSION ◣
                </div>
                <div className="text-[10px] font-mono opacity-70 mt-1">
                  BROADCAST MESSAGE
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Operator Profile */}
      <div className="border-t-2 border-[#00ff41]/30 bg-[#00ff41]/5 p-3">
        <div className="text-[10px] text-[#00ff41]/40 font-mono tracking-widest mb-2 px-1">
          ▸ ACTIVE OPERATOR
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full border border-[#00ff41]/30 hover:border-[#00ff41] bg-black hover:bg-[#00ff41]/5 rounded transition-all duration-200 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded border-2 border-[#00ff41] bg-black flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-[#00ff41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="font-mono text-sm truncate text-[#00ff41]">
                  {currentUser.displayName}
                </div>
                <div className="text-xs text-[#00ff41]/60 truncate font-mono">
                  @{currentUser.username}
                </div>
                <div className="text-[10px] text-[#00ff41]/40 font-mono mt-0.5">
                  ID: {currentUser.username.slice(0, 8).toUpperCase()}
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 flex-shrink-0 text-[#00ff41]/50" />
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-black border-2 border-[#00ff41]/30 rounded overflow-hidden shadow-lg shadow-[#00ff41]/10">
              <Link
                href={`/user/${currentUser.username}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#00ff41]/10 transition-all duration-200 border-b border-[#00ff41]/20"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="w-6 h-6 border border-[#00ff41]/40 rounded flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-[#00ff41]/70" />
                </div>
                <span className="text-[#00ff41]/90 font-mono text-sm">View Profile</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#00ff41]/10 transition-all duration-200 border-b border-[#00ff41]/20"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="w-6 h-6 border border-[#00ff41]/40 rounded flex items-center justify-center">
                  <Settings className="w-3.5 h-3.5 text-[#00ff41]/70" />
                </div>
                <span className="text-[#00ff41]/90 font-mono text-sm">System Config</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-cyan-500/10 transition-all duration-200 border-b border-[#00ff41]/20"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="w-6 h-6 border border-cyan-400/40 rounded flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-cyan-400/70" />
                  </div>
                  <span className="text-cyan-400/90 font-mono text-sm">Admin Dashboard</span>
                </Link>
              )}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-all duration-200 text-left"
                onClick={async () => {
                  setShowUserMenu(false);
                  try {
                    const response = await fetch('/api/auth/logout', {
                      method: 'POST',
                    });
                    if (response.ok) {
                      window.location.href = '/auth/login';
                    }
                  } catch (error) {
                    console.error('Logout error:', error);
                  }
                }}
              >
                <div className="w-6 h-6 border border-red-600/40 rounded flex items-center justify-center">
                  <LogOut className="w-3.5 h-3.5 text-red-600/80" />
                </div>
                <span className="text-red-600/90 font-mono text-sm">Disconnect</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <ComposeModal 
        isOpen={showComposeModal} 
        onClose={() => setShowComposeModal(false)} 
      />
    </nav>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Search, Bell, Mail, User, LogOut, X } from 'lucide-react';
import ComposeModal from './ComposeModal';
import NotificationBell from './NotificationBell';

type User = {
  username: string;
  displayName: string;
  avatar?: string | null;
};

export default function MobileNav({ currentUser, isOpen, setIsOpen }: { currentUser: User | null; isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const [showComposeModal, setShowComposeModal] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, setIsOpen]);

  if (!currentUser) return null;

  const navItems = [
    { icon: Home, label: 'Base', href: '/', code: 'CMD-01' },
    { icon: Search, label: 'Recon', href: '/explore', code: 'CMD-02', disabled: true },
    { icon: Bell, label: 'Alerts', href: '/notifications', code: 'CMD-03' },
    { icon: Mail, label: 'Comms', href: '/messages', code: 'CMD-04', disabled: true },
    { icon: User, label: 'Operator', href: `/user/${currentUser.username}`, code: 'CMD-05' },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-black border-r-2 border-[#00ff41]/30 z-[101] lg:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b-2 border-[#00ff41]/30 bg-[#00ff41]/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black border-2 border-[#00ff41] rounded flex items-center justify-center text-sm font-bold text-[#00ff41]">
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
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[#00ff41]/10 rounded transition-all"
              >
                <X className="w-5 h-5 text-[#00ff41]" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#00ff41]/50">TERMINAL v2.5.1</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse"></div>
                <span className="text-[#00ff41]/70">ONLINE</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="text-[10px] text-[#00ff41]/40 font-mono tracking-widest mb-3 px-2">
              ▸ SYSTEM COMMANDS
            </div>
            {navItems.map(({ icon: Icon, label, href, code, disabled }) => {
              return disabled ? (
                <div
                  key={code}
                  className="block opacity-50 cursor-not-allowed"
                >
                  <div className="border border-[#00ff41]/20 bg-black/50 rounded overflow-hidden">
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-8 h-8 border border-[#00ff41]/20 rounded flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#00ff41]/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm text-[#00ff41]/40 truncate">
                          {label.toUpperCase()}
                        </div>
                        <div className="text-[10px] text-[#00ff41]/30 font-mono">
                          {code} • DISABLED
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={code}
                  href={href}
                  onClick={() => setIsOpen(false)}
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
              );
            })}

            {/* Transmit Button */}
            <div className="pt-4">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowComposeModal(true);
                }}
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

          {/* User Profile */}
          <div className="border-t-2 border-[#00ff41]/30 bg-[#00ff41]/5 p-3">
            <div className="text-[10px] text-[#00ff41]/40 font-mono tracking-widest mb-2 px-1">
              ▸ ACTIVE OPERATOR
            </div>
            <div className="border border-[#00ff41]/30 bg-black rounded overflow-hidden">
              <div className="flex items-center gap-3 p-3 border-b border-[#00ff41]/20">
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
              </div>

              {/* Menu Items */}
              <div className="space-y-0">
                <Link
                  href={`/user/${currentUser.username}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#00ff41]/10 transition-all duration-200 border-b border-[#00ff41]/20"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-6 h-6 border border-[#00ff41]/40 rounded flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-[#00ff41]/70" />
                  </div>
                  <span className="text-[#00ff41]/90 font-mono text-sm">View Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#00ff41]/10 transition-all duration-200 border-b border-[#00ff41]/20"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-6 h-6 border border-[#00ff41]/40 rounded flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[#00ff41]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-[#00ff41]/90 font-mono text-sm">System Config</span>
                </Link>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-all duration-200 text-left"
                  onClick={async () => {
                    setIsOpen(false);
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
            </div>
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      <ComposeModal isOpen={showComposeModal} onClose={() => setShowComposeModal(false)} />
    </>
  );
}

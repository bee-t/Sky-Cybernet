'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ThemeSwitcher from '../components/ThemeSwitcher';

type User = {
  username: string;
  displayName: string;
  avatar?: string | null;
};

export default function SettingsContent({ currentUser }: { currentUser: User }) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-black/95 border-b-2 border-[#00ff41]/40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 border-2 border-[#00ff41]/40 bg-black/90 backdrop-blur-sm rounded transition-all duration-200 flex-shrink-0 hover:bg-[#00ff41]/10 text-[#00ff41]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-mono font-bold tracking-widest text-[#00ff41]">
                SYSTEM CONFIG
              </h1>
              <p className="text-xs font-mono text-[#00ff41]/60">
                Configure system parameters
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Section Header */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00ff41]/30"></div>
          <span className="font-mono text-xs tracking-widest text-[#00ff41]/60">
            APPEARANCE
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00ff41]/30"></div>
        </div>

        {/* Theme Setting Card */}
        <div className="border-2 border-[#00ff41]/30 bg-black/50 backdrop-blur-sm rounded overflow-hidden hover:border-[#00ff41]/50 hover:shadow-lg hover:shadow-[#00ff41]/10 transition-all duration-300">
          <div className="border-b border-[#00ff41]/30 bg-[#00ff41]/5 px-4 py-3">
            <h2 className="font-mono font-bold text-sm text-[#00ff41]">
              COLOR SCHEME
            </h2>
            <p className="text-xs font-mono mt-1 text-[#00ff41]/60">
              Select your preferred terminal color theme
            </p>
          </div>
          <div className="p-4">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Account Section */}
        <div className="flex items-center gap-2 mt-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00ff41]/30"></div>
          <span className="font-mono text-xs tracking-widest text-[#00ff41]/60">
            ACCOUNT
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00ff41]/30"></div>
        </div>

        {/* Account Info Card */}
        <div className="border-2 border-[#00ff41]/30 bg-black/50 backdrop-blur-sm rounded overflow-hidden hover:border-[#00ff41]/50 hover:shadow-lg hover:shadow-[#00ff41]/10 transition-all duration-300">
          <div className="border-b border-[#00ff41]/30 bg-[#00ff41]/5 px-4 py-3">
            <h2 className="font-mono font-bold text-sm text-[#00ff41]">
              OPERATOR DETAILS
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#00ff41]/20">
              <span className="text-xs font-mono text-[#00ff41]/60">
                Username:
              </span>
              <span className="text-sm font-mono font-bold text-[#00ff41]">
                @{currentUser.username}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#00ff41]/20">
              <span className="text-xs font-mono text-[#00ff41]/60">
                Display Name:
              </span>
              <span className="text-sm font-mono font-bold text-[#00ff41]">
                {currentUser.displayName}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-mono text-[#00ff41]/60">
                Operator ID:
              </span>
              <span className="text-sm font-mono font-bold text-[#00ff41]">
                {currentUser.username.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="flex items-center gap-2 mt-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00ff41]/30"></div>
          <span className="font-mono text-xs tracking-widest text-[#00ff41]/60">
            SYSTEM
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00ff41]/30"></div>
        </div>

        {/* System Info Card */}
        <div className="border-2 border-[#00ff41]/30 bg-black/50 backdrop-blur-sm rounded overflow-hidden hover:border-[#00ff41]/50 hover:shadow-lg hover:shadow-[#00ff41]/10 transition-all duration-300">
          <div className="border-b border-[#00ff41]/30 bg-[#00ff41]/5 px-4 py-3">
            <h2 className="font-mono font-bold text-sm text-[#00ff41]">
              PLATFORM INFO
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#00ff41]/20">
              <span className="text-xs font-mono text-[#00ff41]/60">
                Platform:
              </span>
              <span className="text-sm font-mono text-[#00ff41]">
                SKY-CYBERNET
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#00ff41]/20">
              <span className="text-xs font-mono text-[#00ff41]/60">
                Version:
              </span>
              <span className="text-sm font-mono text-[#00ff41]">
                v2.5.1
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs font-mono text-[#00ff41]/60">
                Status:
              </span>
              <span className="text-sm font-mono flex items-center gap-2 text-[#00ff41]">
                <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse"></div>
                OPERATIONAL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

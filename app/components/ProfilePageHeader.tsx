'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProfilePageHeader({ 
  displayName,
  postCount
}: { 
  displayName: string;
  postCount: number;
}) {
  return (
    <div className="sticky top-0 z-10 backdrop-blur-sm bg-black/90 border-b border-[#00ff41]/20">
      <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4">
        {/* Back button */}
        <Link href="/" className="hover:bg-[#00ff41]/10 rounded p-2 -m-2 transition-all duration-200">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#00ff41]/70" />
        </Link>

        {/* User info */}
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-[#00ff41] military-glow font-mono tracking-wide sm:tracking-wider truncate">
            {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-[#00ff41]/50 font-mono">
            {postCount} transmissions
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import MobileNav from './MobileNav';

type User = {
  username: string;
  displayName: string;
  avatar?: string | null;
};

export default function PageHeader({ currentUser }: { currentUser: User | null }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('--:--:--');

  useEffect(() => {
    // Update time immediately on mount
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Command Center Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-black/95 border-b-2 border-[#00ff41]/40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Hamburger menu (mobile only) */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-1.5 border-2 border-[#00ff41]/40 bg-black/90 backdrop-blur-sm rounded hover:border-[#00ff41] hover:bg-[#00ff41]/10 transition-all duration-200 flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-[#00ff41]" />
            </button>

            {/* Center: Status info */}
            <div className="flex-1 flex items-center justify-center lg:justify-start gap-2 text-[#00ff41]/60 text-xs sm:text-sm font-mono">
              <span className="px-2 py-1 border border-[#00ff41]/30 rounded">LIVE</span>
              <span className="hidden sm:inline">SECURITY: MAX</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">STATUS: OPERATIONAL</span>
            </div>

            {/* Right: Time */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-[#00ff41]/60 text-[10px] sm:text-xs font-mono whitespace-nowrap flex-shrink-0">
                {currentTime} UTC
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {currentUser && (
        <MobileNav 
          currentUser={currentUser} 
          isOpen={mobileNavOpen} 
          setIsOpen={setMobileNavOpen} 
        />
      )}
    </>
  );
}

'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import ComposeBox from './ComposeBox';

export default function ComposeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl z-10">
        <div className="border-2 border-[#00ff41]/50 bg-black rounded-lg overflow-hidden shadow-2xl shadow-[#00ff41]/20">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#00ff41]/30 bg-[#00ff41]/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00ff41] animate-pulse"></div>
              <h2 className="text-lg font-bold text-[#00ff41] font-mono tracking-widest military-glow">
                ◢ NEW TRANSMISSION ◣
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#00ff41]/10 rounded transition-all duration-200 border border-transparent hover:border-[#00ff41]/30"
            >
              <X className="w-5 h-5 text-[#00ff41]/70 hover:text-[#00ff41]" />
            </button>
          </div>

          {/* Compose Box */}
          <div className="p-4">
            <ComposeBox onSuccess={onClose} hideHeader />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "DELETE TRANSMISSION",
  message = "Are you sure you want to delete this transmission? This action cannot be undone."
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}) {
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
      <div className="relative w-full max-w-md z-10">
        <div className="border-2 border-red-500/50 bg-black rounded-lg overflow-hidden shadow-2xl shadow-red-500/20">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-red-500/30 bg-red-500/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <h2 className="text-lg font-bold text-red-500 font-mono tracking-widest">
                ◢ {title} ◣
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/10 rounded transition-all duration-200 border border-transparent hover:border-red-500/30"
            >
              <X className="w-5 h-5 text-red-500/70 hover:text-red-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <p className="text-[#00ff41]/80 font-mono text-sm leading-relaxed">
                {message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded border-2 border-[#00ff41]/30 bg-[#00ff41]/5 text-[#00ff41] font-mono text-sm hover:bg-[#00ff41]/10 hover:border-[#00ff41]/50 transition-all duration-200"
              >
                [ CANCEL ]
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-6 py-2 rounded border-2 border-red-500/50 bg-red-500/10 text-red-500 font-mono text-sm font-bold hover:bg-red-500/20 hover:border-red-500 transition-all duration-200"
              >
                [ DELETE ]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

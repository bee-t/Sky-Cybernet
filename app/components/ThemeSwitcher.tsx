'use client';

import { useTheme } from '../lib/ThemeProvider';
import { useEffect, useState } from 'react';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Queue the state update to avoid cascading renders
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-2 border border-[#00ff41]/30 rounded bg-black/30">
      <span className="font-mono text-xs text-[#00ff41]/60">THEME:</span>
      <div className="flex gap-1">
        <button
          onClick={() => setTheme('green')}
          disabled={!isClient}
          className={`px-2 py-1 rounded text-xs font-mono transition-all border disabled:opacity-50 ${
            isClient && theme === 'green'
              ? 'bg-[#00ff41]/20 text-[#00ff41] border-[#00ff41]'
              : 'bg-transparent text-[#00ff41]/60 border-[#00ff41]/30'
          }`}
        >
          GREEN
        </button>
        <button
          onClick={() => setTheme('orange')}
          disabled={!isClient}
          className={`px-2 py-1 rounded text-xs font-mono transition-all border disabled:opacity-50 ${
            isClient && theme === 'orange'
              ? 'bg-[#00ff41]/20 text-[#00ff41] border-[#00ff41]'
              : 'bg-transparent text-[#00ff41]/60 border-[#00ff41]/30'
          }`}
        >
          ORANGE
        </button>
      </div>
    </div>
  );
}

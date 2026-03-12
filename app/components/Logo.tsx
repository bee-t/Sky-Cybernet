/**
 * Sky-Cybernet Logo Component
 * Tactical cyber network branding with military aesthetic
 */

export function Logo({ 
  size = 40, 
  variant = 'full',
  className = '' 
}: { 
  size?: number;
  variant?: 'icon' | 'full' | 'minimal';
  className?: string;
}) {
  const primaryColor = 'var(--color-primary)';
  
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Outer tactical border */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          stroke={primaryColor}
          strokeWidth="2"
          fill="none"
        />
        
        {/* Corner brackets (tactical UI element) */}
        <path
          d="M5 15 L5 5 L15 5 M85 5 L95 5 L95 15 M95 85 L95 95 L85 95 M15 95 L5 95 L5 85"
          stroke={primaryColor}
          strokeWidth="3"
          strokeLinecap="square"
        />
        
        {/* Network node connections */}
        <circle cx="50" cy="30" r="4" fill={primaryColor} opacity="0.8" />
        <circle cx="30" cy="50" r="4" fill={primaryColor} opacity="0.8" />
        <circle cx="70" cy="50" r="4" fill={primaryColor} opacity="0.8" />
        <circle cx="50" cy="70" r="4" fill={primaryColor} opacity="0.8" />
        
        {/* Center hub */}
        <circle cx="50" cy="50" r="8" fill="none" stroke={primaryColor} strokeWidth="2" />
        <circle cx="50" cy="50" r="3" fill={primaryColor} />
        
        {/* Connection lines */}
        <line x1="50" y1="30" x2="50" y2="42" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
        <line x1="30" y1="50" x2="42" y2="50" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
        <line x1="70" y1="50" x2="58" y2="50" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
        <line x1="50" y1="70" x2="50" y2="58" stroke={primaryColor} strokeWidth="1" opacity="0.5" />
        
        {/* Scanning effect lines */}
        <line x1="20" y1="20" x2="35" y2="35" stroke={primaryColor} strokeWidth="0.5" opacity="0.3" />
        <line x1="80" y1="20" x2="65" y2="35" stroke={primaryColor} strokeWidth="0.5" opacity="0.3" />
        <line x1="20" y1="80" x2="35" y2="65" stroke={primaryColor} strokeWidth="0.5" opacity="0.3" />
        <line x1="80" y1="80" x2="65" y2="65" stroke={primaryColor} strokeWidth="0.5" opacity="0.3" />
      </svg>
    );
  }

  if (variant === 'minimal') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* S shape */}
        <path
          d="M 30 25 Q 20 25, 20 35 Q 20 45, 30 45 L 70 45 Q 80 45, 80 55 Q 80 65, 70 65 L 30 65"
          stroke={primaryColor}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* C shape */}
        <path
          d="M 75 75 Q 65 75, 65 85 Q 65 95, 75 95"
          stroke={primaryColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
        
        {/* Network dots */}
        <circle cx="85" cy="15" r="2" fill={primaryColor} />
        <circle cx="15" cy="85" r="2" fill={primaryColor} />
      </svg>
    );
  }

  // Full logo with text
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hexagonal border (tactical) */}
        <path
          d="M 30 5 L 70 5 L 95 50 L 70 95 L 30 95 L 5 50 Z"
          stroke={primaryColor}
          strokeWidth="2"
          fill="black"
          opacity="0.8"
        />
        
        {/* Inner targeting reticle */}
        <circle cx="50" cy="50" r="25" stroke={primaryColor} strokeWidth="1.5" fill="none" opacity="0.6" />
        <circle cx="50" cy="50" r="15" stroke={primaryColor} strokeWidth="1" fill="none" opacity="0.4" />
        
        {/* Crosshair */}
        <line x1="50" y1="20" x2="50" y2="35" stroke={primaryColor} strokeWidth="2" />
        <line x1="50" y1="65" x2="50" y2="80" stroke={primaryColor} strokeWidth="2" />
        <line x1="20" y1="50" x2="35" y2="50" stroke={primaryColor} strokeWidth="2" />
        <line x1="65" y1="50" x2="80" y2="50" stroke={primaryColor} strokeWidth="2" />
        
        {/* Center SC */}
        <text
          x="50"
          y="58"
          fontSize="24"
          fontWeight="bold"
          fontFamily="monospace"
          fill={primaryColor}
          textAnchor="middle"
        >
          SC
        </text>
        
        {/* Corner indicators */}
        <circle cx="30" cy="15" r="2" fill={primaryColor} className="animate-pulse" />
        <circle cx="70" cy="15" r="2" fill={primaryColor} className="animate-pulse" style={{ animationDelay: '0.5s' }} />
        <circle cx="85" cy="60" r="2" fill={primaryColor} className="animate-pulse" style={{ animationDelay: '1s' }} />
        <circle cx="15" cy="60" r="2" fill={primaryColor} className="animate-pulse" style={{ animationDelay: '1.5s' }} />
      </svg>
      
      <div className="flex flex-col">
        <span 
          className="font-bold tracking-widest font-mono military-glow text-lg"
          style={{ color: primaryColor }}
        >
          SKY-CYBERNET
        </span>
        <span 
          className="text-[10px] font-mono tracking-wider opacity-60"
          style={{ color: primaryColor }}
        >
          STRATEGIC NETWORK
        </span>
      </div>
    </div>
  );
}

/**
 * ASCII Art Logo variants for terminal displays
 */
export const ASCII_LOGOS = {
  compact: `
 ╔═══╗╔═══╗
 ║ S ║║ C ║
 ╚═══╝╚═══╝
  `,
  
  standard: `
 ╔═════════════════════════╗
 ║  ▄▀▀▀▀▄  ▄▀▀▀▀▄         ║
 ║  █▄▄▄   █                ║
 ║      █  █                ║
 ║  ▀▄▄▄▀  ▀▄▄▄▄▀          ║
 ║                          ║
 ║  SKY-CYBERNET           ║
 ╚═════════════════════════╝
  `,
  
  banner: `
  ███████╗██╗  ██╗██╗   ██╗
  ██╔════╝██║ ██╔╝╚██╗ ██╔╝
  ███████╗█████╔╝  ╚████╔╝ 
  ╚════██║██╔═██╗   ╚██╔╝  
  ███████║██║  ██╗   ██║   
  ╚══════╝╚═╝  ╚═╝   ╚═╝   
                            
   ▄████▄ ▓██   ██▓ ▄▄▄▄   
  ▒██▀ ▀█  ▒██  ██▒▓█████▄ 
  ▒▓█    ▄  ▒██ ██░▒██▒ ▄██
  ▒▓▓▄ ▄██▒ ░ ▐██▓░▒██░█▀  
  ▒ ▓███▀ ░ ░ ██▒▓░░▓█  ▀█▓
  ░ ░▒ ▒  ░  ██▒▒▒ ░▒▓███▀▒
    ░  ▒   ▓██ ░▒░ ▒░▒   ░ 
  ░        ▒ ▒ ░░   ░    ░ 
  ░ ░      ░ ░      ░      
  ░        ░ ░           ░ 
  
  STRATEGIC CYBER NETWORK
  ═══════════════════════════
  `,
  
  tactical: `
  ┏━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃  ◢◣  ╔═╗╦╔═  ╦ ╦        ┃
  ┃ ◢  ◣ ╚═╗╠╩╗─ ╚╦╝        ┃
  ┃ ◥  ◤ ╚═╝╩ ╩   ╩         ┃
  ┃  ◥◤                     ┃
  ┃ ╔═╗╦ ╦╔╗ ╔═╗╦═╗         ┃
  ┃ ║  ╚╦╝╠╩╗║╣ ╠╦╝         ┃
  ┃ ╚═╝ ╩ ╚═╝╚═╝╩╚═         ┃
  ┃                         ┃
  ┃ ╔╗╔╔═╗╔╦╗               ┃
  ┃ ║║║║╣  ║                ┃
  ┃ ╝╚╝╚═╝ ╩                ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━┛
  TACTICAL OPERATIONS SYSTEM
  `,
  
  minimal: `
  [S][K][Y] - [C][Y][B][E][R]
  ═══════════════════════════
  > STRATEGIC NETWORK <
  `
};

/**
 * Animated loading logo
 */
export function LoadingLogo({ size = 60 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-pulse"
      >
        {/* Rotating outer ring */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeDasharray="10 5"
          fill="none"
          opacity="0.6"
          className="animate-spin"
          style={{ animationDuration: '3s' }}
        />
        
        {/* Inner hexagon */}
        <path
          d="M 30 15 L 70 15 L 90 50 L 70 85 L 30 85 L 10 50 Z"
          stroke="var(--color-primary)"
          strokeWidth="2"
          fill="black"
          opacity="0.8"
        />
        
        {/* Pulsing center */}
        <circle
          cx="50"
          cy="50"
          r="20"
          stroke="var(--color-primary)"
          strokeWidth="2"
          fill="none"
          className="animate-ping"
        />
        
        <text
          x="50"
          y="58"
          fontSize="20"
          fontWeight="bold"
          fontFamily="monospace"
          fill="var(--color-primary)"
          textAnchor="middle"
          className="military-glow"
        >
          SC
        </text>
      </svg>
      
      <div className="text-xs font-mono tracking-wider" style={{ color: 'var(--color-primary)' }}>
        <span className="animate-pulse">INITIALIZING...</span>
      </div>
    </div>
  );
}

/**
 * Favicon generator helper
 */
export function generateFavicon(color: string = '#00ff41') {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 32, 32);
  
  // Border
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, 28, 28);
  
  // SC text
  ctx.fillStyle = color;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SC', 16, 16);
  
  return canvas.toDataURL();
}

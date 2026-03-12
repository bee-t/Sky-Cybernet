'use client';

import { Logo, LoadingLogo, ASCII_LOGOS } from '../components/Logo';

export default function BrandingDemoPage() {
  return (
    <div className="min-h-screen bg-black text-gray-200 p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-mono tracking-wider military-glow">
            SKY-CYBERNET BRAND IDENTITY
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            Strategic Cyber Network • Logo Design System
          </p>
        </div>

        {/* Logo Variants */}
        <section className="space-y-8">
          <h2 className="text-2xl font-mono military-glow border-b border-gray-800 pb-2">
            Logo Variants
          </h2>

          {/* Full Logo */}
          <div className="bg-gray-900/50 border border-gray-800 rounded p-8">
            <h3 className="text-sm font-mono text-gray-400 mb-6">FULL VARIANT</h3>
            <div className="flex items-center justify-center">
              <Logo variant="full" size={60} />
            </div>
            <pre className="mt-6 text-xs bg-black/50 p-4 rounded border border-gray-800 overflow-x-auto">
              {`<Logo variant="full" size={60} />`}
            </pre>
          </div>

          {/* Icon Variant */}
          <div className="bg-gray-900/50 border border-gray-800 rounded p-8">
            <h3 className="text-sm font-mono text-gray-400 mb-6">ICON VARIANT</h3>
            <div className="flex items-center justify-center gap-8">
              <Logo variant="icon" size={40} />
              <Logo variant="icon" size={60} />
              <Logo variant="icon" size={80} />
              <Logo variant="icon" size={120} />
            </div>
            <pre className="mt-6 text-xs bg-black/50 p-4 rounded border border-gray-800 overflow-x-auto">
              {`<Logo variant="icon" size={40} />
<Logo variant="icon" size={60} />
<Logo variant="icon" size={80} />
<Logo variant="icon" size={120} />`}
            </pre>
          </div>

          {/* Minimal Variant */}
          <div className="bg-gray-900/50 border border-gray-800 rounded p-8">
            <h3 className="text-sm font-mono text-gray-400 mb-6">MINIMAL VARIANT</h3>
            <div className="flex items-center justify-center gap-8">
              <Logo variant="minimal" size={32} />
              <Logo variant="minimal" size={48} />
              <Logo variant="minimal" size={64} />
            </div>
            <pre className="mt-6 text-xs bg-black/50 p-4 rounded border border-gray-800 overflow-x-auto">
              {`<Logo variant="minimal" size={32} />`}
            </pre>
          </div>

          {/* Loading Logo */}
          <div className="bg-gray-900/50 border border-gray-800 rounded p-8">
            <h3 className="text-sm font-mono text-gray-400 mb-6">LOADING VARIANT</h3>
            <div className="flex items-center justify-center">
              <LoadingLogo size={80} />
            </div>
            <pre className="mt-6 text-xs bg-black/50 p-4 rounded border border-gray-800 overflow-x-auto">
              {`<LoadingLogo size={80} />`}
            </pre>
          </div>
        </section>

        {/* ASCII Art Logos */}
        <section className="space-y-8">
          <h2 className="text-2xl font-mono military-glow border-b border-gray-800 pb-2">
            ASCII Art Variants
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(ASCII_LOGOS).map(([name, art]) => (
              <div key={name} className="bg-gray-900/50 border border-gray-800 rounded p-6">
                <h3 className="text-sm font-mono text-gray-400 mb-4 uppercase">
                  {name}
                </h3>
                <pre className="text-xs military-glow font-mono overflow-x-auto whitespace-pre">
                  {art}
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-8">
          <h2 className="text-2xl font-mono military-glow border-b border-gray-800 pb-2">
            Color Palette
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Green Theme */}
            <div className="space-y-4">
              <h3 className="text-sm font-mono text-gray-400">TACTICAL GREEN</h3>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded border-2 border-gray-700" style={{ backgroundColor: '#00ff41' }} />
                <div className="space-y-1 font-mono text-xs">
                  <div>#00ff41</div>
                  <div className="text-gray-500">RGB(0, 255, 65)</div>
                  <div className="text-gray-500">Matrix Green</div>
                </div>
              </div>
            </div>

            {/* Orange Theme */}
            <div className="space-y-4">
              <h3 className="text-sm font-mono text-gray-400">ORANGE ALERT</h3>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded border-2 border-gray-700" style={{ backgroundColor: '#ff8c00' }} />
                <div className="space-y-1 font-mono text-xs">
                  <div>#ff8c00</div>
                  <div className="text-gray-500">RGB(255, 140, 0)</div>
                  <div className="text-gray-500">Tactical Orange</div>
                </div>
              </div>
            </div>

            {/* Black */}
            <div className="space-y-4">
              <h3 className="text-sm font-mono text-gray-400">BACKGROUND</h3>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded border-2 border-gray-700" style={{ backgroundColor: '#000000' }} />
                <div className="space-y-1 font-mono text-xs">
                  <div>#000000</div>
                  <div className="text-gray-500">RGB(0, 0, 0)</div>
                  <div className="text-gray-500">Pure Black</div>
                </div>
              </div>
            </div>

            {/* Gray */}
            <div className="space-y-4">
              <h3 className="text-sm font-mono text-gray-400">TEXT PRIMARY</h3>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded border-2 border-gray-700" style={{ backgroundColor: '#e5e5e5' }} />
                <div className="space-y-1 font-mono text-xs">
                  <div>#e5e5e5</div>
                  <div className="text-gray-500">RGB(229, 229, 229)</div>
                  <div className="text-gray-500">Gray 200</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-8">
          <h2 className="text-2xl font-mono military-glow border-b border-gray-800 pb-2">
            Typography
          </h2>

          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded p-6">
              <h3 className="text-sm font-mono text-gray-400 mb-4">HEADING / BRANDING</h3>
              <div className="font-mono font-bold text-3xl military-glow tracking-widest">
                SKY-CYBERNET
              </div>
              <p className="text-xs text-gray-500 mt-2 font-mono">
                Font: Monospace • Weight: Bold • Tracking: Wide • Transform: Uppercase
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded p-6">
              <h3 className="text-sm font-mono text-gray-400 mb-4">TAGLINE</h3>
              <div className="font-mono text-sm tracking-wider opacity-60 military-glow">
                STRATEGIC CYBER NETWORK
              </div>
              <p className="text-xs text-gray-500 mt-2 font-mono">
                Font: Monospace • Weight: Normal • Size: Small • Opacity: 60%
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded p-6">
              <h3 className="text-sm font-mono text-gray-400 mb-4">BODY TEXT</h3>
              <div className="text-gray-200 leading-relaxed">
                The Sky-Cybernet platform provides secure, real-time communications for tactical operations. 
                Built with zero-trust architecture and end-to-end encryption.
              </div>
              <p className="text-xs text-gray-500 mt-2 font-mono">
                Font: Sans-serif • Weight: Normal • Line Height: 1.6
              </p>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="space-y-8">
          <h2 className="text-2xl font-mono military-glow border-b border-gray-800 pb-2">
            Usage Examples
          </h2>

          <div className="space-y-6">
            {/* Navigation Example */}
            <div className="bg-gray-900/50 border border-gray-800 rounded p-6">
              <h3 className="text-sm font-mono text-gray-400 mb-4">NAVIGATION BAR</h3>
              <div className="bg-black rounded p-4 flex items-center justify-between">
                <Logo variant="icon" size={40} />
                <div className="flex items-center gap-4">
                  <button className="text-sm font-mono military-glow hover:scale-105 transition">
                    FEED
                  </button>
                  <button className="text-sm font-mono military-glow hover:scale-105 transition">
                    NOTIFICATIONS
                  </button>
                  <button className="text-sm font-mono military-glow hover:scale-105 transition">
                    PROFILE
                  </button>
                </div>
              </div>
            </div>

            {/* Card Example */}
            <div className="bg-gray-900/50 border border-gray-800 rounded p-6">
              <h3 className="text-sm font-mono text-gray-400 mb-4">CARD HEADER</h3>
              <div className="bg-black rounded p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Logo variant="icon" size={32} />
                  <div>
                    <div className="font-mono font-bold military-glow">SKY-CYBERNET</div>
                    <div className="text-xs text-gray-400 font-mono">Strategic Network</div>
                  </div>
                </div>
                <p className="text-sm text-gray-300">
                  Secure tactical communications platform for mission-critical operations.
                </p>
              </div>
            </div>

            {/* Button Example */}
            <div className="bg-gray-900/50 border border-gray-800 rounded p-6">
              <h3 className="text-sm font-mono text-gray-400 mb-4">BUTTON WITH LOGO</h3>
              <button className="bg-black border-2 military-border rounded px-6 py-3 flex items-center gap-3 hover:scale-105 transition military-glow">
                <Logo variant="minimal" size={24} />
                <span className="font-mono font-bold">DEPLOY NETWORK</span>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center space-y-2 pt-8 border-t border-gray-800">
          <p className="text-xs font-mono text-gray-500">
            SKY-CYBERNET BRAND IDENTITY v1.0.0
          </p>
          <p className="text-xs font-mono text-gray-600">
            Strategic Cyber Network • Tactical Operations System
          </p>
        </div>

      </div>
    </div>
  );
}

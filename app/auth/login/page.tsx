'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative z-10">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-black border-2 border-[#00ff41] rounded flex items-center justify-center text-lg font-bold text-[#00ff41] font-mono">
              SC
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#00ff41] military-glow font-mono tracking-widest mb-2">
            [ SKY-CYBERNET ]
          </h1>
          <p className="text-[#00ff41]/60 font-mono text-sm tracking-wide">STRATEGIC CYBER NETWORK</p>
        </div>

        {/* Login Form */}
        <div className="bg-black/90 backdrop-blur-sm rounded p-8 border border-[#00ff41]/30 military-border">
          <h2 className="text-2xl font-bold mb-6 text-[#00ff41] font-mono tracking-widest">
            &gt; ACCESS TERMINAL
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-mono mb-2 text-[#00ff41]/70">
                &gt; USERNAME
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full px-4 py-3 bg-black border border-[#00ff41]/30 rounded focus:outline-none focus:ring-2 focus:ring-[#00ff41]/50 focus:border-transparent text-[#00ff41] placeholder:text-[#00ff41]/30 transition-all font-mono"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-mono mb-2 text-[#00ff41]/70">
                &gt; PASSWORD
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 bg-black border border-[#00ff41]/30 rounded focus:outline-none focus:ring-2 focus:ring-[#00ff41]/50 focus:border-transparent text-[#00ff41] placeholder:text-[#00ff41]/30 transition-all font-mono"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-red-400 text-sm font-mono">
                &gt; ERROR: {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full military-border bg-[#00ff41]/5 hover:bg-[#00ff41]/10 text-[#00ff41] font-mono font-bold rounded py-3 px-8 text-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed tracking-widest"
            >
              {loading ? '[ CONNECTING... ]' : '[ CONNECT ]'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#00ff41]/60 font-mono text-sm">
              New operator?{' '}
              <Link href="/auth/signup" className="text-[#00ff41] hover:text-[#00ff41]/80 font-bold transition-colors">
                &gt; Register Terminal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

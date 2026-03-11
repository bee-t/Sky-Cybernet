'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, displayName, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Signup error:', err);
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

        {/* Signup Form */}
        <div className="bg-black/90 backdrop-blur-sm rounded p-8 border border-[#00ff41]/30 military-border">
          <h2 className="text-2xl font-bold mb-6 text-[#00ff41] font-mono tracking-widest">
            &gt; REGISTER TERMINAL
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
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="operator_name"
                required
                pattern="[a-z0-9_]+"
                className="w-full px-4 py-3 bg-black border border-[#00ff41]/30 rounded focus:outline-none focus:ring-2 focus:ring-[#00ff41]/50 focus:border-transparent text-[#00ff41] placeholder:text-[#00ff41]/30 transition-all font-mono"
              />
              <p className="text-xs text-[#00ff41]/40 mt-1 font-mono">
                &gt; Lowercase letters, numbers, and underscores only
              </p>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-mono mb-2 text-[#00ff41]/70">
                &gt; DISPLAY NAME
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Operator Name"
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
                placeholder="Enter password (min 6 chars)"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-black border border-[#00ff41]/30 rounded focus:outline-none focus:ring-2 focus:ring-[#00ff41]/50 focus:border-transparent text-[#00ff41] placeholder:text-[#00ff41]/30 transition-all font-mono"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-mono mb-2 text-[#00ff41]/70">
                &gt; CONFIRM PASSWORD
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
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
              {loading ? '[ REGISTERING... ]' : '[ REGISTER ]'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#00ff41]/60 font-mono text-sm">
              Already registered?{' '}
              <Link href="/auth/login" className="text-[#00ff41] hover:text-[#00ff41]/80 font-bold transition-colors">
                &gt; Access Terminal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

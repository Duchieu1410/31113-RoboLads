'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, ArrowLeft, ShieldAlert, KeyRound, Loader2 } from 'lucide-react';
import { ROUTES } from '@/routes';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(ROUTES.API.ADMIN_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Invalid username or password.');
      }

      router.push(ROUTES.ADMIN);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Could not connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08081a] flex items-center justify-center p-4 text-white font-sans">
      <div className="bg-[#0e1023] p-8 border-3 border-[#1e223d] shadow-[8px_8px_0_#000000] w-full max-w-md block-page-enter">
        <div className="mb-6 pb-4 border-b-2 border-[#1e223d]">
          <Link
            href={ROUTES.HOME}
            className="text-[10px] text-slate-400 hover:text-amber-400 inline-flex items-center gap-1.5 font-pixel block-filter-btn px-2.5 py-1 border border-[#1e223d] bg-[#050610]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            BACK TO HOME
          </Link>
        </div>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-400 text-black font-pixel text-xs flex items-center justify-center mx-auto mb-3 border-2 border-amber-300 shadow-[3px_3px_0_#000000]">
            RBL
          </div>
          <h1 className="text-xs font-pixel text-amber-400 uppercase tracking-wider mb-2">
            ADMIN PORTAL GATEWAY
          </h1>
          <p className="text-xs text-slate-400 font-sans">
            Authentication required for resource management & analytics
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-mono shadow-[2px_2px_0_#000000] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-username" className="block text-xs font-pixel text-slate-300 mb-1.5 uppercase tracking-wide">
              USERNAME
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-amber-400/70" />
              <input
                id="admin-username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoComplete="username"
                className="w-full bg-[#050610] border-2 border-[#1e223d] shadow-[inset_2px_2px_0_#000000] pl-10 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-pixel text-slate-300 mb-1.5 uppercase tracking-wide">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-amber-400/70" />
              <input
                id="admin-password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-[#050610] border-2 border-[#1e223d] shadow-[inset_2px_2px_0_#000000] pl-10 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full font-pixel text-xs bg-amber-400 text-black py-3.5 border-2 border-amber-300 border-b-4 border-b-amber-600 border-r-4 border-r-amber-600 shadow-[3px_3px_0_#000000] hover:bg-amber-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#000000] uppercase tracking-wider disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 text-black animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-black" />
                  <span>AUTHORIZE ACCESS</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

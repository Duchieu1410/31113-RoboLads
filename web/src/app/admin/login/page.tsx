'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, ArrowLeft } from 'lucide-react';
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
        throw new Error(data.error || 'Tài khoản hoặc mật khẩu không chính xác!');
      }

      router.push(ROUTES.ADMIN);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối đến máy chủ đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-slate-100">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="mb-6">
          <Link
            href={ROUTES.HOME}
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 font-mono transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to RoboLads Home
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-black font-mono font-bold flex items-center justify-center mx-auto mb-3 shadow-lg">
            RBL
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">RBL Team Admin Portal</h1>
          <p className="text-slate-400 text-sm">Sign in to manage resources & view team analytics</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoComplete="username"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}

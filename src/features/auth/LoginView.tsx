/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Film, AlertCircle, ArrowRight, Lock, Mail, Key } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useRouter, Link } from '../../app/Router';
import { isSupabaseConfigured } from '../../lib/supabase';

export const LoginView: React.FC = () => {
  const { signIn, setDemoRole } = useAuth();
  const { navigate, searchParams } = useRouter();
  const isConfigured = isSupabaseConfigured();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const redirectTarget = searchParams.get('redirect') || '/';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const res = await signIn(email, password);
    setIsLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      navigate(redirectTarget.startsWith('/') ? redirectTarget : '/');
    }
  };

  const handleGoogleOAuth = () => {
    // Conforms strictly to Flow 2 & PRD 4:
    // "Google OAuth only after provider configuration and redirect URLs are verified.
    // If OAuth configuration is missing, display a configuration error rather than simulating success."
    setOauthError(
      'Google OAuth requires configured Google Client ID and redirect callbacks in your Supabase Auth dashboard before enabling.'
    );
  };

  const handleQuickDemoLogin = (role: 'user' | 'staff' | 'super_admin') => {
    setDemoRole(role);
    navigate('/');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 min-h-[80vh]">
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-900/30">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-xs text-zinc-400">Sign in to your ShortVideo creator account</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {oauthError && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{oauthError}</span>
          </div>
        )}

        {/* Demo Fast-Login Helper (when Supabase is in preview) */}
        {!isConfigured && (
          <div className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300">Fast Demo Accounts</span>
              <span className="text-[10px] text-amber-400 font-mono">Demo Mode</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user')}
                className="py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
              >
                Creator
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('staff')}
                className="py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl font-medium transition-colors"
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('super_admin')}
                className="py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl font-medium transition-colors"
              >
                Super Admin
              </button>
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@shortvideo.io"
                required
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-300">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-rose-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 transition-colors"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In with Email'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative text-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <span className="relative bg-zinc-900 px-3 text-[11px] text-zinc-500 uppercase tracking-wider">
            Or
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleOAuth}
          className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 13.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <p className="text-center text-xs text-zinc-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-rose-400 hover:underline font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

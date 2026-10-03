'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Invalid password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Login success
      onLoginSuccess();
    } catch (err: any) {
      setError('Connection failed. Please check your network.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F0D] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Subtle background ambient emerald glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm z-10">
        {/* App Badge / Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1b2620] to-[#111714] border border-[#22C55E]/30 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.18)] mb-4">
            <Lock className="w-7 h-7 text-[#22C55E]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            Life Tracker
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Personal health & fitness dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#121815] border border-white/[0.08] rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Enter Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••"
                  autoFocus
                  required
                  className="w-full bg-[#18201C] border border-white/[0.08] focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/40 focus:outline-none rounded-2xl px-4 py-3.5 text-white placeholder-zinc-600 text-sm tracking-wide pr-12 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#22C55E] hover:bg-[#1ea34d] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(34,197,94,0.3)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.4)] active:scale-[0.99] transition-all cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Unlocking...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Unlock Tracker</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]/70" />
            <span>End-to-end encrypted session</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface AdminLoginProps {
  onBackToWebsite: () => void;
}

export function AdminLogin({ onBackToWebsite }: AdminLoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@sharmawoodcraft.com');
  const [password, setPassword] = useState('SharmaAdmin2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'प्रमाणीकरण विफल। कृपया क्रेडेंशियल जांचें।');
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'लॉगिन विफल रहा।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onBackToWebsite}
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>शर्मा वुडक्राफ्ट मुख्य वेबसाइट पर वापस जाएं</span>
        </button>

        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-serif font-bold text-2xl">
            श
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
          शर्मा वुडक्राफ्ट
        </h2>
        <p className="text-center text-xs uppercase tracking-widest text-stone-400 mt-1 font-sans">
          सुरक्षित एडमिन नियंत्रण पोर्टल
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-stone-950 border border-stone-800 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Seeded Credentials Banner */}
          <div className="mb-6 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200/90 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <KeyRound className="w-3.5 h-3.5" />
              <span>डिफ़ॉल्ट एडमिन क्रेडेंशियल</span>
            </div>
            <p className="text-[11px] text-amber-200/80 font-mono">
              ईमेल: admin@sharmawoodcraft.com<br />
              पासवर्ड: SharmaAdmin2026!
            </p>
            <p className="text-[10px] text-stone-400 pt-0.5">
              आप वेबसाइट सेटिंग्स में जाकर कभी भी ईमेल या पासवर्ड बदल सकते हैं।
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                एडमिन ईमेल पता
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  placeholder="admin@sharmawoodcraft.com"
                />
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                पासवर्ड
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  placeholder="••••••••••••"
                />
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 text-xs font-bold tracking-wider uppercase text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'सत्यापन हो रहा है...' : 'लॉगिन करें और पोर्टल में प्रवेश करें'}</span>
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}

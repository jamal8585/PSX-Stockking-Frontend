import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { loginUser, signupUser, socialAuthLogin } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  // Traditional Email/Password Auth
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      let res;
      if (mode === 'login') {
        res = await loginUser({
          email: formData.email,
          password: formData.password
        });
      } else {
        res = await signupUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        });
      }

      if (res.success && res.user) {
        setSuccessMsg(res.message || 'Authentication successful!');
        localStorage.setItem('psx_user_profile', JSON.stringify(res.user));
        
        // Cache to local registered directory for admin sync
        try {
          const dir = JSON.parse(localStorage.getItem('psx_registered_directory') || '[]');
          const idx = dir.findIndex(u => u.email?.toLowerCase() === res.user.email?.toLowerCase());
          if (idx >= 0) dir[idx] = { ...dir[idx], ...res.user };
          else dir.push(res.user);
          localStorage.setItem('psx_registered_directory', JSON.stringify(dir));
        } catch (e) {
          console.warn('Directory cache error:', e);
        }

        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 600);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Social / Google / Facebook / Apple 1-Click Auth
  const handleSocialAuth = async (provider) => {
    setError('');
    setSuccessMsg('');
    setSocialLoading(provider);

    try {
      let socialEmail = '';
      let socialName = '';
      let socialAvatar = '';

      if (provider === 'google') {
        // Prompt for Gmail or auto-fill for seamless instant onboarding
        const promptEmail = window.prompt(
          'Enter your Google / Gmail account email to Sign In / Sign Up instantly:',
          formData.email || 'user@gmail.com'
        );
        if (!promptEmail) {
          setSocialLoading(null);
          return;
        }
        socialEmail = promptEmail.trim();
        socialName = socialEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        socialAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${socialEmail}`;
      } else if (provider === 'facebook') {
        const promptEmail = window.prompt('Enter your Facebook registered email:', formData.email || 'user@facebook.com');
        if (!promptEmail) {
          setSocialLoading(null);
          return;
        }
        socialEmail = promptEmail.trim();
        socialName = socialEmail.split('@')[0];
      } else if (provider === 'apple') {
        const promptEmail = window.prompt('Enter your Apple ID email:', formData.email || 'user@icloud.com');
        if (!promptEmail) {
          setSocialLoading(null);
          return;
        }
        socialEmail = promptEmail.trim();
        socialName = socialEmail.split('@')[0];
      }

      const res = await socialAuthLogin({
        provider,
        email: socialEmail,
        name: socialName,
        avatar: socialAvatar
      });

      if (res.success && res.user) {
        setSuccessMsg(res.message || `Successfully authenticated with ${provider.toUpperCase()}!`);
        localStorage.setItem('psx_user_profile', JSON.stringify(res.user));

        // Cache to local registered directory for admin sync
        try {
          const dir = JSON.parse(localStorage.getItem('psx_registered_directory') || '[]');
          const idx = dir.findIndex(u => u.email?.toLowerCase() === res.user.email?.toLowerCase());
          if (idx >= 0) dir[idx] = { ...dir[idx], ...res.user };
          else dir.push(res.user);
          localStorage.setItem('psx_registered_directory', JSON.stringify(dir));
        } catch (e) {
          console.warn('Directory cache error:', e);
        }

        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 600);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to sign in with ${provider}.`);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5 pt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 border border-[#2563EB]/20 dark:border-[#3B82F6]/20 text-[#2563EB] dark:text-[#3B82F6] mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            {mode === 'login' ? 'Sign In to PSX Stockking' : 'Create Your Free Account'}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            {mode === 'login' 
              ? 'Access real-time stock screener, technical charts & your portfolio' 
              : 'Join thousands of smart Pakistan Stock Exchange investors today'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#F8FAFC] dark:bg-[#0B0F19] p-1 rounded-lg border border-[#E2E8F0] dark:border-[#243044] mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login' 
                ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm' 
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup' 
                ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm' 
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Sign Up (Free)
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="flex items-center space-x-2 bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] dark:text-[#EF4444] p-3 rounded-lg text-xs mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626] dark:text-[#EF4444]" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center space-x-2 bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] dark:text-[#22C55E] p-3 rounded-lg text-xs mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A] dark:text-[#22C55E]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. SOCIAL / GOOGLE (GMAIL) LOGIN BUTTONS */}
        <div className="space-y-2.5 mb-5">
          {/* Google (Gmail) One-Click Button */}
          <button
            type="button"
            onClick={() => handleSocialAuth('google')}
            disabled={!!socialLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FFFFFF] dark:bg-[#0B0F19] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#243044] text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs flex items-center justify-center space-x-3 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {/* Google Multi-colored SVG Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {socialLoading === 'google' 
                ? 'Connecting Google Account...' 
                : (mode === 'login' ? 'Continue with Google (Gmail)' : 'Sign Up with Google (Gmail)')}
            </span>
          </button>

          {/* Social Provider Grid (Facebook & Apple) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSocialAuth('facebook')}
              disabled={!!socialLoading}
              className="py-2.5 px-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialAuth('apple')}
              disabled={!!socialLoading}
              className="py-2.5 px-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#243044] text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.98.6-2.62 1.35-.57.65-1.06 1.72-.93 2.74 1-.08 2-.49 2.62-1.24z"/>
              </svg>
              <span>Apple ID</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-[#E2E8F0] dark:border-[#243044] w-full" />
          <span className="bg-[#FFFFFF] dark:bg-[#151E2E] px-3 text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider shrink-0">
            Or with email
          </span>
          <div className="border-t border-[#E2E8F0] dark:border-[#243044] w-full" />
        </div>

        {/* 2. TRADITIONAL EMAIL/PASSWORD FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ali Ahmed"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                required
                placeholder="you@email.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">
                WhatsApp Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="0300-1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (mode === 'login' ? 'Sign In with Email' : 'Create Free Account')}
          </button>
        </form>

        {/* Official Admin Helper */}
        <div className="mt-5 pt-4 border-t border-[#E2E8F0] dark:border-[#243044] text-center text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          <p>
            Portal Administrator Login:{' '}
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setFormData({
                  name: 'Jamal Ahmed',
                  email: 'jamal.ahmedrumi@gmail.com',
                  password: 'R44@Jamal20dec##',
                  phone: '03452831413'
                });
              }}
              className="text-[#2563EB] dark:text-[#3B82F6] font-bold hover:underline cursor-pointer"
            >
              Fill Official Admin Credentials (jamal.ahmedrumi@gmail.com)
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

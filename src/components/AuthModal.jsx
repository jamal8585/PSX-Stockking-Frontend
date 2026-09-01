import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { loginUser, signupUser } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 border border-[#2563EB]/20 dark:border-[#3B82F6]/20 text-[#2563EB] dark:text-[#3B82F6] mb-3">
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

        {/* Form */}
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
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
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
                className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
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
                className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
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
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (mode === 'login' ? 'Sign In to Portal' : 'Create Free Account')}
          </button>
        </form>

        {/* Demo Admin Helper */}
        <div className="mt-5 pt-4 border-t border-[#E2E8F0] dark:border-[#243044] text-center text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          <p>
            Default Admin Login:{' '}
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setFormData({
                  name: '',
                  email: 'admin@stockking.psx',
                  password: 'admin12345',
                  phone: ''
                });
              }}
              className="text-[#2563EB] dark:text-[#3B82F6] font-bold hover:underline cursor-pointer"
            >
              Fill Admin Credentials
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

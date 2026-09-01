import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-gradient-to-b from-[#0F172A] via-[#0A0F1D] to-[#04070D] border border-cyan-500/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {mode === 'login' ? 'Sign In to PSX Stockking' : 'Create Your Free Account'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {mode === 'login' 
              ? 'Access real-time stock screener, technical charts & your portfolio' 
              : 'Join thousands of smart Pakistan Stock Exchange investors today'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#070B12] p-1 rounded-xl border border-gray-800 mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login' 
                ? 'bg-cyan-500 text-black shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup' 
                ? 'bg-cyan-500 text-black shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up (Free)
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ali Ahmed"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                required
                placeholder="you@domain.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#070B12] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                WhatsApp / Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#070B12] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:opacity-95 text-black font-extrabold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-cyan-500/25 transition-all mt-4 disabled:opacity-50"
          >
            <span>{loading ? 'Processing...' : (mode === 'login' ? 'Sign In Now' : 'Create Free Account')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Hint */}
        <div className="mt-5 pt-4 border-t border-gray-800/80 text-center">
          <p className="text-[11px] text-gray-500">
            {mode === 'login' ? (
              <>Don't have an account yet? <button type="button" onClick={() => setMode('signup')} className="text-cyan-400 font-bold hover:underline cursor-pointer">Register Free</button></>
            ) : (
              <>Already registered? <button type="button" onClick={() => setMode('login')} className="text-cyan-400 font-bold hover:underline cursor-pointer">Sign In</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

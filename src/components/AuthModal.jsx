import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  KeyRound,
  RotateCw,
  ArrowLeft
} from 'lucide-react';
import { 
  loginUser, 
  signupUser, 
  sendOtp, 
  verifyOtpSignup, 
  verifyOtpForgot, 
  socialAuthLogin 
} from '../services/api';
import { supabase, signInWithGoogleSupabase } from '../services/supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot'
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [devOtpNotice, setDevOtpNotice] = useState('');

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setStep('form');
    setOtpCode('');
    setError('');
    setSuccessMsg('');
    setDevOtpNotice('');
  };

  // 1. Send OTP Request (for Signup or Forgot Password)
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');
    setDevOtpNotice('');

    if (!formData.email || !formData.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (mode === 'signup') {
      if (!formData.name || !formData.password) {
        setError('Please provide your Full Name and Password.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await sendOtp({
        email: formData.email,
        type: mode === 'signup' ? 'signup' : 'forgot',
        name: formData.name
      });

      if (res.success) {
        setStep('otp');
        setTimer(60);
        setCanResend(false);
        setSuccessMsg(res.message || 'Verification code sent to your email!');
        if (res.devOtp) {
          setDevOtpNotice(`Demo Verification Code: ${res.devOtp}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await sendOtp({
        email: formData.email,
        type: mode === 'signup' ? 'signup' : 'forgot',
        name: formData.name
      });

      if (res.success) {
        setTimer(60);
        setCanResend(false);
        setSuccessMsg('New verification code sent to your email!');
        if (res.devOtp) {
          setDevOtpNotice(`Demo Verification Code: ${res.devOtp}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP & Submit
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (mode === 'forgot' && (!formData.password || formData.password.length < 6)) {
      setError('Please enter a new password (min 6 characters).');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (mode === 'signup') {
        res = await verifyOtpSignup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          otp: otpCode.trim()
        });
      } else if (mode === 'forgot') {
        res = await verifyOtpForgot({
          email: formData.email,
          otp: otpCode.trim(),
          newPassword: formData.password
        });
      }

      if (res?.success && res.user) {
        setSuccessMsg(res.message || 'Verification successful!');
        localStorage.setItem('psx_user_profile', JSON.stringify(res.user));
        
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 600);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Standard Email/Password Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await loginUser({
        email: formData.email,
        password: formData.password
      });

      if (res.success && res.user) {
        setSuccessMsg(res.message || 'Welcome back!');
        localStorage.setItem('psx_user_profile', JSON.stringify(res.user));
        
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 600);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Google Supabase OAuth Flow
  const handleGoogleAuth = async () => {
    setError('');
    setSuccessMsg('');
    setSocialLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase configuration missing.');
      }
      await signInWithGoogleSupabase();
    } catch (err) {
      console.error('Google Supabase error:', err);
      setError(err.message || 'Google authentication failed.');
    } finally {
      setSocialLoading(false);
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
            {step === 'otp' ? <KeyRound className="w-6 h-6 animate-pulse" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            {step === 'otp'
              ? 'Verify Email OTP (ای میل کوڈ درج کریں)'
              : mode === 'login' 
                ? 'Sign In to PSX Stockking' 
                : mode === 'signup'
                  ? 'Create Your Free Account'
                  : 'Reset Password (پاس ورڈ ری سیٹ)'}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            {step === 'otp'
              ? `We sent a 6-digit verification code to ${formData.email}`
              : mode === 'forgot'
                ? 'Enter your registered email to receive a verification OTP'
                : mode === 'login' 
                  ? 'Access real-time stock screener, technical charts & your portfolio' 
                  : 'Join thousands of smart Pakistan Stock Exchange investors today'}
          </p>
        </div>

        {/* Tab Switcher / Forgot Mode Bar (Shown on Form Step) */}
        {step === 'form' && (
          mode === 'forgot' ? (
            <div className="flex items-center justify-between bg-[#F8FAFC] dark:bg-[#0B0F19] p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#243044] mb-5">
              <span className="text-xs font-black text-[#0F172A] dark:text-[#F8FAFC]">
                🔑 Reset Password
              </span>
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="text-xs font-bold text-[#2563EB] dark:text-[#3B82F6] hover:underline cursor-pointer flex items-center space-x-1"
              >
                <span>← Back to Sign In</span>
              </button>
            </div>
          ) : (
            <div className="flex bg-[#F8FAFC] dark:bg-[#0B0F19] p-1 rounded-lg border border-[#E2E8F0] dark:border-[#243044] mb-5">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
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
                onClick={() => handleModeSwitch('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup' 
                    ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm' 
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              >
                Sign Up (Free)
              </button>
            </div>
          )
        )}

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

        {devOtpNotice && (
          <div className="bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#2563EB] dark:text-[#60A5FA] p-2.5 rounded-lg text-xs font-mono font-bold mb-4 text-center">
            {devOtpNotice}
          </div>
        )}

        {/* STEP 2: OTP VERIFICATION SCREEN */}
        {step === 'otp' ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1 text-center">
                Enter 6-Digit Email Code (کوڈ درج کریں)
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, ''));
                  if (error) setError('');
                }}
                className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border-2 border-[#2563EB] dark:border-[#3B82F6] rounded-xl py-3 text-center text-2xl tracking-[8px] font-mono font-black text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none"
              />
            </div>

            {mode === 'forgot' && (
              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">
                  New Password (نیا پاس ورڈ)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Enter new password (min 6 chars)"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {loading 
                ? 'Verifying Code...' 
                : (mode === 'forgot' ? 'Verify & Reset Password' : 'Verify & Complete Registration')}
            </button>

            {/* Resend & Back options */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#243044]">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Email / Back</span>
              </button>

              <button
                type="button"
                disabled={!canResend || loading}
                onClick={handleResendOtp}
                className={`text-xs font-bold flex items-center space-x-1 cursor-pointer ${
                  canResend 
                    ? 'text-[#2563EB] dark:text-[#3B82F6] hover:underline' 
                    : 'text-[#94A3B8] dark:text-[#64748B] opacity-70 cursor-not-allowed'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{canResend ? 'Resend Code' : `Resend in ${timer}s`}</span>
              </button>
            </div>
          </form>
        ) : (
          /* STEP 1: CREDENTIALS FORM */
          <>
            {/* Google Supabase Social Login (Shown on Login & Signup) */}
            {mode !== 'forgot' && (
              <div className="mb-5">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={socialLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#FFFFFF] dark:bg-[#0B0F19] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#243044] text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs flex items-center justify-center space-x-3 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
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
                    {socialLoading 
                      ? 'Connecting with Google...' 
                      : (mode === 'login' ? 'Continue with Google (Google سے سائن ان کریں)' : 'Sign Up with Google (Google سے رجسٹر کریں)')}
                  </span>
                </button>
              </div>
            )}

            {/* Divider */}
            {mode !== 'forgot' && (
              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-[#E2E8F0] dark:border-[#243044] w-full" />
                <span className="bg-[#FFFFFF] dark:bg-[#151E2E] px-3 text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider shrink-0">
                  Or with email
                </span>
                <div className="border-t border-[#E2E8F0] dark:border-[#243044] w-full" />
              </div>
            )}

            <form onSubmit={mode === 'login' ? handleLoginSubmit : handleSendOtp} className="space-y-3.5">
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

              {mode !== 'forgot' && (
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

                  {mode === 'login' && (
                    <div className="flex justify-end pt-1.5">
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('forgot')}
                        className="text-[11px] font-bold text-[#2563EB] dark:text-[#3B82F6] hover:underline cursor-pointer transition-colors"
                      >
                        Forgot Password? (پاس ورڈ بھول گئے؟)
                      </button>
                    </div>
                  )}
                </div>
              )}

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
                {loading 
                  ? 'Processing...' 
                  : (mode === 'forgot' 
                      ? 'Send Reset Code (OTP ای میل بھیجیں)' 
                      : mode === 'login' 
                        ? 'Sign In with Email' 
                        : 'Send Verification Code (OTP ای میل بھیجیں)')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

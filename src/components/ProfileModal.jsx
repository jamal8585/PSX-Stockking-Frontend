import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Crown, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Edit3, 
  Save, 
  Calendar
} from 'lucide-react';
import { updateUserProfile } from '../services/api';

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onUpdateUser, 
  onLogout, 
  onOpenUpgrade, 
  onOpenAdmin,
  theme = 'dark' 
}) {
  if (!isOpen || !currentUser) return null;

  const isLight = theme === 'light';
  const isPro = currentUser.plan === 'PRO' && currentUser.subscriptionStatus === 'ACTIVE';
  const isAdmin = currentUser.role === 'ADMIN';

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    phone: currentUser.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (message.text) setMessage({ text: '', type: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setMessage({ text: 'New password must be at least 6 characters long.', type: 'error' });
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ text: 'New password and confirm password do not match.', type: 'error' });
        return;
      }
    }

    setLoading(true);
    try {
      const res = await updateUserProfile({
        name: formData.name,
        phone: formData.phone,
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined
      });

      if (res?.success && res.user) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        if (onUpdateUser) onUpdateUser(res.user);
        setIsEditing(false);
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      } else {
        setMessage({ text: res?.message || 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || err.message || 'Error updating profile.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 overflow-hidden transition-colors ${
          isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#0F172A]' : 'bg-[#151E2E] border-[#243044] text-[#F8FAFC]'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#243044]">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shadow-sm ${
              isPro 
                ? (isLight ? 'bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30' : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40') 
                : (isLight ? 'bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/20' : 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30')
            }`}>
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">{currentUser.name}</h2>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isPro 
                    ? (isLight ? 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30' : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30') 
                    : (isLight ? 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20' : 'bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/20')
                }`}>
                  {isPro ? '⭐ PRO VIP MEMBER' : 'FREE TIER'}
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#3B82F6] border border-[#2563EB]/20 dark:border-[#3B82F6]/20">
                    👑 LEAD ADMIN
                  </span>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {message.text && (
          <div className={`my-3 p-3 rounded-xl text-xs flex items-center space-x-2 border ${
            message.type === 'success' 
              ? 'bg-[#16A34A]/10 border-[#16A34A]/20 text-[#16A34A] dark:text-[#22C55E]' 
              : 'bg-[#DC2626]/10 border-[#DC2626]/20 text-[#DC2626] dark:text-[#EF4444]'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="py-4 space-y-4">
          {!isEditing ? (
            /* View Mode */
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#243044] bg-[#F8FAFC] dark:bg-[#0B0F19] space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Address:</span>
                  </span>
                  <span className="font-bold mono">{currentUser.email}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp / Phone:</span>
                  </span>
                  <span className="font-bold mono">{currentUser.phone || 'Not provided'}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0] dark:border-[#243044]">
                  <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Subscription Plan:</span>
                  </span>
                  <span className="font-bold text-[#D97706] dark:text-[#F59E0B]">
                    {currentUser.subscriptionDuration === 'LIFETIME' ? '👑 Lifetime Access' : (currentUser.plan === 'PRO' ? '⭐ Active PRO' : 'Free Basic')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                    isLight 
                      ? 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border-[#E2E8F0] text-[#0F172A]' 
                      : 'bg-[#1E293B] hover:bg-[#243044] border-[#243044] text-[#F8FAFC]'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                  <span>Edit Profile / Password</span>
                </button>

                {!isPro && (
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenUpgrade) onOpenUpgrade();
                    }}
                    className="py-2.5 px-4 rounded-xl bg-[#D97706] hover:bg-[#B45309] dark:bg-[#F59E0B] dark:hover:bg-[#D97706] text-white dark:text-black font-black text-xs cursor-pointer shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Go Pro</span>
                  </button>
                )}
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenAdmin) onOpenAdmin();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Open Admin Control Dashboard</span>
                </button>
              )}
            </div>
          ) : (
            /* Edit Mode Form */
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#64748B] dark:text-[#94A3B8] mb-1">
                  Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#64748B] dark:text-[#94A3B8] mb-1">
                  WhatsApp Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="0300-1234567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#243044]">
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-2">
                  Change Password (Leave blank to keep unchanged)
                </span>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="Current Password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="New Password (min 6 chars)"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#243044] font-bold text-xs text-[#64748B] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer: Dedicated Prominent Sign Out Button */}
        <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#243044]">
          <button
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
            }}
            className="w-full py-3 rounded-xl bg-[#DC2626]/10 hover:bg-[#DC2626] border border-[#DC2626]/30 text-[#DC2626] hover:text-white dark:text-[#EF4444] dark:hover:text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}

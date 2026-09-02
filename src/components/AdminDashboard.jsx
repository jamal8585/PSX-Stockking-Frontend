import React, { useState, useEffect } from 'react';
import { 
  Users, Crown, ShieldAlert, CheckCircle2, XCircle, Search, RefreshCw, 
  Trash2, PlusCircle, ArrowUpRight, DollarSign, Clock, Filter, AlertCircle,
  Eye, Calendar, Phone, Mail, ShieldCheck, UserPlus, X, Sparkles
} from 'lucide-react';
import { 
  getAdminUsers, 
  syncAdminUsers,
  createAdminUser,
  updateAdminSubscription, 
  deleteAdminUser, 
  getAdminAnalytics 
} from '../services/api';

export default function AdminDashboard({ currentUser, onBackToPortal }) {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Modals
  const [selectedProofUser, setSelectedProofUser] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'USER',
    plan: 'PRO',
    duration: '1_MONTH'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Clear obsolete local directory cache
      try {
        localStorage.removeItem('psx_registered_directory');
      } catch (_) {}

      // Always fetch real live users from the backend
      const usersRes = await getAdminUsers({ q: searchQuery, plan: planFilter, status: statusFilter });
      if (usersRes.success && Array.isArray(usersRes.users)) {
        setUsers(usersRes.users);
      }

      const analyticsRes = await getAdminAnalytics();
      if (analyticsRes.success) setAnalytics(analyticsRes.stats);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to fetch admin data. Check permissions.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [planFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleUpdateSubscription = async (userTarget, plan, duration, status = 'ACTIVE') => {
    const userId = typeof userTarget === 'object' ? (userTarget.id || userTarget._id || userTarget.email) : userTarget;
    const userEmail = typeof userTarget === 'object' ? userTarget.email : (String(userId || '').includes('@') ? userId : '');
    const userName = typeof userTarget === 'object' ? userTarget.name : '';
    const userPhone = typeof userTarget === 'object' ? userTarget.phone : '';

    setActionLoading(userId || userEmail);
    setMessage({ text: '', type: '' });
    try {
      const res = await updateAdminSubscription(userId || userEmail, {
        plan,
        subscriptionDuration: duration,
        subscriptionStatus: status,
        email: userEmail,
        name: userName,
        phone: userPhone
      });

      if (res.success) {
        setMessage({ text: res.message || 'Subscription updated successfully!', type: 'success' });
        if (selectedProofUser?.id === userId || selectedProofUser?.email === userEmail) setSelectedProofUser(null);
        fetchData();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update subscription.',
        type: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExtendDays = async (userTarget, days = 30) => {
    const userId = typeof userTarget === 'object' ? (userTarget.id || userTarget._id || userTarget.email) : userTarget;
    const userEmail = typeof userTarget === 'object' ? userTarget.email : (String(userId || '').includes('@') ? userId : '');
    setActionLoading(userId || userEmail);
    setMessage({ text: '', type: '' });
    try {
      const res = await updateAdminSubscription(userId || userEmail, {
        plan: 'PRO',
        extendDays: days,
        email: userEmail
      });

      if (res.success) {
        setMessage({ text: `Added +${days} days to subscription!`, type: 'success' });
        fetchData();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to extend subscription.',
        type: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userTarget, userName = '') => {
    const userId = typeof userTarget === 'object' ? (userTarget.id || userTarget._id || userTarget.email) : userTarget;
    const nameToDisplay = typeof userTarget === 'object' ? (userTarget.name || userTarget.email) : (userName || userId);
    
    if (!window.confirm(`Are you sure you want to permanently delete user "${nameToDisplay}"?`)) {
      return;
    }

    setActionLoading(userId);
    setMessage({ text: '', type: '' });
    try {
      const res = await deleteAdminUser(userId);
      if (res.success) {
        setMessage({ text: `User ${nameToDisplay} deleted successfully.`, type: 'success' });
        fetchData();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to delete user.',
        type: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading('CREATE_USER');
    setMessage({ text: '', type: '' });
    try {
      const res = await createAdminUser(newUserForm);
      if (res.success) {
        setMessage({ text: res.message || 'User added successfully!', type: 'success' });
        setIsAddUserOpen(false);
        setNewUserForm({ name: '', email: '', phone: '', role: 'USER', plan: 'PRO', duration: '1_MONTH' });
        fetchData();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to create user.',
        type: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };



  const getDaysLeft = (endStr, isLifetime) => {
    if (isLifetime) return 'Lifetime VIP';
    if (!endStr) return 'No Active Sub';
    const diff = new Date(endStr).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} Days Left`;
  };

  const pendingUsers = users.filter(u => u.subscriptionStatus === 'PENDING');

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#151E2E] p-6 rounded-xl border border-[#E2E8F0] dark:border-[#243044] shadow-sm dark:shadow-md">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 border border-[#2563EB]/20 dark:border-[#3B82F6]/20 text-[#2563EB] dark:text-[#3B82F6]">
                <Crown className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  PSX Stockking Subscription & User Admin Panel
                </h1>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Logged in as Lead Administrator: <span className="text-[#2563EB] dark:text-[#3B82F6] font-bold">{currentUser?.email}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] dark:bg-[#22C55E] dark:hover:bg-[#16A34A] text-white dark:text-black font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add / Grant Subscriber</span>
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#243044] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer transition-all border border-[#E2E8F0] dark:border-[#243044]"
              title="Refresh User Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#2563EB] dark:text-[#3B82F6]' : ''}`} />
            </button>
            <button
              onClick={onBackToPortal}
              className="px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center space-x-2"
            >
              <span>Return to Main Portal</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`flex items-center space-x-2 p-3.5 rounded-lg text-xs border ${
            message.type === 'success' 
              ? 'bg-[#16A34A]/10 border-[#16A34A]/20 text-[#16A34A] dark:text-[#22C55E]' 
              : 'bg-[#DC2626]/10 border-[#DC2626]/20 text-[#DC2626] dark:text-[#EF4444]'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-[#22C55E] shrink-0" /> : <AlertCircle className="w-4 h-4 text-[#DC2626] dark:text-[#EF4444] shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* KPI Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#243044] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] block">Total Users</span>
              <span className="text-2xl font-black mono mt-1 block">{analytics.totalUsers}</span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Platform Accounts</span>
            </div>
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-4 rounded-xl border border-[#D97706]/40 dark:border-[#F59E0B]/40 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#D97706] dark:text-[#F59E0B] block">Active Pro VIPs ⭐</span>
              <span className="text-2xl font-black text-[#D97706] dark:text-[#F59E0B] mono mt-1 block">{analytics.proUsers}</span>
              <span className="text-[10px] text-[#D97706]/80 dark:text-[#F59E0B]/80">Paid Subscribers</span>
            </div>
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#243044] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] block">Free Tier Users</span>
              <span className="text-2xl font-black text-[#2563EB] dark:text-[#3B82F6] mono mt-1 block">{analytics.freeUsers}</span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Basic Tier</span>
            </div>
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-4 rounded-xl border border-[#DC2626]/30 dark:border-[#EF4444]/30 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#DC2626] dark:text-[#EF4444] block">Pending Approvals</span>
              <span className="text-2xl font-black text-[#DC2626] dark:text-[#EF4444] mono mt-1 block">{analytics.pendingApprovals}</span>
              <span className="text-[10px] text-[#DC2626]/80 dark:text-[#EF4444]/80">Awaiting Verification</span>
            </div>
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-4 rounded-xl border border-[#16A34A]/30 dark:border-[#22C55E]/30 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#16A34A] dark:text-[#22C55E] block">Estimated MRR</span>
              <span className="text-2xl font-black text-[#16A34A] dark:text-[#22C55E] mono mt-1 block">PKR {analytics.estimatedMRR?.toLocaleString()}</span>
              <span className="text-[10px] text-[#16A34A]/80 dark:text-[#22C55E]/80">Monthly Revenue</span>
            </div>
          </div>
        )}

        {/* Pending Approvals Queue */}
        {pendingUsers.length > 0 && (
          <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-5 rounded-xl border border-[#D97706]/40 dark:border-[#F59E0B]/40 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-[#D97706] dark:text-[#F59E0B] animate-pulse" />
              <h2 className="text-sm font-bold text-[#D97706] dark:text-[#F59E0B] uppercase tracking-wider">
                Pending Subscription Upgrades Awaiting Admin Action ({pendingUsers.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {pendingUsers.map(u => (
                <div key={u.id} className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-4 rounded-lg border border-[#E2E8F0] dark:border-[#243044] space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-xs block">{u.name}</span>
                      <span className="text-[11px] text-[#2563EB] dark:text-[#3B82F6] font-bold">{u.email}</span>
                      {u.phone && <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">📱 {u.phone}</span>}
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#D97706]/10 text-[#D97706] dark:bg-[#F59E0B]/10 dark:text-[#F59E0B] text-[10px] font-bold border border-[#D97706]/20">
                      PENDING VERIFICATION
                    </span>
                  </div>

                  <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044] text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span>Method: <strong className="text-[#16A34A] dark:text-[#22C55E] font-bold">{u.paymentProof?.method || 'Easypaisa / JazzCash'}</strong></span>
                      <span>Amount: <strong className="mono font-bold text-xs">PKR {u.paymentProof?.amount || 1499}</strong></span>
                    </div>
                    <div>
                      <span>Transaction ID / Ref: <strong className="text-[#2563EB] dark:text-[#3B82F6] mono font-bold bg-[#2563EB]/10 px-1.5 py-0.5 rounded">{u.paymentProof?.transactionId || 'N/A'}</strong></span>
                    </div>
                    {u.paymentProof?.note && (
                      <div className="text-[#64748B] dark:text-[#94A3B8] italic text-[10px] pt-0.5">
                        💬 "{u.paymentProof.note}"
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleUpdateSubscription(u.id, 'PRO', '1_MONTH', 'ACTIVE')}
                      disabled={actionLoading === u.id}
                      className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] dark:bg-[#22C55E] dark:hover:bg-[#16A34A] text-white dark:text-black font-bold text-[10px] cursor-pointer"
                    >
                      ✓ Approve 1 Month (PKR 1,499)
                    </button>
                    <button
                      onClick={() => handleUpdateSubscription(u.id, 'PRO', '3_MONTHS', 'ACTIVE')}
                      disabled={actionLoading === u.id}
                      className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-[10px] cursor-pointer"
                    >
                      ✓ Approve 3 Months (PKR 3,999)
                    </button>
                    <button
                      onClick={() => handleUpdateSubscription(u.id, 'PRO', 'LIFETIME', 'ACTIVE')}
                      disabled={actionLoading === u.id}
                      className="px-3 py-1.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-[10px] cursor-pointer"
                    >
                      👑 Grant Lifetime
                    </button>
                    <button
                      onClick={() => handleUpdateSubscription(u.id, 'FREE', 'FREE', 'EXPIRED')}
                      disabled={actionLoading === u.id}
                      className="px-3 py-1.5 rounded-lg bg-[#DC2626]/10 text-[#DC2626] dark:text-[#EF4444] hover:bg-[#DC2626] hover:text-white font-bold text-[10px] cursor-pointer"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Management Table */}
        <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-5 rounded-xl border border-[#E2E8F0] dark:border-[#243044] space-y-4 shadow-sm">
          {/* Controls Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
              <h2 className="text-base font-bold">User Directory & Subscription Details</h2>
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-bold">({users.length} Users)</span>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <form onSubmit={handleSearch} className="relative">
                <Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, email, phone, TxID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] w-56"
                />
              </form>

              <select
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value)}
                className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] font-bold focus:outline-none"
              >
                <option value="ALL">All Plans</option>
                <option value="FREE">Free Tier</option>
                <option value="PRO">Pro VIP</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] font-bold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="EXPIRED">Expired</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[#E2E8F0] dark:border-[#243044]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold text-[10px] tracking-wider border-b border-[#E2E8F0] dark:border-[#243044]">
                <tr>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Current Plan</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Status & Time Left</th>
                  <th className="py-3 px-3">Expiry Date</th>
                  <th className="py-3 px-3">Payment Proof</th>
                  <th className="py-3 px-3 text-center">Subscription Controls</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243044] bg-[#FFFFFF] dark:bg-[#151E2E]">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#64748B] dark:text-[#94A3B8]">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  users.map(u => {
                    const isPro = u.plan === 'PRO' && u.subscriptionStatus === 'ACTIVE';
                    const isLifetime = u.subscriptionDuration === 'LIFETIME' || u.role === 'ADMIN';
                    const daysLeft = getDaysLeft(u.subscriptionEnd, isLifetime);
                    const hasProof = Boolean(u.paymentProof?.transactionId);

                    return (
                      <tr key={u.id} className="hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors">
                        {/* User Details */}
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-bold block text-sm">{u.name}</span>
                            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">{u.email}</span>
                            {u.phone && <span className="text-[10px] text-[#2563EB] dark:text-[#3B82F6] font-bold block">📱 {u.phone}</span>}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'ADMIN' 
                              ? 'bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/10 dark:text-[#3B82F6] border border-[#2563EB]/20' 
                              : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]'
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        {/* Current Plan */}
                        <td className="py-3 px-3">
                          {isPro ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D97706]/10 text-[#D97706] dark:bg-[#F59E0B]/10 dark:text-[#F59E0B] border border-[#D97706]/20">
                              PRO VIP ⭐
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]">
                              FREE TIER
                            </span>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="py-3 px-3">
                          <span className="font-bold text-[11px] text-[#0F172A] dark:text-[#F8FAFC]">
                            {u.subscriptionDuration?.replace('_', ' ') || 'FREE'}
                          </span>
                        </td>

                        {/* Status & Days Left */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                              u.subscriptionStatus === 'ACTIVE' 
                                ? 'bg-[#16A34A]/10 text-[#16A34A] dark:text-[#22C55E]' 
                                : (u.subscriptionStatus === 'PENDING' ? 'bg-[#D97706]/10 text-[#D97706] dark:text-[#F59E0B]' : 'bg-[#64748B]/10 text-[#64748B] dark:text-[#94A3B8]')
                            }`}>
                              {u.subscriptionStatus || 'INACTIVE'}
                            </span>
                            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block mono font-semibold">
                              {daysLeft}
                            </span>
                          </div>
                        </td>

                        {/* Expiry Date */}
                        <td className="py-3 px-3 mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {isLifetime ? (
                            <span className="text-[#D97706] dark:text-[#F59E0B] font-bold">Lifetime (No Expiry)</span>
                          ) : u.subscriptionEnd ? (
                            new Date(u.subscriptionEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          ) : '—'}
                        </td>

                        {/* Payment Proof Button */}
                        <td className="py-3 px-3">
                          {hasProof ? (
                            <button
                              onClick={() => setSelectedProofUser(u)}
                              className="px-2 py-1 rounded bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#3B82F6] font-bold text-[10px] flex items-center space-x-1 cursor-pointer hover:bg-[#2563EB]/20"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Proof</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Direct</span>
                          )}
                        </td>

                        {/* Subscription Controls */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            {!isPro ? (
                              <>
                                <button
                                  onClick={() => handleUpdateSubscription(u, 'PRO', '1_MONTH', 'ACTIVE')}
                                  disabled={actionLoading === (u.id || u.email)}
                                  className="px-2 py-1 rounded bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-[10px] cursor-pointer"
                                  title="Activate 1 Month Pro"
                                >
                                  +1M Pro
                                </button>
                                <button
                                  onClick={() => handleUpdateSubscription(u, 'PRO', '3_MONTHS', 'ACTIVE')}
                                  disabled={actionLoading === (u.id || u.email)}
                                  className="px-2 py-1 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[10px] cursor-pointer"
                                  title="Activate 3 Months Pro"
                                >
                                  +3M Pro
                                </button>
                                <button
                                  onClick={() => handleUpdateSubscription(u, 'PRO', 'LIFETIME', 'ACTIVE')}
                                  disabled={actionLoading === (u.id || u.email)}
                                  className="px-2 py-1 rounded bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-[10px] cursor-pointer"
                                  title="Grant Lifetime VIP"
                                >
                                  👑 Lifetime
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleExtendDays(u, 30)}
                                  disabled={actionLoading === (u.id || u.email)}
                                  className="px-2 py-1 rounded bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] text-white font-bold text-[10px] cursor-pointer"
                                  title="Add 30 Days Extension"
                                >
                                  +30 Days
                                </button>
                                {u.role !== 'ADMIN' && (
                                  <button
                                    onClick={() => handleUpdateSubscription(u, 'FREE', 'FREE', 'EXPIRED')}
                                    disabled={actionLoading === (u.id || u.email)}
                                    className="px-2 py-1 rounded bg-[#DC2626]/10 text-[#DC2626] dark:text-[#EF4444] hover:bg-[#DC2626] hover:text-white text-[10px] font-bold cursor-pointer"
                                    title="Demote to Free"
                                  >
                                    Demote
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-center">
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={actionLoading === (u.id || u.email)}
                              className="p-1.5 rounded-lg bg-[#DC2626]/10 text-[#DC2626] dark:text-[#EF4444] hover:bg-[#DC2626] hover:text-white transition-colors cursor-pointer"
                              title="Delete User Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: View Payment Proof */}
        {selectedProofUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E8F0] dark:border-[#243044] pb-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
                  <h3 className="text-base font-bold">Payment & Upgrade Verification</h3>
                </div>
                <button onClick={() => setSelectedProofUser(null)} className="p-1 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044] space-y-1.5">
                  <div className="flex justify-between"><span className="text-[#64748B]">Subscriber:</span> <span className="font-bold">{selectedProofUser.name}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">Email:</span> <span className="font-bold text-[#2563EB] dark:text-[#3B82F6]">{selectedProofUser.email}</span></div>
                  {selectedProofUser.phone && <div className="flex justify-between"><span className="text-[#64748B]">Phone:</span> <span className="font-bold">{selectedProofUser.phone}</span></div>}
                </div>

                <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044] space-y-1.5">
                  <div className="flex justify-between"><span className="text-[#64748B]">Payment Method:</span> <span className="font-bold text-[#16A34A] dark:text-[#22C55E]">{selectedProofUser.paymentProof?.method || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">Amount Paid:</span> <span className="font-bold mono">PKR {selectedProofUser.paymentProof?.amount || 1499}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">Transaction ID:</span> <span className="font-bold mono text-[#2563EB] dark:text-[#3B82F6]">{selectedProofUser.paymentProof?.transactionId || 'N/A'}</span></div>
                  {selectedProofUser.paymentProof?.note && (
                    <div className="pt-1 text-[#64748B] dark:text-[#94A3B8]">
                      Note: <i className="text-[#0F172A] dark:text-[#F8FAFC]">"{selectedProofUser.paymentProof.note}"</i>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#243044]">
                <button
                  onClick={() => handleUpdateSubscription(selectedProofUser, 'PRO', '1_MONTH', 'ACTIVE')}
                  className="flex-1 py-2 rounded-lg bg-[#16A34A] text-white font-bold text-xs cursor-pointer"
                >
                  Approve 1M Pro
                </button>
                <button
                  onClick={() => handleUpdateSubscription(selectedProofUser, 'PRO', '3_MONTHS', 'ACTIVE')}
                  className="flex-1 py-2 rounded-lg bg-[#2563EB] text-white font-bold text-xs cursor-pointer"
                >
                  Approve 3M Pro
                </button>
                <button
                  onClick={() => handleUpdateSubscription(selectedProofUser, 'FREE', 'FREE', 'EXPIRED')}
                  className="px-3 py-2 rounded-lg bg-[#DC2626]/10 text-[#DC2626] font-bold text-xs cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add / Grant Subscriber */}
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-[#E2E8F0] dark:border-[#243044] pb-3">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-[#16A34A] dark:text-[#22C55E]" />
                  <h3 className="text-base font-bold">Add User / Grant Subscription</h3>
                </div>
                <button onClick={() => setIsAddUserOpen(false)} className="p-1 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Siddiqui"
                    value={newUserForm.name}
                    onChange={e => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@gmail.com"
                    value={newUserForm.email}
                    onChange={e => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="03001234567"
                    value={newUserForm.phone}
                    onChange={e => setNewUserForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">Plan</label>
                    <select
                      value={newUserForm.plan}
                      onChange={e => setNewUserForm(prev => ({ ...prev, plan: e.target.value }))}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg p-2.5 text-xs font-bold"
                    >
                      <option value="PRO">Pro VIP ⭐</option>
                      <option value="FREE">Free Tier</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">Duration</label>
                    <select
                      value={newUserForm.duration}
                      onChange={e => setNewUserForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg p-2.5 text-xs font-bold"
                    >
                      <option value="1_MONTH">1 Month</option>
                      <option value="3_MONTHS">3 Months</option>
                      <option value="1_YEAR">1 Year</option>
                      <option value="LIFETIME">Lifetime</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === 'CREATE_USER'}
                    className="px-5 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold shadow-sm cursor-pointer"
                  >
                    {actionLoading === 'CREATE_USER' ? 'Creating...' : 'Create & Grant Access'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

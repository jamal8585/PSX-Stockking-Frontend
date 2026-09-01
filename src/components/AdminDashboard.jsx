import React, { useState, useEffect } from 'react';
import { 
  Users, Crown, ShieldAlert, CheckCircle2, XCircle, Search, RefreshCw, 
  Trash2, PlusCircle, ArrowUpRight, DollarSign, Clock, Filter, AlertCircle 
} from 'lucide-react';
import { 
  getAdminUsers, 
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        getAdminUsers({ q: searchQuery, plan: planFilter, status: statusFilter }),
        getAdminAnalytics()
      ]);

      if (usersRes.success) setUsers(usersRes.users || []);
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

  const handleUpdateSubscription = async (userId, plan, duration, status = 'ACTIVE') => {
    setActionLoading(userId);
    setMessage({ text: '', type: '' });
    try {
      const res = await updateAdminSubscription(userId, {
        plan,
        subscriptionDuration: duration,
        subscriptionStatus: status
      });

      if (res.success) {
        setMessage({ text: res.message || 'Subscription updated successfully!', type: 'success' });
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

  const handleExtendDays = async (userId, days = 30) => {
    setActionLoading(userId);
    setMessage({ text: '', type: '' });
    try {
      const res = await updateAdminSubscription(userId, {
        plan: 'PRO',
        extendDays: days
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

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    setActionLoading(userId);
    try {
      const res = await deleteAdminUser(userId);
      if (res.success) {
        setMessage({ text: `User ${userName} deleted.`, type: 'success' });
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
                  Logged in as Administrator: <span className="text-[#2563EB] dark:text-[#3B82F6] font-bold">{currentUser?.email}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
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
              className="px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center space-x-2"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingUsers.map(u => (
                <div key={u.id} className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-4 rounded-lg border border-[#E2E8F0] dark:border-[#243044] space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-xs block">{u.name}</span>
                      <span className="text-[11px] text-[#2563EB] dark:text-[#3B82F6] font-bold">{u.email}</span>
                      {u.phone && <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">📱 {u.phone}</span>}
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#D97706]/10 text-[#D97706] dark:bg-[#F59E0B]/10 dark:text-[#F59E0B] text-[10px] font-bold border border-[#D97706]/20">
                      PENDING
                    </span>
                  </div>

                  <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#243044] text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span>Method: <strong className="text-[#16A34A] dark:text-[#22C55E]">{u.paymentProof?.method || 'Direct'}</strong></span>
                      <span>Amount: <strong className="mono">PKR {u.paymentProof?.amount || 1499}</strong></span>
                    </div>
                    <div>
                      <span>TxID: <strong className="text-[#2563EB] dark:text-[#3B82F6] mono">{u.paymentProof?.transactionId || 'N/A'}</strong></span>
                    </div>
                    {u.paymentProof?.note && (
                      <div className="text-[#64748B] dark:text-[#94A3B8] italic text-[10px]">
                        Note: {u.paymentProof.note}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleUpdateSubscription(u.id, 'PRO', '1_MONTH', 'ACTIVE')}
                      disabled={actionLoading === u.id}
                      className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] dark:bg-[#22C55E] dark:hover:bg-[#16A34A] text-white dark:text-black font-bold text-[10px] cursor-pointer"
                    >
                      Approve 1 Month (PKR 1,499)
                    </button>
                    <button
                      onClick={() => handleUpdateSubscription(u.id, 'PRO', '3_MONTHS', 'ACTIVE')}
                      disabled={actionLoading === u.id}
                      className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-[10px] cursor-pointer"
                    >
                      Approve 3 Months
                    </button>
                    <button
                      onClick={() => handleUpdateSubscription(u.id, 'FREE', null, 'EXPIRED')}
                      disabled={actionLoading === u.id}
                      className="px-3 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] dark:bg-[#EF4444] text-white font-bold text-[10px] cursor-pointer"
                    >
                      Reject Proof
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
              <h2 className="text-base font-bold">User Directory & Subscription Manager</h2>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <form onSubmit={handleSearch} className="relative">
                <Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
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
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Expiry Date</th>
                  <th className="py-3 px-3 text-center">Subscription Controls</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243044] bg-[#FFFFFF] dark:bg-[#151E2E]">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#64748B] dark:text-[#94A3B8]">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  users.map(u => {
                    const isPro = u.plan === 'PRO' && u.subscriptionStatus === 'ACTIVE';
                    const isPending = u.subscriptionStatus === 'PENDING';

                    return (
                      <tr key={u.id} className="hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-bold block">{u.name}</span>
                            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">{u.email}</span>
                            {u.phone && <span className="text-[10px] text-[#2563EB] dark:text-[#3B82F6] block">📱 {u.phone}</span>}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'ADMIN' 
                              ? 'bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/10 dark:text-[#3B82F6] border border-[#2563EB]/20' 
                              : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]'
                          }`}>
                            {u.role}
                          </span>
                        </td>

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

                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.subscriptionStatus === 'ACTIVE' 
                              ? 'text-[#16A34A] dark:text-[#22C55E]' 
                              : (u.subscriptionStatus === 'PENDING' ? 'text-[#D97706] dark:text-[#F59E0B]' : 'text-[#64748B] dark:text-[#94A3B8]')
                          }`}>
                            {u.subscriptionStatus || 'NONE'}
                          </span>
                        </td>

                        <td className="py-3 px-3 mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {u.subscriptionExpiresAt 
                            ? new Date(u.subscriptionExpiresAt).toLocaleDateString('en-GB') 
                            : '—'}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            {!isPro ? (
                              <button
                                onClick={() => handleUpdateSubscription(u.id, 'PRO', '1_MONTH', 'ACTIVE')}
                                disabled={actionLoading === u.id}
                                className="px-2.5 py-1 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-[10px] cursor-pointer"
                                title="Activate 30 Days Pro"
                              >
                                Activate Pro (1M)
                              </button>
                            ) : (
                              <button
                                onClick={() => handleExtendDays(u.id, 30)}
                                disabled={actionLoading === u.id}
                                className="px-2 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-[10px] cursor-pointer"
                                title="Add 30 Days"
                              >
                                +30 Days
                              </button>
                            )}

                            {isPro && (
                              <button
                                onClick={() => handleUpdateSubscription(u.id, 'FREE', null, 'EXPIRED')}
                                disabled={actionLoading === u.id}
                                className="px-2 py-1 rounded-lg bg-[#DC2626]/10 text-[#DC2626] dark:text-[#EF4444] hover:bg-[#DC2626] hover:text-white text-[10px] font-bold cursor-pointer"
                                title="Cancel Pro Subscription"
                              >
                                Demote
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              disabled={actionLoading === u.id}
                              className="p-1.5 rounded-lg bg-[#DC2626]/10 text-[#DC2626] dark:text-[#EF4444] hover:bg-[#DC2626] hover:text-white transition-colors cursor-pointer"
                              title="Delete User"
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

      </div>
    </div>
  );
}

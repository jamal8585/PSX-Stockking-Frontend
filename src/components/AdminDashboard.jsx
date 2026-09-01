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
    setMessage({ text: '', type: '' });
    try {
      const res = await deleteAdminUser(userId);
      if (res.success) {
        setMessage({ text: `User "${userName}" deleted.`, type: 'success' });
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
    <div className="min-h-screen bg-[#04070D] text-gray-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0F172A] via-[#0A0F1D] to-[#04070D] p-6 rounded-3xl border border-cyan-500/30 shadow-2xl">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  PSX Stockking Subscription & User Admin Panel
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Logged in as Administrator: <span className="text-cyan-400 font-bold">{currentUser?.email}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white cursor-pointer transition-all border border-gray-700"
              title="Refresh User Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onBackToPortal}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs cursor-pointer shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
            >
              <span>Return to Main Portal</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`flex items-center space-x-2 p-3.5 rounded-2xl text-xs border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* KPI Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-[#070B12] p-4 rounded-2xl border border-gray-800">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Registered Users</span>
              <span className="text-2xl font-black text-white mono mt-1 block">{analytics.totalUsers}</span>
              <span className="text-[10px] text-gray-500">Platform Accounts</span>
            </div>
            <div className="bg-[#070B12] p-4 rounded-2xl border border-amber-500/40">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Active Pro VIPs ⭐</span>
              <span className="text-2xl font-black text-amber-400 mono mt-1 block">{analytics.proUsers}</span>
              <span className="text-[10px] text-amber-500/80">Paid Subscribers</span>
            </div>
            <div className="bg-[#070B12] p-4 rounded-2xl border border-gray-800">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Free Tier Users</span>
              <span className="text-2xl font-black text-cyan-400 mono mt-1 block">{analytics.freeUsers}</span>
              <span className="text-[10px] text-gray-500">Basic Tier</span>
            </div>
            <div className="bg-[#070B12] p-4 rounded-2xl border border-rose-500/30">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">Pending Approvals</span>
              <span className="text-2xl font-black text-rose-400 mono mt-1 block">{analytics.pendingApprovals}</span>
              <span className="text-[10px] text-rose-500/80">Awaiting Verification</span>
            </div>
            <div className="bg-[#070B12] p-4 rounded-2xl border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Estimated MRR</span>
              <span className="text-2xl font-black text-emerald-400 mono mt-1 block">PKR {analytics.estimatedMRR?.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-500/80">Monthly Revenue</span>
            </div>
          </div>
        )}

        {/* Pending Approvals Queue */}
        {pendingUsers.length > 0 && (
          <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-transparent p-5 rounded-3xl border border-amber-500/40 space-y-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
              <h2 className="text-sm font-extrabold text-amber-300 uppercase tracking-wider">
                Pending Subscription Upgrades Awaiting Admin Action ({pendingUsers.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingUsers.map(u => (
                <div key={u.id} className="bg-[#070B12] p-4 rounded-2xl border border-gray-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-white text-xs block">{u.name}</span>
                      <span className="text-[11px] text-cyan-400 font-medium">{u.email}</span>
                      {u.phone && <span className="text-[11px] text-gray-400 block">📱 {u.phone}</span>}
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      PENDING
                    </span>
                  </div>

                  <div className="bg-gray-900/90 p-2.5 rounded-xl border border-gray-800 text-[11px] space-y-1">
                    <div className="flex justify-between text-gray-300">
                      <span>Method: <strong className="text-emerald-400">{u.paymentProof?.method || 'Direct'}</strong></span>
                      <span>Amount: <strong className="text-white mono">PKR {u.paymentProof?.amount || 1499}</strong></span>
                    </div>
                    <div className="text-gray-300">
                      <span>TxID: <strong className="text-cyan-300 mono">{u.paymentProof?.transactionId || 'N/A'}</strong></span>
                    </div>
                    {u.paymentProof?.note && (
                      <div className="text-gray-400 italic text-[10px]">
                        Note: {u.paymentProof.note}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleUpdateSubscription(u.id, 'PRO', '1_MONTH', 'ACTIVE')}
                      disabled={actionLoading === u.id}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] cursor-pointer"
                    >
                      Approve (1 Month)
                    </button>
                    <button
                      onClick={() => handleUpdateSubscription(u.id, 'PRO', '3_MONTHS', 'ACTIVE')}
                      disabled={actionLoading === u.id}
                      className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-extrabold text-[10px] cursor-pointer"
                    >
                      Approve (3 Months)
                    </button>
                    <button
                      onClick={() => handleUpdateSubscription(u.id, 'PRO', 'LIFETIME', 'ACTIVE')}
                      disabled={actionLoading === u.id}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-[10px] cursor-pointer"
                    >
                      Approve (Lifetime VIP)
                    </button>
                    <button
                      onClick={() => handleUpdateSubscription(u.id, 'FREE', 'FREE', 'INACTIVE')}
                      disabled={actionLoading === u.id}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-[10px] font-bold cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-[#070B12] p-4 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search user by name, email, phone, TxID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Plan Filter */}
            <div className="flex items-center space-x-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs">
              <span className="text-[10px] text-gray-500 font-bold px-2">Plan:</span>
              {['ALL', 'PRO', 'FREE'].map(p => (
                <button
                  key={p}
                  onClick={() => setPlanFilter(p)}
                  className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                    planFilter === p ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs">
              <span className="text-[10px] text-gray-500 font-bold px-2">Status:</span>
              {['ALL', 'ACTIVE', 'PENDING', 'EXPIRED'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                    statusFilter === s ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#070B12] rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900/90 text-[10px] text-gray-400 uppercase font-bold border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Plan & Status</th>
                  <th className="py-3.5 px-4">Subscription Duration / Expiry</th>
                  <th className="py-3.5 px-4 text-right">Subscription Management Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No users found matching your search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  users.map(u => {
                    const isPro = u.plan === 'PRO' && u.subscriptionStatus === 'ACTIVE';
                    const isPending = u.subscriptionStatus === 'PENDING';
                    const isExpired = u.subscriptionStatus === 'EXPIRED';

                    return (
                      <tr key={u.id} className="hover:bg-gray-900/40 transition-colors">
                        {/* User Details */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-white">{u.name}</div>
                          <div className="text-[11px] text-cyan-400 mono">{u.email}</div>
                          {u.phone && <div className="text-[10px] text-gray-500">📱 {u.phone}</div>}
                          <div className="text-[9px] text-gray-600 mt-0.5">
                            Joined: {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border ${
                            u.role === 'ADMIN' 
                              ? 'bg-purple-950 text-purple-300 border-purple-800' 
                              : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        {/* Plan & Status */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border ${
                              isPro 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                : 'bg-gray-800 text-gray-400 border-gray-700'
                            }`}>
                              {u.plan} VIP
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              isPro ? 'text-emerald-400' : isPending ? 'text-amber-400 animate-pulse' : isExpired ? 'text-rose-400' : 'text-gray-500'
                            }`}>
                              ● {u.subscriptionStatus}
                            </span>
                          </div>
                        </td>

                        {/* Expiry Date */}
                        <td className="py-3.5 px-4 text-[11px]">
                          {u.subscriptionDuration === 'LIFETIME' ? (
                            <span className="text-amber-300 font-bold">♾️ Lifetime VIP</span>
                          ) : u.subscriptionEnd ? (
                            <div>
                              <span className="mono font-bold text-white block">
                                {new Date(u.subscriptionEnd).toLocaleDateString()}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {Math.ceil((new Date(u.subscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24))} days left
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">No Active Expiry</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Activate 1 Month */}
                            <button
                              onClick={() => handleUpdateSubscription(u.id, 'PRO', '1_MONTH', 'ACTIVE')}
                              disabled={actionLoading === u.id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-[10px] font-bold cursor-pointer"
                              title="Set 1 Month Pro Access"
                            >
                              +1M Pro
                            </button>

                            {/* Activate 1 Year */}
                            <button
                              onClick={() => handleUpdateSubscription(u.id, 'PRO', '1_YEAR', 'ACTIVE')}
                              disabled={actionLoading === u.id}
                              className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/40 text-[10px] font-bold cursor-pointer"
                              title="Set 1 Year VIP Access"
                            >
                              +1Y Pro
                            </button>

                            {/* Lifetime VIP */}
                            <button
                              onClick={() => handleUpdateSubscription(u.id, 'PRO', 'LIFETIME', 'ACTIVE')}
                              disabled={actionLoading === u.id}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] font-bold cursor-pointer"
                              title="Set Lifetime VIP Access"
                            >
                              Lifetime
                            </button>

                            {/* Revoke to Free */}
                            {u.plan === 'PRO' && (
                              <button
                                onClick={() => handleUpdateSubscription(u.id, 'FREE', 'FREE', 'INACTIVE')}
                                disabled={actionLoading === u.id}
                                className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-[10px] font-bold cursor-pointer"
                                title="Revoke Pro Access"
                              >
                                Revoke
                              </button>
                            )}

                            {/* Delete User */}
                            {u.role !== 'ADMIN' && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                disabled={actionLoading === u.id}
                                className="p-1.5 rounded-lg bg-gray-800 text-gray-500 hover:text-rose-400 hover:bg-gray-700 cursor-pointer transition-colors"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
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

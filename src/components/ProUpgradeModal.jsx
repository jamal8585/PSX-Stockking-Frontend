import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard, 
  AlertCircle, 
  Sparkles,
  Copy,
  Check,
  Smartphone
} from 'lucide-react';
import { submitUpgradeProof } from '../services/api';

export default function ProUpgradeModal({ isOpen, onClose, user, onAuthRequired, onUpgradeSubmitted }) {
  const [selectedPlan, setSelectedPlan] = useState('1_MONTH');
  const [paymentMethod, setPaymentMethod] = useState('EasyPaisa');
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState(1499);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const planOptions = [
    { id: '1_MONTH', name: '1 Month Access', price: 'PKR 1,499', val: 1499, tag: 'Standard' },
    { id: '3_MONTHS', name: '3 Months (Quarterly)', price: 'PKR 3,999', val: 3999, tag: 'Popular • Save 12%' },
    { id: '1_YEAR', name: '1 Year (VIP Annual)', price: 'PKR 11,999', val: 11999, tag: 'Best Value • Save 33%' }
  ];

  const handlePlanSelect = (p) => {
    setSelectedPlan(p.id);
    setAmount(p.val);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!user) {
      onClose();
      if (onAuthRequired) onAuthRequired();
      return;
    }

    if (!transactionId.trim()) {
      setError('Please enter your Transaction ID / Reference Number.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await submitUpgradeProof({
        method: paymentMethod,
        transactionId,
        amount,
        note
      });

      if (res.success) {
        setSuccess(true);
        if (onUpgradeSubmitted) onUpgradeSubmitted(res.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit payment proof. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 relative transition-all text-[#0F172A] dark:text-[#F8FAFC]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#D97706]/10 dark:bg-[#F59E0B]/10 border border-[#D97706]/20 dark:border-[#F59E0B]/20 text-[#D97706] dark:text-[#F59E0B] mb-3 shadow-sm">
            <Crown className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Upgrade to <span className="text-[#D97706] dark:text-[#F59E0B]">PSX Stockking PRO VIP</span>
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            Unlock algorithmic AI signals, live candlestick technicals, high-gain setups & automated risk position sizing
          </p>
        </div>

        {/* Pro Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
          <div className="flex items-start space-x-2.5 bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044]">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-[#22C55E] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold block">🤖 Daily AI Buy/Sell Signals</span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">High-confidence setups with exact entry zones, Target 1 & 2.</span>
            </div>
          </div>
          <div className="flex items-start space-x-2.5 bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044]">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-[#22C55E] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold block">🕯️ Japanese Candlestick (OHLC)</span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Real OHLC candles, Volume sub-chart & 20-Day EMA overlays.</span>
            </div>
          </div>
          <div className="flex items-start space-x-2.5 bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044]">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-[#22C55E] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold block">💡 Day Trade Suggestions</span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Live news catalysts with fundamental advice in easy English/Urdu.</span>
            </div>
          </div>
          <div className="flex items-start space-x-2.5 bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044]">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-[#22C55E] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold block">🧮 1-Click Broker Order Planner</span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Auto position sizing, risk/gain PKR & 1-click broker order copy.</span>
            </div>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="mb-6">
          <span className="text-[11px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] block mb-2">
            Select Subscription Plan:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {planOptions.map(p => (
              <div
                key={p.id}
                onClick={() => handlePlanSelect(p)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all text-center relative ${
                  selectedPlan === p.id 
                    ? 'bg-[#D97706]/10 dark:bg-[#F59E0B]/10 border-[#D97706] dark:border-[#F59E0B] shadow-sm' 
                    : 'bg-[#F8FAFC] dark:bg-[#0B0F19] border-[#E2E8F0] dark:border-[#243044] hover:border-[#D97706]/50'
                }`}
              >
                {selectedPlan === p.id && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#D97706] dark:bg-[#F59E0B] text-white dark:text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Selected
                  </span>
                )}
                <span className="text-xs font-bold block mt-1">{p.name}</span>
                <span className="text-base font-black text-[#D97706] dark:text-[#F59E0B] block mono my-1">{p.price}</span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block font-medium">{p.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Official Pakistan Payment Accounts Box */}
        <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-4 border border-[#E2E8F0] dark:border-[#243044] mb-6 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#D97706] dark:text-[#F59E0B]">
            <CreditCard className="w-4 h-4" />
            <span>Official Pakistan Payment Accounts:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* 1. EasyPaisa Card */}
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-3.5 rounded-lg border border-[#16A34A]/30 dark:border-[#22C55E]/30 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#16A34A] dark:text-[#22C55E] flex items-center">
                  <Smartphone className="w-3.5 h-3.5 mr-1" /> 🟢 EasyPaisa
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('03452831413', 'ep')}
                  className="p-1 px-2 rounded-md bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E] hover:bg-[#16A34A] hover:text-white dark:hover:bg-[#22C55E] dark:hover:text-black text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  {copiedKey === 'ep' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'ep' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div>
                <span className="text-base font-black mono text-[#0F172A] dark:text-[#F8FAFC] block tracking-wide">
                  0345-2831413
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                  Account / Mobile Wallet
                </span>
              </div>
            </div>

            {/* 2. JazzCash Card */}
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-3.5 rounded-lg border border-[#DC2626]/30 dark:border-[#EF4444]/30 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#DC2626] dark:text-[#EF4444] flex items-center">
                  <Smartphone className="w-3.5 h-3.5 mr-1" /> 🔴 JazzCash
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('03413266381', 'jc')}
                  className="p-1 px-2 rounded-md bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#EF4444]/10 dark:text-[#EF4444] hover:bg-[#DC2626] hover:text-white text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  {copiedKey === 'jc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'jc' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div>
                <span className="text-base font-black mono text-[#0F172A] dark:text-[#F8FAFC] block tracking-wide">
                  0341-3266381
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                  Account / Mobile Wallet
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#243044] text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
            <span>💡 <b>Raast ID:</b> Aap kisi bhi Pakistani bank app se direct Raast par bhi transfer kar sakte hain.</span>
          </div>
        </div>

        {/* Submit Proof Form */}
        {success ? (
          <div className="bg-[#16A34A]/10 border border-[#16A34A]/20 dark:bg-[#22C55E]/10 dark:border-[#22C55E]/20 rounded-lg p-5 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#16A34A] dark:text-[#22C55E] mx-auto" />
            <h3 className="text-base font-bold">Upgrade Request Received!</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Thank you! Your payment reference has been submitted to the Admin. Your <b>Stockking Pro VIP</b> access will be activated promptly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 px-6 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] dark:bg-[#22C55E] dark:hover:bg-[#16A34A] text-white dark:text-black font-bold text-xs cursor-pointer shadow-sm"
            >
              Continue to Portal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitProof} className="space-y-3">
            <span className="text-[11px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] block">
              Submit Payment Reference for Instant Verification:
            </span>

            {error && (
              <div className="flex items-center space-x-2 bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] dark:text-[#EF4444] p-2.5 rounded-lg text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626] dark:text-[#EF4444]" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold mb-1">
                  Payment Method Used
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] font-bold focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                >
                  <option value="EasyPaisa">EasyPaisa (0345-2831413)</option>
                  <option value="JazzCash">JazzCash (0341-3266381)</option>
                  <option value="Raast / Bank Transfer">Raast / Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold mb-1">
                  Transaction ID / Reference Number (TRX ID)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1029384756 / TRX ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] font-bold mono placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold mb-1">
                Sender Mobile / WhatsApp Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 0300-1234567 - sent from Ali"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] dark:bg-[#F59E0B] dark:hover:bg-[#D97706] text-white dark:text-black font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-sm transition-all mt-3 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Submitting Reference...' : (!user ? 'Sign In & Submit Payment Proof' : `Submit Payment Proof (${planOptions.find(p => p.id === selectedPlan)?.price})`)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

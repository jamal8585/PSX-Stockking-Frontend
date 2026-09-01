import React, { useState } from 'react';
import { X, Crown, CheckCircle2, Zap, ArrowRight, ShieldCheck, CreditCard, AlertCircle, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-gradient-to-b from-[#0F172A] via-[#0A0F1D] to-[#04070D] border border-amber-500/40 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-black mb-3 shadow-lg shadow-amber-500/30">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Upgrade to <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">PSX Stockking PRO VIP</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Unlock algorithmic AI signals, live candlestick technicals, high-gain setups & automated risk position sizing
          </p>
        </div>

        {/* Pro Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
          <div className="flex items-start space-x-2.5 bg-[#070B12] p-3 rounded-2xl border border-gray-800/80">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">🤖 Daily AI Buy/Sell Signals</span>
              <span className="text-[11px] text-gray-400">High-confidence setups with exact entry zones, Target 1 & 2.</span>
            </div>
          </div>
          <div className="flex items-start space-x-2.5 bg-[#070B12] p-3 rounded-2xl border border-gray-800/80">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">🕯️ Japanese Candlestick (OHLC)</span>
              <span className="text-[11px] text-gray-400">Real OHLC candles, Volume sub-chart & 20-Day EMA overlays.</span>
            </div>
          </div>
          <div className="flex items-start space-x-2.5 bg-[#070B12] p-3 rounded-2xl border border-gray-800/80">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">💡 Day Trade Suggestions</span>
              <span className="text-[11px] text-gray-400">Live news catalysts with "Why We Give This Advice (Easy English)".</span>
            </div>
          </div>
          <div className="flex items-start space-x-2.5 bg-[#070B12] p-3 rounded-2xl border border-gray-800/80">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block">🧮 1-Click Broker Order Planner</span>
              <span className="text-[11px] text-gray-400">Auto position sizing, risk/gain PKR & 1-click broker order copy.</span>
            </div>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="mb-6">
          <span className="text-[11px] uppercase font-bold text-gray-400 block mb-2">
            Select Subscription Plan:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {planOptions.map(p => (
              <div
                key={p.id}
                onClick={() => handlePlanSelect(p)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-center relative ${
                  selectedPlan === p.id 
                    ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/20' 
                    : 'bg-[#070B12] border-gray-800 hover:border-gray-700'
                }`}
              >
                {selectedPlan === p.id && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    Selected
                  </span>
                )}
                <span className="text-xs font-bold text-white block mt-1">{p.name}</span>
                <span className="text-base font-black text-amber-400 block mono my-1">{p.price}</span>
                <span className="text-[10px] text-gray-400 block font-medium">{p.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Account Details */}
        <div className="bg-[#070B12] rounded-2xl p-4 border border-gray-800 mb-6 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
            <CreditCard className="w-4 h-4" />
            <span>Official Pakistan Payment Accounts:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
              <span className="text-[10px] text-emerald-400 font-bold block">🟢 EasyPaisa</span>
              <span className="font-extrabold text-white mono block">0300-1234567</span>
              <span className="text-[10px] text-gray-400 block">Title: PSX Stockking</span>
            </div>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
              <span className="text-[10px] text-rose-400 font-bold block">🔴 JazzCash</span>
              <span className="font-extrabold text-white mono block">0300-1234567</span>
              <span className="text-[10px] text-gray-400 block">Title: PSX Stockking</span>
            </div>
            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
              <span className="text-[10px] text-cyan-400 font-bold block">🏦 Bank Transfer</span>
              <span className="font-extrabold text-white mono block">PK98MEZN00001234</span>
              <span className="text-[10px] text-gray-400 block">Meezan Bank Ltd</span>
            </div>
          </div>
        </div>

        {/* Submit Proof Section */}
        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Upgrade Request Received!</h3>
            <p className="text-xs text-gray-300">
              Thank you! Your payment reference has been submitted to the Admin. Your **Stockking Pro VIP** access will be activated within 15-30 minutes.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 px-6 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs cursor-pointer hover:bg-emerald-400"
            >
              Continue to Portal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitProof} className="space-y-3">
            <span className="text-[11px] uppercase font-bold text-gray-400 block">
              Submit Payment Reference for Instant Verification:
            </span>

            {error && (
              <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-2.5 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                  Payment Method Used
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Transfer">Bank Transfer (Meezan/Alfalah)</option>
                  <option value="Other">Other / Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                  Transaction ID / Reference Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRX-9821734"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white mono placeholder-gray-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">
                WhatsApp Number / Additional Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. +92 300 1234567 - sent from Ali account"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:opacity-95 text-black font-black text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-amber-500/25 transition-all mt-3 disabled:opacity-50"
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


import React, { useState } from 'react';
import { X, Calculator, Target, StopCircle, Copy, Check, ShieldCheck, Zap } from 'lucide-react';

export default function OrderExecutionPlannerModal({ stock, onClose }) {
  if (!stock) return null;

  const [capital, setCapital] = useState(100000);
  const [copied, setCopied] = useState(false);

  const price = stock.currentPrice || 100;
  const stopLoss = stock.stopLoss || (price * 0.95);
  const target1 = stock.target1 || (price * 1.08);

  const shares = Math.floor(capital / price);
  const totalInvestment = shares * price;
  const riskPerShare = Math.max(0.01, price - stopLoss);
  const rewardPerShare = Math.max(0.01, target1 - price);
  const totalRiskPKR = Math.round(shares * riskPerShare);
  const totalGainPKR = Math.round(shares * rewardPerShare);
  const riskRewardRatio = (rewardPerShare / riskPerShare).toFixed(2);
  const commissionPKR = Math.round(totalInvestment * 0.0015);

  const handleCopy = () => {
    const text = `=== PSX ALPHA TERMINAL ORDER EXECUTION PLAN ===
Symbol: ${stock.symbol} (${stock.companyName || ''})
Order Type: BUY LIMIT
Quantity: ${shares.toLocaleString()} Shares
Entry Price: PKR ${price.toFixed(2)}
Total Capital: PKR ${totalInvestment.toLocaleString()}
Stop Loss: PKR ${stopLoss.toFixed(2)} (Max Risk: -PKR ${totalRiskPKR.toLocaleString()})
Target Sell Price: PKR ${target1.toFixed(2)} (Target Profit: +PKR ${totalGainPKR.toLocaleString()})
Risk-to-Reward Ratio: 1 : ${riskRewardRatio}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-gradient-to-b from-[#0F172A] to-[#070B12] border border-cyan-500/30 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              Trade Execution & Risk Planner
            </h2>
            <p className="text-xs text-gray-400">
              Position Sizing & Risk Allocation for <b className="text-cyan-300 mono">{stock.symbol}</b>
            </p>
          </div>
        </div>

        {/* Capital Slider */}
        <div className="bg-[#070B12] rounded-xl p-4 border border-gray-800 mb-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-300">Allocated Trade Capital (PKR):</span>
            <input
              type="number"
              step="10000"
              value={capital}
              onChange={e => setCapital(Math.max(5000, Number(e.target.value)))}
              className="w-36 bg-[#0D131F] border border-cyan-900 rounded-lg px-2.5 py-1 text-right text-cyan-300 font-extrabold mono focus:outline-none focus:border-cyan-400 text-xs"
            />
          </div>

          <input
            type="range"
            min="20000"
            max="1000000"
            step="10000"
            value={capital}
            onChange={e => setCapital(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex justify-between text-[10px] text-gray-500 mono font-semibold">
            <span>PKR 20,000</span>
            <span>PKR 500,000</span>
            <span>PKR 1,000,000+</span>
          </div>
        </div>

        {/* Calculated Breakdown */}
        <div className="space-y-2.5 mb-5 text-xs">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#070B12] p-3 rounded-xl border border-gray-800">
              <span className="text-[9px] text-gray-400 uppercase font-bold block">Quantity to Execute</span>
              <span className="text-2xl font-extrabold text-white mono">{shares.toLocaleString()}</span>
              <span className="text-[10px] text-gray-500 block">Shares @ PKR {price.toFixed(2)}</span>
            </div>

            <div className="bg-[#070B12] p-3 rounded-xl border border-gray-800">
              <span className="text-[9px] text-gray-400 uppercase font-bold block">Total Capital Deployed</span>
              <span className="text-2xl font-extrabold text-cyan-400 mono">PKR {totalInvestment.toLocaleString()}</span>
              <span className="text-[10px] text-gray-500 block">Brokerage Estimate: ~PKR {commissionPKR}</span>
            </div>
          </div>

          {/* Risk vs Gain Matrix */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl">
              <span className="text-[9px] text-rose-400 uppercase font-bold flex items-center">
                <StopCircle className="w-3.5 h-3.5 mr-1" /> Max Risk (Stop Loss)
              </span>
              <span className="text-lg font-extrabold text-rose-400 mono block mt-0.5">
                - PKR {totalRiskPKR.toLocaleString()}
              </span>
              <span className="text-[10px] text-rose-300/80 font-medium">Trigger Level @ PKR {stopLoss}</span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
              <span className="text-[9px] text-emerald-400 uppercase font-bold flex items-center">
                <Target className="w-3.5 h-3.5 mr-1" /> Expected Gain (Target)
              </span>
              <span className="text-lg font-extrabold text-emerald-400 mono block mt-0.5">
                + PKR {totalGainPKR.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-300/80 font-medium">Target Level @ PKR {target1}</span>
            </div>
          </div>

          <div className="bg-[#070B12] p-2.5 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Risk-to-Reward Ratio:</span>
            <span className="font-extrabold text-amber-400 mono text-sm">1 : {riskRewardRatio}</span>
          </div>
        </div>

        {/* Copy Button */}
        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:opacity-90 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Order Specifications Copied!' : 'Copy Order Specs For Trading Portal'}</span>
          </button>
          <p className="text-[10px] text-gray-500 text-center">
            Open your online trading portal/app, enter Symbol <b className="text-gray-300">{stock.symbol}</b>, Quantity <b className="text-gray-300">{shares}</b>, and Limit Price <b className="text-gray-300">{price.toFixed(2)}</b>.
          </p>
        </div>
      </div>
    </div>
  );
}

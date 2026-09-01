
import React, { useState } from 'react';
import { X, Calculator, Target, StopCircle, Copy, Check } from 'lucide-react';

export default function DarsonOrderCalculatorModal({ stock, onClose }) {
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
    const text = `--- DARSON SECURITIES ORDER PLAN ---
Symbol: ${stock.symbol}
Action: BUY (Limit Order)
Quantity (Shares): ${shares.toLocaleString()}
Entry Limit Price: PKR ${price.toFixed(2)}
Estimated Capital: PKR ${totalInvestment.toLocaleString()}
Stop Loss: PKR ${stopLoss.toFixed(2)} (Max Loss: PKR ${totalRiskPKR.toLocaleString()})
Target 1: PKR ${target1.toFixed(2)} (Expected Gain: PKR ${totalGainPKR.toLocaleString()})
Risk-to-Reward: 1 : ${riskRewardRatio}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Darson Securities Order Calculator
            </h2>
            <p className="text-xs text-gray-400">
              Position Sizing & Risk Management for <b className="text-white mono">{stock.symbol}</b>
            </p>
          </div>
        </div>

        <div className="bg-gray-900/90 rounded-xl p-4 border border-gray-800 mb-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-300">Allocated Trade Capital (PKR):</span>
            <input
              type="number"
              step="10000"
              value={capital}
              onChange={e => setCapital(Math.max(5000, Number(e.target.value)))}
              className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1 text-right text-white font-bold mono focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <input
            type="range"
            min="20000"
            max="1000000"
            step="10000"
            value={capital}
            onChange={e => setCapital(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between text-[10px] text-gray-500">
            <span>PKR 20,000</span>
            <span>PKR 500,000</span>
            <span>PKR 1,000,000+</span>
          </div>
        </div>

        <div className="space-y-2 mb-5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Quantity to Buy</span>
              <span className="text-xl font-extrabold text-white mono">{shares.toLocaleString()}</span>
              <span className="text-[10px] text-gray-500 block">Shares @ PKR {price.toFixed(2)}</span>
            </div>

            <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Trade Value</span>
              <span className="text-xl font-extrabold text-emerald-400 mono">PKR {totalInvestment.toLocaleString()}</span>
              <span className="text-[10px] text-gray-500 block">Brokerage: ~PKR {commissionPKR}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              <span className="text-[10px] text-rose-400 uppercase font-semibold flex items-center">
                <StopCircle className="w-3 h-3 mr-1" /> Max Risk (Stop Loss)
              </span>
              <span className="text-base font-bold text-rose-400 mono block mt-1">
                - PKR {totalRiskPKR.toLocaleString()}
              </span>
              <span className="text-[10px] text-rose-300/80">Trigger @ PKR {Number(stopLoss).toFixed(2)}</span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold flex items-center">
                <Target className="w-3 h-3 mr-1" /> Expected Gain (Target 1)
              </span>
              <span className="text-base font-bold text-emerald-400 mono block mt-1">
                + PKR {totalGainPKR.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-300/80">Target @ PKR {Number(target1).toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-gray-900/80 p-2.5 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
            <span className="text-gray-400">Risk-to-Reward Ratio:</span>
            <span className="font-bold text-amber-400 mono">1 : {riskRewardRatio}</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Order Specs for Darson Portal'}</span>
          </button>
          <p className="text-[10px] text-gray-500 text-center">
            Open Darson Securities Trade App/Web, enter Symbol <b className="text-gray-300">{stock.symbol}</b>, Quantity <b className="text-gray-300">{shares}</b>, and Price <b className="text-gray-300">{price.toFixed(2)}</b>.
          </p>
        </div>
      </div>
    </div>
  );
}

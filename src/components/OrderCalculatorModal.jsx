import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  Target, 
  StopCircle, 
  Copy, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw,
  Sparkles,
  Radio
} from 'lucide-react';
import officialQuotes from '../data/official_quotes.json';

export default function OrderCalculatorModal({ stock, stocks = [], onClose }) {
  if (!stock) return null;

  const sym = (stock.symbol || '').toUpperCase().trim();
  const foundInStocks = Array.isArray(stocks) ? stocks.find(s => s.symbol?.toUpperCase() === sym) : null;
  const official = officialQuotes ? officialQuotes[sym] : null;

  const livePrice = Number(
    foundInStocks?.currentPrice ||
    stock.currentPrice || 
    official?.currentPrice || 
    100
  );

  const prevClose = Number(
    foundInStocks?.prevClose ||
    stock.prevClose || 
    official?.prevClose || 
    (livePrice * 0.99)
  );

  const change = foundInStocks?.change !== undefined
    ? Number(foundInStocks.change)
    : (stock.change !== undefined 
        ? Number(stock.change) 
        : (official?.change !== undefined 
            ? Number(official.change) 
            : Number((livePrice - prevClose).toFixed(2))));

  const changePercent = foundInStocks?.changePercent !== undefined
    ? Number(foundInStocks.changePercent)
    : (stock.changePercent !== undefined 
        ? Number(stock.changePercent) 
        : (official?.changePercent !== undefined 
            ? Number(official.changePercent) 
            : (prevClose > 0 ? Number((((livePrice - prevClose) / prevClose) * 100).toFixed(2)) : 0)));

  const isPos = change >= 0;

  const [capital, setCapital] = useState(100000);
  const [entryPrice, setEntryPrice] = useState(livePrice);
  const [copied, setCopied] = useState(false);

  // Synchronize entry price when stock or livePrice changes
  useEffect(() => {
    setEntryPrice(livePrice);
  }, [sym, livePrice]);

  const stopLoss = Number(stock.stopLoss || (entryPrice * 0.95));
  const target1 = Number(stock.target1 || (entryPrice * 1.08));

  const effectivePrice = Math.max(0.01, Number(entryPrice) || livePrice);
  const shares = Math.floor(capital / effectivePrice);
  const totalInvestment = Number((shares * effectivePrice).toFixed(2));
  
  const riskPerShare = Math.max(0.01, effectivePrice - stopLoss);
  const rewardPerShare = Math.max(0.01, target1 - effectivePrice);
  const totalRiskPKR = Math.round(shares * riskPerShare);
  const totalGainPKR = Math.round(shares * rewardPerShare);
  const riskRewardRatio = (rewardPerShare / riskPerShare).toFixed(2);
  const commissionPKR = Math.round(totalInvestment * 0.0015);

  const lossPct = effectivePrice > 0 ? (((effectivePrice - stopLoss) / effectivePrice) * 100).toFixed(1) : '5.0';
  const gainPct = effectivePrice > 0 ? (((target1 - effectivePrice) / effectivePrice) * 100).toFixed(1) : '8.0';

  const handleResetPrice = () => {
    setEntryPrice(livePrice);
  };

  const handleCopy = () => {
    const text = `--- PSX ALPHA ORDER EXECUTION PLAN ---
Symbol: ${stock.symbol}
Action: BUY (Limit / Market Order)
Current Market Price (CMP): PKR ${livePrice.toFixed(2)}
Execution Price: PKR ${effectivePrice.toFixed(2)}
Quantity (Shares): ${shares.toLocaleString()}
Estimated Capital: PKR ${totalInvestment.toLocaleString()}
Stop Loss: PKR ${stopLoss.toFixed(2)} (Max Risk: -PKR ${totalRiskPKR.toLocaleString()})
Target 1: PKR ${target1.toFixed(2)} (Expected Gain: +PKR ${totalGainPKR.toLocaleString()})
Risk-to-Reward: 1 : ${riskRewardRatio}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl w-full max-w-xl shadow-2xl p-4 sm:p-6 relative transition-all text-[#0F172A] dark:text-[#F8FAFC] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5 pr-8">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 border border-[#2563EB]/20 dark:border-[#3B82F6]/20 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6] shrink-0">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                PSX Alpha Order Execution Calculator
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Position Sizing for <b className="text-[#0F172A] dark:text-[#F8FAFC] mono">{stock.symbol}</b> {stock.name ? `• ${stock.name}` : ''}
              </p>
            </div>
          </div>

          {/* Prominent Live CMP Header Pill */}
          <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-1.5 sm:px-3.5 sm:py-2 shrink-0 self-start sm:self-auto">
            <span className="text-[9px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] block">Current Market Price (CMP)</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-sm sm:text-base font-black mono text-[#0F172A] dark:text-[#F8FAFC]">
                PKR {livePrice.toFixed(2)}
              </span>
              <span className={`text-[10px] sm:text-[11px] font-bold mono flex items-center ${isPos ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
                {isPos ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {isPos ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Inputs Section: Capital & Entry Price */}
        <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-4 border border-[#E2E8F0] dark:border-[#243044] mb-4 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Allocated Capital */}
            <div>
              <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">
                Allocated Capital (PKR):
              </label>
              <input
                type="number"
                step="10000"
                value={capital}
                onChange={e => setCapital(Math.max(1000, Number(e.target.value)))}
                className="w-full bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-right text-[#0F172A] dark:text-[#F8FAFC] font-bold mono focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] text-sm"
              />
            </div>

            {/* 2. Execution / Entry Price */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase">
                  Buy / Entry Price (PKR):
                </label>
                {entryPrice !== livePrice && (
                  <button
                    type="button"
                    onClick={handleResetPrice}
                    className="text-[10px] text-[#2563EB] dark:text-[#3B82F6] font-bold flex items-center hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5 mr-0.5" /> Reset to CMP
                  </button>
                )}
              </div>
              <input
                type="number"
                step="0.05"
                value={entryPrice}
                onChange={e => setEntryPrice(Math.max(0.01, Number(e.target.value)))}
                className="w-full bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-right text-[#0F172A] dark:text-[#F8FAFC] font-bold mono focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] text-sm"
              />
            </div>
          </div>

          {/* Capital Slider */}
          <div className="space-y-1 pt-1">
            <input
              type="range"
              min="10000"
              max="1000000"
              step="10000"
              value={capital}
              onChange={e => setCapital(Number(e.target.value))}
              className="w-full h-1.5 bg-[#E2E8F0] dark:bg-[#243044] rounded-lg appearance-none cursor-pointer accent-[#2563EB] dark:accent-[#3B82F6]"
            />
            <div className="flex justify-between text-[10px] text-[#64748B] dark:text-[#94A3B8]">
              <span>PKR 10,000</span>
              <span>PKR 500,000</span>
              <span>PKR 1,000,000+</span>
            </div>
          </div>
        </div>

        {/* 3 Core Order Metrics: CMP, Quantity, Total Value */}
        <div className="space-y-3 mb-5 text-xs">
          <div className="grid grid-cols-3 gap-2.5">
            {/* CMP Card */}
            <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044]">
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold block">Current Market Price</span>
              <span className="text-lg font-black text-[#2563EB] dark:text-[#3B82F6] mono block mt-0.5">
                PKR {livePrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block truncate">
                Live PSX DPS Rate
              </span>
            </div>

            {/* Quantity Card */}
            <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044]">
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold block">Quantity to Buy</span>
              <span className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC] mono block mt-0.5">
                {shares.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block truncate">
                Shares @ PKR {effectivePrice.toFixed(2)}
              </span>
            </div>

            {/* Total Value Card */}
            <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044]">
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold block">Total Trade Value</span>
              <span className="text-lg font-black text-[#16A34A] dark:text-[#22C55E] mono block mt-0.5">
                PKR {totalInvestment.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block truncate">
                Brokerage: ~PKR {commissionPKR}
              </span>
            </div>
          </div>

          {/* Risk (Stop Loss) & Target Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#DC2626]/10 border border-[#DC2626]/20 dark:bg-[#EF4444]/10 dark:border-[#EF4444]/20 p-3 rounded-lg">
              <span className="text-[10px] text-[#DC2626] dark:text-[#EF4444] uppercase font-bold flex items-center">
                <StopCircle className="w-3.5 h-3.5 mr-1" /> Max Risk (Stop Loss)
              </span>
              <span className="text-base font-bold text-[#DC2626] dark:text-[#EF4444] mono block mt-1">
                - PKR {totalRiskPKR.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#DC2626]/80 dark:text-[#EF4444]/80">
                Trigger @ PKR {stopLoss.toFixed(2)} (-{lossPct}%)
              </span>
            </div>

            <div className="bg-[#16A34A]/10 border border-[#16A34A]/20 dark:bg-[#22C55E]/10 dark:border-[#22C55E]/20 p-3 rounded-lg">
              <span className="text-[10px] text-[#16A34A] dark:text-[#22C55E] uppercase font-bold flex items-center">
                <Target className="w-3.5 h-3.5 mr-1" /> Expected Gain (Target 1)
              </span>
              <span className="text-base font-bold text-[#16A34A] dark:text-[#22C55E] mono block mt-1">
                + PKR {totalGainPKR.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#16A34A]/80 dark:text-[#22C55E]/80">
                Target @ PKR {target1.toFixed(2)} (+{gainPct}%)
              </span>
            </div>
          </div>

          {/* Risk-to-Reward Ratio */}
          <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044] flex justify-between items-center text-xs">
            <span className="text-[#64748B] dark:text-[#94A3B8] font-bold">Risk-to-Reward Ratio:</span>
            <span className="font-bold text-[#D97706] dark:text-[#F59E0B] mono text-sm">
              1 : {riskRewardRatio}
            </span>
          </div>
        </div>

        {/* Action Button & Instructions */}
        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Order Specs Copied to Clipboard!' : 'Copy Order Specs for Trading Portal'}</span>
          </button>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] text-center">
            Open your PSX Brokerage Trade App/Web, enter Symbol <b className="text-[#0F172A] dark:text-[#F8FAFC]">{stock.symbol}</b>, CMP <b className="text-[#2563EB] dark:text-[#3B82F6]">PKR {livePrice.toFixed(2)}</b>, Quantity <b className="text-[#0F172A] dark:text-[#F8FAFC]">{shares}</b>, and Limit Price <b className="text-[#0F172A] dark:text-[#F8FAFC]">PKR {effectivePrice.toFixed(2)}</b>.
          </p>
        </div>
      </div>
    </div>
  );
}

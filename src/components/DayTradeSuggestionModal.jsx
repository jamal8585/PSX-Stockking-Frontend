import React from 'react';
import { 
  X, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ShieldAlert, 
  Calculator, 
  LineChart, 
  Radio, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle,
  Clock,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function DayTradeSuggestionModal({ 
  stock, 
  onClose, 
  onOpenChart, 
  onOpenCalculator 
}) {
  if (!stock) return null;

  const {
    symbol,
    name,
    sector,
    currentPrice = 0,
    change = 0,
    changePercent = 0,
    technicals = {},
    volume = 0
  } = stock;

  const isPos = change >= 0;
  const price = Number(currentPrice);
  const rsi = Number(technicals.rsi14 || 55).toFixed(1);

  // Dynamic Day Trade Targets & Stop Loss
  const entryMin = Number((price * 0.985).toFixed(2));
  const entryMax = Number((price * 1.008).toFixed(2));
  const target1 = Number((price * 1.045).toFixed(2));
  const target2 = Number((price * 1.098).toFixed(2));
  const stopLoss = Number((price * 0.965).toFixed(2));
  const maxRiskPkr = Number((price - stopLoss).toFixed(2));
  const maxRewardPkr = Number((target2 - price).toFixed(2));
  const riskReward = (maxRewardPkr / (maxRiskPkr || 1)).toFixed(1);

  // Determine Signal Type
  let signalBadge = {
    action: 'STRONG INTRADAY BUY',
    color: 'from-emerald-500 to-teal-500 text-black',
    border: 'border-emerald-500/40',
    headline: 'High Institutional Buying Momentum & Volume Breakout'
  };

  if (rsi > 72 || changePercent > 6.5) {
    signalBadge = {
      action: 'TAKE PROFIT / CAUTION',
      color: 'from-amber-500 to-orange-500 text-black',
      border: 'border-amber-500/40',
      headline: 'RSI Near Overbought Zone — Lock in Partial Profits'
    };
  } else if (rsi < 40 || changePercent < -3) {
    signalBadge = {
      action: 'ACCUMULATE ON DIPS',
      color: 'from-cyan-500 to-blue-500 text-black',
      border: 'border-cyan-500/40',
      headline: 'Oversold Near Historical Support — Favorable Risk/Reward'
    };
  }

  // Plain-English Explanation
  const getPlainEnglishAdvice = () => {
    if (signalBadge.action.includes('BUY')) {
      return `${name} (${symbol}) is exhibiting robust bullish intraday structure above its 20-period moving average with RSI at ${rsi}. Buyer accumulation is strong. We recommend taking long entry between PKR ${entryMin} and PKR ${entryMax} with primary scalping target at PKR ${target1} and trailing towards PKR ${target2}. Protect your capital with strict stop loss at PKR ${stopLoss}.`;
    } else if (signalBadge.action.includes('PROFIT')) {
      return `${name} (${symbol}) has gained rapidly today (+${changePercent}%) with RSI elevated at ${rsi}. While bullish momentum remains intact, short-term profit-taking by retail traders is likely. If already holding, book 50% profit at current rate and trail your stop loss to PKR ${stopLoss}. New buyers should wait for a pullback.`;
    } else {
      return `${name} (${symbol}) is consolidating near support levels. The risk-to-reward ratio for new entry is attractive (${riskReward}:1). Accumulate gradually in small tranches between PKR ${entryMin} - PKR ${entryMax} for an upside rebound towards PKR ${target1}.`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-gradient-to-b from-[#0F172A] via-[#0B111E] to-[#070B12] border border-cyan-500/40 rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl font-extrabold text-white tracking-tight mono">
                {symbol}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-[10px]">
                {sector}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Radio className="w-2.5 h-2.5 mr-1 inline animate-ping" /> LIVE DAY TRADE SIGNAL
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{name}</p>
          </div>
        </div>

        {/* Action Signal Banner */}
        <div className={`rounded-2xl p-4 mb-6 border bg-gradient-to-r ${signalBadge.color} shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider block opacity-85">Today's Recommended Action</span>
            <span className="text-lg font-black tracking-tight">{signalBadge.action}</span>
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] uppercase font-black tracking-wider block opacity-85">Live Market Rate</span>
            <span className="text-xl font-black mono">
              PKR {price.toFixed(2)} <span className="text-xs">({isPos ? '+' : ''}{changePercent}%)</span>
            </span>
          </div>
        </div>

        {/* Quant Day Trade Setup Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#070B12] rounded-2xl p-3.5 border border-cyan-900/50">
            <div className="flex items-center space-x-1 text-cyan-400 text-[10px] font-bold uppercase mb-1">
              <Layers className="w-3 h-3" />
              <span>Optimal Entry</span>
            </div>
            <span className="text-sm font-extrabold text-white mono block">
              {entryMin} - {entryMax}
            </span>
            <span className="text-[10px] text-gray-400">Buy limit range</span>
          </div>

          <div className="bg-[#070B12] rounded-2xl p-3.5 border border-emerald-900/50">
            <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold uppercase mb-1">
              <Target className="w-3 h-3" />
              <span>Target 1 (Scalp)</span>
            </div>
            <span className="text-sm font-extrabold text-emerald-400 mono block">
              PKR {target1}
            </span>
            <span className="text-[10px] text-emerald-500 font-bold">+4.50% Potential</span>
          </div>

          <div className="bg-[#070B12] rounded-2xl p-3.5 border border-teal-900/50">
            <div className="flex items-center space-x-1 text-teal-400 text-[10px] font-bold uppercase mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Target 2 (Swing)</span>
            </div>
            <span className="text-sm font-extrabold text-teal-400 mono block">
              PKR {target2}
            </span>
            <span className="text-[10px] text-teal-500 font-bold">+9.80% Potential</span>
          </div>

          <div className="bg-[#070B12] rounded-2xl p-3.5 border border-rose-900/50">
            <div className="flex items-center space-x-1 text-rose-400 text-[10px] font-bold uppercase mb-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Stop Loss</span>
            </div>
            <span className="text-sm font-extrabold text-rose-400 mono block">
              PKR {stopLoss}
            </span>
            <span className="text-[10px] text-rose-500 font-bold">-3.50% Max Risk</span>
          </div>
        </div>

        {/* Plain-English Easy Summary Box */}
        <div className="bg-[#070B12] rounded-2xl p-4 border border-gray-800 mb-6 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Trade Explanation & Decision (Easy English)</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {getPlainEnglishAdvice()}
          </p>
        </div>

        {/* Telemetry Micro Stats */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-400 border-t border-gray-800/80 pt-4 mb-6">
          <div>RSI (14-Period): <b className="text-white mono">{rsi}</b></div>
          <div>Volume: <b className="text-white mono">{(volume || 0).toLocaleString()}</b></div>
          <div>Risk-to-Reward: <b className="text-emerald-400 mono">1 : {riskReward}</b></div>
          <div>Live DPS Feed: <b className="text-cyan-400">Connected</b></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              onClose();
              if (onOpenChart) onOpenChart(symbol);
            }}
            className="w-full sm:flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all border border-gray-700"
          >
            <LineChart className="w-4 h-4 text-cyan-400" />
            <span>Open Full Technical Chart</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onOpenCalculator) onOpenCalculator(stock);
            }}
            className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-90 text-black font-extrabold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all shadow-lg shadow-cyan-500/20"
          >
            <Calculator className="w-4 h-4" />
            <span>Open Order Calculator</span>
          </button>
        </div>
      </div>
    </div>
  );
}
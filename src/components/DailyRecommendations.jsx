
import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Target, 
  StopCircle, 
  Calculator, 
  LineChart, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  Filter,
  Lock,
  Crown
} from 'lucide-react';
import officialQuotes from '../data/official_quotes.json';

export default function DailyRecommendations({ 
  recommendations, 
  stocks = [], 
  onSelectStock, 
  onOpenCalculator,
  currentUser,
  onOpenUpgrade
}) {
  const [filterSignal, setFilterSignal] = useState('ALL');
  const [filterSector, setFilterSector] = useState('ALL');

  const isPro = currentUser?.plan === 'PRO' && currentUser?.subscriptionStatus === 'ACTIVE';

  if (!recommendations || !recommendations.all) return null;

  const { all = [], summary = {} } = recommendations;

  const getLiveStock = (item) => {
    const sym = (item?.symbol || '').toUpperCase().trim();
    const foundInStocks = Array.isArray(stocks) ? stocks.find(s => s.symbol?.toUpperCase() === sym) : null;
    const foundOfficial = officialQuotes ? officialQuotes[sym] : null;

    const currentPrice = Number(
      foundInStocks?.currentPrice || 
      foundOfficial?.currentPrice || 
      item?.currentPrice || 
      100
    );

    const prevClose = Number(
      foundInStocks?.prevClose || 
      foundOfficial?.prevClose || 
      (currentPrice * 0.99)
    );

    const change = foundInStocks?.change !== undefined 
      ? Number(foundInStocks.change) 
      : (foundOfficial?.change !== undefined 
          ? Number(foundOfficial.change) 
          : Number((currentPrice - prevClose).toFixed(2)));

    const changePercent = foundInStocks?.changePercent !== undefined 
      ? Number(foundInStocks.changePercent) 
      : (foundOfficial?.changePercent !== undefined 
          ? Number(foundOfficial.changePercent) 
          : (prevClose > 0 ? Number((((currentPrice - prevClose) / prevClose) * 100).toFixed(2)) : 0));

    const target1 = Number(item?.target1 || (currentPrice * 1.10).toFixed(2));
    const target2 = Number(item?.target2 || (currentPrice * 1.18).toFixed(2));
    const stopLoss = Number(item?.stopLoss || (currentPrice * 0.95).toFixed(2));

    return {
      ...item,
      companyName: foundInStocks?.name || foundOfficial?.name || item?.companyName || sym,
      currentPrice,
      prevClose,
      change,
      changePercent,
      target1,
      target2,
      stopLoss
    };
  };

  const filtered = all.filter(r => {
    if (filterSignal !== 'ALL' && r.signal !== filterSignal) return false;
    if (filterSector !== 'ALL' && r.sector.toLowerCase() !== filterSector.toLowerCase()) return false;
    return true;
  });

  const sectors = Array.from(new Set(all.map(r => r.sector))).filter(Boolean);

  const getSignalBadge = (signal) => {
    switch (signal) {
      case 'STRONG_BUY':
        return {
          label: 'Strong Buy',
          className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 glow-emerald',
          icon: <TrendingUp className="w-3.5 h-3.5 mr-1" />
        };
      case 'ACCUMULATE':
        return {
          label: 'Accumulate on Dip',
          className: 'bg-teal-500/15 text-teal-300 border border-teal-500/30',
          icon: <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
        };
      case 'AVOID_SELL':
        return {
          label: 'Avoid / Take Profit',
          className: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 glow-rose',
          icon: <TrendingDown className="w-3.5 h-3.5 mr-1" />
        };
      default:
        return {
          label: 'Neutral / Hold',
          className: 'bg-gray-800 text-gray-300 border border-gray-700',
          icon: null
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Today's Evaluated PSX Recommendations (Darson Ready)
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              AI technical analysis, volume surge detection, and automated Stop Loss & Profit Targets.
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-900/90 p-1.5 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setFilterSignal('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterSignal === 'ALL' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({summary.total || all.length})
            </button>
            <button
              onClick={() => setFilterSignal('STRONG_BUY')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
                filterSignal === 'STRONG_BUY' ? 'bg-emerald-500 text-black shadow' : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <span>🚀 Strong Buy</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-bold">{summary.strongBuyCount || 0}</span>
            </button>
            <button
              onClick={() => setFilterSignal('ACCUMULATE')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
                filterSignal === 'ACCUMULATE' ? 'bg-teal-500 text-black shadow' : 'text-teal-400 hover:bg-teal-500/10'
              }`}
            >
              <span>📈 Accumulate</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-bold">{summary.accumulateCount || 0}</span>
            </button>
            <button
              onClick={() => setFilterSignal('AVOID_SELL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
                filterSignal === 'AVOID_SELL' ? 'bg-rose-500 text-white shadow' : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <span>🛑 Avoid / Exit</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-bold">{summary.avoidSellCount || 0}</span>
            </button>
          </div>
        </div>

        {/* Sector Filter Bar */}
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-800/80 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-semibold flex items-center shrink-0">
            <Filter className="w-3.5 h-3.5 mr-1" /> Sector:
          </span>
          <button
            onClick={() => setFilterSector('ALL')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 ${
              filterSector === 'ALL' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            All Sectors
          </button>
          {sectors.map(sec => (
            <button
              key={sec}
              onClick={() => setFilterSector(sec)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 ${
                filterSector === sec ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Pro Tier Banner if Free */}
      {!isPro && (
        <div className="bg-gradient-to-r from-amber-950/60 via-[#111827] to-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-amber-500/10">
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-300 block">
                Free Tier Mode: Previewing 2 Top AI Signals
              </span>
              <span className="text-[11px] text-gray-400">
                Upgrade to PSX Stockking Pro to unlock all 20+ algorithmic setups with exact entry zones and target calculations.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenUpgrade}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs cursor-pointer hover:opacity-90 shadow-md shadow-amber-500/20 shrink-0"
          >
            Upgrade to Pro (PKR 1,499)
          </button>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((rawItem, idx) => {
          const item = getLiveStock(rawItem);
          const badge = getSignalBadge(item.signal);
          const isBuy = item.signal === 'STRONG_BUY' || item.signal === 'ACCUMULATE';
          const isAvoid = item.signal === 'AVOID_SELL';
          const isUp = (item.change || 0) >= 0;
          const isLocked = !isPro && idx >= 2;

          if (isLocked) {
            return (
              <div
                key={item.symbol || idx}
                className="bg-[#111827]/80 border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between"
              >
                <div className="filter blur-sm select-none pointer-events-none opacity-40">
                  <div className="flex justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mono">{item.symbol}</h3>
                      <p className="text-xs text-gray-400">{item.sector}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
                      Strong Buy
                    </span>
                  </div>
                  <div className="bg-gray-900 p-3 rounded-xl mb-3">
                    <p className="text-lg font-bold text-white">PKR {item.currentPrice.toFixed(2)}</p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="bg-gray-800 p-1 rounded text-center text-xs">Entry</div>
                      <div className="bg-gray-800 p-1 rounded text-center text-xs">SL</div>
                      <div className="bg-gray-800 p-1 rounded text-center text-xs">Target</div>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-5 bg-[#070B12]/85 backdrop-blur-xs text-center space-y-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Pro VIP Signal Locked</h4>
                    <p className="text-[11px] text-gray-400 max-w-[220px]">
                      {item.symbol} algorithmic setup & target plan is reserved for Pro subscribers.
                    </p>
                  </div>
                  <button
                    onClick={onOpenUpgrade}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs cursor-pointer hover:opacity-90 shadow-md shadow-amber-500/20"
                  >
                    Unlock with Pro
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.symbol || idx}
              className={`bg-[#111827] border rounded-2xl p-5 shadow-xl transition-all hover:border-gray-700 flex flex-col justify-between ${
                isBuy ? 'border-emerald-500/20 hover:border-emerald-500/40' : (isAvoid ? 'border-rose-500/20 hover:border-rose-500/40' : 'border-gray-800')
              }`}
            >
              <div>
                {/* Card Header: Symbol, Name, Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-extrabold text-white tracking-tight mono">
                        {item.symbol}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-medium truncate max-w-[120px]">
                        {item.sector}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]" title={item.companyName}>
                      {item.companyName}
                    </p>
                  </div>
                  
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center ${badge.className}`}>
                    {badge.icon}
                    {badge.label}
                  </div>
                </div>

                {/* Price & Confidence Bar */}
                <div className="bg-gray-900/90 rounded-xl p-3 border border-gray-800/80 mb-3">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-[10px] uppercase text-gray-500 font-semibold">Current Live Price</span>
                      <p className="text-lg font-bold text-white mono flex items-center">
                        PKR {item.currentPrice.toFixed(2)}
                        <span className={`text-[11px] ml-1.5 font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ({isUp ? '+' : ''}{item.changePercent}%)
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-gray-500 font-semibold">AI Confidence</span>
                      <p className="text-sm font-bold text-emerald-400 mono">{item.confidence}%</p>
                    </div>
                  </div>

                  {/* Trade Setup Matrix (Entry, Stop Loss, Target) */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800 text-center">
                    <div className="bg-gray-800/40 rounded p-1.5">
                      <span className="text-[9px] uppercase text-gray-400 block font-semibold">Entry Zone</span>
                      <span className="text-xs font-bold text-gray-200 mono">
                        {item.entryZone?.min ? `${item.entryZone.min}-${item.entryZone.max}` : item.currentPrice}
                      </span>
                    </div>
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded p-1.5">
                      <span className="text-[9px] uppercase text-rose-400 block font-semibold flex items-center justify-center">
                        <StopCircle className="w-2.5 h-2.5 mr-0.5" /> Stop Loss
                      </span>
                      <span className="text-xs font-bold text-rose-400 mono">
                        PKR {item.stopLoss}
                      </span>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded p-1.5">
                      <span className="text-[9px] uppercase text-emerald-400 block font-semibold flex items-center justify-center">
                        <Target className="w-2.5 h-2.5 mr-0.5" /> Target 1
                      </span>
                      <span className="text-xs font-bold text-emerald-400 mono">
                        PKR {item.target1}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Risk-to-Reward & Darson Execution Plan */}
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex justify-between items-center bg-gray-800/30 px-2.5 py-1.5 rounded-lg">
                    <span className="text-gray-400">Risk : Reward Ratio:</span>
                    <span className="font-bold text-amber-400 mono">{item.riskReward || '1 : 2.5'}</span>
                  </div>

                  {/* Reasons / Catalyst */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Key Technical Catalysts:</span>
                    {item.reasons && item.reasons.slice(0, 2).map((r, rIdx) => (
                      <div key={rIdx} className="flex items-start text-[11px] text-gray-300 space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* News Sentiment Pill if exists */}
                  {item.newsSentimentImpact && item.newsSentimentImpact.sentiment !== 'NEUTRAL' && (
                    <div className={`p-2 rounded-lg text-[11px] flex items-start space-x-1.5 ${
                      item.newsSentimentImpact.sentiment === 'POSITIVE' 
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                    }`}>
                      <span className="font-bold shrink-0">📰 News Catalyst:</span>
                      <span className="truncate">{item.newsSentimentImpact.headline}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions: Order Calculator & Chart */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-800/80">
                <button
                  onClick={() => onOpenCalculator(item)}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Darson Calc</span>
                </button>
                <button
                  onClick={() => onSelectStock(item.symbol)}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-xs transition-all cursor-pointer"
                >
                  <LineChart className="w-3.5 h-3.5" />
                  <span>Chart & Intel</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

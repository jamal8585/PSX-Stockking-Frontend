
import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  StopCircle, 
  Calculator, 
  LineChart, 
  Filter, 
  Radio
} from 'lucide-react';

export default function NewsCatalystTradeHub({ news = [], newsList = [], onSelectStock, onOpenCalculator }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState('ALL');

  const categories = [
    { id: 'ALL', label: 'All Live News' },
    { id: 'OIL_GAS', label: 'Oil & Gas' },
    { id: 'COMMERCIAL_BANKS', label: 'Commercial Banks' },
    { id: 'TECHNOLOGY', label: 'Tech & IT' },
    { id: 'CEMENT', label: 'Cement' },
    { id: 'FERTILIZER', label: 'Fertilizer' },
    { id: 'AUTOMOBILE', label: 'Automobile' },
    { id: 'POWER_ENERGY', label: 'Power & Energy' },
    { id: 'PHARMACEUTICALS', label: 'Pharma' },
    { id: 'STEEL_ENGINEERING', label: 'Steel & Engineering' },
    { id: 'TEXTILE', label: 'Textiles' },
    { id: 'SUGAR_FOOD', label: 'Sugar & Food' },
    { id: 'MACRO_ECONOMY', label: 'Macro Economy' }
  ];

  const rawList = Array.isArray(news) && news.length > 0 ? news : (Array.isArray(newsList) ? newsList : []);

  const filtered = rawList.filter(n => {
    if (selectedCategory !== 'ALL' && n.category !== selectedCategory) return false;
    if (selectedSentiment !== 'ALL' && n.sentiment !== selectedSentiment) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter Matrix */}
      <div className="bg-gradient-to-b from-[#0F172A] to-[#0A0F1D] border border-cyan-900/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Real-Time Current Affairs & PSX Stock Impact Engine
                </h2>
                <span className="flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Radio className="w-3 h-3 mr-1 animate-pulse" /> LIVE STREAM
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Minute & hour-by-hour news with direct analysis of which PSX stocks will go <b>UP (Buy)</b> vs <b>DOWN (Sell/Avoid)</b>.
              </p>
            </div>
          </div>

          {/* Sentiment Filter Toggle */}
          <div className="flex items-center space-x-2 bg-[#060A12] p-1.5 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setSelectedSentiment('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedSentiment === 'ALL' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              All News ({newsList.length})
            </button>
            <button
              onClick={() => setSelectedSentiment('POSITIVE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                selectedSentiment === 'POSITIVE' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Bullish (UP)</span>
            </button>
            <button
              onClick={() => setSelectedSentiment('NEGATIVE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                selectedSentiment === 'NEGATIVE' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Bearish (DOWN)</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center space-x-2 mt-5 pt-4 border-t border-gray-800/80 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-bold flex items-center shrink-0">
            <Filter className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Sector:
          </span>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat.id 
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' 
                  : 'bg-gray-900/90 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main News + Stock Up/Down Catalyst Stream */}
      {filtered.length === 0 ? (
        <div className="bg-[#0D131F] border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
          <p>No news matching this filter. Click "All News" above to view latest feeds.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((item, idx) => {
            const isPositive = item.sentiment === 'POSITIVE';
            const upList = item.upStocks || (item.tradeSuggestions ? item.tradeSuggestions.filter(t => t.direction === 'UP' || t.action.startsWith('BUY')) : []);
            const downList = item.downStocks || (item.tradeSuggestions ? item.tradeSuggestions.filter(t => t.direction === 'DOWN' || t.action === 'SELL_EXIT') : []);

            return (
              <div
                key={idx}
                className="bg-[#0D131F] border border-cyan-950/70 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
              >
                {/* News Header & Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1 ${
                      isPositive 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                      {item.sentiment} CATALYST
                    </span>

                    <span className="px-2.5 py-1 rounded-md bg-gray-800/80 text-gray-300 font-bold">
                      {item.category?.replace('_', ' ')}
                    </span>

                    <span className="text-gray-400">
                      Source: <b className="text-gray-300">{item.source}</b>
                    </span>
                  </div>

                  {/* Minute / Hour Timestamp */}
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#070B12] border border-cyan-950 text-cyan-400 text-xs font-bold mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.timeAgo || 'Recent'}</span>
                  </div>
                </div>

                {/* Headline */}
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mb-2.5">
                  {item.title}
                </h3>

                {/* Narrative Summary */}
                <div className="bg-[#070B12]/90 rounded-xl p-3.5 border border-gray-800/80 text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                  <span className="font-bold text-cyan-400 mr-1.5">⚡ Economic & Market Impact:</span>
                  {item.impactSummary}
                </div>

                {/* ========================================================================= */}
                {/* SECTION 1: STOCKS EXPECTED TO GO UP (BULLISH GAINERS)                      */}
                {/* ========================================================================= */}
                {upList.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-500/20">
                      <div className="flex items-center space-x-2">
                        <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                        </span>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                          🟢 Stocks Expected To Go UP (Bullish Buy Targets)
                        </h4>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {upList.length} Bullish Setups
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {upList.map((trade, tIdx) => (
                        <div
                          key={tIdx}
                          className="bg-[#070B12] border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl p-4 shadow-xl flex flex-col justify-between transition-all"
                        >
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="text-xl font-extrabold text-white mono">{trade.symbol}</span>
                                <p className="text-[11px] text-gray-400 truncate max-w-[150px]">{trade.name}</p>
                              </div>
                              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-extrabold text-[10px] flex items-center shadow-md">
                                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 stroke-[3]" /> BULLISH SETUP
                              </span>
                            </div>

                            {/* Price Matrix */}
                            <div className="bg-[#0D131F] rounded-lg p-2 border border-gray-800/80 mb-2.5 flex justify-between items-center text-xs">
                              <div>
                                <span className="text-[9px] uppercase text-gray-400 block">Current Price</span>
                                <span className="text-sm font-extrabold text-white mono">PKR {trade.currentPrice}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] uppercase text-emerald-400 font-bold block">Target Sell Price</span>
                                <span className="text-sm font-extrabold text-emerald-400 mono">
                                  PKR {trade.targetSellPrice} (+{trade.expectedGainPct}%)
                                </span>
                              </div>
                            </div>

                            {/* Buy Trigger & Stop Loss */}
                            <div className="space-y-1 bg-[#0D131F]/60 p-2 rounded-lg border border-gray-800/60 mb-2.5 text-[11px]">
                              <div className="flex justify-between text-cyan-300">
                                <span>Entry Buy Zone:</span>
                                <b className="mono">PKR {trade.entryPriceMin} - {trade.entryPriceMax}</b>
                              </div>
                              <div className="flex justify-between text-rose-400">
                                <span>Stop Loss:</span>
                                <b className="mono">PKR {trade.stopLoss}</b>
                              </div>
                            </div>

                            <p className="text-[11px] text-gray-300 leading-tight bg-gray-900/40 p-2 rounded border border-gray-800/40 mb-3">
                              💡 {trade.tradeReason}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800 text-xs">
                            <button
                              onClick={() => onOpenCalculator({
                                symbol: trade.symbol,
                                companyName: trade.name,
                                currentPrice: trade.currentPrice,
                                stopLoss: trade.stopLoss,
                                target1: trade.targetSellPrice,
                                signal: 'BUY_NOW'
                              })}
                              className="py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-extrabold text-xs shadow cursor-pointer text-center"
                            >
                              Order Planner
                            </button>
                            <button
                              onClick={() => onSelectStock(trade.symbol)}
                              className="py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs cursor-pointer text-center"
                            >
                              Live Chart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SECTION 2: STOCKS EXPECTED TO GO DOWN (BEARISH DROPS / SELLS)             */}
                {/* ========================================================================= */}
                {downList.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-500/20">
                      <div className="flex items-center space-x-2">
                        <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
                          <ArrowDownRight className="w-4 h-4 stroke-[3]" />
                        </span>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-400">
                          🔴 Stocks Expected To Go DOWN (Bearish Sell / Avoid Alerts)
                        </h4>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {downList.length} Downside Warnings
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {downList.map((trade, tIdx) => (
                        <div
                          key={tIdx}
                          className="bg-[#070B12] border border-rose-500/30 hover:border-rose-500/60 rounded-xl p-4 shadow-xl flex flex-col justify-between transition-all"
                        >
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="text-xl font-extrabold text-white mono">{trade.symbol}</span>
                                <p className="text-[11px] text-gray-400 truncate max-w-[150px]">{trade.name}</p>
                              </div>
                              <span className="px-2.5 py-1 rounded-md bg-rose-500 text-white font-extrabold text-[10px] flex items-center shadow-md">
                                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 stroke-[3]" /> SELL / EXIT
                              </span>
                            </div>

                            {/* Price Matrix */}
                            <div className="bg-[#0D131F] rounded-lg p-2 border border-gray-800/80 mb-2.5 flex justify-between items-center text-xs">
                              <div>
                                <span className="text-[9px] uppercase text-gray-400 block">Current Price</span>
                                <span className="text-sm font-extrabold text-white mono">PKR {trade.currentPrice}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] uppercase text-rose-400 font-bold block">Downside Risk Level</span>
                                <span className="text-sm font-extrabold text-rose-400 mono">
                                  PKR {trade.targetSellPrice} ({trade.expectedGainPct}%)
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1 bg-[#0D131F]/60 p-2 rounded-lg border border-gray-800/60 mb-2.5 text-[11px]">
                              <div className="flex justify-between text-rose-300">
                                <span>Strict Stop Loss:</span>
                                <b className="mono">PKR {trade.stopLoss}</b>
                              </div>
                              <div className="flex justify-between text-gray-400">
                                <span>Action Advice:</span>
                                <b className="text-rose-400">Take Profit / Avoid Entry</b>
                              </div>
                            </div>

                            <p className="text-[11px] text-gray-300 leading-tight bg-gray-900/40 p-2 rounded border border-gray-800/40 mb-3">
                              ⚠️ {trade.tradeReason}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800 text-xs">
                            <button
                              onClick={() => onOpenCalculator({
                                symbol: trade.symbol,
                                companyName: trade.name,
                                currentPrice: trade.currentPrice,
                                stopLoss: trade.stopLoss,
                                target1: trade.targetSellPrice,
                                signal: 'SELL_EXIT'
                              })}
                              className="py-2 rounded-lg bg-gray-800 hover:bg-rose-500 hover:text-white text-gray-300 font-extrabold text-xs shadow cursor-pointer text-center"
                            >
                              Exit Planner
                            </button>
                            <button
                              onClick={() => onSelectStock(trade.symbol)}
                              className="py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs cursor-pointer text-center"
                            >
                              Live Chart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

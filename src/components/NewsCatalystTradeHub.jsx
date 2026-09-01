import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Radio
} from 'lucide-react';
import officialQuotes from '../data/official_quotes.json';

export default function NewsCatalystTradeHub({ 
  news = [], 
  newsList = [], 
  stocks = [], 
  onSelectStock, 
  onOpenCalculator 
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState('ALL');

  const getLiveTradeData = (trade) => {
    const sym = (trade?.symbol || '').toUpperCase().trim();
    const foundStock = Array.isArray(stocks) ? stocks.find(s => s.symbol?.toUpperCase() === sym) : null;
    const foundOfficial = officialQuotes ? officialQuotes[sym] : null;

    const currentPrice = Number(
      foundStock?.currentPrice || 
      foundOfficial?.currentPrice || 
      trade?.currentPrice || 
      100
    );

    const prevClose = Number(
      foundStock?.prevClose || 
      foundOfficial?.prevClose || 
      (currentPrice * 0.99)
    );

    const change = foundStock?.change !== undefined 
      ? Number(foundStock.change) 
      : (foundOfficial?.change !== undefined 
          ? Number(foundOfficial.change) 
          : Number((currentPrice - prevClose).toFixed(2)));

    const changePercent = foundStock?.changePercent !== undefined 
      ? Number(foundStock.changePercent) 
      : (foundOfficial?.changePercent !== undefined 
          ? Number(foundOfficial.changePercent) 
          : (prevClose > 0 ? Number((((currentPrice - prevClose) / prevClose) * 100).toFixed(2)) : 0));

    const targetSellPrice = Number((currentPrice * 1.115).toFixed(2));
    const stopLoss = Number((currentPrice * 0.95).toFixed(2));
    const entryPriceMin = Number((currentPrice * 0.985).toFixed(2));
    const entryPriceMax = Number((currentPrice * 1.01).toFixed(2));

    return {
      ...trade,
      name: foundStock?.name || foundOfficial?.name || trade?.name || sym,
      currentPrice: currentPrice.toFixed(2),
      targetSellPrice: targetSellPrice.toFixed(2),
      stopLoss: stopLoss.toFixed(2),
      entryPriceMin: entryPriceMin.toFixed(2),
      entryPriceMax: entryPriceMax.toFixed(2),
      expectedGainPct: (11.5).toFixed(1),
      change,
      changePercent
    };
  };

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
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-6 shadow-sm dark:shadow-md transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 border border-[#2563EB]/20 dark:border-[#3B82F6]/20 text-[#2563EB] dark:text-[#3B82F6]">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                  Real-Time Current Affairs & PSX Stock Impact Engine
                </h2>
                <span className="flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E] border border-[#16A34A]/20 dark:border-[#22C55E]/20">
                  <Radio className="w-3 h-3 mr-1 animate-pulse" /> LIVE STREAM
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Minute & hour-by-hour news with direct analysis of which PSX stocks will go <b>UP (Buy)</b> vs <b>DOWN (Sell/Avoid)</b>.
              </p>
            </div>
          </div>

          {/* Sentiment Filter Toggle */}
          <div className="flex items-center space-x-1.5 bg-[#F8FAFC] dark:bg-[#0B0F19] p-1 rounded-lg border border-[#E2E8F0] dark:border-[#243044] text-xs">
            <button
              onClick={() => setSelectedSentiment('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedSentiment === 'ALL' 
                  ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm' 
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              All News ({rawList.length})
            </button>
            <button
              onClick={() => setSelectedSentiment('POSITIVE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                selectedSentiment === 'POSITIVE' 
                  ? 'bg-[#16A34A] dark:bg-[#22C55E] text-white shadow-sm' 
                  : 'text-[#16A34A] dark:text-[#22C55E] hover:bg-[#16A34A]/10'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Bullish (UP)</span>
            </button>
            <button
              onClick={() => setSelectedSentiment('NEGATIVE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                selectedSentiment === 'NEGATIVE' 
                  ? 'bg-[#DC2626] dark:bg-[#EF4444] text-white shadow-sm' 
                  : 'text-[#DC2626] dark:text-[#EF4444] hover:bg-[#DC2626]/10'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Bearish (DOWN)</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center space-x-1.5 mt-5 pt-4 border-t border-[#E2E8F0] dark:border-[#243044] overflow-x-auto pb-1 text-xs">
          <span className="text-[#64748B] dark:text-[#94A3B8] font-bold flex items-center shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 mr-1 text-[#2563EB] dark:text-[#3B82F6]" /> Sector:
          </span>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat.id 
                  ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm' 
                  : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main News + Stock Up/Down Catalyst Stream */}
      {filtered.length === 0 ? (
        <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-12 text-center text-[#64748B] dark:text-[#94A3B8]">
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
                className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-6 shadow-sm dark:shadow-md transition-all space-y-4"
              >
                {/* News Header & Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 border ${
                      isPositive 
                        ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20 dark:bg-[#22C55E]/10 dark:text-[#22C55E] dark:border-[#22C55E]/20' 
                        : 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20 dark:bg-[#EF4444]/10 dark:text-[#EF4444] dark:border-[#EF4444]/20'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                      {item.sentiment} CATALYST
                    </span>

                    <span className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044] font-bold">
                      {item.category?.replace('_', ' ')}
                    </span>

                    <span className="text-[#64748B] dark:text-[#94A3B8]">
                      Source: <b className="text-[#0F172A] dark:text-[#F8FAFC]">{item.source}</b>
                    </span>
                  </div>

                  {/* Minute / Hour Timestamp */}
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-[#2563EB] dark:text-[#3B82F6] text-xs font-bold mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.timeAgo || 'Recent'}</span>
                  </div>
                </div>

                {/* Headline */}
                <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                  {item.title}
                </h3>

                {/* Narrative Summary */}
                <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-3.5 border border-[#E2E8F0] dark:border-[#243044] text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
                  <span className="font-bold text-[#2563EB] dark:text-[#3B82F6] mr-1.5">⚡ Economic & Market Impact:</span>
                  {item.impactSummary}
                </div>

                {/* ========================================================================= */}
                {/* SECTION 1: STOCKS EXPECTED TO GO UP (BULLISH GAINERS)                      */}
                {/* ========================================================================= */}
                {upList.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0] dark:border-[#243044]">
                      <div className="flex items-center space-x-2">
                        <span className="p-1 rounded-lg bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E]">
                          <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#16A34A] dark:text-[#22C55E]">
                          🟢 Stocks Expected To Go UP (Bullish Buy Targets)
                        </h4>
                      </div>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">
                        {upList.length} Bullish Setups
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {upList.map((rawTrade, tIdx) => {
                        const trade = getLiveTradeData(rawTrade);
                        const isUp = (trade.change || 0) >= 0;

                        return (
                          <div
                            key={tIdx}
                            className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] hover:border-[#2563EB] dark:hover:border-[#3B82F6] rounded-xl p-4 shadow-sm flex flex-col justify-between transition-all"
                          >
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <span className="text-xl font-black text-[#0F172A] dark:text-[#F8FAFC] mono">{trade.symbol}</span>
                                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate max-w-[150px]">{trade.name}</p>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E] border border-[#16A34A]/20 dark:border-[#22C55E]/20 font-bold text-[10px] flex items-center">
                                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 stroke-[3]" /> BULLISH SETUP
                                </span>
                              </div>

                              {/* Price Matrix */}
                              <div className="bg-[#FFFFFF] dark:bg-[#151E2E] rounded-lg p-2.5 border border-[#E2E8F0] dark:border-[#243044] mb-2.5 flex justify-between items-center text-xs">
                                <div>
                                  <span className="text-[9px] uppercase text-[#64748B] dark:text-[#94A3B8] block font-bold">Current Live Price</span>
                                  <span className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mono flex items-center">
                                    PKR {trade.currentPrice}
                                    <span className={`text-[10px] ml-1.5 font-bold ${isUp ? (isLightColor => 'text-[#16A34A] dark:text-[#22C55E]')() : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
                                      ({isUp ? '+' : ''}{trade.changePercent}%)
                                    </span>
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] uppercase text-[#16A34A] dark:text-[#22C55E] font-bold block">Target Sell Price</span>
                                  <span className="text-sm font-bold text-[#16A34A] dark:text-[#22C55E] mono">
                                    PKR {trade.targetSellPrice} (+{trade.expectedGainPct}%)
                                  </span>
                                </div>
                              </div>

                              {/* Buy Trigger & Stop Loss */}
                              <div className="space-y-1 bg-[#FFFFFF] dark:bg-[#151E2E] p-2 rounded-lg border border-[#E2E8F0] dark:border-[#243044] mb-2.5 text-[11px]">
                                <div className="flex justify-between text-[#2563EB] dark:text-[#3B82F6]">
                                  <span>Entry Buy Zone:</span>
                                  <b className="mono">PKR {trade.entryPriceMin} - {trade.entryPriceMax}</b>
                                </div>
                                <div className="flex justify-between text-[#DC2626] dark:text-[#EF4444]">
                                  <span>Stop Loss:</span>
                                  <b className="mono">PKR {trade.stopLoss}</b>
                                </div>
                              </div>

                              <p className="text-[11px] text-[#0F172A] dark:text-[#F8FAFC] leading-tight bg-[#FFFFFF] dark:bg-[#151E2E] p-2 rounded-lg border border-[#E2E8F0] dark:border-[#243044] mb-3">
                                💡 {trade.tradeReason}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#243044] text-xs">
                              <button
                                onClick={() => onOpenCalculator({
                                  symbol: trade.symbol,
                                  companyName: trade.name,
                                  currentPrice: Number(trade.currentPrice),
                                  stopLoss: Number(trade.stopLoss),
                                  target1: Number(trade.targetSellPrice),
                                  signal: 'BUY_NOW'
                                })}
                                className="py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs shadow-sm cursor-pointer text-center"
                              >
                                Order Planner
                              </button>
                              <button
                                onClick={() => onSelectStock(trade.symbol)}
                                className="py-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#243044] text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs border border-[#E2E8F0] dark:border-[#243044] cursor-pointer text-center"
                              >
                                Live Chart
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SECTION 2: STOCKS EXPECTED TO GO DOWN (BEARISH DROPS / SELLS)             */}
                {/* ========================================================================= */}
                {downList.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0] dark:border-[#243044]">
                      <div className="flex items-center space-x-2">
                        <span className="p-1 rounded-lg bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#EF4444]/10 dark:text-[#EF4444]">
                          <ArrowDownRight className="w-4 h-4 stroke-[3]" />
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#DC2626] dark:text-[#EF4444]">
                          🔴 Stocks Expected To Go DOWN (Bearish Sell / Avoid Alerts)
                        </h4>
                      </div>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">
                        {downList.length} Downside Warnings
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {downList.map((rawTrade, tIdx) => {
                        const trade = getLiveTradeData(rawTrade);
                        const isUp = (trade.change || 0) >= 0;

                        return (
                          <div
                            key={tIdx}
                            className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] hover:border-[#DC2626] dark:hover:border-[#EF4444] rounded-xl p-4 shadow-sm flex flex-col justify-between transition-all"
                          >
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <span className="text-xl font-black text-[#0F172A] dark:text-[#F8FAFC] mono">{trade.symbol}</span>
                                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate max-w-[150px]">{trade.name}</p>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-[#DC2626] text-white font-bold text-[10px] flex items-center shadow-sm">
                                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 stroke-[3]" /> SELL / EXIT
                                </span>
                              </div>

                              {/* Price Matrix */}
                              <div className="bg-[#FFFFFF] dark:bg-[#151E2E] rounded-lg p-2.5 border border-[#E2E8F0] dark:border-[#243044] mb-2.5 flex justify-between items-center text-xs">
                                <div>
                                  <span className="text-[9px] uppercase text-[#64748B] dark:text-[#94A3B8] block font-bold">Current Live Price</span>
                                  <span className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mono flex items-center">
                                    PKR {trade.currentPrice}
                                    <span className={`text-[10px] ml-1.5 font-bold ${isUp ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
                                      ({isUp ? '+' : ''}{trade.changePercent}%)
                                    </span>
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] uppercase text-[#DC2626] dark:text-[#EF4444] font-bold block">Downside Risk Level</span>
                                  <span className="text-sm font-bold text-[#DC2626] dark:text-[#EF4444] mono">
                                    PKR {trade.targetSellPrice} (-{trade.expectedGainPct}%)
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1 bg-[#FFFFFF] dark:bg-[#151E2E] p-2 rounded-lg border border-[#E2E8F0] dark:border-[#243044] mb-2.5 text-[11px]">
                                <div className="flex justify-between text-[#DC2626] dark:text-[#EF4444]">
                                  <span>Strict Stop Loss:</span>
                                  <b className="mono">PKR {trade.stopLoss}</b>
                                </div>
                                <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8]">
                                  <span>Action Advice:</span>
                                  <b className="text-[#DC2626] dark:text-[#EF4444]">Take Profit / Avoid Entry</b>
                                </div>
                              </div>

                              <p className="text-[11px] text-[#0F172A] dark:text-[#F8FAFC] leading-tight bg-[#FFFFFF] dark:bg-[#151E2E] p-2 rounded-lg border border-[#E2E8F0] dark:border-[#243044] mb-3">
                                ⚠️ {trade.tradeReason}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#243044] text-xs">
                              <button
                                onClick={() => onOpenCalculator({
                                  symbol: trade.symbol,
                                  companyName: trade.name,
                                  currentPrice: Number(trade.currentPrice),
                                  stopLoss: Number(trade.stopLoss),
                                  target1: Number(trade.targetSellPrice),
                                  signal: 'SELL_EXIT'
                                })}
                                className="py-2 rounded-lg bg-[#DC2626]/10 hover:bg-[#DC2626] text-[#DC2626] hover:text-white font-bold text-xs border border-[#DC2626]/30 cursor-pointer text-center transition-colors"
                              >
                                Exit Planner
                              </button>
                              <button
                                onClick={() => onSelectStock(trade.symbol)}
                                className="py-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#243044] text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs border border-[#E2E8F0] dark:border-[#243044] cursor-pointer text-center"
                              >
                                Live Chart
                              </button>
                            </div>
                          </div>
                        );
                      })}
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

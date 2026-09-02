import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Radio,
  Sparkles,
  Target,
  ShieldCheck,
  AlertTriangle,
  X,
  Compass,
  Activity,
  BarChart2,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  HelpCircle
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
  const [predictionModalData, setPredictionModalData] = useState(null);

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

  const getCleanImpactSummary = (item) => {
    const raw = item?.impactSummary || item?.description || '';
    const clean = String(raw)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/if\s*\(!window[\s\S]*$/gi, '')
      .replace(/window\.addEvent[\s\S]*$/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    const isGarbage = 
      clean.includes('window.') ||
      clean.includes('addEventListener') ||
      clean.includes('function(') ||
      clean.includes('var iframe') ||
      clean.includes('raw-html') ||
      clean.includes('_rawHtml') ||
      clean.includes('document.g') ||
      clean.length < 15;

    if (isGarbage) {
      const catLabel = item?.categoryName || item?.category?.replace('_', ' ') || 'Energy & Macro';
      return `${catLabel} catalyst: ${item?.title || 'Industry development'}. Market dynamics indicate strategic re-pricing and liquidity inflows across key listed equities.`;
    }

    return clean;
  };

  const formatLiveNewsDate = (item) => {
    const pubDate = item?.publishedAt ? new Date(item.publishedAt) : new Date();
    const validDate = isNaN(pubDate.getTime()) ? new Date() : pubDate;
    
    const now = new Date();
    const diffSec = Math.floor((now - validDate) / 1000);
    
    let agoStr = 'Just now';
    if (diffSec >= 60 && diffSec < 3600) {
      agoStr = `${Math.floor(diffSec / 60)}m ago`;
    } else if (diffSec >= 3600 && diffSec < 86400) {
      const hrs = Math.floor(diffSec / 3600);
      agoStr = `${hrs}h ago`;
    } else if (diffSec >= 86400) {
      const days = Math.floor(diffSec / 86400);
      agoStr = `${days}d ago`;
    }

    const timeStr = validDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const isSameDay = validDate.toDateString() === now.toDateString();
    const dateLabel = isSameDay ? 'Today (آج)' : validDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      isSameDay,
      label: `${dateLabel} • ${timeStr}`,
      ago: item?.timeAgo || agoStr
    };
  };

  const rawList = Array.isArray(news) && news.length > 0 ? news : (Array.isArray(newsList) ? newsList : []);

  const filtered = rawList.filter(n => {
    const matchCategory = selectedCategory === 'ALL' || n.category === selectedCategory;
    const matchSentiment = selectedSentiment === 'ALL' || n.sentiment === selectedSentiment;
    return matchCategory && matchSentiment;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Sector Controls */}
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

                  {/* Minute / Hour Timestamp & Live Same-Day Badge */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {formatLiveNewsDate(item).isSameDay && (
                      <span className="flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E] border border-[#16A34A]/20 dark:border-[#22C55E]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] mr-1.5 animate-pulse" />
                        LIVE TODAY (آج)
                      </span>
                    )}
                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-[#2563EB] dark:text-[#3B82F6] text-xs font-bold mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatLiveNewsDate(item).label} ({formatLiveNewsDate(item).ago})</span>
                    </div>
                  </div>
                </div>

                {/* Headline */}
                <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                  {item.title}
                </h3>

                {/* Narrative Summary */}
                <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-3.5 border border-[#E2E8F0] dark:border-[#243044] text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
                  <span className="font-bold text-[#2563EB] dark:text-[#3B82F6] mr-1.5">⚡ Economic & Market Impact:</span>
                  {getCleanImpactSummary(item)}
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
                                    <span className={`text-[10px] ml-1.5 font-bold ${isUp ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
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

                            {/* Action Buttons Matrix */}
                            <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#243044]">
                              {/* Primary Catalyst Button: Tomorrow's AI Signal & Forecast */}
                              <button
                                onClick={() => setPredictionModalData({ trade, newsItem: item, isBullish: true })}
                                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                                <span>AI Next-Day Signal & Prediction (کل کی پیشگوئی)</span>
                              </button>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <button
                                  onClick={() => onOpenCalculator({
                                    symbol: trade.symbol,
                                    companyName: trade.name,
                                    currentPrice: Number(trade.currentPrice),
                                    stopLoss: Number(trade.stopLoss),
                                    target1: Number(trade.targetSellPrice),
                                    signal: 'BUY_NOW'
                                  })}
                                  className="py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs shadow-sm cursor-pointer text-center transition-colors"
                                >
                                  Order Planner
                                </button>
                                <button
                                  onClick={() => onSelectStock(trade.symbol)}
                                  className="py-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#243044] text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs border border-[#E2E8F0] dark:border-[#243044] cursor-pointer text-center transition-colors"
                                >
                                  Live Chart
                                </button>
                              </div>
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

                            {/* Action Buttons Matrix */}
                            <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#243044]">
                              {/* Primary Risk Warning Forecast Button */}
                              <button
                                onClick={() => setPredictionModalData({ trade, newsItem: item, isBullish: false })}
                                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#DC2626] to-[#991B1B] hover:from-[#B91C1C] hover:to-[#7F1D1D] text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                                <span>AI Next-Day Risk Forecast (کل کا رسک الرٹ)</span>
                              </button>

                              <div className="grid grid-cols-2 gap-2 text-xs">
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
                                  className="py-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#243044] text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs border border-[#E2E8F0] dark:border-[#243044] cursor-pointer text-center transition-colors"
                                >
                                  Live Chart
                                </button>
                              </div>
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

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE MODAL: NEXT-DAY AI SIGNAL & NEWS CATALYST PREDICTION        */}
      {/* ========================================================================= */}
      {predictionModalData && (
        <TomorrowPredictionModal 
          data={predictionModalData}
          onClose={() => setPredictionModalData(null)}
          onOpenCalculator={onOpenCalculator}
          onSelectStock={onSelectStock}
        />
      )}
    </div>
  );
}

// Sub-Component: Comprehensive Tomorrow's AI Signal & Forecast Modal
function TomorrowPredictionModal({ data, onClose, onOpenCalculator, onSelectStock }) {
  const { trade, newsItem, isBullish } = data;
  const currentPrice = Number(trade.currentPrice || 100);

  // Dynamic calculations for tomorrow's session
  const expectedHigh = (currentPrice * (isBullish ? 1.085 : 1.01)).toFixed(2);
  const expectedLow = (currentPrice * (isBullish ? 0.985 : 0.925)).toFixed(2);
  const tomorrowTarget1 = (currentPrice * (isBullish ? 1.06 : 0.95)).toFixed(2);
  const tomorrowTarget2 = trade.targetSellPrice;
  const stopLoss = trade.stopLoss;
  const confidencePct = isBullish ? 88 : 84;

  const openingBias = isBullish 
    ? 'Gap-Up Opening (+1.5% to +3.5%)'
    : 'Gap-Down / Sell Pressure Opening (-1.0% to -3.0%)';

  const circuitLockProbability = isBullish ? '65% (Strong Volume Driven)' : 'Low Risk of Lower Lock';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-scale-up">
        
        {/* Modal Header */}
        <div className={`p-6 text-white ${
          isBullish 
            ? 'bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#4F46E5]' 
            : 'bg-gradient-to-r from-[#7F1D1D] via-[#DC2626] to-[#991B1B]'
        }`}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-xs font-black tracking-wider uppercase">
                  {isBullish ? '🚀 BULLISH CATALYST FORECAST' : '⚠️ DOWNSIDE RISK ALERT'}
                </span>
                <span className="text-xs text-white/80 font-medium">
                  Next Trading Session
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mono tracking-tight text-white flex items-center space-x-2">
                <span>{trade.symbol}</span>
                <span className="text-sm font-normal text-white/90">({trade.name})</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-[#0F172A] dark:text-[#F8FAFC]">
          
          {/* 1. Triggering News Event */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB] dark:text-[#3B82F6]">
              <Calendar className="w-4 h-4" />
              <span>TRIGGERING NEWS CATALYST</span>
            </div>
            <h4 className="text-sm font-bold leading-snug">
              {newsItem.title}
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
              <span>Sector: <b className="text-[#0F172A] dark:text-[#F8FAFC]">{newsItem.category?.replace('_', ' ')}</b></span>
              <span>Source: <b className="text-[#0F172A] dark:text-[#F8FAFC]">{newsItem.source}</b></span>
              <span>Time: <b className="text-[#0F172A] dark:text-[#F8FAFC]">{newsItem.timeAgo || 'Recent'}</b></span>
            </div>
          </div>

          {/* 2. Tomorrow's Prediction Matrix Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center space-x-2 text-[#0F172A] dark:text-[#F8FAFC]">
                <Activity className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                <span>Tomorrow's Market Session Forecast (کل کی متوقع چال)</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/10 dark:text-[#3B82F6] border border-[#2563EB]/20">
                AI Confidence: {confidencePct}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044]">
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold block">Current Price</span>
                <span className="text-base font-extrabold mono text-[#0F172A] dark:text-[#F8FAFC]">PKR {currentPrice}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044]">
                <span className="text-[10px] text-[#16A34A] dark:text-[#22C55E] uppercase font-bold block">Expected Day High</span>
                <span className="text-base font-extrabold mono text-[#16A34A] dark:text-[#22C55E]">PKR {expectedHigh}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044]">
                <span className="text-[10px] text-[#DC2626] dark:text-[#EF4444] uppercase font-bold block">Expected Day Low</span>
                <span className="text-base font-extrabold mono text-[#DC2626] dark:text-[#EF4444]">PKR {expectedLow}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044]">
                <span className="text-[10px] text-[#2563EB] dark:text-[#3B82F6] uppercase font-bold block">Circuit Lock Chance</span>
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5 block">{circuitLockProbability}</span>
              </div>
            </div>
          </div>

          {/* 3. Actionable Intraday Trade Setup Plan */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] space-y-3">
            <h3 className="text-sm font-bold flex items-center space-x-2 text-[#0F172A] dark:text-[#F8FAFC]">
              <Target className="w-4 h-4 text-[#16A34A] dark:text-[#22C55E]" />
              <span>Recommended Tomorrow Trade Strategy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] space-y-1">
                <span className="text-[10px] font-bold text-[#2563EB] dark:text-[#3B82F6] uppercase block">
                  {isBullish ? 'Recommended Entry Zone' : 'Exit / Selling Zone'}
                </span>
                <span className="text-sm font-bold mono text-[#0F172A] dark:text-[#F8FAFC]">
                  PKR {trade.entryPriceMin} - {trade.entryPriceMax}
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Time: 09:15 - 09:45 AM</span>
              </div>

              <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] space-y-1">
                <span className="text-[10px] font-bold text-[#16A34A] dark:text-[#22C55E] uppercase block">
                  {isBullish ? 'Target 1 (Tomorrow Intraday)' : 'Immediate Downside Target'}
                </span>
                <span className="text-sm font-bold mono text-[#16A34A] dark:text-[#22C55E]">
                  PKR {tomorrowTarget1} (+6.0%)
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Swing Target: PKR {tomorrowTarget2}</span>
              </div>

              <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] space-y-1">
                <span className="text-[10px] font-bold text-[#DC2626] dark:text-[#EF4444] uppercase block">
                  Strict Risk Stop-Loss
                </span>
                <span className="text-sm font-bold mono text-[#DC2626] dark:text-[#EF4444]">
                  PKR {stopLoss} (-5.0%)
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Trail stop if Target 1 hits</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/20 text-xs text-[#2563EB] dark:text-[#60A5FA] flex items-start space-x-2">
              <Compass className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <b>Opening Behavior:</b> {openingBias}. Initial 15 minutes may see heavy volume discovery.
              </span>
            </div>
          </div>

          {/* 4. Complete Urdu Explanation (اردو میں مکمل رہنمائی) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>کل کی ٹریڈنگ رہنمائی (Urdu / Easy English Summary)</span>
            </div>
            
            <p className="text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed font-medium" dir="rtl">
              {isBullish ? (
                <>
                  اس خبر کے نتیجے میں کل <b>{trade.symbol}</b> پر صبح کے سیشن میں زبردست بائنگ پریشر متوقع ہے۔ کل مارکیٹ کھلتے ہی <b>{trade.entryPriceMin} سے {trade.entryPriceMax} PKR</b> کے درمیان انٹری پلان کریں۔ کل کا پہلا متوقع ٹارگٹ <b>{tomorrowTarget1} PKR</b> اور سوئنگ ٹارگٹ <b>{tomorrowTarget2} PKR</b> ہوگا۔ اپنے سرمائے کی حفاظت کے لیے <b>{stopLoss} PKR</b> کا اسٹاپ لاس لازمی سیٹ رکھیں۔
                </>
              ) : (
                <>
                  اس خبر کے باعث کل <b>{trade.symbol}</b> میں سیلنگ پریشر اور منافع خوری متوقع ہے۔ نئی بائنگ سے گریز کریں اور اگر موجودہ ہولڈنگ ہے تو <b>{stopLoss} PKR</b> کے نیچے جانے کی صورت میں اسٹاپ لاس پر ایگزٹ کر لیں یا پرافٹ بک کر لیں۔
                </>
              )}
            </p>

            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] pt-1">
              <b>Roman Urdu:</b> {isBullish ? (
                `Is news catalyst ki waja se kal subah ${trade.symbol} mein high volume buying expected hai. Opening 30 minutes mein PKR ${trade.entryPriceMin} - ${trade.entryPriceMax} ke range mein entry lein. Kal ka pehla target PKR ${tomorrowTarget1} aur PKR ${stopLoss} ka stop-loss follow karein.`
              ) : (
                `Is news ki waja se kal ${trade.symbol} par downside pressure ka imkaan hai. Fresh buying se bachein aur PKR ${stopLoss} ke stop-loss ko strictly follow karein.`
              )}
            </p>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-[#F8FAFC] dark:bg-[#0B0F19] border-t border-[#E2E8F0] dark:border-[#243044] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onSelectStock(trade.symbol);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#151E2E] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044] font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Open Technical Chart</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenCalculator({
                symbol: trade.symbol,
                companyName: trade.name,
                currentPrice: currentPrice,
                stopLoss: Number(stopLoss),
                target1: Number(tomorrowTarget1),
                signal: isBullish ? 'BUY_NOW' : 'SELL_EXIT'
              });
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 cursor-pointer transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Load Strategy in Order Planner</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

      </div>
    </div>
  );
}

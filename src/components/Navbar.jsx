import React, { useMemo } from 'react';
import { 
  RefreshCw, 
  Bookmark, 
  Sparkles, 
  Zap, 
  Radio, 
  Terminal, 
  Timer, 
  Briefcase, 
  Lock, 
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import officialQuotes from '../data/official_quotes.json';

const POPULAR_SYMBOLS = [
  'CNERGY', 'PRL', 'WAVESAPPR', 'BOP', 'OGDC', 'PPL', 'SYS', 'MARI', 'LUCK', 
  'FFC', 'PSO', 'MEBL', 'HUBC', 'EFERT', 'ENGRO', 'SAZEW', 'INDU', 'MLCF', 
  'CHCC', 'MUGHAL', 'ILP', 'NATF', 'TOMCL', 'WTL', 'TELE', 'ATRL', 'NRL', 
  'MCB', 'HBL', 'UBL', 'BAFL', 'BAHL', 'DGKC', 'FCCL', 'KAPCO', 'KEL', 
  'AGP', 'SEARL', 'ABOT', 'ISL', 'INIL'
];

export default function Navbar({ 
  marketSummary, 
  stocks = [],
  onRunScan, 
  isScanning, 
  watchlistCount, 
  portfolioCount = 0,
  onOpenWatchlist, 
  activeTab, 
  setActiveTab,
  countdown = 5
}) {
  const kse = (marketSummary?.currentValue || marketSummary?.current) 
    ? Number(marketSummary.currentValue || marketSummary.current).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
    : '177,783.65';
  const change = marketSummary?.change !== undefined ? Number(marketSummary.change) : 807.98;
  const changePct = marketSummary?.changePercent !== undefined ? Number(marketSummary.changePercent) : 0.46;
  const isPositive = change >= 0;
  const marketStatus = marketSummary?.marketStatus || { isOpen: true, statusText: 'LIVE PSX DPS', sessionNote: 'Real-time Telemetry' };

  // Dynamically compute live ticker items from real-time stocks and official quotes
  const tickerItems = useMemo(() => {
    const stockMap = new Map();
    if (officialQuotes && typeof officialQuotes === 'object') {
      Object.values(officialQuotes).forEach(q => {
        if (q?.symbol) stockMap.set(q.symbol.toUpperCase().trim(), q);
      });
    }
    if (Array.isArray(stocks)) {
      stocks.forEach(s => {
        if (s?.symbol && Number(s.currentPrice) > 0) {
          const symKey = s.symbol.toUpperCase().trim();
          stockMap.set(symKey, { ...stockMap.get(symKey), ...s });
        }
      });
    }

    return POPULAR_SYMBOLS.map(sym => {
      const item = stockMap.get(sym);
      const price = Number(item?.currentPrice || 100);
      const prevClose = Number(item?.prevClose || price);
      const diff = item?.change !== undefined ? Number(item.change) : Number((price - prevClose).toFixed(2));
      const pct = item?.changePercent !== undefined 
        ? Number(item.changePercent) 
        : (prevClose > 0 ? Number((((price - prevClose) / prevClose) * 100).toFixed(2)) : 0);
      const isPos = diff >= 0;

      return {
        symbol: sym,
        price: price.toFixed(2),
        change: `${isPos ? '+' : ''}${pct.toFixed(2)}%`,
        isPos
      };
    });
  }, [stocks]);

  return (
    <header className="sticky top-0 z-40 bg-[#070B12]/95 backdrop-blur-xl border-b border-cyan-950/60 shadow-2xl">
      {/* 1. Infinitely Scrolling Live Moving Ticker Tape */}
      <div className="bg-[#04070D] border-b border-gray-900/90 px-3 py-1.5 flex items-center justify-between text-[11px] text-gray-400 overflow-hidden">
        {/* Status Indicator */}
        <div className="flex items-center space-x-2 shrink-0 z-10 pr-2">
          {marketStatus.isOpen ? (
            <span className="flex items-center text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <Radio className="w-3 h-3 mr-1 text-emerald-400 animate-pulse" /> LIVE SESSION (09:30 - 15:30 PKT)
            </span>
          ) : (
            <span className="flex items-center text-cyan-400 font-extrabold text-[10px] uppercase tracking-wider bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/60">
              <Lock className="w-3 h-3 mr-1 text-cyan-400" /> {marketStatus.statusText} • CLOSING RATES
            </span>
          )}
        </div>

        {/* Live Moving Ticker Marquee Container */}
        <div className="flex-1 overflow-hidden relative mx-2">
          <div className="animate-marquee flex items-center space-x-8 text-[11px]">
            {/* Set 1 */}
            <span className="mono font-bold">
              KSE-100: <b className="text-white">{kse}</b>{' '}
              <span className={isPositive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {isPositive ? '+' : ''}{changePct}%
              </span>
            </span>

            {tickerItems.map((item) => (
              <span key={`t1-${item.symbol}`} className="mono font-bold flex items-center space-x-1">
                <span className="text-gray-300">{item.symbol}:</span>
                <b className="text-white">{item.price}</b>
                <span className={item.isPos ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {item.change}
                </span>
              </span>
            ))}

            {/* Set 2 (Duplicate for Seamless Marquee Loop) */}
            <span className="mono font-bold">
              KSE-100: <b className="text-white">{kse}</b>{' '}
              <span className={isPositive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {isPositive ? '+' : ''}{changePct}%
              </span>
            </span>

            {tickerItems.map((item) => (
              <span key={`t2-${item.symbol}`} className="mono font-bold flex items-center space-x-1">
                <span className="text-gray-300">{item.symbol}:</span>
                <b className="text-white">{item.price}</b>
                <span className={item.isPos ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {item.change}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Countdown */}
        <div className="hidden sm:flex items-center space-x-1.5 shrink-0 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-[10px] mono font-bold z-10 ml-2">
          <Timer className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>Auto-Sync in: <b className="text-white">{countdown}s</b></span>
        </div>
      </div>

      {/* 2. Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#070B12] rounded-[10px] flex items-center justify-center">
                <Terminal className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white tracking-tight bg-gradient-to-r from-white via-gray-200 to-cyan-200 bg-clip-text text-transparent">
                  PSX ALPHA TERMINAL
                </span>
                <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 tracking-wider">
                  OFFICIAL DPS
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">Official PSX DPS Rates • Live Market Intelligence & Signals</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#0D131F]/90 p-1.5 rounded-xl border border-gray-800/80">
            <button
              onClick={() => setActiveTab('news')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'news' 
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-black shadow-lg shadow-cyan-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ All Sectors News & Catalysts</span>
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'portfolio' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>💼 My Portfolio ({portfolioCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'recommendations' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg shadow-emerald-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>🎯 Daily AI Signals</span>
            </button>

            <button
              onClick={() => setActiveTab('screener')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'screener' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <span>📊 Full PSX Screener</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenWatchlist}
              className="relative p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 hover:border-cyan-500/40 text-gray-300 hover:text-white transition-all cursor-pointer"
              title="View Watchlist"
            >
              <Bookmark className="w-4 h-4" />
              {watchlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                  {watchlistCount}
                </span>
              )}
            </button>

            <button
              onClick={onRunScan}
              disabled={isScanning}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-90 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning PSX...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-gray-800 text-[11px]">
          <button
            onClick={() => setActiveTab('news')}
            className={`px-2.5 py-1.5 rounded-lg font-bold ${activeTab === 'news' ? 'bg-cyan-500 text-black' : 'text-gray-400'}`}
          >
            ⚡ News
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-2.5 py-1.5 rounded-lg font-bold ${activeTab === 'portfolio' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}
          >
            💼 Portfolio
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-2.5 py-1.5 rounded-lg font-bold ${activeTab === 'recommendations' ? 'bg-emerald-500 text-black' : 'text-gray-400'}`}
          >
            🎯 AI Signals
          </button>
          <button
            onClick={() => setActiveTab('screener')}
            className={`px-2.5 py-1.5 rounded-lg font-bold ${activeTab === 'screener' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}
          >
            📊 Screener
          </button>
        </div>
      </div>
    </header>
  );
}
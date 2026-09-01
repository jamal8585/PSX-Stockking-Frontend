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
  Crown,
  Sun,
  Moon,
  BarChart3
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
  countdown = 5,
  currentUser,
  onOpenAuth,
  onOpenUpgrade,
  onOpenAdmin,
  onLogout,
  theme = 'dark',
  onToggleTheme
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

  const isPro = currentUser?.plan === 'PRO' && currentUser?.subscriptionStatus === 'ACTIVE';
  const isAdmin = currentUser?.role === 'ADMIN';
  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-40 transition-colors ${
      isLight 
        ? 'bg-white/95 text-slate-900 border-b border-slate-200 shadow-md' 
        : 'bg-[#070B12]/95 text-gray-100 border-b border-cyan-950/60 shadow-2xl backdrop-blur-xl'
    }`}>
      {/* 1. Infinitely Scrolling Live Moving Ticker Tape */}
      <div className={`px-4 py-1.5 flex items-center justify-between text-[11px] overflow-hidden border-b ${
        isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-[#04070D] text-gray-400 border-gray-900/90'
      }`}>
        {/* Status Indicator */}
        <div className="flex items-center space-x-2 shrink-0 z-10 pr-2">
          {marketStatus.isOpen ? (
            <span className="flex items-center text-emerald-500 font-extrabold text-[10px] uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <Radio className="w-3 h-3 mr-1 text-emerald-500 animate-pulse" /> LIVE SESSION (09:30 - 15:30 PKT)
            </span>
          ) : (
            <span className={`flex items-center font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              isLight ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60'
            }`}>
              <Lock className="w-3 h-3 mr-1" /> {marketStatus.statusText} • CLOSING RATES
            </span>
          )}
        </div>

        {/* Live Moving Ticker Marquee Container */}
        <div className="flex-1 overflow-hidden relative mx-3">
          <div className="animate-marquee flex items-center space-x-8 text-[11px]">
            {/* Set 1 */}
            <span className="mono font-bold whitespace-nowrap">
              KSE-100: <b className={isLight ? 'text-slate-900' : 'text-white'}>{kse}</b>{' '}
              <span className={isPositive ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                {isPositive ? '+' : ''}{changePct}%
              </span>
            </span>

            {tickerItems.map((item) => (
              <span key={`t1-${item.symbol}`} className="mono font-bold flex items-center space-x-1 whitespace-nowrap">
                <span className={isLight ? 'text-slate-600' : 'text-gray-400'}>{item.symbol}:</span>
                <b className={isLight ? 'text-slate-900' : 'text-white'}>{item.price}</b>
                <span className={item.isPos ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                  {item.change}
                </span>
              </span>
            ))}

            {/* Set 2 (Duplicate for Seamless Marquee Loop) */}
            <span className="mono font-bold whitespace-nowrap">
              KSE-100: <b className={isLight ? 'text-slate-900' : 'text-white'}>{kse}</b>{' '}
              <span className={isPositive ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                {isPositive ? '+' : ''}{changePct}%
              </span>
            </span>

            {tickerItems.map((item) => (
              <span key={`t2-${item.symbol}`} className="mono font-bold flex items-center space-x-1 whitespace-nowrap">
                <span className={isLight ? 'text-slate-600' : 'text-gray-400'}>{item.symbol}:</span>
                <b className={isLight ? 'text-slate-900' : 'text-white'}>{item.price}</b>
                <span className={item.isPos ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                  {item.change}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Countdown / Live Indicator */}
        {isAdmin ? (
          <div className={`hidden sm:flex items-center space-x-1.5 shrink-0 px-2.5 py-0.5 rounded text-[10px] mono font-bold z-10 ml-2 border ${
            isLight ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40'
          }`}>
            <Timer className="w-3 h-3 animate-pulse" />
            <span>Auto-Sync: <b className={isLight ? 'text-slate-900' : 'text-white'}>{countdown}s</b></span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center space-x-1.5 text-[10px] text-emerald-500 font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-0.5" />
            <span>Live Real-Time Sync</span>
          </div>
        )}
      </div>

      {/* 2. Main High-Spacious Navbar */}
      <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Left */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                isLight ? 'bg-white' : 'bg-[#070B12]'
              }`}>
                <Terminal className="w-5 h-5 text-cyan-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-black text-lg tracking-tight ${
                  isLight ? 'text-slate-900' : 'bg-gradient-to-r from-white via-gray-100 to-cyan-200 bg-clip-text text-transparent'
                }`}>
                  PSX ALPHA TERMINAL
                </span>
                <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 tracking-wider">
                  OFFICIAL DPS
                </span>
              </div>
              <p className={`text-[11px] font-medium hidden sm:block ${
                isLight ? 'text-slate-500' : 'text-gray-400'
              }`}>
                Pakistan Stock Exchange • Real-Time Market Intelligence & Signals
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Horizontal Single Line, Spacious) */}
          <nav className={`hidden xl:flex items-center space-x-1.5 p-1.5 rounded-2xl border shrink-0 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0D131F]/90 border-gray-800/80'
          }`}>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'news' 
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-black shadow-lg shadow-cyan-500/25' 
                  : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70' : 'text-gray-400 hover:text-white hover:bg-gray-800/60')
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>All Sectors News</span>
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'portfolio' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                  : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70' : 'text-gray-400 hover:text-white hover:bg-gray-800/60')
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>My Portfolio ({portfolioCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'recommendations' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg shadow-emerald-500/25' 
                  : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70' : 'text-gray-400 hover:text-white hover:bg-gray-800/60')
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily AI Signals</span>
            </button>

            <button
              onClick={() => setActiveTab('screener')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'screener' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25' 
                  : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70' : 'text-gray-400 hover:text-white hover:bg-gray-800/60')
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Full PSX Screener</span>
            </button>
          </nav>

          {/* Right Actions & Controls Group */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={onToggleTheme}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isLight 
                  ? 'bg-slate-100 border-slate-200 text-amber-500 hover:bg-slate-200' 
                  : 'bg-gray-900/90 border-gray-800 text-cyan-400 hover:bg-gray-800 hover:text-white'
              }`}
              title={isLight ? 'Switch to Dark Cyber Mode' : 'Switch to Clean White Light Mode'}
            >
              {isLight ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Watchlist */}
            <button
              onClick={onOpenWatchlist}
              className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' 
                  : 'bg-gray-900/90 border-gray-800 hover:border-cyan-500/40 text-gray-300 hover:text-white'
              }`}
              title="View Saved Watchlist"
            >
              <Bookmark className="w-4 h-4" />
              {watchlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-black text-[10px] font-black rounded-full flex items-center justify-center shadow">
                  {watchlistCount}
                </span>
              )}
            </button>

            {/* Sync Button (Admin Only) */}
            {isAdmin && (
              <button
                onClick={onRunScan}
                disabled={isScanning}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-90 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
                title="Force Live Market Scan (Admin Only)"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Syncing...' : 'Sync'}</span>
              </button>
            )}

            {/* Admin Panel Button (If Admin) */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-black cursor-pointer transition-all shadow-md shadow-purple-500/10 whitespace-nowrap"
              >
                <span>👑 Admin</span>
              </button>
            )}

            {/* Upgrade to Pro Button (If Free or not logged in) */}
            {!isPro && (
              <button
                onClick={onOpenUpgrade}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:opacity-90 text-black text-xs font-black cursor-pointer shadow-lg shadow-amber-500/25 transition-all whitespace-nowrap"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Go Pro</span>
              </button>
            )}

            {/* Auth Profile / Login Button */}
            {currentUser ? (
              <div className={`flex items-center space-x-2 pl-3 pr-1 py-1 rounded-xl border text-xs ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-gray-900/90 border-gray-800'
              }`}>
                <div className="flex flex-col text-right">
                  <span className={`font-bold text-[11px] leading-tight truncate max-w-[90px] ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {currentUser.name}
                  </span>
                  <span className={`text-[9px] font-black uppercase ${isPro ? 'text-amber-500' : 'text-gray-400'}`}>
                    {isPro ? '⭐ PRO VIP' : 'FREE'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-rose-400'
                  }`}
                  title="Sign Out"
                >
                  Exit
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border whitespace-nowrap ${
                    isLight 
                      ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200' 
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white border-gray-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="hidden md:block px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black cursor-pointer transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Tab Bar */}
      <div className={`flex xl:hidden items-center justify-around py-2.5 px-2 border-t text-xs font-bold overflow-x-auto ${
        isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#04070D] border-gray-900 text-gray-400'
      }`}>
        <button
          onClick={() => setActiveTab('news')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'news' ? 'bg-cyan-500 text-black shadow' : ''}`}
        >
          ⚡ News
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'portfolio' ? 'bg-purple-500 text-white shadow' : ''}`}
        >
          💼 Portfolio ({portfolioCount})
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'recommendations' ? 'bg-emerald-500 text-black shadow' : ''}`}
        >
          🎯 AI Signals
        </button>
        <button
          onClick={() => setActiveTab('screener')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'screener' ? 'bg-blue-500 text-white shadow' : ''}`}
        >
          📊 Screener
        </button>
      </div>
    </header>
  );
}
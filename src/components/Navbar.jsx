import React from 'react';
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
  CheckCircle2,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const TOP_TICKER_ITEMS = [
  { symbol: 'OGDC', price: '328.70', change: '+1.08%', isPos: true },
  { symbol: 'PRL', price: '104.42', change: '+10.00%', isPos: true },
  { symbol: 'CNERGY', price: '15.46', change: '+7.29%', isPos: true },
  { symbol: 'PPL', price: '234.50', change: '-1.09%', isPos: false },
  { symbol: 'SYS', price: '124.54', change: '-4.80%', isPos: false },
  { symbol: 'MARI', price: '663.26', change: '-0.22%', isPos: false },
  { symbol: 'LUCK', price: '437.33', change: '-1.07%', isPos: false },
  { symbol: 'FFC', price: '552.70', change: '+0.49%', isPos: true },
  { symbol: 'PSO', price: '363.84', change: '+0.75%', isPos: true },
  { symbol: 'MEBL', price: '573.99', change: '+2.15%', isPos: true },
  { symbol: 'BOP', price: '34.99', change: '+5.40%', isPos: true },
  { symbol: 'HUBC', price: '210.71', change: '+0.88%', isPos: true },
  { symbol: 'EFERT', price: '172.50', change: '+1.20%', isPos: true },
  { symbol: 'ENGRO', price: '385.00', change: '+0.65%', isPos: true },
  { symbol: 'SAZEW', price: '890.00', change: '+4.50%', isPos: true },
  { symbol: 'INDU', price: '1952.00', change: '+1.80%', isPos: true },
  { symbol: 'MLCF', price: '100.00', change: '+3.10%', isPos: true },
  { symbol: 'CHCC', price: '194.00', change: '+2.40%', isPos: true },
  { symbol: 'MUGHAL', price: '108.40', change: '+2.90%', isPos: true },
  { symbol: 'ILP', price: '88.50', change: '+1.45%', isPos: true },
  { symbol: 'NATF', price: '188.00', change: '+0.95%', isPos: true },
  { symbol: 'TOMCL', price: '38.00', change: '+3.80%', isPos: true },
  { symbol: 'WTL', price: '1.16', change: '+0.87%', isPos: true }
];

export default function Navbar({ 
  marketSummary, 
  onRunScan, 
  isScanning, 
  watchlistCount, 
  portfolioCount = 0,
  onOpenWatchlist, 
  activeTab, 
  setActiveTab,
  countdown = 60,
  theme = 'dark',
  onToggleTheme
}) {
  const kse = marketSummary?.currentValue ? marketSummary.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '177,616.95';
  const change = marketSummary?.change || 641.28;
  const changePct = marketSummary?.changePercent || 0.36;
  const isPositive = change >= 0;
  const marketStatus = marketSummary?.marketStatus || { isOpen: false, statusText: 'MARKET CLOSED', sessionNote: 'Official Closing Rates' };

  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl border-b shadow-2xl transition-colors ${
      isLight 
        ? 'bg-white/95 border-slate-200 text-slate-900' 
        : 'bg-[#070B12]/95 border-cyan-950/60 text-gray-100'
    }`}>
      {/* 1. Infinitely Scrolling Moving Ticker Tape */}
      <div className={`px-2 py-1.5 flex items-center justify-between text-[11px] border-b overflow-hidden ${
        isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#04070D] border-gray-900/90 text-gray-400'
      }`}>
        {/* Market Status badge */}
        <div className="flex items-center space-x-2 shrink-0 z-10 pr-2">
          {marketStatus.isOpen ? (
            <span className="flex items-center text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <Radio className="w-3 h-3 mr-1 text-emerald-400 animate-pulse" /> LIVE SESSION
            </span>
          ) : (
            <span className={`flex items-center font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              isLight ? 'bg-cyan-50 text-cyan-800 border-cyan-300' : 'bg-cyan-950/60 text-cyan-400 border-cyan-800/60'
            }`}>
              <Lock className="w-3 h-3 mr-1 text-cyan-400" /> {marketStatus.statusText}
            </span>
          )}
        </div>

        {/* Live Moving Ticker Marquee Container */}
        <div className="flex-1 overflow-hidden relative mx-2">
          <div className="animate-marquee flex items-center space-x-8 text-[11px]">
            {/* Set 1 */}
            <span className="mono font-bold">
              KSE-100: <b className={isLight ? 'text-slate-900' : 'text-white'}>{kse}</b>{' '}
              <span className={isPositive ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                {isPositive ? '+' : ''}{changePct}%
              </span>
            </span>

            {TOP_TICKER_ITEMS.map((item) => (
              <span key={`t1-${item.symbol}`} className="mono font-bold flex items-center space-x-1">
                <span>{item.symbol}:</span>
                <b className={isLight ? 'text-slate-900' : 'text-white'}>{item.price}</b>
                <span className={item.isPos ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                  {item.change}
                </span>
              </span>
            ))}

            {/* Set 2 (Duplicate for Seamless Loop) */}
            <span className="mono font-bold">
              KSE-100: <b className={isLight ? 'text-slate-900' : 'text-white'}>{kse}</b>{' '}
              <span className={isPositive ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                {isPositive ? '+' : ''}{changePct}%
              </span>
            </span>

            {TOP_TICKER_ITEMS.map((item) => (
              <span key={`t2-${item.symbol}`} className="mono font-bold flex items-center space-x-1">
                <span>{item.symbol}:</span>
                <b className={isLight ? 'text-slate-900' : 'text-white'}>{item.price}</b>
                <span className={item.isPos ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                  {item.change}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Countdown Timer */}
        <div className={`hidden sm:flex items-center space-x-1.5 shrink-0 px-2 py-0.5 rounded border text-[10px] mono font-bold z-10 ml-2 ${
          isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-800' : 'bg-cyan-950/40 border-cyan-800/40 text-cyan-300'
        }`}>
          <Timer className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>Auto-Sync in: <b className={isLight ? 'text-slate-900' : 'text-white'}>{countdown}s</b></span>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-[#070B12]'}`}>
                <Terminal className="w-5 h-5 text-cyan-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-black text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  PSX ALPHA TERMINAL
                </span>
                <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 tracking-wider">
                  LIVE DPS
                </span>
              </div>
              <p className={`text-[11px] font-normal ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Official PSX Market Rates • Easy Daily Stock Signals
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Easy English) */}
          <nav className={`hidden md:flex items-center space-x-1 p-1.5 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0D131F]/90 border-gray-800/80'
          }`}>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'news' 
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-black shadow-lg shadow-cyan-500/20' 
                  : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-gray-400 hover:text-white hover:bg-gray-800/50')
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Live News & Trade Ideas</span>
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'portfolio' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20' 
                  : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-gray-400 hover:text-white hover:bg-gray-800/50')
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
                  : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-gray-400 hover:text-white hover:bg-gray-800/50')
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>🎯 Daily Buy / Sell Signals</span>
            </button>

            <button
              onClick={() => setActiveTab('screener')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'screener' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20' 
                  : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-gray-400 hover:text-white hover:bg-gray-800/50')
              }`}
            >
              <span>📊 All 763 PSX Stocks</span>
            </button>
          </nav>

          {/* Right Actions: Theme Switcher, Watchlist, Sync */}
          <div className="flex items-center space-x-2.5">
            {/* Theme Toggle Button (Light / Dark Mode) */}
            <button
              onClick={onToggleTheme}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 border-slate-300 text-amber-600 hover:bg-slate-200 shadow-sm' 
                  : 'bg-gray-900/90 border-gray-800 text-amber-400 hover:text-amber-300 hover:border-amber-500/40'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to White (Light) Mode'}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Watchlist */}
            <button
              onClick={onOpenWatchlist}
              className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' 
                  : 'bg-gray-900/90 border-gray-800 hover:border-cyan-500/40 text-gray-300 hover:text-white'
              }`}
              title="View Watchlist"
            >
              <Bookmark className="w-4 h-4" />
              {watchlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-black text-[10px] font-black rounded-full flex items-center justify-center shadow">
                  {watchlistCount}
                </span>
              )}
            </button>

            {/* Sync Now */}
            <button
              onClick={onRunScan}
              disabled={isScanning}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-90 text-black font-black text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Updating...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className={`flex md:hidden items-center justify-around py-2 border-t text-[11px] ${
          isLight ? 'border-slate-200' : 'border-gray-800'
        }`}>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-2.5 py-1.5 rounded-lg font-bold ${activeTab === 'news' ? 'bg-cyan-500 text-black' : (isLight ? 'text-slate-600' : 'text-gray-400')}`}
          >
            ⚡ News
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-2.5 py-1.5 rounded-lg font-bold ${activeTab === 'portfolio' ? 'bg-purple-500 text-white' : (isLight ? 'text-slate-600' : 'text-gray-400')}`}
          >
            💼 Portfolio
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-2.5 py-1.5 rounded-lg font-bold ${activeTab === 'recommendations' ? 'bg-emerald-500 text-black' : (isLight ? 'text-slate-600' : 'text-gray-400')}`}
          >
            🎯 Signals
          </button>
          <button
            onClick={() => setActiveTab('screener')}
            className={`px-2.5 py-1.5 rounded-lg font-bold ${activeTab === 'screener' ? 'bg-blue-500 text-white' : (isLight ? 'text-slate-600' : 'text-gray-400')}`}
          >
            📊 Screener
          </button>
        </div>
      </div>
    </header>
  );
}
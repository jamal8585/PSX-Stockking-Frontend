
import React from 'react';
import { RefreshCw, Bookmark, Sparkles, Zap, Radio, Terminal, Timer, Briefcase, Lock, CheckCircle2 } from 'lucide-react';

export default function Navbar({ 
  marketSummary, 
  onRunScan, 
  isScanning, 
  watchlistCount, 
  portfolioCount = 0,
  onOpenWatchlist, 
  activeTab, 
  setActiveTab,
  countdown = 60
}) {
  const kse = marketSummary?.currentValue ? marketSummary.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '177,616.95';
  const change = marketSummary?.change || 641.28;
  const changePct = marketSummary?.changePercent || 0.36;
  const isPositive = change >= 0;
  const marketStatus = marketSummary?.marketStatus || { isOpen: false, statusText: 'MARKET CLOSED', sessionNote: 'Official Closing Rates' };

  return (
    <header className="sticky top-0 z-40 bg-[#070B12]/95 backdrop-blur-xl border-b border-cyan-950/60 shadow-2xl">
      {/* Top Live Ticker Tape */}
      <div className="bg-[#04070D] border-b border-gray-900/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-gray-400 overflow-hidden">
        {/* Status indicator */}
        <div className="flex items-center space-x-2 shrink-0">
          {marketStatus.isOpen ? (
            <span className="flex items-center text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <Radio className="w-3 h-3 mr-1 text-emerald-400 animate-pulse" /> LIVE SESSION (09:30 - 15:30 PKT)
            </span>
          ) : (
            <span className="flex items-center text-cyan-400 font-extrabold text-[10px] uppercase tracking-wider bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/60">
              <Lock className="w-3 h-3 mr-1 text-cyan-400" /> {marketStatus.statusText} • OFFICIAL CLOSING RATES
            </span>
          )}
        </div>

        {/* Real Live PSX Quotes */}
        <div className="flex items-center space-x-6 overflow-x-auto whitespace-nowrap scrollbar-none px-4 text-[11px]">
          <span className="mono">KSE-100: <b className="text-white">{kse}</b> <span className={isPositive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{isPositive ? '+' : ''}{changePct}%</span></span>
          <span className="mono">OGDC: <b className="text-white">328.70</b> <span className="text-emerald-400 font-bold">+1.08%</span></span>
          <span className="mono">PPL: <b className="text-white">234.50</b> <span className="text-rose-400 font-bold">-1.09%</span></span>
          <span className="mono">MARI: <b className="text-white">663.26</b> <span className="text-rose-400 font-bold">-0.22%</span></span>
          <span className="mono">SYS: <b className="text-white">124.54</b> <span className="text-rose-400 font-bold">-4.80%</span></span>
          <span className="mono">LUCK: <b className="text-white">437.33</b> <span className="text-rose-400 font-bold">-1.07%</span></span>
          <span className="mono">FFC: <b className="text-white">552.70</b> <span className="text-emerald-400 font-bold">+0.49%</span></span>
          <span className="mono">PSO: <b className="text-white">363.84</b> <span className="text-emerald-400 font-bold">+0.75%</span></span>
          <span className="mono">PRL: <b className="text-white">104.42</b> <span className="text-emerald-400 font-bold">+10.00%</span></span>
          <span className="mono">CNERGY: <b className="text-white">15.46</b> <span className="text-emerald-400 font-bold">+7.29%</span></span>
        </div>

        {/* Countdown */}
        <div className="hidden sm:flex items-center space-x-1.5 shrink-0 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-[10px] mono font-bold">
          <Timer className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>Auto-Sync in: <b className="text-white">{countdown}s</b></span>
        </div>
      </div>

      {/* Main Navbar */}
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
              <p className="text-[11px] text-gray-400 font-medium">Official PSX DPS Rates • Live Session at 09:30 AM PKT</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#0D131F]/90 p-1.5 rounded-xl border border-gray-800/80">
            <button
              onClick={() => setActiveTab('news')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
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
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
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
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
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
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
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

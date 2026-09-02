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
  BarChart3,
  Coins,
  LogOut,
  User as UserIcon
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
        ? 'bg-[#FFFFFF] text-[#0F172A] border-b border-[#E2E8F0] shadow-sm' 
        : 'bg-[#151E2E] text-[#F8FAFC] border-b border-[#243044] shadow-lg'
    }`}>
      {/* 1. Infinitely Scrolling Live Moving Ticker Tape */}
      <div className={`px-4 py-1.5 flex items-center justify-between text-[11px] overflow-hidden border-b ${
        isLight 
          ? 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]' 
          : 'bg-[#0B0F19] text-[#94A3B8] border-[#243044]'
      }`}>
        {/* Status Indicator */}
        <div className="flex items-center space-x-2 shrink-0 z-10 pr-2">
          {marketStatus.isOpen ? (
            <span className={`flex items-center font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              isLight ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20' : 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20'
            }`}>
              <Radio className="w-3 h-3 mr-1 animate-pulse" /> LIVE SESSION (09:30 - 15:30 PKT)
            </span>
          ) : (
            <span className={`flex items-center font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              isLight ? 'text-[#2563EB] bg-[#2563EB]/10 border-[#2563EB]/20' : 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20'
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
              KSE-100: <b className={isLight ? 'text-[#0F172A]' : 'text-[#F8FAFC]'}>{kse}</b>{' '}
              <span className={isPositive ? (isLight ? 'text-[#16A34A]' : 'text-[#22C55E]') : (isLight ? 'text-[#DC2626]' : 'text-[#EF4444]')}>
                {isPositive ? '+' : ''}{changePct}%
              </span>
            </span>

            {tickerItems.map((item) => (
              <span key={`t1-${item.symbol}`} className="mono font-bold flex items-center space-x-1 whitespace-nowrap">
                <span className={isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}>{item.symbol}:</span>
                <b className={isLight ? 'text-[#0F172A]' : 'text-[#F8FAFC]'}>{item.price}</b>
                <span className={item.isPos ? (isLight ? 'text-[#16A34A]' : 'text-[#22C55E]') : (isLight ? 'text-[#DC2626]' : 'text-[#EF4444]')}>
                  {item.change}
                </span>
              </span>
            ))}

            {/* Set 2 (Duplicate for Seamless Marquee Loop) */}
            <span className="mono font-bold whitespace-nowrap">
              KSE-100: <b className={isLight ? 'text-[#0F172A]' : 'text-[#F8FAFC]'}>{kse}</b>{' '}
              <span className={isPositive ? (isLight ? 'text-[#16A34A]' : 'text-[#22C55E]') : (isLight ? 'text-[#DC2626]' : 'text-[#EF4444]')}>
                {isPositive ? '+' : ''}{changePct}%
              </span>
            </span>

            {tickerItems.map((item) => (
              <span key={`t2-${item.symbol}`} className="mono font-bold flex items-center space-x-1 whitespace-nowrap">
                <span className={isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}>{item.symbol}:</span>
                <b className={isLight ? 'text-[#0F172A]' : 'text-[#F8FAFC]'}>{item.price}</b>
                <span className={item.isPos ? (isLight ? 'text-[#16A34A]' : 'text-[#22C55E]') : (isLight ? 'text-[#DC2626]' : 'text-[#EF4444]')}>
                  {item.change}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Live Pulse Indicator for Users */}
        <div className={`hidden sm:flex items-center space-x-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
          isLight ? 'text-[#16A34A] bg-[#16A34A]/10 border-[#16A34A]/20' : 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse mr-0.5 ${isLight ? 'bg-[#16A34A]' : 'bg-[#22C55E]'}`} />
          <span>Live Telemetry</span>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-[1680px] w-full mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          
          {/* Brand Left */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl p-0.5 shadow-sm border ${
              isLight ? 'bg-[#2563EB] border-[#1D4ED8]' : 'bg-[#3B82F6] border-[#60A5FA]/40'
            }`}>
              <div className={`w-full h-full rounded-[8px] sm:rounded-[10px] flex items-center justify-center ${
                isLight ? 'bg-[#FFFFFF]' : 'bg-[#151E2E]'
              }`}>
                <Terminal className={`w-4 h-4 sm:w-5 sm:h-5 ${isLight ? 'text-[#2563EB]' : 'text-[#3B82F6]'}`} />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className={`font-black text-xs sm:text-base md:text-lg tracking-tight ${
                  isLight ? 'text-[#0F172A]' : 'text-[#F8FAFC]'
                }`}>
                  PSX ALPHA TERMINAL
                </span>
                <span className={`hidden xs:inline-block text-[8px] sm:text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md border tracking-wider ${
                  isLight ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20' : 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30'
                }`}>
                  OFFICIAL DPS
                </span>
              </div>
              <p className={`text-[10px] sm:text-[11px] font-medium hidden sm:block ${
                isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
              }`}>
                Pakistan Stock Exchange • Real-Time Market Intelligence & Signals
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Horizontal Single Line) */}
          <nav className={`hidden 2xl:flex items-center space-x-1 p-1 rounded-xl border shrink-0 ${
            isLight ? 'bg-[#F1F5F9] border-[#E2E8F0]' : 'bg-[#1E293B] border-[#243044]'
          }`}>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'news' 
                  ? (isLight ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-[#3B82F6] text-white shadow-sm')
                  : (isLight ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]' : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2E]')
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>All Sectors News</span>
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'portfolio' 
                  ? (isLight ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-[#3B82F6] text-white shadow-sm')
                  : (isLight ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]' : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2E]')
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>My Portfolio ({portfolioCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'recommendations' 
                  ? (isLight ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-[#3B82F6] text-white shadow-sm')
                  : (isLight ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]' : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2E]')
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily AI Signals</span>
            </button>

            <button
              onClick={() => setActiveTab('dividends')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'dividends' 
                  ? (isLight ? 'bg-[#D97706] text-white shadow-sm' : 'bg-[#F59E0B] text-black shadow-sm font-black')
                  : (isLight ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]' : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2E]')
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Upcoming Dividends 💰</span>
            </button>

            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'watchlist' 
                  ? (isLight ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-[#3B82F6] text-white shadow-sm')
                  : (isLight ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]' : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2E]')
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watchlist Radar ({watchlistCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('screener')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'screener' 
                  ? (isLight ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-[#3B82F6] text-white shadow-sm')
                  : (isLight ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]' : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E2E]')
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Full PSX Screener</span>
            </button>
          </nav>

          {/* Right Actions & Controls Group */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                isLight 
                  ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]' 
                  : 'bg-[#0B0F19] border-[#243044] text-[#F8FAFC] hover:bg-[#1E293B]'
              }`}
              title={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            >
              {isLight ? <Moon className="w-4 h-4 text-[#2563EB]" /> : <Sun className="w-4 h-4 text-[#F59E0B]" />}
            </button>

            {/* Watchlist */}
            <button
              onClick={onOpenWatchlist}
              className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
                isLight 
                  ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]' 
                  : 'bg-[#0B0F19] border-[#243044] text-[#F8FAFC] hover:bg-[#1E293B]'
              }`}
              title="View Saved Watchlist"
            >
              <Bookmark className="w-4 h-4" />
              {watchlistCount > 0 && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow ${
                  isLight ? 'bg-[#2563EB]' : 'bg-[#3B82F6]'
                }`}>
                  {watchlistCount}
                </span>
              )}
            </button>

            {/* Sync Button (Admin Only) */}
            {isAdmin && (
              <button
                onClick={onRunScan}
                disabled={isScanning}
                className={`hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-lg text-white font-bold text-xs disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap ${
                  isLight ? 'bg-[#2563EB] hover:bg-[#1D4ED8]' : 'bg-[#3B82F6] hover:bg-[#60A5FA]'
                }`}
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
                className={`flex items-center space-x-1 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all border whitespace-nowrap ${
                  isLight 
                    ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#0F172A] hover:bg-[#E2E8F0]' 
                    : 'bg-[#1E293B] border-[#243044] text-[#F8FAFC] hover:bg-[#243044]'
                }`}
              >
                <span>👑 Admin</span>
              </button>
            )}

            {/* Upgrade to Pro Button (If Free or not logged in) */}
            {!isPro && (
              <button
                onClick={onOpenUpgrade}
                className={`flex items-center space-x-1 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                  isLight 
                    ? 'bg-[#D97706] hover:bg-[#B45309] text-white shadow-sm' 
                    : 'bg-[#F59E0B] hover:bg-[#D97706] text-black font-black shadow-sm'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Go Pro</span>
              </button>
            )}

            {/* Auth Profile / Login Button */}
            {currentUser ? (
              <div className="relative flex items-center shrink-0">
                {/* Unified In-Card Profile with Embedded Sign Out Button */}
                <div className={`flex items-center space-x-2 pl-2 pr-1.5 py-1 rounded-xl border text-xs shadow-xs ${
                  isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#0B0F19] border-[#243044]'
                }`}>
                  {/* Avatar Initial */}
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isPro 
                      ? (isLight ? 'bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30' : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30') 
                      : (isLight ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-[#3B82F6]/10 text-[#3B82F6]')
                  }`}>
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>

                  {/* Name & Plan */}
                  <div className="flex flex-col text-left max-w-[80px] sm:max-w-[110px] pr-0.5">
                    <span className={`font-bold text-[11px] leading-tight truncate ${
                      isLight ? 'text-[#0F172A]' : 'text-[#F8FAFC]'
                    }`} title={currentUser.name}>
                      {currentUser.name?.replace(/\s*\(Lead Admin\)/i, '') || 'User'}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider truncate ${
                      isPro ? (isLight ? 'text-[#D97706]' : 'text-[#F59E0B]') : (isLight ? 'text-[#64748B]' : 'text-[#94A3B8]')
                    }`}>
                      {isPro ? '⭐ PRO VIP' : 'FREE TIER'}
                    </span>
                  </div>

                  {/* Direct Red Sign Out Button Inside the Card */}
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border border-[#DC2626]/30 bg-[#DC2626]/10 hover:bg-[#DC2626] text-[#DC2626] hover:text-white dark:text-[#EF4444] dark:hover:text-white shadow-xs shrink-0 ml-1"
                    title="Sign Out of Account"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="font-bold text-[11px]">Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all border whitespace-nowrap ${
                    isLight 
                      ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]' 
                      : 'bg-[#0B0F19] border-[#243044] text-[#F8FAFC] hover:bg-[#1E293B]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className={`hidden md:block px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all text-white whitespace-nowrap ${
                    isLight ? 'bg-[#2563EB] hover:bg-[#1D4ED8]' : 'bg-[#3B82F6] hover:bg-[#60A5FA]'
                  }`}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Tab Bar */}
      <div className={`flex xl:hidden items-center justify-start sm:justify-around py-2 px-2 border-t text-xs font-bold overflow-x-auto space-x-1.5 scrollbar-none touch-pan-x ${
        isLight ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]' : 'bg-[#0B0F19] border-[#243044] text-[#94A3B8]'
      }`}>
        <button
          onClick={() => setActiveTab('news')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center space-x-1 cursor-pointer ${
            activeTab === 'news' ? (isLight ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-[#3B82F6] text-white shadow-sm') : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>News</span>
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center space-x-1 cursor-pointer ${
            activeTab === 'portfolio' ? (isLight ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-[#3B82F6] text-white shadow-sm') : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Portfolio ({portfolioCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center space-x-1 cursor-pointer ${
            activeTab === 'recommendations' ? (isLight ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-[#3B82F6] text-white shadow-sm') : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Signals</span>
        </button>
        <button
          onClick={() => setActiveTab('dividends')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center space-x-1 cursor-pointer ${
            activeTab === 'dividends' ? (isLight ? 'bg-[#D97706] text-white shadow-sm' : 'bg-[#F59E0B] text-black font-black shadow-sm') : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Dividends</span>
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center space-x-1 cursor-pointer ${
            activeTab === 'watchlist' ? (isLight ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-[#3B82F6] text-white shadow-sm') : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Watchlist ({watchlistCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('screener')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center space-x-1 cursor-pointer ${
            activeTab === 'screener' ? (isLight ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-[#3B82F6] text-white shadow-sm') : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Screener</span>
        </button>
      </div>
    </header>
  );
}

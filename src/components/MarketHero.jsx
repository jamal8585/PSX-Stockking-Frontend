import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, Layers, Radio, Lock, X, Search } from 'lucide-react';
import { getPSXMarketStatus, DEFAULT_KSE100_SUMMARY, DEFAULT_CURATED_BREADTH, DEFAULT_PRO_BREADTH } from '../utils/marketSession';
import officialQuotes from '../data/official_quotes.json';

const parseCleanNum = (val, fallback = 0) => {
  if (val === undefined || val === null) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const cleaned = String(val).replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : num;
};

const DEFAULT_SECTORS = [
  { sector: 'Commercial Banks', changePercent: 1.25, volume: 45000000 },
  { sector: 'Oil & Gas Exploration Companies', changePercent: 0.85, volume: 38000000 },
  { sector: 'Cement', changePercent: 1.42, volume: 29000000 },
  { sector: 'Technology & Communication', changePercent: 3.18, volume: 62000000 },
  { sector: 'Fertilizer', changePercent: -0.45, volume: 22000000 },
  { sector: 'Power Generation & Distribution', changePercent: 0.50, volume: 18000000 },
  { sector: 'Automobile Assembler', changePercent: 1.10, volume: 14000000 },
  { sector: 'Textile Composite', changePercent: -0.22, volume: 11000000 }
];

export default function MarketHero({ marketSummary, currentUser }) {
  const [viewAllSectors, setViewAllSectors] = useState(false);
  const [sectorSearch, setSectorSearch] = useState('');

  const isPro = Boolean(currentUser?.plan === 'PRO' && currentUser?.subscriptionStatus === 'ACTIVE');

  const activeBreadth = useMemo(() => {
    if (isPro) {
      if (marketSummary?.fullBreadth) {
        return marketSummary.fullBreadth;
      }
      if (marketSummary?.advances !== undefined && (marketSummary.advances + marketSummary.declines + marketSummary.unchanged > 100)) {
        return {
          advances: parseCleanNum(marketSummary.advances, DEFAULT_PRO_BREADTH.advances),
          declines: parseCleanNum(marketSummary.declines, DEFAULT_PRO_BREADTH.declines),
          unchanged: parseCleanNum(marketSummary.unchanged, DEFAULT_PRO_BREADTH.unchanged),
          total: parseCleanNum(marketSummary.advances + marketSummary.declines + marketSummary.unchanged, DEFAULT_PRO_BREADTH.total)
        };
      }
      return DEFAULT_PRO_BREADTH;
    } else {
      if (marketSummary?.curatedBreadth) {
        return marketSummary.curatedBreadth;
      }
      if (marketSummary?.advances !== undefined && (marketSummary.advances + marketSummary.declines + marketSummary.unchanged <= 100)) {
        return {
          advances: parseCleanNum(marketSummary.advances, DEFAULT_CURATED_BREADTH.advances),
          declines: parseCleanNum(marketSummary.declines, DEFAULT_CURATED_BREADTH.declines),
          unchanged: parseCleanNum(marketSummary.unchanged, DEFAULT_CURATED_BREADTH.unchanged),
          total: parseCleanNum(marketSummary.advances + marketSummary.declines + marketSummary.unchanged, DEFAULT_CURATED_BREADTH.total)
        };
      }
      return DEFAULT_CURATED_BREADTH;
    }
  }, [isPro, marketSummary]);

  const currentValue = parseCleanNum(marketSummary?.currentValue || marketSummary?.current, DEFAULT_KSE100_SUMMARY.current);
  const change = marketSummary?.change !== undefined ? parseCleanNum(marketSummary.change, DEFAULT_KSE100_SUMMARY.change) : DEFAULT_KSE100_SUMMARY.change;
  const changePercent = marketSummary?.changePercent !== undefined ? parseCleanNum(marketSummary.changePercent, DEFAULT_KSE100_SUMMARY.changePercent) : DEFAULT_KSE100_SUMMARY.changePercent;
  const high = parseCleanNum(marketSummary?.high, DEFAULT_KSE100_SUMMARY.high);
  const low = parseCleanNum(marketSummary?.low, DEFAULT_KSE100_SUMMARY.low);
  const indexName = marketSummary?.indexName || DEFAULT_KSE100_SUMMARY.indexName;
  const advances = activeBreadth.advances;
  const declines = activeBreadth.declines;
  const unchanged = activeBreadth.unchanged;
  const sectorPerformance = marketSummary?.sectorPerformance || [];
  const marketSentiment = marketSummary?.marketSentiment || (change >= 0 ? 'BULLISH' : 'BEARISH');
  const marketStatus = marketSummary?.marketStatus || getPSXMarketStatus();

  const isPositive = change >= 0;
  const totalStocks = Math.max(1, advances + declines + unchanged);
  const advancesPct = Math.round((advances / totalStocks) * 100);
  const declinesPct = Math.round((declines / totalStocks) * 100);
  const neutralPct = Math.max(0, 100 - advancesPct - declinesPct);

  // Exact Day Range Percentage calculation
  const rangeSpan = Math.max(1, high - low);
  const dayRangeProgressPct = Math.min(100, Math.max(0, ((currentValue - low) / rangeSpan) * 100));

  // Compute dynamic sector performance across PSX sectors with circuit-breaker sanity filter
  const displaySectors = useMemo(() => {
    if (!isPro && Array.isArray(marketSummary?.curatedSectorPerformance) && marketSummary.curatedSectorPerformance.length > 0) {
      return marketSummary.curatedSectorPerformance;
    }

    const validServerSectors = Array.isArray(marketSummary?.fullSectorPerformance || sectorPerformance) 
      ? (marketSummary?.fullSectorPerformance || sectorPerformance)
          .filter(s => s && s.sector && s.sector !== 'General Market')
          .map(s => ({
            ...s,
            // Clamp any unadjusted server outlier to PSX realistic circuit breaker range
            changePercent: Number(Math.max(-15, Math.min(15, Number(s.changePercent || 0))).toFixed(2))
          }))
      : [];

    if (validServerSectors.length >= 5) {
      return validServerSectors;
    }

    if (officialQuotes && typeof officialQuotes === 'object') {
      const secMap = new Map();
      Object.values(officialQuotes).forEach(q => {
        const secName = q?.sector;
        if (!secName || secName === 'General Market') return;

        // Skip Unpaid Rights (LoR) and penny share anomalies from sector index calculation
        const sym = String(q.symbol || '').toUpperCase().trim();
        const isRightOrLoR = sym.endsWith('R') || sym.includes('APPR') || sym.includes('LOR') || 
          (Number(q.currentPrice || 0) < 1.0 && Math.abs(Number(q.changePercent || 0)) > 20);
        if (isRightOrLoR) return;

        if (!secMap.has(secName)) {
          secMap.set(secName, { sector: secName, totalChange: 0, count: 0, volume: 0 });
        }
        const record = secMap.get(secName);
        // Clamp individual stock change to PSX max circuit breaker limit (±15%)
        const clampedChange = Math.max(-15, Math.min(15, Number(q.changePercent || 0)));
        record.totalChange += clampedChange;
        record.volume += Number(q.volume || 0);
        record.count += 1;
      });

      if (secMap.size > 0) {
        return Array.from(secMap.values()).map(s => ({
          sector: s.sector,
          changePercent: Number((s.totalChange / (s.count || 1)).toFixed(2)),
          volume: s.volume,
          count: s.count
        }));
      }
    }

    return DEFAULT_SECTORS;
  }, [sectorPerformance]);

  const sortedSectors = useMemo(() => {
    return [...displaySectors].sort((a, b) => b.changePercent - a.changePercent);
  }, [displaySectors]);

  const topSectors = useMemo(() => sortedSectors.slice(0, 8), [sortedSectors]);

  const filteredModalSectors = useMemo(() => {
    if (!sectorSearch.trim()) return sortedSectors;
    const q = sectorSearch.toLowerCase().trim();
    return sortedSectors.filter(s => s.sector.toLowerCase().includes(q));
  }, [sortedSectors, sectorSearch]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-3 mb-3 sm:mb-4">
        {/* 1. Live KSE-100 Index Card (Compact Quant Terminal Style) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 sm:p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <span className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 text-[11px] font-bold font-mono">
                  {indexName}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[140px]">
                  {marketStatus.statusText || 'Official PSX DPS'}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1 border ${
                isPositive 
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' 
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400'
              }`}>
                {isPositive ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                {marketSentiment.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-baseline space-x-2 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
                {currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <span className={`text-xs font-bold font-mono ${
                isPositive 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Compact Day Range Bar */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px]">
            <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400 mb-1">
              <span>L: <b className="font-mono text-zinc-800 dark:text-zinc-200">{low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
              <span className="font-mono text-[9px] text-zinc-400">{dayRangeProgressPct.toFixed(0)}% Range</span>
              <span>H: <b className="font-mono text-zinc-800 dark:text-zinc-200">{high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
            </div>
            <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full relative overflow-hidden">
              <div 
                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(2, dayRangeProgressPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Sleek Horizontal Inline Market Breadth Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 sm:p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {isPro ? 'Market Breadth — All 763 PSX Universe' : 'Market Breadth — 64 PSX Active Coverage'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 font-semibold">{totalStocks} Stocks</span>
            </div>

            {/* Sleek Horizontal Inline Stat Bar */}
            <div className="grid grid-cols-3 gap-1 py-1.5 px-2 bg-zinc-50 dark:bg-zinc-800/60 rounded border border-zinc-200/80 dark:border-zinc-700/60 text-center items-center my-1.5">
              <div className="flex items-center justify-center space-x-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 text-xs">▲</span>
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{advances}</span>
                <span className="text-[10px] text-zinc-400 font-medium">({advancesPct}%)</span>
              </div>
              <div className="flex items-center justify-center space-x-1.5 border-x border-zinc-200 dark:border-zinc-700">
                <span className="text-rose-600 dark:text-rose-400 text-xs">▼</span>
                <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400">{declines}</span>
                <span className="text-[10px] text-zinc-400 font-medium">({declinesPct}%)</span>
              </div>
              <div className="flex items-center justify-center space-x-1.5">
                <span className="text-zinc-500 dark:text-zinc-400 text-xs">■</span>
                <span className="text-xs font-bold font-mono text-zinc-700 dark:text-zinc-300">{unchanged}</span>
                <span className="text-[10px] text-zinc-400 font-medium">({neutralPct}%)</span>
              </div>
            </div>
          </div>

          {/* Integrated 4px Thin Distribution Bar Underneath */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="w-full h-1 rounded-full overflow-hidden flex bg-zinc-200 dark:bg-zinc-800">
              <div 
                style={{ width: `${advancesPct}%` }} 
                className="h-full shrink-0 bg-emerald-500 transition-all duration-300" 
                title={`Advances: ${advances} (${advancesPct}%)`} 
              />
              {neutralPct > 0 && (
                <div 
                  style={{ width: `${neutralPct}%` }} 
                  className="h-full shrink-0 bg-zinc-400 dark:bg-zinc-600 transition-all duration-300" 
                  title={`Neutral: ${unchanged} (${neutralPct}%)`} 
                />
              )}
              <div 
                style={{ width: `${declinesPct}%` }} 
                className="h-full shrink-0 bg-rose-500 transition-all duration-300" 
                title={`Declines: ${declines} (${declinesPct}%)`} 
              />
            </div>
          </div>
        </div>

        {/* 3. Real-Time Sector Performance (Compact Quant Heatmap) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 sm:p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {isPro ? 'Sector Radar — 37 PSX' : 'Sector Radar — 15 PSX'}
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setViewAllSectors(true)}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  View All ({displaySectors.length})
                </button>
                {marketStatus.isOpen ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center">
                    <Radio className="w-2 h-2 mr-0.5 animate-pulse" /> LIVE
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20 flex items-center">
                    <Lock className="w-2 h-2 mr-0.5" /> CLOSED
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 max-h-[76px] overflow-y-auto pr-0.5 scrollbar-none">
              {topSectors.slice(0, 6).map((sec, idx) => {
                const isSecPos = sec.changePercent >= 0;
                return (
                  <div 
                    key={idx}
                    className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 rounded px-2 py-1 flex items-center justify-between gap-1 transition-colors"
                  >
                    <span className="text-[10px] text-zinc-700 dark:text-zinc-300 font-semibold truncate flex-1" title={sec.sector}>
                      {sec.sector}
                    </span>
                    <span className={`text-[10px] font-bold font-mono shrink-0 ${
                      isSecPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {isSecPos ? '+' : ''}{sec.changePercent.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 text-[10px] text-zinc-400 dark:text-zinc-500 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 mt-1.5">
            <span>Tracking {displaySectors.length} Sectors</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono truncate max-w-[170px]">
              Top: {sortedSectors[0]?.sector} (+{sortedSectors[0]?.changePercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Responsive View All Sectors Modal (Mobile-Safe Viewport Container) */}
      {viewAllSectors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#CBD5E1] dark:border-[#243044] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-all text-[#0F172A] dark:text-[#F8FAFC]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E2E8F0] dark:border-[#243044] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    PSX Sector Performance Radar
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Tracking all {displaySectors.length} active sectors ranked by average price change
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setViewAllSectors(false);
                  setSectorSearch('');
                }}
                className="p-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Filter Search */}
            <div className="px-4 py-2.5 border-b border-[#E2E8F0] dark:border-[#243044] bg-[#F8FAFC] dark:bg-[#0B0F19] shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B] dark:text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Filter by sector name (e.g. Refinery, Banks, Cement)..."
                  value={sectorSearch}
                  onChange={(e) => setSectorSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs bg-white dark:bg-[#151E2E] border border-[#CBD5E1] dark:border-[#243044] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                />
              </div>
            </div>

            {/* Scrollable Sector Grid */}
            <div className="overflow-y-auto p-4 flex-1">
              {filteredModalSectors.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                  No sectors match your query "{sectorSearch}".
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredModalSectors.map((sec, idx) => {
                    const isSecPos = sec.changePercent >= 0;
                    return (
                      <div
                        key={idx}
                        className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] hover:border-[#2563EB] dark:hover:border-[#3B82F6] rounded-xl p-3 flex items-center justify-between transition-colors shadow-xs"
                      >
                        <div className="min-w-0 pr-2 flex-1">
                          <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block line-clamp-2 leading-tight" title={sec.sector}>
                            {sec.sector}
                          </span>
                          {sec.volume > 0 && (
                            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono block">
                              Vol: {(sec.volume).toLocaleString()} shs
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-extrabold font-mono px-2.5 py-1 rounded-lg shrink-0 ${
                          isSecPos 
                            ? 'bg-[#16A34A]/10 text-[#15803D] dark:text-[#22C55E] border border-[#16A34A]/20' 
                            : 'bg-[#DC2626]/10 text-[#DC2626] dark:text-[#EF4444] border border-[#DC2626]/20'
                        }`}>
                          {isSecPos ? '+' : ''}{sec.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B0F19] border-t border-[#E2E8F0] dark:border-[#243044] flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8] shrink-0">
              <span>Showing {filteredModalSectors.length} of {displaySectors.length} sectors</span>
              <button
                onClick={() => {
                  setViewAllSectors(false);
                  setSectorSearch('');
                }}
                className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

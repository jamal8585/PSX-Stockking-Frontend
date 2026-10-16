import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, Layers, Radio, Lock, X, Search } from 'lucide-react';
import { getPSXMarketStatus, DEFAULT_KSE100_SUMMARY } from '../utils/marketSession';
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
  { sector: 'Oil & Gas Exploration', changePercent: 0.85, volume: 38000000 },
  { sector: 'Cement', changePercent: 1.42, volume: 29000000 },
  { sector: 'Technology & Communication', changePercent: 3.18, volume: 62000000 },
  { sector: 'Fertilizer', changePercent: -0.45, volume: 22000000 },
  { sector: 'Power Generation & Distribution', changePercent: 0.50, volume: 18000000 },
  { sector: 'Automobile Assembler', changePercent: 1.10, volume: 14000000 },
  { sector: 'Textile Composite', changePercent: -0.22, volume: 11000000 }
];

export default function MarketHero({ marketSummary }) {
  const [viewAllSectors, setViewAllSectors] = useState(false);
  const [sectorSearch, setSectorSearch] = useState('');

  const currentValue = parseCleanNum(marketSummary?.currentValue || marketSummary?.current, DEFAULT_KSE100_SUMMARY.current);
  const change = marketSummary?.change !== undefined ? parseCleanNum(marketSummary.change, DEFAULT_KSE100_SUMMARY.change) : DEFAULT_KSE100_SUMMARY.change;
  const changePercent = marketSummary?.changePercent !== undefined ? parseCleanNum(marketSummary.changePercent, DEFAULT_KSE100_SUMMARY.changePercent) : DEFAULT_KSE100_SUMMARY.changePercent;
  const high = parseCleanNum(marketSummary?.high, DEFAULT_KSE100_SUMMARY.high);
  const low = parseCleanNum(marketSummary?.low, DEFAULT_KSE100_SUMMARY.low);
  const indexName = marketSummary?.indexName || DEFAULT_KSE100_SUMMARY.indexName;
  const advances = parseCleanNum(marketSummary?.advances, DEFAULT_KSE100_SUMMARY.advances);
  const declines = parseCleanNum(marketSummary?.declines, DEFAULT_KSE100_SUMMARY.declines);
  const unchanged = parseCleanNum(marketSummary?.unchanged, DEFAULT_KSE100_SUMMARY.unchanged);
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

  // Compute dynamic sector performance across all 39 PSX sectors with circuit-breaker sanity filter
  const displaySectors = useMemo(() => {
    const validServerSectors = Array.isArray(sectorPerformance) 
      ? sectorPerformance
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* 1. Live KSE-100 Index Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-4 sm:p-5 shadow-sm dark:shadow-md transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#3B82F6] border border-[#2563EB]/20 dark:border-[#3B82F6]/20 text-xs font-bold">
                {indexName}
              </span>
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
                {marketStatus.statusText || 'Official PSX DPS'}
              </span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 border ${
              isPositive 
                ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20 dark:bg-[#22C55E]/10 dark:text-[#22C55E] dark:border-[#22C55E]/20' 
                : 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20 dark:bg-[#EF4444]/10 dark:text-[#EF4444] dark:border-[#EF4444]/20'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {marketSentiment.replace('_', ' ')}
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-2 sm:space-x-3 mb-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mono tracking-tight">
              {currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <span className={`text-xs sm:text-sm font-bold mono flex items-center ${
              isPositive 
                ? 'text-[#16A34A] dark:text-[#22C55E]' 
                : 'text-[#DC2626] dark:text-[#EF4444]'
            }`}>
              {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>

          {/* Day Range Bar */}
          <div className="space-y-1.5 pt-2.5 border-t border-[#E2E8F0] dark:border-[#243044] text-xs">
            <div className="flex justify-between items-center text-[#64748B] dark:text-[#94A3B8] font-medium">
              <span>Day Low: <b className="text-[#0F172A] dark:text-[#F8FAFC] mono">{low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#3B82F6] mono">
                {dayRangeProgressPct.toFixed(0)}% of Range
              </span>
              <span>Day High: <b className="text-[#0F172A] dark:text-[#F8FAFC] mono">{high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
            </div>
            <div className="w-full h-2 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full relative overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] dark:from-[#3B82F6] dark:to-[#60A5FA] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(2, dayRangeProgressPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. High-Contrast Market Breadth */}
        <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-5 shadow-sm dark:shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider">Market Breadth</span>
              </div>
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-bold">{totalStocks} Listed Companies</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center my-3">
              <div className="bg-[#16A34A]/10 dark:bg-[#22C55E]/10 border border-[#16A34A]/30 dark:border-[#22C55E]/30 rounded-lg p-2">
                <span className="text-[10px] text-[#15803D] dark:text-[#22C55E] font-extrabold uppercase">Advances</span>
                <p className="text-xl font-black text-[#15803D] dark:text-[#22C55E] mono">{advances}</p>
                <span className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-bold">{advancesPct}%</span>
              </div>
              <div className="bg-[#DC2626]/10 dark:bg-[#EF4444]/10 border border-[#DC2626]/30 dark:border-[#EF4444]/30 rounded-lg p-2">
                <span className="text-[10px] text-[#DC2626] dark:text-[#EF4444] font-extrabold uppercase">Declines</span>
                <p className="text-xl font-black text-[#DC2626] dark:text-[#EF4444] mono">{declines}</p>
                <span className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-bold">{declinesPct}%</span>
              </div>
              <div className="bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#243044] rounded-lg p-2">
                <span className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-extrabold uppercase">Neutral</span>
                <p className="text-xl font-black text-[#0F172A] dark:text-[#F8FAFC] mono">{unchanged}</p>
                <span className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-bold">{neutralPct}%</span>
              </div>
            </div>
          </div>

          {/* High-Contrast Progress Bar: Bordered and Vibrantly Tinted for Crisp Visibility */}
          <div className="w-full h-3 rounded-full overflow-hidden flex border border-[#CBD5E1] dark:border-[#334155] bg-[#E2E8F0] dark:bg-[#0B0F19] p-[1.5px] shadow-xs">
            <div 
              style={{ width: `${advancesPct}%` }} 
              className="h-full shrink-0 bg-[#15803D] dark:bg-[#22C55E] transition-all duration-300 rounded-l-full" 
              title={`Advances: ${advances} (${advancesPct}%)`} 
            />
            {neutralPct > 0 && (
              <div 
                style={{ width: `${neutralPct}%` }} 
                className="h-full shrink-0 bg-[#64748B] dark:bg-[#94A3B8] transition-all duration-300" 
                title={`Neutral: ${unchanged} (${neutralPct}%)`} 
              />
            )}
            <div 
              style={{ width: `${declinesPct}%` }} 
              className="h-full shrink-0 bg-[#DC2626] dark:bg-[#EF4444] transition-all duration-300 rounded-r-full" 
              title={`Declines: ${declines} (${declinesPct}%)`} 
            />
          </div>
        </div>

        {/* 3. Real-Time Sector Performance Heatmap */}
        <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-5 shadow-sm dark:shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider">Sector Performance</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewAllSectors(true)}
                  className="text-[10px] font-bold text-[#2563EB] dark:text-[#3B82F6] hover:underline cursor-pointer px-1.5 py-0.5 rounded hover:bg-[#2563EB]/10 transition-colors"
                >
                  View All ({displaySectors.length})
                </button>
                {marketStatus.isOpen ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E] border border-[#16A34A]/20 dark:border-[#22C55E]/20 flex items-center">
                    <Radio className="w-2.5 h-2.5 mr-1 animate-pulse" /> LIVE
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/10 dark:text-[#3B82F6] border border-[#2563EB]/20 dark:border-[#3B82F6]/20 flex items-center">
                    <Lock className="w-2.5 h-2.5 mr-1" /> CLOSED
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[145px] overflow-y-auto pr-1">
              {topSectors.map((sec, idx) => {
                const isSecPos = sec.changePercent >= 0;
                return (
                  <div 
                    key={idx}
                    className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] hover:border-[#2563EB] dark:hover:border-[#3B82F6] rounded-lg px-2.5 py-1.5 flex items-center justify-between transition-colors"
                  >
                    <span className="text-[11px] text-[#0F172A] dark:text-[#F8FAFC] truncate max-w-[110px] font-semibold" title={sec.sector}>
                      {sec.sector}
                    </span>
                    <span className={`text-[11px] font-bold mono shrink-0 ${
                      isSecPos ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'
                    }`}>
                      {isSecPos ? '+' : ''}{sec.changePercent.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 text-[10px] text-[#64748B] dark:text-[#94A3B8] flex justify-between items-center border-t border-[#E2E8F0] dark:border-[#243044] mt-2">
            <span>Tracking {displaySectors.length} Sectors</span>
            <span className="text-[#16A34A] dark:text-[#22C55E] font-bold">Top: {sortedSectors[0]?.sector} (+{sortedSectors[0]?.changePercent}%)</span>
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
                        <div className="min-w-0 pr-2">
                          <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block truncate" title={sec.sector}>
                            {sec.sector}
                          </span>
                          {sec.volume > 0 && (
                            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono block">
                              Vol: {(sec.volume).toLocaleString()} shs
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-extrabold mono px-2.5 py-1 rounded-lg shrink-0 ${
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

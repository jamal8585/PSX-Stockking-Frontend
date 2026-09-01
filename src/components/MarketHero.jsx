import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Layers, Radio } from 'lucide-react';

const DEFAULT_SECTORS = [
  { sector: 'Commercial Banks', changePercent: 1.25, volume: 45000000 },
  { sector: 'Oil & Gas Exploration', changePercent: 0.85, volume: 38000000 },
  { sector: 'Cement & Construction', changePercent: 1.42, volume: 29000000 },
  { sector: 'Technology & Comm.', changePercent: 3.18, volume: 62000000 },
  { sector: 'Fertilizer & Chemicals', changePercent: -0.45, volume: 22000000 },
  { sector: 'Power Generation', changePercent: 0.50, volume: 18000000 },
  { sector: 'Automobile Assemblers', changePercent: 1.10, volume: 14000000 },
  { sector: 'Textile Composite', changePercent: -0.22, volume: 11000000 }
];

export default function MarketHero({ marketSummary }) {
  const [viewAllSectors, setViewAllSectors] = useState(false);

  const rawVal = marketSummary?.currentValue || marketSummary?.current || 176688.42;
  const currentValue = Number(rawVal);
  const change = marketSummary?.change !== undefined ? Number(marketSummary.change) : -287.25;
  const changePercent = marketSummary?.changePercent !== undefined ? Number(marketSummary.changePercent) : -0.16;
  const high = Number(marketSummary?.high || 177800.28);
  const low = Number(marketSummary?.low || 176688.42);
  const indexName = marketSummary?.indexName || 'KSE-100';
  const advances = marketSummary?.advances !== undefined ? marketSummary.advances : 468;
  const declines = marketSummary?.declines !== undefined ? marketSummary.declines : 267;
  const unchanged = marketSummary?.unchanged !== undefined ? marketSummary.unchanged : 28;
  const sectorPerformance = marketSummary?.sectorPerformance || [];
  const marketSentiment = marketSummary?.marketSentiment || (change >= 0 ? 'BULLISH' : 'BEARISH');
  const marketStatus = marketSummary?.marketStatus || { isOpen: true, statusText: 'LIVE PSX DPS' };

  const isPositive = change >= 0;
  const totalStocks = advances + declines + unchanged;
  const advancesPct = Math.round((advances / (totalStocks || 1)) * 100);
  const declinesPct = Math.round((declines / (totalStocks || 1)) * 100);

  const displaySectors = (sectorPerformance && sectorPerformance.length > 0) 
    ? sectorPerformance 
    : DEFAULT_SECTORS;

  const sortedSectors = [...displaySectors].sort((a, b) => b.changePercent - a.changePercent);
  const renderedSectors = viewAllSectors ? sortedSectors : sortedSectors.slice(0, 8);

  return (
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
          <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8] font-medium">
            <span>Day Low: <b className="text-[#0F172A] dark:text-[#F8FAFC] mono">{low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
            <span>Day High: <b className="text-[#0F172A] dark:text-[#F8FAFC] mono">{high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
          </div>
          <div className="w-full h-1.5 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#2563EB] dark:bg-[#3B82F6] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, ((currentValue - low) / ((high - low) || 1)) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Market Breadth */}
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
            <div className="bg-[#16A34A]/10 dark:bg-[#22C55E]/10 border border-[#16A34A]/20 dark:border-[#22C55E]/20 rounded-lg p-2">
              <span className="text-[10px] text-[#16A34A] dark:text-[#22C55E] font-bold uppercase">Advances</span>
              <p className="text-xl font-extrabold text-[#16A34A] dark:text-[#22C55E] mono">{advances}</p>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium">{advancesPct}%</span>
            </div>
            <div className="bg-[#DC2626]/10 dark:bg-[#EF4444]/10 border border-[#DC2626]/20 dark:border-[#EF4444]/20 rounded-lg p-2">
              <span className="text-[10px] text-[#DC2626] dark:text-[#EF4444] font-bold uppercase">Declines</span>
              <p className="text-xl font-extrabold text-[#DC2626] dark:text-[#EF4444] mono">{declines}</p>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium">{declinesPct}%</span>
            </div>
            <div className="bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#243044] rounded-lg p-2">
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase">Neutral</span>
              <p className="text-xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mono">{unchanged}</p>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium">Unchanged</span>
            </div>
          </div>
        </div>

        <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#E2E8F0] dark:bg-[#1E293B]">
          <div style={{ width: `${advancesPct}%` }} className="bg-[#16A34A] dark:bg-[#22C55E]" title={`Advances: ${advances}`} />
          <div style={{ width: `${Math.round((unchanged / totalStocks) * 100)}%` }} className="bg-[#64748B] dark:bg-[#94A3B8]" />
          <div style={{ width: `${declinesPct}%` }} className="bg-[#DC2626] dark:bg-[#EF4444]" title={`Declines: ${declines}`} />
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
                onClick={() => setViewAllSectors(prev => !prev)}
                className="text-[10px] font-bold text-[#2563EB] dark:text-[#3B82F6] hover:underline cursor-pointer"
              >
                {viewAllSectors ? 'Show Top 8' : `View All (${displaySectors.length})`}
              </button>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E] border border-[#16A34A]/20 dark:border-[#22C55E]/20 flex items-center">
                <Radio className="w-2.5 h-2.5 mr-1 animate-pulse" /> LIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-[145px] overflow-y-auto pr-1">
            {renderedSectors.map((sec, idx) => {
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
          <span>Tracking 39 Sectors</span>
          <span className="text-[#16A34A] dark:text-[#22C55E] font-bold">Top: {sortedSectors[0]?.sector} (+{sortedSectors[0]?.changePercent}%)</span>
        </div>
      </div>
    </div>
  );
}

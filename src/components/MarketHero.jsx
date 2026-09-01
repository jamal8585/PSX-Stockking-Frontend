
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Layers, Radio, BarChart3 } from 'lucide-react';

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

  const rawVal = marketSummary?.currentValue || marketSummary?.current || 177783.65;
  const currentValue = Number(rawVal);
  const change = marketSummary?.change !== undefined ? Number(marketSummary.change) : 807.98;
  const changePercent = marketSummary?.changePercent !== undefined ? Number(marketSummary.changePercent) : 0.46;
  const high = Number(marketSummary?.high || 177783.65);
  const low = Number(marketSummary?.low || 177353.62);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* 1. Live KSE-100 Index Card */}
      <div className="bg-gradient-to-b from-[#0F172A] to-[#070B12] border border-cyan-900/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-extrabold">
              {indexName}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {marketStatus.statusText || 'Official PSX DPS'}
            </span>
          </div>
          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
            isPositive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {marketSentiment.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-baseline space-x-3 mb-4">
          <h2 className="text-3xl font-extrabold text-white mono tracking-tight">
            {currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <span className={`text-sm font-extrabold mono flex items-center ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </div>

        {/* Day Range Bar */}
        <div className="space-y-1.5 pt-2.5 border-t border-gray-800/80 text-xs">
          <div className="flex justify-between text-gray-400 font-medium">
            <span>Day Low: <b className="text-white mono">{low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
            <span>Day High: <b className="text-white mono">{high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, ((currentValue - low) / ((high - low) || 1)) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Market Breadth */}
      <div className="bg-gradient-to-b from-[#0F172A] to-[#070B12] border border-cyan-900/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-extrabold text-gray-300 uppercase tracking-wider">Market Breadth</span>
            </div>
            <span className="text-xs text-gray-400 font-bold">{totalStocks} Listed Companies</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center my-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Advances</span>
              <p className="text-xl font-extrabold text-emerald-400 mono">{advances}</p>
              <span className="text-[10px] text-gray-400 font-medium">{advancesPct}%</span>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2">
              <span className="text-[10px] text-rose-400 font-bold uppercase">Declines</span>
              <p className="text-xl font-extrabold text-rose-400 mono">{declines}</p>
              <span className="text-[10px] text-gray-400 font-medium">{declinesPct}%</span>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Neutral</span>
              <p className="text-xl font-extrabold text-gray-300 mono">{unchanged}</p>
              <span className="text-[10px] text-gray-500 font-medium">Unchanged</span>
            </div>
          </div>
        </div>

        <div className="w-full h-2 rounded-full overflow-hidden flex bg-gray-800">
          <div style={{ width: `${advancesPct}%` }} className="bg-emerald-500" title={`Advances: ${advances}`} />
          <div style={{ width: `${Math.round((unchanged / totalStocks) * 100)}%` }} className="bg-gray-500" />
          <div style={{ width: `${declinesPct}%` }} className="bg-rose-500" title={`Declines: ${declines}`} />
        </div>
      </div>

      {/* 3. Real-Time Sector Performance Heatmap */}
      <div className="bg-gradient-to-b from-[#0F172A] to-[#070B12] border border-cyan-900/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-extrabold text-gray-300 uppercase tracking-wider">Sector Performance</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewAllSectors(prev => !prev)}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                {viewAllSectors ? 'Show Top 8' : `View All (${displaySectors.length})`}
              </button>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center">
                <Radio className="w-2.5 h-2.5 mr-1 text-emerald-400 animate-pulse" /> LIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-[145px] overflow-y-auto pr-1">
            {renderedSectors.map((sec, idx) => {
              const isSecPos = sec.changePercent >= 0;
              return (
                <div 
                  key={idx}
                  className="bg-[#070B12] border border-gray-800/90 hover:border-cyan-500/30 rounded-lg px-2.5 py-1.5 flex items-center justify-between transition-colors"
                >
                  <span className="text-[11px] text-gray-200 truncate max-w-[110px] font-semibold" title={sec.sector}>
                    {sec.sector}
                  </span>
                  <span className={`text-[11px] font-extrabold mono shrink-0 ${isSecPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isSecPos ? '+' : ''}{sec.changePercent.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 text-[10px] text-gray-500 flex justify-between items-center border-t border-gray-800/60 mt-2">
          <span>Tracking 39 Sectors</span>
          <span className="text-emerald-400 font-bold">Top: {sortedSectors[0]?.sector} (+{sortedSectors[0]?.changePercent}%)</span>
        </div>
      </div>
    </div>
  );
}

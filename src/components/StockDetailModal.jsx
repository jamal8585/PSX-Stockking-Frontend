
import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Calculator
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from 'recharts';

export default function StockDetailModal({ stock, onClose, onOpenCalculator }) {
  if (!stock) return null;

  const {
    symbol,
    name,
    sector,
    currentPrice,
    change,
    changePercent,
    high,
    low,
    peRatio,
    eps,
    dividendYield,
    technicals = {},
    historicalPrices = []
  } = stock;

  const isPositive = change >= 0;

  const chartData = historicalPrices.map(h => ({
    date: h.date?.slice(5) || h.date,
    price: h.close,
    volume: h.volume / 1000000,
    open: h.open,
    high: h.high,
    low: h.low
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pr-10">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-extrabold text-white mono">{symbol}</h2>
              <span className="px-2.5 py-0.5 rounded-md bg-gray-800 text-gray-300 text-xs font-semibold">
                {sector}
              </span>
            </div>
            <p className="text-sm text-gray-400">{name}</p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-extrabold text-white mono">
              PKR {currentPrice.toFixed(2)}
            </div>
            <span className={`text-xs font-bold mono flex items-center justify-end ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="bg-gray-900/90 rounded-2xl p-4 border border-gray-800 mb-6">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-gray-300 flex items-center">
              <Activity className="w-4 h-4 text-emerald-400 mr-1.5" /> 60-Day Price Movement & Technical Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} stroke="#6B7280" tick={{ fontSize: 10 }} orientation="right" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val) => ['PKR ' + val, 'Close Price']}
                />
                <Area type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#priceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center">
              <Layers className="w-3.5 h-3.5 text-cyan-400 mr-1.5" /> Technical Indicators Matrix
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-800/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">RSI (14)</span>
                <span className="font-bold text-emerald-400 mono">{technicals.rsi14 || 50}</span>
              </div>
              <div className="bg-gray-800/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">20 EMA</span>
                <span className="font-bold text-gray-200 mono">PKR {technicals.ema20}</span>
              </div>
              <div className="bg-gray-800/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">50 SMA</span>
                <span className="font-bold text-gray-200 mono">PKR {technicals.sma50}</span>
              </div>
              <div className="bg-gray-800/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">Volume Surge</span>
                <span className="font-bold text-amber-400 mono">{technicals.volumeSpikeRatio}x</span>
              </div>
              <div className="bg-gray-800/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">Support 1 (SL Anchor)</span>
                <span className="font-bold text-rose-400 mono">PKR {technicals.support1}</span>
              </div>
              <div className="bg-gray-800/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">Resistance 1 (Target)</span>
                <span className="font-bold text-emerald-400 mono">PKR {technicals.resistance1}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> Company Fundamentals
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-800/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">P/E Ratio</span>
                <span className="font-bold text-white mono">{peRatio || 6.5}x</span>
              </div>
              <div className="bg-gray-800/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">EPS (TTM)</span>
                <span className="font-bold text-white mono">PKR {eps || 15.0}</span>
              </div>
              <div className="bg-gray-800/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">Dividend Yield</span>
                <span className="font-bold text-emerald-400 mono">{dividendYield || 8.0}%</span>
              </div>
              <div className="bg-gray-800/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">Day High / Low</span>
                <span className="font-bold text-gray-200 mono">{high} / {low}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenCalculator({
                symbol,
                companyName: name,
                currentPrice,
                stopLoss: technicals.support1 || (currentPrice * 0.95),
                target1: technicals.resistance1 || (currentPrice * 1.08),
                signal: technicals.signal || 'HOLD'
              });
            }}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
          >
            <Calculator className="w-4 h-4" />
            <span>Open Darson Order Calculator</span>
          </button>
        </div>
      </div>
    </div>
  );
}

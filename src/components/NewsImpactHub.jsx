
import React, { useState } from 'react';
import { Newspaper, TrendingUp, TrendingDown, ArrowRight, ExternalLink, Filter, Sparkles, Building2 } from 'lucide-react';

export default function NewsImpactHub({ news, onSelectStock }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState('ALL');

  if (!news || !Array.isArray(news)) return null;

  const categories = [
    { id: 'ALL', label: 'All News' },
    { id: 'MACRO_ECONOMY', label: 'Macro & SBP' },
    { id: 'OIL_GAS', label: 'Oil & Gas' },
    { id: 'TECHNOLOGY', label: 'Technology' },
    { id: 'FERTILIZER', label: 'Fertilizer' },
    { id: 'CEMENT', label: 'Cement' },
    { id: 'COMMERCIAL_BANKS', label: 'Banks' }
  ];

  const filtered = news.filter(n => {
    if (selectedCategory !== 'ALL' && n.category !== selectedCategory) return false;
    if (selectedSentiment !== 'ALL' && n.sentiment !== selectedSentiment) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Newspaper className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                PSX Financial News & Sector Impact Analysis
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Real-time analysis of macroeconomic policies, earnings notices, and their specific positive/negative impact on PSX sectors and shares.
            </p>
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center space-x-2 bg-gray-900 p-1.5 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setSelectedSentiment('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                selectedSentiment === 'ALL' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Sentiments
            </button>
            <button
              onClick={() => setSelectedSentiment('POSITIVE')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
                selectedSentiment === 'POSITIVE' ? 'bg-emerald-500 text-black' : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Positive Impact</span>
            </button>
            <button
              onClick={() => setSelectedSentiment('NEGATIVE')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
                selectedSentiment === 'NEGATIVE' ? 'bg-rose-500 text-white' : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Negative Impact</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-800/80 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-semibold flex items-center shrink-0">
            <Filter className="w-3.5 h-3.5 mr-1" /> Category:
          </span>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-md text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* News Feed Cards */}
      <div className="space-y-4">
        {filtered.map((item, idx) => {
          const isPositive = item.sentiment === 'POSITIVE';
          const isNegative = item.sentiment === 'NEGATIVE';

          return (
            <div
              key={item._id || idx}
              className={`bg-[#111827] border rounded-2xl p-5 shadow-xl transition-all ${
                isPositive ? 'border-emerald-500/20 hover:border-emerald-500/40' : (isNegative ? 'border-rose-500/20 hover:border-rose-500/40' : 'border-gray-800')
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2.5 flex-1">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1 ${
                      isPositive 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                        : (isNegative ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-gray-800 text-gray-300')
                    }`}>
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : (isNegative ? <TrendingDown className="w-3.5 h-3.5 mr-1" /> : null)}
                      {item.sentiment} IMPACT
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 text-xs font-semibold">
                      {item.category?.replace('_', ' ')}
                    </span>

                    <span className="text-xs text-gray-400">
                      {item.source} • {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-base sm:text-lg font-bold text-white hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>

                  {/* AI Impact Summary */}
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-gray-900/60 p-3 rounded-xl border border-gray-800/80">
                    💡 <b className="text-gray-200">Market Impact:</b> {item.impactSummary}
                  </p>
                </div>

                {/* Directly Impacted Companies Box */}
                <div className="lg:w-80 bg-gray-900/90 rounded-xl p-3 border border-gray-800 shrink-0">
                  <div className="flex items-center space-x-1.5 mb-2">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Impacted PSX Companies</span>
                  </div>

                  <div className="space-y-2">
                    {item.impactedTickers && item.impactedTickers.map((ticker, tIdx) => {
                      const isBull = ticker.effect === 'BULLISH';
                      const isBear = ticker.effect === 'BEARISH';

                      return (
                        <div 
                          key={tIdx}
                          onClick={() => onSelectStock(ticker.symbol)}
                          className="group p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-emerald-500/40 cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-white text-xs mono group-hover:text-emerald-400 transition-colors">
                              {ticker.symbol}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isBull ? 'bg-emerald-500/20 text-emerald-400' : (isBear ? 'bg-rose-500/20 text-rose-400' : 'bg-gray-700 text-gray-300')
                            }`}>
                              {ticker.effect}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                            {ticker.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

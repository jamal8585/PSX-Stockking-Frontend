
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Bookmark, 
  BookmarkCheck, 
  Calculator, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';

export default function StockScreenerTable({
  stocks = [],
  onSelectStock,
  onOpenCalculator,
  onOpenDayTrade,
  onToggleWatchlist,
  watchlistSet = new Set()
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [marketView, setMarketView] = useState('ALL');
  const [sortField, setSortField] = useState('volume');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Extract all unique sectors dynamically from the stocks array
  const sectors = useMemo(() => {
    const set = new Set();
    stocks.forEach(s => {
      if (s.sector) set.add(s.sector);
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [stocks]);

  // Filter & Search logic
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      // 1. Search Query
      const q = searchTerm.toLowerCase().trim();
      const matchQuery = !q || 
        stock.symbol.toLowerCase().includes(q) || 
        (stock.name && stock.name.toLowerCase().includes(q));

      // 2. Sector Filter
      const matchSector = selectedSector === 'ALL' || stock.sector === selectedSector;

      // 3. Preset Quick Filter
      let matchPreset = true;
      if (activeFilter === 'KSE100') matchPreset = stock.isKse100;
      else if (activeFilter === 'STRONG_BUY') matchPreset = stock.technicals?.rsi14 < 45 && stock.currentPrice > (stock.technicals?.ema20 || 0);
      else if (activeFilter === 'HIGH_DIVIDEND') matchPreset = stock.dividendYield >= 8.0;
      else if (activeFilter === 'OVERSOLD') matchPreset = stock.technicals?.rsi14 < 35;

      // 4. Market View (High Volume / Gainers / Losers / Upper Lock / Lower Lock)
      let matchMarketView = true;
      const chgPct = Number(stock.changePercent || 0);
      const vol = Number(stock.volume || 0);

      if (marketView === 'HIGH_VOLUME') {
        matchMarketView = vol > 10000;
      } else if (marketView === 'TOP_GAINERS') {
        matchMarketView = chgPct > 0;
      } else if (marketView === 'TOP_LOSERS') {
        matchMarketView = chgPct < 0;
      } else if (marketView === 'UPPER_LOCK') {
        matchMarketView = chgPct >= 7.45;
      } else if (marketView === 'LOWER_LOCK') {
        matchMarketView = chgPct <= -7.45;
      }

      return matchQuery && matchSector && matchPreset && matchMarketView;
    });
  }, [stocks, searchTerm, selectedSector, activeFilter, marketView]);

  // Sorting
  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
      // If a specific marketView is active and sortField is default volume, prioritize view's natural sorting
      if (marketView === 'HIGH_VOLUME' && sortField === 'volume') {
        return (Number(b.volume) || 0) - (Number(a.volume) || 0);
      }
      if (marketView === 'TOP_GAINERS' && sortField === 'volume') {
        return (Number(b.changePercent) || 0) - (Number(a.changePercent) || 0);
      }
      if (marketView === 'TOP_LOSERS' && sortField === 'volume') {
        return (Number(a.changePercent) || 0) - (Number(b.changePercent) || 0);
      }
      if (marketView === 'UPPER_LOCK' && sortField === 'volume') {
        return (Number(b.changePercent) || 0) - (Number(a.changePercent) || 0) || (Number(b.volume) || 0) - (Number(a.volume) || 0);
      }
      if (marketView === 'LOWER_LOCK' && sortField === 'volume') {
        return (Number(a.changePercent) || 0) - (Number(b.changePercent) || 0) || (Number(b.volume) || 0) - (Number(a.volume) || 0);
      }

      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'rsi') {
        aVal = a.technicals?.rsi14 || 50;
        bVal = b.technicals?.rsi14 || 50;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      aVal = aVal || 0;
      bVal = bVal || 0;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredStocks, sortField, sortOrder, marketView]);

  // Pagination
  const totalPages = Math.ceil(sortedStocks.length / pageSize) || 1;
  const paginatedStocks = useMemo(() => {
    if (pageSize === -1) return sortedStocks;
    const start = (currentPage - 1) * pageSize;
    return sortedStocks.slice(start, start + pageSize);
  }, [sortedStocks, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getRSIColor = (rsi) => {
    if (!rsi) return 'text-gray-400';
    if (rsi >= 70) return 'text-rose-400 font-extrabold';
    if (rsi <= 35) return 'text-emerald-400 font-extrabold';
    return 'text-cyan-300';
  };

  return (
    <div className="bg-[#0D131F] border border-cyan-950/60 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header & Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-extrabold text-white tracking-tight">
              All PSX Listed Companies Screener
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold mono">
              {stocks.length} Listed Companies
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time screening across all 39 PSX sectors with live price, volume surge, RSI(14) & P/E valuations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search any ticker (e.g. OGDC, WTL, TELE)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#070B12] border border-cyan-900/60 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      {/* Filter Row: Sector Dropdown & Preset Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => { setActiveFilter('ALL'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeFilter === 'ALL' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            All Stocks ({stocks.length})
          </button>

          <button
            onClick={() => { setActiveFilter('KSE100'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeFilter === 'KSE100' ? 'bg-cyan-500 text-black' : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            KSE-100 Benchmark
          </button>

          <button
            onClick={() => { setActiveFilter('STRONG_BUY'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1 ${
              activeFilter === 'STRONG_BUY' ? 'bg-emerald-500 text-black' : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Bullish Setup</span>
          </button>

          <button
            onClick={() => { setActiveFilter('HIGH_DIVIDEND'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeFilter === 'HIGH_DIVIDEND' ? 'bg-teal-500 text-black' : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Dividend &gt; 8%
          </button>

          <button
            onClick={() => { setActiveFilter('OVERSOLD'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeFilter === 'OVERSOLD' ? 'bg-purple-500 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Oversold (RSI &lt; 35)
          </button>
        </div>

        {/* Dropdowns Row: Market Movers & Sector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Market Movers & Circuit Breakers Dropdown */}
          <div className="flex items-center space-x-1.5 bg-[#070B12] border border-cyan-500/50 hover:border-cyan-400 rounded-xl px-2.5 py-1.5 text-xs shadow-lg shadow-cyan-500/5 transition-all">
            <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={marketView}
              onChange={(e) => {
                setMarketView(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-cyan-300 font-extrabold text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-[#070B12] text-white">📊 All Market Stocks</option>
              <option value="HIGH_VOLUME" className="bg-[#070B12] text-cyan-400">🔥 High Volume Leaders</option>
              <option value="TOP_GAINERS" className="bg-[#070B12] text-emerald-400">🚀 Top Gainers</option>
              <option value="TOP_LOSERS" className="bg-[#070B12] text-rose-400">🔻 Top Losers</option>
              <option value="UPPER_LOCK" className="bg-[#070B12] text-emerald-300 font-bold">🟢 Upper Lock (+7.5% to +10%)</option>
              <option value="LOWER_LOCK" className="bg-[#070B12] text-rose-300 font-bold">🔴 Lower Lock (-7.5% to -10%)</option>
            </select>
          </div>

          {/* Sector Select Dropdown */}
          <div className="flex items-center space-x-1.5 bg-[#070B12] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-gray-200 font-medium text-xs focus:outline-none cursor-pointer max-w-[200px]"
            >
              <option value="ALL" className="bg-[#070B12] text-white">All Sectors (39 Sectors)</option>
              {sectors.filter(s => s !== 'ALL').map(sec => (
                <option key={sec} value={sec} className="bg-[#070B12] text-gray-200">{sec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Screener Data Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#070B12] text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-800">
            <tr>
              <th className="py-3 px-4">Symbol / Name</th>
              <th className="py-3 px-3">Sector</th>
              <th onClick={() => handleSort('currentPrice')} className="py-3 px-3 cursor-pointer hover:text-white">
                <div className="flex items-center space-x-1">
                  <span>Price (PKR)</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th onClick={() => handleSort('changePercent')} className="py-3 px-3 cursor-pointer hover:text-white">
                <div className="flex items-center space-x-1">
                  <span>24h Change</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th onClick={() => handleSort('volume')} className="py-3 px-3 cursor-pointer hover:text-white">
                <div className="flex items-center space-x-1">
                  <span>Volume</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th onClick={() => handleSort('rsi')} className="py-3 px-3 cursor-pointer hover:text-white">
                <div className="flex items-center space-x-1">
                  <span>RSI (14)</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th onClick={() => handleSort('peRatio')} className="py-3 px-3 cursor-pointer hover:text-white">
                <div className="flex items-center space-x-1">
                  <span>P/E</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th onClick={() => handleSort('dividendYield')} className="py-3 px-3 cursor-pointer hover:text-white">
                <div className="flex items-center space-x-1">
                  <span>Div Yield</span>
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 bg-[#0A0F1D]/50">
            {paginatedStocks.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400 font-medium">
                  No stocks match your search criteria. Try a different query.
                </td>
              </tr>
            ) : (
              paginatedStocks.map((stock) => {
                const isPos = stock.changePercent >= 0;
                const isWatch = watchlistSet.has(stock.symbol);
                const rsi = stock.technicals?.rsi14 || 50;

                return (
                  <tr 
                    key={stock.symbol}
                    className="hover:bg-cyan-500/5 transition-colors group"
                  >
                    {/* Symbol & Name */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onToggleWatchlist(stock.symbol)}
                          className="text-gray-500 hover:text-amber-400 transition-colors p-1"
                          title={isWatch ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          {isWatch ? (
                            <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span 
                              onClick={() => onSelectStock(stock.symbol)}
                              className="font-extrabold text-white mono hover:text-cyan-400 cursor-pointer text-sm"
                            >
                              {stock.symbol}
                            </span>
                            {stock.isKse100 && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                                KSE-100
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 block truncate max-w-[180px]">
                            {stock.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Sector */}
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-gray-800/80 text-gray-300 text-[11px] font-medium truncate max-w-[140px] block">
                        {stock.sector}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3 font-extrabold text-white mono text-xs">
                      PKR {stock.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Change % & Lock Indicator */}
                    <td className="py-2.5 px-3 font-extrabold mono text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className={`flex items-center ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPos ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {isPos ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                        {stock.changePercent >= 7.45 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold shrink-0">
                            UPPER LOCK
                          </span>
                        )}
                        {stock.changePercent <= -7.45 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-extrabold shrink-0">
                            LOWER LOCK
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-2.5 px-3 text-gray-300 mono text-xs font-semibold">
                      {stock.volume >= 1000000 
                        ? `${(stock.volume / 1000000).toFixed(2)}M` 
                        : (stock.volume ? stock.volume.toLocaleString() : '0')}
                    </td>

                    {/* RSI */}
                    <td className={`py-2.5 px-3 mono text-xs ${getRSIColor(rsi)}`}>
                      {rsi}
                    </td>

                    {/* PE Ratio */}
                    <td className="py-2.5 px-3 text-gray-300 mono text-xs">
                      {stock.peRatio ? stock.peRatio + 'x' : 'N/A'}
                    </td>

                    {/* Dividend Yield */}
                    <td className="py-2.5 px-3 text-emerald-400 mono text-xs font-semibold">
                      {stock.dividendYield ? stock.dividendYield + '%' : '0.0%'}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onOpenDayTrade && onOpenDayTrade(stock)}
                          className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500 hover:text-black text-cyan-400 transition-all cursor-pointer shadow-sm shadow-cyan-500/20"
                          title="💡 Today's Live Day Trade Suggestion & Setup"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenCalculator(stock)}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-cyan-500 hover:text-black text-gray-300 transition-colors cursor-pointer"
                          title="Open Position Sizer & Risk Calculator"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectStock(stock.symbol)}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-cyan-500 hover:text-black text-gray-300 transition-colors cursor-pointer"
                          title="Open Full Technical Chart"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <span>Showing <b>{paginatedStocks.length}</b> of <b>{sortedStocks.length}</b> stocks</span>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#070B12] border border-gray-800 rounded-lg px-2 py-1 text-white text-xs"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={-1}>All ({sortedStocks.length})</option>
            </select>
          </div>
        </div>

        {pageSize !== -1 && totalPages > 1 && (
          <div className="flex items-center space-x-1.5 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-[#070B12] border border-gray-800 rounded-lg text-white font-bold mono">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

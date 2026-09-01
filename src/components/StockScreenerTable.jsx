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
  Zap,
  Layers
} from 'lucide-react';

const KMI30_SET = new Set([
  'MEBL', 'HUBC', 'ENGRO', 'FFC', 'EFERT', 'LUCK', 'OGDC', 'PPL', 'MARI', 'POL', 
  'PSO', 'SYS', 'MLCF', 'DGKC', 'SEARL', 'INDU', 'MTL', 'MUGHAL', 'ISL', 'INIL', 
  'AGP', 'ABOT', 'CHCC', 'SNGP', 'ATRL', 'PRL', 'CNERGY', 'TOMCL', 'ILP', 'FATIMA'
]);

const KSE30_SET = new Set([
  'OGDC', 'PPL', 'MARI', 'POL', 'PSO', 'ENGRO', 'FFC', 'EFERT', 'LUCK', 'MEBL', 
  'MCB', 'HBL', 'UBL', 'HUBC', 'SYS', 'INDU', 'MTL', 'DGKC', 'MLCF', 'CHCC', 
  'PRL', 'ATRL', 'BAFL', 'BAHL', 'NBP', 'KAPCO', 'SEARL', 'ABOT', 'INIL', 'TRG'
]);

const OGTI_SET = new Set([
  'OGDC', 'PPL', 'MARI', 'POL', 'PSO', 'SNGP', 'SSGC', 'PRL', 'ATRL', 'NRL', 'CNERGY', 'HTL', 'SHEL'
]);

const BKTI_SET = new Set([
  'MEBL', 'MCB', 'HBL', 'UBL', 'BAFL', 'BAHL', 'NBP', 'BOP', 'BIPL', 'AKBL', 'SNBL', 'JSBL', 'FABL', 'SCBPL'
]);

const NON_SHARIAH_SECTORS = new Set([
  'commercial banks', 'investment banks/inv.cos./securities cos.', 'modarabas', 'leasing companies', 'insurance'
]);

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
  const [selectedIndex, setSelectedIndex] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [marketView, setMarketView] = useState('ALL');
  const [sortField, setSortField] = useState('volume');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const sectors = useMemo(() => {
    const set = new Set();
    stocks.forEach(s => {
      if (s.sector) set.add(s.sector);
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      const q = searchTerm.toLowerCase().trim();
      const matchQuery = !q || 
        stock.symbol.toLowerCase().includes(q) || 
        (stock.name && stock.name.toLowerCase().includes(q));

      const matchSector = selectedSector === 'ALL' || stock.sector === selectedSector;

      let matchPreset = true;
      if (activeFilter === 'KSE100') matchPreset = stock.isKse100;
      else if (activeFilter === 'STRONG_BUY') matchPreset = stock.technicals?.rsi14 < 45 && stock.currentPrice > (stock.technicals?.ema20 || 0);
      else if (activeFilter === 'HIGH_DIVIDEND') matchPreset = stock.dividendYield >= 8.0;
      else if (activeFilter === 'OVERSOLD') matchPreset = stock.technicals?.rsi14 < 35;

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

      let matchIndex = true;
      const symUpper = (stock.symbol || '').toUpperCase().trim();
      const secLower = (stock.sector || '').toLowerCase().trim();

      if (selectedIndex === 'KSE100') {
        matchIndex = stock.isKse100 === true;
      } else if (selectedIndex === 'KMI30') {
        matchIndex = KMI30_SET.has(symUpper) || (stock.shariahCompliant && stock.isKse100);
      } else if (selectedIndex === 'KSE30') {
        matchIndex = KSE30_SET.has(symUpper);
      } else if (selectedIndex === 'KMIALL') {
        matchIndex = stock.shariahCompliant === true || (!NON_SHARIAH_SECTORS.has(secLower) && !BKTI_SET.has(symUpper));
      } else if (selectedIndex === 'OGTI') {
        matchIndex = OGTI_SET.has(symUpper) || secLower.includes('oil') || secLower.includes('refinery');
      } else if (selectedIndex === 'BKTI') {
        matchIndex = BKTI_SET.has(symUpper) || secLower.includes('bank');
      }

      return matchQuery && matchSector && matchPreset && matchMarketView && matchIndex;
    });
  }, [stocks, searchTerm, selectedSector, activeFilter, marketView, selectedIndex]);

  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'rsi') {
        aVal = a.technicals?.rsi14 || 50;
        bVal = b.technicals?.rsi14 || 50;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredStocks, sortField, sortOrder]);

  const totalPages = pageSize === -1 ? 1 : Math.ceil(sortedStocks.length / pageSize);
  const paginatedStocks = useMemo(() => {
    if (pageSize === -1) return sortedStocks;
    const start = (currentPage - 1) * pageSize;
    return sortedStocks.slice(start, start + pageSize);
  }, [sortedStocks, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getRSIColor = (rsi) => {
    if (rsi <= 30) return 'text-[#16A34A] dark:text-[#22C55E] font-bold';
    if (rsi >= 70) return 'text-[#DC2626] dark:text-[#EF4444] font-bold';
    return 'text-[#64748B] dark:text-[#94A3B8]';
  };

  return (
    <div className="space-y-4">
      {/* Header & Search Bar */}
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-5 shadow-sm dark:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              PSX Multi-Sector Stock Screener
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#3B82F6] border border-[#2563EB]/20 dark:border-[#3B82F6]/20 text-xs font-bold mono">
              {stocks.length} Listed Companies
            </span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Real-time screening across all 39 PSX sectors with live price, volume surge, RSI(14) & P/E valuations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search any ticker (e.g. OGDC, WTL, TELE)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg pl-9 pr-4 py-2 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] transition-colors"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => { setActiveFilter('ALL'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeFilter === 'ALL' 
                ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm' 
                : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044]'
            }`}
          >
            All Stocks ({stocks.length})
          </button>

          <button
            onClick={() => { setActiveFilter('KSE100'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeFilter === 'KSE100' 
                ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm' 
                : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044]'
            }`}
          >
            KSE-100 Benchmark
          </button>

          <button
            onClick={() => { setActiveFilter('STRONG_BUY'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              activeFilter === 'STRONG_BUY' 
                ? 'bg-[#16A34A] dark:bg-[#22C55E] text-white shadow-sm' 
                : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Bullish Setup</span>
          </button>

          <button
            onClick={() => { setActiveFilter('HIGH_DIVIDEND'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeFilter === 'HIGH_DIVIDEND' 
                ? 'bg-[#D97706] dark:bg-[#F59E0B] text-white dark:text-black font-black shadow-sm' 
                : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044]'
            }`}
          >
            Dividend &gt; 8%
          </button>

          <button
            onClick={() => { setActiveFilter('OVERSOLD'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeFilter === 'OVERSOLD' 
                ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm' 
                : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044]'
            }`}
          >
            Oversold (RSI &lt; 35)
          </button>
        </div>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-2.5 py-1.5 text-xs">
            <Layers className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6] shrink-0" />
            <select
              value={selectedIndex}
              onChange={(e) => {
                setSelectedIndex(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#0F172A] dark:text-[#F8FAFC]">🏛️ All PSX Indices</option>
              <option value="KSE100" className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#0F172A] dark:text-[#F8FAFC]">📈 KSE-100 Benchmark</option>
              <option value="KMI30" className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#0F172A] dark:text-[#F8FAFC]">🕌 KMI-30 Islamic Shariah</option>
              <option value="KSE30" className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#0F172A] dark:text-[#F8FAFC]">💎 KSE-30 Top 30 Bluechips</option>
              <option value="KMIALL" className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#0F172A] dark:text-[#F8FAFC]">🌙 PSX KMI All-Shares</option>
              <option value="OGTI" className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#0F172A] dark:text-[#F8FAFC]">🛢️ OGTI Oil & Gas Index</option>
              <option value="BKTI" className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#0F172A] dark:text-[#F8FAFC]">🏦 BKTI Banking Sector Index</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-2.5 py-1.5 text-xs">
            <Zap className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6] shrink-0" />
            <select
              value={marketView}
              onChange={(e) => {
                setMarketView(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#0F172A] dark:text-[#F8FAFC]">📊 All Market Movers</option>
              <option value="HIGH_VOLUME" className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#0F172A] dark:text-[#F8FAFC]">🔥 High Volume Leaders</option>
              <option value="TOP_GAINERS" className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#0F172A] dark:text-[#F8FAFC]">🚀 Top Gainers</option>
              <option value="TOP_LOSERS" className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#0F172A] dark:text-[#F8FAFC]">🔻 Top Losers</option>
              <option value="UPPER_LOCK" className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#16A34A] dark:text-[#22C55E] font-bold">🟢 Upper Lock (+7.5% to +10%)</option>
              <option value="LOWER_LOCK" className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#DC2626] dark:text-[#EF4444] font-bold">🔴 Lower Lock (-7.5% to -10%)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8] shrink-0" />
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs focus:outline-none cursor-pointer max-w-[200px]"
            >
              <option value="ALL" className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#0F172A] dark:text-[#F8FAFC]">All Sectors (39 Sectors)</option>
              {sectors.filter(s => s !== 'ALL').map(sec => (
                <option key={sec} value={sec} className="bg-[#FFFFFF] dark:bg-[#151E2E] text-[#0F172A] dark:text-[#F8FAFC]">{sec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Screener Data Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] dark:border-[#243044] bg-[#FFFFFF] dark:bg-[#151E2E] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold text-[10px] tracking-wider border-b border-[#E2E8F0] dark:border-[#243044]">
            <tr>
              <th className="py-3 px-4">Symbol / Name</th>
              <th className="py-3 px-3">Sector</th>
              <th onClick={() => handleSort('currentPrice')} className="py-3 px-3 cursor-pointer hover:text-[#0F172A] dark:hover:text-[#F8FAFC]">
                <div className="flex items-center space-x-1">
                  <span>Price (PKR)</span>
                  <ArrowUpDown className="w-3 h-3 text-[#2563EB] dark:text-[#3B82F6]" />
                </div>
              </th>
              <th onClick={() => handleSort('changePercent')} className="py-3 px-3 cursor-pointer hover:text-[#0F172A] dark:hover:text-[#F8FAFC]">
                <div className="flex items-center space-x-1">
                  <span>24h Change</span>
                  <ArrowUpDown className="w-3 h-3 text-[#2563EB] dark:text-[#3B82F6]" />
                </div>
              </th>
              <th onClick={() => handleSort('volume')} className="py-3 px-3 cursor-pointer hover:text-[#0F172A] dark:hover:text-[#F8FAFC]">
                <div className="flex items-center space-x-1">
                  <span>Volume</span>
                  <ArrowUpDown className="w-3 h-3 text-[#2563EB] dark:text-[#3B82F6]" />
                </div>
              </th>
              <th onClick={() => handleSort('rsi')} className="py-3 px-3 cursor-pointer hover:text-[#0F172A] dark:hover:text-[#F8FAFC]">
                <div className="flex items-center space-x-1">
                  <span>RSI (14)</span>
                  <ArrowUpDown className="w-3 h-3 text-[#2563EB] dark:text-[#3B82F6]" />
                </div>
              </th>
              <th onClick={() => handleSort('peRatio')} className="py-3 px-3 cursor-pointer hover:text-[#0F172A] dark:hover:text-[#F8FAFC]">
                <div className="flex items-center space-x-1">
                  <span>P/E</span>
                  <ArrowUpDown className="w-3 h-3 text-[#2563EB] dark:text-[#3B82F6]" />
                </div>
              </th>
              <th onClick={() => handleSort('dividendYield')} className="py-3 px-3 cursor-pointer hover:text-[#0F172A] dark:hover:text-[#F8FAFC]">
                <div className="flex items-center space-x-1">
                  <span>Div Yield</span>
                  <ArrowUpDown className="w-3 h-3 text-[#2563EB] dark:text-[#3B82F6]" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243044]">
            {paginatedStocks.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[#64748B] dark:text-[#94A3B8] font-medium">
                  No stocks match your search criteria. Try a different query.
                </td>
              </tr>
            ) : (
              paginatedStocks.map((stock) => {
                const isPos = stock.changePercent >= 0;
                const isWatch = watchlistSet.has(stock.symbol);
                const rsi = stock.technicals?.rsi14 || 50;
                const symUpper = (stock.symbol || '').toUpperCase().trim();

                return (
                  <tr 
                    key={stock.symbol}
                    className="hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors group"
                  >
                    {/* Symbol & Name */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onToggleWatchlist(stock.symbol)}
                          className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#D97706] dark:hover:text-[#F59E0B] transition-colors p-1"
                          title={isWatch ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          {isWatch ? (
                            <BookmarkCheck className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B] fill-current" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                            <span 
                              onClick={() => onSelectStock(stock.symbol)}
                              className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mono hover:text-[#2563EB] dark:hover:text-[#3B82F6] cursor-pointer text-sm"
                            >
                              {stock.symbol}
                            </span>
                            {stock.isKse100 && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/10 dark:text-[#3B82F6] border border-[#2563EB]/20 dark:border-[#3B82F6]/20 font-bold">
                                KSE-100
                              </span>
                            )}
                            {KMI30_SET.has(symUpper) && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E] border border-[#16A34A]/20 dark:border-[#22C55E]/20 font-bold">
                                KMI-30
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block truncate max-w-[180px]">
                            {stock.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Sector */}
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#243044] text-[11px] font-medium truncate max-w-[140px] block">
                        {stock.sector}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3 font-bold text-[#0F172A] dark:text-[#F8FAFC] mono text-xs">
                      PKR {stock.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Change % */}
                    <td className="py-2.5 px-3 font-bold mono text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className={`flex items-center ${isPos ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
                          {isPos ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {isPos ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                        {stock.changePercent >= 7.45 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E] border border-[#16A34A]/20 dark:border-[#22C55E]/20 font-bold shrink-0">
                            UPPER LOCK
                          </span>
                        )}
                        {stock.changePercent <= -7.45 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#EF4444]/10 dark:text-[#EF4444] border border-[#DC2626]/20 dark:border-[#EF4444]/20 font-bold shrink-0">
                            LOWER LOCK
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-2.5 px-3 text-[#0F172A] dark:text-[#F8FAFC] mono text-xs font-semibold">
                      {stock.volume >= 1000000 
                        ? `${(stock.volume / 1000000).toFixed(2)}M` 
                        : (stock.volume ? stock.volume.toLocaleString() : '0')}
                    </td>

                    {/* RSI */}
                    <td className={`py-2.5 px-3 mono text-xs ${getRSIColor(rsi)}`}>
                      {rsi}
                    </td>

                    {/* PE Ratio */}
                    <td className="py-2.5 px-3 text-[#64748B] dark:text-[#94A3B8] mono text-xs">
                      {stock.peRatio ? stock.peRatio + 'x' : 'N/A'}
                    </td>

                    {/* Dividend Yield */}
                    <td className="py-2.5 px-3 text-[#16A34A] dark:text-[#22C55E] mono text-xs font-bold">
                      {stock.dividendYield ? stock.dividendYield + '%' : '0.0%'}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onOpenDayTrade && onOpenDayTrade(stock)}
                          className="p-1.5 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 border border-[#2563EB]/20 dark:border-[#3B82F6]/20 hover:bg-[#2563EB] hover:text-white dark:hover:bg-[#3B82F6] text-[#2563EB] dark:text-[#3B82F6] transition-all cursor-pointer"
                          title="Today's Live Day Trade Suggestion & Setup"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenCalculator(stock)}
                          className="p-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#2563EB] hover:text-white dark:hover:bg-[#3B82F6] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#243044] transition-colors cursor-pointer"
                          title="Open Position Sizer & Risk Calculator"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectStock(stock.symbol)}
                          className="p-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#2563EB] hover:text-white dark:hover:bg-[#3B82F6] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#243044] transition-colors cursor-pointer"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
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
              className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-2 py-1 text-[#0F172A] dark:text-[#F8FAFC] text-xs"
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
              className="p-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#E2E8F0] dark:hover:bg-[#243044] disabled:opacity-30 cursor-pointer border border-[#E2E8F0] dark:border-[#243044]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg text-[#0F172A] dark:text-[#F8FAFC] font-bold mono">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#E2E8F0] dark:hover:bg-[#243044] disabled:opacity-30 cursor-pointer border border-[#E2E8F0] dark:border-[#243044]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

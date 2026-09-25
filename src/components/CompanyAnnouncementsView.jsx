import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  FileText, 
  Calendar, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  AlertCircle,
  Briefcase,
  Layers,
  FileCheck,
  Download
} from 'lucide-react';
import { fetchStockAnnouncements } from '../services/api';

export default function CompanyAnnouncementsView({ stock, isDark = true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'financial' | 'board' | 'others'
  const [searchQuery, setSearchQuery] = useState('');

  const symbol = stock?.symbol || 'ATRL';

  useEffect(() => {
    let isMounted = true;
    const loadAnnouncements = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchStockAnnouncements(symbol);
        if (isMounted) {
          if (res?.success && res.data) {
            setData(res.data);
          } else {
            setError(`No announcements found for ${symbol}.`);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch announcements from PSX.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadAnnouncements();
    return () => { isMounted = false; };
  }, [symbol]);

  const counts = data?.counts || { total: 0, financialResults: 0, boardMeetings: 0, others: 0 };
  const categories = data?.categories || { financialResults: [], boardMeetings: [], others: [] };
  const allList = data?.all || [];

  // Filter by category
  const categoryFiltered = useMemo(() => {
    if (selectedCategory === 'financial') return categories.financialResults || [];
    if (selectedCategory === 'board') return categories.boardMeetings || [];
    if (selectedCategory === 'others') return categories.others || [];
    return allList;
  }, [selectedCategory, categories, allList]);

  // Filter by search query
  const displayedList = useMemo(() => {
    if (!searchQuery.trim()) return categoryFiltered;
    const q = searchQuery.toLowerCase().trim();
    return categoryFiltered.filter(item => 
      (item.title || '').toLowerCase().includes(q) ||
      (item.date || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q)
    );
  }, [categoryFiltered, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-9 h-9 text-sky-500 animate-spin" />
        <div className="text-center font-mono">
          <p className="text-sm font-bold text-gray-200">Retrieving Official PSX Announcements...</p>
          <p className="text-xs text-gray-500 mt-1">Connecting to official PSX regulatory filings database for {symbol}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-gray-900/60 border border-gray-800 rounded-2xl my-6">
        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-gray-300">No Announcements Found</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          {error || `There are no official regulatory notices on file for ${symbol}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* 1. HEADER BANNER */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isDark 
          ? 'bg-gradient-to-r from-sky-950/20 via-gray-900 to-gray-900 border-sky-500/20' 
          : 'bg-gradient-to-r from-sky-50 via-white to-white border-sky-200'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black tracking-wide text-gray-100">
              {symbol} Official PSX Regulatory Filings
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Direct PSX Feeds
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono">
            Official SECP & Pakistan Stock Exchange Disclosures • Verified PDF & Notice Letters
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-xl bg-gray-800/80 border border-gray-700 text-xs font-mono text-gray-300">
            Total Notices: <span className="font-bold text-sky-400">{counts.total}</span>
          </div>
        </div>
      </div>

      {/* 2. FILTER PILLS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-sky-500 text-black shadow-md shadow-sky-500/20'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            All Filings ({counts.total})
          </button>
          <button
            onClick={() => setSelectedCategory('financial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'financial'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Financial Results ({counts.financialResults})
          </button>
          <button
            onClick={() => setSelectedCategory('board')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'board'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Board Meetings ({counts.boardMeetings})
          </button>
          <button
            onClick={() => setSelectedCategory('others')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'others'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Corporate & Other ({counts.others})
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search notices (e.g. Dividend, Report)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>
      </div>

      {/* 3. TIMELINE OF ANNOUNCEMENTS */}
      <div className="space-y-3">
        {displayedList.map((item, idx) => {
          const isFinancial = /financial/i.test(item.category || '');
          const isBoard = /board/i.test(item.category || '');
          
          let badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
          if (isFinancial) badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
          else if (isBoard) badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

          return (
            <div
              key={`${item.date}_${idx}`}
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isDark 
                  ? 'bg-gray-900/60 hover:bg-gray-900/90 border-gray-800 hover:border-gray-700' 
                  : 'bg-white hover:bg-gray-50 border-gray-200 shadow-sm'
              }`}
            >
              <div className="space-y-1.5 flex-1 pr-2">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="flex items-center space-x-1 text-[11px] font-mono text-gray-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>{item.date}</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeColor}`}>
                    {item.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-200 leading-snug">
                  {item.title}
                </h4>
              </div>

              {item.docUrl ? (
                <a
                  href={item.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{item.isPdf ? 'View PDF' : 'View Notice'}</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>
              ) : (
                <span className="text-[11px] font-mono text-gray-500 italic shrink-0">
                  Notice on PSX Board
                </span>
              )}
            </div>
          );
        })}

        {displayedList.length === 0 && (
          <div className="p-12 text-center bg-gray-900/40 border border-gray-800 rounded-xl">
            <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-400 font-mono">No announcements match your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

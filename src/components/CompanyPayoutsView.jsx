import React, { useState, useEffect, useMemo } from 'react';
import { 
  Coins, 
  TrendingUp, 
  Calendar, 
  Award, 
  Layers, 
  Sparkles, 
  RefreshCw, 
  Search,
  ExternalLink,
  Info,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { fetchStockPayouts } from '../services/api';

export default function CompanyPayoutsView({ stock, isDark = true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchYear, setSearchYear] = useState('ALL');
  const [activeTab, setActiveTab] = useState('dividends'); // 'dividends' | 'bonus'
  const [hoveredBar, setHoveredBar] = useState(null);

  const symbol = stock?.symbol || 'FFC';

  useEffect(() => {
    let isMounted = true;
    const loadPayouts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchStockPayouts(symbol);
        if (isMounted) {
          if (res?.success && res.data) {
            setData(res.data);
          } else {
            setError(`No dividend or payout history available for ${symbol}.`);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch corporate payouts.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadPayouts();
    return () => { isMounted = false; };
  }, [symbol]);

  const summary = data?.summary || {};
  const dividends = data?.dividends || [];
  const bonusSplits = data?.bonusSplits || [];
  const yearlySummary = data?.yearlySummary || [];

  // Available Years for filter
  const yearsList = useMemo(() => {
    const s = new Set();
    dividends.forEach(d => s.add(d.year));
    return ['ALL', ...Array.from(s).sort((a, b) => Number(b) - Number(a))];
  }, [dividends]);

  // Filtered dividends list
  const filteredDividends = useMemo(() => {
    if (searchYear === 'ALL') return dividends;
    return dividends.filter(d => d.year === searchYear);
  }, [dividends, searchYear]);

  // Max yearly amount for SVG chart scaling
  const maxYearly = useMemo(() => {
    if (!yearlySummary || yearlySummary.length === 0) return 10;
    return Math.max(...yearlySummary.map(y => y.totalAmount), 10);
  }, [yearlySummary]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-9 h-9 text-amber-500 animate-spin" />
        <div className="text-center font-mono">
          <p className="text-sm font-bold text-gray-200">Loading Official PSX Payouts & Dividends...</p>
          <p className="text-xs text-gray-500 mt-1">Retrieving official ex-dates and dividend yields for {symbol}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-gray-900/60 border border-gray-800 rounded-2xl my-6">
        <Coins className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-gray-300">No Corporate Actions Found</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          {error || `This company currently does not have cash dividends or bonus share records on the official PSX registry.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* 1. HEADER BANNER */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isDark 
          ? 'bg-gradient-to-r from-amber-950/20 via-gray-900 to-gray-900 border-amber-500/20' 
          : 'bg-gradient-to-r from-amber-50 via-white to-white border-amber-200'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black tracking-wide text-gray-100">
              {symbol} Payouts & Dividend Intelligence
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              100% PSX Official
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono">
            Source: PSX Corporate Action Registry & SECP Filings • Currency: PKR per share
          </p>
        </div>

        {summary.latestDividend && (
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-right">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Latest Dividend</div>
            <div className="text-base font-black text-white font-mono">
              Rs. {summary.latestDividend.amount.toFixed(2)}
            </div>
            <div className="text-[10px] text-gray-400 font-mono">Ex-Date: {summary.latestDividend.date}</div>
          </div>
        )}
      </div>

      {/* 2. TOP 4 METRIC KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* TTM Dividend */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold mb-1">
            <span>TTM Dividend</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
            Rs. {summary.ttmDividend ? summary.ttmDividend.toFixed(2) : '0.00'}
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">Past 12 Months Cash Payout</div>
        </div>

        {/* Dividend Yield */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold mb-1">
            <span>Dividend Yield</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
            {summary.dividendYield ? summary.dividendYield.toFixed(2) : '0.00'}%
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">Annual Cash Return on Price</div>
        </div>

        {/* Total Historic Payouts */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold mb-1">
            <span>Total Payouts</span>
            <Award className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-sky-400">
            {summary.totalPayoutsCount || 0}
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">Corporate Dividend Events</div>
        </div>

        {/* Bonus / Splits */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold mb-1">
            <span>Bonus & Splits</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-purple-400">
            {bonusSplits.length}
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">
            {summary.latestBonus ? `Latest: ${summary.latestBonus.ratio}` : 'Capital Structuring'}
          </div>
        </div>
      </div>

      {/* 3. YEARLY DIVIDENDS VISUAL BAR CHART */}
      {yearlySummary.length > 0 && (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-200">Yearly Total Dividends Paid (PKR / Share)</h3>
              <p className="text-[11px] text-gray-500 font-mono">Cumulative annual payout per share</p>
            </div>
            {hoveredBar && (
              <div className="text-right text-xs font-mono">
                <span className="text-gray-400">{hoveredBar.year}: </span>
                <span className="text-amber-400 font-black">Rs. {hoveredBar.totalAmount.toFixed(2)} </span>
                <span className="text-gray-500 text-[10px]">({hoveredBar.count} payouts)</span>
              </div>
            )}
          </div>

          {/* SVG Bar Chart */}
          <div className="w-full h-44 flex items-end justify-between space-x-2 sm:space-x-4 pt-6 pb-2 px-2 border-b border-gray-800/80">
            {yearlySummary.map((yr, idx) => {
              const heightPct = Math.max(12, Math.min(100, Math.round((yr.totalAmount / maxYearly) * 100)));
              const isHovered = hoveredBar?.year === yr.year;
              return (
                <div 
                  key={yr.year}
                  onMouseEnter={() => setHoveredBar(yr)}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer transition-all"
                >
                  <div className="text-[10px] font-mono text-gray-400 group-hover:text-amber-300 mb-1 transition-colors">
                    Rs. {yr.totalAmount.toFixed(1)}
                  </div>
                  <div 
                    className={`w-full max-w-[48px] rounded-t-lg transition-all duration-300 ${
                      isHovered 
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-lg shadow-amber-500/20' 
                        : 'bg-gradient-to-t from-emerald-600/70 to-emerald-400/90 hover:from-emerald-500 hover:to-emerald-300'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <div className="text-xs font-mono font-bold text-gray-400 group-hover:text-white mt-2">
                    {yr.year}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TABS: DIVIDEND LEDGER vs BONUS / SPLITS */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('dividends')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dividends'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Cash Dividends ({dividends.length})
          </button>
          <button
            onClick={() => setActiveTab('bonus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bonus'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Bonus & Splits ({bonusSplits.length})
          </button>
        </div>

        {activeTab === 'dividends' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-mono hidden sm:inline">Year:</span>
            <select
              value={searchYear}
              onChange={(e) => setSearchYear(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-gray-200 text-xs font-mono rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500"
            >
              {yearsList.map(y => (
                <option key={y} value={y}>{y === 'ALL' ? 'All Years' : y}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 5. DIVIDENDS LEDGER TABLE */}
      {activeTab === 'dividends' && (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/40">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-gray-800/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Ex-Dividend Date</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4 text-right">Dividend (PKR)</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredDividends.map((div, i) => (
                <tr key={`${div.timestamp}_${i}`} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4 text-gray-500 font-mono">{i + 1}</td>
                  <td className="py-3 px-4 text-gray-200 font-bold flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400/80" />
                    <span>{div.date}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{div.year}</td>
                  <td className="py-3 px-4 text-right font-black text-emerald-400 text-sm">
                    Rs. {div.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {div.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center space-x-1 text-[10px] text-gray-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Disbursed</span>
                    </span>
                  </td>
                </tr>
              ))}
              {filteredDividends.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No dividends recorded for selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. BONUS SHARES & SPLITS TABLE */}
      {activeTab === 'bonus' && (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/40">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-gray-800/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Split / Bonus Ratio</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {bonusSplits.map((item, i) => (
                <tr key={`${item.timestamp}_${i}`} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4 text-gray-200 font-bold">{item.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-black text-amber-400">{item.ratio}</td>
                  <td className="py-3 px-4 text-right text-gray-400">
                    {item.numerator} shares for every {item.denominator} held
                  </td>
                </tr>
              ))}
              {bonusSplits.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No bonus shares or stock split events recorded for {symbol}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

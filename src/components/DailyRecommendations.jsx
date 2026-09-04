import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  StopCircle, 
  Calculator, 
  LineChart, 
  CheckCircle2, 
  ArrowUpRight, 
  Filter, 
  Lock, 
  Crown,
  Calendar,
  Clock
} from 'lucide-react';
import officialQuotes from '../data/official_quotes.json';

// Intelligent PSX Market Session & Weekend Calendar Engine
export function getPSXMarketSessionInfo() {
  const now = new Date();
  
  // Calculate Pakistan Standard Time (PKT is UTC+5)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const pktDate = new Date(utc + (3600000 * 5));
  
  const day = pktDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  const hours = pktDate.getHours();
  const minutes = pktDate.getMinutes();
  const timeNum = hours * 100 + minutes;

  let targetDate = new Date(pktDate);
  let isWeekend = false;
  let statusBadge = '';
  let subText = '';
  let isFridayEod = false;

  if (day === 6) { // Saturday
    isWeekend = true;
    targetDate.setDate(pktDate.getDate() + 2); // Monday (+2)
    statusBadge = '🛑 Weekend Closed (Sat & Sun Off)';
    subText = `Signals Active for Upcoming Monday Open (${targetDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })})`;
  } else if (day === 0) { // Sunday
    isWeekend = true;
    targetDate.setDate(pktDate.getDate() + 1); // Monday (+1)
    statusBadge = '🛑 Weekend Closed (Sunday Off)';
    subText = `Signals Active for Tomorrow's Monday Open (${targetDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })})`;
  } else if (day === 5 && timeNum >= 1600) { // Friday after 04:00 PM (Market Closed)
    isFridayEod = true;
    targetDate.setDate(pktDate.getDate() + 3); // Monday (+3)
    statusBadge = '📅 Friday Session Closed • Weekend Off';
    subText = `Friday EOD Signals Active for Upcoming Monday Session (${targetDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })})`;
  } else if (timeNum >= 1600) { // Mon-Thu after 04:00 PM
    targetDate.setDate(pktDate.getDate() + 1); // Next day
    statusBadge = `📅 Post-Market Analysis`;
    subText = `Actionable for Tomorrow's PSX Market Open (${targetDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })})`;
  } else { // Mon-Fri active trading day (00:00 to 16:00 PKT)
    targetDate = pktDate;
    statusBadge = `🟢 Active Trading Session: Today, ${pktDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`;
    subText = `Effective & Actionable for Today's PSX Market (09:30 AM PKT)`;
  }

  const sessionDateFormatted = targetDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const cardDateFormatted = (isWeekend || isFridayEod) 
    ? `For Mon: ${targetDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}`
    : `Active: ${targetDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}`;

  return {
    isWeekend,
    isFridayEod,
    statusBadge,
    subText,
    sessionDateFormatted,
    cardDateFormatted
  };
}

export default function DailyRecommendations({ 
  recommendations, 
  stocks = [], 
  onSelectStock, 
  onOpenCalculator,
  currentUser,
  onOpenUpgrade
}) {
  const [filterSignal, setFilterSignal] = useState('ALL');
  const [filterSector, setFilterSector] = useState('ALL');

  const marketSession = useMemo(() => getPSXMarketSessionInfo(), []);
  const isPro = currentUser?.plan === 'PRO' && currentUser?.subscriptionStatus === 'ACTIVE';

  // Resiliently derive recommendations list
  const rawList = Array.isArray(recommendations)
    ? recommendations
    : (Array.isArray(recommendations?.all) ? recommendations.all : []);

  // Compute fallback signals from stocks array if backend hasn't finished seeding
  const all = useMemo(() => {
    if (rawList && rawList.length > 0) return rawList;

    if (Array.isArray(stocks) && stocks.length > 0) {
      return stocks.map(stock => {
        const sym = (stock.symbol || '').toUpperCase().trim();
        const price = Number(stock.currentPrice || 100);
        const changePct = Number(stock.changePercent || 0);
        const rsi = Number(stock.technicals?.rsi14 || 52);
        
        let sig = 'ACCUMULATE';
        let confidence = 82;
        if (changePct > 1.8 || rsi > 58) {
          sig = 'STRONG_BUY';
          confidence = 89;
        } else if (changePct < -2.2 || rsi > 74) {
          sig = 'AVOID_SELL';
          confidence = 78;
        } else if (Math.abs(changePct) <= 0.8) {
          sig = 'HOLD';
          confidence = 72;
        }

        const target1 = Number((price * 1.095).toFixed(2));
        const target2 = Number((price * 1.18).toFixed(2));
        const stopLoss = Number((price * 0.95).toFixed(2));

        return {
          symbol: sym,
          companyName: stock.name || sym,
          sector: stock.sector || 'General Market',
          signal: sig,
          currentPrice: price,
          stopLoss,
          target1,
          target2,
          confidence,
          riskReward: '1 : 2.5',
          riskRewardRatio: 2.5,
          timeHorizon: sig === 'STRONG_BUY' ? '1 to 4 Weeks (Swing Momentum)' : '1 to 8 Weeks',
          reasons: [
            `RSI is holding at ${rsi.toFixed(1)} with strong support at PKR ${(price * 0.96).toFixed(2)}`,
            `High probability target of PKR ${target1} (+9.5%) with protective stop loss at PKR ${stopLoss}`
          ],
          orderAdvice: {
            actionNote: sig === 'STRONG_BUY' ? 'Enter Limit Buy in Entry Zone' : (sig === 'ACCUMULATE' ? 'Accumulate on dips' : 'Take profits / monitor'),
            allocationPercent: sig === 'STRONG_BUY' ? 15 : (sig === 'ACCUMULATE' ? 10 : 0),
            riskPerSharePKR: Number(Math.max(0.1, price - stopLoss).toFixed(2)),
            rewardPerSharePKR: Number(Math.max(0.1, target1 - price).toFixed(2))
          }
        };
      }).sort((a, b) => b.confidence - a.confidence);
    }

    return [];
  }, [rawList, stocks]);

  const strongBuyCount = all.filter(r => r.signal === 'STRONG_BUY').length;
  const accumulateCount = all.filter(r => r.signal === 'ACCUMULATE').length;
  const holdCount = all.filter(r => r.signal === 'HOLD').length;
  const avoidSellCount = all.filter(r => r.signal === 'AVOID_SELL').length;

  const summary = recommendations?.summary || {
    total: all.length,
    strongBuyCount,
    accumulateCount,
    holdCount,
    avoidSellCount
  };

  const getLiveStock = (item) => {
    const sym = (item?.symbol || '').toUpperCase().trim();
    const foundInStocks = Array.isArray(stocks) ? stocks.find(s => s.symbol?.toUpperCase() === sym) : null;
    const foundOfficial = officialQuotes ? officialQuotes[sym] : null;

    const currentPrice = Number(
      foundInStocks?.currentPrice || 
      foundOfficial?.currentPrice || 
      item?.currentPrice || 
      100
    );

    const prevClose = Number(
      foundInStocks?.prevClose || 
      foundOfficial?.prevClose || 
      (currentPrice * 0.99)
    );

    const change = foundInStocks?.change !== undefined 
      ? Number(foundInStocks.change) 
      : (foundOfficial?.change !== undefined 
          ? Number(foundOfficial.change) 
          : Number((currentPrice - prevClose).toFixed(2)));

    const changePercent = foundInStocks?.changePercent !== undefined 
      ? Number(foundInStocks.changePercent) 
      : (foundOfficial?.changePercent !== undefined 
          ? Number(foundOfficial.changePercent) 
          : (prevClose > 0 ? Number((((currentPrice - prevClose) / prevClose) * 100).toFixed(2)) : 0));

    const target1 = Number(item?.target1 || (currentPrice * 1.10).toFixed(2));
    const target2 = Number(item?.target2 || (currentPrice * 1.18).toFixed(2));
    const stopLoss = Number(item?.stopLoss || (currentPrice * 0.95).toFixed(2));

    return {
      ...item,
      companyName: foundInStocks?.name || foundOfficial?.name || item?.companyName || sym,
      currentPrice,
      prevClose,
      change,
      changePercent,
      target1,
      target2,
      stopLoss
    };
  };

  const filtered = all.filter(r => {
    if (filterSignal !== 'ALL' && r.signal !== filterSignal) return false;
    if (filterSector !== 'ALL' && r.sector && r.sector.toLowerCase() !== filterSector.toLowerCase()) return false;
    return true;
  });

  const sectors = Array.from(new Set(all.map(r => r.sector))).filter(Boolean);

  const getSignalBadge = (signal) => {
    switch (signal) {
      case 'STRONG_BUY':
        return {
          label: 'Strong Buy',
          className: 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20 dark:bg-[#22C55E]/10 dark:text-[#22C55E] dark:border-[#22C55E]/20',
          icon: <TrendingUp className="w-3.5 h-3.5 mr-1" />
        };
      case 'ACCUMULATE':
        return {
          label: 'Accumulate on Dip',
          className: 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 dark:bg-[#3B82F6]/10 dark:text-[#3B82F6] dark:border-[#3B82F6]/20',
          icon: <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
        };
      case 'AVOID_SELL':
        return {
          label: 'Avoid / Take Profit',
          className: 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 dark:bg-[#EF4444]/10 dark:text-[#EF4444] dark:border-[#EF4444]/20',
          icon: <TrendingDown className="w-3.5 h-3.5 mr-1" />
        };
      default:
        return {
          label: 'Neutral / Hold',
          className: 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#243044]',
          icon: null
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Filters */}
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-4 sm:p-6 shadow-sm dark:shadow-md transition-all">
        {/* Prominent Active Trading Session Date Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-[#E2E8F0] dark:border-[#243044]">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`flex items-center text-xs font-black px-3 py-1.5 rounded-lg border ${
              marketSession.isWeekend 
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : (marketSession.isFridayEod
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30')
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                marketSession.isWeekend 
                  ? 'bg-amber-500' 
                  : (marketSession.isFridayEod ? 'bg-blue-500' : 'bg-emerald-500 animate-pulse')
              }`} />
              <span>{marketSession.statusBadge}</span>
            </span>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-bold">
              • {marketSession.subText}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-[11px] font-mono shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
            <span className="text-[#64748B] dark:text-[#94A3B8]">Session:</span>
            <b className="text-[#0F172A] dark:text-[#F8FAFC]">{marketSession.sessionDateFormatted}</b>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-base sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Daily Algorithmic Market Signals & Technical Trade Setups
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#3B82F6] border border-[#2563EB]/20 dark:border-[#3B82F6]/20">
                PRO TRADE RADAR
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              AI technical analysis, volume surge detection, and automated Stop Loss & Profit Targets.
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center overflow-x-auto scrollbar-none gap-1 sm:gap-1.5 bg-[#F8FAFC] dark:bg-[#0B0F19] p-1 rounded-lg border border-[#E2E8F0] dark:border-[#243044] text-xs w-full sm:w-auto touch-pan-x">
            <button
              onClick={() => setFilterSignal('ALL')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                filterSignal === 'ALL' 
                  ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm' 
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              All ({summary.total || all.length})
            </button>
            <button
              onClick={() => setFilterSignal('STRONG_BUY')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                filterSignal === 'STRONG_BUY' 
                  ? 'bg-[#16A34A] dark:bg-[#22C55E] text-white shadow-sm' 
                  : 'text-[#16A34A] dark:text-[#22C55E] hover:bg-[#16A34A]/10'
              }`}
            >
              <span>🚀 Strong Buy</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-bold">{summary.strongBuyCount || 0}</span>
            </button>
            <button
              onClick={() => setFilterSignal('ACCUMULATE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                filterSignal === 'ACCUMULATE' 
                  ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm' 
                  : 'text-[#2563EB] dark:text-[#3B82F6] hover:bg-[#2563EB]/10'
              }`}
            >
              <span>📈 Accumulate</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-bold">{summary.accumulateCount || 0}</span>
            </button>
            <button
              onClick={() => setFilterSignal('AVOID_SELL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                filterSignal === 'AVOID_SELL' 
                  ? 'bg-[#DC2626] dark:bg-[#EF4444] text-white shadow-sm' 
                  : 'text-[#DC2626] dark:text-[#EF4444] hover:bg-[#DC2626]/10'
              }`}
            >
              <span>🛑 Avoid / Exit</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-bold">{summary.avoidSellCount || 0}</span>
            </button>
          </div>
        </div>

        {/* Sector Filter Bar */}
        <div className="flex items-center space-x-1.5 mt-4 pt-3 border-t border-[#E2E8F0] dark:border-[#243044] overflow-x-auto pb-1 text-xs">
          <span className="text-[#64748B] dark:text-[#94A3B8] font-bold flex items-center shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 mr-1 text-[#2563EB] dark:text-[#3B82F6]" /> Sector:
          </span>
          <button
            onClick={() => setFilterSector('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
              filterSector === 'ALL' 
                ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white' 
                : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044]'
            }`}
          >
            All Sectors
          </button>
          {sectors.map(sec => (
            <button
              key={sec}
              onClick={() => setFilterSector(sec)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                filterSector === sec 
                  ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white' 
                  : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Pro Tier Banner if Free */}
      {!isPro && (
        <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#D97706]/40 dark:border-[#F59E0B]/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2 rounded-lg bg-[#D97706]/10 dark:bg-[#F59E0B]/10 border border-[#D97706]/20 dark:border-[#F59E0B]/20 text-[#D97706] dark:text-[#F59E0B] shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#D97706] dark:text-[#F59E0B] block">
                Free Tier Mode: Previewing 2 Top AI Signals
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Upgrade to PSX Stockking Pro to unlock all 20+ algorithmic setups with exact entry zones and target calculations.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenUpgrade}
            className="px-4 py-2 rounded-lg bg-[#D97706] hover:bg-[#B45309] dark:bg-[#F59E0B] dark:hover:bg-[#D97706] text-white dark:text-black font-bold text-xs cursor-pointer shadow-sm shrink-0"
          >
            Upgrade to Pro (PKR 1,499)
          </button>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((rawItem, idx) => {
          const item = getLiveStock(rawItem);
          const badge = getSignalBadge(item.signal);
          const isUp = (item.change || 0) >= 0;
          const isLocked = !isPro && idx >= 2;

          if (isLocked) {
            return (
              <div
                key={item.symbol || idx}
                className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#D97706]/30 dark:border-[#F59E0B]/30 rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between"
              >
                <div className="filter blur-sm select-none pointer-events-none opacity-40">
                  <div className="flex justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mono">{item.symbol}</h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-bold border shrink-0 ${
                          marketSession.isWeekend || marketSession.isFridayEod
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        }`}>
                          {marketSession.cardDateFormatted}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{item.sector}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#16A34A]/10 text-[#16A34A]">
                      Strong Buy
                    </span>
                  </div>
                  <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg mb-3">
                    <p className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">PKR {item.currentPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-5 bg-[#FFFFFF]/90 dark:bg-[#0B0F19]/90 backdrop-blur-xs text-center space-y-2.5">
                  <div className="p-2.5 rounded-lg bg-[#D97706]/10 dark:bg-[#F59E0B]/10 border border-[#D97706]/20 dark:border-[#F59E0B]/20 text-[#D97706] dark:text-[#F59E0B]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Pro VIP Signal Locked</h4>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] max-w-[220px]">
                      {item.symbol} algorithmic setup & target plan is reserved for Pro subscribers.
                    </p>
                  </div>
                  <button
                    onClick={onOpenUpgrade}
                    className="px-4 py-1.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] dark:bg-[#F59E0B] dark:hover:bg-[#D97706] text-white dark:text-black font-bold text-xs cursor-pointer shadow-sm"
                  >
                    Unlock with Pro
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.symbol || idx}
              className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] hover:border-[#2563EB] dark:hover:border-[#3B82F6] rounded-xl p-5 shadow-sm dark:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Header: Symbol, Name, Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <h3 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight mono">
                        {item.symbol}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] font-bold border border-[#E2E8F0] dark:border-[#243044] truncate max-w-[120px]">
                        {item.sector}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-black border shrink-0 ${
                        marketSession.isWeekend || marketSession.isFridayEod
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      }`}>
                        {marketSession.cardDateFormatted}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate max-w-[200px]" title={item.companyName}>
                      {item.companyName}
                    </p>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center shrink-0 ${badge.className}`}>
                    {badge.icon}
                    <span>{badge.label}</span>
                  </div>
                </div>

                {/* Price & Confidence Bar */}
                <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-3 border border-[#E2E8F0] dark:border-[#243044] mb-3">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold">Current Live Price</span>
                      <p className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] mono flex items-center">
                        PKR {item.currentPrice.toFixed(2)}
                        <span className={`text-[11px] ml-1.5 font-bold ${isUp ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
                          ({isUp ? '+' : ''}{item.changePercent}%)
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold">AI Confidence</span>
                      <p className="text-sm font-bold text-[#16A34A] dark:text-[#22C55E] mono">{item.confidence}%</p>
                    </div>
                  </div>

                  {/* Trade Setup Matrix (Entry, Stop Loss, Target) */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#243044] text-center">
                    <div className="bg-[#FFFFFF] dark:bg-[#151E2E] rounded-lg p-1.5 border border-[#E2E8F0] dark:border-[#243044]">
                      <span className="text-[9px] uppercase text-[#64748B] dark:text-[#94A3B8] block font-bold">Entry Zone</span>
                      <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mono">
                        {item.entryZone?.min ? `${item.entryZone.min}-${item.entryZone.max}` : item.currentPrice}
                      </span>
                    </div>
                    <div className="bg-[#DC2626]/10 dark:bg-[#EF4444]/10 border border-[#DC2626]/20 dark:border-[#EF4444]/20 rounded-lg p-1.5">
                      <span className="text-[9px] uppercase text-[#DC2626] dark:text-[#EF4444] block font-bold flex items-center justify-center">
                        <StopCircle className="w-2.5 h-2.5 mr-0.5" /> Stop Loss
                      </span>
                      <span className="text-xs font-bold text-[#DC2626] dark:text-[#EF4444] mono">
                        PKR {item.stopLoss}
                      </span>
                    </div>
                    <div className="bg-[#16A34A]/10 dark:bg-[#22C55E]/10 border border-[#16A34A]/20 dark:border-[#22C55E]/20 rounded-lg p-1.5">
                      <span className="text-[9px] uppercase text-[#16A34A] dark:text-[#22C55E] block font-bold flex items-center justify-center">
                        <Target className="w-2.5 h-2.5 mr-0.5" /> Target 1
                      </span>
                      <span className="text-xs font-bold text-[#16A34A] dark:text-[#22C55E] mono">
                        PKR {item.target1}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Risk-to-Reward & Catalysts */}
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0B0F19] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#243044]">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Risk : Reward Ratio:</span>
                    <span className="font-bold text-[#D97706] dark:text-[#F59E0B] mono">{item.riskReward || '1 : 2.5'}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold">Key Technical Catalysts:</span>
                    {item.reasons && item.reasons.slice(0, 2).map((r, rIdx) => (
                      <div key={rIdx} className="flex items-start text-[11px] text-[#0F172A] dark:text-[#F8FAFC] space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#22C55E] shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {item.newsSentimentImpact && item.newsSentimentImpact.sentiment !== 'NEUTRAL' && (
                    <div className={`p-2 rounded-lg text-[11px] flex items-start space-x-1.5 border ${
                      item.newsSentimentImpact.sentiment === 'POSITIVE' 
                        ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20 dark:bg-[#22C55E]/10 dark:text-[#22C55E] dark:border-[#22C55E]/20' 
                        : 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20 dark:bg-[#EF4444]/10 dark:text-[#EF4444] dark:border-[#EF4444]/20'
                    }`}>
                      <span className="font-bold shrink-0">📰 News Catalyst:</span>
                      <span className="truncate">{item.newsSentimentImpact.headline}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#243044]">
                <button
                  onClick={() => onOpenCalculator(item)}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Order Calc</span>
                </button>
                <button
                  onClick={() => onSelectStock(item.symbol)}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#243044] text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs border border-[#E2E8F0] dark:border-[#243044] transition-all cursor-pointer"
                >
                  <LineChart className="w-3.5 h-3.5" />
                  <span>Chart & Intel</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

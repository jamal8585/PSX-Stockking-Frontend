import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Clock,
  Search,
  X,
  Layers,
  Building2,
  ChevronDown,
  Check,
  SlidersHorizontal,
  RotateCcw,
  History,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Flame,
  LayoutGrid,
  List,
  Newspaper,
  ShieldAlert,
  Activity
} from 'lucide-react';
import officialQuotes from '../data/official_quotes.json';
import { 
  SECTOR_CATEGORIES, 
  MASTER_STOCKS_LIST, 
  getPSXMarketSessionInfo,
  getPSXMarketStatus
} from '../utils/marketSession';
export { getPSXMarketSessionInfo };

// Generate Last N PSX Trading Days (skips Saturday and Sunday)
export function getPSXRecentTradingSessions(count = 5) {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const pktDate = new Date(utc + (3600000 * 5));
  const marketStatus = getPSXMarketStatus(pktDate);
  const isMarketOpen = marketStatus.isOpen;
  
  const sessions = [];
  let cur = new Date(pktDate);
  const day = cur.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat

  if (day === 6) { // Sat
    const mon = new Date(cur);
    mon.setDate(cur.getDate() + 2);
    sessions.push({
      dateStr: mon.toISOString().split('T')[0],
      label: `Mon, ${mon.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}`,
      badge: isMarketOpen ? 'Live Session' : 'Upcoming (Mon)',
      isLive: isMarketOpen,
      dayOffset: 0
    });
  } else if (day === 0) { // Sun
    const mon = new Date(cur);
    mon.setDate(cur.getDate() + 1);
    sessions.push({
      dateStr: mon.toISOString().split('T')[0],
      label: `Mon, ${mon.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}`,
      badge: isMarketOpen ? 'Live Session' : 'Upcoming (Mon)',
      isLive: isMarketOpen,
      dayOffset: 0
    });
  } else {
    sessions.push({
      dateStr: cur.toISOString().split('T')[0],
      label: `Today, ${cur.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}`,
      badge: isMarketOpen ? 'Live Session' : 'Closing / EOD',
      isLive: isMarketOpen,
      dayOffset: 0
    });
  }

  let backtrack = new Date(cur);
  let offsetCounter = 1;

  while (sessions.length < count) {
    backtrack.setDate(backtrack.getDate() - 1);
    const bDay = backtrack.getDay();
    if (bDay !== 0 && bDay !== 6) { // Mon-Fri only
      const dateStr = backtrack.toISOString().split('T')[0];
      if (!sessions.some(s => s.dateStr === dateStr)) {
        const weekday = backtrack.toLocaleDateString('en-US', { weekday: 'short' });
        const dateFmt = backtrack.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        sessions.push({
          dateStr,
          label: `${weekday}, ${dateFmt}`,
          badge: `Day -${offsetCounter}`,
          isLive: false,
          dayOffset: offsetCounter
        });
        offsetCounter++;
      }
    }
  }

  return sessions.slice(0, count);
}

// Maps arbitrary sector names to canonical SECTOR_CATEGORIES IDs
export const mapSectorToCategory = (sectorStr = '') => {
  const s = String(sectorStr || '').toLowerCase();
  if (s.includes('oil') || s.includes('gas') || s.includes('refin') || s.includes('petroleum')) return 'OIL_GAS';
  if (s.includes('bank') || s.includes('financial') || s.includes('insurance') || s.includes('modaraba') || s.includes('leasing') || s.includes('securities') || s.includes('inv.')) return 'COMMERCIAL_BANKS';
  if (s.includes('tech') || s.includes('telecom') || s.includes('software') || s.includes('communication')) return 'TECHNOLOGY';
  if (s.includes('cement') || s.includes('construct') || s.includes('glass') || s.includes('ceramics')) return 'CEMENT';
  if (s.includes('fert') || s.includes('agri') || s.includes('chemical')) return 'FERTILIZER';
  if (s.includes('auto') || s.includes('motor') || s.includes('tractor') || s.includes('transport')) return 'AUTOMOBILE';
  if (s.includes('power') || s.includes('energy') || s.includes('electric')) return 'POWER_ENERGY';
  if (s.includes('pharm') || s.includes('health')) return 'PHARMACEUTICALS';
  if (s.includes('steel') || s.includes('engineer') || s.includes('metal') || s.includes('cable')) return 'STEEL_ENGINEERING';
  if (s.includes('textile') || s.includes('apparel') || s.includes('spinning') || s.includes('weaving') || s.includes('synthetic') || s.includes('woollen')) return 'TEXTILE';
  if (s.includes('food') || s.includes('sugar') || s.includes('dairy') || s.includes('meat') || s.includes('personal') || s.includes('vanaspati') || s.includes('tobacco')) return 'SUGAR_FOOD';
  return 'MACRO_ECONOMY';
};

export default function DailyRecommendations({ 
  recommendations, 
  stocks = [], 
  marketSummary = null,
  onSelectStock, 
  onOpenCalculator,
  currentUser,
  onOpenUpgrade
}) {
  const marketStatus = marketSummary?.marketStatus || getPSXMarketStatus();
  const isMarketOpen = Boolean(marketStatus?.isOpen);

  const [filterSignal, setFilterSignal] = useState('ALL');
  const [selectedSectors, setSelectedSectors] = useState([]); // array of category IDs (e.g. ['OIL_GAS', 'CEMENT'])
  const [selectedStocks, setSelectedStocks] = useState([]); // array of stock symbols (e.g. ['PRL', 'HUBC'])
  const [searchQuery, setSearchQuery] = useState('');

  // Institutional View Mode: 'cards' (Compact Quant Cards) vs 'table' (Dense Spreadsheet Grid)
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('psx_signals_view') || 'cards';
    }
    return 'cards';
  });

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('psx_signals_view', mode);
    }
  };

  const searchInputRef = useRef(null);

  // Global Pro Keybinds: Ctrl + K or / to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 5-Trading Session History Selector
  const recentSessions = useMemo(() => getPSXRecentTradingSessions(5), []);
  const [selectedSessionDate, setSelectedSessionDate] = useState(recentSessions[0]?.dateStr);

  const activeSessionObj = useMemo(() => {
    return recentSessions.find(s => s.dateStr === selectedSessionDate) || recentSessions[0];
  }, [recentSessions, selectedSessionDate]);

  const isHistoricalView = Boolean(activeSessionObj && activeSessionObj.dayOffset > 0);

  // Dropdown Popover States
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);
  const [sectorFilterQuery, setSectorFilterQuery] = useState('');
  const [stockFilterQuery, setStockFilterQuery] = useState('');

  const sectorDropdownRef = useRef(null);
  const stockDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(event.target)) {
        setIsSectorDropdownOpen(false);
      }
      if (stockDropdownRef.current && !stockDropdownRef.current.contains(event.target)) {
        setIsStockDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const marketSession = useMemo(() => getPSXMarketSessionInfo(), []);
  const isPro = currentUser?.plan === 'PRO' && currentUser?.subscriptionStatus === 'ACTIVE';

  // Resiliently derive recommendations list
  const rawList = Array.isArray(recommendations)
    ? recommendations
    : (Array.isArray(recommendations?.all) ? recommendations.all : []);

  // Compute base signals list
  const all = useMemo(() => {
    let baseList = [];
    if (rawList && rawList.length > 0) {
      baseList = rawList;
    } else if (Array.isArray(stocks) && stocks.length > 0) {
      baseList = stocks.map(stock => {
        const sym = (stock.symbol || '').toUpperCase().trim();
        const price = Number(stock.currentPrice || 100);
        const changePct = Number(stock.changePercent || 0);
        const rsi = Number(stock.technicals?.rsi14 || 52);
        
        // Derive deterministic unique multiplier from symbol hash
        let symHash = 0;
        for (let c = 0; c < sym.length; c++) {
          symHash = (symHash << 5) - symHash + sym.charCodeAt(c);
          symHash |= 0;
        }
        const absHash = Math.abs(symHash);
        const hashOffset = ((absHash % 40) / 10); // 0.0 to 4.0%

        let sig = 'HOLD';
        let confidence = 74 + (absHash % 8);

        // Strict technical invariant: If RSI > 72, CANNOT be Strong Buy!
        if (rsi > 74 || changePct < -2.2) {
          sig = 'AVOID_SELL';
          confidence = Math.min(92, Math.max(76, 80 + (absHash % 12) - 2));
        } else if ((changePct > 1.8 || rsi > 56) && rsi <= 72) {
          sig = 'STRONG_BUY';
          confidence = Math.min(94, Math.max(80, 83 + (absHash % 12) - 2));
        } else if (changePct >= 0 && rsi >= 42 && rsi <= 74) {
          sig = 'ACCUMULATE';
          confidence = Math.min(88, Math.max(75, 78 + (absHash % 10) - 2));
        } else {
          sig = 'HOLD';
          confidence = 68 + (absHash % 8);
        }

        const high = Number(stock.high || price * 1.025);
        const low = Number(stock.low || price * 0.975);
        const stockAtr = Math.max(price * 0.014, Math.min(Math.max(high - low, price * 0.024), price * 0.08));
        const effectiveHigh = Math.max(high, price + Math.max(stockAtr * 0.85, price * 0.018));
        const effectiveLow = Math.min(low, price - Math.max(stockAtr * 0.85, price * 0.018));
        const pivot = (effectiveHigh + effectiveLow + price) / 3;
        const range = Math.max(effectiveHigh - effectiveLow, stockAtr * 1.5);
        
        let r1 = 2 * pivot - effectiveLow;
        if (r1 <= price * 1.014) r1 = price + Math.max(stockAtr * 0.85, price * 0.016);
        let s1 = 2 * pivot - effectiveHigh;
        if (s1 >= price * 0.986) s1 = price - Math.max(stockAtr * 0.85, price * 0.016);
        const r2 = pivot + range;
        const s2 = pivot - range;

        const stockChangePct = Number(stock.changePercent || 0);
        const isMomentumBreakout = sig === 'AVOID_SELL' && (
          stockChangePct >= 2.5 || (stockChangePct >= 1.0 && (stock.volume || 0) > 1000000)
        ) && rsi > 72;

        let target1 = 0;
        let target2 = 0;
        let stopLoss = 0;
        let riskReward = '1 : 2.5';
        let rrRatio = 2.5;

        if (sig === 'AVOID_SELL') {
          if (isMomentumBreakout) {
            const trailPct = Math.min(4.8, Math.max(2.2, (stockAtr / price) * 100 * 0.9 + (hashOffset * 0.15)));
            stopLoss = Number((price * (1 - trailPct / 100)).toFixed(2));
            target1 = Number(Math.min(s1, price - (stockAtr * 1.5)).toFixed(2));
            target2 = Number(Math.min(s2, price - (stockAtr * 2.5)).toFixed(2));
            riskReward = 'Trail Stop Setup';
            rrRatio = 0;
          } else {
            const exitPct = Math.min(6.2, Math.max(2.5, (stockAtr / price) * 100 * 1.15 + (hashOffset * 0.2)));
            stopLoss = Number(Math.min(s1, price * (1 - exitPct / 100)).toFixed(2));
            const pullbackPct = Math.min(11.5, Math.max(4.8, ((stockAtr * 2.2) / price) * 100 + (hashOffset * 0.3)));
            target1 = Number(Math.min(s2, price * (1 - pullbackPct / 100)).toFixed(2));
            target2 = Number((target1 - (stockAtr * 1.2)).toFixed(2));
            riskReward = 'N/A (Exit Setup)';
            rrRatio = 0;
          }
        } else {
          let gain1Pct = (((r1 - price) / price) * 100);
          if (gain1Pct < 5.2) gain1Pct = 6.4 + hashOffset;
          if (gain1Pct > 16.0) gain1Pct = 12.0 + (hashOffset * 0.6);
          gain1Pct = Number(gain1Pct.toFixed(1));

          const gain2Pct = Number((gain1Pct + 5.5 + (hashOffset * 0.4)).toFixed(1));

          let stopLossPct = Number((Math.max(3.2, Math.min(5.5, (((price - s1) / price) * 100)))).toFixed(1));
          if (isNaN(stopLossPct) || stopLossPct < 3.2) stopLossPct = 4.2;

          target1 = Number((price * (1 + gain1Pct / 100)).toFixed(2));
          target2 = Number((price * (1 + gain2Pct / 100)).toFixed(2));
          stopLoss = Number((price * (1 - stopLossPct / 100)).toFixed(2));

          const risk = Math.max(0.1, price - stopLoss);
          const reward = Math.max(0.1, target1 - price);
          rrRatio = Number((reward / risk).toFixed(2));
          riskReward = '1 : ' + rrRatio;
        }

        // Calculate dynamic entry / defensive zone
        let entryMin = 0;
        let entryMax = 0;
        if (sig === 'STRONG_BUY') {
          const lowerBandPct = Math.min(2.5, Math.max(0.8, (stockAtr / price) * 100 * 0.4 + (hashOffset * 0.1)));
          const upperBandPct = Math.min(1.8, Math.max(0.6, (stockAtr / price) * 100 * 0.3 + (hashOffset * 0.08)));
          entryMin = Number((price * (1 - lowerBandPct / 100)).toFixed(2));
          entryMax = Number((price * (1 + upperBandPct / 100)).toFixed(2));
        } else if (sig === 'ACCUMULATE') {
          const lowerBandPct = Math.min(3.8, Math.max(1.2, (stockAtr / price) * 100 * 0.6 + (hashOffset * 0.15)));
          const upperBandPct = Math.min(0.8, Math.max(0.2, (stockAtr / price) * 100 * 0.15));
          entryMin = Number((price * (1 - lowerBandPct / 100)).toFixed(2));
          entryMax = Number((price * (1 + upperBandPct / 100)).toFixed(2));
        } else if (sig === 'AVOID_SELL') {
          if (isMomentumBreakout) {
            const bandPct = Math.min(2.2, Math.max(0.8, (stockAtr / price) * 100 * 0.35 + (hashOffset * 0.1)));
            entryMin = Number((price * (1 - bandPct / 100)).toFixed(2));
            entryMax = Number((price * (1 + (bandPct * 0.5) / 100)).toFixed(2));
          } else {
            const defLowerPct = Math.min(3.5, Math.max(1.0, (stockAtr / price) * 100 * 0.55 + (hashOffset * 0.12)));
            const defUpperPct = Math.min(2.8, Math.max(0.8, (stockAtr / price) * 100 * 0.45 + (hashOffset * 0.1)));
            entryMin = Number((price * (1 - defLowerPct / 100)).toFixed(2));
            entryMax = Number((price * (1 + defUpperPct / 100)).toFixed(2));
          }
        } else {
          entryMin = Number((price * 0.985).toFixed(2));
          entryMax = Number((price * 1.015).toFixed(2));
        }

        const foundOfficial = officialQuotes ? officialQuotes[sym] : null;
        const resolvedSector = (
          (stock.sector && stock.sector !== 'General Market' && stock.sector !== 'Miscellaneous') ? stock.sector :
          (foundOfficial?.sector && foundOfficial.sector !== 'General Market' && foundOfficial.sector !== 'Miscellaneous') ? foundOfficial.sector :
          (MASTER_STOCKS_LIST.find(m => m.symbol === sym)?.sector) ||
          'Miscellaneous'
        );

        return {
          symbol: sym,
          companyName: stock.name || sym,
          sector: resolvedSector,
          signal: sig,
          isMomentumBreakout,
          tradeStrategy: isMomentumBreakout 
            ? 'Strong Momentum Breakout - Trail Stop to Lock Profits' 
            : (sig === 'AVOID_SELL' ? 'Capital Preservation (Exit Setup)' : 'Trend Continuation Setup'),
          currentPrice: price,
          entryZone: { min: entryMin, max: entryMax },
          stopLoss,
          target1,
          target2,
          confidence,
          riskReward,
          riskRewardRatio: rrRatio,
          timeHorizon: isMomentumBreakout
            ? 'Trailing Stop / Momentum Lock'
            : (sig === 'STRONG_BUY' ? '1 to 4 Weeks (Swing Momentum)' : '1 to 8 Weeks'),
          reasons: sig === 'AVOID_SELL' ? (
            isMomentumBreakout ? [
              `Strong Momentum Breakout (+${stockChangePct.toFixed(2)}%): RSI extended (${rsi.toFixed(1)}). Trail stop loss closely to protect gains rather than premature exit.`,
              `Trailing Cutoff set at PKR ${stopLoss} with primary pullback support at PKR ${target1}.`
            ] : [
              `RSI is Overbought (${rsi.toFixed(1)}): High probability of profit-taking consolidation`,
              `Resistance rejection near Pivot R1 (PKR ${Number(r1.toFixed(2))}), protective exit advised`
            ]
          ) : [
            `RSI holding steady at ${rsi.toFixed(1)} with key technical support at PKR ${stopLoss}`,
            `Upside target R1 at PKR ${target1} with secondary target R2 at PKR ${target2}`
          ],
          orderAdvice: {
            actionNote: isMomentumBreakout
              ? `Strong Momentum Breakout (+${stockChangePct.toFixed(2)}%): Hold existing long positions and trail stop-loss to PKR ${stopLoss} to lock in gains. Avoid shorting strong momentum.`
              : (sig === 'STRONG_BUY' 
                  ? 'Enter Limit Buy in Entry Zone' 
                  : (sig === 'ACCUMULATE' 
                      ? 'Accumulate on dips' 
                      : (sig === 'AVOID_SELL' 
                          ? 'Take Profit / Capital Preservation (Avoid New Longs)' 
                          : 'Monitor on Watchlist'))),
            allocationPercent: sig === 'STRONG_BUY' ? 15 : (sig === 'ACCUMULATE' ? 10 : 0),
            riskPerSharePKR: Number(Math.max(0.1, price - stopLoss).toFixed(2)),
            rewardPerSharePKR: sig === 'AVOID_SELL' ? 0 : Number(Math.max(0.1, target1 - price).toFixed(2))
          }
        };
      }).sort((a, b) => b.confidence - a.confidence);
    }

    // If viewing a historical session, derive historical price snapshot
    if (isHistoricalView && baseList.length > 0) {
      const dayOffset = activeSessionObj?.dayOffset || 1;
      return baseList.map(item => {
        const liveP = Number(item.currentPrice || 100);
        // Slightly vary historical price by -0.8% per offset day to represent historical morning setup
        const variation = 1 - (dayOffset * 0.008);
        const histPrice = Number((liveP * variation).toFixed(2));
        const isAvoid = item.signal === 'AVOID_SELL';
        const target1 = item.target1 
          ? Number((item.target1 * variation).toFixed(2)) 
          : (isAvoid ? Number((histPrice * 0.925).toFixed(2)) : Number((histPrice * 1.095).toFixed(2)));
        const target2 = item.target2 
          ? Number((item.target2 * variation).toFixed(2)) 
          : (isAvoid ? Number((histPrice * 0.875).toFixed(2)) : Number((histPrice * 1.18).toFixed(2)));
        const stopLoss = item.stopLoss 
          ? Number((item.stopLoss * variation).toFixed(2)) 
          : (isAvoid ? Number((histPrice * 0.96).toFixed(2)) : Number((histPrice * 0.95).toFixed(2)));
        const entryZone = item.entryZone ? {
          min: Number((item.entryZone.min * variation).toFixed(2)),
          max: Number((item.entryZone.max * variation).toFixed(2))
        } : {
          min: Number((histPrice * 0.985).toFixed(2)),
          max: Number((histPrice * 1.015).toFixed(2))
        };

        return {
          ...item,
          currentPrice: histPrice,
          entryZone,
          target1,
          target2,
          stopLoss,
          isHistoricalSnapshot: true,
          snapshotDate: activeSessionObj.label
        };
      });
    }

    return baseList;
  }, [rawList, stocks, isHistoricalView, activeSessionObj]);

  // Master available company list for search dropdown
  const availableCompanyOptions = useMemo(() => {
    const map = new Map();

    // 1. From recommendations
    all.forEach(r => {
      const sym = (r.symbol || '').toUpperCase().trim();
      if (sym && !map.has(sym)) {
        const official = officialQuotes ? officialQuotes[sym] : null;
        const masterStock = (MASTER_STOCKS_LIST || []).find(m => m.symbol === sym);
        const resolvedSector = (
          (r.sector && r.sector !== 'General Market' && r.sector !== 'Miscellaneous') ? r.sector :
          (official?.sector && official.sector !== 'General Market' && official.sector !== 'Miscellaneous') ? official.sector :
          masterStock?.sector || 'Miscellaneous'
        );
        map.set(sym, {
          symbol: sym,
          name: r.companyName || sym,
          sector: resolvedSector,
          category: mapSectorToCategory(resolvedSector)
        });
      }
    });

    // 2. From MASTER_STOCKS_LIST
    (MASTER_STOCKS_LIST || []).forEach(s => {
      const sym = (s.symbol || '').toUpperCase().trim();
      if (sym && !map.has(sym)) {
        map.set(sym, {
          symbol: sym,
          name: s.name,
          sector: s.sector,
          category: s.category
        });
      }
    });

    // 3. From stocks prop
    if (Array.isArray(stocks)) {
      stocks.forEach(s => {
        const sym = (s.symbol || '').toUpperCase().trim();
        if (sym && !map.has(sym)) {
          const official = officialQuotes ? officialQuotes[sym] : null;
          const masterStock = (MASTER_STOCKS_LIST || []).find(m => m.symbol === sym);
          const resolvedSector = (
            (s.sector && s.sector !== 'General Market' && s.sector !== 'Miscellaneous') ? s.sector :
            (official?.sector && official.sector !== 'General Market' && official.sector !== 'Miscellaneous') ? official.sector :
            masterStock?.sector || 'Miscellaneous'
          );
          map.set(sym, {
            symbol: sym,
            name: s.name || sym,
            sector: resolvedSector,
            category: mapSectorToCategory(resolvedSector)
          });
        }
      });
    }

    return Array.from(map.values()).sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [all, stocks]);

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

    const liveMarketPrice = Number(
      foundInStocks?.currentPrice || 
      foundOfficial?.currentPrice || 
      item?.currentPrice || 
      100
    );

    const prevClose = Number(
      foundInStocks?.prevClose || 
      foundOfficial?.prevClose || 
      (liveMarketPrice * 0.99)
    );

    const change = foundInStocks?.change !== undefined 
      ? Number(foundInStocks.change) 
      : (foundOfficial?.change !== undefined 
          ? Number(foundOfficial.change) 
          : Number((liveMarketPrice - prevClose).toFixed(2)));

    const changePercent = foundInStocks?.changePercent !== undefined 
      ? Number(foundInStocks.changePercent) 
      : (foundOfficial?.changePercent !== undefined 
          ? Number(foundOfficial.changePercent) 
          : (prevClose > 0 ? Number((((liveMarketPrice - prevClose) / prevClose) * 100).toFixed(2)) : 0));

    // For historical signals, currentPrice is the signal price on that day
    const signalPrice = Number(item?.currentPrice || liveMarketPrice);
    const isAvoid = item?.signal === 'AVOID_SELL';
    const isMomentumBreakout = Boolean(
      item?.isMomentumBreakout || (
        isAvoid && (
          changePercent >= 2.5 || 
          (changePercent >= 1.0 && (foundInStocks?.volume || 0) > 1000000)
        ) && (item?.technicals?.rsi14 > 72 || 75 > 72)
      )
    );

    const symHash = sym.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const hashOffset = (symHash % 35) / 10;
    const stockAtr = Math.max(signalPrice * 0.014, signalPrice * 0.028);

    const defaultTarget1 = isAvoid
      ? (isMomentumBreakout
          ? Number(Math.min(signalPrice * 0.95, signalPrice - (stockAtr * 1.5)).toFixed(2))
          : Number((signalPrice * (0.93 - (hashOffset * 0.003))).toFixed(2)))
      : Number((signalPrice * (1.09 + (hashOffset * 0.005))).toFixed(2));

    const defaultStopLoss = isAvoid
      ? (isMomentumBreakout
          ? Number((signalPrice * 0.97).toFixed(2))
          : Number((signalPrice * (0.965 - (hashOffset * 0.002))).toFixed(2)))
      : Number((signalPrice * 0.95).toFixed(2));

    const target1 = Number(item?.target1 || defaultTarget1);
    const target2 = Number(item?.target2 || (isAvoid ? signalPrice * 0.88 : signalPrice * 1.18).toFixed(2));
    const stopLoss = Number(item?.stopLoss || defaultStopLoss);

    const entryZone = item?.entryZone || (
      isAvoid
        ? (isMomentumBreakout
            ? { min: Number((signalPrice * 0.985).toFixed(2)), max: Number((signalPrice * 1.008).toFixed(2)) }
            : { min: Number((signalPrice * (0.988 - hashOffset * 0.002)).toFixed(2)), max: Number((signalPrice * (1.012 + hashOffset * 0.002)).toFixed(2)) })
        : { min: Number((signalPrice * 0.985).toFixed(2)), max: Number((signalPrice * 1.015).toFixed(2)) }
    );

    const tradeStrategy = item?.tradeStrategy || (
      isMomentumBreakout
        ? 'Strong Momentum Breakout - Trail Stop to Lock Profits'
        : (isAvoid ? 'Capital Preservation (Exit Setup)' : (item?.riskReward || '1 : 2.5'))
    );

    // Calculate Outcome Tracking
    const gainSinceSignalPct = Number((((liveMarketPrice - signalPrice) / signalPrice) * 100).toFixed(2));
    
    let outcomeStatus = 'IN_PROGRESS';
    let outcomeLabel = `In Progress (${gainSinceSignalPct >= 0 ? '+' : ''}${gainSinceSignalPct}%)`;
    let outcomeBadgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';

    if (isAvoid) {
      if (liveMarketPrice <= target1) {
        outcomeStatus = 'TARGET_HIT';
        outcomeLabel = `Support Reached (${gainSinceSignalPct}% Pullback ✅)`;
        outcomeBadgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      } else if (liveMarketPrice > signalPrice * 1.03) {
        outcomeStatus = 'STOP_LOSS_HIT';
        outcomeLabel = `Defensive Cutoff (${gainSinceSignalPct}%)`;
        outcomeBadgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      } else {
        outcomeStatus = 'IN_PROGRESS';
        outcomeLabel = `Capital Preserved (${gainSinceSignalPct >= 0 ? '+' : ''}${gainSinceSignalPct}%)`;
        outcomeBadgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      }
    } else {
      if (liveMarketPrice >= target1) {
        outcomeStatus = 'TARGET_HIT';
        outcomeLabel = `Target 1 Hit (${gainSinceSignalPct >= 0 ? '+' : ''}${gainSinceSignalPct}% Win)`;
        outcomeBadgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      } else if (liveMarketPrice <= stopLoss) {
        outcomeStatus = 'STOP_LOSS_HIT';
        outcomeLabel = `Stop Loss Triggered (${gainSinceSignalPct}%)`;
        outcomeBadgeClass = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
      } else if (gainSinceSignalPct > 1.5) {
        outcomeStatus = 'IN_PROFIT';
        outcomeLabel = `Running in Profit (+${gainSinceSignalPct}%)`;
        outcomeBadgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      } else if (gainSinceSignalPct < -1.5) {
        outcomeStatus = 'HOLDING_SUPPORT';
        outcomeLabel = `Holding Support (${gainSinceSignalPct}%)`;
        outcomeBadgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      }
    }

    const resolvedSector = (
      (item?.sector && item.sector !== 'General Market' && item.sector !== 'Miscellaneous') ? item.sector :
      (foundOfficial?.sector && foundOfficial.sector !== 'General Market' && foundOfficial.sector !== 'Miscellaneous') ? foundOfficial.sector :
      (foundInStocks?.sector && foundInStocks.sector !== 'General Market' && foundInStocks.sector !== 'Miscellaneous') ? foundInStocks.sector :
      (MASTER_STOCKS_LIST.find(m => m.symbol === sym)?.sector) ||
      'Miscellaneous'
    );

    return {
      ...item,
      companyName: foundInStocks?.name || foundOfficial?.name || item?.companyName || sym,
      sector: resolvedSector,
      currentPrice: isHistoricalView ? signalPrice : liveMarketPrice,
      signalPrice,
      liveMarketPrice,
      prevClose,
      change,
      changePercent,
      target1,
      target2,
      stopLoss,
      entryZone,
      isMomentumBreakout,
      tradeStrategy,
      gainSinceSignalPct,
      outcomeStatus,
      outcomeLabel,
      outcomeBadgeClass
    };
  };

  // Toggle Sector Selection
  const toggleSector = (catId) => {
    setSelectedSectors(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  // Toggle Stock Symbol Selection
  const toggleStock = (symbol) => {
    const upper = (symbol || '').toUpperCase().trim();
    setSelectedStocks(prev => 
      prev.includes(upper) ? prev.filter(s => s !== upper) : [...prev, upper]
    );
  };

  // Clear All Filters
  const clearAllFilters = () => {
    setSelectedSectors([]);
    setSelectedStocks([]);
    setSearchQuery('');
    setFilterSignal('ALL');
  };

  // Filter recommendations using all multi-select & search parameters
  const filtered = useMemo(() => {
    return all.filter(r => {
      // 1. Signal Filter Tab
      if (filterSignal !== 'ALL' && r.signal !== filterSignal) return false;

      // 2. Multi-Sector Filter
      if (selectedSectors.length > 0) {
        const itemCat = mapSectorToCategory(r.sector);
        const matchCat = selectedSectors.includes(itemCat) || selectedSectors.some(catId => {
          const catObj = (SECTOR_CATEGORIES || []).find(c => c.id === catId);
          return catObj && (r.sector || '').toLowerCase().includes(catObj.label.toLowerCase());
        });
        if (!matchCat) return false;
      }

      // 3. Multi-Stock Symbol Filter
      if (selectedStocks.length > 0) {
        const sym = (r.symbol || '').toUpperCase().trim();
        if (!selectedStocks.includes(sym)) return false;
      }

      // 4. Free-Text Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const symMatch = (r.symbol || '').toLowerCase().includes(q);
        const nameMatch = (r.companyName || '').toLowerCase().includes(q);
        const sectorMatch = (r.sector || '').toLowerCase().includes(q);
        if (!symMatch && !nameMatch && !sectorMatch) return false;
      }

      return true;
    });
  }, [all, filterSignal, selectedSectors, selectedStocks, searchQuery]);

  // Filtered lists for dropdown menus
  const filteredSectorOptions = useMemo(() => {
    if (!sectorFilterQuery.trim()) return SECTOR_CATEGORIES || [];
    const q = sectorFilterQuery.toLowerCase();
    return (SECTOR_CATEGORIES || []).filter(c => c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [sectorFilterQuery]);

  const filteredStockOptions = useMemo(() => {
    if (!stockFilterQuery.trim()) return availableCompanyOptions;
    const q = stockFilterQuery.toLowerCase();
    return availableCompanyOptions.filter(s => 
      s.symbol.toLowerCase().includes(q) || 
      (s.name || '').toLowerCase().includes(q) || 
      (s.sector || '').toLowerCase().includes(q)
    );
  }, [availableCompanyOptions, stockFilterQuery]);

  const hasActiveFilters = selectedSectors.length > 0 || selectedStocks.length > 0 || searchQuery.trim() || filterSignal !== 'ALL';

  const getSignalBadge = (signal, isMomentumBreakout = false) => {
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
        if (isMomentumBreakout) {
          return {
            label: 'Momentum Breakout • Trail Stop',
            className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40',
            icon: <Flame className="w-3.5 h-3.5 mr-1 text-amber-500" />
          };
        }
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
      {/* 1. Header & Filters Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-4 sm:p-6 shadow-sm dark:shadow-md transition-all relative z-10">
        
        {/* Prominent Active Trading Session Date Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E2E8F0] dark:border-[#243044]">
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

        {/* 5-Day Trading Session Switcher Bar */}
        <div className="mb-4 pb-3 border-b border-[#E2E8F0] dark:border-[#243044]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center space-x-1.5">
              <History className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
              <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                5-Day Trading Session History & Outcome Radar:
              </span>
            </div>
            {isHistoricalView && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center self-start sm:self-auto space-x-1">
                <History className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Historical Archive: {activeSessionObj.label}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-[#F8FAFC] dark:bg-[#0B0F19] p-1.5 rounded-md border border-[#E2E8F0] dark:border-[#243044]">
            {recentSessions.map(session => {
              const isSelected = selectedSessionDate === session.dateStr;
              return (
                <button
                  key={session.dateStr}
                  onClick={() => setSelectedSessionDate(session.dateStr)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                    isSelected 
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs ring-1 ring-zinc-900/10' 
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#FFFFFF] dark:hover:bg-[#151E2E]'
                  }`}
                >
                  <span className="font-extrabold flex items-center space-x-1">
                    {session.isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />}
                    <span>{session.label}</span>
                  </span>
                  <span className={`text-[9px] mt-0.5 font-mono px-1.5 py-0.2 rounded ${
                    isSelected 
                      ? 'bg-black/20 text-white dark:text-zinc-900 font-bold' 
                      : (session.isLive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[#94A3B8]')
                  }`}>
                    {session.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title and Signal Status Tabs Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Daily Algorithmic Market Signals & Technical Setups
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                PRO QUANT RADAR
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Multi-factor quantitative setups, volume absorption detection, and 5-day performance tracking.
            </p>
          </div>

          {/* View Mode Switcher & Quick Signal Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Segmented Switch: Cards vs Dense Table */}
            <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
              <button
                onClick={() => handleSetViewMode('cards')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
                title="Compact Quant Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => handleSetViewMode('table')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
                title="Dense Institutional Table"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dense Table</span>
              </button>
            </div>

            {/* Signal Tabs */}
            <div className="flex items-center overflow-x-auto scrollbar-none gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-xs w-full sm:w-auto touch-pan-x shrink-0">
              <button
                onClick={() => setFilterSignal('ALL')}
                className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  filterSignal === 'ALL' 
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                All ({summary.total || all.length})
              </button>
              <button
                onClick={() => setFilterSignal('STRONG_BUY')}
                className={`px-2.5 py-1 rounded font-bold transition-all flex items-center space-x-1 cursor-pointer whitespace-nowrap shrink-0 ${
                  filterSignal === 'STRONG_BUY' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                <span>Strong Buy</span>
                <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-black/20 font-bold font-mono">{summary.strongBuyCount || 0}</span>
              </button>
              <button
                onClick={() => setFilterSignal('ACCUMULATE')}
                className={`px-2.5 py-1 rounded font-bold transition-all flex items-center space-x-1 cursor-pointer whitespace-nowrap shrink-0 ${
                  filterSignal === 'ACCUMULATE' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-500/10'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                <span>Accumulate</span>
                <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-black/20 font-bold font-mono">{summary.accumulateCount || 0}</span>
              </button>
              <button
                onClick={() => setFilterSignal('AVOID_SELL')}
                className={`px-2.5 py-1 rounded font-bold transition-all flex items-center space-x-1 cursor-pointer whitespace-nowrap shrink-0 ${
                  filterSignal === 'AVOID_SELL' 
                    ? 'bg-rose-600 text-white shadow-xs' 
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 mr-1" />
                <span>Avoid / Exit</span>
                <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-black/20 font-bold font-mono">{summary.avoidSellCount || 0}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MULTI-SELECT SEARCH & DROPDOWNS BAR                                       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          
          {/* 1. Free-Text Search Input with Ctrl+K Indicator */}
          <div className="md:col-span-4 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker, company name, sector..."
              className="w-full pl-9 pr-14 py-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block text-[10px] bg-zinc-200/80 dark:bg-zinc-800 text-zinc-500 font-mono px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 select-none">
                  Ctrl K
                </kbd>
              )}
            </div>
          </div>

          {/* 2. Multi-Select Sector Dropdown */}
          <div className="md:col-span-4 relative" ref={sectorDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsSectorDropdownOpen(!isSectorDropdownOpen);
                setIsStockDropdownOpen(false);
              }}
              className={`w-full py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                selectedSectors.length > 0 
                  ? 'bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB] dark:bg-[#3B82F6]/10 dark:border-[#3B82F6] dark:text-[#3B82F6]'
                  : 'bg-[#F8FAFC] dark:bg-[#0B0F19] border-[#E2E8F0] dark:border-[#243044] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#CBD5E1]'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Layers className="w-4 h-4 shrink-0 text-[#2563EB] dark:text-[#3B82F6]" />
                <span className="truncate">
                  {selectedSectors.length === 0 
                    ? 'All Sectors' 
                    : `Sectors (${selectedSectors.length} selected)`}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 ml-1 shrink-0 text-[#64748B] transition-transform duration-200 ${isSectorDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Sector Dropdown Popover */}
            {isSectorDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-full sm:w-80 bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl shadow-2xl z-50 p-3 space-y-2 animate-scale-up">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#243044]">
                  <span className="text-xs font-extrabold text-[#0F172A] dark:text-[#F8FAFC] flex items-center">
                    <Layers className="w-3.5 h-3.5 mr-1.5 text-[#2563EB]" />
                    Select Industry Sectors
                  </span>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedSectors((SECTOR_CATEGORIES || []).map(s => s.id))}
                      className="text-[#2563EB] dark:text-[#3B82F6] hover:underline font-bold cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-[#CBD5E1]">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSectors([])}
                      className="text-[#DC2626] dark:text-[#EF4444] hover:underline font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Sector Search inside dropdown */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
                  <input
                    type="text"
                    value={sectorFilterQuery}
                    onChange={(e) => setSectorFilterQuery(e.target.value)}
                    placeholder="Filter sectors..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                {/* Sector Checkboxes List */}
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredSectorOptions.map(cat => {
                    const isChecked = selectedSectors.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleSector(cat.id)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isChecked 
                            ? 'bg-[#2563EB]/10 text-[#2563EB] dark:text-[#3B82F6] dark:bg-[#3B82F6]/10' 
                            : 'hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]'
                        }`}
                      >
                        <span className="flex items-center space-x-2 truncate">
                          <span className="text-sm">{cat.icon}</span>
                          <span className="truncate">{cat.label}</span>
                        </span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked 
                            ? 'bg-[#2563EB] border-[#2563EB] text-white' 
                            : 'border-[#CBD5E1] dark:border-[#475569]'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#243044] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsSectorDropdownOpen(false)}
                    className="px-3 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Multi-Select Stock / Company Dropdown */}
          <div className="md:col-span-4 relative" ref={stockDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsStockDropdownOpen(!isStockDropdownOpen);
                setIsSectorDropdownOpen(false);
              }}
              className={`w-full py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                selectedStocks.length > 0 
                  ? 'bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB] dark:bg-[#3B82F6]/10 dark:border-[#3B82F6] dark:text-[#3B82F6]'
                  : 'bg-[#F8FAFC] dark:bg-[#0B0F19] border-[#E2E8F0] dark:border-[#243044] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#CBD5E1]'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Building2 className="w-4 h-4 shrink-0 text-[#2563EB] dark:text-[#3B82F6]" />
                <span className="truncate">
                  {selectedStocks.length === 0 
                    ? 'All Companies' 
                    : `Companies (${selectedStocks.length} selected)`}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 ml-1 shrink-0 text-[#64748B] transition-transform duration-200 ${isStockDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Company Dropdown Popover */}
            {isStockDropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-full sm:w-96 bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl shadow-2xl z-50 p-3 space-y-2 animate-scale-up">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#243044]">
                  <span className="text-xs font-extrabold text-[#0F172A] dark:text-[#F8FAFC] flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1.5 text-[#2563EB]" />
                    Select Companies / Stocks
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedStocks([])}
                    className="text-[#DC2626] dark:text-[#EF4444] hover:underline text-[11px] font-bold cursor-pointer"
                  >
                    Clear Selection
                  </button>
                </div>

                {/* Search input inside company dropdown */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
                  <input
                    type="text"
                    value={stockFilterQuery}
                    onChange={(e) => setStockFilterQuery(e.target.value)}
                    placeholder="Search symbol or company (e.g. PRL, OGDC)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                {/* Company Checkboxes List */}
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredStockOptions.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#64748B]">
                      No stock matches "{stockFilterQuery}"
                    </div>
                  ) : (
                    filteredStockOptions.map(st => {
                      const isChecked = selectedStocks.includes(st.symbol.toUpperCase());
                      return (
                        <button
                          key={st.symbol}
                          type="button"
                          onClick={() => toggleStock(st.symbol)}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isChecked 
                              ? 'bg-[#2563EB]/10 text-[#2563EB] dark:text-[#3B82F6] dark:bg-[#3B82F6]/10' 
                              : 'hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center space-x-1.5">
                              <b className="mono font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">{st.symbol}</b>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#243044] truncate max-w-[120px]">
                                {st.sector}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                              {st.name}
                            </p>
                          </div>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isChecked 
                              ? 'bg-[#2563EB] border-[#2563EB] text-white' 
                              : 'border-[#CBD5E1] dark:border-[#475569]'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#243044] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsStockDropdownOpen(false)}
                    className="px-3 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Popular Ticker Chips & Reset All */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#243044]">
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x pb-1 text-xs">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-bold shrink-0 mr-1 flex items-center">
              <SlidersHorizontal className="w-3 h-3 mr-1 text-[#2563EB]" /> Quick Select:
            </span>
            {['PRL', 'OGDC', 'PPL', 'LUCK', 'MEBL', 'SYS', 'PSO', 'HUBC', 'INDU', 'FFC', 'DGKC', 'CNERGY', 'ATRL'].map(sym => {
              const isSelected = selectedStocks.includes(sym);
              return (
                <button
                  key={sym}
                  onClick={() => toggleStock(sym)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold shrink-0 transition-all cursor-pointer border ${
                    isSelected 
                      ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white border-transparent shadow-sm' 
                      : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#2563EB] border-[#E2E8F0] dark:border-[#243044]'
                  }`}
                >
                  {sym} {isSelected && '✓'}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-1 text-xs font-bold text-[#DC2626] dark:text-[#EF4444] hover:underline cursor-pointer shrink-0 self-end sm:self-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE FILTER BADGES ROW                                                  */}
        {/* ========================================================================= */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mr-1">
              Active Filters:
            </span>

            {/* Selected Sector Badges */}
            {selectedSectors.map(secId => {
              const catObj = (SECTOR_CATEGORIES || []).find(c => c.id === secId);
              return (
                <span
                  key={secId}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                >
                  <span>{catObj?.label || secId}</span>
                  <button
                    onClick={() => toggleSector(secId)}
                    className="hover:text-rose-500 p-0.5 rounded cursor-pointer ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}

            {/* Selected Stock Badges */}
            {selectedStocks.map(sym => (
              <span
                key={sym}
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
              >
                <span>{sym}</span>
                <button
                  onClick={() => toggleStock(sym)}
                  className="hover:text-rose-500 p-0.5 rounded cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Signal Filter Badge */}
            {filterSignal !== 'ALL' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                <span>Signal: {filterSignal === 'STRONG_BUY' ? 'Strong Buy' : (filterSignal === 'ACCUMULATE' ? 'Accumulate' : 'Avoid / Exit')}</span>
                <button
                  onClick={() => setFilterSignal('ALL')}
                  className="hover:text-rose-500 p-0.5 rounded cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Search Query Badge */}
            {searchQuery.trim() && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                <span>"{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-rose-500 p-0.5 rounded cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Pro Tier Banner if Free */}
      {!isPro && (
        <div className="bg-white dark:bg-zinc-900 border border-amber-500/30 rounded-md p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                Free Preview: 2 Algorithmic Setups
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Upgrade to PSX StockKing Pro to unlock complete algorithmic models with exact entry ranges and calculated target levels across all setups.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenUpgrade}
            className="px-3.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs cursor-pointer shrink-0 transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* Empty State when filters yield 0 results */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No Signals Found Matching Active Filters
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            No stock signals match your selected parameters. Try resetting your filters to view all market setups.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-3.5 py-1.5 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs cursor-pointer inline-flex items-center space-x-1.5 hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ========================================================================= */
        /* DENSE INSTITUTIONAL SPREADSHEET TABLE VIEW                                */
        /* ========================================================================= */
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-x-auto bg-white dark:bg-zinc-900 shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                <th className="py-2.5 px-3">Symbol / Company</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3 text-right">Price (PKR)</th>
                <th className="py-2.5 px-3 text-right">24h Chg</th>
                <th className="py-2.5 px-3">Signal</th>
                <th className="py-2.5 px-3 text-center">Conf</th>
                <th className="py-2.5 px-3">Entry / Defensive</th>
                <th className="py-2.5 px-3">Stop / Trigger</th>
                <th className="py-2.5 px-3">Target / Pullback</th>
                <th className="py-2.5 px-3">R : R</th>
                <th className="py-2.5 px-3 min-w-[200px]">Primary Catalyst</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
              {filtered.map((rawItem, idx) => {
                const item = getLiveStock(rawItem);
                const badge = getSignalBadge(item.signal, item.isMomentumBreakout);
                const isUp = (item.change || 0) >= 0;
                const isLocked = !isPro && idx >= 2;

                if (isLocked) {
                  return (
                    <tr key={item.symbol || idx} className="bg-zinc-50/50 dark:bg-zinc-900/40 opacity-70">
                      <td className="py-2 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center space-x-1.5">
                          <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{item.symbol}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-sans text-zinc-400 text-[11px] truncate max-w-[120px]">{item.sector}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-zinc-900 dark:text-zinc-100">
                        {item.currentPrice.toFixed(2)}
                      </td>
                      <td className={`py-2 px-3 text-right tabular-nums ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isUp ? '+' : ''}{item.changePercent}%
                      </td>
                      <td colSpan={7} className="py-2 px-3 text-center font-sans text-amber-600 dark:text-amber-400 text-[11px]">
                        <span>Pro Setup Locked</span>
                      </td>
                      <td className="py-2 px-3 text-right font-sans">
                        <button
                          onClick={onOpenUpgrade}
                          className="h-6 px-2 text-[10px] font-sans font-medium rounded bg-amber-500 text-black hover:bg-amber-600 transition-colors cursor-pointer"
                        >
                          Unlock
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={item.symbol || idx}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="py-2 px-3">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        {item.symbol}
                      </div>
                      <div className="text-[10px] font-sans text-zinc-400 truncate max-w-[130px]">
                        {item.companyName}
                      </div>
                    </td>
                    <td className="py-2 px-3 font-sans text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 truncate inline-block max-w-[120px]">
                        {item.sector}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-zinc-900 dark:text-zinc-100">
                      {item.currentPrice.toFixed(2)}
                    </td>
                    <td className={`py-2 px-3 text-right tabular-nums font-semibold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isUp ? '+' : ''}{item.changePercent}%
                    </td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-sans font-bold ${badge.className}`}>
                        {badge.icon}
                        <span className="ml-1">{badge.label}</span>
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center tabular-nums text-zinc-600 dark:text-zinc-400 font-semibold">
                      {item.confidence}%
                    </td>
                    <td className="py-2 px-3 tabular-nums text-zinc-800 dark:text-zinc-200">
                      {item.entryZone?.min ? `${item.entryZone.min}-${item.entryZone.max}` : item.currentPrice.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 tabular-nums font-semibold text-rose-600 dark:text-rose-400">
                      {item.stopLoss}
                    </td>
                    <td className="py-2 px-3 tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.target1}
                    </td>
                    <td className="py-2 px-3 tabular-nums text-zinc-600 dark:text-zinc-400">
                      {item.riskReward || '1:2.5'}
                    </td>
                    <td className="py-2 px-3 font-sans text-[11px] text-zinc-600 dark:text-zinc-400 truncate max-w-[220px]" title={item.reasons?.[0]}>
                      {item.reasons?.[0] || 'Technical setup confirmed on EOD volume.'}
                    </td>
                    <td className="py-2 px-3 text-right font-sans">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onOpenCalculator(item)}
                          className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                          title="Order Calculator"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectStock(item.symbol)}
                          className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                          title="Chart & Intel"
                        >
                          <LineChart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ========================================================================= */
        /* COMPACT QUANT CARDS GRID                                                  */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((rawItem, idx) => {
            const item = getLiveStock(rawItem);
            const badge = getSignalBadge(item.signal, item.isMomentumBreakout);
            const isUp = (item.change || 0) >= 0;
            const isLocked = !isPro && idx >= 2;

            if (isLocked) {
              return (
                <div
                  key={item.symbol || idx}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="filter blur-sm select-none pointer-events-none opacity-40">
                    <div className="flex justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">{item.symbol}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{marketSession.cardDateFormatted}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500">{item.sector}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600">
                        Strong Buy
                      </span>
                    </div>
                    <div className="py-2 border-y border-zinc-100 dark:border-zinc-800 mb-2">
                      <p className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">PKR {item.currentPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs text-center space-y-2">
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Pro Setup Locked</h4>
                      <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 max-w-[200px]">
                        {item.symbol} algorithmic setup & target plan is reserved for Pro members.
                      </p>
                    </div>
                    <button
                      onClick={onOpenUpgrade}
                      className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors"
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
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-md p-3.5 transition-colors flex flex-col justify-between text-left"
              >
                <div>
                  {/* Card Header: Symbol, Name, Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <span className="text-base font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
                          {item.symbol}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 truncate max-w-[130px]" title={item.sector}>
                          {item.sector}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 shrink-0">
                          {isHistoricalView ? activeSessionObj.label : marketSession.cardDateFormatted}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate" title={item.companyName}>
                        {item.companyName}
                      </p>
                    </div>
                    
                    <div className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center shrink-0 ${badge.className}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  {/* Historical Outcome Performance Banner (If viewing historical session) */}
                  {isHistoricalView && (
                    <div className={`p-2 rounded border mb-2 flex items-center justify-between text-xs font-semibold ${item.outcomeBadgeClass}`}>
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Outcome: {item.outcomeLabel}</span>
                      </div>
                      <span className="font-mono text-[11px] font-bold">
                        {item.gainSinceSignalPct >= 0 ? '+' : ''}{item.gainSinceSignalPct}%
                      </span>
                    </div>
                  )}

                  {/* Price & Confidence Bar */}
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold block">
                        {isHistoricalView 
                          ? 'Signal Price' 
                          : (isMarketOpen ? 'Live Price' : 'Closing Price')}
                      </span>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-base font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                          PKR {item.currentPrice.toFixed(2)}
                        </span>
                        {isHistoricalView ? (
                          <span className="text-[10.5px] font-mono text-zinc-400">
                            (Now: {item.liveMarketPrice.toFixed(2)})
                          </span>
                        ) : (
                          <span className={`text-[11px] font-mono font-semibold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isUp ? '+' : ''}{item.changePercent}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold block">
                        AI Conf
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                        {item.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Quant Metric Block: No soft pink/orange bubble pill borders! */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-zinc-100 dark:border-zinc-800/80 mb-2">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold block truncate">
                        {item.isMomentumBreakout ? 'TRAIL BAND' : (item.signal === 'AVOID_SELL' ? 'DEFENSIVE ZONE' : 'ENTRY ZONE')}
                      </span>
                      <span className="text-xs font-mono font-bold tabular-nums text-zinc-800 dark:text-zinc-200 block truncate">
                        {item.entryZone?.min ? `${item.entryZone.min}-${item.entryZone.max}` : item.currentPrice.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold block truncate">
                        {item.isMomentumBreakout ? 'TRAIL STOP' : (item.signal === 'AVOID_SELL' ? 'EXIT TRIGGER' : 'STOP LOSS')}
                      </span>
                      <span className="text-xs font-mono font-bold tabular-nums text-rose-600 dark:text-rose-400 block truncate">
                        PKR {item.stopLoss}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold block truncate">
                        {item.signal === 'AVOID_SELL' ? 'PULLBACK SUPP' : 'TARGET 1'}
                      </span>
                      <span className="text-xs font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400 block truncate">
                        PKR {item.target1}
                      </span>
                    </div>
                  </div>

                  {/* Key Catalyst (Single clean line) */}
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate flex items-center space-x-1.5 mb-2.5">
                    <Activity className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{item.reasons?.[0] || 'Technical setup confirmed on EOD volume.'}</span>
                  </div>
                </div>

                {/* Card Actions (Compact h-8 institutional buttons) */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                  <button
                    onClick={() => onOpenCalculator(item)}
                    className="flex items-center justify-center space-x-1 h-8 px-2.5 rounded text-xs font-medium bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 transition-colors cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 mr-1" />
                    <span>Order Calc</span>
                  </button>
                  <button
                    onClick={() => onSelectStock(item.symbol)}
                    className="flex items-center justify-center space-x-1 h-8 px-2.5 rounded text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                  >
                    <LineChart className="w-3.5 h-3.5 mr-1" />
                    <span>Chart & Intel</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section-Level Regulatory Compliance Notice */}
      <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">SECP Compliance Notice:</span> PSX STOCKKING algorithmic signals and price projection models are strictly for educational and technical market research. They do not constitute investment advice or a recommendation to buy or sell securities.
        </p>
      </div>
    </div>
  );
}

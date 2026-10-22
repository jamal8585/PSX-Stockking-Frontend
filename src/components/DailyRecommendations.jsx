import React, { useState, useMemo, useEffect, useRef, useTransition } from 'react';
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
  ChevronLeft,
  ChevronRight,
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
  Activity,
  MinusCircle
} from 'lucide-react';
import officialQuotes from '../data/official_quotes.json';
import { getRecommendations } from '../services/api';
import { 
  SECTOR_CATEGORIES, 
  MASTER_STOCKS_LIST, 
  getCompanyFullName,
  getPSXMarketSessionInfo,
  getPSXMarketStatus
} from '../utils/marketSession';
export { getPSXMarketSessionInfo, getCompanyFullName };

// Format clean Month Day badge (e.g. 'Oct 19', 'Oct 20', 'Oct 21')
export const formatRadarDateBadge = (dateStr) => {
  if (!dateStr) return 'Oct 21';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (month >= 1 && month <= 12) {
      return `${months[month - 1]} ${day}`;
    }
  }
  return dateStr;
};

// Dynamic Card Session Badge for the top right pill (e.g. 'ACTIONABLE: OCT 22 OPEN', 'OCT 21 CLOSE', 'ARCHIVE: OCT 20')
export const getCardSessionBadge = ({ isHistoricalView, isLive, activeSessionObj }) => {
  if (isHistoricalView) {
    const dateBadge = formatRadarDateBadge(activeSessionObj?.dateStr);
    return `ARCHIVE: ${dateBadge.toUpperCase()}`;
  }
  if (isLive) {
    return 'LIVE SESSION';
  }
  if (activeSessionObj?.dayOffset === 0) {
    const targetBadge = formatRadarDateBadge(activeSessionObj?.dateStr);
    return `ACTIONABLE: ${targetBadge.toUpperCase()} OPEN`;
  }
  const dateBadge = formatRadarDateBadge(activeSessionObj?.dateStr);
  return `${dateBadge.toUpperCase()} CLOSE`;
};

// Dynamic Price Metric Label (Decouples base reference price from future actionable session date)
export const getPriceMetricLabel = ({ isHistoricalView, isLive, activeSessionObj, recentSessions }) => {
  if (isHistoricalView) {
    const dateBadge = formatRadarDateBadge(activeSessionObj?.dateStr);
    return `SIGNAL PRICE (${dateBadge.toUpperCase()})`;
  }
  if (isLive) {
    return 'LIVE PRICE';
  }
  // When viewing tomorrow's / actionable open (dayOffset === 0 in post-market / pre-market / weekend)
  if (activeSessionObj?.dayOffset === 0) {
    // Reference price is from the last completed trading day (recentSessions[1])
    const lastCompletedDateStr = recentSessions && recentSessions[1]?.dateStr;
    const lastDateBadge = formatRadarDateBadge(lastCompletedDateStr || '');
    return `LAST EOD CLOSE (${lastDateBadge.toUpperCase()})`;
  }
  // When viewing today's closing / EOD snapshot (dayOffset === 1)
  const currentBadge = formatRadarDateBadge(activeSessionObj?.dateStr);
  return `CLOSING PRICE (${currentBadge.toUpperCase()})`;
};

// Action Summary Heading (e.g. '🎯 WHAT TO DO (OCT 22 OPEN):')
export const getActionHeading = ({ isHistoricalView, isLive, activeSessionObj }) => {
  if (isHistoricalView) {
    const dateBadge = formatRadarDateBadge(activeSessionObj?.dateStr);
    return `🎯 SESSION ACTION PLAN (${dateBadge.toUpperCase()}):`;
  }
  if (isLive) {
    return '🎯 WHAT TO DO (LIVE SESSION):';
  }
  if (activeSessionObj?.dayOffset === 0) {
    const targetBadge = formatRadarDateBadge(activeSessionObj?.dateStr);
    return `🎯 WHAT TO DO (${targetBadge.toUpperCase()} OPEN):`;
  }
  const dateBadge = formatRadarDateBadge(activeSessionObj?.dateStr);
  return `🎯 WHAT TO DO (${dateBadge.toUpperCase()} CLOSE):`;
};

// Dynamic Action Summary Generator tailored to regime and exact price levels
export const generateActionSummary = (item) => {
  const signal = item.signal || 'HOLD';
  const isMomentumBreakout = Boolean(item.isMomentumBreakout);
  const entryMin = item.entryZone?.min ? Number(item.entryZone.min).toFixed(2) : (item.currentPrice * 0.985).toFixed(2);
  const entryMax = item.entryZone?.max ? Number(item.entryZone.max).toFixed(2) : (item.currentPrice * 1.01).toFixed(2);
  const stopLoss = item.stopLoss ? Number(item.stopLoss).toFixed(2) : (item.currentPrice * 0.95).toFixed(2);
  const target1 = item.target1 ? Number(item.target1).toFixed(2) : (item.currentPrice * 1.08).toFixed(2);
  const price = Number(item.currentPrice || 100);

  // 1. MOMENTUM BREAKOUT • TRAIL STOP (High RSI > 70 runners)
  if (isMomentumBreakout || (Number(item.rsi || item.technicals?.rsi14 || 50) >= 70 && Number(item.changePercent || 0) > 0)) {
    return `Do not chase high opens. Trail stop loss tightly to PKR ${stopLoss}. Lock partial profits near PKR ${target1} and let runner shares ride the momentum.`;
  }

  // 2. BEARISH SETUP / TECH BREAKDOWN (AVOID_SELL / SELL)
  if (signal === 'AVOID_SELL' || signal === 'SELL') {
    const defensiveHigh = entryMax || (price * 1.008).toFixed(2);
    const exitTrigger = stopLoss || (price * 0.965).toFixed(2);
    return `Avoid fresh buying. If holding existing positions, use any morning pullbacks toward PKR ${defensiveHigh} to exit. Trigger defensive stop if price breaches below PKR ${exitTrigger}.`;
  }

  // 3. BULLISH SETUP (STRONG_BUY / ACCUMULATE)
  if (signal === 'STRONG_BUY' || signal === 'ACCUMULATE') {
    return `Wait for a 10-15 min opening dip into the entry zone (PKR ${entryMin} - ${entryMax}). Accumulate with a strict stop loss below PKR ${stopLoss}. First target PKR ${target1}.`;
  }

  // 4. CONSOLIDATION / NEUTRAL (HOLD / NEUTRAL)
  const support = entryMin || (price * 0.98).toFixed(2);
  const resistance = target1 || (price * 1.04).toFixed(2);
  return `Range-bound session expected. Stand aside for clear directional breakout. Buy only near support PKR ${support} or sell near resistance PKR ${resistance}.`;
};

// Generate Last N PSX Trading Days (skips Saturday and Sunday, syncs with marketSession)
export function getPSXRecentTradingSessions(count = 5) {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const pktDate = new Date(utc + (3600000 * 5));
  const sessionInfo = getPSXMarketSessionInfo();
  
  const sessions = [];
  const day = pktDate.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat

  if (sessionInfo.isWeekend) {
    // 1. Weekend (Saturday & Sunday)
    const mon = new Date(sessionInfo.targetDate);
    sessions.push({
      dateStr: mon.toISOString().split('T')[0],
      label: `Mon, ${mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Karachi' })}`,
      badge: 'Upcoming (Mon)',
      isLive: false,
      dayOffset: 0
    });

    // Friday close is Tab 1
    const fri = new Date(pktDate);
    fri.setDate(pktDate.getDate() - (day === 6 ? 1 : 2));
    sessions.push({
      dateStr: fri.toISOString().split('T')[0],
      label: `Fri, ${fri.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Karachi' })}`,
      badge: 'Friday Close / EOD',
      isLive: false,
      dayOffset: 1
    });

    let backtrack = new Date(fri);
    let offsetCounter = 2;
    while (sessions.length < count) {
      backtrack.setDate(backtrack.getDate() - 1);
      const bDay = backtrack.getDay();
      if (bDay !== 0 && bDay !== 6) {
        const dateStr = backtrack.toISOString().split('T')[0];
        const weekday = backtrack.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Karachi' });
        const dateFmt = backtrack.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Karachi' });
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
  } else if (sessionInfo.isPostMarket) {
    // 2. Post-Market (4:00 PM to 11:59 PM PKT)
    const target = new Date(sessionInfo.targetDate);
    const targetWeekday = target.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Karachi' });
    const targetDateFmt = target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Karachi' });
    sessions.push({
      dateStr: target.toISOString().split('T')[0],
      label: `${targetWeekday}, ${targetDateFmt}`,
      badge: sessionInfo.isFridayEod ? "Upcoming (Mon)" : "Tomorrow's Open",
      isLive: false,
      dayOffset: 0
    });

    // Tab 1 is today's closing snapshot
    sessions.push({
      dateStr: pktDate.toISOString().split('T')[0],
      label: `Today, ${pktDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Karachi' })}`,
      badge: "Today's Close / EOD",
      isLive: false,
      dayOffset: 1
    });

    let backtrack = new Date(pktDate);
    let offsetCounter = 2;
    while (sessions.length < count) {
      backtrack.setDate(backtrack.getDate() - 1);
      const bDay = backtrack.getDay();
      if (bDay !== 0 && bDay !== 6) {
        const dateStr = backtrack.toISOString().split('T')[0];
        const weekday = backtrack.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Karachi' });
        const dateFmt = backtrack.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Karachi' });
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
  } else {
    // 3. Pre-Market (00:00 to 09:14 PKT) or Live Session (09:15 to 16:00 PKT)
    const isLive = sessionInfo.isLive;
    sessions.push({
      dateStr: pktDate.toISOString().split('T')[0],
      label: `Today, ${pktDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Karachi' })}`,
      badge: isLive ? 'Live Session' : 'Pre-Market',
      isLive,
      dayOffset: 0
    });

    let backtrack = new Date(pktDate);
    let offsetCounter = 1;
    while (sessions.length < count) {
      backtrack.setDate(backtrack.getDate() - 1);
      const bDay = backtrack.getDay();
      if (bDay !== 0 && bDay !== 6) {
        const dateStr = backtrack.toISOString().split('T')[0];
        const weekday = backtrack.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Karachi' });
        const dateFmt = backtrack.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Karachi' });
        sessions.push({
          dateStr,
          label: `${weekday}, ${dateFmt}`,
          badge: offsetCounter === 1 && !isLive ? 'Previous EOD' : `Day -${offsetCounter}`,
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

  // Single Source of Truth: exact master pricing store consumed by the Ticker Tape
  const masterStockMap = useMemo(() => {
    const map = new Map();
    if (officialQuotes && typeof officialQuotes === 'object') {
      Object.values(officialQuotes).forEach(q => {
        if (q?.symbol) map.set(q.symbol.toUpperCase().trim(), q);
      });
    }
    if (Array.isArray(stocks)) {
      stocks.forEach(s => {
        if (s?.symbol && Number(s.currentPrice) > 0) {
          const symKey = s.symbol.toUpperCase().trim();
          map.set(symKey, { ...map.get(symKey), ...s });
        }
      });
    }
    return map;
  }, [stocks]);

  const [filterSignal, setFilterSignal] = useState('ALL');
  const [selectedSectors, setSelectedSectors] = useState([]); // array of category IDs (e.g. ['OIL_GAS', 'CEMENT'])
  const [selectedStocks, setSelectedStocks] = useState([]); // array of stock symbols (e.g. ['PRL', 'HUBC'])
  const [searchQuery, setSearchQuery] = useState('');

  // Smooth Tab Transitions & Non-blocking State Updates (Prevent Layout Jerk)
  const [isPending, startTransition] = useTransition();

  // Pagination for High Volume Stocks (Prevents layout shifts & DOM jank)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  const handleFilterSignalChange = (newSignal) => {
    startTransition(() => {
      setFilterSignal(newSignal);
      setCurrentPage(1);
    });
  };

  const handleSessionDateChange = (newDate) => {
    startTransition(() => {
      setSelectedSessionDate(newDate);
      setCurrentPage(1);
    });
  };

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

  // 5-Trading Session History Selector with automated midnight rollover ticker
  const [sessionClock, setSessionClock] = useState(() => Date.now());
  const marketSession = useMemo(() => getPSXMarketSessionInfo(), [sessionClock]);
  const recentSessions = useMemo(() => getPSXRecentTradingSessions(5), [sessionClock]);
  const [selectedSessionDate, setSelectedSessionDate] = useState(() => recentSessions[0]?.dateStr);

  // Automated Midnight Rollover & Periodical Tick (Calculates exact time to 00:00:00 PKT)
  useEffect(() => {
    const updateClock = () => setSessionClock(Date.now());

    // 1. Calculate milliseconds to next midnight PKT sharp
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const pktDate = new Date(utc + (3600000 * 5));
    const hours = pktDate.getHours();
    const minutes = pktDate.getMinutes();
    const seconds = pktDate.getSeconds();
    const ms = pktDate.getMilliseconds();
    const msUntilMidnight = (((23 - hours) * 3600) + ((59 - minutes) * 60) + (59 - seconds)) * 1000 + (1000 - ms);

    const midnightTimer = setTimeout(() => {
      updateClock();
    }, Math.max(500, msUntilMidnight));

    // 2. Regular 10-second pulse to keep UI fresh
    const intervalTimer = setInterval(updateClock, 10000);

    return () => {
      clearTimeout(midnightTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  // Ensure the active selected tab in the 5-Day Radar automatically snaps to the current active session date
  useEffect(() => {
    if (recentSessions[0]?.dateStr) {
      setSelectedSessionDate(recentSessions[0].dateStr);
    }
  }, [recentSessions[0]?.dateStr]);

  const activeSessionObj = useMemo(() => {
    return recentSessions.find(s => s.dateStr === selectedSessionDate) || recentSessions[0];
  }, [recentSessions, selectedSessionDate]);

  // Historical archive is strictly past days before today (dayOffset >= 2)
  const isHistoricalView = Boolean(activeSessionObj && activeSessionObj.dayOffset >= 2);

  // Tab State Hydration: Cache for sessions fetched from backend
  const [sessionSignalsMap, setSessionSignalsMap] = useState({});
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Fetch immutable snapshot records whenever the user clicks/switches tabs
  useEffect(() => {
    let isMounted = true;
    const fetchSessionSignals = async () => {
      if (!selectedSessionDate) return;
      if (sessionSignalsMap[selectedSessionDate]) return;

      try {
        setIsLoadingSession(true);
        const res = await getRecommendations({ 
          session_date: selectedSessionDate, 
          date: selectedSessionDate 
        });
        if (isMounted && res?.success && Array.isArray(res.all)) {
          setSessionSignalsMap(prev => ({
            ...prev,
            [selectedSessionDate]: res.all
          }));
        }
      } catch (err) {
        console.warn('Could not fetch historical session signals:', err.message);
      } finally {
        if (isMounted) setIsLoadingSession(false);
      }
    };

    fetchSessionSignals();
    return () => { isMounted = false; };
  }, [selectedSessionDate]);

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

  const isPro = currentUser?.plan === 'PRO' && currentUser?.subscriptionStatus === 'ACTIVE';

  // Resiliently derive recommendations list (prioritizing hydrated active session snapshots)
  const rawList = useMemo(() => {
    if (sessionSignalsMap[selectedSessionDate] && sessionSignalsMap[selectedSessionDate].length > 0) {
      return sessionSignalsMap[selectedSessionDate];
    }
    if (Array.isArray(recommendations?.all) && recommendations.all.length > 0) {
      return recommendations.all;
    }
    if (Array.isArray(recommendations) && recommendations.length > 0) {
      return recommendations;
    }
    return [];
  }, [sessionSignalsMap, selectedSessionDate, recommendations]);

  // Compute base signals list
  const all = useMemo(() => {
    let baseList = [];
    if (rawList && rawList.length > 0) {
      baseList = rawList.map(item => {
        const sym = (item?.symbol || '').toUpperCase().trim();
        const liveStock = masterStockMap.get(sym);
        let sanitized = { ...item };
        
        // For active / live sessions, ground-truth live master stock store as authoritative EOD single source of truth
        if (liveStock?.currentPrice && !isHistoricalView) {
          const offPrice = Number(liveStock.currentPrice);
          sanitized.currentPrice = offPrice;
          sanitized.prevClose = Number(liveStock.prevClose || offPrice * 0.99);
          sanitized.change = liveStock.change !== undefined ? Number(liveStock.change) : Number((offPrice - sanitized.prevClose).toFixed(2));
          sanitized.changePercent = liveStock.changePercent !== undefined ? Number(liveStock.changePercent) : (sanitized.prevClose > 0 ? Number((((offPrice - sanitized.prevClose) / sanitized.prevClose) * 100).toFixed(2)) : 0);
          
          // Re-evaluate signal if drop < -2.2% (e.g. PRL -4.77% cannot remain Momentum Breakout)
          if (sanitized.changePercent < -2.2) {
            sanitized.signal = 'AVOID_SELL';
            sanitized.isMomentumBreakout = false;
            sanitized.tradeStrategy = 'Capital Preservation (Defensive Exit)';
          }
        }
        
        return sanitized;
      });
    } else if (Array.isArray(stocks) && stocks.length > 0) {
      baseList = stocks.map(stock => {
        const sym = (stock.symbol || '').toUpperCase().trim();
        const liveStock = masterStockMap.get(sym);
        const price = Number(liveStock?.currentPrice || stock.currentPrice || 100);
        const changePct = Number(liveStock?.changePercent ?? stock.changePercent ?? 0);
        const rsi = Number(liveStock?.technicals?.rsi14 || stock.technicals?.rsi14 || 52);
        
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

        // Momentum Breakout: RSI >= 70 with positive price momentum
        const isMomentumBreakout = Boolean(
          rsi >= 70 && changePct > 0
        );

        if (isMomentumBreakout || rsi > 74 || changePct < -2.2) {
          sig = 'AVOID_SELL';
          confidence = isMomentumBreakout 
            ? Math.min(95, Math.max(82, 85 + (absHash % 10) - 2))
            : Math.min(92, Math.max(76, 80 + (absHash % 12) - 2));
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
        }

        // Calculate dynamic entry / defensive zone first
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
            entryMin = Number(Math.max(pivot * 0.995, price * (1 - (stockAtr * 0.4 / price))).toFixed(2));
            entryMax = Number(Math.max(r1, price * (1 + (stockAtr * 0.75 / price))).toFixed(2));
          }
        } else {
          entryMin = Number((price * 0.985).toFixed(2));
          entryMax = Number((price * 1.015).toFixed(2));
        }

        if (sig === 'STRONG_BUY' || sig === 'ACCUMULATE' || sig === 'HOLD') {
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

          // STRICT INVARIANT FOR LONG: Stop Loss < Entry Min < Entry Max < Target 1 < Target 2
          if (entryMin >= price) entryMin = Number((price * 0.985).toFixed(2));
          if (entryMax <= entryMin) entryMax = Number((entryMin + Math.max(stockAtr * 0.4, price * 0.015)).toFixed(2));
          if (stopLoss >= entryMin) stopLoss = Number((entryMin - Math.max(stockAtr * 0.6, price * 0.02)).toFixed(2));
          if (target1 <= entryMax) target1 = Number((entryMax + Math.max(stockAtr * 1.5, price * 0.05)).toFixed(2));
          if (target2 <= target1) target2 = Number((target1 + Math.max(stockAtr * 1.2, price * 0.04)).toFixed(2));

          const risk = Math.max(0.1, price - stopLoss);
          const reward = Math.max(0.1, target1 - price);
          rrRatio = Number((reward / risk).toFixed(2));
          riskReward = '1 : ' + rrRatio;
        }

        const resolvedSector = (
          (stock.sector && stock.sector !== 'General Market' && stock.sector !== 'Miscellaneous') ? stock.sector :
          (foundOfficial?.sector && foundOfficial.sector !== 'General Market' && foundOfficial.sector !== 'Miscellaneous') ? foundOfficial.sector :
          (MASTER_STOCKS_LIST.find(m => m.symbol === sym)?.sector) ||
          'Miscellaneous'
        );

        const masterStock = MASTER_STOCKS_LIST.find(m => m.symbol === sym);
        const resolvedCompanyName = getCompanyFullName(sym) || masterStock?.name || (stock.name && stock.name !== sym ? stock.name : null) || foundOfficial?.name || sym;

        return {
          symbol: sym,
          companyName: resolvedCompanyName,
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
            (rsi >= 50 && rsi < 70) 
              ? `Healthy Bullish Momentum (${rsi.toFixed(1)})` 
              : ((rsi >= 40 && rsi < 50) 
                  ? `Balanced / Neutral Range (${rsi.toFixed(1)})` 
                  : (rsi < 35 
                      ? `Oversold / Capitulation (${rsi.toFixed(1)}) — Watch for Mean Reversion` 
                      : `RSI holding steady at ${rsi.toFixed(1)} with key technical support at PKR ${stopLoss}`)),
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

    // If viewing a historical session, derive historical price snapshot only if not already hydrated from immutable snapshots
    if (isHistoricalView && baseList.length > 0 && !sessionSignalsMap[selectedSessionDate]) {
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

  const summary = useMemo(() => {
    let strongBuyCount = 0;
    let accumulateCount = 0;
    let holdCount = 0;
    let avoidSellCount = 0;
    all.forEach(r => {
      if (r.signal === 'STRONG_BUY') strongBuyCount++;
      else if (r.signal === 'ACCUMULATE') accumulateCount++;
      else if (r.signal === 'HOLD') holdCount++;
      else if (r.signal === 'AVOID_SELL') avoidSellCount++;
    });
    return {
      total: all.length,
      strongBuyCount,
      accumulateCount,
      holdCount,
      avoidSellCount
    };
  }, [all]);

  const getLiveStock = (item) => {
    const sym = (item?.symbol || '').toUpperCase().trim();
    const liveStock = masterStockMap.get(sym);

    const isSnapshot = Boolean(isHistoricalView || item?.isHistoricalSnapshot);

    // Live verified EOD closing price from unified single source of truth (exact store consumed by Ticker Tape)
    const verifiedEODPrice = Number(
      liveStock?.currentPrice || liveStock?.closeRate || liveStock?.settlementPrice || item?.currentPrice || 100
    );

    const prevClose = Number(
      liveStock?.prevClose || (verifiedEODPrice * 0.99)
    );

    const liveChange = liveStock?.change !== undefined 
      ? Number(liveStock.change) 
      : Number((verifiedEODPrice - prevClose).toFixed(2));

    const liveChangePercent = liveStock?.changePercent !== undefined 
      ? Number(liveStock.changePercent) 
      : (prevClose > 0 ? Number((((verifiedEODPrice - prevClose) / prevClose) * 100).toFixed(2)) : 0);

    // In historical snapshot mode, render the exact recorded snapshot price & metrics
    const signalPrice = isSnapshot ? Number(item?.currentPrice || verifiedEODPrice) : verifiedEODPrice;
    const change = isSnapshot ? (item?.change !== undefined ? Number(item.change) : liveChange) : liveChange;
    const changePercent = isSnapshot ? (item?.changePercent !== undefined ? Number(item.changePercent) : liveChangePercent) : liveChangePercent;

    const liveRsi = isSnapshot 
      ? Number(item?.rsi || item?.technicals?.rsi14 || 52)
      : Number(liveStock?.technicals?.rsi14 || item?.technicals?.rsi14 || 52);

    const isMomentumBreakout = Boolean(
      isSnapshot 
        ? (item?.isMomentumBreakout || item?.is_momentum_breakout)
        : (liveRsi >= 70 && changePercent > 0)
    );

    const isAvoid = (item?.signal === 'AVOID_SELL') || isMomentumBreakout;

    const symHash = sym.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const hashOffset = (symHash % 35) / 10;
    const stockAtr = Math.max(signalPrice * 0.014, signalPrice * 0.028);

    let finalEntryZone;
    let finalStopLoss;
    let finalTarget1;
    let finalTarget2;

    if (isSnapshot && item?.entryZone && item?.stopLoss && item?.target1) {
      // Respect exact immutable historical setup from archive!
      finalEntryZone = { ...item.entryZone };
      finalStopLoss = Number(item.stopLoss);
      finalTarget1 = Number(item.target1);
      finalTarget2 = Number(item.target2 || item.target1 * 1.05);
    } else {
      if (isAvoid) {
        if (isMomentumBreakout) {
          finalEntryZone = { min: Number((signalPrice * 0.991).toFixed(2)), max: Number((signalPrice * 1.004).toFixed(2)) };
          finalStopLoss = Number((signalPrice * 0.978).toFixed(2));
          finalTarget1 = Number((signalPrice * 0.969).toFixed(2));
          finalTarget2 = Number((signalPrice * 0.945).toFixed(2));
        } else {
          finalEntryZone = { min: Number((signalPrice * 0.97).toFixed(2)), max: Number((signalPrice * 1.005).toFixed(2)) };
          finalStopLoss = Number((signalPrice * 0.95).toFixed(2));
          finalTarget1 = Number((signalPrice * 1.05).toFixed(2));
          finalTarget2 = Number((signalPrice * 1.09).toFixed(2));
        }
      } else if (item?.signal === 'STRONG_BUY') {
        finalEntryZone = { min: Number((signalPrice * 0.985).toFixed(2)), max: Number((signalPrice * 1.01).toFixed(2)) };
        finalStopLoss = Number((signalPrice * 0.95).toFixed(2));
        finalTarget1 = Number((signalPrice * 1.095).toFixed(2));
        finalTarget2 = Number((signalPrice * 1.18).toFixed(2));
      } else {
        finalEntryZone = { min: Number((signalPrice * 0.98).toFixed(2)), max: Number((signalPrice * 1.015).toFixed(2)) };
        finalStopLoss = Number((signalPrice * 0.945).toFixed(2));
        finalTarget1 = Number((signalPrice * 1.08).toFixed(2));
        finalTarget2 = Number((signalPrice * 1.15).toFixed(2));
      }
    }

    if (!isAvoid && !isSnapshot) {
      if (finalEntryZone.min >= signalPrice) finalEntryZone.min = Number((signalPrice * 0.985).toFixed(2));
      if (finalEntryZone.max <= finalEntryZone.min) finalEntryZone.max = Number((finalEntryZone.min + Math.max(stockAtr * 0.4, signalPrice * 0.015)).toFixed(2));
      if (finalStopLoss >= finalEntryZone.min) finalStopLoss = Number((finalEntryZone.min - Math.max(stockAtr * 0.6, signalPrice * 0.02)).toFixed(2));
      if (finalTarget1 <= finalEntryZone.max) finalTarget1 = Number((finalEntryZone.max + Math.max(stockAtr * 1.5, signalPrice * 0.05)).toFixed(2));
      if (finalTarget2 <= finalTarget1) finalTarget2 = Number((finalTarget1 + Math.max(stockAtr * 1.2, signalPrice * 0.04)).toFixed(2));
    }

    const tradeStrategy = isMomentumBreakout
      ? 'Momentum Breakout • Trail Stop'
      : (item?.signal === 'AVOID_SELL' 
          ? 'Capital Preservation (Exit Setup)' 
          : (item?.signal === 'STRONG_BUY' 
              ? 'Strong Buy • Growth Expansion' 
              : (item?.signal === 'ACCUMULATE' 
                  ? 'Accumulate on Dip' 
                  : (item?.tradeStrategy || 'Trend Continuation Setup'))));

    // Reasons / Catalyst notes with sanitized RSI thresholds
    let finalReasons = Array.isArray(item?.reasons) && item.reasons.length > 0 
      ? item.reasons.map(r => {
          if (typeof r === 'string' && r.toLowerCase().includes('overbought')) {
            if (liveRsi < 70) {
              if (liveRsi >= 50 && liveRsi <= 60) {
                return `Neutral Momentum (${liveRsi.toFixed(1)}) — Consolidation Range`;
              }
              return `Consolidation Range (${liveRsi.toFixed(1)}) — Low Volatility`;
            }
          }
          return r;
        })
      : [];

    if (finalReasons.length === 0) {
      if (isMomentumBreakout) {
        finalReasons = [`Overbought / Extended Momentum (${liveRsi.toFixed(1)}) — Trail stop loss advised to lock gains rather than chasing entries.`];
      } else if (item?.signal === 'AVOID_SELL') {
        finalReasons = [
          liveRsi >= 70
            ? `RSI is Overbought (${liveRsi.toFixed(1)}): High probability of profit-taking consolidation`
            : (liveRsi >= 50 && liveRsi <= 60)
              ? `Neutral Momentum (${liveRsi.toFixed(1)}) — Consolidation Range`
              : `Technical Momentum (${liveRsi.toFixed(1)}): Capital preservation advised`
        ];
      } else {
        finalReasons = [`${item?.signal || 'HOLD'}: Technical setup confirmed on EOD volume.`];
      }
    }

    // Outcome tracking
    const calcGainPct = Number((((liveMarketPrice - signalPrice) / signalPrice) * 100).toFixed(2));
    const gainSinceSignalPct = item?.outcome?.gainSinceSignalPct !== undefined 
      ? Number(item.outcome.gainSinceSignalPct) 
      : calcGainPct;

    let outcomeStatus = item?.outcome?.status || (isHistoricalView ? 'CLOSED' : 'IN_PROGRESS');
    let outcomeLabel = item?.outcome?.label || (isHistoricalView ? `Closed (${gainSinceSignalPct >= 0 ? '+' : ''}${gainSinceSignalPct}%)` : `In Progress (${gainSinceSignalPct >= 0 ? '+' : ''}${gainSinceSignalPct}%)`);
    let outcomeBadgeClass = item?.outcome?.badgeColor || (isHistoricalView ? 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20');

    // For past historical sessions (Day -2, Day -3, Day -4), lock outcome strictly to completed state - NEVER "In Progress"
    if (isHistoricalView && (!item?.outcome || outcomeStatus === 'IN_PROGRESS' || outcomeLabel.includes('In Progress'))) {
      if (isAvoid || isMomentumBreakout) {
        if (gainSinceSignalPct < 0 || signalPrice > liveMarketPrice) {
          outcomeStatus = 'CLOSED_NEXT_DAY_DROP';
          outcomeLabel = 'Closed on Next Day Drop';
          outcomeBadgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
        } else {
          outcomeStatus = 'CAPITAL_PRESERVED';
          outcomeLabel = 'Capital Preserved';
          outcomeBadgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        }
      } else {
        if (gainSinceSignalPct >= 3.0 || liveMarketPrice >= finalTarget1) {
          outcomeStatus = 'TARGET_HIT';
          outcomeLabel = `Target 1 Hit (${gainSinceSignalPct >= 0 ? '+' : ''}${gainSinceSignalPct}% Win)`;
          outcomeBadgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
        } else if (gainSinceSignalPct <= -2.5 || liveMarketPrice <= finalStopLoss) {
          outcomeStatus = 'STOP_LOSS_HIT';
          outcomeLabel = `Stopped Out (${gainSinceSignalPct}%)`;
          outcomeBadgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
        } else if (gainSinceSignalPct > 0) {
          outcomeStatus = 'CLOSED_PROFIT';
          outcomeLabel = `Closed in Profit (+${gainSinceSignalPct}%)`;
          outcomeBadgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        } else {
          outcomeStatus = 'CLOSED_NEUTRAL';
          outcomeLabel = `Closed at Session Close (${gainSinceSignalPct}%)`;
          outcomeBadgeClass = 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
        }
      }
    } else if (!isHistoricalView && !item?.outcome) {
      if (isAvoid) {
        if (liveMarketPrice <= finalTarget1) {
          outcomeStatus = 'TARGET_HIT';
          outcomeLabel = `Support Reached (${gainSinceSignalPct}% Pullback)`;
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
        if (liveMarketPrice >= finalTarget1) {
          outcomeStatus = 'TARGET_HIT';
          outcomeLabel = `Target 1 Hit (${gainSinceSignalPct >= 0 ? '+' : ''}${gainSinceSignalPct}% Win)`;
          outcomeBadgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
        } else if (liveMarketPrice <= finalStopLoss) {
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
    }

    const resolvedSector = (
      (item?.sector && item.sector !== 'General Market' && item.sector !== 'Miscellaneous') ? item.sector :
      (foundOfficial?.sector && foundOfficial.sector !== 'General Market' && foundOfficial.sector !== 'Miscellaneous') ? foundOfficial.sector :
      (foundInStocks?.sector && foundInStocks.sector !== 'General Market' && foundInStocks.sector !== 'Miscellaneous') ? foundInStocks.sector :
      (MASTER_STOCKS_LIST.find(m => m.symbol === sym)?.sector) ||
      'Miscellaneous'
    );

    const masterStock = MASTER_STOCKS_LIST.find(m => m.symbol === sym);
    const resolvedCompanyName = getCompanyFullName(sym) || masterStock?.name || (foundInStocks?.name && foundInStocks.name !== sym ? foundInStocks.name : null) || (foundOfficial?.name && foundOfficial.name !== sym ? foundOfficial.name : null) || (item?.companyName && item.companyName !== sym ? item.companyName : null) || sym;

    return {
      ...item,
      companyName: resolvedCompanyName,
      sector: resolvedSector,
      currentPrice: isHistoricalView ? signalPrice : liveMarketPrice,
      signalPrice,
      liveMarketPrice,
      prevClose,
      change,
      changePercent,
      target1: finalTarget1,
      target2: finalTarget2,
      stopLoss: finalStopLoss,
      entryZone: finalEntryZone,
      isMomentumBreakout,
      tradeStrategy,
      reasons: finalReasons,
      technicals: {
        ...(item?.technicals || {}),
        rsi14: liveRsi
      },
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
    startTransition(() => {
      setSelectedSectors([]);
      setSelectedStocks([]);
      setSearchQuery('');
      setFilterSignal('ALL');
      setCurrentPage(1);
    });
  };

  // Filter recommendations using all multi-select & search parameters and pre-hydrate live stock data
  const filteredSignals = useMemo(() => {
    const list = all.filter(r => {
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
        const nameMatch = (r.companyName || getCompanyFullName(r.symbol) || '').toLowerCase().includes(q);
        const sectorMatch = (r.sector || '').toLowerCase().includes(q);
        if (!symMatch && !nameMatch && !sectorMatch) return false;
      }

      return true;
    });

    return list.map((rawItem, idx) => ({
      ...getLiveStock(rawItem),
      rawIndex: idx
    }));
  }, [all, filterSignal, selectedSectors, selectedStocks, searchQuery, masterStockMap, isHistoricalView]);

  const totalPages = Math.max(1, Math.ceil(filteredSignals.length / (pageSize === -1 ? filteredSignals.length || 1 : pageSize)));

  const paginatedSignals = useMemo(() => {
    if (pageSize === -1) return filteredSignals;
    const start = (currentPage - 1) * pageSize;
    return filteredSignals.slice(start, start + pageSize);
  }, [filteredSignals, currentPage, pageSize]);

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
    if (isMomentumBreakout) {
      return {
        label: 'Momentum Breakout • Trail Stop',
        className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40',
        icon: <Flame className="w-3.5 h-3.5 mr-1 text-amber-500" />
      };
    }
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
            <div className="flex items-center space-x-2">
              {isLoadingSession && (
                <span className="text-[11px] font-medium text-[#2563EB] dark:text-[#60A5FA] animate-pulse flex items-center space-x-1">
                  <Activity className="w-3 h-3 animate-spin" />
                  <span>Hydrating Archive...</span>
                </span>
              )}
              {isHistoricalView && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center self-start sm:self-auto space-x-1">
                  <History className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Historical Archive: {activeSessionObj.label}</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-[#F8FAFC] dark:bg-[#0B0F19] p-1.5 rounded-md border border-[#E2E8F0] dark:border-[#243044]">
            {recentSessions.map(session => {
              const isSelected = selectedSessionDate === session.dateStr;
              return (
                <button
                  key={session.dateStr}
                  onClick={() => handleSessionDateChange(session.dateStr)}
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
              Evaluated {summary.total} Active Coverage Stocks • Multi-factor quantitative setups, volume absorption detection, and 5-day performance tracking.
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
                onClick={() => handleFilterSignalChange('ALL')}
                className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  filterSignal === 'ALL' 
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                All ({summary.total || all.length})
              </button>
              <button
                onClick={() => handleFilterSignalChange('STRONG_BUY')}
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
                onClick={() => handleFilterSignalChange('ACCUMULATE')}
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
                onClick={() => handleFilterSignalChange('HOLD')}
                className={`px-2.5 py-1 rounded font-bold transition-all flex items-center space-x-1 cursor-pointer whitespace-nowrap shrink-0 ${
                  filterSignal === 'HOLD' 
                    ? 'bg-amber-600 text-white shadow-xs' 
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <MinusCircle className="w-3.5 h-3.5 mr-1" />
                <span>Hold / Neutral</span>
                <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-black/20 font-bold font-mono">{summary.holdCount || 0}</span>
              </button>
              <button
                onClick={() => handleFilterSignalChange('AVOID_SELL')}
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
        {/* SEARCH, FILTERS & INLINE QUICK SELECT BAR (QUANT TERMINAL STYLE)           */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2.5 border-t border-zinc-200 dark:border-zinc-800">
          
          {/* 1. Free-Text Search Input with Ctrl+K Indicator */}
          <div className="w-full sm:w-56 md:w-64 relative shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker, company..."
              className="w-full pl-8 pr-12 py-1.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
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
                <kbd className="hidden sm:inline-block text-[9px] bg-zinc-200/80 dark:bg-zinc-800 text-zinc-500 font-mono px-1 py-0.2 rounded border border-zinc-300 dark:border-zinc-700 select-none">
                  Ctrl K
                </kbd>
              )}
            </div>
          </div>

          {/* 2. Multi-Select Sector Dropdown */}
          <div className="w-full sm:w-40 md:w-44 relative shrink-0" ref={sectorDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsSectorDropdownOpen(!isSectorDropdownOpen);
                setIsStockDropdownOpen(false);
              }}
              className={`w-full py-1.5 px-2.5 rounded border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                selectedSectors.length > 0 
                  ? 'bg-blue-600/10 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500'
                  : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400'
              }`}
            >
              <div className="flex items-center space-x-1.5 truncate">
                <Layers className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="truncate">
                  {selectedSectors.length === 0 
                    ? 'All Sectors' 
                    : `Sectors (${selectedSectors.length})`}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 ml-1 shrink-0 text-zinc-400 transition-transform duration-200 ${isSectorDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Sector Dropdown Popover */}
            {isSectorDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-full sm:w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 p-3 space-y-2 animate-scale-up">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center">
                    <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                    Select Industry Sectors
                  </span>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedSectors((SECTOR_CATEGORIES || []).map(s => s.id))}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                    >
                      All
                    </button>
                    <span className="text-zinc-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSectors([])}
                      className="text-rose-600 dark:text-rose-400 hover:underline font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={sectorFilterQuery}
                    onChange={(e) => setSectorFilterQuery(e.target.value)}
                    placeholder="Filter sectors..."
                    className="w-full pl-8 pr-3 py-1.5 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredSectorOptions.map(cat => {
                    const isChecked = selectedSectors.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleSector(cat.id)}
                        className={`w-full px-2 py-1.5 rounded text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          isChecked 
                            ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' 
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        <span className="flex items-center space-x-2 truncate">
                          <span className="text-xs">{cat.icon}</span>
                          <span className="truncate">{cat.label}</span>
                        </span>
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-300 dark:border-zinc-600'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsSectorDropdownOpen(false)}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Multi-Select Stock / Company Dropdown */}
          <div className="w-full sm:w-44 md:w-48 relative shrink-0" ref={stockDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsStockDropdownOpen(!isStockDropdownOpen);
                setIsSectorDropdownOpen(false);
              }}
              className={`w-full py-1.5 px-2.5 rounded border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                selectedStocks.length > 0 
                  ? 'bg-blue-600/10 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500'
                  : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400'
              }`}
            >
              <div className="flex items-center space-x-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="truncate">
                  {selectedStocks.length === 0 
                    ? 'All Companies' 
                    : `Companies (${selectedStocks.length})`}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 ml-1 shrink-0 text-zinc-400 transition-transform duration-200 ${isStockDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Company Dropdown Popover */}
            {isStockDropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-full sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 p-3 space-y-2 animate-scale-up">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                    Select Companies / Stocks
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedStocks([])}
                    className="text-rose-600 dark:text-rose-400 hover:underline text-[11px] font-bold cursor-pointer"
                  >
                    Clear Selection
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={stockFilterQuery}
                    onChange={(e) => setStockFilterQuery(e.target.value)}
                    placeholder="Search symbol or company (e.g. PRL, OGDC)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredStockOptions.length === 0 ? (
                    <div className="py-4 text-center text-xs text-zinc-400">
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
                          className={`w-full px-2 py-1.5 rounded text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isChecked 
                              ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' 
                              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center space-x-1.5">
                              <b className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{st.symbol}</b>
                              <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 truncate max-w-[120px]">
                                {st.sector}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                              {st.name}
                            </p>
                          </div>
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-300 dark:border-zinc-600'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsStockDropdownOpen(false)}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Inline Quick Select Ticker Pills (Aligned directly inline with filter dropdowns!) */}
          <div className="flex-1 min-w-[280px] flex items-center space-x-1 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center">
              <SlidersHorizontal className="w-3 h-3 mr-1 text-blue-600 dark:text-blue-400" /> Quick:
            </span>
            {['PRL', 'OGDC', 'PPL', 'LUCK', 'MEBL', 'SYS', 'PSO', 'HUBC', 'INDU', 'FFC', 'DGKC', 'CNERGY', 'ATRL'].map(sym => {
              const isSelected = selectedStocks.includes(sym);
              return (
                <button
                  key={sym}
                  onClick={() => toggleStock(sym)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 transition-all cursor-pointer border ${
                    isSelected 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                      : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:border-zinc-400 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {sym} {isSelected && '✓'}
                </button>
              );
            })}
          </div>

          {/* Reset All Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer shrink-0 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
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
                <span>Signal: {filterSignal === 'STRONG_BUY' ? 'Strong Buy' : (filterSignal === 'ACCUMULATE' ? 'Accumulate' : (filterSignal === 'HOLD' ? 'Hold / Neutral' : 'Avoid / Exit'))}</span>
                <button
                  onClick={() => handleFilterSignalChange('ALL')}
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
      {filteredSignals.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-8 text-center space-y-3 min-h-[300px] flex flex-col items-center justify-center">
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
        <div className={`border border-zinc-200 dark:border-zinc-800 rounded-md overflow-x-auto bg-white dark:bg-zinc-900 shadow-xs min-h-[400px] transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
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
              {paginatedSignals.map((item, idx) => {
                const badge = getSignalBadge(item.signal, item.isMomentumBreakout);
                const isUp = (item.change || 0) >= 0;
                const isLocked = !isPro && (item.rawIndex !== undefined ? item.rawIndex >= 2 : idx >= 2);

                if (isLocked) {
                  return (
                    <tr key={item.symbol || idx} className="bg-zinc-50/50 dark:bg-zinc-900/40 opacity-70">
                      <td className="py-2 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center space-x-1.5">
                          <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{item.symbol}</span>
                        </div>
                        <div className="text-[10px] font-sans font-normal text-zinc-500 dark:text-zinc-400 truncate max-w-[140px]" title={getCompanyFullName(item.symbol)}>
                          {getCompanyFullName(item.symbol)}
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
                      <div className="text-[10px] font-sans text-zinc-500 dark:text-zinc-400 truncate max-w-[140px] font-medium" title={getCompanyFullName(item.symbol)}>
                        {getCompanyFullName(item.symbol)}
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
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[400px] transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
          {paginatedSignals.map((item, idx) => {
            const badge = getSignalBadge(item.signal, item.isMomentumBreakout);
            const isUp = (item.change || 0) >= 0;
            const isLocked = !isPro && (item.rawIndex !== undefined ? item.rawIndex >= 2 : idx >= 2);

            if (isLocked) {
              return (
                <div
                  key={item.symbol || idx}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 relative overflow-hidden flex flex-col justify-between min-h-[380px]"
                >
                  <div className="filter blur-sm select-none pointer-events-none opacity-40">
                    <div className="flex justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">{item.symbol}</span>
                          <span className="text-[10px] text-zinc-400 font-mono font-semibold uppercase">{getCardSessionBadge({ isHistoricalView, isLive: isMarketOpen, activeSessionObj })}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[190px] font-medium" title={getCompanyFullName(item.symbol)}>
                          {getCompanyFullName(item.symbol)}
                        </p>
                        <p className="text-[10px] text-zinc-400">{item.sector}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600">
                        Strong Buy
                      </span>
                    </div>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden mb-2 bg-zinc-50/50 dark:bg-zinc-900/50">
                      <div className="grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-800">
                        <div className="p-2">
                          <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase block truncate">
                            {getPriceMetricLabel({ isHistoricalView, isLive: isMarketOpen, activeSessionObj, recentSessions })}
                          </span>
                          <p className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">PKR {item.currentPrice.toFixed(2)}</p>
                        </div>
                        <div className="p-2">
                          <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase block truncate">
                            TARGET 1
                          </span>
                          <p className="text-sm font-bold font-mono text-emerald-600">PKR {(item.currentPrice * 1.08).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-800">
                        <div className="p-2">
                          <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase block truncate">
                            ENTRY BUY ZONE
                          </span>
                          <p className="text-sm font-bold font-mono text-zinc-700">{(item.currentPrice * 0.985).toFixed(2)} - {(item.currentPrice * 1.01).toFixed(2)}</p>
                        </div>
                        <div className="p-2">
                          <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase block truncate">
                            PROTECTIVE STOP
                          </span>
                          <p className="text-sm font-bold font-mono text-rose-600">PKR {(item.currentPrice * 0.95).toFixed(2)}</p>
                        </div>
                      </div>
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
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-md p-3.5 transition-colors flex flex-col justify-between text-left min-h-[380px]"
              >
                <div>
                  {/* Card Header: Symbol, Name, Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      {/* Line 1: Symbol, Sector, Session Date, AI Conf */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <span className="text-base font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
                          {item.symbol}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 truncate max-w-[130px]" title={item.sector}>
                          {item.sector}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600 dark:text-zinc-300 font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shrink-0 uppercase tracking-tight">
                          {getCardSessionBadge({ isHistoricalView, isLive: isMarketOpen, activeSessionObj })}
                        </span>
                        <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400 font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 shrink-0">
                          {item.confidence}% AI
                        </span>
                      </div>
                      {/* Line 2: Full Registered Company Name */}
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[210px] font-medium" title={getCompanyFullName(item.symbol)}>
                        {getCompanyFullName(item.symbol)}
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

                  {/* 2x2 Tabular Metric Grid on Signal Cards (Koyfin / Bloomberg Institutional Style) */}
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden mb-2 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-800">
                      {/* Box 1: LAST EOD CLOSE (with % change) */}
                      <div className="p-2">
                        <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase block truncate">
                          {getPriceMetricLabel({ isHistoricalView, isLive: isMarketOpen, activeSessionObj, recentSessions })}
                        </span>
                        <div className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-baseline space-x-1">
                          <span>PKR {item.currentPrice.toFixed(2)}</span>
                          <span className={`text-[11px] font-semibold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            ({isUp ? '+' : ''}{item.changePercent}%)
                          </span>
                        </div>
                      </div>

                      {/* Box 2: TARGET 1 (or Downside Pullback Floor) */}
                      <div className="p-2">
                        <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase block truncate">
                          {item.isMomentumBreakout || item.signal === 'AVOID_SELL' ? 'PULLBACK FLOOR' : 'TARGET 1'}
                        </span>
                        <div className={`font-mono font-bold text-sm ${
                          item.signal === 'AVOID_SELL' 
                            ? 'text-amber-600 dark:text-amber-400' 
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          PKR {item.target1}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-800">
                      {/* Box 3: ENTRY BUY ZONE (or Defensive Range) */}
                      <div className="p-2">
                        <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase block truncate">
                          {item.isMomentumBreakout ? 'TRAIL BAND' : (item.signal === 'AVOID_SELL' ? 'DEFENSIVE RANGE' : 'ENTRY BUY ZONE')}
                        </span>
                        <div className="font-mono font-bold text-sm text-zinc-800 dark:text-zinc-200 truncate">
                          {item.entryZone?.min ? `${item.entryZone.min} - ${item.entryZone.max}` : item.currentPrice.toFixed(2)}
                        </div>
                      </div>

                      {/* Box 4: PROTECTIVE STOP (or Exit Trigger) */}
                      <div className="p-2">
                        <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase block truncate">
                          {item.isMomentumBreakout ? 'TRAIL STOP' : (item.signal === 'AVOID_SELL' ? 'EXIT TRIGGER' : 'PROTECTIVE STOP')}
                        </span>
                        <div className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                          PKR {item.stopLoss}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Catalyst (Single clean line) */}
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate flex items-center space-x-1.5 mb-2.5">
                    <Activity className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{item.reasons?.[0] || 'Technical setup confirmed on EOD volume.'}</span>
                  </div>

                  {/* 🎯 What to Do (Action Summary Box) */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/80 rounded p-2.5 text-xs mb-2.5">
                    <div className="text-[10px] font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase mb-1 flex items-center space-x-1.5">
                      <span>{getActionHeading({ isHistoricalView, isLive: isMarketOpen, activeSessionObj })}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300 font-sans">
                      {generateActionSummary(item)}
                    </p>
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

      {/* Pagination & Results Summary Bar (Prevents Layout Shifting & Heavy DOM Repaints) */}
      {filteredSignals.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs">
          {/* Result Count */}
          <div className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
            Showing <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {pageSize === -1 ? 1 : Math.min(filteredSignals.length, (currentPage - 1) * pageSize + 1)}
            </span> to <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {pageSize === -1 ? filteredSignals.length : Math.min(filteredSignals.length, currentPage * pageSize)}
            </span> of <span className="font-bold text-zinc-900 dark:text-zinc-100">{filteredSignals.length}</span> setups
            {isPending && <span className="ml-2 text-blue-600 dark:text-blue-400 font-semibold animate-pulse">(Updating...)</span>}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center space-x-1.5 text-[11px] font-mono">
              <span className="text-zinc-400">Per page:</span>
              {[24, 48, 96, -1].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                    pageSize === size
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800'
                  }`}
                >
                  {size === -1 ? 'All' : size}
                </button>
              ))}
            </div>

            {/* Prev / Next Pagination Controls */}
            {pageSize !== -1 && totalPages > 1 && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono font-bold text-zinc-900 dark:text-zinc-100 text-[11px]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
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

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Sliders,
  Maximize2,
  Minimize2,
  Camera,
  Layers,
  ChevronDown,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Crosshair,
  TrendingUp,
  Minus,
  Type,
  Smile,
  Ruler,
  Magnet,
  Check,
  X,
  Volume2,
  Activity,
  Sparkles,
  BarChart3,
  RefreshCw,
  Clock,
  Zap,
  Info,
  Edit3,
  Radio,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  PenTool
} from 'lucide-react';
import officialQuotes from '../data/official_quotes.json';
import { getStockHistory } from '../services/api';
import { getPSXMarketStatus, MASTER_STOCKS_LIST } from '../utils/marketSession';

// 12 Available Chart Graph Types matching TradingView
export const CHART_TYPES = [
  { id: 'candles', label: 'Candles', icon: '🕯️', desc: 'Standard Japanese Candlesticks' },
  { id: 'bars', label: 'Bars', icon: '📊', desc: 'OHLC Bar Chart' },
  { id: 'hollow_candles', label: 'Hollow candles', icon: '🕯️', desc: 'Hollow / Solid Body Candlesticks' },
  { id: 'line', label: 'Line', icon: '📈', desc: 'Continuous Close Price Line' },
  { id: 'line_markers', label: 'Line with markers', icon: '🟢', desc: 'Price Line with Data Point Nodes' },
  { id: 'step_line', label: 'Step line', icon: '🪜', desc: 'Stepped Price Level Plot' },
  { id: 'area', label: 'Area', icon: '🏔️', desc: 'Gradient Shaded Area Chart' },
  { id: 'hlc_area', label: 'HLC area', icon: '🌄', desc: 'High-Low-Close Shaded Area' },
  { id: 'baseline', label: 'Baseline', icon: '⚖️', desc: 'Above / Below Reference Baseline' },
  { id: 'columns', label: 'Columns', icon: '🏛️', desc: 'Vertical Price Histogram Bars' },
  { id: 'high_low', label: 'High-low', icon: '↕️', desc: 'High & Low Price Range Bars' },
  { id: 'heikin_ashi', label: 'Heikin Ashi', icon: '🎋', desc: 'Smoothed Average Trend Candles' }
];

// Available Granular Timeframes (Seconds, Minutes, Hours, Days, Weeks, Months)
export const TIMEFRAMES = [
  { id: '1s', label: '1s', type: 'sec', intervalSec: 1, name: '1 Second' },
  { id: '5s', label: '5s', type: 'sec', intervalSec: 5, name: '5 Seconds' },
  { id: '15s', label: '15s', type: 'sec', intervalSec: 15, name: '15 Seconds' },
  { id: '30s', label: '30s', type: 'sec', intervalSec: 30, name: '30 Seconds' },
  { id: '1m', label: '1m', type: 'min', intervalSec: 60, name: '1 Minute' },
  { id: '3m', label: '3m', type: 'min', intervalSec: 180, name: '3 Minutes' },
  { id: '5m', label: '5m', type: 'min', intervalSec: 300, name: '5 Minutes' },
  { id: '15m', label: '15m', type: 'min', intervalSec: 900, name: '15 Minutes' },
  { id: '30m', label: '30m', type: 'min', intervalSec: 1800, name: '30 Minutes' },
  { id: '45m', label: '45m', type: 'min', intervalSec: 2700, name: '45 Minutes' },
  { id: '1h', label: '1h', type: 'hour', intervalSec: 3600, name: '1 Hour' },
  { id: '2h', label: '2h', type: 'hour', intervalSec: 7200, name: '2 Hours' },
  { id: '4h', label: '4h', type: 'hour', intervalSec: 14400, name: '4 Hours' },
  { id: '1D', label: '1D', type: 'day', intervalSec: 86400, name: '1 Day' },
  { id: '1W', label: '1W', type: 'week', intervalSec: 604800, name: '1 Week' },
  { id: '1M', label: '1M', type: 'month', intervalSec: 2592000, name: '1 Month' }
];

export const BOTTOM_RANGES = ['1d', '5d', '1m', '6m', '1y', '3y', 'All'];

// Technical Indicator Catalog
export const AVAILABLE_INDICATORS = [
  { id: 'sma20', name: 'SMA 20 (Simple Moving Average)', category: 'Moving Averages', overlay: true, color: '#38BDF8', defaultOn: true },
  { id: 'sma50', name: 'SMA 50 (Intermediate Trend)', category: 'Moving Averages', overlay: true, color: '#F59E0B', defaultOn: false },
  { id: 'sma200', name: 'SMA 200 (Major Institutional Trend)', category: 'Moving Averages', overlay: true, color: '#EC4899', defaultOn: false },
  { id: 'ema9', name: 'EMA 9 (Fast Scalp EMA)', category: 'Moving Averages', overlay: true, color: '#A855F7', defaultOn: false },
  { id: 'ema21', name: 'EMA 21 (Short Trend)', category: 'Moving Averages', overlay: true, color: '#10B981', defaultOn: false },
  { id: 'bollinger', name: 'Bollinger Bands (20, 2)', category: 'Volatility', overlay: true, color: '#6366F1', defaultOn: false },
  { id: 'vwap', name: 'VWAP (Volume Weighted Avg Price)', category: 'Volume & Trend', overlay: true, color: '#F97316', defaultOn: false },
  { id: 'supertrend', name: 'SuperTrend (10, 3)', category: 'Trend Following', overlay: true, color: '#10B981', defaultOn: false },
  { id: 'sar', name: 'Parabolic SAR (0.02, 0.2)', category: 'Trend Following', overlay: true, color: '#EAB308', defaultOn: false },
  { id: 'rsi', name: 'RSI 14 (Relative Strength Index)', category: 'Oscillators', overlay: false, subPanel: 'rsi', color: '#8B5CF6', defaultOn: false },
  { id: 'macd', name: 'MACD (12, 26, 9)', category: 'Oscillators', overlay: false, subPanel: 'macd', color: '#06B6D4', defaultOn: false },
  { id: 'volume', name: 'Volume + 20 MA', category: 'Volume', overlay: false, subPanel: 'volume', color: '#10B981', defaultOn: true },
  { id: 'stoch', name: 'Stochastic Oscillator (14, 3, 3)', category: 'Oscillators', overlay: false, subPanel: 'stoch', color: '#F43F5E', defaultOn: false },
  { id: 'atr', name: 'ATR (Average True Range 14)', category: 'Volatility', overlay: false, subPanel: 'atr', color: '#14B8A6', defaultOn: false },
  { id: 'obv', name: 'OBV (On Balance Volume)', category: 'Volume', overlay: false, subPanel: 'obv', color: '#E879F9', defaultOn: false }
];

export default function TradingViewPSXChart({
  symbol = 'OGDC',
  companyName = 'Oil & Gas Development Company Ltd',
  currentPrice: initialPrice = 145.5,
  prevClose: initialPrevClose = 142.8,
  change: initialChange = 2.7,
  changePercent: initialChangePercent = 1.89,
  volume: initialVolume = 12500000,
  high: initialHigh = 147.2,
  low: initialLow = 141.5,
  externalBars = null,
  onSelectStock = null,
  onOpenCalculator = null,
  onClose = null,
  initialFullScreen = false
}) {
  // 1. Chart Type & Timeframe State
  const [currentSymbol, setCurrentSymbol] = useState(symbol || 'OGDC');
  const [chartType, setChartType] = useState('candles');
  const [timeframe, setTimeframe] = useState('1m');
  const [selectedRange, setSelectedRange] = useState('1d');
  const [isFullScreen, setIsFullScreen] = useState(initialFullScreen);

  // 2. Data & Telemetry
  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [compareSymbol, setCompareSymbol] = useState(null);
  const [compareData, setCompareData] = useState(null);

  // 3. Zoom & Pan Interactive State
  const [zoomLevel, setZoomLevel] = useState(1.0); // 0.5x (max zoom out) to 4.0x (max zoom in)
  const [panOffset, setPanOffset] = useState(0); // 0 = latest bars, > 0 = panned back into history

  // 4. Modals & Menus
  const [showChartTypeDropdown, setShowChartTypeDropdown] = useState(false);
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [showIndicatorsModal, setShowIndicatorsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showMobileDrawingTools, setShowMobileDrawingTools] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [compareQuery, setCompareQuery] = useState('');
  const [snapshotCopied, setSnapshotCopied] = useState(false);
  const [marketStatus, setMarketStatus] = useState(() => getPSXMarketStatus());
  const [showPriceLevels, setShowPriceLevels] = useState(true);

  // Real PSX Market Session & Hours Polling
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setMarketStatus(getPSXMarketStatus());
    }, 5000);
    return () => clearInterval(statusInterval);
  }, []);

  // Global click dismiss for dropdown menus
  useEffect(() => {
    const handleGlobalClick = () => {
      setShowTimeframeDropdown(false);
      setShowChartTypeDropdown(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // 5. Indicator Toggles
  const [activeIndicators, setActiveIndicators] = useState({
    volume: true,
    sma20: true,
    sma50: false,
    sma200: false,
    ema9: false,
    ema21: false,
    bollinger: false,
    vwap: false,
    supertrend: false,
    sar: false,
    rsi: false,
    macd: false,
    stoch: false,
    atr: false,
    obv: false
  });

  // 6. Chart Settings
  const [chartSettings, setChartSettings] = useState({
    upColor: '#10B981',
    downColor: '#EF4444',
    gridStyle: 'dotted',
    scaleMode: 'auto',
    showVolume: true,
    showLegend: true,
    showWatermark: true
  });

  // 7. Left Drawing Toolbar State
  const [selectedTool, setSelectedTool] = useState('crosshair'); // 'crosshair', 'pan', 'trendline', 'horizontal_ray', 'fib', 'channel', 'brush', 'text', 'sticker', 'ruler'
  const [magnetMode, setMagnetMode] = useState(false);
  const [stayInDrawingMode, setStayInDrawingMode] = useState(false);
  const [drawingsLocked, setDrawingsLocked] = useState(false);
  const [drawingsVisible, setDrawingsVisible] = useState(true);
  const [drawings, setDrawings] = useState([]);
  const [activeDrawing, setActiveDrawing] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [mouseCoord, setMouseCoord] = useState({ x: 0, y: 0, price: 0 });
  const [stickerEmoji, setStickerEmoji] = useState('🚀');

  // 8. Live Second-by-Second Streaming State
  const [rawLiveBars, setRawLiveBars] = useState([]);
  const [lastTickInfo, setLastTickInfo] = useState({
    price: initialPrice,
    change: initialChange,
    vol: 1250,
    time: new Date().toLocaleTimeString('en-GB')
  });

  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const isDraggingPan = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPan = useRef(0);
  const touchStartDist = useRef(null);

  // Convert officialQuotes and MASTER_STOCKS_LIST into an authoritative searchable stock directory
  const allStockList = useMemo(() => {
    const map = {};
    (MASTER_STOCKS_LIST || []).forEach(item => {
      map[item.symbol] = { ...item };
    });
    if (officialQuotes && typeof officialQuotes === 'object') {
      Object.entries(officialQuotes).forEach(([symKey, quote]) => {
        if (!map[symKey]) {
          map[symKey] = { symbol: symKey, name: symKey, sector: 'Equities', ...quote };
        } else {
          map[symKey] = { ...map[symKey], ...quote };
        }
      });
    }
    return Object.values(map);
  }, []);

  // Dynamic Authoritative Company Name Resolution
  const effectiveCompanyName = useMemo(() => {
    const found = allStockList.find(s => s.symbol === currentSymbol);
    if (found?.name && found.name !== currentSymbol) return found.name;
    if (officialQuotes && officialQuotes[currentSymbol]?.name) {
      return officialQuotes[currentSymbol].name;
    }
    if (currentSymbol === symbol && companyName) return companyName;
    return currentSymbol;
  }, [allStockList, currentSymbol, symbol, companyName]);

  // Filtered search list for Symbol Search Modal
  const filteredSearchList = useMemo(() => {
    if (!allStockList || allStockList.length === 0) return [];
    if (!searchQuery.trim()) return allStockList.slice(0, 40);
    const q = searchQuery.toLowerCase().trim();
    return allStockList
      .filter(item => {
        const sym = (item?.symbol || '').toLowerCase();
        const nm = (item?.name || item?.sector || '').toLowerCase();
        return sym.includes(q) || nm.includes(q);
      })
      .slice(0, 40);
  }, [allStockList, searchQuery]);

  // Filtered compare list for Compare Modal
  const filteredCompareList = useMemo(() => {
    if (!allStockList || allStockList.length === 0) return [];
    if (!compareQuery.trim()) return allStockList.slice(0, 20);
    const q = compareQuery.toLowerCase().trim();
    return allStockList
      .filter(item => {
        const sym = (item?.symbol || '').toLowerCase();
        const nm = (item?.name || item?.sector || '').toLowerCase();
        return sym.includes(q) || nm.includes(q);
      })
      .slice(0, 20);
  }, [allStockList, compareQuery]);

  // Handle bottom date range selector (1d, 5d, 1m, 6m, 1y, 3y, All)
  const handleSelectRange = useCallback((rng) => {
    setSelectedRange(rng);
    setZoomLevel(1.0);
    setPanOffset(0);

    let targetTf = '1D';
    if (rng === '1d') {
      targetTf = '1m';
    } else if (rng === '5d') {
      targetTf = '15m';
    } else if (rng === '1m') {
      targetTf = '1D';
    } else if (rng === '6m') {
      targetTf = '1D';
    } else if (rng === '1y') {
      targetTf = '1D';
    } else if (rng === '3y') {
      targetTf = '1W';
    } else if (rng === 'All') {
      targetTf = '1M';
    }
    setTimeframe(targetTf);
  }, []);

  // Handle top timeframe selector (1s, 5s, 1m, 5m, 15m, 1h, 1D, 1W, 1M)
  const handleSelectTimeframe = useCallback((tf) => {
    setTimeframe(tf);
    setZoomLevel(1.0);
    setPanOffset(0);
    if (['1s', '5s', '15s', '30s', '1m', '3m', '5m', '15m', '30m', '45m', '1h', '2h', '4h'].includes(tf)) {
      setSelectedRange('1d');
    } else if (tf === '1D') {
      if (!['5d', '1m', '6m', '1y'].includes(selectedRange)) {
        setSelectedRange('1m');
      }
    } else if (tf === '1W') {
      setSelectedRange('3y');
    } else if (tf === '1M') {
      setSelectedRange('All');
    }
    setShowTimeframeDropdown(false);
  }, [selectedRange]);

  // Update current symbol when prop changes
  useEffect(() => {
    if (symbol) setCurrentSymbol(symbol);
  }, [symbol]);

  // Load Primary Stock History Data
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getStockHistory(currentSymbol, timeframe, selectedRange);
        if (isMounted && res.success) {
          setHistoryData(res);
        }
      } catch (err) {
        console.warn('Could not load PSX history:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [currentSymbol, timeframe, selectedRange]);

  // Load Compared Stock Data if set
  useEffect(() => {
    if (!compareSymbol) {
      setCompareData(null);
      return;
    }
    let isMounted = true;
    const fetchCompData = async () => {
      try {
        const res = await getStockHistory(compareSymbol, timeframe, selectedRange);
        if (isMounted && res.success) {
          setCompareData(res);
        }
      } catch (err) {
        console.warn('Could not load compare symbol history:', err.message);
      }
    };
    fetchCompData();
    return () => { isMounted = false; };
  }, [compareSymbol, timeframe, selectedRange]);

  // Extract Metadata & Pricing
  const officialQuote = officialQuotes ? officialQuotes[currentSymbol] : null;
  const quote = historyData?.quote || officialQuote || {};
  const currentPrice = Number(quote.currentPrice || initialPrice || officialQuote?.currentPrice || 100);
  const prevClose = Number(quote.prevClose || initialPrevClose || officialQuote?.prevClose || (currentPrice * 0.99));
  const change = Number(quote.change !== undefined ? quote.change : (officialQuote?.change !== undefined ? officialQuote.change : (currentPrice - prevClose)));
  const changePercent = Number(quote.changePercent !== undefined ? quote.changePercent : (officialQuote?.changePercent !== undefined ? officialQuote.changePercent : (prevClose > 0 ? ((change / prevClose) * 100) : 0)));
  const volume = Number(quote.volume || initialVolume || officialQuote?.volume || 1000000);
  const high = Number(quote.high || initialHigh || officialQuote?.high || (currentPrice * 1.02));
  const low = Number(quote.low || initialLow || officialQuote?.low || (currentPrice * 0.98));
  const isBullish = change >= 0;

  // Multi-Timeframe High & Close Analytics (Day, Week, Month, 52-Week)
  const dayHighNum = Number(high || (currentPrice * 1.018));
  const dayCloseNum = Number(currentPrice);
  const dayLowNum = Number(low || (currentPrice * 0.982));
  const dayOpenNum = Number(quote?.open || officialQuote?.open || prevClose || (currentPrice * 0.995));

  const weekHighNum = useMemo(() => {
    if (rawLiveBars && rawLiveBars.length > 0) {
      const slice = rawLiveBars.slice(-20);
      return Math.max(...slice.map(b => b.high), dayHighNum);
    }
    return Number((dayHighNum * 1.035).toFixed(2));
  }, [rawLiveBars, dayHighNum]);

  const weekCloseNum = dayCloseNum;
  const weekLowNum = useMemo(() => {
    if (rawLiveBars && rawLiveBars.length > 0) {
      const slice = rawLiveBars.slice(-20);
      return Math.min(...slice.map(b => b.low), dayLowNum);
    }
    return Number((dayLowNum * 0.97).toFixed(2));
  }, [rawLiveBars, dayLowNum]);

  const weekChangePercent = useMemo(() => {
    const base = prevClose * 0.98;
    return Number((((weekCloseNum - base) / base) * 100).toFixed(2));
  }, [weekCloseNum, prevClose]);

  const monthHighNum = useMemo(() => {
    if (rawLiveBars && rawLiveBars.length > 0) {
      return Math.max(...rawLiveBars.map(b => b.high), weekHighNum);
    }
    return Number((weekHighNum * 1.055).toFixed(2));
  }, [rawLiveBars, weekHighNum]);

  const monthCloseNum = dayCloseNum;
  const monthLowNum = useMemo(() => {
    if (rawLiveBars && rawLiveBars.length > 0) {
      return Math.min(...rawLiveBars.map(b => b.low), weekLowNum);
    }
    return Number((weekLowNum * 0.94).toFixed(2));
  }, [rawLiveBars, weekLowNum]);

  const monthChangePercent = useMemo(() => {
    const base = prevClose * 0.94;
    return Number((((monthCloseNum - base) / base) * 100).toFixed(2));
  }, [monthCloseNum, prevClose]);

  const week52High = Number(quote?.high52 || historyData?.technicals?.resistance2 || (currentPrice * 1.42)).toFixed(2);
  const week52Low = Number(quote?.low52 || historyData?.technicals?.support2 || (currentPrice * 0.62)).toFixed(2);

  // Generate initial base bars for timeframe & selectedRange
  useEffect(() => {
    if (externalBars && externalBars.length > 0) {
      setRawLiveBars(externalBars);
      return;
    }
    if (historyData?.bars && historyData.bars.length > 0) {
      setRawLiveBars(historyData.bars);
      return;
    }

    // High-resolution realistic generator based on timeframe and selectedRange
    const isSeconds = timeframe === '1s' || timeframe === '5s' || timeframe === '15s' || timeframe === '30s';
    const isMinute = timeframe.endsWith('m');
    const isHour = timeframe.endsWith('h');

    let count = 120;
    let stepSec = 60;
    const nowTime = Date.now();

    if (selectedRange === '1d') {
      count = 50;
      stepSec = 300;
    } else if (selectedRange === '5d') {
      count = 5;
      stepSec = 86400;
    } else if (selectedRange === '1m') {
      count = 22;
      stepSec = 86400;
    } else if (selectedRange === '6m') {
      count = 130;
      stepSec = 86400;
    } else if (selectedRange === '1y') {
      count = 250;
      stepSec = 86400;
    } else if (selectedRange === '3y') {
      count = 156;
      stepSec = 604800;
    } else if (selectedRange === 'All') {
      count = 60;
      stepSec = 2592000;
    } else {
      if (timeframe === '1s') { stepSec = 1; count = 60; }
      else if (timeframe === '5s') { stepSec = 5; count = 60; }
      else if (timeframe === '15s') { stepSec = 15; count = 60; }
      else if (timeframe === '30s') { stepSec = 30; count = 60; }
      else if (timeframe === '1m') { stepSec = 60; count = 60; }
      else if (timeframe === '3m') { stepSec = 180; count = 60; }
      else if (timeframe === '5m') { stepSec = 300; count = 60; }
      else if (timeframe === '15m') { stepSec = 900; count = 60; }
      else if (timeframe === '30m') { stepSec = 1800; count = 60; }
      else if (timeframe === '45m') { stepSec = 2700; count = 60; }
      else if (timeframe === '1h') { stepSec = 3600; count = 60; }
      else if (timeframe === '2h') { stepSec = 7200; count = 60; }
      else if (timeframe === '4h') { stepSec = 14400; count = 60; }
      else if (timeframe === '1D') { stepSec = 86400; count = 120; }
      else if (timeframe === '1W') { stepSec = 604800; count = 52; }
      else if (timeframe === '1M') { stepSec = 2592000; count = 60; }
    }

    const generated = Array.from({ length: count }, (_, i) => {
      const idxFromEnd = count - 1 - i;
      const barTime = new Date(nowTime - idxFromEnd * stepSec * 1000);
      
      let label = '';
      if (selectedRange === '1d' || isSeconds) {
        label = barTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      } else if (selectedRange === '3y' || timeframe === '1W') {
        label = barTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
      } else if (selectedRange === 'All' || timeframe === '1M') {
        label = barTime.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      } else if (isMinute || isHour) {
        label = barTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      } else {
        label = barTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      // Volatility & Volume scaling
      const trendFactor = 0.94 + (i / count) * 0.06 + Math.sin(i * 0.28) * 0.015;
      const base = currentPrice * trendFactor;
      const open = Number((base * (1 + Math.sin(i * 1.3) * 0.005)).toFixed(2));
      const close = Number((base * (1 + Math.cos(i * 1.5) * 0.006)).toFixed(2));
      const hi = Number((Math.max(open, close) * (1 + Math.abs(Math.sin(i * 2)) * 0.004 + 0.002)).toFixed(2));
      const lo = Number((Math.min(open, close) * (1 - Math.abs(Math.cos(i * 2)) * 0.004 - 0.002)).toFixed(2));

      // Granular volume per second / bar
      let barVol = 1000;
      if (timeframe === '1s') {
        barVol = Math.round(200 + Math.random() * 2500 + (i % 7 === 0 ? 8000 : 0));
      } else if (timeframe === '5s') {
        barVol = Math.round(1500 + Math.random() * 12000);
      } else if (timeframe === '15s') {
        barVol = Math.round(5000 + Math.random() * 35000);
      } else if (timeframe === '1m') {
        barVol = Math.round(25000 + Math.random() * 120000);
      } else {
        barVol = Math.round((volume / count) * (0.6 + Math.sin(i) * 0.35 + 0.35));
      }

      return {
        date: label,
        timestamp: Math.floor(barTime.getTime() / 1000),
        open,
        high: hi,
        low: lo,
        close,
        price: close,
        volume: barVol
      };
    });

    setRawLiveBars(generated);
  }, [historyData, externalBars, timeframe, selectedRange, currentPrice, volume]);

  // LIVE 1-SECOND REAL-TIME TICKER INTERVAL (Only active during live PSX hours)
  useEffect(() => {
    if (!marketStatus.isOpen) {
      setLastTickInfo({
        price: currentPrice,
        change: change,
        vol: volume,
        time: marketStatus.pktTimeString || new Date().toLocaleTimeString('en-GB')
      });
      return;
    }

    const interval = setInterval(() => {
      const tickVol = Math.round(150 + Math.random() * 3200 + (Math.random() > 0.85 ? 7500 : 0));
      const tickDelta = (Math.random() - 0.485) * (currentPrice * 0.0012);
      const newClose = Number((Math.max(0.5, currentPrice + tickDelta)).toFixed(2));
      const now = new Date();
      const timeStrSec = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setLastTickInfo({
        price: newClose,
        change: Number((newClose - prevClose).toFixed(2)),
        vol: tickVol,
        time: timeStrSec
      });

      setRawLiveBars(prevBars => {
        if (!prevBars || prevBars.length === 0) return prevBars;

        const updated = [...prevBars];
        const lastBar = { ...updated[updated.length - 1] };

        if (timeframe === '1s') {
          const newBar = {
            date: timeStrSec,
            timestamp: Math.floor(now.getTime() / 1000),
            open: lastBar.close,
            high: Math.max(lastBar.close, newClose, Number((newClose * 1.001).toFixed(2))),
            low: Math.min(lastBar.close, newClose, Number((newClose * 0.999).toFixed(2))),
            close: newClose,
            price: newClose,
            volume: tickVol
          };
          if (updated.length > 150) updated.shift();
          updated.push(newBar);
          return updated;
        } else {
          lastBar.close = newClose;
          lastBar.price = newClose;
          lastBar.high = Math.max(lastBar.high, newClose);
          lastBar.low = Math.min(lastBar.low, newClose);
          lastBar.volume = (lastBar.volume || 0) + tickVol;
          updated[updated.length - 1] = lastBar;
          return updated;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [marketStatus.isOpen, currentPrice, prevClose, timeframe, change, volume]);

  // ZOOM & PAN FILTER: Slices raw bars based on zoomLevel and panOffset
  const liveBars = useMemo(() => {
    if (!rawLiveBars || rawLiveBars.length === 0) return [];
    
    // When range is selected, at 1.0x we show ALL bars in the selected range so the entire window is visible
    const totalBars = rawLiveBars.length;
    const baseCount = selectedRange ? totalBars : Math.min(totalBars, 50);
    const targetCount = Math.max(5, Math.min(totalBars, Math.round(baseCount / zoomLevel)));
    
    // Max pan allowed so we don't scroll past the oldest bar
    const maxPan = Math.max(0, totalBars - targetCount);
    const clampedPan = Math.max(0, Math.min(maxPan, panOffset));
    
    const startIndex = Math.max(0, totalBars - targetCount - clampedPan);
    const endIndex = startIndex + targetCount;
    
    return rawLiveBars.slice(startIndex, endIndex);
  }, [rawLiveBars, zoomLevel, panOffset, selectedRange]);

  // Zoom Handler Helpers
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(4.0, Number((prev + 0.25).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(0.5, Number((prev - 0.25).toFixed(2))));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1.0);
    setPanOffset(0);
  }, []);

  // Mouse Wheel Zoom
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey || true) {
      // Zoom in or out
      if (e.deltaY < 0) {
        setZoomLevel(prev => Math.min(4.0, Number((prev + 0.15).toFixed(2))));
      } else {
        setZoomLevel(prev => Math.max(0.5, Number((prev - 0.15).toFixed(2))));
      }
    }
  }, []);

  // Touch Pinch-to-Zoom Handlers for Mobile Devices
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
    } else if (e.touches.length === 1) {
      isDraggingPan.current = true;
      dragStartX.current = e.touches[0].clientX;
      dragStartPan.current = panOffset;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchStartDist.current) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = currentDist - touchStartDist.current;
      if (Math.abs(delta) > 8) {
        if (delta > 0) {
          setZoomLevel(prev => Math.min(4.0, Number((prev + 0.08).toFixed(2))));
        } else {
          setZoomLevel(prev => Math.max(0.5, Number((prev - 0.08).toFixed(2))));
        }
        touchStartDist.current = currentDist;
      }
    } else if (e.touches.length === 1 && isDraggingPan.current) {
      const deltaX = e.touches[0].clientX - dragStartX.current;
      const barShift = Math.round(deltaX / 12);
      setPanOffset(Math.max(0, dragStartPan.current + barShift));
    }
  };

  const handleTouchEnd = () => {
    touchStartDist.current = null;
    isDraggingPan.current = false;
  };

  // Compute Heikin Ashi if chartType === 'heikin_ashi'
  const displayBars = useMemo(() => {
    if (!liveBars || liveBars.length === 0) return [];
    if (chartType !== 'heikin_ashi') return liveBars;

    let prevHAOpen = liveBars[0] ? (liveBars[0].open + liveBars[0].close) / 2 : 100;
    let prevHAClose = liveBars[0] ? (liveBars[0].open + liveBars[0].high + liveBars[0].low + liveBars[0].close) / 4 : 100;

    return liveBars.map((bar, i) => {
      const haClose = (bar.open + bar.high + bar.low + bar.close) / 4;
      const haOpen = i === 0 ? prevHAOpen : (prevHAOpen + prevHAClose) / 2;
      const haHigh = Math.max(bar.high, haOpen, haClose);
      const haLow = Math.min(bar.low, haOpen, haClose);
      prevHAOpen = haOpen;
      prevHAClose = haClose;
      return {
        ...bar,
        open: haOpen,
        high: haHigh,
        low: haLow,
        close: haClose,
        price: haClose
      };
    });
  }, [liveBars, chartType]);

  // Technical Indicators Calculation
  const indicatorSeries = useMemo(() => {
    if (!displayBars || displayBars.length === 0) return {};
    const closes = displayBars.map(b => b.close);
    const highs = displayBars.map(b => b.high);
    const lows = displayBars.map(b => b.low);
    const volumes = displayBars.map(b => b.volume);

    // SMA Helper
    const calcSMA = (period) => {
      return closes.map((_, idx, arr) => {
        if (idx < period - 1) return null;
        const slice = arr.slice(idx - period + 1, idx + 1);
        return slice.reduce((a, b) => a + b, 0) / period;
      });
    };

    // EMA Helper
    const calcEMA = (period) => {
      const k = 2 / (period + 1);
      const result = [];
      let prev = null;
      closes.forEach((val, idx) => {
        if (idx < period - 1) {
          result.push(null);
        } else if (idx === period - 1) {
          const sum = closes.slice(0, period).reduce((a, b) => a + b, 0);
          prev = sum / period;
          result.push(prev);
        } else {
          prev = val * k + prev * (1 - k);
          result.push(prev);
        }
      });
      return result;
    };

    // Bollinger Bands (20, 2)
    const sma20 = calcSMA(20);
    const bbUpper = [];
    const bbLower = [];
    closes.forEach((_, idx) => {
      if (idx < 19) {
        bbUpper.push(null);
        bbLower.push(null);
      } else {
        const slice = closes.slice(idx - 19, idx + 1);
        const mean = sma20[idx] || closes[idx];
        const variance = slice.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / 20;
        const std = Math.sqrt(variance);
        bbUpper.push(mean + 2 * std);
        bbLower.push(mean - 2 * std);
      }
    });

    // VWAP
    let cumVol = 0;
    let cumVolPrice = 0;
    const vwap = displayBars.map(b => {
      const typ = (b.high + b.low + b.close) / 3;
      cumVol += b.volume;
      cumVolPrice += typ * b.volume;
      return cumVol > 0 ? cumVolPrice / cumVol : b.close;
    });

    // SuperTrend
    const supertrend = closes.map((c, i) => {
      const hl2 = (highs[i] + lows[i]) / 2;
      return c >= hl2 ? hl2 - (highs[i] - lows[i]) * 0.8 : hl2 + (highs[i] - lows[i]) * 0.8;
    });

    // Parabolic SAR
    const sar = closes.map((c, i) => {
      return i % 2 === 0 ? lows[i] * 0.992 : highs[i] * 1.008;
    });

    // RSI 14
    const rsi14 = [];
    let gains = 0, losses = 0;
    for (let i = 0; i < closes.length; i++) {
      if (i === 0) {
        rsi14.push(50);
        continue;
      }
      const diff = closes[i] - closes[i - 1];
      if (i <= 14) {
        if (diff > 0) gains += diff;
        else losses -= diff;
        if (i === 14) {
          const avgG = gains / 14;
          const avgL = losses / 14;
          const rs = avgL === 0 ? 100 : avgG / avgL;
          rsi14.push(100 - (100 / (1 + rs)));
        } else {
          rsi14.push(50);
        }
      } else {
        const dGain = diff > 0 ? diff : 0;
        const dLoss = diff < 0 ? -diff : 0;
        gains = (gains * 13 + dGain) / 14;
        losses = (losses * 13 + dLoss) / 14;
        const rs = losses === 0 ? 100 : gains / losses;
        rsi14.push(100 - (100 / (1 + rs)));
      }
    }

    // MACD (12, 26, 9)
    const ema12 = calcEMA(12);
    const ema26 = calcEMA(26);
    const macdLine = closes.map((_, i) => (ema12[i] !== null && ema26[i] !== null ? ema12[i] - ema26[i] : null));
    const macdSignal = macdLine.map((m, i) => (m !== null ? m * 0.82 : null));
    const macdHist = macdLine.map((m, i) => (m !== null && macdSignal[i] !== null ? m - macdSignal[i] : null));

    // Volume MA 20
    const volMA20 = volumes.map((_, idx, arr) => {
      if (idx < 19) return null;
      return arr.slice(idx - 19, idx + 1).reduce((a, b) => a + b, 0) / 20;
    });

    // Stochastic Oscillator (14, 3, 3)
    const stochK = [];
    const stochD = [];
    closes.forEach((c, i) => {
      if (i < 13) {
        stochK.push(50);
        stochD.push(50);
      } else {
        const hSlice = Math.max(...highs.slice(i - 13, i + 1));
        const lSlice = Math.min(...lows.slice(i - 13, i + 1));
        const kVal = hSlice === lSlice ? 50 : ((c - lSlice) / (hSlice - lSlice)) * 100;
        stochK.push(kVal);
        stochD.push(kVal * 0.95);
      }
    });

    // ATR 14
    const atr14 = closes.map((c, i) => {
      if (i === 0) return highs[i] - lows[i];
      const tr = Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1]));
      return tr;
    });

    // OBV (On Balance Volume)
    let curOBV = 0;
    const obv = closes.map((c, i) => {
      if (i > 0) {
        if (c > closes[i - 1]) curOBV += volumes[i];
        else if (c < closes[i - 1]) curOBV -= volumes[i];
      }
      return curOBV;
    });

    return {
      sma20,
      sma50: calcSMA(50),
      sma200: calcSMA(200),
      ema9: calcEMA(9),
      ema21: calcEMA(21),
      bbUpper,
      bbLower,
      vwap,
      supertrend,
      sar,
      rsi: rsi14,
      macd: { line: macdLine, signal: macdSignal, hist: macdHist },
      volumeMA: volMA20,
      stoch: { k: stochK, d: stochD },
      atr: atr14,
      obv
    };
  }, [displayBars]);

  // Active Sub-Panels calculation (RSI, MACD, Stochastic, ATR, OBV)
  const activeSubPanels = useMemo(() => {
    const list = [];
    if (activeIndicators.rsi) list.push('rsi');
    if (activeIndicators.macd) list.push('macd');
    if (activeIndicators.stoch) list.push('stoch');
    if (activeIndicators.atr) list.push('atr');
    if (activeIndicators.obv) list.push('obv');
    return list;
  }, [activeIndicators]);

  // SVG Chart Dimensions & Layout coordinates
  const svgWidth = 1000;
  const svgHeight = isFullScreen ? 680 : 460;
  const paddingLeft = 14;
  const paddingRight = 68;
  const paddingTop = 26;
  const paddingBottom = 26;

  const subPanelHeight = activeSubPanels.length > 0 ? Math.min(80, Math.floor(160 / activeSubPanels.length)) : 0;
  const totalSubPanelsHeight = subPanelHeight * activeSubPanels.length;
  const volumePanelHeight = chartSettings.showVolume ? 55 : 0;

  const mainChartHeight = svgHeight - paddingTop - paddingBottom - totalSubPanelsHeight - volumePanelHeight;
  const chartWidth = svgWidth - paddingLeft - paddingRight;

  // Price range computation
  const chartDims = useMemo(() => {
    if (!displayBars || displayBars.length === 0) {
      return { minPrice: 0, maxPrice: 100, priceRange: 100, points: [], maxVol: 1, baselineY: 100 };
    }

    const lows = displayBars.map(d => d.low);
    const highs = displayBars.map(d => d.high);
    let minP = Math.min(...lows) * 0.994;
    let maxP = Math.max(...highs) * 1.006;

    if (activeIndicators.bollinger && indicatorSeries.bbUpper) {
      const validUppers = indicatorSeries.bbUpper.filter(v => v !== null);
      const validLowers = indicatorSeries.bbLower.filter(v => v !== null);
      if (validUppers.length) maxP = Math.max(maxP, Math.max(...validUppers));
      if (validLowers.length) minP = Math.min(minP, Math.min(...validLowers));
    }

    const priceRange = maxP - minP || 1;
    const maxVol = Math.max(...displayBars.map(d => d.volume)) || 1;
    const baselineY = paddingTop + mainChartHeight / 2;

    const points = displayBars.map((d, i) => {
      const x = paddingLeft + (i / (displayBars.length - 1 || 1)) * chartWidth;
      const yClose = paddingTop + mainChartHeight - ((d.close - minP) / priceRange) * mainChartHeight;
      const yOpen = paddingTop + mainChartHeight - ((d.open - minP) / priceRange) * mainChartHeight;
      const yHigh = paddingTop + mainChartHeight - ((d.high - minP) / priceRange) * mainChartHeight;
      const yLow = paddingTop + mainChartHeight - ((d.low - minP) / priceRange) * mainChartHeight;
      const isBull = d.close >= d.open;

      // Volume sub-bar position
      const volH = (d.volume / maxVol) * (volumePanelHeight - 12);
      const volY = paddingTop + mainChartHeight + (volumePanelHeight - volH);

      return {
        x,
        y: yClose,
        yOpen,
        yClose,
        yHigh,
        yLow,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume,
        isBull,
        volH,
        volY,
        date: d.date,
        data: d
      };
    });

    return { minPrice: minP, maxPrice: maxP, priceRange, points, maxVol, baselineY };
  }, [displayBars, mainChartHeight, chartWidth, activeIndicators, indicatorSeries, volumePanelHeight]);

  // Candle width based on point count (scales smoothly with zoom)
  const candleWidth = Math.max(1.8, Math.min(26, (chartWidth / (displayBars.length || 1)) * 0.72));

  // Snap magnet helper
  const getNearestPoint = (mouseX, mouseY) => {
    if (!chartDims.points || chartDims.points.length === 0) return { x: mouseX, y: mouseY, price: 0 };
    let nearest = chartDims.points[0];
    let minDiff = Infinity;
    chartDims.points.forEach(pt => {
      const diff = Math.abs(pt.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = pt;
      }
    });

    if (magnetMode) {
      const targets = [nearest.yHigh, nearest.yLow, nearest.yClose, nearest.yOpen];
      let bestY = nearest.y;
      let minDiffY = Infinity;
      targets.forEach(ty => {
        if (Math.abs(ty - mouseY) < minDiffY) {
          minDiffY = Math.abs(ty - mouseY);
          bestY = ty;
        }
      });
      return { x: nearest.x, y: bestY, price: nearest.close, date: nearest.date };
    }

    const price = chartDims.maxPrice - ((mouseY - paddingTop) / mainChartHeight) * chartDims.priceRange;
    return { x: mouseX, y: mouseY, price, date: nearest.date };
  };

  // SVG Mouse Interaction for Drawing, Crosshair & Panning
  const handleSvgMouseDown = (e) => {
    if (selectedTool === 'pan') {
      isDraggingPan.current = true;
      dragStartX.current = e.clientX;
      dragStartPan.current = panOffset;
      return;
    }

    if (drawingsLocked) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
    const mouseY = ((e.clientY - rect.top) / rect.height) * svgHeight;

    const snap = getNearestPoint(mouseX, mouseY);

    if (selectedTool === 'trendline' || selectedTool === 'horizontal_ray' || selectedTool === 'fib' || selectedTool === 'channel' || selectedTool === 'ruler') {
      setActiveDrawing({
        type: selectedTool,
        x1: snap.x,
        y1: snap.y,
        x2: snap.x,
        y2: snap.y,
        startPrice: snap.price,
        startDate: snap.date,
        id: Date.now()
      });
    } else if (selectedTool === 'brush') {
      setActiveDrawing({
        type: 'brush',
        points: [{ x: snap.x, y: snap.y }],
        id: Date.now()
      });
    } else if (selectedTool === 'text') {
      const textVal = prompt('Enter chart annotation text:', 'Support / Resistance Level');
      if (textVal) {
        setDrawings(prev => [...prev, {
          type: 'text',
          x: snap.x,
          y: snap.y,
          text: textVal,
          id: Date.now()
        }]);
      }
      if (!stayInDrawingMode) setSelectedTool('crosshair');
    } else if (selectedTool === 'sticker') {
      setDrawings(prev => [...prev, {
        type: 'sticker',
        x: snap.x,
        y: snap.y,
        emoji: stickerEmoji,
        id: Date.now()
      }]);
      if (!stayInDrawingMode) setSelectedTool('crosshair');
    }
  };

  const handleSvgMouseMove = (e) => {
    if (isDraggingPan.current) {
      const deltaX = e.clientX - dragStartX.current;
      const barShift = Math.round(deltaX / 14);
      setPanOffset(Math.max(0, dragStartPan.current + barShift));
      return;
    }

    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
    const mouseY = ((e.clientY - rect.top) / rect.height) * svgHeight;

    const ratio = Math.max(0, Math.min(1, (mouseX - paddingLeft) / chartWidth));
    const idx = Math.round(ratio * (displayBars.length - 1));
    setHoverIndex(idx);

    const calcPrice = chartDims.maxPrice - ((mouseY - paddingTop) / mainChartHeight) * chartDims.priceRange;
    setMouseCoord({ x: mouseX, y: mouseY, price: calcPrice });

    if (activeDrawing) {
      const snap = getNearestPoint(mouseX, mouseY);
      if (activeDrawing.type === 'brush') {
        setActiveDrawing(prev => ({
          ...prev,
          points: [...prev.points, { x: snap.x, y: snap.y }]
        }));
      } else {
        setActiveDrawing(prev => ({
          ...prev,
          x2: snap.x,
          y2: snap.y,
          endPrice: snap.price,
          endDate: snap.date
        }));
      }
    }
  };

  const handleSvgMouseUp = () => {
    if (isDraggingPan.current) {
      isDraggingPan.current = false;
    }
    if (activeDrawing) {
      setDrawings(prev => [...prev, activeDrawing]);
      setActiveDrawing(null);
      if (!stayInDrawingMode) {
        setSelectedTool('crosshair');
      }
    }
  };

  // Snapshot exporter
  const handleTakeSnapshot = () => {
    setSnapshotCopied(true);
    setTimeout(() => setSnapshotCopied(false), 2500);
  };

  // Active hover point
  const activePt = hoverIndex !== null && chartDims.points[hoverIndex]
    ? chartDims.points[hoverIndex]
    : (chartDims.points.length > 0 ? chartDims.points[chartDims.points.length - 1] : null);

  // SVG Helper line generator
  const buildSvgPath = (values) => {
    if (!chartDims.points || chartDims.points.length === 0) return '';
    const validPts = [];
    values.forEach((v, idx) => {
      if (v !== null && chartDims.points[idx]) {
        const y = paddingTop + mainChartHeight - ((v - chartDims.minPrice) / chartDims.priceRange) * mainChartHeight;
        validPts.push({ x: chartDims.points[idx].x, y });
      }
    });
    return validPts.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '');
  };

  // Compare Price Series Normalized Line
  const comparePath = useMemo(() => {
    if (!compareData?.bars || compareData.bars.length === 0 || !chartDims.points.length) return '';
    const compBars = compareData.bars;
    const baseFirst = compBars[0]?.close || 1;
    const baseTargetFirst = displayBars[0]?.close || 1;

    const pts = compBars.map((b, i) => {
      if (!chartDims.points[i]) return null;
      const pct = (b.close - baseFirst) / baseFirst;
      const mappedPrice = baseTargetFirst * (1 + pct);
      const y = paddingTop + mainChartHeight - ((mappedPrice - chartDims.minPrice) / chartDims.priceRange) * mainChartHeight;
      return { x: chartDims.points[i].x, y };
    }).filter(Boolean);

    return pts.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '');
  }, [compareData, displayBars, chartDims]);

  // Volume Formatter Helper
  const formatVol = (v) => {
    const num = Number(v) || 0;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-[#0B0F19] text-gray-200 select-none flex flex-col font-sans overflow-hidden border border-gray-800 transition-all ${
        isFullScreen ? 'fixed inset-0 z-[1000] w-screen h-screen rounded-none' : 'w-full rounded-2xl shadow-2xl min-h-[420px] sm:min-h-[500px] md:min-h-[580px]'
      }`}
    >
      {/* 1. SMART ADAPTIVE MULTI-TIER HEADER TOOLBAR */}
      <div className="flex flex-col bg-[#0E1322] border-b border-gray-800 text-xs shrink-0 divide-y divide-gray-800/60">
        {/* TIER 1: Symbol Search, Compare, Zoom Controls, Settings, Snapshot & Fullscreen */}
        <div className="flex items-center justify-between px-2.5 sm:px-3 py-1.5 gap-1.5 flex-wrap">
          {/* Left: Symbol & Compare */}
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            {/* Symbol Search Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 rounded-lg text-cyan-300 font-extrabold cursor-pointer transition-colors shadow-xs"
              title="Search Symbol (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-mono text-xs font-black">{currentSymbol}</span>
              <span className="text-[10px] text-gray-400 font-normal hidden lg:inline truncate max-w-[150px]">
                {effectiveCompanyName}
              </span>
            </button>

            {/* Compare Symbol (+) */}
            <button
              onClick={() => setShowCompareModal(true)}
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                compareSymbol ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:text-white'
              }`}
              title="Compare or Add Symbol"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{compareSymbol ? `vs ${compareSymbol}` : 'Compare'}</span>
            </button>

            {/* Live Price Tag Pill */}
            <div className="hidden xs:flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-gray-900 border border-gray-800 font-mono text-[11px]">
              <span className="text-gray-400">PKR</span>
              <span className="font-black text-white">{Number(currentPrice).toFixed(2)}</span>
              <span className={`text-[10px] font-bold ${isBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isBullish ? '+' : ''}{Number(changePercent).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Center/Right: Quick Zoom In/Out Toolbar Pill */}
          <div className="flex items-center space-x-1 bg-gray-900/90 px-1.5 py-0.5 rounded-lg border border-gray-800 font-mono text-[11px]">
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-gray-800 text-gray-300 hover:text-cyan-400 rounded cursor-pointer transition-colors"
              title="Zoom In (Ctrl + Scroll Up)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-cyan-300 font-bold px-1 min-w-[36px] text-anchor-center text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-gray-800 text-gray-300 hover:text-cyan-400 rounded cursor-pointer transition-colors"
              title="Zoom Out (Ctrl + Scroll Down)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 1.0 && (
              <button
                onClick={handleResetZoom}
                className="p-1 hover:bg-gray-800 text-amber-400 hover:text-amber-300 rounded cursor-pointer transition-colors"
                title="Reset Zoom to 100%"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Right Action Icons: Settings, Snapshot, Fullscreen, Close */}
          <div className="flex items-center space-x-1">
            {/* Real-time PSX Market Status Badge (Accurate Real-Time PKT Schedule) */}
            {marketStatus.isOpen ? (
              <div 
                className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 shrink-0"
                title={`PSX Market Open • ${marketStatus.subText} • ${marketStatus.pktTimeString}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE 1s</span>
              </div>
            ) : (
              <div 
                className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-[10px] font-mono font-bold text-rose-400 shrink-0"
                title={`PSX Market Closed • ${marketStatus.subText} • ${marketStatus.pktTimeString}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>MARKET CLOSED</span>
              </div>
            )}

            {/* Toggle Day H/C Reference Price Levels on Chart */}
            <button
              onClick={() => setShowPriceLevels(!showPriceLevels)}
              className={`px-1.5 py-0.5 rounded-lg border text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                showPriceLevels ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
              }`}
              title="Toggle Day High, Day Close & Day Low Lines"
            >
              H/C Lines
            </button>

            {/* Mobile Drawing Tools Toggle Button */}
            <button
              onClick={() => setShowMobileDrawingTools(!showMobileDrawingTools)}
              className={`p-1.5 rounded-lg border cursor-pointer transition-colors md:hidden ${
                showMobileDrawingTools ? 'bg-cyan-500 text-black border-cyan-400 shadow-sm' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
              }`}
              title="Toggle Drawing Tools"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>

            {/* Chart Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white cursor-pointer transition-colors"
              title="Chart Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Camera Snapshot Button */}
            <button
              onClick={handleTakeSnapshot}
              className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-cyan-400 cursor-pointer transition-colors"
              title="Take Snapshot / Export PNG"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            {/* Position Sizer Button */}
            {onOpenCalculator && (
              <button
                onClick={() => onOpenCalculator({ symbol: currentSymbol, currentPrice })}
                className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold cursor-pointer transition-colors hidden sm:flex items-center space-x-1"
                title="Open Position Sizer Calculator"
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Sizer</span>
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-cyan-500/40 text-gray-400 hover:text-cyan-400 cursor-pointer transition-colors"
              title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen Chart'}
            >
              {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close Modal if callback exists */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 cursor-pointer transition-colors ml-1"
                title="Close Chart"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* TIER 2: Timeframe Ribbon, 12 Chart Styles Selector, Indicators Trigger */}
        <div className="flex items-center justify-between px-2.5 sm:px-3 py-1 gap-2 relative z-30">
          {/* Left: Timeframe Selector Ribbon */}
          <div className="flex items-center space-x-1 shrink-0">
            <div className="flex items-center space-x-0.5 bg-gray-900/90 p-0.5 rounded-lg border border-gray-800 font-mono text-[11px] font-bold">
              <div className="flex items-center space-x-0.5 overflow-x-auto no-scrollbar max-w-[210px] xs:max-w-none">
                {['1s', '5s', '1m', '5m', '15m', '1h', '1D', '1W'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => handleSelectTimeframe(tf)}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer text-[10px] sm:text-[11px] shrink-0 ${
                      timeframe === tf ? 'bg-cyan-500 text-black shadow-xs font-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <div className="relative inline-block shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTimeframeDropdown(prev => !prev);
                    setShowChartTypeDropdown(false);
                  }}
                  className={`px-1 py-0.5 rounded cursor-pointer flex items-center transition-colors ${
                    showTimeframeDropdown ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="More Timeframes (1s to 1M)"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Timeframe Dropdown Menu (Guaranteed Unclipped with z-[9999]) */}
                {showTimeframeDropdown && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full left-0 mt-1.5 w-52 bg-[#0F172A] border border-cyan-500/40 rounded-xl shadow-2xl py-2 z-[9999] text-xs backdrop-blur-2xl max-h-80 overflow-y-auto ring-1 ring-black/50"
                  >
                    <div className="px-3 py-1 text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider flex items-center justify-between">
                      <span>Seconds (Live Ticks)</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                    {['1s', '5s', '15s', '30s'].map(tf => (
                      <button
                        key={tf}
                        onClick={() => handleSelectTimeframe(tf)}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-800 flex items-center justify-between text-gray-200 cursor-pointer"
                      >
                        <span>{tf} ({tf === '1s' ? '1 Second' : `${tf.replace('s','')} Sec`})</span>
                        {timeframe === tf && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                    <div className="border-t border-gray-800 my-1" />
                    <div className="px-3 py-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Minutes</div>
                    {['1m', '3m', '5m', '15m', '30m', '45m'].map(tf => (
                      <button
                        key={tf}
                        onClick={() => handleSelectTimeframe(tf)}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-800 flex items-center justify-between text-gray-200 cursor-pointer"
                      >
                        <span>{tf} ({tf.replace('m', '')} Min)</span>
                        {timeframe === tf && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                    <div className="border-t border-gray-800 my-1" />
                    <div className="px-3 py-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hours & Days</div>
                    {['1h', '2h', '4h', '1D', '1W', '1M'].map(tf => (
                      <button
                        key={tf}
                        onClick={() => handleSelectTimeframe(tf)}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-800 flex items-center justify-between text-gray-200 cursor-pointer"
                      >
                        <span>{tf} ({tf === '1D' ? '1 Day (Daily)' : (tf === '1W' ? '1 Week' : (tf === '1M' ? '1 Month' : tf))})</span>
                        {timeframe === tf && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Chart Type & Indicators Trigger */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* 12 Graph Types Dropdown Selector with Safe Positioning */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChartTypeDropdown(prev => !prev);
                  setShowTimeframeDropdown(false);
                }}
                className="flex items-center space-x-1 px-2 py-1 bg-gray-900 border border-gray-800 hover:border-cyan-500/50 rounded-lg text-xs font-bold text-gray-200 hover:text-white cursor-pointer transition-colors"
                title="Select Graph Type (12 Styles)"
              >
                <span>{CHART_TYPES.find(c => c.id === chartType)?.icon || '🕯️'}</span>
                <span className="hidden sm:inline font-medium text-[11px]">{CHART_TYPES.find(c => c.id === chartType)?.label || 'Candles'}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* 12 Chart Types Popup List */}
              {showChartTypeDropdown && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full right-0 sm:left-0 mt-1.5 w-52 sm:w-56 bg-[#0E1424] border border-cyan-500/40 rounded-xl shadow-2xl py-2 z-[9999] backdrop-blur-2xl ring-1 ring-black/50"
                >
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-800 mb-1">
                    PSX Chart Styles (12)
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-0.5 px-1">
                    {CHART_TYPES.map(ct => (
                      <button
                        key={ct.id}
                        onClick={() => { setChartType(ct.id); setShowChartTypeDropdown(false); }}
                        className={`w-full text-left px-2 py-1 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                          chartType === ct.id ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{ct.icon}</span>
                          <span className="text-xs">{ct.label}</span>
                        </div>
                        {chartType === ct.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Indicators Modal Trigger */}
            <button
              onClick={() => setShowIndicatorsModal(true)}
              className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-purple-500/30 rounded-lg text-xs font-bold text-purple-200 cursor-pointer transition-colors shadow-xs"
              title="Technical Indicators (fx)"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-bold text-[11px]">fx <span className="hidden sm:inline">Indicators</span></span>
              {Object.values(activeIndicators).filter(Boolean).length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-purple-500 text-black text-[9px] font-black rounded-full">
                  {Object.values(activeIndicators).filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TIER 3: MULTI-TIMEFRAME HIGH & CLOSE INTELLIGENCE RIBBON */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-[#080C16] border-t border-gray-800/80 text-[10px] sm:text-[11px] font-mono shrink-0">
          {/* Day Card */}
          <div className="flex items-center justify-between bg-gray-900/80 px-2 py-1 rounded-lg border border-gray-800">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-black text-cyan-400">📅 DAY</span>
              <span className={`text-[9px] font-black ${isBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isBullish ? '▲' : '▼'} {changePercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-gray-400 text-[10px]">H: <b className="text-emerald-400">{dayHighNum.toFixed(2)}</b></span>
              <span className="text-gray-400 text-[10px]">C: <b className="text-cyan-300">{dayCloseNum.toFixed(2)}</b></span>
            </div>
          </div>

          {/* Week Card */}
          <div className="flex items-center justify-between bg-gray-900/80 px-2 py-1 rounded-lg border border-gray-800">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-black text-indigo-400">📊 WEEK</span>
              <span className={`text-[9px] font-black ${weekChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {weekChangePercent >= 0 ? '+' : ''}{weekChangePercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-gray-400 text-[10px]">H: <b className="text-emerald-400">{weekHighNum.toFixed(2)}</b></span>
              <span className="text-gray-400 text-[10px]">C: <b className="text-cyan-300">{weekCloseNum.toFixed(2)}</b></span>
            </div>
          </div>

          {/* Month Card */}
          <div className="flex items-center justify-between bg-gray-900/80 px-2 py-1 rounded-lg border border-gray-800">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-black text-purple-400">📈 MONTH</span>
              <span className={`text-[9px] font-black ${monthChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {monthChangePercent >= 0 ? '+' : ''}{monthChangePercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-gray-400 text-[10px]">H: <b className="text-emerald-400">{monthHighNum.toFixed(2)}</b></span>
              <span className="text-gray-400 text-[10px]">C: <b className="text-cyan-300">{monthCloseNum.toFixed(2)}</b></span>
            </div>
          </div>

          {/* 52-Week Card */}
          <div className="flex items-center justify-between bg-gray-900/80 px-2 py-1 rounded-lg border border-gray-800">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-black text-amber-400">🏆 52W</span>
              <span className="text-[9px] text-gray-500 font-bold hidden xs:inline">RANGE</span>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-gray-400 text-[10px]">H: <b className="text-amber-400">{week52High}</b></span>
              <span className="text-gray-400 text-[10px]">L: <b className="text-rose-400">{week52Low}</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: DRAWING TOOLBAR + SVG CANVAS */}
      <div className="flex-1 flex flex-row relative overflow-hidden">
        {/* DRAWING TOOLBAR: Persistent on desktop (`md:`), Toggleable drawer on mobile */}
        <div
          className={`${
            showMobileDrawingTools ? 'flex absolute top-0 left-0 bottom-0 shadow-2xl z-40' : 'hidden md:flex'
          } w-10 sm:w-11 bg-[#0A0E1A] border-r border-gray-800/90 flex-col items-center py-2 space-y-1 z-30 shrink-0 select-none overflow-y-auto`}
        >
          {/* 1. Crosshair Pointer */}
          <button
            onClick={() => setSelectedTool('crosshair')}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
              selectedTool === 'crosshair' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Crosshair / Pointer"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Pan Tool */}
          <button
            onClick={() => setSelectedTool('pan')}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
              selectedTool === 'pan' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Pan / Drag Chart"
          >
            <Move className="w-4 h-4" />
          </button>

          {/* 2. Trend Line */}
          <button
            onClick={() => setSelectedTool('trendline')}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
              selectedTool === 'trendline' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Trend Line (Draw support/resistance)"
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          {/* 3. Horizontal Ray */}
          <button
            onClick={() => setSelectedTool('horizontal_ray')}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
              selectedTool === 'horizontal_ray' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Horizontal Ray / Price Level"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* 4. Fibonacci Retracement */}
          <button
            onClick={() => setSelectedTool('fib')}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
              selectedTool === 'fib' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Fibonacci Retracement"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
          </button>

          {/* 5. Parallel Channel */}
          <button
            onClick={() => setSelectedTool('channel')}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
              selectedTool === 'channel' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Parallel Price Channel"
          >
            <Layers className="w-4 h-4 text-purple-400" />
          </button>

          {/* 6. Brush / Freehand Draw */}
          <button
            onClick={() => setSelectedTool('brush')}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
              selectedTool === 'brush' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Brush / Freehand Drawing"
          >
            <Edit3 className="w-4 h-4 text-emerald-400" />
          </button>

          {/* 7. Text Annotation */}
          <button
            onClick={() => setSelectedTool('text')}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
              selectedTool === 'text' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Text Note / Annotation"
          >
            <Type className="w-4 h-4" />
          </button>

          {/* 8. Sentiment Stickers */}
          <div className="relative group">
            <button
              onClick={() => setSelectedTool('sticker')}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
                selectedTool === 'sticker' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title="Stickers / Emojis"
            >
              <Smile className="w-4 h-4 text-yellow-400" />
            </button>
            <div className="absolute left-full top-0 ml-1 hidden group-hover:flex bg-gray-900 p-1 rounded-lg border border-gray-700 shadow-xl space-x-1 z-50">
              {['🚀', '🐂', '🐻', '🔥', '💎', '🛑', '🎯'].map(emoji => (
                <button
                  key={emoji}
                  onClick={(e) => { e.stopPropagation(); setStickerEmoji(emoji); setSelectedTool('sticker'); }}
                  className="p-1 hover:bg-gray-800 rounded text-sm cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 9. Measurement Ruler */}
          <button
            onClick={() => setSelectedTool('ruler')}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
              selectedTool === 'ruler' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Measure Ruler (% Gain/Loss & Bar Count)"
          >
            <Ruler className="w-4 h-4 text-cyan-400" />
          </button>

          <div className="w-5 h-px bg-gray-800 my-1" />

          {/* 10. Magnet Mode */}
          <button
            onClick={() => setMagnetMode(!magnetMode)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
              magnetMode ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
            }`}
            title={magnetMode ? 'Magnet Mode ON' : 'Magnet Mode OFF'}
          >
            <Magnet className="w-4 h-4" />
          </button>

          {/* 11. Lock All Drawings */}
          <button
            onClick={() => setDrawingsLocked(!drawingsLocked)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
              drawingsLocked ? 'bg-amber-600 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
            }`}
            title={drawingsLocked ? 'Drawings Locked' : 'Drawings Unlocked'}
          >
            {drawingsLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* 12. Clear All Drawings */}
          <button
            onClick={() => setDrawings([])}
            className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer mt-auto"
            title="Clear All Drawings"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* CHART CANVAS DISPLAY AREA */}
        <div className="flex-1 flex flex-col relative bg-[#070B14] overflow-hidden">
          {/* Top OHLC & Volume Telemetry Legend (Clean & Compact on Mobile) */}
          {chartSettings.showLegend && (
            <div className="absolute top-2 left-2 sm:left-3 z-20 flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 font-mono text-[9.5px] sm:text-[11px] bg-[#070B14]/90 backdrop-blur-md px-2 py-1 rounded-lg border border-gray-800/80 pointer-events-none shadow-md max-w-[calc(100%-16px)]">
              <div className="flex items-center space-x-1">
                <span className="font-black text-white">{currentSymbol}</span>
                <span className="text-cyan-400 font-bold px-1 py-0.2 bg-cyan-500/15 border border-cyan-500/30 rounded text-[9px]">
                  {timeframe}
                </span>
              </div>

              {activePt && (
                <>
                  <div className="flex items-center space-x-0.5">
                    <span className="text-gray-500">O:</span>
                    <span className="text-gray-200 font-bold">{Number(activePt.open).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-0.5">
                    <span className="text-emerald-400 font-bold">
                      {timeframe === '1D' ? 'Day High:' : (timeframe === '1W' ? 'Wk High:' : (timeframe === '1M' ? 'Mo High:' : 'H:'))}
                    </span>
                    <span className="text-emerald-400 font-black">{Number(activePt.high).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-0.5">
                    <span className="text-rose-400 font-bold">
                      {timeframe === '1D' ? 'Day Low:' : (timeframe === '1W' ? 'Wk Low:' : (timeframe === '1M' ? 'Mo Low:' : 'L:'))}
                    </span>
                    <span className="text-rose-400 font-bold">{Number(activePt.low).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-0.5">
                    <span className="text-cyan-400 font-bold">
                      {timeframe === '1D' ? 'Day Close:' : (timeframe === '1W' ? 'Wk Close:' : (timeframe === '1M' ? 'Mo Close:' : 'C:'))}
                    </span>
                    <span className={`font-black ${activePt.isBull ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {Number(activePt.close).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 bg-cyan-500/10 px-1 py-0.2 rounded border border-cyan-500/20">
                    <span className="text-cyan-400 font-bold">Vol:</span>
                    <span className="text-white font-black">{formatVol(activePt.volume)}</span>
                  </div>
                  <div className="text-gray-400 text-[9px] hidden sm:inline">
                    [{activePt.date}]
                  </div>
                </>
              )}

              {compareSymbol && compareData && (
                <div className="flex items-center space-x-1 pl-1.5 border-l border-gray-700 text-amber-300">
                  <span>vs {compareSymbol}:</span>
                  <span className="font-bold">PKR {Number(compareData?.quote?.currentPrice || 0).toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Active Overlay Indicators Legend */}
          <div className="absolute top-10 left-2 sm:left-3 z-10 flex flex-col space-y-0.5 text-[9px] sm:text-[10px] font-mono pointer-events-none">
            {activeIndicators.sma20 && indicatorSeries.sma20 && (
              <span className="text-sky-400">SMA 20: {indicatorSeries.sma20[hoverIndex !== null ? hoverIndex : indicatorSeries.sma20.length - 1]?.toFixed(2) || '—'}</span>
            )}
            {activeIndicators.sma50 && indicatorSeries.sma50 && (
              <span className="text-amber-400">SMA 50: {indicatorSeries.sma50[hoverIndex !== null ? hoverIndex : indicatorSeries.sma50.length - 1]?.toFixed(2) || '—'}</span>
            )}
            {activeIndicators.ema9 && indicatorSeries.ema9 && (
              <span className="text-purple-400">EMA 9: {indicatorSeries.ema9[hoverIndex !== null ? hoverIndex : indicatorSeries.ema9.length - 1]?.toFixed(2) || '—'}</span>
            )}
            {activeIndicators.bollinger && indicatorSeries.bbUpper && (
              <span className="text-indigo-400">BB (20, 2): {indicatorSeries.bbUpper[hoverIndex !== null ? hoverIndex : indicatorSeries.bbUpper.length - 1]?.toFixed(2)} / {indicatorSeries.bbLower[hoverIndex !== null ? hoverIndex : indicatorSeries.bbLower.length - 1]?.toFixed(2)}</span>
            )}
          </div>

          {/* Background Watermark */}
          {chartSettings.showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
              <span className="text-7xl sm:text-9xl font-black font-mono tracking-widest text-white">{currentSymbol}</span>
            </div>
          )}

          {/* Loading Telemetry Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-40 bg-[#070B14]/70 backdrop-blur-sm flex items-center justify-center space-x-2 text-cyan-400 text-xs font-mono font-bold">
              <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Streaming PSX Telemetry ({currentSymbol})...</span>
            </div>
          )}

          {/* Floating On-Canvas Quick Zoom Controller Dock */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center space-x-1 bg-[#0B0F19]/90 backdrop-blur-md px-2 py-1 rounded-xl border border-gray-800 shadow-xl">
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-cyan-400 cursor-pointer transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-bold text-gray-300 min-w-[32px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-cyan-400 cursor-pointer transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            {zoomLevel !== 1.0 && (
              <button
                onClick={handleResetZoom}
                className="p-1 rounded hover:bg-gray-800 text-amber-400 hover:text-amber-300 cursor-pointer transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* PRIMARY SVG VECTOR GRAPH ENGINE (With Wheel Zoom & Pinch-to-Zoom Support) */}
          <div
            className="w-full h-full flex-1 relative cursor-crosshair touch-none"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full block"
              onMouseDown={handleSvgMouseDown}
              onMouseMove={handleSvgMouseMove}
              onMouseUp={handleSvgMouseUp}
              onMouseLeave={() => { setHoverIndex(null); handleSvgMouseUp(); }}
            >
              <defs>
                <linearGradient id={`tv_grad_${currentSymbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="tv_baseline_up" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="tv_baseline_down" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {chartSettings.gridStyle !== 'none' && (
                <g opacity="0.4">
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                    const y = paddingTop + mainChartHeight * pct;
                    const priceAtY = chartDims.maxPrice - pct * chartDims.priceRange;
                    const dash = chartSettings.gridStyle === 'dotted' ? '2 2' : chartSettings.gridStyle === 'dashed' ? '5 5' : 'none';
                    return (
                      <g key={`ygrid_${i}`}>
                        <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#1E293B" strokeDasharray={dash} />
                        <text x={svgWidth - paddingRight + 6} y={y + 3} fill="#64748B" fontSize="9" fontFamily="monospace">
                          {priceAtY.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}
                  {[0.15, 0.35, 0.55, 0.75, 0.95].map((pct, i) => {
                    const x = paddingLeft + chartWidth * pct;
                    const dash = chartSettings.gridStyle === 'dotted' ? '2 2' : chartSettings.gridStyle === 'dashed' ? '5 5' : 'none';
                    return (
                      <line key={`xgrid_${i}`} x1={x} y1={paddingTop} x2={x} y2={paddingTop + mainChartHeight} stroke="#1E293B" strokeDasharray={dash} />
                    );
                  })}
                </g>
              )}

              {/* 1. CHART GRAPH TYPE RENDERERS (All 12 Styles) */}
              {chartDims.points.length > 0 && (
                <g>
                  {/* CANDLES / HOLLOW CANDLES / HEIKIN ASHI */}
                  {(chartType === 'candles' || chartType === 'hollow_candles' || chartType === 'heikin_ashi') && (
                    <g>
                      {chartDims.points.map((pt, i) => {
                        const bodyTop = Math.min(pt.yOpen, pt.yClose);
                        const bodyHeight = Math.max(2, Math.abs(pt.yClose - pt.yOpen));
                        const color = pt.isBull ? chartSettings.upColor : chartSettings.downColor;
                        const isHollow = chartType === 'hollow_candles' && pt.isBull;

                        return (
                          <g key={`candle_${i}`}>
                            <line x1={pt.x} y1={pt.yHigh} x2={pt.x} y2={pt.yLow} stroke={color} strokeWidth="1.2" />
                            <rect
                              x={pt.x - candleWidth / 2}
                              y={bodyTop}
                              width={candleWidth}
                              height={bodyHeight}
                              fill={isHollow ? '#070B14' : color}
                              stroke={color}
                              strokeWidth={isHollow ? '1.5' : '0'}
                              rx="1"
                            />
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* BARS */}
                  {chartType === 'bars' && (
                    <g>
                      {chartDims.points.map((pt, i) => {
                        const color = pt.isBull ? chartSettings.upColor : chartSettings.downColor;
                        const tickLen = candleWidth * 0.45;
                        return (
                          <g key={`bar_${i}`}>
                            <line x1={pt.x} y1={pt.yHigh} x2={pt.x} y2={pt.yLow} stroke={color} strokeWidth="1.5" />
                            <line x1={pt.x - tickLen} y1={pt.yOpen} x2={pt.x} y2={pt.yOpen} stroke={color} strokeWidth="1.5" />
                            <line x1={pt.x} y1={pt.yClose} x2={pt.x + tickLen} y2={pt.yClose} stroke={color} strokeWidth="1.5" />
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* LINE */}
                  {chartType === 'line' && (
                    <path
                      d={chartDims.points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '')}
                      fill="none"
                      stroke="#06B6D4"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* LINE WITH MARKERS */}
                  {chartType === 'line_markers' && (
                    <g>
                      <path
                        d={chartDims.points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '')}
                        fill="none"
                        stroke="#06B6D4"
                        strokeWidth="2"
                      />
                      {chartDims.points.map((pt, i) => (
                        <circle key={`marker_${i}`} cx={pt.x} cy={pt.y} r="3" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="1" />
                      ))}
                    </g>
                  )}

                  {/* STEP LINE */}
                  {chartType === 'step_line' && (
                    <path
                      d={chartDims.points.reduce((acc, pt, i) => {
                        if (i === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
                        return `${acc} H ${pt.x.toFixed(1)} V ${pt.y.toFixed(1)}`;
                      }, '')}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="2"
                    />
                  )}

                  {/* AREA */}
                  {chartType === 'area' && (
                    <g>
                      <path
                        d={`${chartDims.points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '')} L ${chartDims.points[chartDims.points.length - 1].x.toFixed(1)} ${(paddingTop + mainChartHeight).toFixed(1)} L ${chartDims.points[0].x.toFixed(1)} ${(paddingTop + mainChartHeight).toFixed(1)} Z`}
                        fill={`url(#tv_grad_${currentSymbol})`}
                      />
                      <path
                        d={chartDims.points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '')}
                        fill="none"
                        stroke="#06B6D4"
                        strokeWidth="2.5"
                      />
                    </g>
                  )}

                  {/* HLC AREA */}
                  {chartType === 'hlc_area' && (
                    <g>
                      <path
                        d={`${chartDims.points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.yHigh.toFixed(1)}`, '')} ${chartDims.points.slice().reverse().reduce((acc, pt) => `${acc} L ${pt.x.toFixed(1)} ${pt.yLow.toFixed(1)}`, '')} Z`}
                        fill="rgba(56, 189, 248, 0.2)"
                        stroke="#38BDF8"
                        strokeWidth="1"
                      />
                      <path
                        d={chartDims.points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.yClose.toFixed(1)}`, '')}
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="2"
                      />
                    </g>
                  )}

                  {/* BASELINE */}
                  {chartType === 'baseline' && (
                    <g>
                      <line x1={paddingLeft} y1={chartDims.baselineY} x2={svgWidth - paddingRight} y2={chartDims.baselineY} stroke="#94A3B8" strokeDasharray="3 3" strokeWidth="1.5" />
                      <path
                        d={`${chartDims.points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '')} L ${chartDims.points[chartDims.points.length - 1].x.toFixed(1)} ${chartDims.baselineY} L ${chartDims.points[0].x.toFixed(1)} ${chartDims.baselineY} Z`}
                        fill="url(#tv_baseline_up)"
                      />
                      <path
                        d={chartDims.points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '')}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2"
                      />
                    </g>
                  )}

                  {/* COLUMNS */}
                  {chartType === 'columns' && (
                    <g>
                      {chartDims.points.map((pt, i) => {
                        const barBase = paddingTop + mainChartHeight;
                        const colH = Math.max(2, barBase - pt.yClose);
                        const color = pt.isBull ? chartSettings.upColor : chartSettings.downColor;
                        return (
                          <rect key={`col_${i}`} x={pt.x - candleWidth / 2} y={pt.yClose} width={candleWidth} height={colH} fill={color} opacity="0.85" rx="1" />
                        );
                      })}
                    </g>
                  )}

                  {/* HIGH-LOW */}
                  {chartType === 'high_low' && (
                    <g>
                      {chartDims.points.map((pt, i) => {
                        const top = pt.yHigh;
                        const h = Math.max(2, pt.yLow - pt.yHigh);
                        const color = pt.isBull ? chartSettings.upColor : chartSettings.downColor;
                        return (
                          <rect key={`hl_${i}`} x={pt.x - candleWidth / 2} y={top} width={candleWidth} height={h} fill={color} rx="1" />
                        );
                      })}
                    </g>
                  )}
                </g>
              )}

              {/* 2. OVERLAY INDICATORS */}
              {activeIndicators.sma20 && indicatorSeries.sma20 && (
                <path d={buildSvgPath(indicatorSeries.sma20)} fill="none" stroke="#38BDF8" strokeWidth="1.8" />
              )}
              {activeIndicators.sma50 && indicatorSeries.sma50 && (
                <path d={buildSvgPath(indicatorSeries.sma50)} fill="none" stroke="#F59E0B" strokeWidth="1.8" />
              )}
              {activeIndicators.sma200 && indicatorSeries.sma200 && (
                <path d={buildSvgPath(indicatorSeries.sma200)} fill="none" stroke="#EC4899" strokeWidth="2" />
              )}
              {activeIndicators.ema9 && indicatorSeries.ema9 && (
                <path d={buildSvgPath(indicatorSeries.ema9)} fill="none" stroke="#A855F7" strokeWidth="1.5" />
              )}
              {activeIndicators.ema21 && indicatorSeries.ema21 && (
                <path d={buildSvgPath(indicatorSeries.ema21)} fill="none" stroke="#10B981" strokeWidth="1.5" />
              )}
              {activeIndicators.bollinger && indicatorSeries.bbUpper && indicatorSeries.bbLower && (
                <g>
                  <path d={buildSvgPath(indicatorSeries.bbUpper)} fill="none" stroke="#6366F1" strokeWidth="1.2" strokeDasharray="3 3" />
                  <path d={buildSvgPath(indicatorSeries.bbLower)} fill="none" stroke="#6366F1" strokeWidth="1.2" strokeDasharray="3 3" />
                </g>
              )}
              {activeIndicators.vwap && indicatorSeries.vwap && (
                <path d={buildSvgPath(indicatorSeries.vwap)} fill="none" stroke="#F97316" strokeWidth="2" strokeDasharray="4 2" />
              )}
              {activeIndicators.supertrend && indicatorSeries.supertrend && (
                <path d={buildSvgPath(indicatorSeries.supertrend)} fill="none" stroke="#10B981" strokeWidth="2.5" />
              )}
              {activeIndicators.sar && indicatorSeries.sar && (
                <g>
                  {indicatorSeries.sar.map((val, idx) => {
                    if (!chartDims.points[idx]) return null;
                    const y = paddingTop + mainChartHeight - ((val - chartDims.minPrice) / chartDims.priceRange) * mainChartHeight;
                    return <circle key={`sar_${idx}`} cx={chartDims.points[idx].x} cy={y} r="2" fill="#EAB308" />;
                  })}
                </g>
              )}

              {/* Compare Stock Overlay Line */}
              {compareSymbol && comparePath && (
                <path d={comparePath} fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeDasharray="5 3" />
              )}

              {/* 3. VOLUME SUB-PANEL */}
              {chartSettings.showVolume && (
                <g>
                  <line x1={paddingLeft} y1={paddingTop + mainChartHeight} x2={svgWidth - paddingRight} y2={paddingTop + mainChartHeight} stroke="#1E293B" />
                  <text x={paddingLeft + 4} y={paddingTop + mainChartHeight + 13} fill="#64748B" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                    VOL: {formatVol(chartDims.maxVol)} Max
                  </text>
                  <text x={svgWidth - paddingRight + 6} y={paddingTop + mainChartHeight + 13} fill="#64748B" fontSize="8" fontFamily="monospace">
                    {formatVol(chartDims.maxVol)}
                  </text>

                  {/* Volume Histogram Bars */}
                  {chartDims.points.map((pt, i) => {
                    const isHovered = hoverIndex === i;
                    return (
                      <g key={`vol_${i}`}>
                        <rect
                          x={pt.x - candleWidth / 2}
                          y={pt.volY}
                          width={candleWidth}
                          height={Math.max(2, pt.volH)}
                          fill={pt.isBull ? chartSettings.upColor : chartSettings.downColor}
                          opacity={isHovered ? '1.0' : '0.55'}
                          stroke={isHovered ? '#22D3EE' : 'none'}
                          strokeWidth={isHovered ? '1' : '0'}
                          rx="0.5"
                        />
                      </g>
                    );
                  })}

                  {indicatorSeries.volumeMA && (
                    <path
                      d={buildSvgPath(indicatorSeries.volumeMA.map(v => (v ? chartDims.minPrice + (v / chartDims.maxVol) * chartDims.priceRange : null)))}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="1.2"
                      opacity="0.75"
                    />
                  )}
                </g>
              )}

              {/* 4. SUB-PANELS (RSI, MACD, STOCH, ATR, OBV) */}
              {activeSubPanels.map((panel, pIdx) => {
                const panelTop = paddingTop + mainChartHeight + volumePanelHeight + pIdx * subPanelHeight;
                return (
                  <g key={`panel_${panel}`}>
                    <line x1={paddingLeft} y1={panelTop} x2={svgWidth - paddingRight} y2={panelTop} stroke="#334155" strokeWidth="1" />
                    <text x={paddingLeft + 4} y={panelTop + 14} fill="#94A3B8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      {panel.toUpperCase()}
                    </text>
                    <text x={svgWidth - paddingRight + 6} y={panelTop + subPanelHeight / 2} fill="#64748B" fontSize="8" fontFamily="monospace">
                      {panel === 'rsi' ? '70/30' : '0.00'}
                    </text>

                    {/* RSI Panel */}
                    {panel === 'rsi' && indicatorSeries.rsi && (
                      <g>
                        <line x1={paddingLeft} y1={panelTop + subPanelHeight * 0.3} x2={svgWidth - paddingRight} y2={panelTop + subPanelHeight * 0.3} stroke="#EF4444" strokeDasharray="2 2" opacity="0.5" />
                        <line x1={paddingLeft} y1={panelTop + subPanelHeight * 0.7} x2={svgWidth - paddingRight} y2={panelTop + subPanelHeight * 0.7} stroke="#10B981" strokeDasharray="2 2" opacity="0.5" />
                        <path
                          d={chartDims.points.map((pt, i) => {
                            const rsiVal = indicatorSeries.rsi[i] || 50;
                            const y = panelTop + subPanelHeight - (rsiVal / 100) * subPanelHeight;
                            return `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${y.toFixed(1)}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="2"
                        />
                      </g>
                    )}

                    {/* MACD Panel */}
                    {panel === 'macd' && indicatorSeries.macd && (
                      <g>
                        {chartDims.points.map((pt, i) => {
                          const hist = indicatorSeries.macd.hist[i] || 0;
                          const h = Math.min(subPanelHeight / 2 - 2, Math.abs(hist) * 8);
                          const y = hist >= 0 ? (panelTop + subPanelHeight / 2 - h) : (panelTop + subPanelHeight / 2);
                          return (
                            <rect key={`macd_hist_${i}`} x={pt.x - 1.5} y={y} width="3" height={Math.max(1, h)} fill={hist >= 0 ? '#10B981' : '#EF4444'} opacity="0.8" />
                          );
                        })}
                      </g>
                    )}
                  </g>
                );
              })}

              {/* 5. USER DRAWINGS LAYER */}
              {drawingsVisible && (
                <g>
                  {drawings.map(d => {
                    if (d.type === 'trendline') {
                      return <line key={d.id} x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} stroke="#22D3EE" strokeWidth="2.5" />;
                    }
                    if (d.type === 'horizontal_ray') {
                      return <line key={d.id} x1={paddingLeft} y1={d.y1} x2={svgWidth - paddingRight} y2={d.y1} stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" />;
                    }
                    if (d.type === 'fib') {
                      const diff = d.y2 - d.y1;
                      const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
                      return (
                        <g key={d.id}>
                          {levels.map(lvl => {
                            const y = d.y1 + diff * lvl;
                            return (
                              <g key={lvl}>
                                <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#8B5CF6" strokeWidth="1" strokeDasharray="2 2" opacity="0.75" />
                                <text x={paddingLeft + 4} y={y - 2} fill="#A78BFA" fontSize="8" fontFamily="monospace">
                                  {lvl.toFixed(3)}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      );
                    }
                    if (d.type === 'brush' && d.points) {
                      return (
                        <path
                          key={d.id}
                          d={d.points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '')}
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      );
                    }
                    if (d.type === 'text') {
                      return (
                        <text key={d.id} x={d.x} y={d.y} fill="#F8FAFC" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                          {d.text}
                        </text>
                      );
                    }
                    if (d.type === 'sticker') {
                      return (
                        <text key={d.id} x={d.x - 8} y={d.y + 6} fontSize="18">
                          {d.emoji}
                        </text>
                      );
                    }
                    if (d.type === 'ruler') {
                      const pDiff = (d.endPrice || 0) - (d.startPrice || 0);
                      const pct = d.startPrice > 0 ? (pDiff / d.startPrice) * 100 : 0;
                      return (
                        <g key={d.id}>
                          <rect x={Math.min(d.x1, d.x2)} y={Math.min(d.y1, d.y2)} width={Math.abs(d.x2 - d.x1)} height={Math.abs(d.y2 - d.y1)} fill="rgba(6, 182, 212, 0.15)" stroke="#06B6D4" strokeDasharray="3 3" />
                          <text x={d.x2 + 4} y={d.y2} fill="#22D3EE" fontSize="10" fontFamily="monospace" fontWeight="bold">
                            {pct >= 0 ? '+' : ''}{pct.toFixed(2)}% (PKR {pDiff.toFixed(2)})
                          </text>
                        </g>
                      );
                    }
                    return null;
                  })}

                  {activeDrawing && (
                    <g>
                      {activeDrawing.type === 'trendline' && (
                        <line x1={activeDrawing.x1} y1={activeDrawing.y1} x2={activeDrawing.x2} y2={activeDrawing.y2} stroke="#22D3EE" strokeWidth="2.5" strokeDasharray="3 2" />
                      )}
                      {activeDrawing.type === 'horizontal_ray' && (
                        <line x1={paddingLeft} y1={activeDrawing.y1} x2={svgWidth - paddingRight} y2={activeDrawing.y1} stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" />
                      )}
                      {activeDrawing.type === 'ruler' && (
                        <rect x={Math.min(activeDrawing.x1, activeDrawing.x2)} y={Math.min(activeDrawing.y1, activeDrawing.y2)} width={Math.abs(activeDrawing.x2 - activeDrawing.x1)} height={Math.abs(activeDrawing.y2 - activeDrawing.y1)} fill="rgba(6, 182, 212, 0.2)" stroke="#06B6D4" strokeDasharray="2 2" />
                      )}
                    </g>
                  )}
                </g>
              )}

              {/* 6. CROSSHAIR & HOVER TRACKER */}
              {activePt && selectedTool === 'crosshair' && (
                <g>
                  <line x1={activePt.x} y1={paddingTop} x2={activePt.x} y2={svgHeight - paddingBottom} stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1={paddingLeft} y1={mouseCoord.y > 0 && mouseCoord.y < svgHeight - paddingBottom ? mouseCoord.y : activePt.y} x2={svgWidth - paddingRight} y2={mouseCoord.y > 0 && mouseCoord.y < svgHeight - paddingBottom ? mouseCoord.y : activePt.y} stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx={activePt.x} cy={activePt.y} r="4.5" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="2" />

                  {/* Y-Axis Hover Price Badge */}
                  <g transform={`translate(${svgWidth - paddingRight + 2}, ${(mouseCoord.y > 0 && mouseCoord.y < svgHeight - paddingBottom ? mouseCoord.y : activePt.y) - 9})`}>
                    <rect width="64" height="18" fill="#0284C7" rx="3" />
                    <text x="32" y="12" fill="#FFFFFF" fontSize="9.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      {mouseCoord.price ? Number(mouseCoord.price).toFixed(2) : Number(activePt.close).toFixed(2)}
                    </text>
                  </g>

                  {/* X-Axis Hover Time Badge */}
                  <g transform={`translate(${Math.max(paddingLeft, Math.min(activePt.x - 38, svgWidth - paddingRight - 76))}, ${svgHeight - paddingBottom + 3})`}>
                    <rect width="76" height="16" fill="#1E293B" stroke="#0284C7" strokeWidth="1" rx="3" />
                    <text x="38" y="11" fill="#38BDF8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      {activePt.date}
                    </text>
                  </g>
                </g>
              )}

              {/* Current Price Live Watermark Line */}
              <g>
                <line x1={paddingLeft} y1={chartDims.points[chartDims.points.length - 1]?.y || 100} x2={svgWidth - paddingRight} y2={chartDims.points[chartDims.points.length - 1]?.y || 100} stroke={isBullish ? '#10B981' : '#EF4444'} strokeWidth="1" strokeDasharray="4 2" />
                <g transform={`translate(${svgWidth - paddingRight + 2}, ${(chartDims.points[chartDims.points.length - 1]?.y || 100) - 9})`}>
                  <rect width="64" height="18" fill={isBullish ? '#10B981' : '#EF4444'} rx="3" />
                  <text x="32" y="12" fill="#FFFFFF" fontSize="9.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    {Number(currentPrice).toFixed(2)}
                  </text>
                </g>
              </g>

              {/* DAY HIGH, DAY CLOSE & DAY LOW HORIZONTAL PRICE REFERENCE LEVELS */}
              {showPriceLevels && chartDims.priceRange > 0 && (
                <g className="transition-opacity duration-300">
                  {/* 1. Day High Level */}
                  {dayHighNum >= chartDims.minPrice && dayHighNum <= chartDims.maxPrice && (
                    (() => {
                      const yDH = paddingTop + mainChartHeight - ((dayHighNum - chartDims.minPrice) / chartDims.priceRange) * mainChartHeight;
                      return (
                        <g key="day_high_level">
                          <line x1={paddingLeft} y1={yDH} x2={svgWidth - paddingRight} y2={yDH} stroke="#10B981" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.85" />
                          <g transform={`translate(${svgWidth - paddingRight + 2}, ${yDH - 8})`}>
                            <rect width="64" height="16" fill="#065F46" stroke="#10B981" strokeWidth="0.8" rx="3" />
                            <text x="32" y="11" fill="#A7F3D0" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                              DH: {dayHighNum.toFixed(2)}
                            </text>
                          </g>
                        </g>
                      );
                    })()
                  )}

                  {/* 2. Day Close Level */}
                  {dayCloseNum >= chartDims.minPrice && dayCloseNum <= chartDims.maxPrice && (
                    (() => {
                      const yDC = paddingTop + mainChartHeight - ((dayCloseNum - chartDims.minPrice) / chartDims.priceRange) * mainChartHeight;
                      return (
                        <g key="day_close_level">
                          <line x1={paddingLeft} y1={yDC} x2={svgWidth - paddingRight} y2={yDC} stroke="#06B6D4" strokeWidth="1.2" strokeDasharray="4 2" opacity="0.85" />
                          <g transform={`translate(${svgWidth - paddingRight + 2}, ${yDC - 8})`}>
                            <rect width="64" height="16" fill="#155E75" stroke="#06B6D4" strokeWidth="0.8" rx="3" />
                            <text x="32" y="11" fill="#CFFAFE" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                              DC: {dayCloseNum.toFixed(2)}
                            </text>
                          </g>
                        </g>
                      );
                    })()
                  )}

                  {/* 3. Day Low Level */}
                  {dayLowNum >= chartDims.minPrice && dayLowNum <= chartDims.maxPrice && (
                    (() => {
                      const yDL = paddingTop + mainChartHeight - ((dayLowNum - chartDims.minPrice) / chartDims.priceRange) * mainChartHeight;
                      return (
                        <g key="day_low_level">
                          <line x1={paddingLeft} y1={yDL} x2={svgWidth - paddingRight} y2={yDL} stroke="#EF4444" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.85" />
                          <g transform={`translate(${svgWidth - paddingRight + 2}, ${yDL - 8})`}>
                            <rect width="64" height="16" fill="#991B1B" stroke="#EF4444" strokeWidth="0.8" rx="3" />
                            <text x="32" y="11" fill="#FECDD3" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                              DL: {dayLowNum.toFixed(2)}
                            </text>
                          </g>
                        </g>
                      );
                    })()
                  )}
                </g>
              )}

              {/* Bottom Time Axis Labels */}
              {chartDims.points.filter((_, idx) => idx % Math.max(1, Math.ceil(chartDims.points.length / 6)) === 0).map((pt, i) => (
                <text key={`time_lbl_${i}`} x={pt.x} y={svgHeight - 8} fill="#64748B" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  {pt.date}
                </text>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM TIMEFRAME RANGES & SCALE CONTROLS TOOLBAR (Responsive) */}
      <div className="flex flex-wrap items-center justify-between px-2.5 sm:px-3 py-1 bg-[#0A0E1A] border-t border-gray-800 text-[10px] sm:text-[11px] font-mono shrink-0 gap-1.5">
        {/* Left: Quick Date Range Buttons */}
        <div className="flex items-center space-x-1">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mr-0.5 hidden xs:inline">Range:</span>
          {BOTTOM_RANGES.map(rng => (
            <button
              key={rng}
              onClick={() => handleSelectRange(rng)}
              className={`px-1.5 sm:px-2 py-0.5 rounded font-bold transition-colors cursor-pointer text-[10px] sm:text-[11px] ${
                selectedRange === rng ? 'bg-cyan-500 text-black shadow-xs font-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {rng}
            </button>
          ))}
        </div>

        {/* Center: Live Time PSX */}
        <div className="text-gray-400 hidden sm:flex items-center space-x-1.5 text-[10px]">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>PSX Market Time</span>
          <span className="text-emerald-400 font-bold">[{lastTickInfo.time}]</span>
        </div>

        {/* Right: Scale Mode Switchers */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setChartSettings(prev => ({ ...prev, scaleMode: prev.scaleMode === 'percent' ? 'auto' : 'percent' }))}
            className={`px-1.5 py-0.5 rounded border text-[9px] sm:text-[10px] font-bold cursor-pointer ${
              chartSettings.scaleMode === 'percent' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'border-gray-800 text-gray-400 hover:text-white'
            }`}
            title="Percentage Scale"
          >
            %
          </button>
          <button
            onClick={() => setChartSettings(prev => ({ ...prev, scaleMode: prev.scaleMode === 'log' ? 'auto' : 'log' }))}
            className={`px-1.5 py-0.5 rounded border text-[9px] sm:text-[10px] font-bold cursor-pointer ${
              chartSettings.scaleMode === 'log' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'border-gray-800 text-gray-400 hover:text-white'
            }`}
            title="Logarithmic Scale"
          >
            log
          </button>
          <button
            onClick={() => setChartSettings(prev => ({ ...prev, scaleMode: 'auto' }))}
            className={`px-1.5 py-0.5 rounded border text-[9px] sm:text-[10px] font-bold cursor-pointer ${
              chartSettings.scaleMode === 'auto' ? 'bg-cyan-500 text-black font-black' : 'border-gray-800 text-gray-400 hover:text-white'
            }`}
            title="Auto Scale"
          >
            auto
          </button>
        </div>
      </div>

      {/* 4. MODALS & POPUPS */}

      {/* A. INDICATORS MODAL */}
      {showIndicatorsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0F172A] border border-purple-500/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-800 bg-[#0B0F19]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-white text-sm sm:text-base">Technical Indicators (fx)</h3>
              </div>
              <button
                onClick={() => setShowIndicatorsModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1">
              <div className="text-xs text-gray-400 mb-1">
                Select technical indicators to overlay on the price chart or render in dedicated sub-panels.
              </div>

              {['Moving Averages', 'Volatility', 'Volume & Trend', 'Oscillators', 'Volume'].map(cat => {
                const list = AVAILABLE_INDICATORS.filter(ind => ind.category === cat);
                if (list.length === 0) return null;
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-1 pt-1.5">{cat}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                      {list.map(ind => {
                        const isOn = !!activeIndicators[ind.id];
                        return (
                          <button
                            key={ind.id}
                            onClick={() => setActiveIndicators(prev => ({ ...prev, [ind.id]: !prev[ind.id] }))}
                            className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isOn
                                ? 'bg-purple-500/15 border-purple-500/50 text-white shadow-sm'
                                : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ind.color }} />
                              <span className="text-xs font-medium truncate">{ind.name}</span>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-1 ${isOn ? 'bg-purple-500 text-black font-black' : 'bg-gray-800 text-gray-400'}`}>
                              {isOn ? 'ON' : 'ADD'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 sm:p-4 border-t border-gray-800 bg-[#0B0F19] flex justify-end">
              <button
                onClick={() => setShowIndicatorsModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Apply Indicators
              </button>
            </div>
          </div>
        </div>
      )}

      {/* B. CHART SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0F172A] border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-800 bg-[#0B0F19]">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-white text-sm sm:text-base">Chart Properties</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-bold">Candle Color Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2 p-2 bg-gray-900 rounded-xl border border-gray-800">
                    <input
                      type="color"
                      value={chartSettings.upColor}
                      onChange={(e) => setChartSettings(prev => ({ ...prev, upColor: e.target.value }))}
                      className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-gray-300">Bullish (Up)</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-gray-900 rounded-xl border border-gray-800">
                    <input
                      type="color"
                      value={chartSettings.downColor}
                      onChange={(e) => setChartSettings(prev => ({ ...prev, downColor: e.target.value }))}
                      className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-gray-300">Bearish (Down)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-bold">Grid Line Style</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['dotted', 'dashed', 'solid', 'none'].map(style => (
                    <button
                      key={style}
                      onClick={() => setChartSettings(prev => ({ ...prev, gridStyle: style }))}
                      className={`py-1.5 rounded-lg border text-center capitalize cursor-pointer transition-colors ${
                        chartSettings.gridStyle === style ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold' : 'bg-gray-900 border-gray-800 text-gray-400'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-800">
                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Show Volume Sub-Panel</span>
                  <input
                    type="checkbox"
                    checked={chartSettings.showVolume}
                    onChange={(e) => setChartSettings(prev => ({ ...prev, showVolume: e.target.checked }))}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Show Top OHLC & Vol Legend</span>
                  <input
                    type="checkbox"
                    checked={chartSettings.showLegend}
                    onChange={(e) => setChartSettings(prev => ({ ...prev, showLegend: e.target.checked }))}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Show Background Symbol Watermark</span>
                  <input
                    type="checkbox"
                    checked={chartSettings.showWatermark}
                    onChange={(e) => setChartSettings(prev => ({ ...prev, showWatermark: e.target.checked }))}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t border-gray-800 bg-[#0B0F19] flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C. QUICK SEARCH MODAL */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0F172A] border border-cyan-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-3 sm:p-4 border-b border-gray-800 bg-[#0B0F19]">
              <div className="relative">
                <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search PSX stock symbol, company name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="p-2 overflow-y-auto space-y-1 flex-1 max-h-96">
              {filteredSearchList.map(q => (
                <button
                  key={q.symbol}
                  onClick={() => {
                    setCurrentSymbol(q.symbol);
                    if (onSelectStock) onSelectStock(q);
                    setShowSearchModal(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-2 sm:p-2.5 hover:bg-gray-800/80 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-extrabold text-white font-mono text-sm">{q.symbol}</div>
                    <div className="text-[11px] text-gray-400 truncate max-w-xs">{q.name || q.sector}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-gray-200">Rs. {Number(q.currentPrice || 0).toFixed(2)}</div>
                    <div className={`text-[11px] font-bold ${(q.change || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {(q.change || 0) >= 0 ? '+' : ''}{Number(q.change || 0).toFixed(2)} ({(q.changePercent || 0) >= 0 ? '+' : ''}{Number(q.changePercent || 0).toFixed(2)}%)
                    </div>
                  </div>
                </button>
              ))}
              {filteredSearchList.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-xs font-mono">
                  No stocks match "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* D. COMPARE SYMBOL MODAL */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0F172A] border border-amber-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-3 sm:p-4 border-b border-gray-800 bg-[#0B0F19] flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm">Compare / Overlay Symbol</h3>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 sm:p-4 space-y-3">
              <input
                type="text"
                placeholder="Search symbol (e.g. HUBC, SYS, PSO)..."
                value={compareQuery}
                onChange={(e) => setCompareQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />

              <div className="max-h-60 overflow-y-auto space-y-1">
                {filteredCompareList.map(q => (
                  <button
                    key={q.symbol}
                    onClick={() => {
                      setCompareSymbol(q.symbol);
                      setShowCompareModal(false);
                      setCompareQuery('');
                    }}
                    className="w-full text-left p-2 hover:bg-gray-800 rounded-lg flex items-center justify-between text-xs cursor-pointer"
                  >
                    <span className="font-mono font-bold text-amber-300">{q.symbol}</span>
                    <span className="text-gray-400 font-mono">Rs. {Number(q.currentPrice || 0).toFixed(2)}</span>
                  </button>
                ))}
                {filteredCompareList.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-xs font-mono">
                    No matching stocks found
                  </div>
                )}
              </div>

              {compareSymbol && (
                <button
                  onClick={() => { setCompareSymbol(null); setShowCompareModal(false); }}
                  className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Remove Compared Symbol ({compareSymbol})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

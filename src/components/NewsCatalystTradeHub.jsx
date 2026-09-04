import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Radio,
  Sparkles,
  Target,
  ShieldCheck,
  AlertTriangle,
  X,
  Compass,
  Activity,
  BarChart2,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Search,
  Building2,
  Newspaper,
  Scale,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import officialQuotes from '../data/official_quotes.json';
import { getPSXMarketSessionInfo } from './DailyRecommendations';

// Comprehensive Stock Beta, Volatility & Swing Target Profiles
const STOCK_VOLATILITY_PROFILES = {
  // Refineries & High Beta
  'PRL': { gainBase: 16.4, stopLossPct: 5.8, beta: 1.45 },
  'CNERGY': { gainBase: 19.5, stopLossPct: 6.5, beta: 1.60 },
  'ATRL': { gainBase: 14.8, stopLossPct: 5.2, beta: 1.35 },
  'NRL': { gainBase: 15.2, stopLossPct: 5.4, beta: 1.38 },
  // Technology & Telecom
  'SYS': { gainBase: 13.2, stopLossPct: 4.5, beta: 1.20 },
  'NETSOL': { gainBase: 17.5, stopLossPct: 6.0, beta: 1.50 },
  'TRG': { gainBase: 18.2, stopLossPct: 6.2, beta: 1.55 },
  'AVN': { gainBase: 14.5, stopLossPct: 5.0, beta: 1.30 },
  'WTL': { gainBase: 22.0, stopLossPct: 7.5, beta: 1.70 },
  // Oil & Gas Exploration & Marketing
  'OGDC': { gainBase: 11.4, stopLossPct: 3.8, beta: 1.05 },
  'PPL': { gainBase: 12.2, stopLossPct: 4.0, beta: 1.10 },
  'MARI': { gainBase: 9.8, stopLossPct: 3.5, beta: 0.95 },
  'PSO': { gainBase: 13.6, stopLossPct: 4.2, beta: 1.15 },
  'SNGP': { gainBase: 14.2, stopLossPct: 4.8, beta: 1.25 },
  'SSGC': { gainBase: 15.5, stopLossPct: 5.2, beta: 1.30 },
  // Cement & Construction
  'LUCK': { gainBase: 10.8, stopLossPct: 3.8, beta: 1.05 },
  'MLCF': { gainBase: 14.2, stopLossPct: 4.8, beta: 1.25 },
  'DGKC': { gainBase: 15.0, stopLossPct: 5.0, beta: 1.30 },
  'CHCC': { gainBase: 12.8, stopLossPct: 4.5, beta: 1.18 },
  'FCCL': { gainBase: 13.5, stopLossPct: 4.6, beta: 1.22 },
  'PIOC': { gainBase: 13.0, stopLossPct: 4.4, beta: 1.19 },
  // Commercial Banks
  'MEBL': { gainBase: 8.2, stopLossPct: 3.2, beta: 0.85 },
  'MCB': { gainBase: 7.6, stopLossPct: 3.0, beta: 0.80 },
  'UBL': { gainBase: 8.5, stopLossPct: 3.2, beta: 0.88 },
  'BAFL': { gainBase: 9.4, stopLossPct: 3.5, beta: 0.92 },
  'BAHL': { gainBase: 8.8, stopLossPct: 3.3, beta: 0.89 },
  'BOP': { gainBase: 16.0, stopLossPct: 5.5, beta: 1.40 },
  'HBL': { gainBase: 8.9, stopLossPct: 3.4, beta: 0.90 },
  'NBP': { gainBase: 11.2, stopLossPct: 4.0, beta: 1.05 },
  // Fertilizer & Agri-Chemicals
  'FFC': { gainBase: 8.4, stopLossPct: 3.0, beta: 0.82 },
  'EFERT': { gainBase: 9.2, stopLossPct: 3.2, beta: 0.85 },
  'ENGRO': { gainBase: 9.6, stopLossPct: 3.5, beta: 0.90 },
  'FATIMA': { gainBase: 10.8, stopLossPct: 3.8, beta: 0.95 },
  'FFBL': { gainBase: 13.8, stopLossPct: 4.6, beta: 1.22 },
  // Automobile & Transport
  'SAZEW': { gainBase: 16.8, stopLossPct: 5.2, beta: 1.42 },
  'INDU': { gainBase: 9.8, stopLossPct: 3.6, beta: 0.92 },
  'MTL': { gainBase: 10.5, stopLossPct: 3.8, beta: 0.95 },
  'HCAR': { gainBase: 14.2, stopLossPct: 4.8, beta: 1.25 },
  'AGTL': { gainBase: 11.5, stopLossPct: 4.0, beta: 1.00 },
  // Power Generation & Distribution
  'HUBC': { gainBase: 8.5, stopLossPct: 3.0, beta: 0.85 },
  'KAPCO': { gainBase: 9.0, stopLossPct: 3.2, beta: 0.88 },
  'KEL': { gainBase: 18.5, stopLossPct: 6.0, beta: 1.50 },
  'NCPL': { gainBase: 11.0, stopLossPct: 3.8, beta: 0.95 },
  // Steel & Engineering
  'MUGHAL': { gainBase: 13.8, stopLossPct: 4.6, beta: 1.20 },
  'ISL': { gainBase: 13.2, stopLossPct: 4.5, beta: 1.18 },
  'ASTL': { gainBase: 15.5, stopLossPct: 5.2, beta: 1.35 },
  // Pharmaceuticals
  'SEARL': { gainBase: 12.0, stopLossPct: 4.0, beta: 1.05 },
  'AGP': { gainBase: 10.8, stopLossPct: 3.8, beta: 0.98 },
  // Textiles
  'ILP': { gainBase: 11.2, stopLossPct: 3.8, beta: 1.05 },
  'NML': { gainBase: 12.0, stopLossPct: 4.0, beta: 1.10 }
};

// Global Deterministic News Sentiment Classifier (Guarantees 100% Consistent Polarities)
export const evaluateArticleSentiment = (title = '', desc = '') => {
  const text = (title + ' ' + (desc || '')).toLowerCase();

  const negativeKeywords = [
    'drop', 'fall', 'slump', 'plunge', 'tumble', 'loss', 'decline', 'deficit', 'crash',
    'tax hike', 'levy hike', 'tariff hike', 'cost jump', 'shutdown', 'penalty', 'fine',
    'dispute', 'debt crisis', 'circular debt', 'default', 'curb', 'ban', 'stagnant',
    'bearish', 'headwind', 'inflation jumps', 'inflation rises', 'warning', 'downside',
    'probe', 'fraud', 'investigation', 'scam'
  ];

  const positiveKeywords = [
    'surge', 'jump', 'rise', 'gain', 'profit', 'dividend', 'growth', 'upgrade', 'rally',
    'cut rate', 'rate cut', 'rate drops', 'drops to', 'inflation drops', 'inflation falls',
    'soars', 'record', 'high', 'boost', 'expansion', 'recovery', 'surplus', 'rebound', 'bullish',
    'deal', 'agreement', 'incentive', 'tax relief', 'subsidy', 'approved', 'imf approval', 'inflow',
    'reserves rise', 'exports rise', 'sales rise', 'demand accelerates', 'holds above', 'help transform',
    'modernization', 'package', 'tenders', 'contracts', 'order'
  ];

  let negScore = 0;
  let posScore = 0;

  negativeKeywords.forEach(kw => {
    if (text.includes(kw)) negScore += 1;
  });

  positiveKeywords.forEach(kw => {
    if (text.includes(kw)) posScore += 1;
  });

  if (negScore > posScore) return 'NEGATIVE';
  if (posScore > negScore) return 'POSITIVE';
  return 'POSITIVE'; // Default constructive bias
};

// Filter out non-financial crime, road accidents & judicial political court news
export const isNonFinancialNews = (title = '', desc = '') => {
  const text = (title + ' ' + (desc || '')).toLowerCase();
  const nonFinancialKeywords = [
    'mir raza', 'judicial commission', 'taxi driver', 'statements of business partner',
    'murder', 'robbery', 'killed', 'arrested', 'police encounter', 'smuggling bid foiled',
    'dead in road accident', 'scooty', 'gunpoint', 'firing', 'bail plea', 'court rejects',
    'kidnapped', 'dacoits', 'extortion', 'rape', 'dead body', 'injured in', 'terrorist'
  ];
  return nonFinancialKeywords.some(kw => text.includes(kw));
};

export default function NewsCatalystTradeHub({ 
  news = [], 
  newsList = [], 
  stocks = [], 
  onSelectStock, 
  onOpenCalculator 
}) {
  const [viewMode, setViewMode] = useState('NET_STOCK_VIEW'); // 'NET_STOCK_VIEW' | 'LIVE_NEWS_STREAM'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState('ALL');
  const [predictionModalData, setPredictionModalData] = useState(null);

  const marketSession = useMemo(() => getPSXMarketSessionInfo(), []);

  // Filter out any non-financial articles from the news feed
  const cleanNewsList = useMemo(() => {
    const raw = Array.isArray(news) && news.length > 0 
      ? news 
      : (Array.isArray(newsList) ? newsList : []);

    return raw.filter(item => !isNonFinancialNews(item.title, item.impactSummary || item.description));
  }, [news, newsList]);

  // Helper to dynamically calculate stock-specific trade setup & price targets
  const getLiveQuote = (symbol, fallbackPrice = 100, fallbackName = '', positiveCount = 1, negativeCount = 0) => {
    const sym = (symbol || '').toUpperCase().trim();
    const foundStock = Array.isArray(stocks) ? stocks.find(s => s.symbol?.toUpperCase() === sym) : null;
    const foundOfficial = officialQuotes ? officialQuotes[sym] : null;

    const currentPrice = Number(
      foundStock?.currentPrice || 
      foundOfficial?.currentPrice || 
      fallbackPrice || 
      100
    );

    const prevClose = Number(
      foundStock?.prevClose || 
      foundOfficial?.prevClose || 
      (currentPrice * 0.99)
    );

    const change = foundStock?.change !== undefined 
      ? Number(foundStock.change) 
      : (foundOfficial?.change !== undefined 
          ? Number(foundOfficial.change) 
          : Number((currentPrice - prevClose).toFixed(2)));

    const changePercent = foundStock?.changePercent !== undefined 
      ? Number(foundStock.changePercent) 
      : (foundOfficial?.changePercent !== undefined 
          ? Number(foundOfficial.changePercent) 
          : (prevClose > 0 ? Number((((currentPrice - prevClose) / prevClose) * 100).toFixed(2)) : 0));

    const name = foundStock?.name || foundOfficial?.name || fallbackName || sym;
    const sector = foundStock?.sector || foundOfficial?.sector || 'General Market';

    // Compute Dynamic Volatility Target
    const profile = STOCK_VOLATILITY_PROFILES[sym] || {
      gainBase: 12.5,
      stopLossPct: 4.5,
      beta: 1.15
    };

    // Boost target based on net positive catalyst momentum
    const netDiff = positiveCount - negativeCount;
    const catalystMultiplier = 1 + Math.max(-0.15, Math.min(0.25, netDiff * 0.04));
    const expectedGainPct = Number((profile.gainBase * catalystMultiplier).toFixed(1));
    const stopLossPct = Number(profile.stopLossPct.toFixed(1));

    const targetSellPrice = Number((currentPrice * (1 + expectedGainPct / 100)).toFixed(2));
    const stopLoss = Number((currentPrice * (1 - stopLossPct / 100)).toFixed(2));
    const entryPriceMin = Number((currentPrice * (1 - (stopLossPct * 0.35) / 100)).toFixed(2));
    const entryPriceMax = Number((currentPrice * 1.008).toFixed(2));

    return {
      symbol: sym,
      name,
      sector,
      currentPrice,
      prevClose,
      change,
      changePercent,
      targetSellPrice,
      stopLoss,
      entryPriceMin,
      entryPriceMax,
      expectedGainPct,
      stopLossPct
    };
  };

  const categories = [
    { id: 'ALL', label: 'All Sectors' },
    { id: 'OIL_GAS', label: 'Oil & Gas / Refineries' },
    { id: 'COMMERCIAL_BANKS', label: 'Commercial Banks' },
    { id: 'TECHNOLOGY', label: 'Tech & Telecom' },
    { id: 'CEMENT', label: 'Cement & Construction' },
    { id: 'FERTILIZER', label: 'Fertilizer' },
    { id: 'AUTOMOBILE', label: 'Automobile' },
    { id: 'POWER_ENERGY', label: 'Power & Energy' },
    { id: 'PHARMACEUTICALS', label: 'Pharma' },
    { id: 'STEEL_ENGINEERING', label: 'Steel & Engineering' },
    { id: 'TEXTILE', label: 'Textiles' },
    { id: 'SUGAR_FOOD', label: 'Sugar & Food' },
    { id: 'MACRO_ECONOMY', label: 'Macro Economy' }
  ];

  const getCleanImpactSummary = (item) => {
    const raw = item?.impactSummary || item?.description || '';
    const clean = String(raw)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/if\s*\(!window[\s\S]*$/gi, '')
      .replace(/window\.addEvent[\s\S]*$/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    const isGarbage = 
      clean.includes('window.') ||
      clean.includes('addEventListener') ||
      clean.includes('function(') ||
      clean.includes('var iframe') ||
      clean.includes('raw-html') ||
      clean.includes('_rawHtml') ||
      clean.includes('document.g') ||
      clean.length < 15;

    if (isGarbage) {
      const catLabel = item?.categoryName || item?.category?.replace('_', ' ') || 'Energy & Macro';
      return `${catLabel} catalyst: ${item?.title || 'Industry development'}. Market dynamics indicate strategic re-pricing and liquidity inflows across key listed equities.`;
    }

    return clean;
  };

  const formatLiveNewsDate = (item) => {
    const pubDate = item?.publishedAt ? new Date(item.publishedAt) : new Date();
    const validDate = isNaN(pubDate.getTime()) ? new Date() : pubDate;
    
    const now = new Date();
    const diffSec = Math.floor((now - validDate) / 1000);
    
    let agoStr = 'Just now';
    if (diffSec >= 60 && diffSec < 3600) {
      agoStr = `${Math.floor(diffSec / 60)}m ago`;
    } else if (diffSec >= 3600 && diffSec < 86400) {
      const hrs = Math.floor(diffSec / 3600);
      agoStr = `${hrs}h ago`;
    } else if (diffSec >= 86400) {
      const days = Math.floor(diffSec / 86400);
      agoStr = `${days}d ago`;
    }

    const timeStr = validDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const isSameDay = validDate.toDateString() === now.toDateString();
    const dateLabel = isSameDay ? 'Today' : validDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      isSameDay,
      label: `${dateLabel} • ${timeStr}`,
      ago: item?.timeAgo || agoStr
    };
  };

  // =========================================================================
  // MULTI-NEWS AGGREGATION ENGINE: Synthesizes all news per stock symbol
  // =========================================================================
  const consolidatedStocksData = useMemo(() => {
    const stockNewsMap = new Map();

    const ensureStock = (sym, fallbackName, cat) => {
      const upper = (sym || '').toUpperCase().trim();
      if (!upper) return null;
      if (!stockNewsMap.has(upper)) {
        stockNewsMap.set(upper, {
          symbol: upper,
          name: fallbackName || sym,
          category: cat || 'GENERAL',
          newsItems: []
        });
      }
      return stockNewsMap.get(upper);
    };

    const knownTickers = [
      { sym: 'PRL', name: 'Pakistan Refinery Limited', keywords: ['prl', 'pakistan refinery', 'refinery', 'crude oil'] },
      { sym: 'OGDC', name: 'Oil & Gas Development Co', keywords: ['ogdc', 'oil & gas development'] },
      { sym: 'PPL', name: 'Pakistan Petroleum Limited', keywords: ['ppl', 'pakistan petroleum'] },
      { sym: 'LUCK', name: 'Lucky Cement Limited', keywords: ['luck', 'lucky cement'] },
      { sym: 'MEBL', name: 'Meezan Bank Limited', keywords: ['mebl', 'meezan'] },
      { sym: 'SYS', name: 'Systems Limited', keywords: ['sys', 'systems limited', 'it export'] },
      { sym: 'PSO', name: 'Pakistan State Oil', keywords: ['pso', 'pakistan state oil', 'petroleum'] },
      { sym: 'HUBC', name: 'The Hub Power Company', keywords: ['hubc', 'hubco', 'power'] },
      { sym: 'INDU', name: 'Indus Motor Company', keywords: ['indu', 'toyota', 'indus motor'] },
      { sym: 'FFC', name: 'Fauji Fertilizer Company', keywords: ['ffc', 'fauji fertilizer', 'urea'] },
      { sym: 'DGKC', name: 'D.G. Khan Cement', keywords: ['dgkc', 'd.g. khan cement'] },
      { sym: 'CNERGY', name: 'Cynergico PK Limited', keywords: ['cnergy', 'cynergico'] },
      { sym: 'ATRL', name: 'Attock Refinery Limited', keywords: ['atrl', 'attock refinery'] }
    ];

    // 1. Ingest all clean news items into stock groupings with GUARANTEED CONSISTENT SENTIMENT
    cleanNewsList.forEach((newsItem, nIdx) => {
      // Single global sentiment evaluated for this exact news article:
      const articlePolarity = evaluateArticleSentiment(newsItem.title, newsItem.impactSummary || newsItem.description);
      const tagLabel = articlePolarity === 'POSITIVE' ? '(Positive)' : '(Negative)';

      const impactedStockSymbols = new Set();

      // Collect stocks directly mentioned or related to this news:
      (newsItem.upStocks || []).forEach(s => s?.symbol && impactedStockSymbols.add(s.symbol.toUpperCase().trim()));
      (newsItem.downStocks || []).forEach(s => s?.symbol && impactedStockSymbols.add(s.symbol.toUpperCase().trim()));
      (newsItem.tradeSuggestions || []).forEach(s => s?.symbol && impactedStockSymbols.add(s.symbol.toUpperCase().trim()));

      const lowerTitle = (newsItem.title || '').toLowerCase();
      knownTickers.forEach(t => {
        if (t.keywords.some(k => lowerTitle.includes(k))) {
          impactedStockSymbols.add(t.sym);
        }
      });

      // Add to each impacted stock with the EXACT same articlePolarity
      impactedStockSymbols.forEach(sym => {
        const entry = ensureStock(sym, sym, newsItem.category);
        if (entry && !entry.newsItems.some(n => n.title === newsItem.title)) {
          entry.newsItems.push({
            id: `news_${nIdx}`,
            title: newsItem.title,
            source: newsItem.source || 'Business Bureau',
            timeAgo: newsItem.timeAgo || 'Recent',
            polarity: articlePolarity,
            tagLabel: tagLabel,
            tradeReason: articlePolarity === 'POSITIVE' 
              ? `Positive market driver: ${newsItem.title}` 
              : `Adverse headwind: ${newsItem.title}`
          });
        }
      });
    });

    // 2. Synthesize each stock's dynamic price targets & net verdict
    const results = [];
    stockNewsMap.forEach((data, sym) => {
      const positiveCount = data.newsItems.filter(n => n.polarity === 'POSITIVE').length;
      const negativeCount = data.newsItems.filter(n => n.polarity === 'NEGATIVE').length;
      const totalCount = data.newsItems.length;

      // Extract dynamic stock-specific price targets based on volatility & catalyst balance
      const quote = getLiveQuote(sym, 100, data.name, positiveCount, negativeCount);

      let netSentiment = 'BALANCED';
      let netVerdict = 'Balanced / Mixed Catalysts';
      let action = 'HOLD_MONITOR';
      let direction = 'NEUTRAL';
      let badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      let confidence = 75;
      let primaryReason = '';

      if (positiveCount > negativeCount) {
        netSentiment = 'POSITIVE';
        netVerdict = `🟢 Net Bullish Setup (${positiveCount} Positive vs ${negativeCount} Negative News)`;
        action = 'BUY_ON_DIP';
        direction = 'UP';
        badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        confidence = Math.min(95, 80 + (positiveCount - negativeCount) * 5);
        primaryReason = `Strong positive catalyst balance: ${positiveCount} favorable market drivers outweighing ${negativeCount} headwinds. Target PKR ${quote.targetSellPrice} (+${quote.expectedGainPct}%) projected for upcoming session.`;
      } else if (negativeCount > positiveCount) {
        netSentiment = 'NEGATIVE';
        netVerdict = `🔴 Net Downside Risk (${negativeCount} Negative vs ${positiveCount} Positive News)`;
        action = 'SELL_EXIT';
        direction = 'DOWN';
        badgeClass = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
        confidence = Math.min(95, 78 + (negativeCount - positiveCount) * 5);
        primaryReason = `Negative catalyst drag: ${negativeCount} adverse news developments outweighing positive factors. Caution and protective stop loss at PKR ${quote.stopLoss} advised.`;
      } else {
        netSentiment = 'BALANCED';
        netVerdict = `⚖️ Balanced / Mixed Impact (${positiveCount} Positive & ${negativeCount} Negative News)`;
        action = 'HOLD_MONITOR';
        direction = 'NEUTRAL';
        badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        confidence = 72;
        primaryReason = `Conflicting catalysts present (${positiveCount} bullish vs ${negativeCount} bearish). Technical range resistance at PKR ${quote.targetSellPrice}.`;
      }

      results.push({
        ...data,
        name: quote.name,
        sector: quote.sector,
        currentPrice: quote.currentPrice,
        prevClose: quote.prevClose,
        change: quote.change,
        changePercent: quote.changePercent,
        targetSellPrice: quote.targetSellPrice,
        stopLoss: quote.stopLoss,
        entryPriceMin: quote.entryPriceMin,
        entryPriceMax: quote.entryPriceMax,
        expectedGainPct: quote.expectedGainPct,
        positiveCount,
        negativeCount,
        totalCount,
        netSentiment,
        netVerdict,
        action,
        direction,
        badgeClass,
        confidence,
        primaryReason
      });
    });

    return results.sort((a, b) => b.totalCount - a.totalCount || b.confidence - a.confidence);
  }, [cleanNewsList, stocks]);

  // Filter Consolidated Stocks by Category, Sentiment, and Search Query
  const filteredStocks = useMemo(() => {
    return consolidatedStocksData.filter(item => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (selectedSentiment === 'POSITIVE' && item.netSentiment !== 'POSITIVE') return false;
      if (selectedSentiment === 'NEGATIVE' && item.netSentiment !== 'NEGATIVE') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const symMatch = item.symbol.toLowerCase().includes(q);
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const sectorMatch = (item.sector || '').toLowerCase().includes(q);
        const newsMatch = item.newsItems.some(n => n.title.toLowerCase().includes(q));
        if (!symMatch && !nameMatch && !sectorMatch && !newsMatch) return false;
      }

      return true;
    });
  }, [consolidatedStocksData, selectedCategory, selectedSentiment, searchQuery]);

  // Filter Chronological News Feed
  const filteredNewsFeed = useMemo(() => {
    return cleanNewsList.filter(n => {
      const globalPol = evaluateArticleSentiment(n.title, n.impactSummary || n.description);
      const matchCategory = selectedCategory === 'ALL' || n.category === selectedCategory;
      const matchSentiment = selectedSentiment === 'ALL' || globalPol === selectedSentiment;
      
      let matchSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (n.title || '').toLowerCase().includes(q);
        const descMatch = (n.impactSummary || n.description || '').toLowerCase().includes(q);
        const stockMatch = (n.upStocks || []).some(s => (s.symbol || '').toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q)) ||
                           (n.downStocks || []).some(s => (s.symbol || '').toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q));
        matchSearch = titleMatch || descMatch || stockMatch;
      }

      return matchCategory && matchSentiment && matchSearch;
    });
  }, [cleanNewsList, selectedCategory, selectedSentiment, searchQuery]);

  return (
    <div className="space-y-5">
      {/* 1. Header & Controls Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-4 sm:p-6 shadow-sm dark:shadow-md transition-all">
        {/* Top Session & Weekend Date Banner */}
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
            <span className="text-[#64748B] dark:text-[#94A3B8]">Target Session:</span>
            <b className="text-[#0F172A] dark:text-[#F8FAFC]">{marketSession.sessionDateFormatted}</b>
          </div>
        </div>

        {/* Title & View Switcher Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 border border-[#2563EB]/20 dark:border-[#3B82F6]/20 text-[#2563EB] dark:text-[#3B82F6] shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                  Real-Time News Catalysts & Multi-News Stock Synthesis Hub
                </h2>
                <span className="flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#22C55E]/10 dark:text-[#22C55E] border border-[#16A34A]/20 dark:border-[#22C55E]/20">
                  <Radio className="w-3 h-3 mr-1 animate-pulse" /> LIVE STREAM
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Aggregates all concurrent financial news into a <b>single unified net signal per stock</b> with 100% consistent catalyst sentiment.
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1.5 bg-[#F8FAFC] dark:bg-[#0B0F19] p-1 rounded-lg border border-[#E2E8F0] dark:border-[#243044] text-xs shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('NET_STOCK_VIEW')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'NET_STOCK_VIEW'
                  ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Stock-Wise Net Intel ({consolidatedStocksData.length})</span>
            </button>
            <button
              onClick={() => setViewMode('LIVE_NEWS_STREAM')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'LIVE_NEWS_STREAM'
                  ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Financial News Feed ({cleanNewsList.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Quick Ticker Selection Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-[#E2E8F0] dark:border-[#243044]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stock symbol or news (e.g. PRL, OGDC, LUCK, CEMENT)..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Popular Ticker Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-bold shrink-0 mr-1">
              Quick Find:
            </span>
            {['PRL', 'OGDC', 'PPL', 'LUCK', 'MEBL', 'SYS', 'PSO', 'HUBC', 'INDU', 'FFC', 'DGKC', 'CNERGY', 'ATRL'].map(sym => (
              <button
                key={sym}
                onClick={() => setSearchQuery(searchQuery.toUpperCase() === sym ? '' : sym)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold shrink-0 transition-all cursor-pointer border ${
                  searchQuery.toUpperCase() === sym 
                    ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white border-transparent shadow-sm' 
                    : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#2563EB] border-[#E2E8F0] dark:border-[#243044]'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Sector & Sentiment Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#243044]">
          {/* Sector Category Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs flex-1">
            <span className="text-[#64748B] dark:text-[#94A3B8] font-bold flex items-center shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5 mr-1 text-[#2563EB] dark:text-[#3B82F6]" /> Sector:
            </span>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat.id 
                    ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm' 
                    : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sentiment Filter Toggle */}
          <div className="flex items-center space-x-1.5 bg-[#F8FAFC] dark:bg-[#0B0F19] p-1 rounded-lg border border-[#E2E8F0] dark:border-[#243044] text-xs shrink-0 self-start md:self-auto">
            <button
              onClick={() => setSelectedSentiment('ALL')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                selectedSentiment === 'ALL' 
                  ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white' 
                  : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedSentiment('POSITIVE')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                selectedSentiment === 'POSITIVE' 
                  ? 'bg-[#16A34A] dark:bg-[#22C55E] text-white' 
                  : 'text-[#16A34A] dark:text-[#22C55E]'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Bullish</span>
            </button>
            <button
              onClick={() => setSelectedSentiment('NEGATIVE')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                selectedSentiment === 'NEGATIVE' 
                  ? 'bg-[#DC2626] dark:bg-[#EF4444] text-white' 
                  : 'text-[#DC2626] dark:text-[#EF4444]'
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              <span>Bearish</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: CONSOLIDATED COMPANY NET INTELLIGENCE (DEFAULT & RECOMMENDED)*/}
      {/* ========================================================================= */}
      {viewMode === 'NET_STOCK_VIEW' && (
        <div>
          {filteredStocks.length === 0 ? (
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-12 text-center text-[#64748B] dark:text-[#94A3B8]">
              <p className="font-bold text-sm">No stocks found matching "{searchQuery || selectedCategory}".</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setSelectedSentiment('ALL'); }}
                className="mt-3 px-4 py-1.5 rounded-lg bg-[#2563EB] text-white font-bold text-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStocks.map((stockData, sIdx) => {
                const isUp = (stockData.change || 0) >= 0;

                return (
                  <div
                    key={stockData.symbol || sIdx}
                    className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] hover:border-[#2563EB] dark:hover:border-[#3B82F6] rounded-xl p-5 shadow-sm dark:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header: Symbol, Name, Sector, Session Badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <h3 className="text-xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight mono">
                              {stockData.symbol}
                            </h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] font-bold border border-[#E2E8F0] dark:border-[#243044] truncate max-w-[120px]">
                              {stockData.sector}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-bold border shrink-0 ${
                              marketSession.isWeekend || marketSession.isFridayEod
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            }`}>
                              {marketSession.cardDateFormatted}
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate max-w-[200px]" title={stockData.name}>
                            {stockData.name}
                          </p>
                        </div>

                        {/* Net Sentiment Verdict Pill */}
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center shrink-0 border ${stockData.badgeClass}`}>
                          {stockData.netSentiment === 'POSITIVE' ? (
                            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 stroke-[3]" />
                          ) : stockData.netSentiment === 'NEGATIVE' ? (
                            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 stroke-[3]" />
                          ) : (
                            <Scale className="w-3.5 h-3.5 mr-1" />
                          )}
                          <span>{stockData.netSentiment === 'POSITIVE' ? 'BULLISH SETUP' : stockData.netSentiment === 'NEGATIVE' ? 'DOWNSIDE RISK' : 'BALANCED'}</span>
                        </span>
                      </div>

                      {/* Price & Target Matrix Grid */}
                      <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-3 border border-[#E2E8F0] dark:border-[#243044] mb-3">
                        <div className="flex items-baseline justify-between mb-2">
                          <div>
                            <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold">Current Live Price</span>
                            <p className="text-lg font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mono flex items-center">
                              PKR {stockData.currentPrice.toFixed(2)}
                              <span className={`text-[11px] ml-1.5 font-bold ${isUp ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
                                ({isUp ? '+' : ''}{stockData.changePercent}%)
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase text-[#16A34A] dark:text-[#22C55E] font-bold">Target Sell Price</span>
                            <p className="text-sm font-bold text-[#16A34A] dark:text-[#22C55E] mono">
                              PKR {stockData.targetSellPrice.toFixed(2)} (+{stockData.expectedGainPct}%)
                            </p>
                          </div>
                        </div>

                        {/* Trade Setup Limits */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#243044] text-[11px]">
                          <div className="bg-[#FFFFFF] dark:bg-[#151E2E] rounded p-1.5 border border-[#E2E8F0] dark:border-[#243044]">
                            <span className="text-[9px] uppercase text-[#2563EB] dark:text-[#3B82F6] block font-bold">Entry Buy Zone</span>
                            <b className="text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC]">
                              PKR {stockData.entryPriceMin.toFixed(2)} - {stockData.entryPriceMax.toFixed(2)}
                            </b>
                          </div>
                          <div className="bg-[#FFFFFF] dark:bg-[#151E2E] rounded p-1.5 border border-[#E2E8F0] dark:border-[#243044]">
                            <span className="text-[9px] uppercase text-[#DC2626] dark:text-[#EF4444] block font-bold">Protective Stop Loss</span>
                            <b className="text-xs font-mono text-[#DC2626] dark:text-[#EF4444]">
                              PKR {stockData.stopLoss.toFixed(2)}
                            </b>
                          </div>
                        </div>
                      </div>

                      {/* Net Synthesis Explanation */}
                      <p className="text-xs text-[#0F172A] dark:text-[#F8FAFC] leading-tight bg-[#F8FAFC] dark:bg-[#0B0F19] p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#243044] mb-3 font-medium">
                        💡 {stockData.primaryReason}
                      </p>

                      {/* ========================================================================= */}
                      {/* MULTI-NEWS IMPACT CATALYSTS LIST (Explicit Consistent Positive/Negative)   */}
                      {/* ========================================================================= */}
                      <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-3 border border-[#E2E8F0] dark:border-[#243044] mb-3 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center text-[#2563EB] dark:text-[#3B82F6]">
                            <Layers className="w-3.5 h-3.5 mr-1" />
                            Impacting News Catalysts ({stockData.totalCount}):
                          </span>
                          <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                            {stockData.positiveCount > 0 && <b className="text-emerald-600 dark:text-emerald-400 mr-1.5">{stockData.positiveCount} Positive</b>}
                            {stockData.negativeCount > 0 && <b className="text-red-600 dark:text-red-400">{stockData.negativeCount} Negative</b>}
                          </span>
                        </div>

                        {/* List of News Items with guaranteed consistent tags */}
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-0.5">
                          {stockData.newsItems.map((newsItem, nIdx) => {
                            const isPos = newsItem.polarity === 'POSITIVE';
                            return (
                              <div
                                key={nIdx}
                                className="p-2 rounded-md bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0]/70 dark:border-[#243044]/70 flex items-start space-x-2 text-[11px]"
                              >
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black shrink-0 ${
                                  isPos 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                }`}>
                                  {isPos ? '🟢 Positive' : '🔴 Negative'}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold leading-tight line-clamp-2">
                                    {newsItem.title} <span className="font-bold">{newsItem.tagLabel}</span>
                                  </p>
                                  <div className="flex items-center justify-between text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                                    <span>{newsItem.source}</span>
                                    <span>{newsItem.timeAgo}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Matrix */}
                    <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#243044]">
                      <button
                        onClick={() => setPredictionModalData({ 
                          trade: {
                            symbol: stockData.symbol,
                            name: stockData.name,
                            currentPrice: stockData.currentPrice,
                            targetSellPrice: stockData.targetSellPrice,
                            stopLoss: stockData.stopLoss,
                            entryPriceMin: stockData.entryPriceMin,
                            entryPriceMax: stockData.entryPriceMax,
                            expectedGainPct: stockData.expectedGainPct,
                            stopLossPct: stockData.stopLossPct,
                            tradeReason: stockData.primaryReason
                          }, 
                          newsItem: stockData.newsItems[0] || { title: `Synthesized Net Setup for ${stockData.symbol}`, category: stockData.category, source: 'Consolidated AI Engine' }, 
                          isBullish: stockData.netSentiment === 'POSITIVE',
                          multiNews: stockData.newsItems
                        })}
                        className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>AI Next-Day Signal & Prediction</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() => onOpenCalculator({
                            symbol: stockData.symbol,
                            companyName: stockData.name,
                            currentPrice: Number(stockData.currentPrice),
                            stopLoss: Number(stockData.stopLoss),
                            target1: Number(stockData.targetSellPrice),
                            signal: stockData.netSentiment === 'POSITIVE' ? 'BUY_NOW' : 'SELL_EXIT'
                          })}
                          className="py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs shadow-sm cursor-pointer text-center transition-colors"
                        >
                          Order Planner
                        </button>
                        <button
                          onClick={() => onSelectStock(stockData.symbol)}
                          className="py-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#243044] text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs border border-[#E2E8F0] dark:border-[#243044] cursor-pointer text-center transition-colors"
                        >
                          Live Chart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: CHRONOLOGICAL ARTICLE-BY-ARTICLE NEWS FEED STREAM            */}
      {/* ========================================================================= */}
      {viewMode === 'LIVE_NEWS_STREAM' && (
        <div className="space-y-4">
          {filteredNewsFeed.length === 0 ? (
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-12 text-center text-[#64748B] dark:text-[#94A3B8]">
              <p>No financial news matching this filter. Try clearing the search or category filter.</p>
            </div>
          ) : (
            filteredNewsFeed.map((item, idx) => {
              const articlePol = evaluateArticleSentiment(item.title, item.impactSummary || item.description);
              const isPositive = articlePol === 'POSITIVE';
              const upList = item.upStocks || (item.tradeSuggestions ? item.tradeSuggestions.filter(t => t.direction === 'UP' || t.action?.startsWith('BUY')) : []);
              const downList = item.downStocks || (item.tradeSuggestions ? item.tradeSuggestions.filter(t => t.direction === 'DOWN' || t.action === 'SELL_EXIT') : []);

              return (
                <div
                  key={idx}
                  className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-5 shadow-sm dark:shadow-md transition-all space-y-3.5"
                >
                  {/* News Header & Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 border ${
                        isPositive 
                          ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20 dark:bg-[#22C55E]/10 dark:text-[#22C55E] dark:border-[#22C55E]/20' 
                          : 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20 dark:bg-[#EF4444]/10 dark:text-[#EF4444] dark:border-[#EF4444]/20'
                      }`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                        {articlePol} CATALYST
                      </span>

                      <span className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044] font-bold">
                        {item.category?.replace('_', ' ')}
                      </span>

                      <span className="text-[#64748B] dark:text-[#94A3B8]">
                        Source: <b className="text-[#0F172A] dark:text-[#F8FAFC]">{item.source}</b>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] text-[#2563EB] dark:text-[#3B82F6] text-xs font-bold mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatLiveNewsDate(item).label} ({formatLiveNewsDate(item).ago})</span>
                    </div>
                  </div>

                  {/* Headline with Consistent Tagging for Associated Stocks */}
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-snug">
                      {item.title}
                    </h3>
                    
                    {/* Tagged Stock Pills under Headline */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold mr-1">Impacted Stocks:</span>
                      {upList.map((s, i) => (
                        <button
                          key={`up_${i}`}
                          onClick={() => { setSearchQuery(s.symbol); setViewMode('NET_STOCK_VIEW'); }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                            isPositive 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20'
                          }`}
                        >
                          {s.symbol} ({isPositive ? 'Positive' : 'Negative'})
                        </button>
                      ))}
                      {downList.map((s, i) => (
                        <button
                          key={`down_${i}`}
                          onClick={() => { setSearchQuery(s.symbol); setViewMode('NET_STOCK_VIEW'); }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                            isPositive 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20'
                          }`}
                        >
                          {s.symbol} ({isPositive ? 'Positive' : 'Negative'})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Narrative Summary */}
                  <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-3 border border-[#E2E8F0] dark:border-[#243044] text-xs text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
                    <span className="font-bold text-[#2563EB] dark:text-[#3B82F6] mr-1.5">⚡ Market Impact:</span>
                    {getCleanImpactSummary(item)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE MODAL: NEXT-DAY AI SIGNAL & NEWS CATALYST PREDICTION        */}
      {/* ========================================================================= */}
      {predictionModalData && (
        <TomorrowPredictionModal 
          data={predictionModalData}
          marketSession={marketSession}
          onClose={() => setPredictionModalData(null)}
          onOpenCalculator={onOpenCalculator}
          onSelectStock={onSelectStock}
        />
      )}
    </div>
  );
}

// Sub-Component: Comprehensive Tomorrow's AI Signal & Forecast Modal
function TomorrowPredictionModal({ data, marketSession, onClose, onOpenCalculator, onSelectStock }) {
  const { trade, newsItem, isBullish, multiNews = [] } = data;
  const currentPrice = Number(trade.currentPrice || 100);
  const gainPct = Number(trade.expectedGainPct || (isBullish ? 12.5 : 8.5));
  const stopLossPct = Number(trade.stopLossPct || 4.5);

  const expectedHigh = (currentPrice * (isBullish ? (1 + (gainPct * 0.6) / 100) : 1.008)).toFixed(2);
  const expectedLow = (currentPrice * (isBullish ? 0.988 : (1 - (stopLossPct * 0.8) / 100))).toFixed(2);
  const tomorrowTarget1 = (currentPrice * (isBullish ? (1 + (gainPct * 0.5) / 100) : 0.96)).toFixed(2);
  const tomorrowTarget2 = Number(trade.targetSellPrice || (currentPrice * (1 + gainPct / 100))).toFixed(2);
  const stopLoss = Number(trade.stopLoss || (currentPrice * (1 - stopLossPct / 100))).toFixed(2);
  const confidencePct = isBullish ? 88 : 84;

  const openingBias = isBullish 
    ? 'Gap-Up Opening (+1.5% to +3.5%)'
    : 'Gap-Down / Sell Pressure Opening (-1.0% to -3.0%)';

  const circuitLockProbability = isBullish ? '65% (Strong Volume Driven)' : 'Low Risk of Lower Lock';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-scale-up">
        
        {/* Modal Header */}
        <div className={`p-6 text-white ${
          isBullish 
            ? 'bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#4F46E5]' 
            : 'bg-gradient-to-r from-[#7F1D1D] via-[#DC2626] to-[#991B1B]'
        }`}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-xs font-black tracking-wider uppercase">
                  {isBullish ? '🚀 BULLISH CATALYST FORECAST' : '⚠️ DOWNSIDE RISK ALERT'}
                </span>
                <span className="text-xs text-white/90 font-mono font-bold">
                  {marketSession?.sessionDateFormatted ? `Session: ${marketSession.sessionDateFormatted}` : 'Next Trading Session'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mono tracking-tight text-white flex items-center space-x-2">
                <span>{trade.symbol}</span>
                <span className="text-sm font-normal text-white/90">({trade.name})</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-[#0F172A] dark:text-[#F8FAFC]">
          
          {/* 1. Triggering News Event / Multi-News List */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#2563EB] dark:text-[#3B82F6]">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4" />
                <span>IMPACTING NEWS CATALYSTS ({multiNews.length || 1})</span>
              </span>
              <span className="font-mono text-[#64748B] dark:text-[#94A3B8]">
                Target Session: {marketSession?.sessionDateFormatted || 'Next Open'}
              </span>
            </div>
            
            {multiNews.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                {multiNews.map((n, i) => (
                  <div key={i} className="p-2 rounded-lg bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] flex items-start space-x-2 text-xs">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-black shrink-0 ${
                      n.polarity === 'POSITIVE' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                    }`}>
                      {n.polarity === 'POSITIVE' ? '🟢 Positive' : '🔴 Negative'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-snug">{n.title}</p>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{n.source} • {n.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <h4 className="text-sm font-bold leading-snug">
                {newsItem.title}
              </h4>
            )}
          </div>

          {/* 2. Tomorrow's Prediction Matrix Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center space-x-2 text-[#0F172A] dark:text-[#F8FAFC]">
                <Activity className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                <span>Upcoming Session Market Forecast ({marketSession?.sessionDateFormatted})</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/10 dark:text-[#3B82F6] border border-[#2563EB]/20">
                AI Confidence: {confidencePct}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044]">
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold block">Current Price</span>
                <span className="text-base font-extrabold mono text-[#0F172A] dark:text-[#F8FAFC]">PKR {currentPrice.toFixed(2)}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044]">
                <span className="text-[10px] text-[#16A34A] dark:text-[#22C55E] uppercase font-bold block">Expected Day High</span>
                <span className="text-base font-extrabold mono text-[#16A34A] dark:text-[#22C55E]">PKR {expectedHigh}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044]">
                <span className="text-[10px] text-[#DC2626] dark:text-[#EF4444] uppercase font-bold block">Expected Day Low</span>
                <span className="text-base font-extrabold mono text-[#DC2626] dark:text-[#EF4444]">PKR {expectedLow}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044]">
                <span className="text-[10px] text-[#2563EB] dark:text-[#3B82F6] uppercase font-bold block">Circuit Lock Chance</span>
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5 block">{circuitLockProbability}</span>
              </div>
            </div>
          </div>

          {/* 3. Actionable Intraday Trade Setup Plan */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] space-y-3">
            <h3 className="text-sm font-bold flex items-center space-x-2 text-[#0F172A] dark:text-[#F8FAFC]">
              <Target className="w-4 h-4 text-[#16A34A] dark:text-[#22C55E]" />
              <span>Recommended Trade Strategy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] space-y-1">
                <span className="text-[10px] font-bold text-[#2563EB] dark:text-[#3B82F6] uppercase block">
                  {isBullish ? 'Recommended Entry Zone' : 'Exit / Selling Zone'}
                </span>
                <span className="text-sm font-bold mono text-[#0F172A] dark:text-[#F8FAFC]">
                  PKR {trade.entryPriceMin} - {trade.entryPriceMax}
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Time: 09:15 - 09:45 AM</span>
              </div>

              <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] space-y-1">
                <span className="text-[10px] font-bold text-[#16A34A] dark:text-[#22C55E] uppercase block">
                  {isBullish ? 'Target 1 (Intraday)' : 'Immediate Downside Target'}
                </span>
                <span className="text-sm font-bold mono text-[#16A34A] dark:text-[#22C55E]">
                  PKR {tomorrowTarget1} (+{(gainPct * 0.5).toFixed(1)}%)
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Swing Target: PKR {tomorrowTarget2} (+{gainPct}%)</span>
              </div>

              <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] space-y-1">
                <span className="text-[10px] font-bold text-[#DC2626] dark:text-[#EF4444] uppercase block">
                  Strict Risk Stop-Loss
                </span>
                <span className="text-sm font-bold mono text-[#DC2626] dark:text-[#EF4444]">
                  PKR {stopLoss} (-{stopLossPct}%)
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Trail stop if Target 1 hits</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/20 text-xs text-[#2563EB] dark:text-[#60A5FA] flex items-start space-x-2">
              <Compass className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <b>Opening Behavior:</b> {openingBias}. Initial 15 minutes may see heavy volume discovery.
              </span>
            </div>
          </div>

          {/* 4. Complete Actionable Trading Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Executive Trading Blueprint & Risk Advisory</span>
            </div>
            
            <p className="text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed font-medium">
              {isBullish ? (
                <>
                  Following the aggregated news catalysts, strong buying momentum is projected for <b>{trade.symbol}</b> in the upcoming session (<b>{marketSession?.sessionDateFormatted}</b>). Traders should plan an entry within the <b>PKR {trade.entryPriceMin} - {trade.entryPriceMax}</b> price band during the opening 30 minutes. Target 1 is <b>PKR {tomorrowTarget1}</b> with a swing objective of <b>PKR {tomorrowTarget2} (+{gainPct}%)</b>. Maintain a strict stop-loss at <b>PKR {stopLoss} (-{stopLossPct}%)</b>.
                </>
              ) : (
                <>
                  Due to the net negative news catalysts, profit-taking and selling pressure are anticipated for <b>{trade.symbol}</b>. Avoid fresh aggressive long positions. Existing position holders should protect their capital by executing defensive stop-losses or taking profits if price breaches below <b>PKR {stopLoss}</b>.
                </>
              )}
            </p>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-[#F8FAFC] dark:bg-[#0B0F19] border-t border-[#E2E8F0] dark:border-[#243044] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onSelectStock(trade.symbol);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#151E2E] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044] font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Open Technical Chart</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenCalculator({
                symbol: trade.symbol,
                companyName: trade.name,
                currentPrice: currentPrice,
                stopLoss: Number(stopLoss),
                target1: Number(tomorrowTarget2),
                signal: isBullish ? 'BUY_NOW' : 'SELL_EXIT'
              });
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 cursor-pointer transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Load Strategy in Order Planner</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

      </div>
    </div>
  );
}

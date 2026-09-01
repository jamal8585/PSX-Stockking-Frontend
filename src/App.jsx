
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MarketHero from './components/MarketHero';
import NewsCatalystTradeHub from './components/NewsCatalystTradeHub';
import PortfolioAdvisor from './components/PortfolioAdvisor';
import DailyRecommendations from './components/DailyRecommendations';
import StockScreenerTable from './components/StockScreenerTable';
import StockDetailModal from './components/StockDetailModal';
import DarsonOrderCalculatorModal from './components/DarsonOrderCalculatorModal';
import WatchlistModal from './components/WatchlistModal';
import DayTradeSuggestionModal from './components/DayTradeSuggestionModal';
import AuthModal from './components/AuthModal';
import ProUpgradeModal from './components/ProUpgradeModal';
import AdminDashboard from './components/AdminDashboard';
import DividendIntelligenceHub from './components/DividendIntelligenceHub';
import WatchlistHub from './components/WatchlistHub';

import {
  getMarketSummary,
  getStocks,
  getStockDetail,
  getRecommendations,
  getNews,
  getWatchlist,
  toggleWatchlist,
  runMarketScan,
  getPortfolio,
  addPortfolioPosition,
  updatePortfolioPosition,
  deletePortfolioPosition,
  getCurrentUser,
  removeAuthToken
} from './services/api';

import officialQuotes from './data/official_quotes.json';

const AUTO_SYNC_SECONDS = 3;

// Scoped storage helper to guarantee complete per-user isolation
export const getUserStorageKey = (prefix, user) => {
  if (user && (user.email || user.id)) {
    const identifier = (user.email || user.id).toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    return `${prefix}_usr_${identifier}`;
  }
  return `${prefix}_guest_default`;
};

// User-scoped Positions Loader
export const loadUserPositions = (user) => {
  try {
    const key = getUserStorageKey('psx_portfolio_positions', user);
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
    // Migration check for primary admin or first user
    if (user && (user.email === 'jamal.ahmedrumi@gmail.com' || user.role === 'ADMIN')) {
      const legacyKeys = [
        'psx_user_portfolio_positions_v1',
        'psx_user_portfolio_positions',
        'user_portfolio_positions',
        'portfolio_positions',
        'psx_portfolio'
      ];
      for (const k of legacyKeys) {
        const legacy = localStorage.getItem(k);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(key, JSON.stringify(parsed));
            return parsed;
          }
        }
      }
    }
    return [];
  } catch (e) {
    return [];
  }
};

// User-scoped Watchlist Loader
export const loadUserWatchlist = (user) => {
  if (!user) return [];
  try {
    const key = getUserStorageKey('psx_watchlist', user);
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Migration check for primary admin
    if (user && (user.email === 'jamal.ahmedrumi@gmail.com' || user.role === 'ADMIN')) {
      const legacyKeys = [
        'psx_user_watchlist_v1',
        'psx_user_watchlist',
        'psx_watchlist',
        'user_watchlist'
      ];
      for (const k of legacyKeys) {
        const legacy = localStorage.getItem(k);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(key, JSON.stringify(parsed));
            return parsed;
          }
        }
      }
    }
    return [];
  } catch (e) {
    return [];
  }
};

// Client-side instant recalculation helper for portfolio
const calculateClientPortfolio = (savedPositions = [], stocksList = []) => {
  let totalInvested = 0;
  let totalCurrentValue = 0;
  let totalUnrealizedPnl = 0;
  let totalTodayPnl = 0;

  const stockMap = new Map();
  // 1. Preload from bundled official authoritative 503 dataset
  if (officialQuotes && typeof officialQuotes === 'object') {
    Object.values(officialQuotes).forEach(q => {
      if (q?.symbol) {
        const symKey = q.symbol.toUpperCase().trim();
        stockMap.set(symKey, {
          symbol: symKey,
          name: q.name || symKey,
          sector: q.sector || 'General Market',
          currentPrice: Number(q.currentPrice || 0),
          prevClose: Number(q.prevClose || q.currentPrice || 0),
          change: Number(q.change || 0),
          changePercent: Number(q.changePercent || 0),
          high: Number(q.high || q.currentPrice),
          low: Number(q.low || q.currentPrice),
          volume: Number(q.volume || 0)
        });
      }
    });
  }

  // 2. Overlay live ticks from active stocks array without corrupting official rates
  if (Array.isArray(stocksList)) {
    stocksList.forEach(s => {
      if (s?.symbol && Number(s.currentPrice) > 0) {
        const symKey = s.symbol.toUpperCase().trim();
        const existing = stockMap.get(symKey);
        stockMap.set(symKey, {
          ...existing,
          ...s,
          symbol: symKey,
          currentPrice: Number(s.currentPrice),
          prevClose: Number(s.prevClose || existing?.prevClose || s.currentPrice),
          change: Number(s.change !== undefined ? s.change : (existing?.change || 0)),
          changePercent: Number(s.changePercent !== undefined ? s.changePercent : (existing?.changePercent || 0))
        });
      }
    });
  }

  const enriched = savedPositions.map((pos, idx) => {
    const sym = pos.symbol ? pos.symbol.toUpperCase().trim() : 'STOCK';
    const official = stockMap.get(sym);
    const currentPrice = Number(official?.currentPrice || pos.buyPrice);
    const prevClose = Number(official?.prevClose || currentPrice);
    const dayChangePerShare = official?.change !== undefined 
      ? Number(official.change) 
      : Number((currentPrice - prevClose).toFixed(2));
    const dayChangePercent = official?.changePercent !== undefined 
      ? Number(official.changePercent) 
      : (prevClose > 0 ? Number((((currentPrice - prevClose) / prevClose) * 100).toFixed(2)) : 0);

    const buyPrice = Number(pos.buyPrice);
    const commission = Number(pos.commission || pos.commissionPerShare || 0);
    const quantity = Number(pos.quantity || 1);

    const grossCost = Number((buyPrice * quantity).toFixed(2));
    const totalCommission = Number((commission * quantity).toFixed(2));
    const invested = Number((grossCost + totalCommission).toFixed(2));
    const effectiveBuyRate = quantity > 0 ? Number((invested / quantity).toFixed(2)) : buyPrice;

    const currentValue = Number((currentPrice * quantity).toFixed(2));
    const pnlAmount = Number((currentValue - invested).toFixed(2));
    const pnlPercent = invested > 0 ? Number(((pnlAmount / invested) * 100).toFixed(2)) : 0;

    const todayPnlAmount = Number((dayChangePerShare * quantity).toFixed(2));
    const todayPnlPercent = Number(dayChangePercent.toFixed(2));

    totalInvested += invested;
    totalCurrentValue += currentValue;
    totalUnrealizedPnl += pnlAmount;
    totalTodayPnl += todayPnlAmount;

    // AI Strategy Advice Formulation
    const targetSell = Number((currentPrice * 1.115).toFixed(2));
    const stopLoss = Number((currentPrice * 0.95).toFixed(2));

    let decision = 'HOLD_AND_RIDE';
    let adviceSummary = `Holding is ${pnlPercent >= 0 ? '+' : ''}${pnlPercent}%. Maintain position towards target PKR ${targetSell}.`;
    
    if (pnlPercent >= 12) {
      decision = 'EXIT_BOOK_PROFIT';
      adviceSummary = `Outstanding gain of +${pnlPercent}%! Recommend booking 100% profit or setting tight trailing stop loss at PKR ${stopLoss}.`;
    } else if (pnlPercent >= 6) {
      decision = 'TAKE_PARTIAL_PROFIT';
      adviceSummary = `Healthy gain of +${pnlPercent}%. Scale out 50% profit and ride remainder towards target PKR ${targetSell}.`;
    } else if (pnlPercent <= -6) {
      decision = 'TRIGGER_STOP_LOSS';
      adviceSummary = `Position has declined -${Math.abs(pnlPercent)}%. Recommend triggering stop loss at PKR ${stopLoss} to protect capital.`;
    } else if (pnlPercent < 0 && pnlPercent >= -5) {
      decision = 'ACCUMULATE_DIP';
      adviceSummary = `Stock is in accumulation dip zone. Good opportunity to average buy price.`;
    }

    return {
      _id: pos._id || ('port_' + sym + '_' + idx),
      symbol: sym,
      name: official?.name || pos.name || sym,
      sector: official?.sector || pos.sector || 'General Market',
      buyPrice,
      commission,
      effectiveBuyRate,
      grossCost,
      totalCommission,
      quantity,
      notes: pos.notes || '',
      currentPrice,
      prevClose,
      dayChange: dayChangePerShare,
      dayChangePercent,
      todayPnlAmount,
      todayPnlPercent,
      invested,
      currentValue,
      pnlAmount,
      pnlPercent,
      aiAdvice: {
        decision,
        targetSellPrice: targetSell,
        stopLoss,
        adviceSummary
      }
    };
  });

  const totalPnlPercent = totalInvested > 0 ? Number(((totalUnrealizedPnl / totalInvested) * 100).toFixed(2)) : 0;
  const totalTodayPnlPercent = totalInvested > 0 ? Number(((totalTodayPnl / totalInvested) * 100).toFixed(2)) : 0;

  return {
    summary: {
      totalPositions: enriched.length,
      totalInvested: Number(totalInvested.toFixed(2)),
      totalCurrentValue: Number(totalCurrentValue.toFixed(2)),
      totalUnrealizedPnl: Number(totalUnrealizedPnl.toFixed(2)),
      totalPnlPercent,
      totalTodayPnl: Number(totalTodayPnl.toFixed(2)),
      totalTodayPnlPercent,
      winRate: enriched.length > 0 
        ? Math.round((enriched.filter(p => p.pnlAmount >= 0).length / enriched.length) * 100)
        : 0
    },
    positions: enriched
  };
};

const mergeWithOfficialQuotes = (serverStocks = []) => {
  const stockMap = new Map();
  // 1. Seed with 503 official DPS quotes
  if (officialQuotes && typeof officialQuotes === 'object') {
    Object.values(officialQuotes).forEach(q => {
      if (q?.symbol) {
        const symKey = q.symbol.toUpperCase().trim();
        stockMap.set(symKey, {
          ...q,
          symbol: symKey,
          name: q.name || symKey,
          sector: q.sector || 'General Market',
          currentPrice: Number(q.currentPrice || 0),
          prevClose: Number(q.prevClose || q.currentPrice || 0),
          change: Number(q.change || 0),
          changePercent: Number(q.changePercent || 0),
          volume: Number(q.volume || 0),
          high: Number(q.high || q.currentPrice),
          low: Number(q.low || q.currentPrice),
          isOfficialDPS: true
        });
      }
    });
  }

  // 2. Overlay server stocks for technicals, RSI, PE, Dividend Yield while keeping authoritative prices intact
  if (Array.isArray(serverStocks)) {
    serverStocks.forEach(s => {
      if (s?.symbol) {
        const symKey = s.symbol.toUpperCase().trim();
        const existing = stockMap.get(symKey);
        if (existing) {
          const serverPrice = Number(s.currentPrice || 0);
          stockMap.set(symKey, {
            ...existing,
            ...s,
            symbol: symKey,
            name: existing.name || s.name,
            sector: existing.sector || s.sector,
            currentPrice: serverPrice > 0 ? serverPrice : existing.currentPrice,
            prevClose: Number(s.prevClose || existing.prevClose || (serverPrice * 0.99)),
            change: s.change !== undefined ? Number(s.change) : existing.change,
            changePercent: s.changePercent !== undefined ? Number(s.changePercent) : existing.changePercent,
            volume: Number(s.volume || existing.volume || 0),
            high: Number(s.high || existing.high || (serverPrice * 1.02)),
            low: Number(s.low || existing.low || (serverPrice * 0.98)),
            technicals: s.technicals || existing.technicals || { rsi14: 52, signal: 'NEUTRAL' }
          });
        } else {
          stockMap.set(symKey, s);
        }
      }
    });
  }

  return Array.from(stockMap.values());
};

export default function App() {
  const [activeTab, setActiveTab] = useState('news');
  const [marketSummary, setMarketSummary] = useState(null);
  const [stocks, setStocks] = useState(() => mergeWithOfficialQuotes([]));
  const [recommendations, setRecommendations] = useState(null);
  const [news, setNews] = useState([]);
  // Authentication & Subscription State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('psx_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Isolated Watchlist State initialized for active user (Zero cache for guests)
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const savedUser = localStorage.getItem('psx_user_profile');
      const u = savedUser ? JSON.parse(savedUser) : null;
      if (!u) return [];
      return loadUserWatchlist(u);
    } catch (e) {
      return [];
    }
  });

  const [watchlistSet, setWatchlistSet] = useState(() => {
    try {
      const savedUser = localStorage.getItem('psx_user_profile');
      const u = savedUser ? JSON.parse(savedUser) : null;
      if (!u) return new Set();
      const list = loadUserWatchlist(u);
      return new Set(list.map(w => (typeof w === 'string' ? w : w.symbol).toUpperCase()));
    } catch (e) {
      return new Set();
    }
  });
  
  // Isolated Portfolio Positions State initialized for active user
  const [rawPositions, setRawPositions] = useState(() => {
    try {
      const savedUser = localStorage.getItem('psx_user_profile');
      const u = savedUser ? JSON.parse(savedUser) : null;
      return loadUserPositions(u);
    } catch (e) {
      return [];
    }
  });

  const [portfolioData, setPortfolioData] = useState({ summary: {}, positions: [] });

  // Dynamic Workspace Isolation: When user logs in / logs out, swap state to their personal workspace
  useEffect(() => {
    const activePositions = loadUserPositions(currentUser);
    const activeWatchlist = loadUserWatchlist(currentUser);
    setRawPositions(activePositions);
    setWatchlist(activeWatchlist);
    setWatchlistSet(new Set(activeWatchlist.map(w => (typeof w === 'string' ? w : w.symbol).toUpperCase())));
  }, [currentUser?.email]);

  // Persist Positions to active user's dedicated key
  useEffect(() => {
    try {
      if (Array.isArray(rawPositions)) {
        const key = getUserStorageKey('psx_portfolio_positions', currentUser);
        localStorage.setItem(key, JSON.stringify(rawPositions));
      }
    } catch (e) {}
  }, [rawPositions, currentUser?.email]);

  // Persist Watchlist to active user's dedicated key
  useEffect(() => {
    try {
      if (Array.isArray(watchlist)) {
        const key = getUserStorageKey('psx_watchlist', currentUser);
        localStorage.setItem(key, JSON.stringify(watchlist));
      }
    } catch (e) {}
  }, [watchlist, currentUser?.email]);

  const [selectedStock, setSelectedStock] = useState(null);
  const [calcStock, setCalcStock] = useState(null);
  const [dayTradeStock, setDayTradeStock] = useState(null);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [countdown, setCountdown] = useState(AUTO_SYNC_SECONDS);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    try {
      return (
        window.location.pathname.toLowerCase() === '/admin' || 
        window.location.hash.toLowerCase() === '#admin' || 
        window.location.search.includes('admin=true')
      );
    } catch (e) {
      return false;
    }
  });

  // Verify auth session with backend on load & auto-open auth modal if visiting /admin as guest
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('psx_auth_token');
      if (token) {
        try {
          const res = await getCurrentUser();
          if (res?.success && res.user) {
            setCurrentUser(res.user);
            localStorage.setItem('psx_user_profile', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
        }
      } else if (isAdminOpen) {
        setIsAuthModalOpen(true);
        setAuthModalMode('login');
      }
    };
    verifySession();
  }, [isAdminOpen]);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    const userPositions = loadUserPositions(user);
    const userWatchlist = loadUserWatchlist(user);
    setRawPositions(userPositions);
    setWatchlist(userWatchlist);
    setWatchlistSet(new Set(userWatchlist.map(w => (typeof w === 'string' ? w : w.symbol).toUpperCase())));
    showToast(`Welcome, ${user.name}! Your personal portfolio & watchlist loaded.`);
    if (isAdminOpen && user.role !== 'ADMIN') {
      showToast('You are logged in, but this account does not have Admin privileges.');
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('psx_user_profile');
    localStorage.removeItem('psx_watchlist_guest_default');
    localStorage.removeItem('psx_portfolio_positions_guest_default');
    localStorage.removeItem('psx_closed_trades_guest');
    localStorage.removeItem('psx_user_watchlist_v1');
    localStorage.removeItem('psx_user_portfolio_positions_v1');
    localStorage.removeItem('psx_user_watchlist');
    localStorage.removeItem('psx_watchlist');

    setCurrentUser(null);
    setIsAdminOpen(false);
    
    // Clear out private data from active state (Zero residual cache)
    setRawPositions([]);
    setWatchlist([]);
    setWatchlistSet(new Set());
    showToast('Signed out successfully.');
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOpenUpgrade = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleOpenAdmin = () => {
    if (currentUser?.role === 'ADMIN') {
      setIsAdminOpen(true);
    } else {
      showToast('Administrator privileges required.');
    }
  };

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('psx_theme_preference') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  // Sync document root class with theme for Tailwind dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('psx_theme_preference', next);
    } catch (e) {}
    showToast(next === 'light' ? '☀️ Switched to Light Theme' : '🌙 Switched to Dark Theme');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keep portfolio calculations live whenever stocks or rawPositions change
  useEffect(() => {
    const calculated = calculateClientPortfolio(rawPositions, stocks);
    setPortfolioData(calculated);
  }, [rawPositions, stocks]);

  // Fast 5-second lightweight polling for KSE-100 & live market telemetry
  const syncQuickData = async () => {
    try {
      const m = await getMarketSummary();
      if (m?.success && m.data) {
        setMarketSummary(m.data);

        // Real-time overlay of active gainers, losers, and volume leaders directly into stocks state
        const leaders = [
          ...(m.data.topGainers || []),
          ...(m.data.topLosers || []),
          ...(m.data.volumeLeaders || [])
        ];

        if (leaders.length > 0) {
          setStocks(prev => {
            const map = new Map(prev.map(item => [item.symbol.toUpperCase().trim(), item]));
            leaders.forEach(l => {
              if (l?.symbol && Number(l.price) > 0) {
                const key = l.symbol.toUpperCase().trim();
                const existing = map.get(key);
                if (existing) {
                  map.set(key, {
                    ...existing,
                    currentPrice: Number(l.price),
                    change: l.change !== undefined ? Number(l.change) : existing.change,
                    changePercent: l.changePercent !== undefined ? Number(l.changePercent) : existing.changePercent,
                    volume: Number(l.volume || existing.volume)
                  });
                }
              }
            });
            return Array.from(map.values());
          });
        }
      }
    } catch (err) {
      console.warn('Quick Sync note:', err.message);
    }
  };

  // Complete background data loader
  const loadFullData = async (silent = false) => {
    try {
      const results = await Promise.allSettled([
        getMarketSummary(),
        getStocks(),
        getRecommendations(),
        getNews(),
        getWatchlist()
      ]);

      const [m, s, r, n, w] = results;

      if (m.status === 'fulfilled' && m.value?.success) setMarketSummary(m.value.data);
      if (s.status === 'fulfilled' && s.value?.success && Array.isArray(s.value.data) && s.value.data.length > 0) {
        setStocks(mergeWithOfficialQuotes(s.value.data));
      }
      if (r.status === 'fulfilled' && r.value?.success) setRecommendations(r.value);
      if (n.status === 'fulfilled' && n.value?.success) setNews(n.value.data);

      if (!silent) {
        setCountdown(AUTO_SYNC_SECONDS);
      }
    } catch (err) {
      console.error('Full Data Loading Error:', err);
    }
  };

  useEffect(() => {
    loadFullData();

    // Fast 5-second countdown timer for rapid live index sync
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          syncQuickData();
          return AUTO_SYNC_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    // Full catalog refresh every 25 seconds
    const fullTimer = setInterval(() => {
      loadFullData(true);
    }, 25000);

    return () => {
      clearInterval(timer);
      clearInterval(fullTimer);
    };
  }, []);

  const handleSelectStock = async (symbolOrStock) => {
    try {
      const sym = typeof symbolOrStock === 'string' ? symbolOrStock : (symbolOrStock?.symbol || '');
      if (!sym) return;

      const symKey = sym.toUpperCase().trim();

      // Instant responsive open with current stock quote data (0ms lag)
      const localStock = (stocks && stocks.find(s => s.symbol?.toUpperCase() === symKey)) || 
        (officialQuotes ? officialQuotes[symKey] : null) || 
        (typeof symbolOrStock === 'object' ? symbolOrStock : { symbol: symKey });
      
      if (localStock) {
        setSelectedStock(localStock);
      }

      // Fetch deep technicals and historical series from API
      const res = await getStockDetail(symKey);
      if (res?.success && res.data) {
        setSelectedStock(prev => ({
          ...(localStock || {}),
          ...res.data
        }));
      }
    } catch (err) {
      console.error('Failed to fetch stock detail:', err);
    }
  };

  // Instant 0ms Local Watchlist Toggle with Permanent Storage & Background Sync
  const handleToggleWatchlist = (symbolOrStock) => {
    try {
      const sym = typeof symbolOrStock === 'string' 
        ? symbolOrStock.toUpperCase().trim() 
        : (symbolOrStock?.symbol || '').toUpperCase().trim();
      if (!sym) return;

      const isAlreadyIn = watchlist.some(w => (typeof w === 'string' ? w : w.symbol).toUpperCase() === sym);
      let updated;

      if (isAlreadyIn) {
        updated = watchlist.filter(w => (typeof w === 'string' ? w : w.symbol).toUpperCase() !== sym);
        showToast(`Removed ${sym} from Watchlist`);
      } else {
        const stockInfo = (stocks && stocks.find(s => s.symbol?.toUpperCase() === sym)) || 
          (officialQuotes ? officialQuotes[sym] : null) || 
          (typeof symbolOrStock === 'object' ? symbolOrStock : { symbol: sym, name: sym, sector: 'General Market' });

        const newEntry = {
          symbol: sym,
          name: stockInfo.name || sym,
          sector: stockInfo.sector || 'General Market',
          currentPrice: Number(stockInfo.currentPrice || 100),
          addedAt: new Date().toISOString()
        };
        updated = [newEntry, ...watchlist];
        showToast(`⭐ Added ${sym} to Watchlist Radar!`);
      }

      setWatchlist(updated);
      setWatchlistSet(new Set(updated.map(w => (typeof w === 'string' ? w : w.symbol).toUpperCase())));
      
      const key = getUserStorageKey('psx_watchlist', currentUser);
      localStorage.setItem(key, JSON.stringify(updated));

      // Background sync with server
      toggleWatchlist(sym).catch(() => {});
    } catch (err) {
      console.error('Toggle Watchlist Error:', err);
    }
  };

  // Instant Add Position with Permanent Local Storage & Server Sync
  const handleAddPosition = async (tradeData) => {
    try {
      const sym = tradeData.symbol.toUpperCase().trim();
      const stockInfo = stocks.find(s => s.symbol === sym) || { name: sym, sector: 'General' };
      
      const newPos = {
        _id: 'port_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        symbol: sym,
        name: stockInfo.name,
        sector: stockInfo.sector,
        buyPrice: Number(tradeData.buyPrice),
        commission: Number(tradeData.commission || 0),
        quantity: Number(tradeData.quantity),
        notes: tradeData.notes || '',
        createdAt: new Date().toISOString()
      };

      const updated = [newPos, ...rawPositions];
      setRawPositions(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      showToast(`✅ Position for ${sym} recorded successfully!`);

      // Sync with server in background
      try {
        await addPortfolioPosition(tradeData);
      } catch (e) {}
    } catch (err) {
      showToast('❌ Error adding position: ' + err.message);
    }
  };

  // Instant Update Position (Buy Price / Quantity / Commission)
  const handleUpdatePosition = async (id, updateData) => {
    try {
      const updated = rawPositions.map(p => {
        if (p._id === id) {
          return {
            ...p,
            ...(updateData.buyPrice !== undefined ? { buyPrice: Number(updateData.buyPrice) } : {}),
            ...(updateData.commission !== undefined ? { commission: Number(updateData.commission) } : {}),
            ...(updateData.quantity !== undefined ? { quantity: Number(updateData.quantity) } : {}),
            ...(updateData.notes !== undefined ? { notes: updateData.notes } : {})
          };
        }
        return p;
      });

      setRawPositions(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      showToast('✅ Buy rate updated & live P&L recalculated!');

      // Sync with server
      try {
        await updatePortfolioPosition(id, updateData);
      } catch (e) {}
    } catch (err) {
      showToast('❌ Error updating position: ' + err.message);
    }
  };

  // Instant Delete Position
  const handleDeletePosition = async (id) => {
    try {
      const updated = rawPositions.filter(p => p._id !== id);
      setRawPositions(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      showToast('Position removed from portfolio.');

      // Sync with server
      try {
        await deletePortfolioPosition(id);
      } catch (e) {}
    } catch (err) {
      showToast('❌ Error deleting position: ' + err.message);
    }
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    showToast('⚡ Running Live PSX Re-Scan & Real-Time Sync...');
    try {
      const res = await runMarketScan();
      if (res.success) {
        await loadFullData();
        setCountdown(AUTO_SYNC_SECONDS);
        showToast('✅ PSX Stockking Updated With Latest Market Signals!');
      }
    } catch (err) {
      showToast('❌ Scan failed: ' + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  if (isAdminOpen && currentUser?.role === 'ADMIN') {
    return (
      <AdminDashboard
        currentUser={currentUser}
        onBackToPortal={() => setIsAdminOpen(false)}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors flex flex-col font-['Calibri','Segoe_UI',system-ui,sans-serif] ${
      theme === 'light' ? 'bg-[#F8FAFC] text-[#0F172A]' : 'bg-[#0B0F19] text-[#F8FAFC]'
    }`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2563EB] text-white font-bold text-xs px-5 py-3 rounded-lg shadow-2xl animate-bounce flex items-center space-x-2 border border-[#60A5FA]/30">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        marketSummary={marketSummary}
        stocks={stocks}
        onRunScan={handleRunScan}
        isScanning={isScanning}
        watchlistCount={watchlist.length}
        portfolioCount={portfolioData?.summary?.totalPositions || 0}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        countdown={countdown}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenUpgrade={handleOpenUpgrade}
        onOpenAdmin={handleOpenAdmin}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Hub (Wide Ultra-Dashboard Format) */}
      <main className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Global Market Ticker Cards */}
        <MarketHero marketSummary={marketSummary} />

        {/* Tab 1: Live News Catalyst Trade Hub */}
        {activeTab === 'news' && (
          <NewsCatalystTradeHub
            news={news}
            newsList={news}
            stocks={stocks}
            onSelectStock={handleSelectStock}
            onOpenCalculator={setCalcStock}
          />
        )}

        {/* Tab 2: My Portfolio & Live AI Exit Advisor */}
        {activeTab === 'portfolio' && (
          <PortfolioAdvisor
            portfolioData={portfolioData}
            stocks={stocks}
            onAddPosition={handleAddPosition}
            onUpdatePosition={handleUpdatePosition}
            onDeletePosition={handleDeletePosition}
            onSelectStock={handleSelectStock}
            currentUser={currentUser}
          />
        )}

        {/* Tab 3: Daily AI Signals */}
        {activeTab === 'recommendations' && (
          <DailyRecommendations
            recommendations={recommendations}
            stocks={stocks}
            onSelectStock={handleSelectStock}
            onOpenCalculator={setCalcStock}
            currentUser={currentUser}
            onOpenUpgrade={handleOpenUpgrade}
          />
        )}

        {/* Tab 4: Upcoming Dividends Intelligence Hub */}
        {activeTab === 'dividends' && (
          <DividendIntelligenceHub
            stocks={stocks}
            onSelectStock={handleSelectStock}
          />
        )}

        {/* Tab 5: My Watchlist & Real-Time Trade Radar */}
        {activeTab === 'watchlist' && (
          <WatchlistHub
            watchlist={watchlist}
            stocks={stocks}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectStock={handleSelectStock}
            onOpenCalculator={setCalcStock}
          />
        )}

        {/* Tab 6: Full Market Screener */}
        {activeTab === 'screener' && (
          <StockScreenerTable
            stocks={stocks}
            onSelectStock={handleSelectStock}
            onOpenCalculator={setCalcStock}
            onOpenDayTrade={setDayTradeStock}
            onToggleWatchlist={handleToggleWatchlist}
            watchlistSet={watchlistSet}
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-4 text-center text-xs transition-colors ${
        theme === 'light' 
          ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#64748B]' 
          : 'bg-[#151E2E] border-[#243044] text-[#94A3B8]'
      }`}>
        <div className="max-w-[1680px] mx-auto px-4">
          <p>© 2026 PSX STOCKKING • Real-Time Financial Intelligence, Portfolio Tracker & Algorithmic Stock Screening Engine.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Pro VIP Upgrade Modal */}
      <ProUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        user={currentUser}
        onAuthRequired={() => {
          setIsUpgradeModalOpen(false);
          handleOpenAuth('login');
        }}
        onUpgradeSubmitted={(updatedUser) => {
          setCurrentUser(updatedUser);
          showToast('Upgrade proof submitted! Admin will verify shortly.');
        }}
      />

      {/* Modals */}
      {selectedStock && (
        <StockDetailModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          onOpenCalculator={setCalcStock}
        />
      )}

      {dayTradeStock && (
        <DayTradeSuggestionModal
          stock={dayTradeStock}
          news={news}
          onClose={() => setDayTradeStock(null)}
          onOpenChart={handleSelectStock}
          onOpenCalculator={setCalcStock}
        />
      )}

      {calcStock && (
        <DarsonOrderCalculatorModal
          key={calcStock?.symbol || 'calc'}
          stock={calcStock}
          stocks={stocks}
          onClose={() => setCalcStock(null)}
        />
      )}

      {isWatchlistOpen && (
        <WatchlistModal
          watchlist={watchlist}
          onClose={() => setIsWatchlistOpen(false)}
          onSelectStock={handleSelectStock}
          onRemove={handleToggleWatchlist}
        />
      )}
    </div>
  );
}

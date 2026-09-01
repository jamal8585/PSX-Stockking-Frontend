
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

import {
  getMarketSummary,
  getStocks,
  getRecommendations,
  getNews,
  getWatchlist,
  toggleWatchlist,
  runMarketScan,
  getPortfolio,
  addPortfolioPosition,
  updatePortfolioPosition,
  deletePortfolioPosition
} from './services/api';

const AUTO_SYNC_SECONDS = 60;
const STORAGE_KEY = 'psx_user_portfolio_positions_v1';

const DEFAULT_PSX_PRICES = {
  'PRL': 104.42,
  'OGDC': 328.70,
  'PPL': 234.50,
  'MARI': 663.26,
  'SYS': 124.54,
  'LUCK': 437.33,
  'FFC': 552.70,
  'PSO': 363.84,
  'CNERGY': 15.46,
  'BOP': 34.99,
  'WTL': 1.16,
  'MEBL': 573.99,
  'HUBC': 210.71,
  'HBL': 154.50,
  'MCB': 285.00,
  'UBL': 345.00,
  'EFERT': 172.50,
  'ENGRO': 385.00,
  'DGKC': 212.00,
  'MLCF': 100.00,
  'CHCC': 194.00,
  'FCCL': 38.50,
  'ATRL': 385.00,
  'NRL': 295.00,
  'TRG': 68.20
};

// Client-side instant recalculation helper for portfolio
const calculateClientPortfolio = (savedPositions = [], stocksList = []) => {
  let totalInvested = 0;
  let totalCurrentValue = 0;
  let totalUnrealizedPnl = 0;
  let totalTodayPnl = 0;

  const stockMap = new Map();
  if (Array.isArray(stocksList)) {
    stocksList.forEach(s => {
      if (s?.symbol) stockMap.set(s.symbol.toUpperCase(), s);
    });
  }

  const enriched = savedPositions.map((pos, idx) => {
    const sym = pos.symbol ? pos.symbol.toUpperCase().trim() : 'STOCK';
    const fallbackPrice = DEFAULT_PSX_PRICES[sym] || pos.buyPrice;
    const stock = stockMap.get(sym) || {
      name: pos.name || sym,
      sector: pos.sector || 'General Market',
      currentPrice: fallbackPrice,
      prevClose: fallbackPrice,
      change: 0,
      changePercent: 0,
      technicals: { rsi14: 50, trend: 'NEUTRAL' }
    };

    const currentPrice = Number(stock.currentPrice || fallbackPrice);
    const buyPrice = Number(pos.buyPrice);
    const quantity = Number(pos.quantity || 1);

    const invested = Number((buyPrice * quantity).toFixed(2));
    const currentValue = Number((currentPrice * quantity).toFixed(2));
    const pnlAmount = Number((currentValue - invested).toFixed(2));
    const pnlPercent = invested > 0 ? Number(((pnlAmount / invested) * 100).toFixed(2)) : 0;

    const dayChangePerShare = Number(stock.change || 0);
    const todayPnlAmount = Number((dayChangePerShare * quantity).toFixed(2));
    const todayPnlPercent = Number(stock.changePercent || 0);

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
      name: stock.name || pos.name || sym,
      sector: stock.sector || pos.sector || 'General Market',
      buyPrice,
      quantity,
      notes: pos.notes || '',
      currentPrice,
      prevClose: stock.prevClose || currentPrice,
      dayChange: dayChangePerShare,
      dayChangePercent: todayPnlPercent,
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

export default function App() {
  const [activeTab, setActiveTab] = useState('news');
  const [marketSummary, setMarketSummary] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [news, setNews] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistSet, setWatchlistSet] = useState(new Set());
  
  // Persistent local portfolio state
  const [rawPositions, setRawPositions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [portfolioData, setPortfolioData] = useState({ summary: {}, positions: [] });
  
  const [selectedStock, setSelectedStock] = useState(null);
  const [calcStock, setCalcStock] = useState(null);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [countdown, setCountdown] = useState(AUTO_SYNC_SECONDS);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keep portfolio calculations live whenever stocks or rawPositions change
  useEffect(() => {
    const calculated = calculateClientPortfolio(rawPositions, stocks);
    setPortfolioData(calculated);
  }, [rawPositions, stocks]);

  const loadData = async (silent = false) => {
    try {
      const results = await Promise.allSettled([
        getMarketSummary(),
        getStocks(),
        getRecommendations(),
        getNews(),
        getWatchlist(),
        getPortfolio()
      ]);

      const [m, s, r, n, w, p] = results;

      if (m.status === 'fulfilled' && m.value?.success) setMarketSummary(m.value.data);
      if (s.status === 'fulfilled' && s.value?.success) setStocks(s.value.data);
      if (r.status === 'fulfilled' && r.value?.success) setRecommendations(r.value);
      if (n.status === 'fulfilled' && n.value?.success) setNews(n.value.data);
      if (w.status === 'fulfilled' && w.value?.success) {
        setWatchlist(w.value.data);
        setWatchlistSet(new Set(w.value.data.map(item => item.symbol)));
      }
      
      // If server returned portfolio positions, merge with local
      if (p.status === 'fulfilled' && p.value?.positions?.length > 0) {
        const serverPos = p.value.positions;
        setRawPositions(prev => {
          if (prev.length === 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverPos));
            return serverPos;
          }
          return prev;
        });
      }

      if (!silent) {
        setCountdown(AUTO_SYNC_SECONDS);
      }
    } catch (err) {
      console.error('Data Loading Error:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          loadData(true);
          return AUTO_SYNC_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSelectStock = async (symbol) => {
    try {
      const res = await getStockDetail(symbol);
      if (res.success) {
        setSelectedStock(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch stock detail:', err);
    }
  };

  const handleToggleWatchlist = async (symbol) => {
    try {
      const res = await toggleWatchlist(symbol);
      if (res.success) {
        showToast(res.isWatchlisted ? `Added ${symbol} to Watchlist` : `Removed ${symbol} from Watchlist`);
        const watchRes = await getWatchlist();
        if (watchRes.success) {
          setWatchlist(watchRes.data);
          setWatchlistSet(new Set(watchRes.data.map(w => w.symbol)));
        }
      }
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

  // Instant Update Position (Buy Price / Quantity)
  const handleUpdatePosition = async (id, updateData) => {
    try {
      const updated = rawPositions.map(p => {
        if (p._id === id) {
          return {
            ...p,
            ...(updateData.buyPrice ? { buyPrice: Number(updateData.buyPrice) } : {}),
            ...(updateData.quantity ? { quantity: Number(updateData.quantity) } : {}),
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
        await loadData();
        setCountdown(AUTO_SYNC_SECONDS);
        showToast('✅ PSX Stockking Updated With Latest Market Signals!');
      }
    } catch (err) {
      showToast('❌ Scan failed: ' + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-gray-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold text-xs px-5 py-3 rounded-2xl shadow-2xl animate-bounce flex items-center space-x-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        marketSummary={marketSummary}
        onRunScan={handleRunScan}
        isScanning={isScanning}
        watchlistCount={watchlist.length}
        portfolioCount={portfolioData?.summary?.totalPositions || 0}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        countdown={countdown}
      />

      {/* Main Content Hub */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* Global Market Ticker Cards */}
        <MarketHero marketSummary={marketSummary} />

        {/* Tab 1: Live News Catalyst Trade Hub */}
        {activeTab === 'news' && (
          <NewsCatalystTradeHub
            news={news}
            newsList={news}
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
          />
        )}

        {/* Tab 3: Daily AI Signals */}
        {activeTab === 'recommendations' && (
          <DailyRecommendations
            recommendations={recommendations}
            onSelectStock={handleSelectStock}
            onOpenCalculator={setCalcStock}
          />
        )}

        {/* Tab 4: Full Market Screener */}
        {activeTab === 'screener' && (
          <StockScreenerTable
            stocks={stocks}
            onSelectStock={handleSelectStock}
            onOpenCalculator={setCalcStock}
            onToggleWatchlist={handleToggleWatchlist}
            watchlistSet={watchlistSet}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-4 text-center text-xs text-gray-500 bg-[#04070D]">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 PSX STOCKKING • Real-Time Financial Intelligence, Portfolio Tracker & Algorithmic Stock Screening Engine.</p>
        </div>
      </footer>

      {/* Modals */}
      {selectedStock && (
        <StockDetailModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          onOpenCalculator={setCalcStock}
        />
      )}

      {calcStock && (
        <DarsonOrderCalculatorModal
          stock={calcStock}
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

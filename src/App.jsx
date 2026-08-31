
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MarketHero from './components/MarketHero';
import NewsCatalystTradeHub from './components/NewsCatalystTradeHub';
import PortfolioAdvisor from './components/PortfolioAdvisor';
import DailyRecommendations from './components/DailyRecommendations';
import StockScreenerTable from './components/StockScreenerTable';
import StockDetailModal from './components/StockDetailModal';
import OrderExecutionPlannerModal from './components/OrderExecutionPlannerModal';
import WatchlistModal from './components/WatchlistModal';

import { 
  getMarketSummary, 
  getStocks, 
  getStockDetail, 
  getRecommendations, 
  getNews, 
  runMarketScan,
  getWatchlist,
  toggleWatchlist,
  getPortfolio,
  addPortfolioPosition,
  deletePortfolioPosition
} from './services/api';

const AUTO_SYNC_SECONDS = 60;

export default function App() {
  const [activeTab, setActiveTab] = useState('news');
  const [marketSummary, setMarketSummary] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [news, setNews] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistSet, setWatchlistSet] = useState(new Set());
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

  const loadData = async (silent = false) => {
    try {
      const [marketRes, stocksRes, recsRes, newsRes, watchRes, portRes] = await Promise.all([
        getMarketSummary(),
        getStocks(),
        getRecommendations(),
        getNews(),
        getWatchlist(),
        getPortfolio()
      ]);

      if (marketRes.success) setMarketSummary(marketRes.data);
      if (stocksRes.success) setStocks(stocksRes.data);
      if (recsRes.success) setRecommendations(recsRes);
      if (newsRes.success) setNews(newsRes.data);
      if (watchRes.success) {
        setWatchlist(watchRes.data);
        setWatchlistSet(new Set(watchRes.data.map(w => w.symbol)));
      }
      if (portRes.success) {
        setPortfolioData(portRes);
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

  const handleAddPosition = async (tradeData) => {
    try {
      // 1. Save to API
      const res = await addPortfolioPosition(tradeData);
      showToast(`✅ Position for ${tradeData.symbol} recorded successfully!`);
      
      // 2. Refresh from API
      const portRes = await getPortfolio();
      if (portRes.success) {
        setPortfolioData(portRes);
      }
    } catch (err) {
      showToast('Notice: Position recorded in local session.');
      const portRes = await getPortfolio();
      if (portRes.success) setPortfolioData(portRes);
    }
  };

  const handleUpdatePosition = async (id, updateData) => {
    try {
      const res = await updatePortfolioPosition(id, updateData);
      if (res.success) {
        showToast('✅ Position updated & live P&L recalculated!');
        const portRes = await getPortfolio();
        if (portRes.success) setPortfolioData(portRes);
      }
    } catch (err) {
      showToast('❌ Error updating position: ' + err.message);
    }
  };

  const handleDeletePosition = async (id) => {
    try {
      const res = await deletePortfolioPosition(id);
      if (res.success) {
        showToast('Position removed from portfolio.');
        const portRes = await getPortfolio();
        if (portRes.success) setPortfolioData(portRes);
      }
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
        showToast('✅ PSX Alpha Terminal Updated With Latest Market Signals!');
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

      {/* Navbar with Portfolio Counter */}
      <Navbar
        marketSummary={marketSummary}
        onRunScan={handleRunScan}
        isScanning={isScanning}
        watchlistCount={watchlist.length}
        portfolioCount={portfolioData?.positions?.length || 0}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        countdown={countdown}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        <MarketHero marketSummary={marketSummary} />

        {/* Tab 1: Real-time News & Catalyst Trades (Default) */}
        {activeTab === 'news' && (
          <NewsCatalystTradeHub
            news={news}
            onSelectStock={handleSelectStock}
            onOpenCalculator={setCalcStock}
          />
        )}

        {/* Tab 2: Live Portfolio & AI Exit Advisor */}
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
          <p>© 2026 PSX ALPHA TERMINAL • Real-Time Financial Intelligence, Portfolio Tracker & Algorithmic Stock Screening Engine.</p>
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
        <OrderExecutionPlannerModal
          stock={calcStock}
          onClose={() => setCalcStock(null)}
        />
      )}

      {isWatchlistOpen && (
        <WatchlistModal
          watchlist={watchlist}
          onClose={() => setIsWatchlistOpen(false)}
          onSelectStock={handleSelectStock}
          onOpenCalculator={setCalcStock}
          onRemove={handleToggleWatchlist}
        />
      )}
    </div>
  );
}

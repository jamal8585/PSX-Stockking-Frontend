import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Trash2, 
  Sparkles, 
  Bot, 
  X,
  Radio,
  Search,
  Edit3,
  DollarSign,
  History
} from 'lucide-react';

const POPULAR_TICKERS = [
  'OGDC', 'PPL', 'MARI', 'SYS', 'LUCK', 'FFC', 'PSO', 'PRL', 'CNERGY', 'BOP', 'WTL', 'TELE', 'MEBL', 'HUBC'
];

const getClosedTradesKey = (user) => {
  if (user && (user.email || user.id)) {
    const identifier = (user.email || user.id).toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    return `psx_closed_trades_usr_${identifier}`;
  }
  return 'psx_closed_trades_guest';
};

export default function PortfolioAdvisor({ 
  portfolioData, 
  stocks = [], 
  onAddPosition, 
  onUpdatePosition, 
  onDeletePosition, 
  onSelectStock,
  currentUser = null
}) {
  // Navigation Sub-tab: 'active' | 'history'
  const [subTab, setSubTab] = useState('active');

  // Modal 1: Add/Record Trade (Buy or Sell)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tradeMode, setTradeMode] = useState('BUY'); // 'BUY' | 'SELL'
  const [symbolInput, setSymbolInput] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [commission, setCommission] = useState('0.05');
  const [quantity, setQuantity] = useState('1000');
  const [notes, setNotes] = useState('');
  const [tradeDate, setTradeDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal 2: Edit Active Holding Buy Price / Qty
  const [editingPosition, setEditingPosition] = useState(null);
  const [editBuyPrice, setEditBuyPrice] = useState('');
  const [editCommission, setEditCommission] = useState('0.05');
  const [editQuantity, setEditQuantity] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Modal 3: Sell / Book Profit from Active Holding
  const [sellingPosition, setSellingPosition] = useState(null);
  const [sellHoldingPrice, setSellHoldingPrice] = useState('');
  const [sellHoldingQty, setSellHoldingQty] = useState('');
  const [sellHoldingComm, setSellHoldingComm] = useState('0.05');
  const [sellHoldingNotes, setSellHoldingNotes] = useState('');

  // All-Time Closed Trades History (User Scoped with multi-key recovery)
  const [closedTrades, setClosedTrades] = useState(() => {
    try {
      const userKey = getClosedTradesKey(currentUser);
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  // Switch closed trades when user logs in/out
  useEffect(() => {
    try {
      const userKey = getClosedTradesKey(currentUser);
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setClosedTrades(parsed);
          return;
        }
      }
      setClosedTrades([]);
    } catch (e) {
      setClosedTrades([]);
    }
  }, [currentUser?.email]);

  // Sync closed trades to active user's storage
  useEffect(() => {
    try {
      const userKey = getClosedTradesKey(currentUser);
      localStorage.setItem(userKey, JSON.stringify(closedTrades));
    } catch (e) {}
  }, [closedTrades, currentUser?.email]);

  const { summary = {}, positions = [] } = portfolioData || {};

  const handleSelectSymbol = (sym, overridePrice = false) => {
    const sUpper = sym.toUpperCase();
    setSymbolInput(sUpper);
    const found = stocks.find(s => s.symbol.toUpperCase() === sUpper);
    if (found) {
      if (overridePrice || !buyPrice || buyPrice === '0') {
        setBuyPrice(found.currentPrice);
      }
      if (tradeMode === 'SELL' && (!sellPrice || sellPrice === '0')) {
        setSellPrice(found.currentPrice);
      }
    }
  };

  // 1. Submit from General Add Trade Modal (Buy or Sell)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const sym = symbolInput.toUpperCase().trim();
    if (!sym) return;

    const finalBuyPrice = Number(buyPrice) || 100;
    const finalQty = Number(quantity) || 1000;
    const finalComm = Number(commission) || 0;

    setIsSubmitting(true);
    try {
      if (tradeMode === 'BUY') {
        // Add to active portfolio holdings
        await onAddPosition({
          symbol: sym,
          buyPrice: finalBuyPrice,
          commission: finalComm,
          quantity: finalQty,
          notes: notes.trim()
        });
      } else {
        // Direct Closed/Sell Trade Entry
        const finalSellPrice = Number(sellPrice) || finalBuyPrice;
        const totalBuyCost = (finalBuyPrice + finalComm) * finalQty;
        const totalSellValue = (finalSellPrice - finalComm) * finalQty;
        const realizedPnl = totalSellValue - totalBuyCost;
        const realizedPct = totalBuyCost > 0 ? (realizedPnl / totalBuyCost) * 100 : 0;

        const newClosedTrade = {
          id: 'closed_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          symbol: sym,
          buyPrice: finalBuyPrice,
          sellPrice: finalSellPrice,
          commission: finalComm,
          quantity: finalQty,
          totalBuyCost: Number(totalBuyCost.toFixed(2)),
          totalSellValue: Number(totalSellValue.toFixed(2)),
          realizedPnl: Number(realizedPnl.toFixed(2)),
          realizedPct: Number(realizedPct.toFixed(2)),
          closedDate: tradeDate || new Date().toISOString().split('T')[0],
          notes: notes.trim() || 'Manual Closed Trade'
        };

        setClosedTrades(prev => [newClosedTrade, ...prev]);
        setSubTab('history');
      }

      setIsModalOpen(false);
      setSymbolInput('');
      setBuyPrice('');
      setSellPrice('');
      setCommission('0.05');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Open Sell Modal for Active Holding
  const handleOpenSellModal = (pos) => {
    setSellingPosition(pos);
    setSellHoldingPrice(pos.currentPrice || pos.buyPrice);
    setSellHoldingQty(pos.quantity);
    setSellHoldingComm(pos.commission !== undefined ? pos.commission : '0.05');
    setSellHoldingNotes('Exited at target rate');
  };

  // 3. Confirm Sell / Book Profit from Active Holding
  const handleConfirmSellHolding = async (e) => {
    e.preventDefault();
    if (!sellingPosition || !sellHoldingPrice || !sellHoldingQty) return;

    const sPrice = Number(sellHoldingPrice);
    const sQty = Number(sellHoldingQty);
    const sComm = Number(sellHoldingComm) || 0;
    const bPrice = Number(sellingPosition.buyPrice);
    const bComm = Number(sellingPosition.commission || 0);

    const totalBuyCost = (bPrice + bComm) * sQty;
    const totalSellValue = (sPrice - sComm) * sQty;
    const realizedPnl = totalSellValue - totalBuyCost;
    const realizedPct = totalBuyCost > 0 ? (realizedPnl / totalBuyCost) * 100 : 0;

    const closedRecord = {
      id: 'closed_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      symbol: sellingPosition.symbol,
      buyPrice: bPrice,
      sellPrice: sPrice,
      commission: sComm,
      quantity: sQty,
      totalBuyCost: Number(totalBuyCost.toFixed(2)),
      totalSellValue: Number(totalSellValue.toFixed(2)),
      realizedPnl: Number(realizedPnl.toFixed(2)),
      realizedPct: Number(realizedPct.toFixed(2)),
      closedDate: new Date().toISOString().split('T')[0],
      notes: sellHoldingNotes.trim() || 'Profit booked from Active Portfolio'
    };

    setIsSubmitting(true);
    try {
      setClosedTrades(prev => [closedRecord, ...prev]);

      if (sQty >= Number(sellingPosition.quantity)) {
        await onDeletePosition(sellingPosition._id);
      } else {
        const remainingQty = Number(sellingPosition.quantity) - sQty;
        await onUpdatePosition(sellingPosition._id, {
          ...sellingPosition,
          quantity: remainingQty
        });
      }

      setSellingPosition(null);
      setSubTab('history');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClosedTrade = (id) => {
    if (window.confirm('Remove this closed trade from all-time history?')) {
      setClosedTrades(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleOpenEdit = (pos) => {
    setEditingPosition(pos);
    setEditBuyPrice(pos.buyPrice);
    setEditCommission(pos.commission !== undefined ? pos.commission : '0.05');
    setEditQuantity(pos.quantity);
    setEditNotes(pos.notes || '');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingPosition || !editBuyPrice || !editQuantity) return;
    setIsSubmitting(true);
    try {
      if (onUpdatePosition) {
        await onUpdatePosition(editingPosition._id, {
          buyPrice: Number(editBuyPrice),
          commission: Number(editCommission) || 0,
          quantity: Number(editQuantity),
          notes: editNotes.trim()
        });
      }
      setEditingPosition(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTotalPos = (summary.totalUnrealizedPnl || 0) >= 0;
  const isTodayPos = (summary.totalTodayPnl || 0) >= 0;

  // Closed Trades Analytics Calculations
  const totalRealizedPnl = closedTrades.reduce((acc, t) => acc + (t.realizedPnl || 0), 0);
  const totalRealizedCost = closedTrades.reduce((acc, t) => acc + (t.totalBuyCost || 0), 0);
  const totalRealizedPct = totalRealizedCost > 0 ? (totalRealizedPnl / totalRealizedCost) * 100 : 0;
  const winningTradesCount = closedTrades.filter(t => t.realizedPnl >= 0).length;
  const winRate = closedTrades.length > 0 ? Math.round((winningTradesCount / closedTrades.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Portfolio Telemetry */}
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-4 sm:p-6 shadow-sm dark:shadow-md transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 border border-[#2563EB]/20 dark:border-[#3B82F6]/20 text-[#2563EB] dark:text-[#3B82F6] shrink-0">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-base sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                  Portfolio Tracker & Trade Journal
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#3B82F6] border border-[#2563EB]/20 dark:border-[#3B82F6]/20">
                  <Radio className="w-3 h-3 mr-1 inline animate-pulse" /> REAL-TIME P&L
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Record your <b>BUY Holdings</b> to track live market moves, or <b>SELL & Book Profit</b> to maintain your trade journal.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                setTradeMode('BUY');
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs shadow-sm transition-all cursor-pointer w-full sm:w-auto"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>+ Record Buy Position</span>
            </button>

            <button
              onClick={() => {
                setTradeMode('SELL');
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-[#D97706] hover:bg-[#B45309] dark:bg-[#F59E0B] dark:hover:bg-[#D97706] text-white dark:text-black font-bold text-xs shadow-sm transition-all cursor-pointer w-full sm:w-auto"
            >
              <DollarSign className="w-4 h-4 stroke-[2.5]" />
              <span>+ Record Sell Trade</span>
            </button>
          </div>
        </div>

        {/* Portfolio Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-[#E2E8F0] dark:border-[#243044]">
          <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-3.5 border border-[#E2E8F0] dark:border-[#243044]">
            <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">Active Capital Invested</span>
            <span className="text-lg font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mono mt-1 block">
              PKR {(summary.totalInvested || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-3.5 border border-[#E2E8F0] dark:border-[#243044]">
            <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">Active Portfolio Value</span>
            <span className="text-lg font-extrabold text-[#2563EB] dark:text-[#3B82F6] mono mt-1 block">
              PKR {(summary.totalCurrentValue || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-3.5 border border-[#E2E8F0] dark:border-[#243044]">
            <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">Aaj Ka Day Move</span>
            <div className={`text-lg font-extrabold mono mt-1 flex items-center ${isTodayPos ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
              {isTodayPos ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{isTodayPos ? '+' : ''}PKR {(summary.totalTodayPnl || 0).toLocaleString()} ({isTodayPos ? '+' : ''}{summary.totalTodayPnlPercent || 0}%)</span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-3.5 border border-[#E2E8F0] dark:border-[#243044]">
            <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">Unrealized Net P&L</span>
            <div className={`text-lg font-extrabold mono mt-1 flex items-center ${isTotalPos ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
              {isTotalPos ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{isTotalPos ? '+' : ''}PKR {(summary.totalUnrealizedPnl || 0).toLocaleString()} ({isTotalPos ? '+' : ''}{summary.totalPnlPercent || 0}%)</span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg p-3.5 border border-[#D97706]/40 dark:border-[#F59E0B]/40">
            <span className="text-[10px] uppercase text-[#D97706] dark:text-[#F59E0B] font-bold block">All-Time Booked Profit 💰</span>
            <div className={`text-lg font-extrabold mono mt-1 flex items-center ${totalRealizedPnl >= 0 ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
              <span>{totalRealizedPnl >= 0 ? '+' : ''}PKR {totalRealizedPnl.toLocaleString()} ({totalRealizedPnl >= 0 ? '+' : ''}{totalRealizedPct.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs: Active Holdings vs All-Time Trade History */}
      <div className="flex items-center space-x-2 border-b border-[#E2E8F0] dark:border-[#243044] pb-3">
        <button
          onClick={() => setSubTab('active')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            subTab === 'active'
              ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm'
              : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>📊 Active Holdings ({positions.length})</span>
        </button>

        <button
          onClick={() => setSubTab('history')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            subTab === 'history'
              ? 'bg-[#D97706] dark:bg-[#F59E0B] text-white dark:text-black shadow-sm font-black'
              : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>📜 All-Time Closed Trades & Booked Profit ({closedTrades.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: ACTIVE HOLDINGS TAB */}
      {/* ========================================================================= */}
      {subTab === 'active' && (
        <>
          {positions.length === 0 ? (
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-xl bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 border border-[#2563EB]/20 dark:border-[#3B82F6]/20 flex items-center justify-center mx-auto text-[#2563EB] dark:text-[#3B82F6]">
                <Briefcase className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">No Active Holdings in Portfolio</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto mt-1">
                  Click <b>"Record Buy Position"</b> to enter your stocks and get real-time price updates and AI target suggestions.
                </p>
              </div>
              <button
                onClick={() => { setTradeMode('BUY'); setIsModalOpen(true); }}
                className="px-4 py-2 rounded-lg bg-[#2563EB] dark:bg-[#3B82F6] text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Add Your First Holding
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                  <span>Active Holdings & Real-Time Valuation Matrix ({positions.length})</span>
                </h3>
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Auto-Syncing live with PSX DPS</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {positions.map((pos) => {
                  const isPos = pos.pnlAmount >= 0;

                  return (
                    <div
                      key={pos._id}
                      className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] hover:border-[#2563EB] dark:hover:border-[#3B82F6] rounded-xl p-5 shadow-sm transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left Details */}
                        <div className="space-y-2.5 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center space-x-2.5">
                              <span 
                                onClick={() => onSelectStock(pos.symbol)}
                                className="text-2xl font-black text-[#0F172A] dark:text-[#F8FAFC] mono cursor-pointer hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors"
                              >
                                {pos.symbol}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-bold border border-[#E2E8F0] dark:border-[#243044]">
                                {pos.sector}
                              </span>
                              <span className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate max-w-[200px]">
                                {pos.name}
                              </span>
                            </div>

                            {/* P&L Badges */}
                            <div className="flex items-center space-x-2">
                              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold mono flex items-center space-x-1 border ${
                                ((pos.dayChange || 0) >= 0) 
                                  ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20 dark:bg-[#22C55E]/10 dark:text-[#22C55E] dark:border-[#22C55E]/20' 
                                  : 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20 dark:bg-[#EF4444]/10 dark:text-[#EF4444] dark:border-[#EF4444]/20'
                              }`}>
                                <span>Day Move: {((pos.dayChange || 0) >= 0) ? '+' : ''}PKR {pos.todayPnlAmount?.toLocaleString()} ({((pos.dayChange || 0) >= 0) ? '+' : ''}{pos.dayChangePercent}%)</span>
                              </div>

                              <div className={`px-3.5 py-1.5 rounded-lg text-xs font-bold mono flex items-center space-x-1.5 border ${
                                isPos 
                                  ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30 dark:bg-[#22C55E]/10 dark:text-[#22C55E] dark:border-[#22C55E]/30' 
                                  : 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30 dark:bg-[#EF4444]/10 dark:text-[#EF4444] dark:border-[#EF4444]/30'
                              }`}>
                                {isPos ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                <span>Unrealized P&L: {isPos ? '+' : ''}PKR {pos.pnlAmount.toLocaleString()} ({isPos ? '+' : ''}{pos.pnlPercent}%)</span>
                              </div>
                            </div>
                          </div>

                          {/* Matrix */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044] text-xs">
                            <div>
                              <span className="text-[9px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">
                                Buy Rate {pos.commission > 0 ? `(+PKR ${pos.commission} Fee)` : ''}
                              </span>
                              <span className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mono">
                                PKR {Number(pos.buyPrice).toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase text-[#2563EB] dark:text-[#3B82F6] font-bold block">Live Market Rate</span>
                              <span className="text-sm font-extrabold text-[#2563EB] dark:text-[#3B82F6] mono">PKR {Number(pos.currentPrice).toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">Holding Quantity</span>
                              <span className="text-sm font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mono">{Number(pos.quantity).toLocaleString()} Shares</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">Capital Invested</span>
                              <span className="text-sm font-extrabold text-[#D97706] dark:text-[#F59E0B] mono">
                                PKR {Number(pos.invested).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Action Controls: Sell / Book Profit, Edit, Delete */}
                        <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0">
                          <button
                            onClick={() => handleOpenSellModal(pos)}
                            className="px-4 py-2 rounded-lg bg-[#D97706] hover:bg-[#B45309] dark:bg-[#F59E0B] dark:hover:bg-[#D97706] text-white dark:text-black font-bold text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer"
                            title="Sell shares and record in Realized Profit Journal"
                          >
                            <DollarSign className="w-4 h-4 stroke-[2.5]" />
                            <span>Sell / Book Profit</span>
                          </button>

                          <div className="flex items-center space-x-1.5 w-full">
                            <button
                              onClick={() => handleOpenEdit(pos)}
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#243044] text-[#0F172A] dark:text-[#F8FAFC] text-[11px] font-bold flex items-center justify-center space-x-1 border border-[#E2E8F0] dark:border-[#243044] cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => onDeletePosition(pos._id)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/20 hover:bg-[#DC2626] text-[#DC2626] hover:text-white dark:bg-[#EF4444]/10 dark:border-[#EF4444]/20 dark:hover:bg-[#EF4444] dark:text-[#EF4444] dark:hover:text-white text-[11px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                              title="Delete position"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: ALL-TIME CLOSED TRADES & REALIZED PROFIT JOURNAL */}
      {/* ========================================================================= */}
      {subTab === 'history' && (
        <div className="space-y-4">
          {/* History KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#243044] shadow-sm">
              <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">Total Closed Trades</span>
              <span className="text-2xl font-black text-[#0F172A] dark:text-[#F8FAFC] mono mt-1 block">{closedTrades.length}</span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Historical Executions</span>
            </div>

            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-4 rounded-xl border border-[#D97706]/40 dark:border-[#F59E0B]/40 shadow-sm">
              <span className="text-[10px] uppercase text-[#D97706] dark:text-[#F59E0B] font-bold block">Net Realized Profit</span>
              <span className={`text-2xl font-black mono mt-1 block ${totalRealizedPnl >= 0 ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
                {totalRealizedPnl >= 0 ? '+' : ''}PKR {totalRealizedPnl.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Total Booked Gain</span>
            </div>

            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#243044] shadow-sm">
              <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">Trade Win Rate</span>
              <span className="text-2xl font-black text-[#2563EB] dark:text-[#3B82F6] mono mt-1 block">{winRate}%</span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{winningTradesCount} of {closedTrades.length} Profitable</span>
            </div>

            <div className="bg-[#FFFFFF] dark:bg-[#151E2E] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#243044] shadow-sm">
              <span className="text-[10px] uppercase text-[#64748B] dark:text-[#94A3B8] font-bold block">Realized Return %</span>
              <span className={`text-2xl font-black mono mt-1 block ${totalRealizedPct >= 0 ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
                {totalRealizedPct >= 0 ? '+' : ''}{totalRealizedPct.toFixed(2)}%
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">All-Time ROI</span>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-[#FFFFFF] dark:bg-[#151E2E] rounded-xl border border-[#E2E8F0] dark:border-[#243044] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#E2E8F0] dark:border-[#243044] flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B]" />
                <h3 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider">
                  All-Time Closed Trades Journal ({closedTrades.length})
                </h3>
              </div>
              {closedTrades.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all closed trade history?')) {
                      setClosedTrades([]);
                    }
                  }}
                  className="text-[10px] text-[#DC2626] dark:text-[#EF4444] hover:underline cursor-pointer"
                >
                  Clear All History
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-[#0B0F19] text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold border-b border-[#E2E8F0] dark:border-[#243044]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Stock Symbol</th>
                    <th className="py-3 px-4">Buy Price</th>
                    <th className="py-3 px-4">Sell Price</th>
                    <th className="py-3 px-4">Qty Sold</th>
                    <th className="py-3 px-4">Net Realized Profit (PKR)</th>
                    <th className="py-3 px-4">Return %</th>
                    <th className="py-3 px-4">Strategy / Note</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243044]">
                  {closedTrades.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-[#64748B] dark:text-[#94A3B8] space-y-2">
                        <History className="w-8 h-8 mx-auto text-[#64748B] dark:text-[#94A3B8] mb-2" />
                        <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">No Closed Trades Yet</p>
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          When you sell an active holding or record a sell trade, your realized profit history will be preserved here permanently.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    closedTrades.map(trade => {
                      const isProfit = trade.realizedPnl >= 0;

                      return (
                        <tr key={trade.id} className="hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors">
                          <td className="py-3 px-4 text-[#64748B] dark:text-[#94A3B8] text-[11px] mono">
                            {trade.closedDate || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span 
                              onClick={() => onSelectStock(trade.symbol)}
                              className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mono cursor-pointer hover:text-[#2563EB] dark:hover:text-[#3B82F6]"
                            >
                              {trade.symbol}
                            </span>
                          </td>
                          <td className="py-3 px-4 mono text-[#0F172A] dark:text-[#F8FAFC]">
                            PKR {Number(trade.buyPrice).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 mono text-[#0F172A] dark:text-[#F8FAFC] font-bold">
                            PKR {Number(trade.sellPrice).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 mono text-[#64748B] dark:text-[#94A3B8]">
                            {Number(trade.quantity).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-bold mono text-sm">
                            <span className={isProfit ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}>
                              {isProfit ? '+' : ''}PKR {Number(trade.realizedPnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold mono">
                            <span className={`px-2 py-0.5 rounded text-[10px] border ${
                              isProfit 
                                ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20 dark:bg-[#22C55E]/10 dark:text-[#22C55E] dark:border-[#22C55E]/20' 
                                : 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20 dark:bg-[#EF4444]/10 dark:text-[#EF4444] dark:border-[#EF4444]/20'
                            }`}>
                              {isProfit ? '+' : ''}{trade.realizedPct}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#64748B] dark:text-[#94A3B8] text-[11px] max-w-[150px] truncate">
                            {trade.notes || '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteClosedTrade(trade.id)}
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] dark:text-[#94A3B8] dark:hover:text-[#EF4444] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / RECORD TRADE POSITION (BUY OR SELL) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg border ${
                  tradeMode === 'BUY' 
                    ? 'bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 border-[#2563EB]/20 dark:border-[#3B82F6]/20 text-[#2563EB] dark:text-[#3B82F6]' 
                    : 'bg-[#D97706]/10 dark:bg-[#F59E0B]/10 border-[#D97706]/20 dark:border-[#F59E0B]/20 text-[#D97706] dark:text-[#F59E0B]'
                }`}>
                  {tradeMode === 'BUY' ? <PlusCircle className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {tradeMode === 'BUY' ? 'Record Buy Trade Position' : 'Record Sell & Book Profit'}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {tradeMode === 'BUY' ? 'Add stock to active portfolio for live tracking' : 'Record an executed sell trade to log realized profit'}
                  </p>
                </div>
              </div>
            </div>

            {/* Mode Switcher: BUY vs SELL */}
            <div className="flex bg-[#F8FAFC] dark:bg-[#0B0F19] p-1 rounded-lg border border-[#E2E8F0] dark:border-[#243044] mb-4">
              <button
                type="button"
                onClick={() => setTradeMode('BUY')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  tradeMode === 'BUY' 
                    ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-sm' 
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <span>🟢 Buy Trade (Active Portfolio)</span>
              </button>
              <button
                type="button"
                onClick={() => setTradeMode('SELL')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  tradeMode === 'SELL' 
                    ? 'bg-[#D97706] dark:bg-[#F59E0B] text-white dark:text-black shadow-sm font-black' 
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <span>🔴 Sell Trade (Book Profit)</span>
              </button>
            </div>

            {/* Quick Pick Stocks */}
            <div className="mb-4">
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold block mb-1.5">
                Quick Pick Popular Stocks:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TICKERS.map(sym => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => handleSelectSymbol(sym, true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold mono cursor-pointer border transition-all ${
                      symbolInput === sym
                        ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white border-[#2563EB] dark:border-[#3B82F6] shadow-sm'
                        : 'bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC] border-[#E2E8F0] dark:border-[#243044] hover:border-[#2563EB] dark:hover:border-[#3B82F6]'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Symbol Input */}
              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">
                  Stock Symbol (Ticker):
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. OGDC, PPL, SYS, LUCK, PRL"
                    value={symbolInput}
                    onChange={e => handleSelectSymbol(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg pl-9 pr-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] font-extrabold mono uppercase focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              {/* Price Row */}
              <div className={`grid gap-3 ${tradeMode === 'SELL' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <div>
                  <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">
                    Your Buy / Entry Price (PKR):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 115.50"
                    value={buyPrice}
                    onChange={e => setBuyPrice(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] font-extrabold mono focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                  />
                </div>

                {tradeMode === 'SELL' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#D97706] dark:text-[#F59E0B] uppercase mb-1">
                      Your Sell / Exit Price (PKR):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 132.80"
                      value={sellPrice}
                      onChange={e => setSellPrice(e.target.value)}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#D97706]/60 dark:border-[#F59E0B]/60 rounded-lg px-3 py-2 text-[#D97706] dark:text-[#F59E0B] font-extrabold mono focus:outline-none focus:border-[#D97706] dark:focus:border-[#F59E0B]"
                    />
                  </div>
                )}
              </div>

              {/* Quantity & Commission */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">
                    Quantity (Number of Shares):
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1000"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] font-extrabold mono focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">
                    Brokerage Fee per Share:
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.05"
                    value={commission}
                    onChange={e => setCommission(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] font-extrabold mono focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              {/* Trade Notes */}
              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">
                  Trading Strategy / Notes:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swing trade on breakout"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                />
              </div>

              {/* Live Preview Box */}
              {buyPrice && quantity && (
                <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044] space-y-1.5">
                  {tradeMode === 'BUY' ? (
                    <>
                      <div className="flex justify-between items-center text-[#64748B] dark:text-[#94A3B8]">
                        <span>Shares Gross Cost:</span>
                        <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mono">
                          PKR {(Number(buyPrice) * Number(quantity)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-[#E2E8F0] dark:border-[#243044] pt-1">
                        <span className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">Total Capital Outlay:</span>
                        <span className="font-bold text-[#2563EB] dark:text-[#3B82F6] mono text-sm">
                          PKR {((Number(buyPrice) + Number(commission || 0)) * Number(quantity)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-[#64748B] dark:text-[#94A3B8]">
                        <span>Total Buy Cost:</span>
                        <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mono">
                          PKR {((Number(buyPrice) + Number(commission || 0)) * Number(quantity)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[#64748B] dark:text-[#94A3B8]">
                        <span>Total Sell Value:</span>
                        <span className="font-bold text-[#D97706] dark:text-[#F59E0B] mono">
                          PKR {((Number(sellPrice || buyPrice) - Number(commission || 0)) * Number(quantity)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-[#E2E8F0] dark:border-[#243044] pt-1">
                        <span className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">Net Realized Profit/Loss:</span>
                        {(() => {
                          const cost = (Number(buyPrice) + Number(commission || 0)) * Number(quantity);
                          const rev = (Number(sellPrice || buyPrice) - Number(commission || 0)) * Number(quantity);
                          const pnl = rev - cost;
                          const pct = cost > 0 ? (pnl / cost) * 100 : 0;
                          const isUp = pnl >= 0;
                          return (
                            <span className={`font-bold mono text-sm ${isUp ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
                              {isUp ? '+' : ''}PKR {pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({isUp ? '+' : ''}{pct.toFixed(2)}%)
                            </span>
                          );
                        })()}
                      </div>
                    </>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-bold text-xs shadow-sm transition-all cursor-pointer ${
                  tradeMode === 'BUY'
                    ? 'bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white'
                    : 'bg-[#D97706] hover:bg-[#B45309] dark:bg-[#F59E0B] dark:hover:bg-[#D97706] text-white dark:text-black'
                }`}
              >
                {isSubmitting 
                  ? 'Saving Trade...' 
                  : (tradeMode === 'BUY' ? 'Save Active Position to Portfolio' : 'Book Profit & Save to All-Time History')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SELL / BOOK PROFIT FROM ACTIVE HOLDING */}
      {/* ========================================================================= */}
      {sellingPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setSellingPosition(null)}
              className="absolute top-5 right-5 p-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#D97706]/10 dark:bg-[#F59E0B]/10 border border-[#D97706]/20 dark:border-[#F59E0B]/20 flex items-center justify-center text-[#D97706] dark:text-[#F59E0B]">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">Sell & Book Profit: {sellingPosition.symbol}</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Bought @ <b className="text-[#0F172A] dark:text-[#F8FAFC] mono">PKR {Number(sellingPosition.buyPrice).toFixed(2)}</b> ({sellingPosition.quantity} shares available)
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmSellHolding} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">
                  Quantity to Sell (Full or Partial):
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={sellingPosition.quantity}
                  value={sellHoldingQty}
                  onChange={e => setSellHoldingQty(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] font-bold mono focus:outline-none focus:border-[#D97706] dark:focus:border-[#F59E0B]"
                />
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 block">
                  Max available: {sellingPosition.quantity} shares
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#D97706] dark:text-[#F59E0B] uppercase mb-1">
                  Actual Selling Price per Share (PKR):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={sellHoldingPrice}
                  onChange={e => setSellHoldingPrice(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#D97706]/60 dark:border-[#F59E0B]/60 rounded-lg px-3 py-2 text-[#D97706] dark:text-[#F59E0B] font-bold mono focus:outline-none focus:border-[#D97706] dark:focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">
                  Brokerage Fee per Share:
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={sellHoldingComm}
                  onChange={e => setSellHoldingComm(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] font-bold mono focus:outline-none focus:border-[#D97706] dark:focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">
                  Exit Reason / Note:
                </label>
                <input
                  type="text"
                  value={sellHoldingNotes}
                  onChange={e => setSellHoldingNotes(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#D97706] dark:focus:border-[#F59E0B]"
                />
              </div>

              {/* Realized P&L Calculation Box */}
              {sellHoldingPrice && sellHoldingQty && (
                <div className="bg-[#F8FAFC] dark:bg-[#0B0F19] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#243044] space-y-1.5">
                  <div className="flex justify-between items-center text-[#64748B] dark:text-[#94A3B8]">
                    <span>Buy Cost ({sellHoldingQty} × PKR {sellingPosition.buyPrice}):</span>
                    <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mono">
                      PKR {((Number(sellingPosition.buyPrice) + Number(sellingPosition.commission || 0)) * Number(sellHoldingQty)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#64748B] dark:text-[#94A3B8]">
                    <span>Sell Value ({sellHoldingQty} × PKR {sellHoldingPrice}):</span>
                    <span className="font-bold text-[#D97706] dark:text-[#F59E0B] mono">
                      PKR {((Number(sellHoldingPrice) - Number(sellHoldingComm || 0)) * Number(sellHoldingQty)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#E2E8F0] dark:border-[#243044] pt-1.5">
                    <span className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">Net Realized Profit / Loss:</span>
                    {(() => {
                      const cost = (Number(sellingPosition.buyPrice) + Number(sellingPosition.commission || 0)) * Number(sellHoldingQty);
                      const rev = (Number(sellHoldingPrice) - Number(sellHoldingComm || 0)) * Number(sellHoldingQty);
                      const pnl = rev - cost;
                      const pct = cost > 0 ? (pnl / cost) * 100 : 0;
                      const isUp = pnl >= 0;
                      return (
                        <span className={`font-bold mono text-sm ${isUp ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
                          {isUp ? '+' : ''}PKR {pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({isUp ? '+' : ''}{pct.toFixed(2)}%)
                        </span>
                      );
                    })()}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-[#D97706] hover:bg-[#B45309] dark:bg-[#F59E0B] dark:hover:bg-[#D97706] text-white dark:text-black font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                {isSubmitting ? 'Processing Sell Trade...' : 'Confirm Sell & Log Realized Profit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT ACTIVE POSITION */}
      {/* ========================================================================= */}
      {editingPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setEditingPosition(null)}
              className="absolute top-5 right-5 p-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 border border-[#2563EB]/20 dark:border-[#3B82F6]/20 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6]">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">Edit Holding: {editingPosition.symbol}</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Live Rate: <b className="text-[#2563EB] dark:text-[#3B82F6] mono">PKR {Number(editingPosition.currentPrice).toFixed(2)}</b></p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">Buy Rate (PKR):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editBuyPrice}
                  onChange={e => setEditBuyPrice(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] font-bold mono focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">Commission per Share (PKR):</label>
                <input
                  type="number"
                  step="0.001"
                  value={editCommission}
                  onChange={e => setEditCommission(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] font-bold mono focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">Holding Quantity (Shares):</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editQuantity}
                  onChange={e => setEditQuantity(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] font-bold mono focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase mb-1">Trading Strategy / Notes:</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#60A5FA] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                {isSubmitting ? 'Updating...' : 'Update Holding & Recalculate P&L'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

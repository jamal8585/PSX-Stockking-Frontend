import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Trash2, 
  Sparkles, 
  Target, 
  StopCircle, 
  Bot, 
  LineChart, 
  AlertCircle, 
  CheckCircle2, 
  Layers,
  X,
  Radio,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Zap,
  Info,
  Edit3,
  DollarSign,
  History,
  Calendar,
  ShieldCheck
} from 'lucide-react';

const POPULAR_TICKERS = [
  'OGDC', 'PPL', 'MARI', 'SYS', 'LUCK', 'FFC', 'PSO', 'PRL', 'CNERGY', 'BOP', 'WTL', 'TELE', 'MEBL', 'HUBC'
];

const CLOSED_TRADES_STORAGE_KEY = 'psx_closed_trades_history_v1';

export default function PortfolioAdvisor({ 
  portfolioData, 
  stocks = [], 
  onAddPosition, 
  onUpdatePosition,
  onDeletePosition, 
  onSelectStock 
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

  // All-Time Closed Trades History (Persistent)
  const [closedTrades, setClosedTrades] = useState(() => {
    try {
      const saved = localStorage.getItem(CLOSED_TRADES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync closed trades to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CLOSED_TRADES_STORAGE_KEY, JSON.stringify(closedTrades));
    } catch (e) {}
  }, [closedTrades]);

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
      // Add to closed trades journal
      setClosedTrades(prev => [closedRecord, ...prev]);

      // If sold entire quantity -> delete active holding
      if (sQty >= Number(sellingPosition.quantity)) {
        await onDeletePosition(sellingPosition._id);
      } else {
        // Partial sell -> update remaining active holding quantity
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

  // 4. Delete from Closed Trades History
  const handleDeleteClosedTrade = (id) => {
    if (window.confirm('Remove this closed trade from all-time history?')) {
      setClosedTrades(prev => prev.filter(t => t.id !== id));
    }
  };

  // 5. Open Edit Active Position
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
      <div className="bg-gradient-to-b from-[#0F172A] to-[#070B12] border border-cyan-900/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Portfolio Tracker, Sell Profit Booker & All-Time Trade Journal
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Radio className="w-3 h-3 mr-1 inline animate-pulse" /> REAL-TIME P&L
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Record your <b>BUY Holdings</b> to track live market moves, or <b>SELL & Book Profit</b> to maintain your permanent all-time trade journal.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                setTradeMode('BUY');
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:opacity-90 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>+ Record Buy Position</span>
            </button>

            <button
              onClick={() => {
                setTradeMode('SELL');
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:opacity-90 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              <DollarSign className="w-4 h-4 stroke-[2.5]" />
              <span>+ Record Sell Trade</span>
            </button>
          </div>
        </div>

        {/* Portfolio Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-gray-800/80">
          <div className="bg-[#070B12] rounded-2xl p-3.5 border border-gray-800">
            <span className="text-[10px] uppercase text-gray-400 font-bold block">Active Capital Invested</span>
            <span className="text-lg font-extrabold text-white mono mt-1 block">
              PKR {(summary.totalInvested || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-[#070B12] rounded-2xl p-3.5 border border-gray-800">
            <span className="text-[10px] uppercase text-gray-400 font-bold block">Active Portfolio Value</span>
            <span className="text-lg font-extrabold text-cyan-400 mono mt-1 block">
              PKR {(summary.totalCurrentValue || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-[#070B12] rounded-2xl p-3.5 border border-gray-800">
            <span className="text-[10px] uppercase text-gray-400 font-bold block">Aaj Ka Day Move</span>
            <div className={`text-lg font-extrabold mono mt-1 flex items-center ${isTodayPos ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isTodayPos ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{isTodayPos ? '+' : ''}PKR {(summary.totalTodayPnl || 0).toLocaleString()} ({isTodayPos ? '+' : ''}{summary.totalTodayPnlPercent || 0}%)</span>
            </div>
          </div>

          <div className="bg-[#070B12] rounded-2xl p-3.5 border border-gray-800">
            <span className="text-[10px] uppercase text-gray-400 font-bold block">Unrealized Net P&L</span>
            <div className={`text-lg font-extrabold mono mt-1 flex items-center ${isTotalPos ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isTotalPos ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{isTotalPos ? '+' : ''}PKR {(summary.totalUnrealizedPnl || 0).toLocaleString()} ({isTotalPos ? '+' : ''}{summary.totalPnlPercent || 0}%)</span>
            </div>
          </div>

          <div className="bg-[#070B12] rounded-2xl p-3.5 border border-amber-500/40">
            <span className="text-[10px] uppercase text-amber-400 font-bold block">All-Time Booked Profit 💰</span>
            <div className={`text-lg font-extrabold mono mt-1 flex items-center ${totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span>{totalRealizedPnl >= 0 ? '+' : ''}PKR {totalRealizedPnl.toLocaleString()} ({totalRealizedPnl >= 0 ? '+' : ''}{totalRealizedPct.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs: Active Holdings vs All-Time Trade History */}
      <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setSubTab('active')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 cursor-pointer ${
            subTab === 'active'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
              : 'bg-[#0D131F] text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>📊 Active Holdings ({positions.length})</span>
        </button>

        <button
          onClick={() => setSubTab('history')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 cursor-pointer ${
            subTab === 'history'
              ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/20'
              : 'bg-[#0D131F] text-gray-400 hover:text-white border border-gray-800'
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
            <div className="bg-[#0D131F] border border-gray-800/80 rounded-3xl p-12 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
                <Briefcase className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">No Active Holdings in Portfolio</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                  Click <b>"Record Buy Position"</b> to enter your stocks and get real-time price updates and AI target suggestions.
                </p>
              </div>
              <button
                onClick={() => { setTradeMode('BUY'); setIsModalOpen(true); }}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                Add Your First Holding
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>Active Holdings & Real-Time Valuation Matrix ({positions.length})</span>
                </h3>
                <span className="text-xs text-gray-500 font-medium">Auto-Syncing live with PSX DPS</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {positions.map((pos) => {
                  const isPos = pos.pnlAmount >= 0;

                  return (
                    <div
                      key={pos._id}
                      className={`bg-[#0D131F] border rounded-3xl p-5 shadow-xl transition-all ${
                        isPos ? 'border-emerald-500/30 hover:border-emerald-500/50' : 'border-rose-500/30 hover:border-rose-500/50'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left Details */}
                        <div className="space-y-2.5 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center space-x-2.5">
                              <span 
                                onClick={() => onSelectStock(pos.symbol)}
                                className="text-2xl font-extrabold text-white mono cursor-pointer hover:text-cyan-400 transition-colors"
                              >
                                {pos.symbol}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-md bg-gray-800 text-gray-300 text-xs font-bold">
                                {pos.sector}
                              </span>
                              <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                {pos.name}
                              </span>
                            </div>

                            {/* P&L Badges */}
                            <div className="flex items-center space-x-2">
                              <div className={`px-3 py-1.5 rounded-xl text-xs font-extrabold mono flex items-center space-x-1 ${
                                ((pos.dayChange || 0) >= 0) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                <span>Aaj Ka Move: {((pos.dayChange || 0) >= 0) ? '+' : ''}PKR {pos.todayPnlAmount?.toLocaleString()} ({((pos.dayChange || 0) >= 0) ? '+' : ''}{pos.dayChangePercent}%)</span>
                              </div>

                              <div className={`px-3.5 py-1.5 rounded-xl text-sm font-extrabold mono flex items-center space-x-1.5 ${
                                isPos ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              }`}>
                                {isPos ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                <span>Unrealized P&L: {isPos ? '+' : ''}PKR {pos.pnlAmount.toLocaleString()} ({isPos ? '+' : ''}{pos.pnlPercent}%)</span>
                              </div>
                            </div>
                          </div>

                          {/* Matrix */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#070B12] p-3 rounded-2xl border border-gray-800/80 text-xs">
                            <div>
                              <span className="text-[9px] uppercase text-gray-400 font-bold block">
                                Buy Rate {pos.commission > 0 ? `(+PKR ${pos.commission} Comm.)` : ''}
                              </span>
                              <span className="text-sm font-extrabold text-white mono">
                                PKR {Number(pos.buyPrice).toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase text-cyan-400 font-bold block">Live Market Rate</span>
                              <span className="text-sm font-extrabold text-cyan-400 mono">PKR {Number(pos.currentPrice).toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase text-gray-400 font-bold block">Holding Quantity</span>
                              <span className="text-sm font-extrabold text-white mono">{Number(pos.quantity).toLocaleString()} Shares</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase text-gray-400 font-bold block">Capital Invested</span>
                              <span className="text-sm font-extrabold text-amber-400 mono">
                                PKR {Number(pos.invested).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Action Controls: Sell / Book Profit, Edit, Delete */}
                        <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0">
                          {/* 💰 SELL / BOOK PROFIT BUTTON */}
                          <button
                            onClick={() => handleOpenSellModal(pos)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:opacity-90 text-black font-extrabold text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                            title="Sell shares and record in Realized Profit Journal"
                          >
                            <DollarSign className="w-4 h-4 stroke-[2.5]" />
                            <span>Sell / Book Profit</span>
                          </button>

                          <div className="flex items-center space-x-1.5 w-full">
                            <button
                              onClick={() => handleOpenEdit(pos)}
                              className="flex-1 px-2.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => onDeletePosition(pos._id)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-[11px] font-bold flex items-center justify-center space-x-1 cursor-pointer"
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
            <div className="bg-[#0D131F] p-4 rounded-3xl border border-gray-800">
              <span className="text-[10px] uppercase text-gray-400 font-bold block">Total Closed Trades</span>
              <span className="text-2xl font-black text-white mono mt-1 block">{closedTrades.length}</span>
              <span className="text-[10px] text-gray-500">Historical Executions</span>
            </div>

            <div className="bg-[#0D131F] p-4 rounded-3xl border border-amber-500/40">
              <span className="text-[10px] uppercase text-amber-400 font-bold block">Net Realized Profit</span>
              <span className={`text-2xl font-black mono mt-1 block ${totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalRealizedPnl >= 0 ? '+' : ''}PKR {totalRealizedPnl.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400">Total Booked Gain</span>
            </div>

            <div className="bg-[#0D131F] p-4 rounded-3xl border border-gray-800">
              <span className="text-[10px] uppercase text-gray-400 font-bold block">Trade Win Rate</span>
              <span className="text-2xl font-black text-cyan-400 mono mt-1 block">{winRate}%</span>
              <span className="text-[10px] text-gray-500">{winningTradesCount} of {closedTrades.length} Profitable</span>
            </div>

            <div className="bg-[#0D131F] p-4 rounded-3xl border border-gray-800">
              <span className="text-[10px] uppercase text-gray-400 font-bold block">Realized Return %</span>
              <span className={`text-2xl font-black mono mt-1 block ${totalRealizedPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalRealizedPct >= 0 ? '+' : ''}{totalRealizedPct.toFixed(2)}%
              </span>
              <span className="text-[10px] text-gray-500">All-Time ROI</span>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-[#0D131F] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
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
                  className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                >
                  Clear All History
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070B12] text-[10px] text-gray-400 uppercase font-bold border-b border-gray-800">
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
                <tbody className="divide-y divide-gray-800/60">
                  {closedTrades.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-gray-500 space-y-2">
                        <History className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                        <p className="font-bold text-gray-400">No Closed Trades Yet</p>
                        <p className="text-[11px] text-gray-500">
                          When you sell an active holding or record a sell trade, your realized profit history will be preserved here permanently.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    closedTrades.map(trade => {
                      const isProfit = trade.realizedPnl >= 0;

                      return (
                        <tr key={trade.id} className="hover:bg-gray-900/40 transition-colors">
                          <td className="py-3 px-4 text-gray-400 text-[11px] mono">
                            {trade.closedDate || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span 
                              onClick={() => onSelectStock(trade.symbol)}
                              className="font-black text-white mono cursor-pointer hover:text-cyan-400"
                            >
                              {trade.symbol}
                            </span>
                          </td>
                          <td className="py-3 px-4 mono text-gray-300">
                            PKR {Number(trade.buyPrice).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 mono text-white font-bold">
                            PKR {Number(trade.sellPrice).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 mono text-gray-300">
                            {Number(trade.quantity).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-black mono text-sm">
                            <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                              {isProfit ? '+' : ''}PKR {Number(trade.realizedPnl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-extrabold mono">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                              isProfit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}>
                              {isProfit ? '+' : ''}{trade.realizedPct}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-[11px] max-w-[150px] truncate">
                            {trade.notes || '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteClosedTrade(trade.id)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-800 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-gradient-to-b from-[#0F172A] via-[#0A0F1D] to-[#04070D] border border-cyan-500/40 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-xl border ${
                  tradeMode === 'BUY' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  {tradeMode === 'BUY' ? <PlusCircle className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    {tradeMode === 'BUY' ? 'Record Buy Trade Position' : 'Record Sell & Book Profit'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {tradeMode === 'BUY' ? 'Add stock to active portfolio for live tracking' : 'Record an executed sell trade to log realized profit'}
                  </p>
                </div>
              </div>
            </div>

            {/* Mode Switcher: BUY vs SELL */}
            <div className="flex bg-[#070B12] p-1 rounded-2xl border border-gray-800 mb-4">
              <button
                type="button"
                onClick={() => setTradeMode('BUY')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  tradeMode === 'BUY' 
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>🟢 Buy Trade (Active Portfolio)</span>
              </button>
              <button
                type="button"
                onClick={() => setTradeMode('SELL')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  tradeMode === 'SELL' 
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>🔴 Sell Trade (Book Profit)</span>
              </button>
            </div>

            {/* Quick Pick Stocks */}
            <div className="mb-4">
              <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1.5">
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
                        ? 'bg-cyan-500 text-black border-cyan-400 shadow'
                        : 'bg-[#070B12] text-gray-300 border-gray-800 hover:border-gray-700'
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
                <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                  Stock Symbol (Ticker):
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. OGDC, PPL, SYS, LUCK, PRL"
                    value={symbolInput}
                    onChange={e => handleSelectSymbol(e.target.value)}
                    className="w-full bg-[#070B12] border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-white font-extrabold mono uppercase placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Price Row: Buy Price & (Sell Price if Sell mode) */}
              <div className={`grid gap-3 ${tradeMode === 'SELL' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                    Your Buy / Entry Price (PKR):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 115.50"
                    value={buyPrice}
                    onChange={e => setBuyPrice(e.target.value)}
                    className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-white font-extrabold mono placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {tradeMode === 'SELL' && (
                  <div>
                    <label className="block text-[11px] font-bold text-amber-400 uppercase mb-1">
                      Your Sell / Exit Price (PKR):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 132.80"
                      value={sellPrice}
                      onChange={e => setSellPrice(e.target.value)}
                      className="w-full bg-[#070B12] border border-amber-500/60 rounded-xl px-3 py-2 text-amber-400 font-extrabold mono placeholder-gray-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
              </div>

              {/* Quantity & Commission */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                    Quantity (Number of Shares):
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1000"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-white font-extrabold mono placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                    Brokerage Fee / Tax per Share:
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.05"
                    value={commission}
                    onChange={e => setCommission(e.target.value)}
                    className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-white font-extrabold mono placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Trade Notes */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                  Trading Strategy / Notes (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swing trade on earnings breakout"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Live Preview Box */}
              {buyPrice && quantity && (
                <div className="bg-[#070B12] p-3 rounded-2xl border border-gray-800 space-y-1.5">
                  {tradeMode === 'BUY' ? (
                    <>
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Shares Gross Cost:</span>
                        <span className="font-bold text-white mono">
                          PKR {(Number(buyPrice) * Number(quantity)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-800 pt-1">
                        <span className="text-gray-300 font-bold">Total Capital Outlay:</span>
                        <span className="font-extrabold text-cyan-400 mono text-sm">
                          PKR {((Number(buyPrice) + Number(commission || 0)) * Number(quantity)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Total Buy Cost:</span>
                        <span className="font-bold text-white mono">
                          PKR {((Number(buyPrice) + Number(commission || 0)) * Number(quantity)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Total Sell Value:</span>
                        <span className="font-bold text-amber-400 mono">
                          PKR {((Number(sellPrice || buyPrice) - Number(commission || 0)) * Number(quantity)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-800 pt-1">
                        <span className="text-gray-300 font-bold">Net Realized Profit/Loss:</span>
                        {(() => {
                          const cost = (Number(buyPrice) + Number(commission || 0)) * Number(quantity);
                          const rev = (Number(sellPrice || buyPrice) - Number(commission || 0)) * Number(quantity);
                          const pnl = rev - cost;
                          const pct = cost > 0 ? (pnl / cost) * 100 : 0;
                          const isUp = pnl >= 0;
                          return (
                            <span className={`font-black mono text-sm ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
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
                className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-lg transition-all cursor-pointer ${
                  tradeMode === 'BUY'
                    ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-black shadow-cyan-500/25'
                    : 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-black shadow-amber-500/25'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-gradient-to-b from-[#0F172A] via-[#0A0F1D] to-[#04070D] border border-amber-500/40 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setSellingPosition(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Sell & Book Profit: {sellingPosition.symbol}</h3>
                <p className="text-xs text-gray-400">
                  Bought @ <b className="text-white mono">PKR {Number(sellingPosition.buyPrice).toFixed(2)}</b> ({sellingPosition.quantity} shares available)
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmSellHolding} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                  Quantity to Sell (Full or Partial):
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={sellingPosition.quantity}
                  value={sellHoldingQty}
                  onChange={e => setSellHoldingQty(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-white font-extrabold mono focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  Max available: {sellingPosition.quantity} shares
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-400 uppercase mb-1">
                  Actual Selling Price per Share (PKR):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={sellHoldingPrice}
                  onChange={e => setSellHoldingPrice(e.target.value)}
                  className="w-full bg-[#070B12] border border-amber-500/60 rounded-xl px-3 py-2 text-amber-400 font-black mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                  Brokerage Commission / Tax per Share:
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={sellHoldingComm}
                  onChange={e => setSellHoldingComm(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-white font-extrabold mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                  Exit Reason / Note:
                </label>
                <input
                  type="text"
                  value={sellHoldingNotes}
                  onChange={e => setSellHoldingNotes(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Realized P&L Calculation Box */}
              {sellHoldingPrice && sellHoldingQty && (
                <div className="bg-[#070B12] p-3.5 rounded-2xl border border-gray-800 space-y-1.5">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Buy Cost ({sellHoldingQty} × PKR {sellingPosition.buyPrice}):</span>
                    <span className="font-bold text-white mono">
                      PKR {((Number(sellingPosition.buyPrice) + Number(sellingPosition.commission || 0)) * Number(sellHoldingQty)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Sell Value ({sellHoldingQty} × PKR {sellHoldingPrice}):</span>
                    <span className="font-bold text-amber-400 mono">
                      PKR {((Number(sellHoldingPrice) - Number(sellHoldingComm || 0)) * Number(sellHoldingQty)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-800 pt-1.5">
                    <span className="text-gray-300 font-black">Net Realized Profit / Loss:</span>
                    {(() => {
                      const cost = (Number(sellingPosition.buyPrice) + Number(sellingPosition.commission || 0)) * Number(sellHoldingQty);
                      const rev = (Number(sellHoldingPrice) - Number(sellHoldingComm || 0)) * Number(sellHoldingQty);
                      const pnl = rev - cost;
                      const pct = cost > 0 ? (pnl / cost) * 100 : 0;
                      const isUp = pnl >= 0;
                      return (
                        <span className={`font-black mono text-base ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
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
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-black font-black text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-gradient-to-b from-[#0F172A] via-[#0A0F1D] to-[#04070D] border border-cyan-500/40 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setEditingPosition(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Edit Holding: {editingPosition.symbol}</h3>
                <p className="text-xs text-gray-400">Live Rate: <b className="text-cyan-400 mono">PKR {Number(editingPosition.currentPrice).toFixed(2)}</b></p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Buy Rate (PKR):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editBuyPrice}
                  onChange={e => setEditBuyPrice(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-white font-extrabold mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Commission per Share (PKR):</label>
                <input
                  type="number"
                  step="0.001"
                  value={editCommission}
                  onChange={e => setEditCommission(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-white font-extrabold mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Holding Quantity (Shares):</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editQuantity}
                  onChange={e => setEditQuantity(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-white font-extrabold mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Trading Strategy / Notes:</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
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

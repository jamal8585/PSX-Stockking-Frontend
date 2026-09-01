
import React, { useState } from 'react';
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
  Edit3
} from 'lucide-react';

const POPULAR_TICKERS = [
  'OGDC', 'PPL', 'MARI', 'SYS', 'LUCK', 'FFC', 'PSO', 'PRL', 'CNERGY', 'BOP', 'WTL', 'TELE', 'MEBL', 'HUBC'
];

export default function PortfolioAdvisor({ 
  portfolioData, 
  stocks = [], 
  onAddPosition, 
  onUpdatePosition,
  onDeletePosition, 
  onSelectStock 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [symbolInput, setSymbolInput] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [quantity, setQuantity] = useState('1000');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editBuyPrice, setEditBuyPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const { summary = {}, positions = [] } = portfolioData || {};

  const handleSelectSymbol = (sym, overridePrice = false) => {
    const sUpper = sym.toUpperCase();
    setSymbolInput(sUpper);
    const found = stocks.find(s => s.symbol.toUpperCase() === sUpper);
    if (found && (overridePrice || !buyPrice || buyPrice === '0')) {
      setBuyPrice(found.currentPrice);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sym = symbolInput.toUpperCase().trim();
    if (!sym) return;

    let finalPrice = Number(buyPrice);
    if (!finalPrice || isNaN(finalPrice)) {
      const found = stocks.find(s => s.symbol.toUpperCase() === sym);
      finalPrice = found?.currentPrice || 100;
    }

    const finalQty = Number(quantity) || 1000;

    setIsSubmitting(true);
    try {
      await onAddPosition({
        symbol: sym,
        buyPrice: finalPrice,
        quantity: finalQty,
        notes: notes.trim()
      });
      setIsModalOpen(false);
      setSymbolInput('');
      setBuyPrice('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (pos) => {
    setEditingPosition(pos);
    setEditBuyPrice(pos.buyPrice);
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
          quantity: Number(editQuantity),
          notes: editNotes.trim()
        });
      }
      setEditingPosition(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'EXIT_BOOK_PROFIT':
        return {
          label: 'SELL NOW / BOOK 100% PROFIT',
          className: 'bg-emerald-500 text-black font-extrabold shadow-lg shadow-emerald-500/25',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 stroke-[3]" />
        };
      case 'TAKE_PARTIAL_PROFIT':
        return {
          label: 'SCALE OUT 50% PROFIT',
          className: 'bg-teal-400 text-black font-extrabold shadow-md shadow-teal-500/20',
          icon: <TrendingUp className="w-3.5 h-3.5 mr-1" />
        };
      case 'HOLD_AND_RIDE':
        return {
          label: 'HOLD & RIDE MOMENTUM',
          className: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold',
          icon: <Layers className="w-3.5 h-3.5 mr-1" />
        };
      case 'ACCUMULATE_DIP':
        return {
          label: 'ACCUMULATE / AVERAGE DIP',
          className: 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold',
          icon: <PlusCircle className="w-3.5 h-3.5 mr-1" />
        };
      case 'TRIGGER_STOP_LOSS':
        return {
          label: 'TRIGGER STOP LOSS / EXIT',
          className: 'bg-rose-500 text-white font-extrabold shadow-lg shadow-rose-500/30',
          icon: <StopCircle className="w-3.5 h-3.5 mr-1 stroke-[3]" />
        };
      default:
        return {
          label: 'HOLD & MONITOR',
          className: 'bg-gray-800 text-gray-300 font-bold',
          icon: null
        };
    }
  };

  const isTotalPos = (summary.totalUnrealizedPnl || 0) >= 0;

  // Filtered stocks for autocomplete in modal
  const filteredOptions = stocks.filter(s => {
    if (!symbolInput) return true;
    const q = symbolInput.toUpperCase();
    return s.symbol.toUpperCase().includes(q) || (s.name && s.name.toUpperCase().includes(q));
  }).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Portfolio Telemetry */}
      <div className="bg-gradient-to-b from-[#0F172A] to-[#070B12] border border-cyan-900/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  My Portfolio & Live AI Exit Advisor
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Radio className="w-3 h-3 mr-1 inline animate-pulse" /> LIVE TRACKING
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Record your manual buy/sell trades to track real-time P&L with instant AI tips on <b>when to sell</b>, <b>when to buy more</b>, and <b>market news impact</b>.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:opacity-90 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Add Trade Position</span>
          </button>
        </div>

        {/* Portfolio Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-800/80">
          <div className="bg-[#070B12] rounded-xl p-3.5 border border-gray-800">
            <span className="text-[10px] uppercase text-gray-400 font-bold block">Total Capital Invested</span>
            <span className="text-xl font-extrabold text-white mono">
              PKR {(summary.totalInvested || 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-[#070B12] rounded-xl p-3.5 border border-gray-800">
            <span className="text-[10px] uppercase text-gray-400 font-bold block">Current Market Value</span>
            <span className="text-xl font-extrabold text-cyan-400 mono">
              PKR {(summary.totalCurrentValue || 0).toLocaleString()}
            </span>
          </div>

          <div className={`rounded-xl p-3.5 border ${
            isTotalPos ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
          }`}>
            <span className={`text-[10px] uppercase font-bold block ${isTotalPos ? 'text-emerald-400' : 'text-rose-400'}`}>
              Unrealized Profit / Loss
            </span>
            <span className={`text-xl font-extrabold mono flex items-center ${isTotalPos ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isTotalPos ? '+' : ''}PKR {(summary.totalUnrealizedPnl || 0).toLocaleString()}
              <span className="text-xs ml-1.5 font-bold">
                ({isTotalPos ? '+' : ''}{summary.totalPnlPercent || 0}%)
              </span>
            </span>
          </div>

          <div className="bg-[#070B12] rounded-xl p-3.5 border border-gray-800">
            <span className="text-[10px] uppercase text-gray-400 font-bold block">Active Positions</span>
            <span className="text-xl font-extrabold text-white mono">
              {summary.totalPositions || 0} <span className="text-xs text-gray-400 font-normal">Stocks (Win Rate: {summary.winRate || 0}%)</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED SECTION: PORTFOLIO AI STRATEGY & EXIT TIPS HUB */}
      {positions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-950/30 via-[#0D131F] to-cyan-950/30 border border-purple-500/30 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-purple-300">
                🎯 Portfolio AI Smart Tips & Market Action Signals ({positions.length} Active Holdings)
              </h3>
            </div>
            <span className="text-[11px] text-gray-400">
              Live Evaluation based on <b>Technicals + Breaking Sector News</b>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {positions.map((pos) => {
              const isProfit = pos.pnlAmount >= 0;
              const decision = getDecisionBadge(pos.aiAdvice?.decision);

              return (
                <div 
                  key={pos._id}
                  className="bg-[#070B12] border border-cyan-950 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-lg font-extrabold text-white mono">{pos.symbol}</span>
                        <span className="text-[10px] text-gray-400 ml-2">{pos.name}</span>
                      </div>
                      <span className={`text-xs font-extrabold mono px-2 py-0.5 rounded ${
                        isProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {isProfit ? '+' : ''}{pos.pnlPercent}%
                      </span>
                    </div>

                    {/* AI Decision Tag */}
                    <div className="mb-2.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] flex items-center w-fit ${decision.className}`}>
                        {decision.icon}
                        {decision.label}
                      </span>
                    </div>

                    {/* Rates Matrix: Buy vs Current vs Target vs Stop Loss */}
                    <div className="grid grid-cols-2 gap-2 bg-[#0D131F] p-2.5 rounded-lg border border-gray-800 text-[11px] mb-2.5">
                      <div>
                        <span className="text-[9px] uppercase text-gray-400 font-bold block">Aapka Buy Rate</span>
                        <span className="font-extrabold text-white mono">PKR {Number(pos.buyPrice).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-cyan-400 font-bold block">Current Live Price</span>
                        <span className="font-extrabold text-cyan-400 mono">PKR {Number(pos.currentPrice).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-emerald-400 font-bold block flex items-center">
                          <Target className="w-3 h-3 mr-0.5" /> Kab Sell Karein
                        </span>
                        <span className="font-extrabold text-emerald-400 mono">
                          PKR {pos.aiAdvice?.targetSellPrice}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-rose-400 font-bold block flex items-center">
                          <StopCircle className="w-3 h-3 mr-0.5" /> Stop Loss
                        </span>
                        <span className="font-extrabold text-rose-400 mono">
                          PKR {pos.aiAdvice?.stopLoss}
                        </span>
                      </div>
                    </div>

                    {/* AI Strategy Reasoning */}
                    <p className="text-[11px] text-gray-300 leading-snug bg-gray-900/40 p-2.5 rounded-lg border border-gray-800/60">
                      💡 <b className="text-cyan-300">Strategy Tip:</b> {pos.aiAdvice?.adviceSummary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
                    <button
                      onClick={() => handleOpenEdit(pos)}
                      className="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Buy Rate</span>
                    </button>

                    <button
                      onClick={() => onSelectStock(pos.symbol)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                    >
                      <LineChart className="w-3.5 h-3.5" />
                      <span>Chart</span>
                    </button>

                    <button
                      onClick={() => onDeletePosition(pos._id)}
                      className="text-rose-400 hover:text-rose-300 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Detailed Positions List & Financial Stats */}
      {positions.length === 0 ? (
        <div className="bg-[#0D131F] border border-gray-800/80 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Positions Entered Yet</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
              Click the <b>"Add Trade Position"</b> button above to record your buy trades. The terminal will track your live P&L and generate continuous AI exit & accumulation tips.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            Add Your First Trade
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>All Portfolio Holdings ({positions.length})</span>
            </h3>
            <span className="text-xs text-gray-400 font-medium">Real-Time DPS Pricing & Value Matrix</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {positions.map((pos) => {
              const isPos = pos.pnlAmount >= 0;

              return (
                <div
                  key={pos._id}
                  className={`bg-[#0D131F] border rounded-2xl p-5 shadow-xl transition-all ${
                    isPos ? 'border-emerald-500/30' : 'border-rose-500/30'
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
                            <span>Total P&L: {isPos ? '+' : ''}PKR {pos.pnlAmount.toLocaleString()} ({isPos ? '+' : ''}{pos.pnlPercent}%)</span>
                          </div>
                        </div>
                      </div>

                      {/* Matrix */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#070B12] p-3 rounded-xl border border-gray-800/80 text-xs">
                        <div>
                          <span className="text-[9px] uppercase text-gray-400 font-bold block">Aapka Buy Price</span>
                          <span className="text-sm font-extrabold text-white mono">PKR {Number(pos.buyPrice).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-cyan-400 font-bold block">Current Market Price</span>
                          <span className="text-sm font-extrabold text-cyan-400 mono">PKR {Number(pos.currentPrice).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-gray-400 font-bold block">Holding Quantity</span>
                          <span className="text-sm font-extrabold text-white mono">{Number(pos.quantity).toLocaleString()} Shares</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-gray-400 font-bold block">Current Total Value</span>
                          <span className="text-sm font-extrabold text-emerald-400 mono">PKR {Number(pos.currentValue).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(pos)}
                        className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Buy Rate</span>
                      </button>

                      <button
                        onClick={() => onDeletePosition(pos._id)}
                        className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Enhanced Add Position Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-gradient-to-b from-[#0F172A] to-[#070B12] border border-cyan-500/30 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Record Trade Position</h3>
                <p className="text-xs text-gray-400">Enter your buy trade to enable real-time P&L and AI exit advisory.</p>
              </div>
            </div>

            {/* Quick Popular Ticker Buttons */}
            <div className="mb-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1.5">Quick Pick Popular Stocks:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TICKERS.map(sym => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => handleSelectSymbol(sym, true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold mono transition-all cursor-pointer ${
                      symbolInput.toUpperCase() === sym 
                        ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30' 
                        : 'bg-[#070B12] border border-gray-800 text-gray-300 hover:text-white hover:border-cyan-500/40'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Type / Search Stock Symbol */}
              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  Enter Stock Symbol (e.g. OGDC, PPL, SYS, LUCK, FFC, WTL):
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Type ticker symbol..."
                    value={symbolInput}
                    onChange={e => handleSelectSymbol(e.target.value)}
                    className="w-full bg-[#070B12] border border-cyan-900 rounded-xl pl-9 pr-3 py-2.5 text-white font-extrabold mono text-xs focus:outline-none focus:border-cyan-400 uppercase"
                  />
                </div>

                {/* Autocomplete suggestions preview */}
                {symbolInput && filteredOptions.length > 0 && (
                  <div className="bg-[#070B12] border border-gray-800 rounded-xl p-2 mt-1.5 max-h-32 overflow-y-auto space-y-1">
                    {filteredOptions.map(opt => (
                      <div
                        key={opt.symbol}
                        onClick={() => handleSelectSymbol(opt.symbol, true)}
                        className="p-1.5 rounded-lg hover:bg-cyan-500/10 cursor-pointer flex justify-between items-center text-[11px]"
                      >
                        <span className="font-extrabold text-white mono">{opt.symbol} - {opt.name}</span>
                        <span className="text-cyan-400 mono font-bold">PKR {opt.currentPrice}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buy Price */}
              <div>
                <label className="block text-gray-300 font-bold mb-1">Your Buy / Entry Price (PKR):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 325.20"
                  value={buyPrice}
                  onChange={e => setBuyPrice(e.target.value)}
                  className="w-full bg-[#070B12] border border-cyan-900 rounded-xl px-3 py-2.5 text-white font-extrabold mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-gray-300 font-bold mb-1">Quantity (Number of Shares):</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 1000"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full bg-[#070B12] border border-cyan-900 rounded-xl px-3 py-2.5 text-white font-extrabold mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-gray-300 font-bold mb-1">Trading Strategy / Notes (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Swing trade on circular debt news"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-gray-200 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Preview Total */}
              {buyPrice && quantity && (
                <div className="bg-[#070B12] p-3 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
                  <span className="text-gray-400">Total Capital Outlay:</span>
                  <span className="font-extrabold text-cyan-400 mono text-sm">
                    PKR {(Number(buyPrice) * Number(quantity)).toLocaleString()}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:opacity-90 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                {isSubmitting ? 'Saving Position...' : 'Save Trade Position & Activate AI Advice'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal 2: Edit Position Buy Rate & Quantity */}
      {editingPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-gradient-to-b from-[#0F172A] to-[#070B12] border border-amber-500/40 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setEditingPosition(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Update Buy Rate for {editingPosition.symbol}</h3>
                <p className="text-xs text-gray-400">Live Market Price: <b className="text-cyan-400 mono">PKR {Number(editingPosition.currentPrice).toFixed(2)}</b></p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Your Actual Buy Rate (PKR):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editBuyPrice}
                  onChange={e => setEditBuyPrice(e.target.value)}
                  className="w-full bg-[#070B12] border border-amber-900/60 rounded-xl px-3 py-2.5 text-white font-extrabold mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Holding Quantity (Shares):</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editQuantity}
                  onChange={e => setEditQuantity(e.target.value)}
                  className="w-full bg-[#070B12] border border-amber-900/60 rounded-xl px-3 py-2.5 text-white font-extrabold mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Trading Strategy / Notes:</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full bg-[#070B12] border border-gray-800 rounded-xl px-3 py-2 text-gray-200 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Live Preview of Recalculated P&L */}
              {editBuyPrice && editQuantity && (
                <div className="bg-[#070B12] p-3 rounded-xl border border-gray-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Invested Capital:</span>
                    <span className="font-bold text-white mono">PKR {(Number(editBuyPrice) * Number(editQuantity)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Recalculated Profit/Loss:</span>
                    <span className={`font-extrabold mono ${
                      ((editingPosition.currentPrice - editBuyPrice) >= 0) ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {((editingPosition.currentPrice - editBuyPrice) >= 0 ? '+' : '')}PKR {((editingPosition.currentPrice - editBuyPrice) * editQuantity).toLocaleString(undefined, { minimumFractionDigits: 2 })} ({(((editingPosition.currentPrice - editBuyPrice)/editBuyPrice)*100).toFixed(2)}%)
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {isSubmitting ? 'Updating...' : 'Update & Recalculate Live P&L'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

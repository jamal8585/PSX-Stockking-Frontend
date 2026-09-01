import React from 'react';
import { X, Bookmark, Trash2, LineChart, Calculator } from 'lucide-react';

export default function WatchlistModal({ watchlist, onClose, onSelectStock, onOpenCalculator, onRemove }) {
  if (!watchlist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#151E2E] border border-[#E2E8F0] dark:border-[#243044] rounded-xl w-full max-w-lg shadow-2xl p-6 relative text-[#0F172A] dark:text-[#F8FAFC] transition-all">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-[#D97706]/10 dark:bg-[#F59E0B]/10 border border-[#D97706]/20 dark:border-[#F59E0B]/20 flex items-center justify-center text-[#D97706] dark:text-[#F59E0B]">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Your Saved PSX Watchlist ({watchlist.length})</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Quick access to your monitored tickers</p>
          </div>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-8 text-[#64748B] dark:text-[#94A3B8] text-xs bg-[#F8FAFC] dark:bg-[#0B0F19] rounded-lg border border-[#E2E8F0] dark:border-[#243044] p-6">
            No stocks bookmarked yet. Click the bookmark icon next to any stock in the screener to track it here.
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {watchlist.map(stock => {
              const isPos = stock.change >= 0;
              return (
                <div 
                  key={stock.symbol}
                  className="bg-[#F8FAFC] dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-[#243044] rounded-lg p-3 flex items-center justify-between hover:border-[#2563EB] dark:hover:border-[#3B82F6] transition-all"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mono text-sm">{stock.symbol}</span>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate max-w-[120px]">{stock.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5 text-xs">
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mono">PKR {Number(stock.currentPrice).toFixed(2)}</span>
                      <span className={`font-bold mono text-[11px] ${isPos ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#DC2626] dark:text-[#EF4444]'}`}>
                        {isPos ? '+' : ''}{Number(stock.changePercent).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCalculator({
                          symbol: stock.symbol,
                          companyName: stock.name,
                          currentPrice: stock.currentPrice,
                          stopLoss: stock.technicals?.support1 || (stock.currentPrice * 0.95),
                          target1: stock.technicals?.resistance1 || (stock.currentPrice * 1.08),
                          signal: stock.technicals?.signal || 'HOLD'
                        });
                      }}
                      className="p-1.5 rounded-lg bg-[#2563EB]/10 dark:bg-[#3B82F6]/10 text-[#2563EB] dark:text-[#3B82F6] hover:bg-[#2563EB] hover:text-white dark:hover:bg-[#3B82F6] transition-all cursor-pointer"
                      title="Open Position Sizer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectStock(stock.symbol);
                      }}
                      className="p-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#243044] transition-all cursor-pointer"
                      title="View Chart"
                    >
                      <LineChart className="w-3.5 h-3.5" />
                    </button>
                    {onRemove && (
                      <button
                        onClick={() => onRemove(stock.symbol)}
                        className="p-1.5 rounded-lg bg-[#DC2626]/10 text-[#DC2626] dark:text-[#EF4444] hover:bg-[#DC2626] hover:text-white transition-all cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

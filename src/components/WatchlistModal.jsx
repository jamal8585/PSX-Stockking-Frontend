
import React from 'react';
import { X, Bookmark, Trash2, LineChart, Calculator } from 'lucide-react';

export default function WatchlistModal({ watchlist, onClose, onSelectStock, onOpenCalculator, onRemove }) {
  if (!watchlist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <Bookmark className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Your Saved PSX Watchlist ({watchlist.length})</h2>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs">
            No stocks bookmarked yet. Click the bookmark icon next to any stock in the screener to track it here.
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {watchlist.map(stock => {
              const isPos = stock.change >= 0;
              return (
                <div 
                  key={stock.symbol}
                  className="bg-gray-900/90 border border-gray-800 rounded-xl p-3 flex items-center justify-between hover:border-gray-700 transition-all"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-white mono text-sm">{stock.symbol}</span>
                      <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{stock.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5 text-xs">
                      <span className="font-bold text-white mono">PKR {stock.currentPrice.toFixed(2)}</span>
                      <span className={`font-semibold mono text-[11px] ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? '+' : ''}{stock.changePercent.toFixed(2)}%
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
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all"
                      title="Open Calculator"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectStock(stock.symbol);
                      }}
                      className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
                      title="View Chart"
                    >
                      <LineChart className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemove(stock.symbol)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

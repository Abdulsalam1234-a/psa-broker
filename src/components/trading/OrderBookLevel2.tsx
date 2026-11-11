import React, { useMemo } from 'react';
import { Stock } from '../../types';
import { generateOrderBook } from '../../services/marketSimulator';
import { Layers } from 'lucide-react';

interface OrderBookLevel2Props {
  stock: Stock;
  onPriceClick?: (price: number) => void;
}

export const OrderBookLevel2: React.FC<OrderBookLevel2Props> = ({ stock, onPriceClick }) => {
  const orderBook = useMemo(() => {
    return generateOrderBook(stock);
  }, [stock.ticker, stock.currentPrice]);

  const maxVolume = useMemo(() => {
    const allVols = [
      ...orderBook.bids.map(b => b.quantity),
      ...orderBook.asks.map(a => a.quantity),
    ];
    return Math.max(...allVols, 100000);
  }, [orderBook]);

  return (
    <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-4 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-navy-700/60 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gold-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Level 2 Market Depth (5-Tier)
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Spread: ₦{orderBook.spread.toFixed(2)} ({orderBook.spreadPct}%)
        </span>
      </div>

      <div className="text-[11px] font-semibold text-slate-400 grid grid-cols-3 mb-1.5 px-2">
        <span>Price (₦)</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total (₦)</span>
      </div>

      {/* Asks (Sell Orders - descending from top to lowest ask) */}
      <div className="space-y-1">
        {orderBook.asks.slice().reverse().map((ask, i) => {
          const depthPct = Math.min(100, (ask.quantity / maxVolume) * 100);
          return (
            <div
              key={`ask-${i}`}
              onClick={() => onPriceClick && onPriceClick(ask.price)}
              className="relative grid grid-cols-3 items-center py-1 px-2 rounded hover:bg-navy-800/80 transition-colors cursor-pointer text-xs font-mono"
            >
              {/* Depth bar fill */}
              <div 
                className="absolute right-0 top-0 bottom-0 bg-bear/15 rounded-r pointer-events-none"
                style={{ width: `${depthPct}%` }}
              />
              <span className="text-bear font-semibold z-10">₦{ask.price.toFixed(2)}</span>
              <span className="text-right text-slate-300 z-10">{ask.quantity.toLocaleString()}</span>
              <span className="text-right text-slate-400 z-10">{(ask.total / 1000).toFixed(0)}k</span>
            </div>
          );
        })}
      </div>

      {/* Current Mid-Market Banner */}
      <div className="my-2 py-1.5 px-3 bg-navy-800/90 border-y border-navy-700 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Current NGX Tick:</span>
        <span className="text-base font-bold text-gold-400">₦{stock.currentPrice.toFixed(2)}</span>
        <span className={`text-[11px] font-semibold ${stock.dayChange >= 0 ? 'text-bull' : 'text-bear'}`}>
          {stock.dayChange >= 0 ? '+' : ''}{stock.dayChangePct.toFixed(2)}%
        </span>
      </div>

      {/* Bids (Buy Orders - highest bid to lower) */}
      <div className="space-y-1">
        {orderBook.bids.map((bid, i) => {
          const depthPct = Math.min(100, (bid.quantity / maxVolume) * 100);
          return (
            <div
              key={`bid-${i}`}
              onClick={() => onPriceClick && onPriceClick(bid.price)}
              className="relative grid grid-cols-3 items-center py-1 px-2 rounded hover:bg-navy-800/80 transition-colors cursor-pointer text-xs font-mono"
            >
              {/* Depth bar fill */}
              <div 
                className="absolute right-0 top-0 bottom-0 bg-bull/15 rounded-r pointer-events-none"
                style={{ width: `${depthPct}%` }}
              />
              <span className="text-bull font-semibold z-10">₦{bid.price.toFixed(2)}</span>
              <span className="text-right text-slate-300 z-10">{bid.quantity.toLocaleString()}</span>
              <span className="text-right text-slate-400 z-10">{(bid.total / 1000).toFixed(0)}k</span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-3 border-t border-navy-800 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Click any price row to copy to Order Ticket</span>
        <span className="text-slate-400">Queue: T+0</span>
      </div>
    </div>
  );
};

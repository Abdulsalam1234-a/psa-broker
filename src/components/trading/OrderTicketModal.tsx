import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Stock, OrderType, OrderSide } from '../../types';
import { calculateNGXTransactionFee, formatNaira } from '../../services/feeEngine';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle, 
  Info,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface OrderTicketModalProps {
  stock: Stock;
  prefilledPrice?: number;
  onClose?: () => void;
}

export const OrderTicketModal: React.FC<OrderTicketModalProps> = ({ 
  stock, 
  prefilledPrice,
}) => {
  const { activeAccount, placeOrder, events } = useApp();

  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [inputMode, setInputMode] = useState<'UNITS' | 'NAIRA'>('UNITS');
  const [nairaAmountInput, setNairaAmountInput] = useState<string>('50000');
  const [quantity, setQuantity] = useState<number>(1000);
  const [targetPrice, setTargetPrice] = useState<number>(prefilledPrice || stock.currentPrice);
  const [stopLossPrice, setStopLossPrice] = useState<number>(Number((stock.currentPrice * 0.95).toFixed(2)));
  const [limitStopPrice, setLimitStopPrice] = useState<number>(Number((stock.currentPrice * 0.94).toFixed(2)));
  const [thesisNote, setThesisNote] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Shares owned in active account
  const ownedPosition = useMemo(() => {
    return activeAccount.positions.find(p => p.ticker === stock.ticker);
  }, [activeAccount, stock.ticker]);

  const ownedShares = ownedPosition ? ownedPosition.quantity : 0;

  // Order price depending on type
  const activePrice = orderType === 'LIMIT' ? targetPrice : stock.currentPrice;
  const grossTotal = Number((activePrice * (quantity || 0)).toFixed(2));
  const feeBreakdown = useMemo(() => calculateNGXTransactionFee(grossTotal), [grossTotal]);
  const netRequired = orderSide === 'BUY' 
    ? Number((grossTotal + feeBreakdown.totalFee).toFixed(2))
    : Number((grossTotal - feeBreakdown.totalFee).toFixed(2));

  // Single stock concentration warning (>25% rule)
  const isConcentrationWarning = useMemo(() => {
    if (orderSide !== 'BUY' || activeAccount.type !== 'EVENT' || !activeAccount.eventId) return false;
    const ev = events.find(e => e.id === activeAccount.eventId);
    const maxPct = ev ? ev.maxSingleStockPct : 0.25;

    const currentStockVal = ownedPosition ? ownedPosition.marketValue : 0;
    const projectedStockVal = currentStockVal + grossTotal;
    const projectedWeight = activeAccount.portfolioValue > 0 ? (projectedStockVal / activeAccount.portfolioValue) : 0;

    return projectedWeight > maxPct;
  }, [orderSide, activeAccount, grossTotal, ownedPosition, events]);

  // Quick allocation buttons
  const handleQuickPercent = (pct: number) => {
    if (orderSide === 'BUY') {
      const available = activeAccount.cashBalance * pct;
      // account for ~1.5% fee
      const usableCash = available / 1.015;
      const shares = Math.floor(usableCash / activePrice);
      setQuantity(Math.max(1, shares));
    } else {
      const shares = Math.floor(ownedShares * pct);
      setQuantity(Math.max(1, shares));
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (quantity <= 0) {
      setNotification({ type: 'error', text: 'Enter a share quantity of at least 1 unit.' });
      return;
    }

    if (grossTotal < 1000) {
      const minUnits = Math.ceil(1000 / (activePrice || 1));
      setNotification({
        type: 'error',
        text: `Minimum trade order value is ₦1,000.00. Current gross value is ${formatNaira(grossTotal)}. Please enter at least ${minUnits.toLocaleString()} units.`,
      });
      return;
    }

    const res = placeOrder({
      ticker: stock.ticker,
      orderType,
      orderSide,
      quantity,
      targetPrice: orderType === 'LIMIT' ? targetPrice : undefined,
      stopLossPrice: (orderType === 'STOP_LOSS' || orderType === 'STOP_LIMIT') ? stopLossPrice : undefined,
      limitStopPrice: orderType === 'STOP_LIMIT' ? limitStopPrice : undefined,
      thesisNote,
    });

    if (res.success) {
      setNotification({ type: 'success', text: res.message });
      setThesisNote('');
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-5 shadow-2xl flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-navy-700/60 pb-3">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Order Entry Ticket
          </span>
          <div className="text-base font-bold text-white font-mono flex items-center gap-2">
            <span>{stock.ticker}</span>
            <span className="text-xs font-normal text-slate-400">• {stock.name}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-slate-400">Current Market</div>
          <div className="text-base font-bold font-mono text-gold-400">
            ₦{stock.currentPrice.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Buy / Sell Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-navy-800 rounded-xl border border-navy-700">
        <button
          type="button"
          onClick={() => { setOrderSide('BUY'); setNotification(null); }}
          className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            orderSide === 'BUY'
              ? 'bg-bull text-navy-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          <span>Buy Equities</span>
        </button>
        <button
          type="button"
          onClick={() => { setOrderSide('SELL'); setNotification(null); }}
          className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            orderSide === 'SELL'
              ? 'bg-bear text-white shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
          <span>Sell Equities</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmitOrder} className="space-y-4">
        {/* Order Type */}
        <div className="grid grid-cols-4 gap-1.5">
          {(['MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LIMIT'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`py-1.5 px-1.5 text-[11px] font-semibold rounded-lg border transition-all text-center ${
                orderType === type
                  ? 'bg-navy-700 border-gold-500/80 text-gold-300 font-bold'
                  : 'bg-navy-800/80 border-navy-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'MARKET' ? 'Market' : type === 'LIMIT' ? 'Limit' : type === 'STOP_LOSS' ? 'Stop-Loss' : 'Stop-Limit'}
            </button>
          ))}
        </div>

        {/* Limit Target Price Input */}
        {orderType === 'LIMIT' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Target Execution Price (₦)
            </label>
            <input
              type="number"
              step="0.05"
              value={targetPrice}
              onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-navy-800 border border-navy-600 focus:border-gold-500 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none"
            />
          </div>
        )}

        {/* Stop Loss Input */}
        {orderType === 'STOP_LOSS' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span>Trigger Stop Price (₦)</span>
              <span className="text-[10px] text-bull flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                +10 Discipline Points on Leaderboard
              </span>
            </label>
            <input
              type="number"
              step="0.05"
              value={stopLossPrice}
              onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-navy-800 border border-navy-600 focus:border-gold-500 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none"
            />
          </div>
        )}

        {/* Stop Limit Input */}
        {orderType === 'STOP_LIMIT' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Stop Trigger (₦)
              </label>
              <input
                type="number"
                step="0.05"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-navy-800 border border-navy-600 focus:border-gold-500 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Limit Price (₦)
              </label>
              <input
                type="number"
                step="0.05"
                value={limitStopPrice}
                onChange={(e) => setLimitStopPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-navy-800 border border-navy-600 focus:border-gold-500 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Quantity & Amount Input with Flexible Modes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5 bg-navy-800 p-0.5 rounded-lg border border-navy-700">
              <button
                type="button"
                onClick={() => setInputMode('UNITS')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all ${
                  inputMode === 'UNITS'
                    ? 'bg-gold-500 text-navy-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                By Units (Shares)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode('NAIRA');
                  setNairaAmountInput(String(Math.max(1000, grossTotal)));
                }}
                className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all ${
                  inputMode === 'NAIRA'
                    ? 'bg-gold-500 text-navy-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                By Value (₦)
              </button>
            </div>

            <span className="text-slate-400 text-[11px]">
              {orderSide === 'BUY' 
                ? `Power: ${formatNaira(activeAccount.cashBalance)}`
                : `Owned: ${ownedShares.toLocaleString()} shs`
              }
            </span>
          </div>

          {inputMode === 'UNITS' ? (
            <div>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setQuantity(val);
                }}
                placeholder="Enter any unit quantity (e.g. 100, 500, 1000)..."
                className="w-full bg-navy-800 border border-navy-600 focus:border-gold-500 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 px-1">
                <span>Value: <strong className="text-white font-mono">{formatNaira(grossTotal)}</strong></span>
                <span className={grossTotal >= 1000 ? 'text-bull font-bold' : 'text-amber-400 font-bold'}>
                  {grossTotal >= 1000 ? '✓ Value ≥ ₦1,000' : '⚠️ Min trade value is ₦1,000'}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">₦</span>
                <input
                  type="number"
                  min="1000"
                  step="100"
                  value={nairaAmountInput}
                  onChange={(e) => {
                    const str = e.target.value;
                    setNairaAmountInput(str);
                    const naira = parseFloat(str) || 0;
                    const calculatedUnits = Math.max(1, Math.floor(naira / (activePrice || 1)));
                    setQuantity(calculatedUnits);
                  }}
                  placeholder="Min ₦1,000 (e.g. 50000)"
                  className="w-full bg-navy-800 border border-navy-600 focus:border-gold-500 rounded-xl pl-8 pr-3 py-2 text-sm text-white font-mono font-bold focus:outline-none"
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 px-1">
                <span>Equivalent Units: <strong className="text-gold-400 font-mono font-bold">{quantity.toLocaleString()} shares</strong></span>
                <span className={grossTotal >= 1000 ? 'text-bull font-bold' : 'text-amber-400 font-bold'}>
                  {grossTotal >= 1000 ? '✓ Valid (≥ ₦1,000)' : '⚠️ Min ₦1,000'}
                </span>
              </div>
            </div>
          )}

          {/* Quick Percent Buttons */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[0.25, 0.50, 0.75, 1.0].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickPercent(pct)}
                className="py-1 text-[11px] font-semibold rounded bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 font-mono"
              >
                {pct * 100}%
              </button>
            ))}
          </div>
        </div>

        {/* Single Stock Concentration Warning Alert */}
        {isConcentrationWarning && (
          <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-200 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-300 block">
                Discipline Penalty Warning (&gt;25% Concentration)
              </strong>
              This purchase pushes {stock.ticker} above 25% of your total event portfolio, which will trigger a 20-point deduction on your Leaderboard Discipline Score!
            </div>
          </div>
        )}

        {/* Trade Thesis / Academic Checklist Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              Pre-Trade Investment Thesis (Optional)
            </span>
            <span className="text-[10px] text-gold-400 font-semibold">+25 XP & Research Pts</span>
          </label>
          <textarea
            rows={2}
            value={thesisNote}
            onChange={(e) => setThesisNote(e.target.value)}
            placeholder="e.g. Valuation rationale: 3-statement check confirms growing OCF, low debt-to-equity (0.6x), and attractive dividend yield..."
            className="w-full bg-navy-800 border border-navy-600 focus:border-gold-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none resize-none font-sans"
          />
        </div>

        {/* Statutory Fee Breakdown Accordion / Card */}
        <div className="p-3.5 bg-navy-950/70 border border-navy-700/80 rounded-xl space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400 font-sans pb-1 border-b border-navy-800">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Info className="w-3.5 h-3.5 text-gold-400" />
              Statutory NGX Fee Slip (~1.48%)
            </span>
            <span>T+0 Demat Fill</span>
          </div>

          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>Gross Order Value:</span>
            <span className="text-slate-200">₦{grossTotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>SEC Regulatory Fee (0.30%):</span>
            <span>₦{feeBreakdown.secFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>CSCS Depository Fee (0.35%):</span>
            <span>₦{feeBreakdown.cscsFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>Brokerage Commission (0.70%):</span>
            <span>₦{feeBreakdown.brokerFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>Stamp Duty & VAT (0.075% + 7.5%):</span>
            <span>₦{(feeBreakdown.stampDuty + feeBreakdown.vatFee).toFixed(2)}</span>
          </div>

          <div className="pt-1.5 border-t border-navy-800 flex justify-between font-bold text-sm text-white">
            <span className="text-gold-300 font-sans">
              {orderSide === 'BUY' ? 'Total Cash Deducted:' : 'Net Cash Proceeds:'}
            </span>
            <span className={orderSide === 'BUY' ? 'text-bull' : 'text-gold-400'}>
              ₦{netRequired.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-bull/20 text-bull border border-bull/40'
              : 'bg-bear/20 text-bear border border-bear/40'
          }`}>
            <span>{notification.text}</span>
          </div>
        )}

        {/* Submit Execution Button */}
        <button
          type="submit"
          className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
            orderSide === 'BUY'
              ? 'bg-bull hover:bg-emerald-400 text-navy-950 font-extrabold shadow-bull/20'
              : 'bg-bear hover:bg-red-400 text-white font-extrabold shadow-bear/20'
          }`}
        >
          {orderSide === 'BUY' ? 'Execute Buy Order' : 'Execute Sell Order'}
        </button>
      </form>
    </div>
  );
};

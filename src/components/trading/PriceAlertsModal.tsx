import React, { useState } from 'react';
import { Stock, PriceAlert } from '../../types';
import { formatNaira } from '../../services/feeEngine';
import { 
  Bell, 
  Plus, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Clock 
} from 'lucide-react';

interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: Stock[];
  alerts: PriceAlert[];
  onAddAlert: (ticker: string, targetPrice: number, condition: 'ABOVE' | 'BELOW') => void;
  onRemoveAlert: (alertId: string) => void;
  onClearTriggered: () => void;
}

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({
  isOpen,
  onClose,
  stocks,
  alerts,
  onAddAlert,
  onRemoveAlert,
  onClearTriggered,
}) => {
  const [selectedTicker, setSelectedTicker] = useState<string>(stocks[0]?.ticker || 'ZENITHBANK');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentStock = stocks.find(s => s.ticker === selectedTicker);
  const currentPrice = currentStock?.currentPrice || 0;

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(targetPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setValidationError('Please enter a valid price in Naira greater than ₦0.00');
      return;
    }

    onAddAlert(selectedTicker, priceNum, condition);
    setTargetPrice('');
    setValidationError(null);
  };

  const activeAlerts = alerts.filter(a => !a.isTriggered);
  const triggeredAlerts = alerts.filter(a => a.isTriggered);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-xl bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-navy-950 px-6 py-4 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center border border-gold-500/30">
              <Bell className="w-4 h-4 text-gold-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Real-Time Price Alerts</h3>
              <p className="text-[11px] text-slate-400">Audio alerts & notifications when equities reach your price targets</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Create Alert Form */}
          <form onSubmit={handleCreateAlert} className="p-4 rounded-xl bg-navy-850 border border-navy-750 space-y-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-gold-400" />
              <span>Set New Price Alert</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Stock Picker */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Ticker
                </label>
                <select
                  value={selectedTicker}
                  onChange={(e) => {
                    setSelectedTicker(e.target.value);
                    const s = stocks.find(x => x.ticker === e.target.value);
                    if (s) {
                      setTargetPrice(s.currentPrice.toFixed(2));
                    }
                  }}
                  className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500 font-mono"
                >
                  {stocks.map(s => (
                    <option key={s.ticker} value={s.ticker}>
                      {s.ticker} (₦{s.currentPrice.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Trigger Condition
                </label>
                <div className="grid grid-cols-2 gap-1 bg-navy-900 p-0.5 rounded-lg border border-navy-700">
                  <button
                    type="button"
                    onClick={() => setCondition('ABOVE')}
                    className={`py-1 text-[11px] font-bold rounded flex items-center justify-center gap-1 transition-all ${
                      condition === 'ABOVE'
                        ? 'bg-bull text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>Above (≥)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition('BELOW')}
                    className={`py-1 text-[11px] font-bold rounded flex items-center justify-center gap-1 transition-all ${
                      condition === 'BELOW'
                        ? 'bg-bear text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingDown className="w-3 h-3" />
                    <span>Below (≤)</span>
                  </button>
                </div>
              </div>

              {/* Target Price */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Target Price (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-mono">₦</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 55.00"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg pl-6 pr-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {currentStock && (
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>
                  Current Price: <strong className="text-white font-mono">₦{currentStock.currentPrice.toFixed(2)}</strong>
                </span>
                {targetPrice && !isNaN(parseFloat(targetPrice)) && (
                  <span className="font-mono text-gold-300">
                    Delta: {((parseFloat(targetPrice) - currentStock.currentPrice) / currentStock.currentPrice * 100).toFixed(2)}%
                  </span>
                )}
              </div>
            )}

            {validationError && (
              <div className="text-bear text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{validationError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Create Active Alert</span>
            </button>
          </form>

          {/* Active Alerts List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Active Watchlist Alerts ({activeAlerts.length})
              </h4>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-navy-800 rounded-xl">
                No active price alerts set. Pick an equity above to monitor target breakouts.
              </div>
            ) : (
              <div className="space-y-2">
                {activeAlerts.map(alert => {
                  const s = stocks.find(x => x.ticker === alert.ticker);
                  const cur = s?.currentPrice || 0;
                  const isNear = Math.abs(cur - alert.targetPrice) / alert.targetPrice < 0.02;

                  return (
                    <div
                      key={alert.id}
                      className="p-3 rounded-xl bg-navy-850 border border-navy-750 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${
                          alert.condition === 'ABOVE' ? 'bg-bull/20 text-bull' : 'bg-bear/20 text-bear'
                        }`}>
                          {alert.condition === 'ABOVE' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{alert.ticker}</span>
                            <span className="text-[10px] text-slate-400 font-normal font-sans">
                              {alert.stockName}
                            </span>
                            {isNear && (
                              <span className="text-[9px] bg-gold-500/20 text-gold-300 px-1.5 py-0.2 rounded font-mono font-bold animate-pulse">
                                NEAR TARGET
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Target: <strong className="text-white">₦{alert.targetPrice.toFixed(2)}</strong> ({alert.condition}) • Current: ₦{cur.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveAlert(alert.id)}
                        className="p-1.5 text-slate-400 hover:text-bear rounded-lg hover:bg-navy-800 transition-colors"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Triggered Alerts History */}
          {triggeredAlerts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-bull uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-bull" />
                  <span>Recently Triggered ({triggeredAlerts.length})</span>
                </h4>
                <button
                  onClick={onClearTriggered}
                  className="text-[11px] text-slate-400 hover:text-white transition-colors"
                >
                  Clear History
                </button>
              </div>

              <div className="space-y-2">
                {triggeredAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-xl bg-bull/10 border border-bull/30 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{alert.ticker} TARGET REACHED</span>
                        <span className="text-[10px] text-bull font-bold">₦{alert.targetPrice.toFixed(2)}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Triggered: {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleTimeString() : 'Just now'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveAlert(alert.id)}
                      className="p-1 text-slate-400 hover:text-bear transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

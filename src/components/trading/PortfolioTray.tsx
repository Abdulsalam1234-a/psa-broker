import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../services/feeEngine';
import { Stock, Order, UserPosition } from '../../types';
import { 
  Briefcase, 
  Clock, 
  PieChart, 
  XCircle, 
  FileText, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface PortfolioTrayProps {
  onSelectStock: (ticker: string) => void;
  onQuickSell: (stock: Stock) => void;
}

export const PortfolioTray: React.FC<PortfolioTrayProps> = ({ onSelectStock, onQuickSell }) => {
  const { activeAccount, stocks, cancelOrder } = useApp();

  const [activeTab, setActiveTab] = useState<'POSITIONS' | 'ORDERS' | 'SUMMARY'>('POSITIONS');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedContractNote, setSelectedContractNote] = useState<Order | null>(null);

  const pendingOrdersCount = activeAccount.orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="bg-navy-900/95 border border-navy-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      {/* Tray Header & Tab Bar */}
      <div className="bg-navy-950/80 px-4 py-3 border-b border-navy-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Tab buttons */}
          <button
            onClick={() => setActiveTab('POSITIONS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'POSITIONS'
                ? 'bg-navy-700 text-gold-400 border border-gold-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-navy-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Open Positions ({activeAccount.positions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ORDERS'
                ? 'bg-navy-700 text-gold-400 border border-gold-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-navy-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Order History ({activeAccount.orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-gold-500 text-navy-950 text-[10px] font-bold flex items-center justify-center">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('SUMMARY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hidden sm:flex ${
              activeTab === 'SUMMARY'
                ? 'bg-navy-700 text-gold-400 border border-gold-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-navy-800'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Account Ledger</span>
          </button>
        </div>

        {/* Account Quick Metrics & Collapse Toggle */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden md:flex items-center gap-3">
            <div>
              <span className="text-slate-400">Cash: </span>
              <strong className="text-white">{formatNaira(activeAccount.cashBalance)}</strong>
            </div>
            <div>
              <span className="text-slate-400">Portfolio: </span>
              <strong className="text-gold-400">{formatNaira(activeAccount.portfolioValue)}</strong>
            </div>
            <div>
              <span className="text-slate-400">Return: </span>
              <strong className={activeAccount.totalReturn >= 0 ? 'text-bull' : 'text-bear'}>
                {activeAccount.totalReturn >= 0 ? '+' : ''}{activeAccount.totalReturnPct.toFixed(2)}%
              </strong>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md bg-navy-800 hover:bg-navy-700 text-slate-300"
            title={isExpanded ? 'Collapse tray' : 'Expand tray'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tray Content */}
      {isExpanded && (
        <div className="max-h-80 overflow-y-auto p-4">
          {/* TAB 1: OPEN POSITIONS */}
          {activeTab === 'POSITIONS' && (
            <div>
              {activeAccount.positions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No open equity positions in this account. Use the order ticket above to execute your first trade!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-navy-700/60 text-slate-400 font-semibold uppercase tracking-wider pb-2">
                        <th className="py-2 px-3">Ticker</th>
                        <th className="py-2 px-3 text-right">Shares</th>
                        <th className="py-2 px-3 text-right">Avg Cost</th>
                        <th className="py-2 px-3 text-right">Market Price</th>
                        <th className="py-2 px-3 text-right">Market Value</th>
                        <th className="py-2 px-3 text-right">Unrealized P&L</th>
                        <th className="py-2 px-3 text-right">Portfolio %</th>
                        <th className="py-2 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-700/40">
                      {activeAccount.positions.map(pos => {
                        const isProfit = pos.unrealizedPnl >= 0;
                        const stockObj = stocks.find(s => s.ticker === pos.ticker);

                        return (
                          <tr key={pos.id} className="hover:bg-navy-800/50 transition-colors font-mono">
                            <td className="py-2.5 px-3">
                              <button
                                onClick={() => onSelectStock(pos.ticker)}
                                className="font-bold text-white hover:text-gold-400 transition-colors font-mono text-sm"
                              >
                                {pos.ticker}
                              </button>
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-200">
                              {pos.quantity.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-300">
                              ₦{pos.avgBuyPrice.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-white font-bold">
                              ₦{pos.currentPrice.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-200">
                              {formatNaira(pos.marketValue)}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className={`inline-flex items-center gap-0.5 font-bold ${
                                isProfit ? 'text-bull' : 'text-bear'
                              }`}>
                                {isProfit ? '+' : ''}{formatNaira(pos.unrealizedPnl)} ({isProfit ? '+' : ''}{pos.unrealizedPnlPct.toFixed(2)}%)
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                pos.portfolioWeightPct > 25
                                  ? 'bg-amber-950/60 text-amber-300 border border-amber-600/50'
                                  : 'bg-navy-800 text-slate-300'
                              }`}>
                                {pos.portfolioWeightPct.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {stockObj && (
                                <button
                                  onClick={() => onQuickSell(stockObj)}
                                  className="px-2.5 py-1 rounded bg-bear/20 hover:bg-bear text-bear hover:text-white border border-bear/30 font-sans text-xs font-semibold transition-colors"
                                >
                                  Close
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeTab === 'ORDERS' && (
            <div>
              {activeAccount.orders.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No trade logs or pending orders in this account.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-navy-700/60 text-slate-400 font-semibold uppercase tracking-wider pb-2">
                        <th className="py-2 px-3">Order ID / Date</th>
                        <th className="py-2 px-3">Type & Side</th>
                        <th className="py-2 px-3">Ticker</th>
                        <th className="py-2 px-3 text-right">Qty</th>
                        <th className="py-2 px-3 text-right">Price</th>
                        <th className="py-2 px-3 text-right">Total Net (₦)</th>
                        <th className="py-2 px-3 text-center">Status</th>
                        <th className="py-2 px-3 text-center">Contract Slip</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-700/40">
                      {activeAccount.orders.map(order => (
                        <tr key={order.id} className="hover:bg-navy-800/50 transition-colors font-mono">
                          <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                            <div className="text-white font-mono">{order.id}</div>
                            <div>{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded ${
                              order.orderSide === 'BUY' ? 'bg-bull/20 text-bull' : 'bg-bear/20 text-bear'
                            }`}>
                              {order.orderSide} {order.orderType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white">
                            {order.ticker}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-200">
                            {order.quantity.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-300">
                            ₦{(order.executionPrice || order.targetPrice || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-gold-300 font-bold">
                            ₦{order.netAmount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'FILLED' ? 'bg-bull/20 text-bull border border-bull/40' :
                              order.status === 'PENDING' ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40' :
                              'bg-slate-700 text-slate-400'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedContractNote(order)}
                                className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-gold-300 border border-navy-700 transition-colors"
                                title="View Official NGX Contract Note"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              {order.status === 'PENDING' && (
                                <button
                                  onClick={() => cancelOrder(order.id)}
                                  className="p-1 rounded bg-bear/20 hover:bg-bear text-bear hover:text-white border border-bear/30 transition-colors"
                                  title="Cancel Pending Order"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT SUMMARY */}
          {activeTab === 'SUMMARY' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-navy-950 p-4 rounded-xl border border-navy-700/80 space-y-2">
                <div className="text-slate-400 uppercase font-semibold text-[11px]">Capital Structure</div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Initial Allocation:</span>
                  <span className="text-white font-bold">{formatNaira(activeAccount.initialBalance)}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Available Cash:</span>
                  <span className="text-white font-bold">{formatNaira(activeAccount.cashBalance)}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Equities Held Value:</span>
                  <span className="text-gold-400 font-bold">
                    {formatNaira(activeAccount.portfolioValue - activeAccount.cashBalance)}
                  </span>
                </div>
              </div>

              <div className="bg-navy-950 p-4 rounded-xl border border-navy-700/80 space-y-2">
                <div className="text-slate-400 uppercase font-semibold text-[11px]">Profit & Loss Accounting</div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Realized P&L:</span>
                  <span className={`font-bold ${activeAccount.realizedPnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {activeAccount.realizedPnl >= 0 ? '+' : ''}{formatNaira(activeAccount.realizedPnl)}
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Total Account Return:</span>
                  <span className={`font-bold ${activeAccount.totalReturn >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {activeAccount.totalReturn >= 0 ? '+' : ''}{formatNaira(activeAccount.totalReturn)} ({activeAccount.totalReturnPct.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="bg-navy-950 p-4 rounded-xl border border-navy-700/80 space-y-2">
                <div className="text-slate-400 uppercase font-semibold text-[11px]">Regulatory Compliance</div>
                <div className="text-slate-400 leading-relaxed text-[11px]">
                  All fills include statutory deductions for SEC (0.30%), CSCS (0.35%), Brokerage Commission (0.70%), and Stamp Duty.
                </div>
                <div className="text-gold-400 font-semibold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-bull" />
                  Account Status: Active & In Good Standing
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contract Note Modal */}
      {selectedContractNote && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-gold-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-navy-700 pb-3">
              <div>
                <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
                  Official NGX Contract Note
                </span>
                <div className="text-lg font-bold text-white font-mono">
                  PSA BROKERAGE SERVICES
                </div>
                <div className="text-[11px] text-slate-400">
                  Transaction Ref: {selectedContractNote.id}
                </div>
              </div>
              <button
                onClick={() => setSelectedContractNote(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Security Description:</span>
                <span className="text-white font-bold">{selectedContractNote.ticker}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Order Action:</span>
                <span className={`font-bold ${selectedContractNote.orderSide === 'BUY' ? 'text-bull' : 'text-bear'}`}>
                  {selectedContractNote.orderSide} ({selectedContractNote.orderType})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity Executed:</span>
                <span className="text-slate-200">{selectedContractNote.quantity.toLocaleString()} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Execution Price:</span>
                <span className="text-slate-200">₦{(selectedContractNote.executionPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-navy-800 pt-1 text-slate-300">
                <span>Gross Consideration:</span>
                <span>₦{selectedContractNote.grossAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>SEC Fee (0.30%):</span>
                <span>₦{selectedContractNote.feeBreakdown.secFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>CSCS Clearing (0.35%):</span>
                <span>₦{selectedContractNote.feeBreakdown.cscsFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Brokerage Commission (0.70%):</span>
                <span>₦{selectedContractNote.feeBreakdown.brokerFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Stamp Duty & VAT:</span>
                <span>₦{(selectedContractNote.feeBreakdown.stampDuty + selectedContractNote.feeBreakdown.vatFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-navy-700 pt-2 text-sm font-bold text-gold-400">
                <span>Net Settlement Amount:</span>
                <span>₦{selectedContractNote.netAmount.toLocaleString()}</span>
              </div>

              {selectedContractNote.thesisNote && (
                <div className="mt-3 p-3 bg-navy-950 rounded-lg border border-navy-800 font-sans text-xs">
                  <div className="font-semibold text-gold-400 mb-1">Attached Investment Thesis:</div>
                  <div className="text-slate-300 italic">{selectedContractNote.thesisNote}</div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedContractNote(null)}
              className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Close Contract Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

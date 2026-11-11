import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../services/feeEngine';
import { getNGXMarketStatus } from '../../services/marketHours';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Layers, 
  Clock, 
  ArrowUpRight, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Radio,
  Share2,
  FileText,
  Coins
} from 'lucide-react';
import { getWhatsAppShareUrl } from '../../services/whatsappFormatter';
import { ContractNoteModal } from '../trading/ContractNoteModal';
import { Order } from '../../types';

interface PortfolioOverviewViewProps {
  onSelectAsset: (ticker: string) => void;
  onExploreMarkets: () => void;
}

export const PortfolioOverviewView: React.FC<PortfolioOverviewViewProps> = ({ 
  onSelectAsset, 
  onExploreMarkets 
}) => {
  const { 
    currentUser, 
    activeAccount, 
    userAccounts, 
    activeAccountId, 
    setActiveAccountId, 
    stocks,
    cancelOrder,
    marketNews,
    dividendRecords,
    distributeCorporateDividends
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContractOrder, setSelectedContractOrder] = useState<Order | null>(null);
  const [dividendNotification, setDividendNotification] = useState<string | null>(null);
  const marketStatus = getNGXMarketStatus();

  const accountDividends = (dividendRecords || []).filter(
    d => d.accountId === activeAccountId && d.userId === currentUser.id
  );

  // Metrics
  const totalValue = activeAccount.portfolioValue;
  const initialCap = activeAccount.initialBalance;
  const totalReturnNaira = Number((totalValue - initialCap).toFixed(2));
  const totalGrowthPct = initialCap > 0 ? Number(((totalReturnNaira / initialCap) * 100).toFixed(2)) : 0;
  
  const investedCapital = activeAccount.positions.reduce((sum, p) => sum + p.totalCost, 0);
  const currentInvestedValue = activeAccount.positions.reduce((sum, p) => sum + p.marketValue, 0);
  const totalUnrealizedNaira = Number((currentInvestedValue - investedCapital).toFixed(2));
  const totalUnrealizedPct = investedCapital > 0 ? Number(((totalUnrealizedNaira / investedCapital) * 100).toFixed(2)) : 0;

  // Filter positions by search query
  const filteredPositions = activeAccount.positions.filter(pos => {
    const stock = stocks.find(s => s.ticker === pos.ticker);
    const search = searchQuery.toLowerCase();
    return (
      pos.ticker.toLowerCase().includes(search) ||
      (stock && stock.name.toLowerCase().includes(search)) ||
      (stock && stock.sector.toLowerCase().includes(search))
    );
  });

  const pendingOrders = activeAccount.orders.filter(o => o.status === 'PENDING');
  const filledOrders = activeAccount.orders.filter(o => o.status === 'FILLED').slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Account Switcher & Context Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-navy-900/90 border border-navy-700/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Personal Portfolio Portfolio
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-navy-800 text-gold-300 border border-gold-500/30 font-semibold font-mono">
                {currentUser.fullName}
              </span>
            </div>
            <h1 className="text-lg font-black text-white">
              {activeAccount.name}
            </h1>
          </div>
        </div>

        {/* Multi-Account Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium hidden md:inline">Account:</span>
          <select
            value={activeAccountId}
            onChange={(e) => setActiveAccountId(e.target.value)}
            className="w-full sm:w-64 bg-navy-950 border border-navy-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-gold-500 shadow-inner"
          >
            {userAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({formatNaira(acc.portfolioValue)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Top Valuation & Growth Banner (Required by User) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-navy-950 border border-navy-700/80 shadow-2xl p-6 sm:p-8">
        {/* Decorative Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Total Portfolio Value & Overall Growth % */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Total Portfolio Value</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-navy-800 text-slate-300 font-mono">
                T+1 Settlement
              </span>
            </div>

            <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white">
              {formatNaira(totalValue)}
            </div>

            {/* Growth Rate % and Growth Amount in Naira */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-black font-mono shadow-sm ${
                totalReturnNaira >= 0 
                  ? 'bg-bull/20 text-bull border border-bull/40' 
                  : 'bg-bear/20 text-bear border border-bear/40'
              }`}>
                {totalReturnNaira >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {totalReturnNaira >= 0 ? '+' : ''}{totalGrowthPct}%
                </span>
              </div>

              <div className="text-sm font-semibold text-slate-300">
                Overall Return: <strong className={totalReturnNaira >= 0 ? 'text-bull font-mono' : 'text-bear font-mono'}>
                  {totalReturnNaira >= 0 ? '+' : ''}{formatNaira(totalReturnNaira)}
                </strong>
                <span className="text-xs text-slate-400 ml-1">(from initial {formatNaira(initialCap)})</span>
              </div>
            </div>
          </div>

          {/* Key Portfolio Breakdown Metrics */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            <div className="p-3.5 rounded-2xl bg-navy-950/70 border border-navy-700/60 shadow-inner">
              <div className="text-[11px] text-slate-400 font-medium">Available Cash</div>
              <div className="text-base font-bold font-mono text-white mt-1">
                {formatNaira(activeAccount.cashBalance)}
              </div>
              <div className="text-[10px] text-gold-400 mt-0.5">
                {((activeAccount.cashBalance / totalValue) * 100).toFixed(1)}% liquid
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-navy-950/70 border border-navy-700/60 shadow-inner">
              <div className="text-[11px] text-slate-400 font-medium">Accumulated Cost Basis</div>
              <div className="text-base font-bold font-mono text-slate-200 mt-1">
                {formatNaira(investedCapital)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {activeAccount.positions.length} active positions
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-navy-950/70 border border-navy-700/60 shadow-inner col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-400 font-medium">Unrealized Growth</div>
              <div className={`text-base font-bold font-mono mt-1 ${
                totalUnrealizedNaira >= 0 ? 'text-bull' : 'text-bear'
              }`}>
                {totalUnrealizedNaira >= 0 ? '+' : ''}{formatNaira(totalUnrealizedNaira)}
              </div>
              <div className={`text-[10px] font-semibold mt-0.5 ${
                totalUnrealizedPct >= 0 ? 'text-bull' : 'text-bear'
              }`}>
                {totalUnrealizedPct >= 0 ? '+' : ''}{totalUnrealizedPct}% on assets
              </div>
            </div>

          </div>

        </div>

        {/* Real-time NGX Market Notice Pill */}
        <div className="mt-5 pt-4 border-t border-navy-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${marketStatus.isOpen ? 'bg-bull animate-pulse' : 'bg-gold-500'}`} />
            <span className="font-semibold text-slate-300">
              {marketStatus.statusText}
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline">Official NGX Hours: 9:00 AM – 4:00 PM WAT</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Settlement Standard:</span>
            <span className="px-2 py-0.5 rounded bg-navy-800 text-gold-300 border border-gold-500/30 text-[11px] font-mono font-bold">
              T+1 Next-Day
            </span>
          </div>
        </div>
      </div>

      {/* Latest Market Simulation Flash & WhatsApp Ticker */}
      {marketNews.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-navy-900 to-navy-950 border border-emerald-500/30 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.2 rounded font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {marketNews[0].sourceCategory.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {marketNews[0].sourceName}
                </span>
              </div>
              <h4 className="text-xs font-black text-white mt-1 hover:text-gold-400 transition-colors">
                {marketNews[0].headline}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {marketNews[0].summary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <a
              href={getWhatsAppShareUrl(marketNews[0].whatsappDraft || marketNews[0].headline)}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-black font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share to WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* 3. Section Header: Holdings List & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <PieChart className="w-5 h-5 text-gold-400" />
              <span>Asset Portfolio Holdings</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any asset row to view live technical charts, disclosures, order books, and execute trades.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search holdings..."
                className="w-full pl-9 pr-3 py-1.5 bg-navy-900 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
              />
            </div>

            <button
              onClick={onExploreMarkets}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>+ Add Stocks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Holdings Table / List */}
        {filteredPositions.length > 0 ? (
          <div className="bg-navy-900 border border-navy-700/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-navy-950/80 text-[11px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-navy-700/70">
                    <th className="py-3 px-4">Asset / Sector</th>
                    <th className="py-3 px-3 text-right">Units Held</th>
                    <th className="py-3 px-3 text-right">Bought Price (₦)</th>
                    <th className="py-3 px-3 text-right">Market Price (₦)</th>
                    <th className="py-3 px-3 text-right">Current Value (₦)</th>
                    <th className="py-3 px-4 text-right">Growth Rate (%)</th>
                    <th className="py-3 px-4 text-right">Growth Amount (₦)</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 text-xs font-medium">
                  {filteredPositions.map((pos) => {
                    const stock = stocks.find(s => s.ticker === pos.ticker);
                    const isProfit = pos.unrealizedPnl >= 0;

                    return (
                      <tr 
                        key={pos.id}
                        onClick={() => onSelectAsset(pos.ticker)}
                        className="hover:bg-navy-800/60 transition-colors cursor-pointer group"
                      >
                        {/* Asset & Sector */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center font-black text-xs text-gold-400 group-hover:border-gold-500/50 transition-colors">
                              {pos.ticker.slice(0, 3)}
                            </div>
                            <div>
                              <div className="font-black text-white text-sm group-hover:text-gold-400 transition-colors flex items-center gap-1.5">
                                <span>{pos.ticker}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                                {stock?.name || pos.ticker}
                              </div>
                              <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-navy-950 text-slate-400 border border-navy-800">
                                {stock?.sector || 'NGX Equity'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Units Held */}
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-100">
                          {pos.quantity.toLocaleString()}
                          <div className="text-[10px] text-slate-500 font-normal">
                            {pos.portfolioWeightPct}% portf.
                          </div>
                        </td>

                        {/* Average Bought Price */}
                        <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                          ₦{pos.avgBuyPrice.toFixed(2)}
                          <div className="text-[10px] text-slate-500 font-normal">
                            Cost: {formatNaira(pos.totalCost)}
                          </div>
                        </td>

                        {/* Current Market Price */}
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                          ₦{pos.currentPrice.toFixed(2)}
                          <div className="text-[10px] text-slate-400 font-normal">
                            Day: {stock ? (stock.dayChange >= 0 ? `+₦${stock.dayChange.toFixed(2)}` : `-₦${Math.abs(stock.dayChange).toFixed(2)}`) : '0.00'}
                          </div>
                        </td>

                        {/* Current Market Value */}
                        <td className="py-3.5 px-3 text-right font-mono font-black text-white">
                          {formatNaira(pos.marketValue)}
                        </td>

                        {/* Growth Rate % */}
                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-black font-mono text-xs ${
                            isProfit 
                              ? 'bg-bull/15 text-bull border border-bull/30' 
                              : 'bg-bear/15 text-bear border border-bear/30'
                          }`}>
                            {isProfit ? '+' : ''}{pos.unrealizedPnlPct.toFixed(2)}%
                          </span>
                        </td>

                        {/* Growth Amount in ₦ (Specified by User) */}
                        <td className="py-3.5 px-4 text-right font-mono font-black text-sm">
                          <span className={isProfit ? 'text-bull' : 'text-bear'}>
                            {isProfit ? '+' : ''}{formatNaira(pos.unrealizedPnl)}
                          </span>
                        </td>

                        {/* Action CTA */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAsset(pos.ticker);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-slate-300 text-[11px] font-bold transition-all border border-navy-700 hover:border-gold-400"
                          >
                            Inspect & Trade
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-10 rounded-2xl bg-navy-900 border border-navy-700/80 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-navy-700 mx-auto flex items-center justify-center text-gold-400">
              <PieChart className="w-8 h-8 opacity-80" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Holdings Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {searchQuery 
                  ? `No asset matches "${searchQuery}". Clear your search query.` 
                  : "You haven't purchased any Nigerian equities in this account yet. Search the official NGX directory to place your first trade."}
              </p>
            </div>
            <button
              onClick={onExploreMarkets}
              className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs shadow-lg shadow-gold-500/20 transition-all inline-flex items-center gap-2"
            >
              <span>Explore NGX Equities Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 5. Pending & Queued Limit Orders */}
      {pendingOrders.length > 0 && (
        <div className="bg-navy-900 border border-gold-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Pending Limit & Stop Orders ({pendingOrders.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Executes automatically when target price is reached during market hours
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingOrders.map(order => (
              <div 
                key={order.id} 
                className="p-3.5 rounded-xl bg-navy-950 border border-navy-700 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                      order.orderSide === 'BUY' ? 'bg-bull/20 text-bull' : 'bg-bear/20 text-bear'
                    }`}>
                      {order.orderSide} {order.orderType}
                    </span>
                    <span className="font-bold text-sm text-white">{order.ticker}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    {order.quantity.toLocaleString()} units @ target ₦{(order.targetPrice || 0).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Est. Total: {formatNaira(order.netAmount)} (T+1 Settlement)
                  </div>
                </div>

                <button
                  onClick={() => cancelOrder(order.id)}
                  className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-bear hover:text-white text-slate-300 text-xs font-bold transition-all border border-navy-700"
                >
                  Cancel Order
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5b. Corporate Actions & Dividends Ledger */}
      <div className="bg-navy-900 border border-navy-750 rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-gold-400" />
            <span className="font-bold text-white text-sm uppercase tracking-wider">
              Corporate Action Dividends & Tax Ledger (FIRS 10% WHT)
            </span>
          </div>

          <button
            onClick={() => {
              const res = distributeCorporateDividends();
              if (res.totalCredited > 0) {
                setDividendNotification(`Successfully credited ${formatNaira(res.totalCredited)} net dividend payout from ${res.count} qualifying equity holdings.`);
              } else {
                setDividendNotification('No qualifying positions pending dividend distribution at this time.');
              }
              setTimeout(() => setDividendNotification(null), 5000);
            }}
            className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Process Eligible Dividends</span>
          </button>
        </div>

        {dividendNotification && (
          <div className="p-3 rounded-xl bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-mono animate-in fade-in">
            {dividendNotification}
          </div>
        )}

        {accountDividends.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 text-center border border-dashed border-navy-800 rounded-xl">
            No dividend payouts credited yet for this account. Acquire dividend-yielding blue chips (e.g. GTCO, ZENITHBANK, MTNN) before their qualification dates.
          </div>
        ) : (
          <div className="divide-y divide-navy-800">
            {accountDividends.map(div => (
              <div key={div.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{div.ticker}</span>
                    <span className="text-slate-400 text-[11px] font-normal">{div.stockName}</span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                    {div.sharesHeld.toLocaleString()} Shares @ ₦{div.dividendPerShare.toFixed(2)} DPS • Gross: {formatNaira(div.totalPayoutGross)} • WHT (10%): -{formatNaira(div.withholdingTax)}
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-bold text-bull text-sm">
                    +{formatNaira(div.netPayoutCredited)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Paid: {div.paidAt ? new Date(div.paidAt).toLocaleDateString() : div.paymentDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Recent Transaction History */}
      {filledOrders.length > 0 && (
        <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-bull" />
            <span>Recent Executed Trades (T+1 NGX)</span>
          </h3>

          <div className="divide-y divide-navy-800">
            {filledOrders.map(order => (
              <div key={order.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    order.orderSide === 'BUY' ? 'bg-bull/20 text-bull' : 'bg-bear/20 text-bear'
                  }`}>
                    {order.orderSide}
                  </span>
                  <div>
                    <span className="font-bold text-white">{order.ticker}</span>
                    <span className="text-slate-400 ml-2">
                      {order.quantity.toLocaleString()} units @ ₦{(order.executionPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono">
                    <div className="font-bold text-slate-200">
                      {formatNaira(order.netAmount)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {order.executedAt ? new Date(order.executedAt).toLocaleDateString() : 'Settled'}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedContractOrder(order)}
                    className="px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-navy-750 text-gold-300 border border-gold-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
                    title="View Official CSCS Clearing Contract Note"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Contract Note</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSCS Official Contract Note Modal */}
      <ContractNoteModal
        isOpen={!!selectedContractOrder}
        order={selectedContractOrder}
        stock={stocks.find(s => s.ticker === selectedContractOrder?.ticker) || null}
        onClose={() => setSelectedContractOrder(null)}
        clientName={currentUser.fullName}
      />

    </div>
  );
};

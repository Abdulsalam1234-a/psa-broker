import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TradingViewChart } from './TradingViewChart';
import { TradingViewWidget } from './TradingViewWidget';
import { OrderBookLevel2 } from './OrderBookLevel2';
import { OrderTicketModal } from './OrderTicketModal';
import { PortfolioTray } from './PortfolioTray';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { getNGXMarketStatus } from '../../services/marketHours';
import { Stock } from '../../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  BookOpen, 
  Clock, 
  Cloud,
  Layers,
  ChevronDown,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';

interface TradingTerminalViewProps {
  onInspectFundamentals: (stock: Stock) => void;
}

export const TradingTerminalView: React.FC<TradingTerminalViewProps> = ({ onInspectFundamentals }) => {
  const { selectedStock, setSelectedStock, stocks, watchlist, toggleWatchlist, isSimulating, toggleSimulation } = useApp();

  const [prefilledPrice, setPrefilledPrice] = useState<number | undefined>(undefined);
  const [rightPanelTab, setRightPanelTab] = useState<'ORDER_TICKET' | 'ORDER_BOOK'>('ORDER_TICKET');
  const [chartMode, setChartMode] = useState<'TRADINGVIEW_CLOUD' | 'LIGHTWEIGHT'>('LIGHTWEIGHT');

  const isWatched = watchlist.includes(selectedStock.ticker);
  const isPositive = selectedStock.dayChange >= 0;

  // Real-world Nigerian Exchange Market Status
  const marketStatus = useMemo(() => getNGXMarketStatus(), []);

  return (
    <div className="space-y-5">
      {/* Real-world Market Status Alert */}
      <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        marketStatus.isOpen 
          ? 'bg-bull/10 border-bull/30 text-bull' 
          : 'bg-navy-900 border-gold-500/30 text-slate-300'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${marketStatus.isOpen ? 'bg-bull animate-ping' : 'bg-gold-500'}`} />
          <div>
            <strong className="font-bold text-white uppercase tracking-wider">
              {marketStatus.statusText}
            </strong>
            <span className="text-slate-400 ml-2">
              • {marketStatus.sessionDetails} ({marketStatus.watTimeStr})
            </span>
            <div className="text-[11px] text-gold-400 mt-0.5">
              {marketStatus.nextSessionText}
            </div>
          </div>
        </div>

        {/* Academic Tick Generator Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] hidden md:inline">
            {marketStatus.isWeekend ? 'Weekend Simulation:' : 'Tick Generator:'}
          </span>
          <button
            onClick={toggleSimulation}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isSimulating
                ? 'bg-gold-500 text-navy-950 font-black shadow-md'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700 border border-navy-700'
            }`}
            title="Toggle between real official closing prices and live educational tick generator"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Academic Ticks: ACTIVE' : 'Fixed Official NGX Prices'}</span>
          </button>
        </div>
      </div>

      {/* Stock Header & Live Ticker Selector Bar */}
      <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Ticker Dropdown & Company info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedStock.ticker}
              onChange={(e) => {
                const s = stocks.find(st => st.ticker === e.target.value);
                if (s) {
                  setSelectedStock(s);
                  setPrefilledPrice(undefined);
                }
              }}
              className="bg-navy-800 border-2 border-gold-500/60 rounded-xl px-3 py-1.5 text-lg font-bold font-mono text-white focus:outline-none focus:border-gold-400 cursor-pointer shadow-sm pr-8"
            >
              {stocks.map(s => (
                <option key={s.ticker} value={s.ticker}>
                  {s.ticker} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => toggleWatchlist(selectedStock.ticker)}
            className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-gold-400 border border-navy-700 transition-colors"
            title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Star className={`w-5 h-5 ${isWatched ? 'text-gold-400 fill-gold-400' : ''}`} />
          </button>

          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-navy-800 text-slate-300 border border-navy-700">
            {selectedStock.sector}
          </span>
        </div>

        {/* Center: Live Price & Day Change */}
        <div className="flex items-baseline gap-3">
          <div className="text-2xl font-black font-mono text-white">
            ₦{selectedStock.currentPrice.toFixed(2)}
          </div>
          <div className={`flex items-center gap-1 font-mono font-bold text-sm px-2.5 py-0.5 rounded-md ${
            isPositive ? 'bg-bull/20 text-bull' : 'bg-bear/20 text-bear'
          }`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{selectedStock.dayChange.toFixed(2)} ({isPositive ? '+' : ''}{selectedStock.dayChangePct.toFixed(2)}%)</span>
          </div>
        </div>

        {/* Right: Key Stats & Terminal CTA */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-400">High:</span> ₦{selectedStock.dayHigh.toFixed(2)}
            </div>
            <div>
              <span className="text-slate-400">Low:</span> ₦{selectedStock.dayLow.toFixed(2)}
            </div>
            <div>
              <span className="text-slate-400">P/E:</span> <strong className="text-gold-400">{selectedStock.peRatio}x</strong>
            </div>
            <div>
              <span className="text-slate-400">Div:</span> <strong className="text-bull">{selectedStock.dividendYield}%</strong>
            </div>
          </div>

          <button
            onClick={() => onInspectFundamentals(selectedStock)}
            className="px-3.5 py-2 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-gold-400" />
            <span>PSA Terminal Teardown</span>
          </button>
        </div>
      </div>

      {/* Main Trading Split Grid: Chart (Left) + Order Entry / Order Book (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Chart with Engine Switcher */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Chart Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs py-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Interactive Charting Engine</span>
            </span>
            <div className="flex items-center gap-1 bg-navy-800 p-0.5 rounded-lg border border-navy-700">
              <button
                onClick={() => setChartMode('LIGHTWEIGHT')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  chartMode === 'LIGHTWEIGHT'
                    ? 'bg-gold-500 text-navy-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PSA Fast Canvas Chart
              </button>
              <button
                onClick={() => setChartMode('TRADINGVIEW_CLOUD')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                  chartMode === 'TRADINGVIEW_CLOUD'
                    ? 'bg-gold-500 text-navy-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>TradingView Live (NGX)</span>
              </button>
            </div>
          </div>

          {/* Chart Component in ErrorBoundary */}
          <ErrorBoundary fallbackMessage={`Unable to initialize chart for ${selectedStock.ticker}. You can still execute orders on the right ticket.`}>
            {chartMode === 'LIGHTWEIGHT' ? (
              <TradingViewChart key={`lw-${selectedStock.ticker}`} stock={selectedStock} />
            ) : (
              <TradingViewWidget key={`tv-${selectedStock.ticker}`} stock={selectedStock} />
            )}
          </ErrorBoundary>
        </div>

        {/* Right 4 Cols: Order Entry Form & Level 2 Depth */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          {/* Tab switch between Order Ticket and Order Book */}
          <div className="flex items-center gap-1 bg-navy-800 p-1 rounded-xl border border-navy-700">
            <button
              onClick={() => setRightPanelTab('ORDER_TICKET')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                rightPanelTab === 'ORDER_TICKET'
                  ? 'bg-gold-500 text-navy-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Order Ticket
            </button>
            <button
              onClick={() => setRightPanelTab('ORDER_BOOK')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                rightPanelTab === 'ORDER_BOOK'
                  ? 'bg-gold-500 text-navy-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Level 2 Depth
            </button>
          </div>

          <ErrorBoundary fallbackMessage="Unable to render order form.">
            {rightPanelTab === 'ORDER_TICKET' ? (
              <OrderTicketModal
                stock={selectedStock}
                prefilledPrice={prefilledPrice}
              />
            ) : (
              <OrderBookLevel2
                stock={selectedStock}
                onPriceClick={(price) => {
                  setPrefilledPrice(price);
                  setRightPanelTab('ORDER_TICKET');
                }}
              />
            )}
          </ErrorBoundary>
        </div>
      </div>

      {/* Collapsible Bottom Tray: Positions, Order History, Ledger */}
      <ErrorBoundary fallbackMessage="Unable to render portfolio drawer.">
        <PortfolioTray
          onSelectStock={(ticker) => {
            const s = stocks.find(st => st.ticker === ticker);
            if (s) {
              setSelectedStock(s);
              setPrefilledPrice(undefined);
            }
          }}
          onQuickSell={(s) => {
            setSelectedStock(s);
            setPrefilledPrice(undefined);
            setRightPanelTab('ORDER_TICKET');
          }}
        />
      </ErrorBoundary>
    </div>
  );
};

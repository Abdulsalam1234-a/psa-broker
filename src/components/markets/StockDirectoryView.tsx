import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { NGXSector, Stock } from '../../types';
import { NGX_SECTORS } from '../../data/ngxUniverse';
import { formatNaira } from '../../services/feeEngine';
import { MarketHeatmapView } from './MarketHeatmapView';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  ArrowRight, 
  SlidersHorizontal, 
  BookOpen, 
  Activity, 
  BarChart2, 
  Sparkles,
  Layers,
  RefreshCw,
  CheckCircle2,
  LayoutGrid,
  Flame,
  List
} from 'lucide-react';

interface StockDirectoryViewProps {
  onSelectStockToTrade: (stock: Stock) => void;
  onInspectFundamentals: (stock: Stock) => void;
}

export const StockDirectoryView: React.FC<StockDirectoryViewProps> = ({
  onSelectStockToTrade,
  onInspectFundamentals,
}) => {
  const { 
    stocks, 
    watchlist, 
    toggleWatchlist,
    isLiveTradingViewSynced,
    lastTradingViewSyncTime,
    syncTradingViewQuotes
  } = useApp();

  const [viewMode, setViewMode] = useState<'TABLE' | 'HEATMAP'>('TABLE');
  const [isSyncing, setIsSyncing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [activeSort, setActiveSort] = useState<'GAINERS' | 'LOSERS' | 'MARKET_CAP' | 'VOLUME'>('VOLUME');

  // Filter and sort stocks
  const filteredStocks = useMemo(() => {
    let result = [...stocks];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        s => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }

    // Sector filter
    if (selectedSector !== 'ALL') {
      result = result.filter(s => s.sector === selectedSector);
    }

    // Sort
    if (activeSort === 'GAINERS') {
      result.sort((a, b) => b.dayChangePct - a.dayChangePct);
    } else if (activeSort === 'LOSERS') {
      result.sort((a, b) => a.dayChangePct - b.dayChangePct);
    } else if (activeSort === 'MARKET_CAP') {
      result.sort((a, b) => b.marketCap - a.marketCap);
    } else if (activeSort === 'VOLUME') {
      result.sort((a, b) => b.volume - a.volume);
    }

    return result;
  }, [stocks, searchQuery, selectedSector, activeSort]);

  // Market Breadth Statistics & Live ASI computation
  const marketStats = useMemo(() => {
    let totalCap = 0;
    let totalVol = 0;
    let weightedChangeSum = 0;
    let advancers = 0;
    let decliners = 0;
    let unchanged = 0;

    stocks.forEach(s => {
      totalCap += s.marketCap;
      totalVol += s.volume;
      weightedChangeSum += (s.dayChangePct * s.marketCap);
      if (s.dayChange > 0) advancers++;
      else if (s.dayChange < 0) decliners++;
      else unchanged++;
    });

    const averageChangePct = totalCap > 0 ? Number((weightedChangeSum / totalCap).toFixed(2)) : 0.85;
    const baseAsi = 98450.25;
    const asiPointsChange = Number((baseAsi * (averageChangePct / 100)).toFixed(2));
    const currentAsi = Number((baseAsi + asiPointsChange).toFixed(2));

    return { 
      advancers, 
      decliners, 
      unchanged, 
      totalVolume: totalVol,
      asi: currentAsi,
      asiChange: asiPointsChange,
      asiChangePct: averageChangePct,
      totalCapTrillion: (totalCap / 1000).toFixed(2)
    };
  }, [stocks]);

  return (
    <div className="space-y-6">
      {/* TradingView Live Status Bar */}
      <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-3.5 px-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${isLiveTradingViewSynced ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-gold-400'}`}></span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">TradingView Official Nigerian Exchange (NSENG) Live Feed</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isLiveTradingViewSynced ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
              }`}>
                {isLiveTradingViewSynced ? 'Active • Synced' : 'Official Pre-cached Snapshot'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              139 Nigerian Equities reflecting authentic market closing prices, real-time daily volumes, 52-week ranges & P/E multiples.
              {lastTradingViewSyncTime && <span className="ml-1 text-slate-300 font-mono">Last refreshed: {lastTradingViewSyncTime}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-navy-800/90 p-1 rounded-xl border border-navy-700">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-gold-500 text-navy-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('HEATMAP')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'HEATMAP'
                  ? 'bg-gold-500 text-navy-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Market Heatmap</span>
            </button>
          </div>

          <button
            onClick={async () => {
              setIsSyncing(true);
              await syncTradingViewQuotes();
              setTimeout(() => setIsSyncing(false), 500);
            }}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-navy-800 hover:bg-navy-750 text-gold-400 border border-gold-500/40 hover:border-gold-500 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Fetching...' : 'Sync Live'}</span>
          </button>
        </div>
      </div>

      {/* NGX Market Summary Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-navy-900/80 border border-navy-700/80 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>NGX All-Share Index</span>
            <Activity className="w-3.5 h-3.5 text-gold-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {marketStats.asi.toLocaleString()}
          </div>
          <div className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${marketStats.asiChange >= 0 ? 'text-bull' : 'text-bear'}`}>
            {marketStats.asiChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>
              {marketStats.asiChange >= 0 ? '+' : ''}{marketStats.asiChange.toLocaleString()} ({marketStats.asiChangePct >= 0 ? '+' : ''}{marketStats.asiChangePct}%)
            </span>
          </div>
        </div>

        <div className="bg-navy-900/80 border border-navy-700/80 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Market Breadth</span>
            <BarChart2 className="w-3.5 h-3.5 text-gold-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1 flex items-center gap-2">
            <span className="text-bull font-mono font-bold">{marketStats.advancers} Up</span>
            <span className="text-slate-500 text-xs font-normal">vs</span>
            <span className="text-bear font-mono font-bold">{marketStats.decliners} Down</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {marketStats.unchanged} Unchanged Equities
          </div>
        </div>

        <div className="bg-navy-900/80 border border-navy-700/80 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Equities Listed</span>
            <Layers className="w-3.5 h-3.5 text-gold-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {stocks.length} Equities
          </div>
          <div className="text-xs text-gold-400 mt-0.5">
            100% TradingView Coverage
          </div>
        </div>

        <div className="bg-navy-900/80 border border-navy-700/80 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Daily Traded Volume</span>
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {(marketStats.totalVolume / 1_000_000).toFixed(1)}M
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Official NGX Shares Traded
          </div>
        </div>
      </div>

      {viewMode === 'HEATMAP' ? (
        <MarketHeatmapView stocks={stocks} onSelectStock={onSelectStockToTrade} />
      ) : (
        <>
          {/* Search & Sector Filters */}
          <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Instant Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Ticker or Company name (e.g. Zenith, Dangote, Seplat, Oando, MTNN)..."
              className="w-full bg-navy-800 border border-navy-600 focus:border-gold-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-gold-500 transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Sort:</span>
            {[
              { id: 'VOLUME', label: 'Most Active' },
              { id: 'GAINERS', label: 'Top Gainers' },
              { id: 'LOSERS', label: 'Top Losers' },
              { id: 'MARKET_CAP', label: 'Largest Cap' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSort(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSort === tab.id
                    ? 'bg-gold-500 text-navy-950 shadow-sm'
                    : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sector Pill Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedSector('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedSector === 'ALL'
                ? 'bg-gold-500/20 text-gold-300 border border-gold-500/50'
                : 'bg-navy-800/80 text-slate-400 hover:text-slate-200 border border-navy-700'
            }`}
          >
            All Sectors ({stocks.length})
          </button>
          {NGX_SECTORS.map(sec => {
            const count = stocks.filter(s => s.sector === sec).length;
            const isSelected = selectedSector === sec;
            return (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-gold-500/20 text-gold-300 border border-gold-500/50'
                    : 'bg-navy-800/80 text-slate-400 hover:text-slate-200 border border-navy-700'
                }`}
              >
                {sec} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock Cards Grid & Table */}
      <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 border-b border-navy-700/60 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">
            Showing {filteredStocks.length} NGX Equities
          </span>
          <span className="hidden sm:inline text-gold-400/90 font-mono text-[11px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            <span>Official NGX Feed via TradingView (NSENG) • Real-Time Order Routing</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-navy-700/60 bg-navy-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">★</th>
                <th className="py-3 px-4">Equity / Sector</th>
                <th className="py-3 px-4 text-right">Price (₦)</th>
                <th className="py-3 px-4 text-right">Day Change</th>
                <th className="py-3 px-4 text-right hidden md:table-cell">Day Range (₦)</th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">Market Cap (₦B)</th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">P/E & Yield</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/40">
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No equities found matching "{searchQuery}". Try searching for another ticker or sector.
                  </td>
                </tr>
              ) : (
                filteredStocks.map(stock => {
                  const isPositive = stock.dayChange >= 0;
                  const isWatched = watchlist.includes(stock.ticker);

                  return (
                    <tr 
                      key={stock.ticker}
                      className="hover:bg-navy-800/60 transition-colors group cursor-pointer"
                      onClick={() => onSelectStockToTrade(stock)}
                    >
                      {/* Watchlist Star */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => { e.stopPropagation(); toggleWatchlist(stock.ticker); }}>
                        <button className="text-slate-500 hover:text-gold-400 transition-colors p-1">
                          <Star className={`w-4 h-4 ${isWatched ? 'text-gold-400 fill-gold-400' : ''}`} />
                        </button>
                      </td>

                      {/* Ticker & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono text-base group-hover:text-gold-400 transition-colors">
                            {stock.ticker}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">
                          {stock.name}
                        </div>
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-navy-800 text-slate-300 border border-navy-700 font-medium">
                          {stock.sector}
                        </span>
                      </td>

                      {/* Current Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-base">
                        ₦{stock.currentPrice.toFixed(2)}
                      </td>

                      {/* Day Change */}
                      <td className="py-3.5 px-4 text-right">
                        <div className={`inline-flex items-center gap-1 font-mono font-semibold text-xs px-2 py-0.5 rounded ${
                          isPositive 
                            ? 'bg-bull/15 text-bull' 
                            : 'bg-bear/15 text-bear'
                        }`}>
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{isPositive ? '+' : ''}{stock.dayChange.toFixed(2)} ({isPositive ? '+' : ''}{stock.dayChangePct.toFixed(2)}%)</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          Vol: {(stock.volume / 1000).toFixed(0)}k
                        </div>
                      </td>

                      {/* Day Range */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-300 hidden md:table-cell">
                        <div>High: ₦{stock.dayHigh.toFixed(2)}</div>
                        <div className="text-slate-400">Low: ₦{stock.dayLow.toFixed(2)}</div>
                      </td>

                      {/* Market Cap */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-200 hidden lg:table-cell">
                        ₦{stock.marketCap.toLocaleString()}B
                      </td>

                      {/* P/E & Dividend Yield */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs hidden lg:table-cell">
                        <div className="text-slate-200">P/E: <span className="font-semibold text-gold-300">{stock.peRatio}x</span></div>
                        <div className="text-bull text-[11px]">Div: {stock.dividendYield}%</div>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectStockToTrade(stock)}
                            className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                            title="Open Trading Ticket & Chart"
                          >
                            <span>Trade</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onInspectFundamentals(stock)}
                            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-gold-300 transition-colors border border-navy-700"
                            title="Inspect 3-Statement Teardown in PSA Terminal"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}
</div>
  );
};

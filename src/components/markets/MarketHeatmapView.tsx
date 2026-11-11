import React, { useState, useMemo } from 'react';
import { Stock, NGXSector } from '../../types';
import { NGX_SECTORS } from '../../data/ngxUniverse';
import { formatNaira } from '../../services/feeEngine';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Layers, 
  Sparkles, 
  HelpCircle,
  ExternalLink,
  Flame,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface MarketHeatmapViewProps {
  stocks: Stock[];
  onSelectStock: (stock: Stock) => void;
}

export const MarketHeatmapView: React.FC<MarketHeatmapViewProps> = ({ stocks, onSelectStock }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredStock, setHoveredStock] = useState<Stock | null>(null);

  // Group stocks by official NGX Sectors
  const sectorGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const groups: {
      sector: NGXSector;
      stocks: Stock[];
      totalCapBillion: number;
      avgChangePct: number;
    }[] = [];

    NGX_SECTORS.forEach(sec => {
      const sectorStocks = stocks.filter(s => {
        if (s.sector !== sec) return false;
        if (q) {
          return s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
        }
        return true;
      });

      if (sectorStocks.length > 0) {
        // Sort by market cap descending so big caps take priority
        sectorStocks.sort((a, b) => b.marketCap - a.marketCap);

        const totalCap = sectorStocks.reduce((sum, s) => sum + s.marketCap, 0);
        const weightedChange = sectorStocks.reduce((sum, s) => sum + (s.dayChangePct * s.marketCap), 0);
        const avgChange = totalCap > 0 ? Number((weightedChange / totalCap).toFixed(2)) : 0;

        groups.push({
          sector: sec,
          stocks: sectorStocks,
          totalCapBillion: totalCap,
          avgChangePct: avgChange
        });
      }
    });

    // Sort sectors by total market cap descending
    return groups.sort((a, b) => b.totalCapBillion - a.totalCapBillion);
  }, [stocks, searchQuery]);

  // Color generator based on dayChangePct
  const getHeatmapColor = (changePct: number) => {
    if (changePct >= 5.0) return 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50';
    if (changePct >= 2.0) return 'bg-emerald-700/90 hover:bg-emerald-600 text-white border-emerald-500/40';
    if (changePct > 0.1) return 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border-emerald-600/30';
    if (changePct < -5.0) return 'bg-rose-700 hover:bg-rose-600 text-white border-rose-400/50';
    if (changePct <= -2.0) return 'bg-rose-800/90 hover:bg-rose-700 text-white border-rose-500/40';
    if (changePct < -0.1) return 'bg-rose-900/80 hover:bg-rose-800 text-rose-100 border-rose-600/30';
    return 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-4">
      {/* Heatmap Legend & Search Controls */}
      <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equities in heatmap (e.g. Zenith, Dangote, Oando, MTNN)..."
            className="w-full bg-navy-800 border border-navy-600 focus:border-gold-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Color Scale Legend */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 overflow-x-auto pb-1 md:pb-0">
          <span className="text-slate-400 mr-1 text-[10px] font-sans uppercase">Scale:</span>
          <span className="px-2 py-0.5 rounded bg-rose-700 text-white font-bold">&le; -5%</span>
          <span className="px-2 py-0.5 rounded bg-rose-800/90 text-white">-2%</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">0%</span>
          <span className="px-2 py-0.5 rounded bg-emerald-800/80 text-white">+2%</span>
          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">&ge; +5%</span>
        </div>
      </div>

      {/* Sector Blocks Treemap */}
      <div className="space-y-4">
        {sectorGroups.map(group => (
          <div 
            key={group.sector}
            className="bg-navy-900/80 border border-navy-700/80 rounded-2xl p-4 shadow-xl space-y-3"
          >
            {/* Sector Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-700/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  {group.sector}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-navy-800 text-slate-300 font-mono">
                  {group.stocks.length} Equities
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  ₦{(group.totalCapBillion / 1000).toFixed(2)}T Mkt Cap
                </span>
              </div>

              <div className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                group.avgChangePct >= 0 ? 'bg-bull/20 text-bull border border-bull/30' : 'bg-bear/20 text-bear border border-bear/30'
              }`}>
                {group.avgChangePct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{group.avgChangePct >= 0 ? '+' : ''}{group.avgChangePct}%</span>
              </div>
            </div>

            {/* Heatmap Tiles Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {group.stocks.map(stock => {
                const colorClass = getHeatmapColor(stock.dayChangePct);
                const isMega = stock.marketCap >= 1000;
                const isLarge = stock.marketCap >= 200 && stock.marketCap < 1000;

                return (
                  <button
                    key={stock.ticker}
                    onClick={() => onSelectStock(stock)}
                    onMouseEnter={() => setHoveredStock(stock)}
                    onMouseLeave={() => setHoveredStock(null)}
                    className={`${colorClass} ${
                      isMega ? 'sm:col-span-2 sm:row-span-2 p-3.5 min-h-[90px]' : 
                      isLarge ? 'sm:col-span-2 p-2.5 min-h-[70px]' : 
                      'p-2 min-h-[60px]'
                    } rounded-xl border text-left transition-all hover:scale-[1.02] hover:shadow-xl hover:z-10 relative flex flex-col justify-between group overflow-hidden`}
                    title={`${stock.ticker} (${stock.name}): ₦${stock.currentPrice.toFixed(2)} (${stock.dayChangePct >= 0 ? '+' : ''}${stock.dayChangePct}%)`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-mono font-black ${isMega ? 'text-base sm:text-lg' : isLarge ? 'text-sm' : 'text-xs'} tracking-tight`}>
                          {stock.ticker}
                        </span>
                        <span className={`font-mono font-bold ${isMega ? 'text-xs sm:text-sm' : 'text-[11px]'}`}>
                          {stock.dayChangePct >= 0 ? '+' : ''}{stock.dayChangePct.toFixed(1)}%
                        </span>
                      </div>

                      <div className="text-[10px] opacity-80 truncate max-w-full font-sans">
                        {stock.name}
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between gap-1 mt-1 font-mono">
                      <span className={`font-bold ${isMega ? 'text-sm sm:text-base' : 'text-xs'}`}>
                        ₦{stock.currentPrice.toFixed(2)}
                      </span>
                      <span className="text-[9px] opacity-75 hidden sm:inline">
                        ₦{(stock.marketCap).toFixed(0)}B
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

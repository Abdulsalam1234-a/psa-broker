import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../services/feeEngine';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Globe, 
  ChevronRight,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface MarketPulseBannerProps {
  onSelectStock?: (ticker: string) => void;
}

export const MarketPulseBanner: React.FC<MarketPulseBannerProps> = ({ onSelectStock }) => {
  const { 
    stocks, 
    isSimulating,
    isLiveTradingViewSynced,
    lastTradingViewSyncTime,
    syncTradingViewQuotes
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);

  // Compute live All-Share Index (ASI) and aggregate market stats from universe
  const marketStats = useMemo(() => {
    let totalCap = 0;
    let totalVol = 0;
    let weightedChangeSum = 0;

    stocks.forEach(s => {
      totalCap += s.marketCap;
      totalVol += s.volume;
      weightedChangeSum += (s.dayChangePct * s.marketCap);
    });

    const averageChangePct = totalCap > 0 ? Number((weightedChangeSum / totalCap).toFixed(2)) : 0.85;
    const baseAsi = 98450.25;
    const asiPointsChange = Number((baseAsi * (averageChangePct / 100)).toFixed(2));
    const currentAsi = Number((baseAsi + asiPointsChange).toFixed(2));

    // Sort gainers and losers
    const sorted = [...stocks].sort((a, b) => b.dayChangePct - a.dayChangePct);
    const topGainers = sorted.slice(0, 4);
    const topLosers = sorted.slice(-4).reverse();

    return {
      asi: currentAsi,
      asiChange: asiPointsChange,
      asiChangePct: averageChangePct,
      marketCapTrillion: (totalCap / 1000).toFixed(2), // Trillion Naira
      totalVolumeMillion: (totalVol / 1000000).toFixed(1),
      dealsCount: Math.floor(8450 + (totalVol / 500000)),
      topGainers,
      topLosers,
    };
  }, [stocks]);

  return (
    <div className="bg-navy-950/90 border-b border-navy-800 backdrop-blur-md overflow-hidden text-xs">
      {/* Top Aggregate Key Index Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-navy-850/60">
        
        {/* NGX All-Share Index (ASI) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-sans">
            <span className="font-black text-white uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-gold-400" />
              <span>NGX ASI:</span>
            </span>
            <span className="font-mono font-black text-sm text-white">
              {marketStats.asi.toLocaleString()}
            </span>
          </div>

          <div className={`flex items-center gap-1 font-mono font-black text-[11px] px-2 py-0.5 rounded-full ${
            marketStats.asiChange >= 0 
              ? 'bg-bull/20 text-bull border border-bull/30' 
              : 'bg-bear/20 text-bear border border-bear/30'
          }`}>
            {marketStats.asiChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>
              {marketStats.asiChange >= 0 ? '+' : ''}{marketStats.asiChange} ({marketStats.asiChangePct >= 0 ? '+' : ''}{marketStats.asiChangePct}%)
            </span>
          </div>
        </div>

        {/* Macro Liquidity Indicators (Market Cap, Volume, Deals, Brent, Naira) */}
        <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono text-[11px]">
          <div>
            <span className="text-slate-500 text-[10px]">MKT CAP: </span>
            <strong className="text-slate-200">₦{marketStats.marketCapTrillion}T</strong>
          </div>

          <div className="hidden sm:inline">
            <span className="text-slate-500 text-[10px]">VOL: </span>
            <strong className="text-slate-200">{marketStats.totalVolumeMillion}M</strong>
          </div>

          <div className="hidden md:inline">
            <span className="text-slate-500 text-[10px]">DEALS: </span>
            <strong className="text-slate-200">{marketStats.dealsCount.toLocaleString()}</strong>
          </div>

          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">CBN MPR: </span>
            <strong className="text-gold-400">27.25%</strong>
          </div>

          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">NAIRA FX (NAFEM): </span>
            <strong className="text-slate-200">₦1,685.50/$</strong>
          </div>

          <div className="hidden xl:flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">BRENT CRUDE: </span>
            <strong className="text-bull">$74.80/bbl</strong>
          </div>

          {/* TradingView Live Status Pill */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-navy-800">
            <span className={`inline-block w-2 h-2 rounded-full ${isLiveTradingViewSynced ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gold-400'}`}></span>
            <span className="text-[10px] text-slate-300 font-medium">
              TV Feed: <strong className="text-white">{isLiveTradingViewSynced ? 'Live' : 'Cached'}</strong>
            </span>
            <button
              onClick={async () => {
                setIsSyncing(true);
                await syncTradingViewQuotes();
                setTimeout(() => setIsSyncing(false), 500);
              }}
              disabled={isSyncing}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-navy-900 hover:bg-navy-800 text-gold-400 border border-gold-500/30 hover:border-gold-500 transition-all ml-0.5 disabled:opacity-50"
              title="Sync latest prices from TradingView"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing' : 'Sync'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Marquee Ticker: Top Gainers & Losers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
        
        {/* Gainers */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] uppercase font-bold text-bull flex items-center gap-1 shrink-0">
            <Flame className="w-3 h-3 text-bull animate-pulse" />
            <span>Top Gainers:</span>
          </span>

          <div className="flex items-center gap-2">
            {marketStats.topGainers.map(g => (
              <button
                key={g.ticker}
                onClick={() => onSelectStock && onSelectStock(g.ticker)}
                className="px-2 py-0.5 rounded bg-navy-900 hover:bg-navy-800 border border-navy-700 hover:border-bull/40 text-[11px] font-mono flex items-center gap-1.5 transition-all"
              >
                <span className="font-bold text-white">{g.ticker}</span>
                <span className="text-slate-400">₦{g.currentPrice.toFixed(2)}</span>
                <span className="text-bull font-bold flex items-center">
                  <ArrowUpRight className="w-3 h-3" />
                  +{g.dayChangePct.toFixed(1)}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <span className="text-[10px] uppercase font-bold text-bear flex items-center gap-1 shrink-0">
            <span>Decliners:</span>
          </span>

          <div className="flex items-center gap-2">
            {marketStats.topLosers.map(l => (
              <button
                key={l.ticker}
                onClick={() => onSelectStock && onSelectStock(l.ticker)}
                className="px-2 py-0.5 rounded bg-navy-900 hover:bg-navy-800 border border-navy-700 hover:border-bear/40 text-[11px] font-mono flex items-center gap-1.5 transition-all"
              >
                <span className="font-bold text-white">{l.ticker}</span>
                <span className="text-slate-400">₦{l.currentPrice.toFixed(2)}</span>
                <span className="text-bear font-bold flex items-center">
                  <ArrowDownRight className="w-3 h-3" />
                  {l.dayChangePct.toFixed(1)}%
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

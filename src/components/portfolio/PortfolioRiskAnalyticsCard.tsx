import React, { useState } from 'react';
import { PortfolioRiskMetrics, SectorAllocation } from '../../services/portfolioAnalytics';
import { formatNaira } from '../../services/feeEngine';
import { 
  ShieldCheck, 
  Activity, 
  Target, 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

interface PortfolioRiskAnalyticsCardProps {
  metrics: PortfolioRiskMetrics;
  totalValue: number;
}

export const PortfolioRiskAnalyticsCard: React.FC<PortfolioRiskAnalyticsCardProps> = ({
  metrics,
  totalValue
}) => {
  const [hoveredSector, setHoveredSector] = useState<SectorAllocation | null>(null);

  // SVG Donut calculations
  const size = 160;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPct = 0;
  const slices = metrics.sectorAllocations.map(sec => {
    const strokeDasharray = `${(sec.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPct / 100) * circumference);
    accumulatedPct += sec.percentage;
    return {
      ...sec,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="bg-navy-900/90 border border-navy-700/80 rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <h3 className="text-base font-black text-white tracking-tight">
              Institutional Risk & Portfolio Analytics
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-300 border border-gold-500/30 font-bold uppercase">
              MPT Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time sensitivity, risk-adjusted returns & diversification measured against Central Bank of Nigeria (27.25% MPR).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Risk-Free Benchmark:</span>
          <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-navy-800 border border-navy-700">
            CBN MPR {metrics.cbnMprBenchmark}%
          </span>
        </div>
      </div>

      {/* 4 Quantitative Risk Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Metric 1: Portfolio Beta */}
        <div className="bg-navy-950/70 border border-navy-700/60 rounded-2xl p-4 shadow-sm hover:border-navy-600 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Portfolio Beta (&beta;<sub>p</sub>)</span>
            <Activity className="w-3.5 h-3.5 text-gold-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-2">
            {metrics.portfolioBeta.toFixed(2)}x
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              metrics.betaCategory === 'Aggressive' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : metrics.betaCategory === 'Defensive'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
            }`}>
              {metrics.betaCategory}
            </span>
            <span className="text-[10px] text-slate-400">vs NGX ASI (1.00x)</span>
          </div>
        </div>

        {/* Metric 2: Sharpe Ratio */}
        <div className="bg-navy-950/70 border border-navy-700/60 rounded-2xl p-4 shadow-sm hover:border-navy-600 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Sharpe Ratio (S<sub>p</sub>)</span>
            <Target className="w-3.5 h-3.5 text-gold-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-2">
            {metrics.sharpeRatio.toFixed(2)}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              metrics.sharpeCategory === 'Exceptional' || metrics.sharpeCategory === 'Strong'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-navy-800 text-slate-300 border border-navy-700'
            }`}>
              {metrics.sharpeCategory}
            </span>
            <span className="text-[10px] text-slate-400">&gt; 27.25% hurdle</span>
          </div>
        </div>

        {/* Metric 3: Max Drawdown */}
        <div className="bg-navy-950/70 border border-navy-700/60 rounded-2xl p-4 shadow-sm hover:border-navy-600 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Max Drawdown (MDD)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-2">
            -{metrics.maxDrawdownPct}%
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              metrics.maxDrawdownPct <= 5
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : metrics.maxDrawdownPct <= 15
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {metrics.maxDrawdownPct <= 5 ? 'Low Volatility' : metrics.maxDrawdownPct <= 15 ? 'Moderate' : 'High Exposure'}
            </span>
          </div>
        </div>

        {/* Metric 4: Diversification Score */}
        <div className="bg-navy-950/70 border border-navy-700/60 rounded-2xl p-4 shadow-sm hover:border-navy-600 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Diversification Score</span>
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-2 flex items-baseline gap-1">
            <span>{metrics.diversificationScore}</span>
            <span className="text-xs text-slate-400 font-sans">/ 100</span>
          </div>
          <div className="mt-2 w-full bg-navy-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-gold-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.diversificationScore}%` }}
            />
          </div>
        </div>

      </div>

      {/* Interactive Sector Donut & Breakdown Table */}
      <div className="bg-navy-950/60 border border-navy-700/50 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-gold-400" />
            <span>NGX Sector Allocation & Weight Distribution</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {metrics.sectorAllocations.length} Active Asset Classes
          </span>
        </div>

        {metrics.sectorAllocations.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No assets currently held in this portfolio. Buy equities to generate sector allocation breakdown.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Donut Graphic */}
            <div className="md:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg width={size} height={size} className="transform -rotate-90">
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#1E293B"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {slices.map((slice, idx) => (
                    <circle
                      key={idx}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke={slice.color}
                      strokeWidth={hoveredSector?.sector === slice.sector ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      fill="transparent"
                      strokeLinecap="butt"
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredSector(slice)}
                      onMouseLeave={() => setHoveredSector(null)}
                    />
                  ))}
                </svg>

                {/* Donut Center Hole Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 truncate max-w-[100px]">
                    {hoveredSector ? hoveredSector.sector : 'Equities / Cash'}
                  </div>
                  <div className="text-sm font-black font-mono text-white">
                    {hoveredSector ? `${hoveredSector.percentage}%` : `${metrics.equityPercentage}% Eq`}
                  </div>
                  {hoveredSector && (
                    <div className="text-[9px] text-gold-400 font-mono">
                      {formatNaira(hoveredSector.value)}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 font-mono">
                Hover slice to inspect capital weight
              </div>
            </div>

            {/* Sector Weights Grid */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {metrics.sectorAllocations.map(sec => (
                <div
                  key={sec.sector}
                  onMouseEnter={() => setHoveredSector(sec)}
                  onMouseLeave={() => setHoveredSector(null)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    hoveredSector?.sector === sec.sector 
                      ? 'bg-navy-800 border-gold-500 shadow-md scale-[1.01]' 
                      : 'bg-navy-900/80 border-navy-800 hover:border-navy-700'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: sec.color }} 
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">
                        {sec.sector}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {sec.stockCount > 0 ? `${sec.stockCount} equities` : 'Liquid balance'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <div className="text-xs font-black text-white">
                      {sec.percentage}%
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatNaira(sec.value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};

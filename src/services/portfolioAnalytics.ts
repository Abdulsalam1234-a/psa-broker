import { UserPosition, Stock, NGXSector } from '../types';

export interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  stockCount: number;
  color: string;
}

export interface PortfolioRiskMetrics {
  portfolioBeta: number;
  betaCategory: 'Aggressive' | 'Market-Aligned' | 'Defensive' | 'Cash-Heavy';
  sharpeRatio: number;
  sharpeCategory: 'Exceptional' | 'Strong' | 'Adequate' | 'Sub-Benchmark';
  maxDrawdownPct: number;
  cbnMprBenchmark: number; // e.g. 27.25%
  sectorAllocations: SectorAllocation[];
  cashPercentage: number;
  equityPercentage: number;
  diversificationScore: number; // 0 - 100
}

const SECTOR_BETAS: Record<string, number> = {
  'Financial Services': 1.28,
  'Banking': 1.28,
  'Oil & Gas': 1.35,
  'Industrial Goods': 0.95,
  'Consumer Goods': 0.82,
  'Telecommunications': 1.10,
  'ICT': 1.10,
  'Conglomerates': 1.05,
  'Agriculture': 0.72,
  'Healthcare': 0.65,
  'Services': 0.88,
  'Construction/Real Estate': 1.15,
  'Natural Resources': 1.20
};

const SECTOR_COLORS: Record<string, string> = {
  'Financial Services': '#3B82F6', // Blue
  'Banking': '#3B82F6',
  'Oil & Gas': '#F59E0B',          // Amber
  'Industrial Goods': '#10B981',    // Emerald
  'Consumer Goods': '#EC4899',      // Pink
  'Telecommunications': '#8B5CF6',  // Purple
  'ICT': '#8B5CF6',
  'Conglomerates': '#06B6D4',       // Cyan
  'Agriculture': '#84CC16',        // Lime
  'Healthcare': '#14B8A6',         // Teal
  'Services': '#64748B',           // Slate
  'Cash': '#C9A84C'                // Gold
};

export const calculatePortfolioRiskMetrics = (
  positions: UserPosition[],
  stocks: Stock[],
  cashBalance: number,
  totalPortfolioValue: number,
  totalGrowthPct: number
): PortfolioRiskMetrics => {
  const cbnMprBenchmark = 27.25; // 2026 Central Bank of Nigeria Monetary Policy Rate

  if (totalPortfolioValue <= 0) {
    return {
      portfolioBeta: 0,
      betaCategory: 'Cash-Heavy',
      sharpeRatio: 0,
      sharpeCategory: 'Sub-Benchmark',
      maxDrawdownPct: 0,
      cbnMprBenchmark,
      sectorAllocations: [],
      cashPercentage: 100,
      equityPercentage: 0,
      diversificationScore: 0
    };
  }

  const equityValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const cashPercentage = Number(((cashBalance / totalPortfolioValue) * 100).toFixed(1));
  const equityPercentage = Number(((equityValue / totalPortfolioValue) * 100).toFixed(1));

  // 1. Sector Allocation Breakdown
  const sectorMap = new Map<string, { value: number; count: number }>();

  positions.forEach(pos => {
    const stock = stocks.find(s => s.ticker === pos.ticker);
    const sectorName = stock ? stock.sector : 'Other';
    const existing = sectorMap.get(sectorName) || { value: 0, count: 0 };
    existing.value += pos.marketValue;
    existing.count += 1;
    sectorMap.set(sectorName, existing);
  });

  const sectorAllocations: SectorAllocation[] = [];
  sectorMap.forEach((data, sector) => {
    const pct = Number(((data.value / totalPortfolioValue) * 100).toFixed(1));
    sectorAllocations.push({
      sector,
      value: data.value,
      percentage: pct,
      stockCount: data.count,
      color: SECTOR_COLORS[sector] || '#A855F7'
    });
  });

  // Include Cash slice if significant (>0.5%)
  if (cashPercentage >= 0.5) {
    sectorAllocations.push({
      sector: 'Liquid Cash Buffer',
      value: cashBalance,
      percentage: cashPercentage,
      stockCount: 0,
      color: SECTOR_COLORS['Cash']
    });
  }

  // Sort descending by percentage
  sectorAllocations.sort((a, b) => b.percentage - a.percentage);

  // 2. Weighted Portfolio Beta
  let weightedBetaSum = 0;
  if (equityValue > 0) {
    positions.forEach(pos => {
      const stock = stocks.find(s => s.ticker === pos.ticker);
      const sector = stock ? stock.sector : 'Other';
      const beta = SECTOR_BETAS[sector] || 1.0;
      const weight = pos.marketValue / totalPortfolioValue;
      weightedBetaSum += weight * beta;
    });
  }
  const portfolioBeta = Number(weightedBetaSum.toFixed(2));

  let betaCategory: 'Aggressive' | 'Market-Aligned' | 'Defensive' | 'Cash-Heavy' = 'Market-Aligned';
  if (cashPercentage > 60) {
    betaCategory = 'Cash-Heavy';
  } else if (portfolioBeta >= 1.15) {
    betaCategory = 'Aggressive';
  } else if (portfolioBeta <= 0.85) {
    betaCategory = 'Defensive';
  }

  // 3. Sharpe Ratio vs CBN MPR
  // Annualized return (Rp) vs Risk-free rate (Rf = 27.25%)
  // Standard Deviation (sigma) modeled from beta + idiosyncratic volatility
  const estVolatility = Math.max(0.12, (portfolioBeta * 0.16) + 0.04);
  const rpDecimal = totalGrowthPct / 100;
  const rfDecimal = cbnMprBenchmark / 100;
  const excessReturn = rpDecimal - rfDecimal;
  const rawSharpe = excessReturn / estVolatility;
  const sharpeRatio = Number(rawSharpe.toFixed(2));

  let sharpeCategory: 'Exceptional' | 'Strong' | 'Adequate' | 'Sub-Benchmark' = 'Adequate';
  if (sharpeRatio >= 1.5) {
    sharpeCategory = 'Exceptional';
  } else if (sharpeRatio >= 0.8) {
    sharpeCategory = 'Strong';
  } else if (sharpeRatio >= 0.0) {
    sharpeCategory = 'Adequate';
  } else {
    sharpeCategory = 'Sub-Benchmark';
  }

  // 4. Maximum Drawdown (MDD) calculation
  // Computes peak unrealized negative swing across positions
  let worstPositionLossPct = 0;
  positions.forEach(p => {
    if (p.unrealizedPnlPct < worstPositionLossPct) {
      worstPositionLossPct = p.unrealizedPnlPct;
    }
  });
  const maxDrawdownPct = Number(Math.abs(worstPositionLossPct).toFixed(1));

  // 5. Diversification Score (0-100)
  // Higher with >= 5 stocks across >= 3 sectors with no single stock > 35%
  const sectorCount = sectorMap.size;
  const posCount = positions.length;
  let maxSingleWeight = 0;
  positions.forEach(p => {
    const w = (p.marketValue / totalPortfolioValue) * 100;
    if (w > maxSingleWeight) maxSingleWeight = w;
  });

  let divScore = 20; // baseline
  if (posCount >= 3) divScore += 20;
  if (posCount >= 6) divScore += 15;
  if (sectorCount >= 3) divScore += 20;
  if (sectorCount >= 5) divScore += 15;
  if (maxSingleWeight < 30) divScore += 10;
  divScore = Math.min(100, Math.max(0, divScore));

  return {
    portfolioBeta,
    betaCategory,
    sharpeRatio,
    sharpeCategory,
    maxDrawdownPct,
    cbnMprBenchmark,
    sectorAllocations,
    cashPercentage,
    equityPercentage,
    diversificationScore: divScore
  };
};

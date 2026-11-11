import { EventParticipant, ChallengeEvent, UserPosition, Order } from '../types';

export interface ParticipantScoreInput {
  roiPct: number;             // e.g. 14.5%
  maxDrawdownPct: number;     // e.g. 3.2%
  positions: UserPosition[];
  orders: Order[];
  thesesCount: number;        // completed trade theses
  weights: {
    roi: number;
    discipline: number;
    research: number;
  };
  maxSingleStockPct: number;  // e.g. 0.25 (25%)
  minSectorsRequired: number; // e.g. 3
  sectorLookup: (ticker: string) => string;
  totalPortfolioValue?: number; // Total portfolio value including cash
}

export interface ScoreBreakdown {
  compositeScore: number;
  riskAdjustedReturn: number;
  disciplineScore: number;
  researchScore: number;
  violationsCount: number;
  sectorsInvested: string[];
  stopLossBonus: boolean;
  diversificationBonus: boolean;
}

/**
 * Calculates the Composite Mastery Score (0–100 pts) for an event participant
 */
export function computeCompositeMastery(input: ParticipantScoreInput): ScoreBreakdown {
  const {
    roiPct,
    maxDrawdownPct,
    positions,
    orders,
    thesesCount,
    weights,
    maxSingleStockPct,
    minSectorsRequired,
    sectorLookup,
  } = input;

  // 1. RISK-ADJUSTED RETURN (0–100 pts)
  // Scaling formula: neutral starting point at 50 + (ROI * 3) - (Drawdown * 2.5)
  // Penalizes erratic spikes and drawdown plunges
  const rawRiskReturn = 50 + (roiPct * 3) - (maxDrawdownPct * 2.5);
  const riskAdjustedReturn = Math.max(0, Math.min(100, Number(rawRiskReturn.toFixed(2))));

  // 2. DISCIPLINE & RISK COMPLIANCE (0–100 pts)
  let disciplineScore = 80; // Baseline
  let violationsCount = 0;

  // Concentration check: does any position exceed the maxSingleStockPct?
  const totalPortfolioValue = input.totalPortfolioValue || positions.reduce((sum, p) => sum + p.marketValue, 0);
  if (totalPortfolioValue > 0) {
    for (const pos of positions) {
      const weight = pos.marketValue / totalPortfolioValue;
      if (weight > maxSingleStockPct) {
        violationsCount += 1;
        disciplineScore -= 20; // 20 point deduction per concentration violation
      }
    }
  }

  // Stop-loss adherence check: Did the user attach stop-losses to orders?
  const ordersWithStopLoss = orders.filter(o => o.orderType === 'STOP_LOSS' || (o.stopLossPrice && o.stopLossPrice > 0));
  const stopLossBonus = orders.length > 0 && ordersWithStopLoss.length >= Math.ceil(orders.length * 0.4);
  if (stopLossBonus) {
    disciplineScore += 10;
  }

  // Sector diversification check: at least N distinct NGX sectors
  const sectorsInvestedSet = new Set<string>();
  positions.forEach(p => {
    if (p.quantity > 0) {
      sectorsInvestedSet.add(sectorLookup(p.ticker));
    }
  });
  const sectorsInvested = Array.from(sectorsInvestedSet);
  const diversificationBonus = sectorsInvested.length >= minSectorsRequired;
  if (diversificationBonus) {
    disciplineScore += 10;
  }

  disciplineScore = Math.max(0, Math.min(100, disciplineScore));

  // 3. RESEARCH & THESES POINTS (0–100 pts)
  // Each completed thesis or fundamental check provides 20 pts (max 5 tasks = 100)
  const researchScore = Math.min(100, thesesCount * 20);

  // 4. COMPOSITE WEIGHTED SCORE
  const compositeScore = Number((
    (weights.roi * riskAdjustedReturn) +
    (weights.discipline * disciplineScore) +
    (weights.research * researchScore)
  ).toFixed(2));

  return {
    compositeScore,
    riskAdjustedReturn,
    disciplineScore,
    researchScore,
    violationsCount,
    sectorsInvested,
    stopLossBonus,
    diversificationBonus,
  };
}

/**
 * Re-ranks participants by Composite Score and computes rankDelta (▲ / ▼ / ▬)
 */
export function recomputeLeaderboardStandings(
  participants: EventParticipant[],
  event: ChallengeEvent
): EventParticipant[] {
  // Sort descending by composite score, then by ROI percentage
  const sorted = [...participants].sort((a, b) => {
    if (b.compositeScore !== a.compositeScore) {
      return b.compositeScore - a.compositeScore;
    }
    return b.roiPercentage - a.roiPercentage;
  });

  return sorted.map((p, index) => {
    const newRank = index + 1;
    const previousRank = p.currentRank || newRank;
    const rankDelta = previousRank - newRank; // positive = moved up, negative = dropped

    return {
      ...p,
      previousRank,
      currentRank: newRank,
      rankDelta,
    };
  });
}

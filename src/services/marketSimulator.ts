import { Stock, OrderBook, OrderBookLevel, Order, MarketNewsItem, NGXSector } from '../types';

/**
 * Generates an institutional 5-tier Level 2 Bid/Ask Order Book for any NGX stock
 */
export function generateOrderBook(stock: Stock): OrderBook {
  const currentPrice = stock.currentPrice;
  const tickStep = currentPrice > 100 ? 0.50 : (currentPrice > 20 ? 0.10 : 0.02);
  const spread = tickStep;
  const spreadPct = Number(((spread / currentPrice) * 100).toFixed(2));

  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];

  // Generate 5 Ask levels above current price
  for (let i = 1; i <= 5; i++) {
    const price = Number((currentPrice + (i * tickStep)).toFixed(2));
    const quantity = Math.floor(15000 + (Math.random() * 85000) * (6 - i));
    const total = Number((price * quantity).toFixed(2));
    asks.push({ price, quantity, total });
  }

  // Generate 5 Bid levels below current price
  for (let i = 1; i <= 5; i++) {
    const price = Number((currentPrice - (i * tickStep)).toFixed(2));
    const quantity = Math.floor(18000 + (Math.random() * 95000) * (6 - i));
    const total = Number((price * quantity).toFixed(2));
    bids.push({ price, quantity, total });
  }

  return {
    bids,
    asks,
    spread,
    spreadPct,
  };
}

/**
 * Simulates subtle organic price drift for all stocks in the universe
 * Strictly respects Nigerian Exchange daily circuit breaker bands (±10%)
 */
export function simulateMarketTick(stocks: Stock[]): Stock[] {
  return stocks.map(stock => {
    // 60% chance of ticking this turn
    if (Math.random() > 0.6) return stock;

    const volatility = 0.003; // 0.3% max tick jitter
    const priceChangePct = (Math.random() - 0.49) * volatility;
    let newPrice = Number((stock.currentPrice * (1 + priceChangePct)).toFixed(2));

    // Enforce NGX 10% daily price band limit against previous close
    const maxAllowed = Number((stock.previousClose * 1.10).toFixed(2));
    const minAllowed = Number((stock.previousClose * 0.90).toFixed(2));
    newPrice = Math.max(minAllowed, Math.min(maxAllowed, newPrice));

    const dayChange = Number((newPrice - stock.previousClose).toFixed(2));
    const dayChangePct = Number(((dayChange / stock.previousClose) * 100).toFixed(2));
    const dayHigh = Math.max(stock.dayHigh, newPrice);
    const dayLow = Math.min(stock.dayLow, newPrice);
    const volume = stock.volume + Math.floor(Math.random() * 15000);

    return {
      ...stock,
      currentPrice: newPrice,
      dayChange,
      dayChangePct,
      dayHigh,
      dayLow,
      volume,
    };
  });
}

/**
 * Applies Demand & Supply price pressure to a stock:
 * Excessive Buy orders > Sell orders push the price upward.
 * Excessive Sell orders > Buy orders push the price downward.
 */
export function applyDemandSupplyPressure(
  stocks: Stock[], 
  ticker: string, 
  side: 'BUY' | 'SELL', 
  units: number
): Stock[] {
  return stocks.map(stock => {
    if (stock.ticker !== ticker) return stock;

    // Dynamic price shift sensitivity based on traded units and shares outstanding
    const baseSensitivity = units > 50000 ? 0.012 : (units > 10000 ? 0.006 : 0.002);
    const direction = side === 'BUY' ? 1 : -1;
    const shiftPct = direction * baseSensitivity;

    let newPrice = Number((stock.currentPrice * (1 + shiftPct)).toFixed(2));

    // NGX Circuit Breaker (±10%)
    const maxAllowed = Number((stock.previousClose * 1.10).toFixed(2));
    const minAllowed = Number((stock.previousClose * 0.90).toFixed(2));
    newPrice = Math.max(minAllowed, Math.min(maxAllowed, newPrice));

    const dayChange = Number((newPrice - stock.previousClose).toFixed(2));
    const dayChangePct = Number(((dayChange / stock.previousClose) * 100).toFixed(2));
    const dayHigh = Math.max(stock.dayHigh, newPrice);
    const dayLow = Math.min(stock.dayLow, newPrice);

    return {
      ...stock,
      currentPrice: newPrice,
      dayChange,
      dayChangePct,
      dayHigh,
      dayLow,
      volume: stock.volume + units,
    };
  });
}

/**
 * Applies Macroeconomic, Regulatory, and Corporate Disclosure News Impact
 * Scaled by Source Credibility:
 * - OFFICIAL_REGULATORY: 100% full weight
 * - INSTITUTIONAL_MEDIA: 80% weight
 * - MARKET_ANALYST: 65% weight
 * - SOCIAL_INFLUENCER: 35% weight
 */
export function applyMacroeconomicNewsImpact(
  stocks: Stock[], 
  news: MarketNewsItem
): Stock[] {
  let credibilityFactor = 1.0;
  if (news.sourceCategory === 'OFFICIAL_REGULATORY') credibilityFactor = 1.0;
  else if (news.sourceCategory === 'INSTITUTIONAL_MEDIA') credibilityFactor = 0.80;
  else if (news.sourceCategory === 'MARKET_ANALYST') credibilityFactor = 0.65;
  else if (news.sourceCategory === 'SOCIAL_INFLUENCER') credibilityFactor = 0.35;

  const effectiveImpactPct = (news.priceImpactPct * credibilityFactor) / 100;

  return stocks.map(stock => {
    let shouldAffect = false;

    if (news.affectedTicker && stock.ticker === news.affectedTicker) {
      shouldAffect = true;
    } else if (news.affectedSector && stock.sector === news.affectedSector) {
      shouldAffect = true;
    } else if (news.category === 'DOMESTIC_MACRO' || news.category === 'WORLD_MACRO') {
      shouldAffect = true; // Macro affects broad market
    }

    if (!shouldAffect) return stock;

    let newPrice = Number((stock.currentPrice * (1 + effectiveImpactPct)).toFixed(2));

    // Enforce NGX ±10% daily circuit breaker
    const maxAllowed = Number((stock.previousClose * 1.10).toFixed(2));
    const minAllowed = Number((stock.previousClose * 0.90).toFixed(2));
    newPrice = Math.max(minAllowed, Math.min(maxAllowed, newPrice));

    const dayChange = Number((newPrice - stock.previousClose).toFixed(2));
    const dayChangePct = Number(((dayChange / stock.previousClose) * 100).toFixed(2));
    const dayHigh = Math.max(stock.dayHigh, newPrice);
    const dayLow = Math.min(stock.dayLow, newPrice);

    // If corporate disclosure had PAT growth or dividend, adjust EPS & yield
    let updatedEps = stock.eps;
    let updatedDividendYield = stock.dividendYield;

    if (news.corporateDisclosure) {
      if (news.corporateDisclosure.patGrowthPct) {
        updatedEps = Number((stock.eps * (1 + (news.corporateDisclosure.patGrowthPct / 100))).toFixed(2));
      }
      if (news.corporateDisclosure.dividendPerShare && newPrice > 0) {
        updatedDividendYield = Number(((news.corporateDisclosure.dividendPerShare / newPrice) * 100).toFixed(2));
      }
    }

    return {
      ...stock,
      currentPrice: newPrice,
      dayChange,
      dayChangePct,
      dayHigh,
      dayLow,
      eps: updatedEps,
      dividendYield: updatedDividendYield,
      volume: stock.volume + Math.floor(Math.random() * 50000 + 20000),
    };
  });
}

/**
 * Adjusts all stocks in a specific NGX Sector by a targeted All-Share Index delta
 */
export function adjustSectorIndexPrices(
  stocks: Stock[], 
  sector: NGXSector, 
  deltaPct: number
): Stock[] {
  const factor = deltaPct / 100;
  return stocks.map(stock => {
    if (stock.sector !== sector) return stock;

    let newPrice = Number((stock.currentPrice * (1 + factor)).toFixed(2));
    const maxAllowed = Number((stock.previousClose * 1.10).toFixed(2));
    const minAllowed = Number((stock.previousClose * 0.90).toFixed(2));
    newPrice = Math.max(minAllowed, Math.min(maxAllowed, newPrice));

    const dayChange = Number((newPrice - stock.previousClose).toFixed(2));
    const dayChangePct = Number(((dayChange / stock.previousClose) * 100).toFixed(2));

    return {
      ...stock,
      currentPrice: newPrice,
      dayChange,
      dayChangePct,
      dayHigh: Math.max(stock.dayHigh, newPrice),
      dayLow: Math.min(stock.dayLow, newPrice),
    };
  });
}

/**
 * Checks pending Limit and Stop-Loss orders against current market prices
 */
export function matchPendingOrders(
  orders: Order[],
  stocks: Stock[]
): { filledOrders: Order[]; remainingPending: Order[] } {
  const stockMap = new Map<string, number>();
  stocks.forEach(s => stockMap.set(s.ticker, s.currentPrice));

  const filledOrders: Order[] = [];
  const remainingPending: Order[] = [];

  for (const order of orders) {
    if (order.status !== 'PENDING') {
      remainingPending.push(order);
      continue;
    }

    const currentPrice = stockMap.get(order.ticker);
    if (!currentPrice) {
      remainingPending.push(order);
      continue;
    }

    let shouldFill = false;
    let fillPrice = currentPrice;

    if (order.orderType === 'LIMIT') {
      if (order.orderSide === 'BUY' && order.targetPrice && currentPrice <= order.targetPrice) {
        shouldFill = true;
        fillPrice = Math.min(currentPrice, order.targetPrice);
      } else if (order.orderSide === 'SELL' && order.targetPrice && currentPrice >= order.targetPrice) {
        shouldFill = true;
        fillPrice = Math.max(currentPrice, order.targetPrice);
      }
    } else if (order.orderType === 'STOP_LOSS') {
      if (order.orderSide === 'SELL' && order.stopLossPrice && currentPrice <= order.stopLossPrice) {
        shouldFill = true;
        fillPrice = currentPrice;
      }
    } else if (order.orderType === 'STOP_LIMIT') {
      if (order.orderSide === 'SELL' && order.stopLossPrice && currentPrice <= order.stopLossPrice) {
        if (!order.limitStopPrice || currentPrice >= order.limitStopPrice) {
          shouldFill = true;
          fillPrice = currentPrice;
        }
      } else if (order.orderSide === 'BUY' && order.stopLossPrice && currentPrice >= order.stopLossPrice) {
        if (!order.limitStopPrice || currentPrice <= order.limitStopPrice) {
          shouldFill = true;
          fillPrice = currentPrice;
        }
      }
    }

    if (shouldFill) {
      filledOrders.push({
        ...order,
        status: 'FILLED',
        executionPrice: fillPrice,
        executedAt: new Date().toISOString(),
      });
    } else {
      remainingPending.push(order);
    }
  }

  return { filledOrders, remainingPending };
}

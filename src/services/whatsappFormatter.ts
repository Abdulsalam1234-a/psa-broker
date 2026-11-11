import { MarketNewsItem, NewsSourceCredibility } from '../types';

/**
 * Returns user-friendly credibility badge label & icon for WhatsApp broadcast
 */
export function getCredibilityLabel(cat: NewsSourceCredibility): { label: string; badge: string; weightPct: number } {
  switch (cat) {
    case 'OFFICIAL_REGULATORY':
      return {
        label: 'Official Primary Regulatory Filing',
        badge: '🏛️ OFFICIAL SEC/CBN/NGX',
        weightPct: 100,
      };
    case 'INSTITUTIONAL_MEDIA':
      return {
        label: 'Tier-1 Institutional Financial Press',
        badge: '📰 INSTITUTIONAL PRESS',
        weightPct: 75,
      };
    case 'MARKET_ANALYST':
      return {
        label: 'Chartered CFA / Investment Bank Research',
        badge: '📊 RESEARCH NOTE',
        weightPct: 60,
      };
    case 'SOCIAL_INFLUENCER':
      return {
        label: 'FinTech Influencer / Community Rumor',
        badge: '💬 SOCIAL / SPECULATIVE',
        weightPct: 35,
      };
  }
}

/**
 * Generates an institutional, viral, beautifully structured WhatsApp headline and message draft
 * ready for 1-click dispatch to the Naira Stock Academy WhatsApp community.
 */
export function generateWhatsAppBroadcastText(item: {
  headline: string;
  summary: string;
  sourceName: string;
  sourceCategory: NewsSourceCredibility;
  authorPersona: string;
  authorTitle: string;
  scope: 'GLOBAL' | 'EVENT';
  eventTitle?: string;
  affectedTicker?: string;
  affectedSector?: string;
  sentiment: 'HIGHLY_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'HIGHLY_BEARISH';
  priceImpactPct: number;
  corporateDisclosure?: {
    patGrowthPct?: number;
    dividendPerShare?: number;
    revenueChangePct?: number;
  };
}): string {
  const cred = getCredibilityLabel(item.sourceCategory);
  const isPositive = item.priceImpactPct >= 0;
  const sentimentEmoji = 
    item.sentiment === 'HIGHLY_BULLISH' ? '🚀' :
    item.sentiment === 'BULLISH' ? '📈' :
    item.sentiment === 'NEUTRAL' ? '⚖️' :
    item.sentiment === 'BEARISH' ? '📉' : '💥';

  const sign = isPositive ? '+' : '';
  const scopeLabel = item.scope === 'GLOBAL' 
    ? '🌐 ALL NGX EQUITIES (GLOBAL NIGERIAN MARKET)' 
    : `🏆 COHORT EVENT: ${item.eventTitle || 'Academy Challenge'}`;

  const targetAsset = item.affectedTicker 
    ? `Ticker: ${item.affectedTicker}` 
    : (item.affectedSector ? `Sector: ${item.affectedSector} Index` : 'General All-Share Index (ASI)');

  let disclosureLines = '';
  if (item.corporateDisclosure) {
    const d = item.corporateDisclosure;
    if (d.patGrowthPct !== undefined && d.patGrowthPct !== null) {
      disclosureLines += `\n• *Profit After Tax (PAT):* ${d.patGrowthPct >= 0 ? '+' : ''}${d.patGrowthPct}% YoY`;
    }
    if (d.dividendPerShare !== undefined && d.dividendPerShare !== null && d.dividendPerShare > 0) {
      disclosureLines += `\n• *Proposed Dividend:* ₦${d.dividendPerShare.toFixed(2)} per ordinary share`;
    }
    if (d.revenueChangePct !== undefined && d.revenueChangePct !== null) {
      disclosureLines += `\n• *Topline Revenue Growth:* ${d.revenueChangePct >= 0 ? '+' : ''}${d.revenueChangePct}% YoY`;
    }
  }

  return `🚨 *PSA BROKER & NAIRA STOCK ACADEMY MARKET FLASH* 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sentimentEmoji} *HEADLINE:* ${item.headline.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏛️ *SOURCE:* ${item.sourceName}
🏷️ *CREDIBILITY:* ${cred.badge} (${cred.weightPct}% Impact Weight)
👤 *DISCLOSED BY:* ${item.authorPersona} (${item.authorTitle})
🎯 *MARKET SCOPE:* ${scopeLabel}

📊 *FINANCIAL & PRICE ACTION MATRIX:*
• *Target Asset:* ${targetAsset}
• *Market Sentiment:* ${sentimentEmoji} ${item.sentiment.replace('_', ' ')}
• *Projected Price Reaction:* ${sign}${item.priceImpactPct.toFixed(2)}% Immediate Impact${disclosureLines}

📝 *INTELLIGENCE SUMMARY:*
${item.summary}

💡 *ACTIONABLE ACADEMY NOTICE:*
Traders & Cohort Members: Log in to your *PSA Broker Terminal* immediately to review order books, manage stop-loss triggers, or rebalance your portfolio before the 4:00 PM WAT market close!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 *Execute Trade Now:* https://psabroker.nairastock.edu.ng
*PSA Broker* © PSA Investment Property | In Strategic Partnership with *Naira Stock Academy*`;
}

/**
 * Builds direct WhatsApp Web or Mobile sharing URL
 */
export function getWhatsAppShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

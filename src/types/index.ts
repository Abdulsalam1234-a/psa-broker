export type UserRole = 'STUDENT' | 'MANAGER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

export type RankTier = 
  | 'Novice Observer' 
  | 'Junior Analyst' 
  | 'Portfolio Strategist' 
  | 'Chartered Contender';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  academyXp: number;
  rankTier: RankTier;
  badges: string[];
  createdAt: string;
  handle: string;
  avatarUrl?: string;
  password?: string;
}

export interface StockNewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  sentiment: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
}

export type NGXSector = 
  | 'Financial Services'
  | 'ICT & Telecommunications'
  | 'Industrial Goods'
  | 'Consumer Goods'
  | 'Oil & Gas'
  | 'Conglomerates & Agriculture'
  | 'Healthcare';

export interface BalanceSheet {
  fiscalYear: string;
  currency: string; // "NGN Billions" or "NGN Millions"
  cashAndEquivalents: number;
  tradeReceivables: number;
  inventories: number;
  totalCurrentAssets: number;
  propertyPlantEquipment: number;
  intangibleAssets: number;
  totalNonCurrentAssets: number;
  totalAssets: number;
  shortTermDebt: number;
  accountsPayable: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  totalNonCurrentLiabilities: number;
  totalLiabilities: number;
  retainedEarnings: number;
  shareholdersEquity: number;
}

export interface IncomeStatement {
  fiscalYear: string;
  currency: string;
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingProfit: number; // EBIT
  ebitda: number;
  netFinanceCost: number;
  profitBeforeTax: number;
  taxExpense: number;
  netIncome: number;
  eps: number; // in NGN
}

export interface CashFlow {
  fiscalYear: string;
  currency: string;
  operatingCashFlow: number;
  capitalExpenditures: number;
  freeCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  dividendsPaid: number;
  netCashFlow: number;
}

export interface CorporateAction {
  id: string;
  type: 'DIVIDEND' | 'EARNINGS' | 'AGM';
  title: string;
  details: string;
  date: string;
  dividendAmount?: number; // e.g. ₦3.20 per share
  qualificationDate?: string;
  closureOfRegister?: string;
  paymentDate?: string;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadPct: number;
}

export interface CandlestickData {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Stock {
  ticker: string;
  name: string;
  sector: NGXSector;
  currentPrice: number;
  previousClose: number;
  dayChange: number;
  dayChangePct: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  volume: number;
  marketCap: number; // in Billions NGN
  peRatio: number;
  dividendYield: number; // in %
  debtToEquity: number;
  roePct: number; // in %
  eps: number; // in NGN
  sharesOutstanding: number; // in Millions
  description: string;
  balanceSheet: BalanceSheet;
  incomeStatement: IncomeStatement;
  cashFlow: CashFlow;
  corporateActions: CorporateAction[];
  historicalCandles: CandlestickData[];
  news?: StockNewsItem[];
}

export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LIMIT';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED';

export interface FeeBreakdown {
  secFee: number;       // 0.30%
  cscsFee: number;      // 0.35%
  brokerFee: number;    // 0.70%
  stampDuty: number;    // 0.075%
  vatFee: number;       // 7.5% on Broker Fee (~0.0525%)
  totalFee: number;     // ~1.4775%
  totalRatePct: number;
}

export interface Order {
  id: string;
  userId: string;
  accountId: string; // 'sandbox' or eventId
  ticker: string;
  orderType: OrderType;
  orderSide: OrderSide;
  quantity: number;
  targetPrice?: number;
  stopLossPrice?: number;
  limitStopPrice?: number;
  executionPrice?: number;
  grossAmount: number;
  feeDeducted: number;
  netAmount: number;
  feeBreakdown: FeeBreakdown;
  status: OrderStatus;
  createdAt: string;
  executedAt?: string;
  thesisNote?: string;
  contractNoteNumber?: string;
}

export interface UserPosition {
  id: string;
  userId: string;
  accountId: string; // 'sandbox' or eventId
  ticker: string;
  quantity: number;
  avgBuyPrice: number;
  totalCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  portfolioWeightPct: number;
}

export type AccountType = 'SANDBOX' | 'EVENT';

export interface PortfolioAccount {
  id: string; // 'sandbox' or event.id
  name: string;
  type: AccountType;
  eventId?: string;
  initialBalance: number;
  cashBalance: number;
  portfolioValue: number;
  totalReturn: number;
  totalReturnPct: number;
  realizedPnl: number;
  positions: UserPosition[];
  orders: Order[];
}

export type EventStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED';

export interface ChallengeEvent {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdByName: string;
  assignedManagerId?: string;
  assignedManagerName?: string;
  startTime: string;
  endTime: string;
  status: EventStatus;
  startingCapital: number;
  entryFeeTokens: number;
  weightRoi: number;         // e.g. 0.40
  weightDiscipline: number;  // e.g. 0.35
  weightResearch: number;    // e.g. 0.25
  maxSingleStockPct: number; // e.g. 0.25 (25%)
  minSectorsRequired: number;// e.g. 3 sectors
  participantsCount: number;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  userHandle: string;
  userFullName: string;
  userRole: UserRole;
  rankTier: RankTier;
  cashBalance: number;
  portfolioValue: number;
  roiPercentage: number;
  maxDrawdownPct: number;
  disciplineScore: number;
  researchPoints: number;
  compositeScore: number;
  currentRank: number;
  previousRank: number;
  rankDelta: number; // +2, -1, 0
  violationsCount: number;
  thesesCount: number;
  sectorsInvested: string[];
  registeredAt: string;
}

// ==========================================
// AUDIT LOGGING & GOVERNANCE ARCHITECTURE
// ==========================================
export type AuditActionType = 
  | 'ADD_STUDENT_TO_EVENT'
  | 'REMOVE_STUDENT_FROM_EVENT'
  | 'ASSIGN_MANAGER'
  | 'UPDATE_EVENT_RULES'
  | 'POST_MARKET_UPDATE'
  | 'ADJUST_SECTOR_INDEX'
  | 'ADJUST_STOCK_PRICE'
  | 'APPROVE_USER'
  | 'ROLE_CHANGE'
  | 'DELETE_USER'
  | 'AWARD_STUDENT_XP'
  | 'ADJUST_DISCIPLINE_SCORE';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  actionType: AuditActionType;
  eventId?: string;
  eventTitle?: string;
  targetUserId?: string;
  targetUserName?: string;
  description: string;
  metadata?: Record<string, any>;
}

// ==========================================
// SIMULATION, MACROECONOMIC & NEWS TYPES
// ==========================================
export type NewsSourceCredibility = 
  | 'OFFICIAL_REGULATORY' // 100% weight, immediate market impact (SEC, CBN, NGX, NBS)
  | 'INSTITUTIONAL_MEDIA' // 75% weight (Bloomberg Africa, BusinessDay, Proshare)
  | 'MARKET_ANALYST'      // 60% weight (Chartered CFA Research note, Investment Bank note)
  | 'SOCIAL_INFLUENCER';  // 35% weight, high volatility (Twitter/X FinTech influencer, forum leak)

export type MarketSimulationCategory = 
  | 'WORLD_MACRO'         // Global crude oil, Fed rates, FX supply
  | 'DOMESTIC_MACRO'      // CBN Monetary Policy Rate (MPR), Naira FX liquidity, Inflation
  | 'SECTOR_INDEX'        // Banking recapitalization, Telco spectrum, Industrial tariff
  | 'STOCK_SPECIFIC'      // PAT earnings surge, Dividend bonus, Corporate restructuring
  | 'ORDERBOOK_PRESSURE'; // Heavy institutional buy/sell order flow

export type NewsScope = 'GLOBAL' | 'EVENT';

export interface MarketNewsItem {
  id: string;
  headline: string;
  summary: string;
  sourceName: string;
  sourceCategory: NewsSourceCredibility;
  authorPersona: string;  // e.g. "Dr. Yemi Cardoso (CBN Gov)", "NGX Corporate Disclosures", "Kalu Trades (FinTech Whale)"
  authorTitle: string;
  category: MarketSimulationCategory;
  scope: NewsScope;
  eventId?: string;
  eventTitle?: string;
  affectedTicker?: string;
  affectedSector?: NGXSector;
  sentiment: 'HIGHLY_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'HIGHLY_BEARISH';
  priceImpactPct: number; // e.g. +4.5% or -6.2%
  corporateDisclosure?: {
    patGrowthPct?: number;     // Profit After Tax change e.g. +45%
    dividendPerShare?: number; // e.g. ₦3.50
    revenueChangePct?: number;
  };
  whatsappHeadline: string;
  whatsappDraft: string;
  publishedAt: string;
  publishedBy: string;
  publishedByName: string;
}

// ==========================================
// 1. NGX ALL-SHARE INDEX & MARKET PULSE
// ==========================================
export interface ASIData {
  indexPoints: number;
  dayChange: number;
  dayChangePct: number;
  marketCapTrillionNaira: number;
  totalVolumeMillion: number;
  totalValueMillionNaira: number;
  totalDeals: number;
  topGainers: { ticker: string; name: string; changePct: number; currentPrice: number }[];
  topLosers: { ticker: string; name: string; changePct: number; currentPrice: number }[];
}

// ==========================================
// 2. INTERACTIVE ACADEMY LAB & QUESTS
// ==========================================
export interface AcademyQuest {
  id: string;
  title: string;
  description: string;
  category: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  rewardXp: number;
  isCompleted: boolean;
  progress: number;
  maxProgress: number;
  badgeUnlock?: string;
}

export interface FinancialRatioQuestion {
  id: string;
  ticker: string;
  companyName: string;
  ratioName: string;
  formulaPrompt: string;
  formulaHint: string;
  dataInputs: { label: string; value: string }[];
  options: { id: string; label: string; isCorrect: boolean }[];
  explanation: string;
  rewardXp: number;
}

// ==========================================
// 3. CORPORATE ACTIONS & DIVIDEND PAYOUTS
// ==========================================
export interface DividendRecord {
  id: string;
  userId: string;
  accountId: string;
  ticker: string;
  stockName: string;
  sharesHeld: number;
  dividendPerShare: number;
  totalPayoutGross: number;
  withholdingTax: number; // 10% Nigerian WHT
  netPayoutCredited: number;
  paymentDate: string;
  qualificationDate: string;
  paidAt: string;
}

// ==========================================
// 4. CSCS BROKER CONTRACT NOTES
// ==========================================
export interface ContractNoteData {
  contractNoteNumber: string;
  orderId: string;
  tradeDate: string;
  settlementDate: string;
  clientName: string;
  clientAccount: string;
  brokerName: string;
  clearingHouse: string;
  ticker: string;
  companyName: string;
  orderSide: OrderSide;
  orderType: OrderType;
  quantity: number;
  pricePerShare: number;
  grossConsideration: number;
  secFee: number;
  cscsFee: number;
  brokerCommission: number;
  stampDuty: number;
  vat: number;
  netSettlementAmount: number;
  status: 'SETTLED' | 'PENDING_CLEARING';
}

// ==========================================
// 5. THE TRADING FLOOR: COMMUNITY THESES
// ==========================================
export interface ThesisComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
}

export interface CommunityThesis {
  id: string;
  orderId?: string;
  userId: string;
  userFullName: string;
  userHandle: string;
  userRole: UserRole;
  rankTier: RankTier;
  avatarUrl?: string;
  ticker: string;
  companyName: string;
  orderSide: OrderSide;
  quantity?: number;
  price?: number;
  thesisText: string;
  keyMetricHighlight?: string;
  createdAt: string;
  upvotes: string[];
  comments: ThesisComment[];
  isMentorApproved?: boolean;
}

export interface StudentCertificate {
  id: string;
  userId: string;
  userName: string;
  eventName: string;
  rank: number;
  disciplineScore: number;
  roiPct: number;
  issuedDate: string;
  verificationCode: string;
}

// ==========================================
// 6. REAL-TIME PRICE ALERTS
// ==========================================
export interface PriceAlert {
  id: string;
  userId: string;
  ticker: string;
  stockName: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  createdAt: string;
  isTriggered: boolean;
  triggeredAt?: string;
}



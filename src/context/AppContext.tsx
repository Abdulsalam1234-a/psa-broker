import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  User, 
  UserRole, 
  UserStatus,
  Stock, 
  Order, 
  UserPosition, 
  PortfolioAccount, 
  ChallengeEvent, 
  EventParticipant,
  OrderType,
  OrderSide,
  AuditLogItem,
  AuditActionType,
  MarketNewsItem,
  NGXSector,
  NewsSourceCredibility,
  MarketSimulationCategory,
  NewsScope,
  PriceAlert,
  DividendRecord,
  CommunityThesis,
  ThesisComment
} from '../types';
import { NGX_STOCKS } from '../data/ngxUniverse';
import { calculateNGXTransactionFee } from '../services/feeEngine';
import { 
  simulateMarketTick, 
  matchPendingOrders,
  applyDemandSupplyPressure,
  applyMacroeconomicNewsImpact,
  adjustSectorIndexPrices
} from '../services/marketSimulator';
import { generateWhatsAppBroadcastText } from '../services/whatsappFormatter';
import { computeCompositeMastery, recomputeLeaderboardStandings } from '../services/compositeScoring';
import { getNGXMarketStatus } from '../services/marketHours';
import { soundFx } from '../services/soundEffects';
import { processDividendsForAccount } from '../services/dividendEngine';
import { 
  fetchLiveTradingViewQuotes, 
  applyTradingViewQuotesToStocks 
} from '../services/tradingViewLiveFeed';
import { TRADINGVIEW_SNAPSHOT } from '../data/tradingViewSnapshot';

// Initial Mock Users with status & passwords
export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    fullName: 'PSA Super Administrator',
    email: 'admin@psainvestments.ng',
    phoneNumber: '+2348099998877',
    role: 'ADMIN',
    status: 'ACTIVE',
    academyXp: 5000,
    rankTier: 'Chartered Contender',
    badges: ['Super Admin', 'Platform Architect', 'Executive Governance'],
    createdAt: '2025-01-01',
    handle: '@psa_superadmin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    password: 'password123',
  },
  {
    id: 'user-funke',
    fullName: 'Dr. Funke Adeyemi',
    email: 'dr.adeyemi@nairastock.edu.ng',
    phoneNumber: '+2348061112233',
    role: 'MANAGER',
    status: 'ACTIVE',
    academyXp: 1250,
    rankTier: 'Chartered Contender',
    badges: ['Course Instructor', 'Portfolio Mentor', 'Chartered Analyst'],
    createdAt: '2026-01-10',
    handle: '@dr_adeyemi_cfa',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    password: 'password123',
  },
  {
    id: 'user-chidi',
    fullName: 'Chidi Okafor',
    email: 'chidi.okafor@nairastock.edu.ng',
    phoneNumber: '+2348031234567',
    role: 'STUDENT',
    status: 'ACTIVE',
    academyXp: 280,
    rankTier: 'Junior Analyst',
    badges: ['First Trade Executed', 'Stop-Loss Guardian', 'Financial Teardown Level 1'],
    createdAt: '2026-09-15',
    handle: '@chidi_trades',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    password: 'password123',
  },
  {
    id: 'user-amina',
    fullName: 'Amina Bello',
    email: 'amina.bello@nairastock.edu.ng',
    phoneNumber: '+2348029876543',
    role: 'STUDENT',
    status: 'ACTIVE',
    academyXp: 460,
    rankTier: 'Portfolio Strategist',
    badges: ['Top 3 Podium', 'Sector Diversifier', 'Alpha Analyst', 'Perfect Stop-Loss'],
    createdAt: '2026-08-10',
    handle: '@amina_invests',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    password: 'password123',
  },
  {
    id: 'user-tunde',
    fullName: 'Tunde Bakare',
    email: 'tunde.bakare@nairastock.edu.ng',
    phoneNumber: '+2348055554321',
    role: 'STUDENT',
    status: 'ACTIVE',
    academyXp: 140,
    rankTier: 'Novice Observer',
    badges: ['First Trade Executed'],
    createdAt: '2026-10-01',
    handle: '@tunde_capital',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    password: 'password123',
  },
  {
    id: 'user-grace',
    fullName: 'Grace Danjuma',
    email: 'grace.danjuma@nairastock.edu.ng',
    phoneNumber: '+2348149871234',
    role: 'STUDENT',
    status: 'PENDING', // Pending Admin approval demo
    academyXp: 100,
    rankTier: 'Novice Observer',
    badges: ['Welcome to NairaStock'],
    createdAt: '2026-11-01',
    handle: '@grace_d',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    password: 'password123',
  }
];

export const INITIAL_EVENTS: ChallengeEvent[] = [
  {
    id: 'event-ngx-championship',
    title: 'PSA National NGX Equity Championship 2026',
    description: 'Premier national trading competition. Balance high returns against drawdown, enforce maximum 25% single-stock exposure, and complete 3-statement research teardowns.',
    createdBy: 'user-funke',
    createdByName: 'Dr. Funke Adeyemi',
    assignedManagerId: 'user-funke',
    assignedManagerName: 'Dr. Funke Adeyemi',
    startTime: '2026-11-01T08:00:00Z',
    endTime: '2026-11-30T17:00:00Z',
    status: 'ACTIVE',
    startingCapital: 2000000.00,
    entryFeeTokens: 50,
    weightRoi: 0.40,
    weightDiscipline: 0.35,
    weightResearch: 0.25,
    maxSingleStockPct: 0.25,
    minSectorsRequired: 3,
    participantsCount: 4,
  },
  {
    id: 'event-banking-sprint',
    title: 'Tier-1 Banking Sector Recapitalization Sprint',
    description: 'Specialized 2-week challenge focusing on Nigerian bank valuations, capital adequacy, and interest margins during the ongoing CBN recapitalization window.',
    createdBy: 'user-funke',
    createdByName: 'Dr. Funke Adeyemi',
    assignedManagerId: 'user-funke',
    assignedManagerName: 'Dr. Funke Adeyemi',
    startTime: '2026-11-05T08:00:00Z',
    endTime: '2026-11-19T17:00:00Z',
    status: 'ACTIVE',
    startingCapital: 1500000.00,
    entryFeeTokens: 25,
    weightRoi: 0.30,
    weightDiscipline: 0.50,
    weightResearch: 0.20,
    maxSingleStockPct: 0.35,
    minSectorsRequired: 1,
    participantsCount: 3,
  },
  {
    id: 'event-energy-industrial',
    title: 'Industrial & Energy Super-Cycle Teardown',
    description: 'Analyze industrial infrastructure and upstream energy stocks. Trade Seplat, Dangote Cement, Aradel, and BUA Cement with deep cash-flow analysis.',
    createdBy: 'user-admin',
    createdByName: 'PSA Super Administrator',
    assignedManagerId: 'user-admin',
    assignedManagerName: 'PSA Super Administrator',
    startTime: '2026-12-01T08:00:00Z',
    endTime: '2026-12-15T17:00:00Z',
    status: 'UPCOMING',
    startingCapital: 3000000.00,
    entryFeeTokens: 75,
    weightRoi: 0.45,
    weightDiscipline: 0.35,
    weightResearch: 0.20,
    maxSingleStockPct: 0.25,
    minSectorsRequired: 2,
    participantsCount: 0,
  }
];

export const INITIAL_PARTICIPANTS: EventParticipant[] = [
  {
    id: 'part-amina-1',
    eventId: 'event-ngx-championship',
    userId: 'user-amina',
    userHandle: '@amina_invests',
    userFullName: 'Amina Bello',
    userRole: 'STUDENT',
    rankTier: 'Portfolio Strategist',
    cashBalance: 480500.00,
    portfolioValue: 2315000.00,
    roiPercentage: 15.75,
    maxDrawdownPct: 2.10,
    disciplineScore: 95.0,
    researchPoints: 80.0,
    compositeScore: 88.45,
    currentRank: 1,
    previousRank: 1,
    rankDelta: 0,
    violationsCount: 0,
    thesesCount: 4,
    sectorsInvested: ['Financial Services', 'Industrial Goods', 'Consumer Goods'],
    registeredAt: '2026-11-01',
  },
  {
    id: 'part-chidi-1',
    eventId: 'event-ngx-championship',
    userId: 'user-chidi',
    userHandle: '@chidi_trades',
    userFullName: 'Chidi Okafor',
    userRole: 'STUDENT',
    rankTier: 'Junior Analyst',
    cashBalance: 620000.00,
    portfolioValue: 2210000.00,
    roiPercentage: 10.50,
    maxDrawdownPct: 3.80,
    disciplineScore: 85.0,
    researchPoints: 60.0,
    compositeScore: 78.10,
    currentRank: 2,
    previousRank: 3,
    rankDelta: 1,
    violationsCount: 0,
    thesesCount: 3,
    sectorsInvested: ['Financial Services', 'ICT & Telecommunications', 'Oil & Gas'],
    registeredAt: '2026-11-01',
  },
  {
    id: 'part-tunde-1',
    eventId: 'event-ngx-championship',
    userId: 'user-tunde',
    userHandle: '@tunde_capital',
    userFullName: 'Tunde Bakare',
    userRole: 'STUDENT',
    rankTier: 'Novice Observer',
    cashBalance: 150000.00,
    portfolioValue: 2180000.00,
    roiPercentage: 9.00,
    maxDrawdownPct: 7.50,
    disciplineScore: 60.0,
    researchPoints: 20.0,
    compositeScore: 61.25,
    currentRank: 3,
    previousRank: 2,
    rankDelta: -1,
    violationsCount: 1,
    thesesCount: 1,
    sectorsInvested: ['Industrial Goods'],
    registeredAt: '2026-11-02',
  },
  {
    id: 'part-grace-1',
    eventId: 'event-ngx-championship',
    userId: 'user-grace',
    userHandle: '@grace_d',
    userFullName: 'Grace Danjuma',
    userRole: 'STUDENT',
    rankTier: 'Novice Observer',
    cashBalance: 2000000.00,
    portfolioValue: 2000000.00,
    roiPercentage: 0.00,
    maxDrawdownPct: 0.00,
    disciplineScore: 80.0,
    researchPoints: 0.0,
    compositeScore: 48.00,
    currentRank: 4,
    previousRank: 4,
    rankDelta: 0,
    violationsCount: 0,
    thesesCount: 0,
    sectorsInvested: [],
    registeredAt: '2026-11-03',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-1',
    timestamp: '2026-11-05T09:30:00Z',
    actorId: 'user-admin',
    actorName: 'PSA Super Administrator',
    actorRole: 'ADMIN',
    actionType: 'ASSIGN_MANAGER',
    eventId: 'event-ngx-championship',
    eventTitle: 'PSA National NGX Equity Championship 2026',
    description: 'Super Admin assigned Dr. Funke Adeyemi as Executive Course Manager for "PSA National NGX Equity Championship 2026".',
  },
  {
    id: 'log-2',
    timestamp: '2026-11-05T10:15:00Z',
    actorId: 'user-funke',
    actorName: 'Dr. Funke Adeyemi',
    actorRole: 'MANAGER',
    actionType: 'ADD_STUDENT_TO_EVENT',
    eventId: 'event-ngx-championship',
    eventTitle: 'PSA National NGX Equity Championship 2026',
    targetUserId: 'user-chidi',
    targetUserName: 'Chidi Okafor',
    description: 'Dr. Funke Adeyemi (MANAGER) enrolled student Chidi Okafor into "PSA National NGX Equity Championship 2026" with ₦2,000,000 allocation.',
  },
  {
    id: 'log-3',
    timestamp: '2026-11-06T14:20:00Z',
    actorId: 'user-admin',
    actorName: 'PSA Super Administrator',
    actorRole: 'ADMIN',
    actionType: 'POST_MARKET_UPDATE',
    description: 'Super Admin published OFFICIAL_REGULATORY disclosure: "Central Bank of Nigeria Reaffirms Banking Recapitalization Deadline & FX Liquidity Injection" (+4.5% on Financial Services).',
    metadata: { ticker: 'ZENITHBANK', priceImpactPct: 4.5 }
  }
];

export const INITIAL_MARKET_NEWS: MarketNewsItem[] = [
  {
    id: 'news-init-1',
    headline: 'Central Bank of Nigeria (CBN) Reaffirms Banking Recapitalization Deadline & FX Liquidity Injection',
    summary: 'The Monetary Policy Committee noted heightened resilience among tier-1 Nigerian lenders. Retained earnings buffers of Zenith Bank and GTCO exceed regulatory thresholds with substantial foreign exchange revaluation surpluses.',
    sourceName: 'Central Bank of Nigeria (Official Gazette)',
    sourceCategory: 'OFFICIAL_REGULATORY',
    authorPersona: 'Dr. Olayemi Cardoso',
    authorTitle: 'Governor, Central Bank of Nigeria',
    category: 'DOMESTIC_MACRO',
    scope: 'GLOBAL',
    affectedSector: 'Financial Services',
    sentiment: 'HIGHLY_BULLISH',
    priceImpactPct: 4.5,
    corporateDisclosure: {
      patGrowthPct: 48.2,
      dividendPerShare: 3.50,
      revenueChangePct: 35.0,
    },
    whatsappHeadline: '🚨 CBN REAFFIRMS BANKING RECAPITALIZATION & LIQUIDITY BUFFERS',
    whatsappDraft: '',
    publishedAt: '2026-11-06T11:00:00Z',
    publishedBy: 'user-admin',
    publishedByName: 'PSA Super Administrator',
  },
  {
    id: 'news-init-2',
    headline: 'MTN Nigeria Secures 5G Enterprise Expansion Rights & Resolves Unaudited Foreign Exchange Obligations',
    summary: 'MTNN reports substantial reduction in net finance expense and strong data revenue growth, bolstering operating free cash flows by 28% and driving dividend upside.',
    sourceName: 'Nigerian Exchange Regulatory News Service (RNS)',
    sourceCategory: 'INSTITUTIONAL_MEDIA',
    authorPersona: 'Dr. Ernest Ndukwe',
    authorTitle: 'Board Chairman, MTN Nigeria',
    category: 'STOCK_SPECIFIC',
    scope: 'GLOBAL',
    affectedTicker: 'MTNN',
    affectedSector: 'ICT & Telecommunications',
    sentiment: 'BULLISH',
    priceImpactPct: 3.2,
    corporateDisclosure: {
      patGrowthPct: 32.5,
      dividendPerShare: 8.50,
    },
    whatsappHeadline: '📈 MTNN EXPANDS 5G ENTERPRISE RIGHTS; FREE CASH SURGES',
    whatsappDraft: '',
    publishedAt: '2026-11-05T14:30:00Z',
    publishedBy: 'user-admin',
    publishedByName: 'PSA Super Administrator',
  }
];

export const INITIAL_PRICE_ALERTS: PriceAlert[] = [
  {
    id: 'alert-1',
    userId: 'user-chidi',
    ticker: 'GTCO',
    stockName: 'Guaranty Trust Holding Company Plc',
    targetPrice: 56.00,
    condition: 'ABOVE',
    createdAt: new Date().toISOString(),
    isTriggered: false,
  },
  {
    id: 'alert-2',
    userId: 'user-chidi',
    ticker: 'ZENITHBANK',
    stockName: 'Zenith Bank Plc',
    targetPrice: 40.00,
    condition: 'BELOW',
    createdAt: new Date().toISOString(),
    isTriggered: false,
  }
];

export const INITIAL_DIVIDENDS: DividendRecord[] = [
  {
    id: 'div-zenith-01',
    userId: 'user-chidi',
    accountId: 'sandbox',
    ticker: 'ZENITHBANK',
    stockName: 'Zenith Bank Plc',
    sharesHeld: 10000,
    dividendPerShare: 3.20,
    totalPayoutGross: 32000.00,
    withholdingTax: 3200.00, // 10% FIRS WHT
    netPayoutCredited: 28800.00,
    paymentDate: '2026-11-04',
    qualificationDate: '2026-10-25',
    paidAt: '2026-11-04T09:30:00Z'
  }
];

export const INITIAL_THESES: CommunityThesis[] = [
  {
    id: 'thesis-1',
    userId: 'user-funke',
    userFullName: 'Dr. Funke Adeyemi',
    userHandle: '@dr_adeyemi_cfa',
    userRole: 'MANAGER',
    rankTier: 'Chartered Contender',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    ticker: 'GTCO',
    companyName: 'Guaranty Trust Holding Company Plc',
    orderSide: 'BUY',
    price: 54.50,
    keyMetricHighlight: 'P/E: 5.0x | NIM: 9.4% | ROE: 42.1%',
    thesisText: 'GTCO presents an exceptional risk-adjusted opportunity ahead of the banking recapitalization deadline. Capital Adequacy Ratio (CAR) stands at 25.4%, well above the 15% statutory minimum. Strong Net Interest Margin expansion under the CBN 27.25% Monetary Policy Rate continues to drive resilient pre-tax earnings.',
    createdAt: '2026-11-08T10:30:00Z',
    upvotes: ['user-chidi', 'user-amina', 'user-tunde'],
    isMentorApproved: true,
    comments: [
      {
        id: 'comm-1',
        authorId: 'user-chidi',
        authorName: 'Chidi Okafor',
        authorRole: 'STUDENT',
        text: 'Doctor, what stop-loss buffer would you advise given the volatility around CBN MPC pronouncements?',
        createdAt: '2026-11-08T11:15:00Z'
      },
      {
        id: 'comm-2',
        authorId: 'user-funke',
        authorName: 'Dr. Funke Adeyemi',
        authorRole: 'MANAGER',
        text: 'A trailing stop-loss at ₦49.00 (approximately -10% circuit breaker floor) provides adequate protection while respecting support.',
        createdAt: '2026-11-08T11:30:00Z'
      }
    ]
  },
  {
    id: 'thesis-2',
    userId: 'user-amina',
    userFullName: 'Amina Bello',
    userHandle: '@amina_invests',
    userRole: 'STUDENT',
    rankTier: 'Portfolio Strategist',
    ticker: 'ZENITHBANK',
    companyName: 'Zenith Bank Plc',
    orderSide: 'BUY',
    price: 38.50,
    keyMetricHighlight: 'Dividend Yield: 10.2% | P/B: 0.65x',
    thesisText: 'Accumulating Zenith Bank shares for the interim dividend qualification date. At ₦3.20 DPS, dividend cash yield provides 10.2% annualized income. Balance sheet liquidity is rock-solid with zero non-performing loan spikes.',
    createdAt: '2026-11-09T14:00:00Z',
    upvotes: ['user-funke', 'user-chidi'],
    isMentorApproved: true,
    comments: [
      {
        id: 'comm-3',
        authorId: 'user-funke',
        authorName: 'Dr. Funke Adeyemi',
        authorRole: 'MANAGER',
        text: 'Sound income thesis, Amina. Remember that the stock will adjust downwards by the dividend amount on ex-div date.',
        createdAt: '2026-11-09T14:45:00Z'
      }
    ]
  },
  {
    id: 'thesis-3',
    userId: 'user-chidi',
    userFullName: 'Chidi Okafor',
    userHandle: '@chidi_trades',
    userRole: 'STUDENT',
    rankTier: 'Junior Analyst',
    ticker: 'MTNN',
    companyName: 'MTN Nigeria Communications Plc',
    orderSide: 'BUY',
    price: 245.00,
    keyMetricHighlight: 'Data Revenue: +28% YoY | 5G Moat',
    thesisText: 'Taking a tactical growth position on MTNN following 5G spectrum deployments. Data consumption per subscriber is accelerating across Lagos and Abuja cohorts. Setting stop-limit order to guard against foreign exchange volatility.',
    createdAt: '2026-11-10T09:20:00Z',
    upvotes: ['user-amina'],
    isMentorApproved: false,
    comments: []
  }
];

interface AppContextType {
  // Authentication & Session
  isAuthenticated: boolean;
  currentUser: User;
  users: User[];
  login: (email: string, password?: string) => { success: boolean; message: string };
  registerUser: (fullName: string, email: string, phone: string, password?: string) => { success: boolean; message: string };
  logout: () => void;
  switchUserById: (userId: string) => void;

  // Super Admin CRUD
  updateUser: (userId: string, updates: Partial<User>) => boolean;
  approveUser: (userId: string) => boolean;
  deleteUser: (userId: string) => boolean;
  grantManagementAccess: (userId: string) => boolean;
  revokeManagementAccess: (userId: string) => boolean;

  // Stocks & Market data
  stocks: Stock[];
  selectedStock: Stock;
  setSelectedStock: (stock: Stock) => void;
  watchlist: string[];
  toggleWatchlist: (ticker: string) => void;
  isSimulating: boolean;
  toggleSimulation: () => void;
  isLiveTradingViewSynced: boolean;
  lastTradingViewSyncTime: string | null;
  syncTradingViewQuotes: () => Promise<boolean>;

  // Multi-Account & Portfolio management
  activeAccountId: string;
  setActiveAccountId: (accountId: string) => void;
  activeAccount: PortfolioAccount;
  userAccounts: PortfolioAccount[];

  // Trading
  placeOrder: (params: {
    ticker: string;
    orderType: OrderType;
    orderSide: OrderSide;
    quantity: number;
    targetPrice?: number;
    stopLossPrice?: number;
    limitStopPrice?: number;
    thesisNote?: string;
  }) => { success: boolean; message: string; order?: Order };
  cancelOrder: (orderId: string) => void;

  // Price Alerts
  priceAlerts: PriceAlert[];
  addPriceAlert: (ticker: string, targetPrice: number, condition: 'ABOVE' | 'BELOW') => void;
  removePriceAlert: (alertId: string) => void;
  clearTriggeredAlerts: () => void;

  // Dividends & Corporate Actions
  dividendRecords: DividendRecord[];
  distributeCorporateDividends: (accountId?: string) => { totalCredited: number; count: number };

  // Community Theses & The Trading Floor
  communityTheses: CommunityThesis[];
  publishThesis: (data: {
    ticker: string;
    companyName: string;
    orderSide: OrderSide;
    price: number;
    thesisText: string;
    keyMetricHighlight?: string;
    orderId?: string;
  }) => void;
  upvoteThesis: (thesisId: string) => void;
  addThesisComment: (thesisId: string, text: string) => void;

  // Challenge Events CRUD & Cohort Management
  events: ChallengeEvent[];
  participants: EventParticipant[];
  registerForEvent: (eventId: string) => { success: boolean; message: string };
  createChallengeEvent: (eventData: Omit<ChallengeEvent, 'id' | 'createdBy' | 'createdByName' | 'participantsCount'>) => boolean;
  updateChallengeEvent: (eventId: string, updates: Partial<ChallengeEvent>) => boolean;
  deleteChallengeEvent: (eventId: string) => boolean;

  // Event Manager Delegation & Cohort Student Control
  assignManagerToEvent: (eventId: string, managerId: string) => boolean;
  addStudentToEvent: (eventId: string, studentId: string) => { success: boolean; message: string };
  removeStudentFromEvent: (eventId: string, studentId: string, reason?: string) => { success: boolean; message: string };
  awardStudentXp: (userId: string, xpAmount: number, reason?: string) => boolean;

  // Market Simulation, News & WhatsApp Broadcasting
  marketNews: MarketNewsItem[];
  publishMarketNews: (newsData: {
    headline: string;
    summary: string;
    sourceName: string;
    sourceCategory: NewsSourceCredibility;
    authorPersona: string;
    authorTitle: string;
    category: MarketSimulationCategory;
    scope: NewsScope;
    eventId?: string;
    eventTitle?: string;
    affectedTicker?: string;
    affectedSector?: NGXSector;
    sentiment: 'HIGHLY_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'HIGHLY_BEARISH';
    priceImpactPct: number;
    corporateDisclosure?: {
      patGrowthPct?: number;
      dividendPerShare?: number;
      revenueChangePct?: number;
    };
  }) => { success: boolean; message: string; newsItem?: MarketNewsItem };
  adjustSectorIndex: (sector: NGXSector, deltaPct: number, reason: string) => boolean;
  adjustStockPrice: (ticker: string, deltaPct: number, reason: string) => boolean;

  // Audit Logging History
  auditLogs: AuditLogItem[];
  logAuditAction: (params: {
    actionType: AuditActionType;
    description: string;
    eventId?: string;
    eventTitle?: string;
    targetUserId?: string;
    targetUserName?: string;
    metadata?: Record<string, any>;
  }) => void;

  // System
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'psa_broker_v2';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Users & Auth State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}_current_user_id`) || 'user-admin';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_is_authenticated`);
    return saved !== null ? JSON.parse(saved) : true; // Keep true by default for demo continuity
  });

  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  // 2. Stocks State: Initialized with authoritative TradingView live market data
  const [stocks, setStocks] = useState<Stock[]>(() => {
    const baseWithTradingView = applyTradingViewQuotesToStocks(NGX_STOCKS, TRADINGVIEW_SNAPSHOT);
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_stocks`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return applyTradingViewQuotesToStocks(parsed, TRADINGVIEW_SNAPSHOT);
      } catch {
        return baseWithTradingView;
      }
    }
    return baseWithTradingView;
  });

  const [isLiveTradingViewSynced, setIsLiveTradingViewSynced] = useState<boolean>(true);
  const [lastTradingViewSyncTime, setLastTradingViewSyncTime] = useState<string | null>(() => new Date().toLocaleTimeString());

  const [selectedStockTicker, setSelectedStockTicker] = useState<string>('ZENITHBANK');
  const selectedStock = useMemo(() => {
    return stocks.find(s => s.ticker === selectedStockTicker) || stocks[0];
  }, [stocks, selectedStockTicker]);

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_watchlist`);
    return saved ? JSON.parse(saved) : ['ZENITHBANK', 'GTCO', 'MTNN', 'DANGCEM', 'SEPLAT'];
  });

  // Ticking simulation state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // 3. Challenge Events State
  const [events, setEvents] = useState<ChallengeEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_events`);
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [participants, setParticipants] = useState<EventParticipant[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_participants`);
    return saved ? JSON.parse(saved) : INITIAL_PARTICIPANTS;
  });

  // 4. Accounts & Portfolio State
  const [accountsMap, setAccountsMap] = useState<Record<string, PortfolioAccount>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_accounts_map`);
    if (saved) return JSON.parse(saved);

    // Initial pre-seed for Chidi Sandbox
    const chidiSandbox: PortfolioAccount = {
      id: 'sandbox',
      name: 'Standard Practice Sandbox',
      type: 'SANDBOX',
      initialBalance: 1000000.00,
      cashBalance: 465200.00,
      portfolioValue: 1042000.00,
      totalReturn: 42000.00,
      totalReturnPct: 4.20,
      realizedPnl: 12500.00,
      positions: [
        {
          id: 'pos-1',
          userId: 'user-chidi',
          accountId: 'sandbox',
          ticker: 'ZENITHBANK',
          quantity: 10000,
          avgBuyPrice: 36.50,
          totalCost: 365000.00,
          currentPrice: 38.50,
          marketValue: 385000.00,
          unrealizedPnl: 20000.00,
          unrealizedPnlPct: 5.48,
          portfolioWeightPct: 36.95,
        },
        {
          id: 'pos-2',
          userId: 'user-chidi',
          accountId: 'sandbox',
          ticker: 'MTNN',
          quantity: 870,
          avgBuyPrice: 215.00,
          totalCost: 187050.00,
          currentPrice: 220.00,
          marketValue: 191400.00,
          unrealizedPnl: 4350.00,
          unrealizedPnlPct: 2.33,
          portfolioWeightPct: 18.37,
        }
      ],
      orders: [
        {
          id: 'ord-init-1',
          userId: 'user-chidi',
          accountId: 'sandbox',
          ticker: 'ZENITHBANK',
          orderType: 'MARKET',
          orderSide: 'BUY',
          quantity: 10000,
          executionPrice: 36.50,
          grossAmount: 365000.00,
          feeDeducted: 5392.88,
          netAmount: 370392.88,
          feeBreakdown: calculateNGXTransactionFee(365000.00),
          status: 'FILLED',
          createdAt: '2026-11-02T10:15:00Z',
          executedAt: '2026-11-02T10:15:00Z',
          thesisNote: 'CBN recapitalization play: Zenith Bank boasts massive retained earnings of ₦1.5T.',
        }
      ]
    };

    // Initial pre-seed for Amina Sandbox
    const aminaSandbox: PortfolioAccount = {
      id: 'sandbox',
      name: 'Standard Practice Sandbox',
      type: 'SANDBOX',
      initialBalance: 1000000.00,
      cashBalance: 240000.00,
      portfolioValue: 1165000.00,
      totalReturn: 165000.00,
      totalReturnPct: 16.50,
      realizedPnl: 45000.00,
      positions: [
        {
          id: 'pos-am-1',
          userId: 'user-amina',
          accountId: 'sandbox',
          ticker: 'GTCO',
          quantity: 12000,
          avgBuyPrice: 42.00,
          totalCost: 504000.00,
          currentPrice: 46.20,
          marketValue: 554400.00,
          unrealizedPnl: 50400.00,
          unrealizedPnlPct: 10.00,
          portfolioWeightPct: 47.59,
        },
        {
          id: 'pos-am-2',
          userId: 'user-amina',
          accountId: 'sandbox',
          ticker: 'DANGCEM',
          quantity: 570,
          avgBuyPrice: 620.00,
          totalCost: 353400.00,
          currentPrice: 650.00,
          marketValue: 370500.00,
          unrealizedPnl: 17100.00,
          unrealizedPnlPct: 4.84,
          portfolioWeightPct: 31.80,
        }
      ],
      orders: []
    };

    // Initial pre-seed for Admin Sandbox
    const adminSandbox: PortfolioAccount = {
      id: 'sandbox',
      name: 'Super Admin Master Portfolio',
      type: 'SANDBOX',
      initialBalance: 5000000.00,
      cashBalance: 2850000.00,
      portfolioValue: 5480000.00,
      totalReturn: 480000.00,
      totalReturnPct: 9.60,
      realizedPnl: 120000.00,
      positions: [
        {
          id: 'pos-adm-1',
          userId: 'user-admin',
          accountId: 'sandbox',
          ticker: 'SEPLAT',
          quantity: 500,
          avgBuyPrice: 3150.00,
          totalCost: 1575000.00,
          currentPrice: 3450.00,
          marketValue: 1725000.00,
          unrealizedPnl: 150000.00,
          unrealizedPnlPct: 9.52,
          portfolioWeightPct: 31.48,
        },
        {
          id: 'pos-adm-2',
          userId: 'user-admin',
          accountId: 'sandbox',
          ticker: 'BUAFOODS',
          quantity: 2380,
          avgBuyPrice: 350.00,
          totalCost: 833000.00,
          currentPrice: 380.00,
          marketValue: 904400.00,
          unrealizedPnl: 71400.00,
          unrealizedPnlPct: 8.57,
          portfolioWeightPct: 16.50,
        }
      ],
      orders: []
    };

    return {
      [`user-chidi_sandbox`]: chidiSandbox,
      [`user-amina_sandbox`]: aminaSandbox,
      [`user-admin_sandbox`]: adminSandbox,
    };
  });

  const [activeAccountId, setActiveAccountId] = useState<string>('sandbox');

  const getAccountKey = (userId: string, accountId: string) => `${userId}_${accountId}`;

  const activeAccount = useMemo(() => {
    const key = getAccountKey(currentUser.id, activeAccountId);
    if (accountsMap[key]) {
      return accountsMap[key];
    }

    if (activeAccountId === 'sandbox') {
      return {
        id: 'sandbox',
        name: 'Standard Practice Sandbox',
        type: 'SANDBOX' as const,
        initialBalance: 1000000.00,
        cashBalance: 1000000.00,
        portfolioValue: 1000000.00,
        totalReturn: 0.00,
        totalReturnPct: 0.00,
        realizedPnl: 0.00,
        positions: [],
        orders: [],
      };
    } else {
      const event = events.find(e => e.id === activeAccountId);
      return {
        id: activeAccountId,
        name: event ? event.title : 'Event Challenge Account',
        type: 'EVENT' as const,
        eventId: activeAccountId,
        initialBalance: event ? event.startingCapital : 2000000.00,
        cashBalance: event ? event.startingCapital : 2000000.00,
        portfolioValue: event ? event.startingCapital : 2000000.00,
        totalReturn: 0.00,
        totalReturnPct: 0.00,
        realizedPnl: 0.00,
        positions: [],
        orders: [],
      };
    }
  }, [accountsMap, currentUser.id, activeAccountId, events]);

  const userAccounts = useMemo(() => {
    const accounts: PortfolioAccount[] = [];
    const sandboxKey = getAccountKey(currentUser.id, 'sandbox');
    accounts.push(accountsMap[sandboxKey] || {
      id: 'sandbox',
      name: 'Standard Practice Sandbox',
      type: 'SANDBOX',
      initialBalance: 1000000.00,
      cashBalance: 1000000.00,
      portfolioValue: 1000000.00,
      totalReturn: 0.00,
      totalReturnPct: 0.00,
      realizedPnl: 0.00,
      positions: [],
      orders: [],
    });

    const userRegistrations = participants.filter(p => p.userId === currentUser.id);
    userRegistrations.forEach(p => {
      const ev = events.find(e => e.id === p.eventId);
      const evKey = getAccountKey(currentUser.id, p.eventId);
      if (accountsMap[evKey]) {
        accounts.push(accountsMap[evKey]);
      } else if (ev) {
        accounts.push({
          id: ev.id,
          name: ev.title,
          type: 'EVENT',
          eventId: ev.id,
          initialBalance: ev.startingCapital,
          cashBalance: p.cashBalance,
          portfolioValue: p.portfolioValue,
          totalReturn: p.portfolioValue - ev.startingCapital,
          totalReturnPct: p.roiPercentage,
          realizedPnl: 0.00,
          positions: [],
          orders: [],
        });
      }
    });

    return accounts;
  }, [currentUser.id, accountsMap, participants, events]);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_current_user_id`, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_is_authenticated`, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_watchlist`, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_events`, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_participants`, JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_accounts_map`, JSON.stringify(accountsMap));
  }, [accountsMap]);

  // 5. Governance Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_audit_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_audit_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // 6. Market News, Macroeconomic & Corporate Disclosures Feed
  const [marketNewsFeed, setMarketNewsFeed] = useState<MarketNewsItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_market_news`);
    if (saved) return JSON.parse(saved);
    return INITIAL_MARKET_NEWS.map(n => ({
      ...n,
      whatsappDraft: generateWhatsAppBroadcastText({
        headline: n.headline,
        summary: n.summary,
        sourceName: n.sourceName,
        sourceCategory: n.sourceCategory,
        authorPersona: n.authorPersona,
        authorTitle: n.authorTitle,
        scope: n.scope,
        eventTitle: n.eventTitle,
        affectedTicker: n.affectedTicker,
        affectedSector: n.affectedSector,
        sentiment: n.sentiment,
        priceImpactPct: n.priceImpactPct,
        corporateDisclosure: n.corporateDisclosure,
      }),
    }));
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_market_news`, JSON.stringify(marketNewsFeed));
  }, [marketNewsFeed]);

  // 7. Price Alerts State
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_price_alerts`);
    return saved ? JSON.parse(saved) : INITIAL_PRICE_ALERTS;
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_price_alerts`, JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  // 8. Dividend & Corporate Actions Payout State
  const [dividendRecords, setDividendRecords] = useState<DividendRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_dividend_records`);
    return saved ? JSON.parse(saved) : INITIAL_DIVIDENDS;
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_dividend_records`, JSON.stringify(dividendRecords));
  }, [dividendRecords]);

  // 9. Community Theses State
  const [communityTheses, setCommunityTheses] = useState<CommunityThesis[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_community_theses`);
    return saved ? JSON.parse(saved) : INITIAL_THESES;
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_community_theses`, JSON.stringify(communityTheses));
  }, [communityTheses]);

  // Audit Logger Helper
  const logAuditAction = (params: {
    actionType: AuditActionType;
    description: string;
    eventId?: string;
    eventTitle?: string;
    targetUserId?: string;
    targetUserName?: string;
    metadata?: Record<string, any>;
  }) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      ...params,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Market Simulator Tick (only runs when isSimulating is explicitly true)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setStocks(prevStocks => {
        const updatedStocks = simulateMarketTick(prevStocks);

        setAccountsMap(prevMap => {
          const nextMap = { ...prevMap };
          const stockPriceMap = new Map<string, number>();
          updatedStocks.forEach(s => stockPriceMap.set(s.ticker, s.currentPrice));

          Object.keys(nextMap).forEach(key => {
            const acc = nextMap[key];
            let positionsTotal = 0;

            const updatedPositions = acc.positions.map(pos => {
              const currentPrice = stockPriceMap.get(pos.ticker) || pos.currentPrice;
              const marketValue = Number((currentPrice * pos.quantity).toFixed(2));
              const unrealizedPnl = Number((marketValue - pos.totalCost).toFixed(2));
              const unrealizedPnlPct = Number(((unrealizedPnl / pos.totalCost) * 100).toFixed(2));
              positionsTotal += marketValue;

              return {
                ...pos,
                currentPrice,
                marketValue,
                unrealizedPnl,
                unrealizedPnlPct,
              };
            });

            const totalVal = Number((acc.cashBalance + positionsTotal).toFixed(2));
            const positionsWithWeights = updatedPositions.map(p => ({
              ...p,
              portfolioWeightPct: totalVal > 0 ? Number(((p.marketValue / totalVal) * 100).toFixed(2)) : 0,
            }));

            const { filledOrders, remainingPending } = matchPendingOrders(acc.orders, updatedStocks);
            let updatedCash = acc.cashBalance;
            let updatedRealized = acc.realizedPnl;

            if (filledOrders.length > 0) {
              soundFx.playOrderFill();
            }

            filledOrders.forEach(fo => {
              if (fo.orderSide === 'SELL') {
                const proceeds = Number(((fo.executionPrice || 0) * fo.quantity).toFixed(2));
                const fee = calculateNGXTransactionFee(proceeds).totalFee;
                updatedCash += Number((proceeds - fee).toFixed(2));
              }
            });

            const totalReturn = Number((totalVal - acc.initialBalance).toFixed(2));
            const totalReturnPct = Number(((totalReturn / acc.initialBalance) * 100).toFixed(2));

            nextMap[key] = {
              ...acc,
              cashBalance: updatedCash,
              portfolioValue: totalVal,
              totalReturn,
              totalReturnPct,
              realizedPnl: updatedRealized,
              positions: positionsWithWeights,
              orders: [...remainingPending, ...filledOrders.filter(fo => !acc.orders.some(o => o.id === fo.id && o.status === 'FILLED'))],
            };
          });

          return nextMap;
        });

        // Evaluate active price alerts
        setPriceAlerts(prevAlerts => {
          let hasNewTrigger = false;
          const updated = prevAlerts.map(alert => {
            if (alert.isTriggered) return alert;
            const s = updatedStocks.find(x => x.ticker === alert.ticker);
            if (!s) return alert;

            const isHit = (alert.condition === 'ABOVE' && s.currentPrice >= alert.targetPrice) ||
                          (alert.condition === 'BELOW' && s.currentPrice <= alert.targetPrice);

            if (isHit) {
              hasNewTrigger = true;
              return {
                ...alert,
                isTriggered: true,
                triggeredAt: new Date().toISOString()
              };
            }
            return alert;
          });

          if (hasNewTrigger) {
            soundFx.playAlertPing();
          }
          return updated;
        });

        return updatedStocks;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Recalculate participant scores
  useEffect(() => {
    setParticipants(prevParticipants => {
      let changed = false;
      const updated = prevParticipants.map(participant => {
        const ev = events.find(e => e.id === participant.eventId);
        if (!ev) return participant;

        const accKey = getAccountKey(participant.userId, participant.eventId);
        const acc = accountsMap[accKey];

        const portfolioValue = acc ? acc.portfolioValue : participant.portfolioValue;
        const cashBalance = acc ? acc.cashBalance : participant.cashBalance;
        const roiPercentage = acc ? acc.totalReturnPct : participant.roiPercentage;
        const positions = acc ? acc.positions : [];
        const orders = acc ? acc.orders : [];

        const scoreBreakdown = computeCompositeMastery({
          roiPct: roiPercentage,
          maxDrawdownPct: participant.maxDrawdownPct,
          positions,
          orders,
          thesesCount: participant.thesesCount,
          totalPortfolioValue: portfolioValue,
          weights: {
            roi: ev.weightRoi,
            discipline: ev.weightDiscipline,
            research: ev.weightResearch,
          },
          maxSingleStockPct: ev.maxSingleStockPct,
          minSectorsRequired: ev.minSectorsRequired,
          sectorLookup: (ticker: string) => {
            const s = stocks.find(st => st.ticker === ticker);
            return s ? s.sector : 'General';
          }
        });

        if (
          participant.compositeScore !== scoreBreakdown.compositeScore ||
          participant.portfolioValue !== portfolioValue
        ) {
          changed = true;
          return {
            ...participant,
            portfolioValue,
            cashBalance,
            roiPercentage,
            disciplineScore: scoreBreakdown.disciplineScore,
            researchPoints: scoreBreakdown.researchScore,
            compositeScore: scoreBreakdown.compositeScore,
            violationsCount: scoreBreakdown.violationsCount,
            sectorsInvested: scoreBreakdown.sectorsInvested,
          };
        }
        return participant;
      });

      if (!changed) return prevParticipants;

      let finalParticipants: EventParticipant[] = [];
      const eventIds = Array.from(new Set(updated.map(p => p.eventId)));
      eventIds.forEach(evId => {
        const ev = events.find(e => e.id === evId);
        if (!ev) return;
        const evParticipants = updated.filter(p => p.eventId === evId);
        const ranked = recomputeLeaderboardStandings(evParticipants, ev);
        finalParticipants = [...finalParticipants, ...ranked];
      });

      return finalParticipants;
    });
  }, [accountsMap, events, stocks]);

  // Auth Operations
  const login = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'Invalid credentials. User not found.' };
    }
    if (user.status === 'PENDING') {
      return { success: false, message: 'Account is pending Administrator approval. Please contact PSA Admin.' };
    }
    if (user.status === 'SUSPENDED') {
      return { success: false, message: 'Account is suspended. Please contact platform administration.' };
    }

    setCurrentUserId(user.id);
    setIsAuthenticated(true);
    setActiveAccountId('sandbox');
    return { success: true, message: `Welcome back, ${user.fullName}!` };
  };

  const registerUser = (fullName: string, email: string, phone: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName,
      email,
      phoneNumber: phone,
      role: 'STUDENT',
      status: 'ACTIVE',
      academyXp: 100,
      rankTier: 'Novice Observer',
      badges: ['Welcome to NairaStock Academy'],
      createdAt: new Date().toISOString().split('T')[0],
      handle: `@${email.split('@')[0]}`,
      password: password || 'password123',
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    setActiveAccountId('sandbox');

    return { success: true, message: 'Registration successful! Initialized standard ₦1,000,000 virtual balance.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const switchUserById = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(userId);
      setIsAuthenticated(true);
      setActiveAccountId('sandbox');
    }
  };

  // Super Admin Member CRUD
  const updateUser = (userId: string, updates: Partial<User>) => {
    let success = false;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        success = true;
        return { ...u, ...updates };
      }
      return u;
    }));
    return success;
  };

  const approveUser = (userId: string) => {
    return updateUser(userId, { status: 'ACTIVE' });
  };

  const deleteUser = (userId: string) => {
    if (userId === currentUser.id) return false;
    setUsers(prev => prev.filter(u => u.id !== userId));
    return true;
  };

  const grantManagementAccess = (userId: string) => {
    return updateUser(userId, { role: 'MANAGER', status: 'ACTIVE' });
  };

  const revokeManagementAccess = (userId: string) => {
    return updateUser(userId, { role: 'STUDENT' });
  };

  const toggleWatchlist = (ticker: string) => {
    setWatchlist(prev => 
      prev.includes(ticker) ? prev.filter(t => t !== ticker) : [...prev, ticker]
    );
  };

  const toggleSimulation = () => {
    setIsSimulating(prev => !prev);
  };

  // Sync real-time quotes directly from TradingView Nigerian Exchange (NSENG)
  const syncTradingViewQuotes = async (): Promise<boolean> => {
    try {
      const liveQuotes = await fetchLiveTradingViewQuotes();
      if (liveQuotes && liveQuotes.length > 0) {
        setStocks(prevStocks => {
          const updated = applyTradingViewQuotesToStocks(prevStocks, liveQuotes);

          setAccountsMap(prevMap => {
            const nextMap = { ...prevMap };
            const stockMap = new Map<string, number>();
            updated.forEach(s => stockMap.set(s.ticker, s.currentPrice));

            Object.keys(nextMap).forEach(key => {
              const acc = nextMap[key];
              let positionsTotal = 0;
              const updatedPositions = acc.positions.map(pos => {
                const curPrice = stockMap.get(pos.ticker) || pos.currentPrice;
                const marketValue = Number((curPrice * pos.quantity).toFixed(2));
                const unrealizedPnl = Number((marketValue - pos.totalCost).toFixed(2));
                const unrealizedPnlPct = pos.totalCost > 0 ? Number(((unrealizedPnl / pos.totalCost) * 100).toFixed(2)) : 0;
                positionsTotal += marketValue;
                return {
                  ...pos,
                  currentPrice: curPrice,
                  marketValue,
                  unrealizedPnl,
                  unrealizedPnlPct
                };
              });

              const totalVal = Number((acc.cashBalance + positionsTotal).toFixed(2));
              const totalReturn = Number((totalVal - acc.initialBalance).toFixed(2));
              const totalReturnPct = acc.initialBalance > 0 ? Number(((totalReturn / acc.initialBalance) * 100).toFixed(2)) : 0;

              nextMap[key] = {
                ...acc,
                portfolioValue: totalVal,
                totalReturn,
                totalReturnPct,
                positions: updatedPositions.map(p => ({
                  ...p,
                  portfolioWeightPct: totalVal > 0 ? Number(((p.marketValue / totalVal) * 100).toFixed(2)) : 0
                }))
              };
            });
            return nextMap;
          });

          return updated;
        });

        setIsLiveTradingViewSynced(true);
        setLastTradingViewSyncTime(new Date().toLocaleTimeString());
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Error during TradingView live sync:', err);
      return false;
    }
  };

  useEffect(() => {
    // Automatically trigger live sync from TradingView on boot
    syncTradingViewQuotes();

    // Auto-sync with TradingView live scanner every 10 seconds
    const syncInterval = setInterval(() => {
      syncTradingViewQuotes();
    }, 10000);

    return () => clearInterval(syncInterval);
  }, []);

  // Order Placement
  const placeOrder = ({
    ticker,
    orderType,
    orderSide,
    quantity,
    targetPrice,
    stopLossPrice,
    limitStopPrice,
    thesisNote,
  }: {
    ticker: string;
    orderType: OrderType;
    orderSide: OrderSide;
    quantity: number;
    targetPrice?: number;
    stopLossPrice?: number;
    limitStopPrice?: number;
    thesisNote?: string;
  }) => {
    const stock = stocks.find(s => s.ticker === ticker);
    if (!stock) return { success: false, message: `Ticker ${ticker} not found.` };
    if (quantity <= 0) return { success: false, message: 'Quantity must be at least 1 unit.' };

    const executionPrice = orderType === 'LIMIT' && targetPrice ? targetPrice : stock.currentPrice;
    const grossAmount = Number((executionPrice * quantity).toFixed(2));

    // Minimum trade value requirement: gross trade value >= ₦1,000
    if (grossAmount < 1000) {
      return {
        success: false,
        message: `Minimum order value on PSA Broker is ₦1,000.00. Current order gross value is ₦${grossAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${quantity.toLocaleString()} units @ ₦${executionPrice.toFixed(2)}). Please increase quantity.`,
      };
    }
    const feeBreakdown = calculateNGXTransactionFee(grossAmount);
    const feeDeducted = feeBreakdown.totalFee;

    const accKey = getAccountKey(currentUser.id, activeAccountId);
    const currentAccount = accountsMap[accKey] || activeAccount;

    if (orderSide === 'BUY') {
      const totalRequiredCash = Number((grossAmount + feeDeducted).toFixed(2));
      if (currentAccount.cashBalance < totalRequiredCash) {
        return {
          success: false,
          message: `Insufficient cash balance. Required: ₦${totalRequiredCash.toLocaleString()}, Available: ₦${currentAccount.cashBalance.toLocaleString()}`,
        };
      }
    } else {
      const position = currentAccount.positions.find(p => p.ticker === ticker);
      const ownedQty = position ? position.quantity : 0;
      if (ownedQty < quantity) {
        return {
          success: false,
          message: `Insufficient shares. You only own ${ownedQty.toLocaleString()} shares of ${ticker}.`,
        };
      }
    }

    const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const isInstantFill = orderType === 'MARKET';

    const newOrder: Order = {
      id: orderId,
      userId: currentUser.id,
      accountId: activeAccountId,
      ticker,
      orderType,
      orderSide,
      quantity,
      targetPrice,
      stopLossPrice,
      limitStopPrice,
      executionPrice: isInstantFill ? executionPrice : undefined,
      grossAmount,
      feeDeducted,
      netAmount: orderSide === 'BUY' ? grossAmount + feeDeducted : grossAmount - feeDeducted,
      feeBreakdown,
      status: isInstantFill ? 'FILLED' : 'PENDING',
      createdAt: new Date().toISOString(),
      executedAt: isInstantFill ? new Date().toISOString() : undefined,
      thesisNote,
      contractNoteNumber: `CSCS/PSA/2026/${orderId.slice(-6).toUpperCase()}`,
    };

    if (isInstantFill) {
      soundFx.playOrderFill();
    }

    setAccountsMap(prevMap => {
      const prevAcc = prevMap[accKey] || activeAccount;
      let newCash = prevAcc.cashBalance;
      let newRealizedPnl = prevAcc.realizedPnl;
      const positions = [...prevAcc.positions];

      if (isInstantFill) {
        if (orderSide === 'BUY') {
          newCash = Number((newCash - (grossAmount + feeDeducted)).toFixed(2));
          const existingPosIndex = positions.findIndex(p => p.ticker === ticker);

          if (existingPosIndex >= 0) {
            const existing = positions[existingPosIndex];
            const newQty = existing.quantity + quantity;
            const newTotalCost = existing.totalCost + grossAmount;
            const newAvgPrice = Number((newTotalCost / newQty).toFixed(2));
            const marketValue = Number((newQty * stock.currentPrice).toFixed(2));
            const unrealizedPnl = Number((marketValue - newTotalCost).toFixed(2));
            const unrealizedPnlPct = Number(((unrealizedPnl / newTotalCost) * 100).toFixed(2));

            positions[existingPosIndex] = {
              ...existing,
              quantity: newQty,
              avgBuyPrice: newAvgPrice,
              totalCost: newTotalCost,
              marketValue,
              unrealizedPnl,
              unrealizedPnlPct,
            };
          } else {
            const marketValue = Number((quantity * stock.currentPrice).toFixed(2));
            const unrealizedPnl = Number((marketValue - grossAmount).toFixed(2));
            const unrealizedPnlPct = Number(((unrealizedPnl / grossAmount) * 100).toFixed(2));

            positions.push({
              id: `pos-${Date.now()}`,
              userId: currentUser.id,
              accountId: activeAccountId,
              ticker,
              quantity,
              avgBuyPrice: executionPrice,
              totalCost: grossAmount,
              currentPrice: stock.currentPrice,
              marketValue,
              unrealizedPnl,
              unrealizedPnlPct,
              portfolioWeightPct: 0,
            });
          }
        } else {
          // SELL execution
          const netProceeds = Number((grossAmount - feeDeducted).toFixed(2));
          newCash = Number((newCash + netProceeds).toFixed(2));
          const existingPosIndex = positions.findIndex(p => p.ticker === ticker);

          if (existingPosIndex >= 0) {
            const existing = positions[existingPosIndex];
            const costBasisSold = Number((existing.avgBuyPrice * quantity).toFixed(2));
            const tradeRealizedPnl = Number((grossAmount - costBasisSold - feeDeducted).toFixed(2));
            newRealizedPnl += tradeRealizedPnl;

            const remainingQty = existing.quantity - quantity;
            if (remainingQty === 0) {
              positions.splice(existingPosIndex, 1);
            } else {
              const remainingCost = Number((existing.totalCost - costBasisSold).toFixed(2));
              const marketValue = Number((remainingQty * stock.currentPrice).toFixed(2));
              const unrealizedPnl = Number((marketValue - remainingCost).toFixed(2));
              const unrealizedPnlPct = Number(((unrealizedPnl / remainingCost) * 100).toFixed(2));

              positions[existingPosIndex] = {
                ...existing,
                quantity: remainingQty,
                totalCost: remainingCost,
                marketValue,
                unrealizedPnl,
                unrealizedPnlPct,
              };
            }
          }
        }
      } else {
        if (orderSide === 'BUY') {
          newCash = Number((newCash - (grossAmount + feeDeducted)).toFixed(2));
        }
      }

      const totalPositionsValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
      const totalPortfolioValue = Number((newCash + totalPositionsValue).toFixed(2));
      const totalReturn = Number((totalPortfolioValue - prevAcc.initialBalance).toFixed(2));
      const totalReturnPct = Number(((totalReturn / prevAcc.initialBalance) * 100).toFixed(2));

      const positionsWithWeights = positions.map(p => ({
        ...p,
        portfolioWeightPct: totalPortfolioValue > 0 ? Number(((p.marketValue / totalPortfolioValue) * 100).toFixed(2)) : 0,
      }));

      return {
        ...prevMap,
        [accKey]: {
          ...prevAcc,
          cashBalance: newCash,
          portfolioValue: totalPortfolioValue,
          totalReturn,
          totalReturnPct,
          realizedPnl: newRealizedPnl,
          positions: positionsWithWeights,
          orders: [newOrder, ...prevAcc.orders],
        }
      };
    });

    if (thesisNote && thesisNote.trim().length > 10) {
      const newThesis: CommunityThesis = {
        id: `thesis-${Date.now()}`,
        orderId,
        userId: currentUser.id,
        userFullName: currentUser.fullName,
        userHandle: currentUser.handle,
        userRole: currentUser.role,
        rankTier: currentUser.rankTier,
        avatarUrl: currentUser.avatarUrl,
        ticker,
        companyName: stock.name,
        orderSide,
        quantity,
        price: executionPrice,
        thesisText: thesisNote,
        keyMetricHighlight: `${orderSide} @ ₦${executionPrice.toFixed(2)} | P/E: ${stock.peRatio.toFixed(1)}x`,
        createdAt: new Date().toISOString(),
        upvotes: [currentUser.id],
        comments: [],
        isMentorApproved: currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER'
      };
      setCommunityTheses(prev => [newThesis, ...prev]);

      setUsers(prev => prev.map(u => {
        if (u.id === currentUser.id) {
          const newXp = u.academyXp + 25;
          let tier = u.rankTier;
          if (newXp >= 1000) tier = 'Chartered Contender';
          else if (newXp >= 400) tier = 'Portfolio Strategist';
          else if (newXp >= 200) tier = 'Junior Analyst';

          return { ...u, academyXp: newXp, rankTier: tier };
        }
        return u;
      }));

      if (activeAccountId !== 'sandbox') {
        setParticipants(prev => prev.map(p => {
          if (p.userId === currentUser.id && p.eventId === activeAccountId) {
            return { ...p, thesesCount: p.thesesCount + 1 };
          }
          return p;
        }));
      }
    }

    // Apply realistic NGX Order Book Demand & Supply price pressure
    if (isInstantFill) {
      setStocks(prevStocks => applyDemandSupplyPressure(prevStocks, ticker, orderSide, quantity));
    }

    return {
      success: true,
      message: isInstantFill
        ? `Order filled! ${orderSide} ${quantity.toLocaleString()} units of ${ticker} at ₦${executionPrice.toFixed(2)} (T+1 Settlement).`
        : `Limit order queued! Waiting for ${ticker} to trade at ₦${(targetPrice || 0).toFixed(2)}.`,
      order: newOrder,
    };
  };

  const cancelOrder = (orderId: string) => {
    const accKey = getAccountKey(currentUser.id, activeAccountId);
    setAccountsMap(prevMap => {
      const prevAcc = prevMap[accKey];
      if (!prevAcc) return prevMap;

      const orderToCancel = prevAcc.orders.find(o => o.id === orderId && o.status === 'PENDING');
      if (!orderToCancel) return prevMap;

      let refundCash = 0;
      if (orderToCancel.orderSide === 'BUY') {
        refundCash = orderToCancel.netAmount;
      }

      const updatedOrders = prevAcc.orders.map(o => {
        if (o.id === orderId) {
          return { ...o, status: 'CANCELLED' as const };
        }
        return o;
      });

      return {
        ...prevMap,
        [accKey]: {
          ...prevAcc,
          cashBalance: Number((prevAcc.cashBalance + refundCash).toFixed(2)),
          orders: updatedOrders,
        }
      };
    });
  };

  const registerForEvent = (eventId: string) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return { success: false, message: 'Event not found.' };

    const existing = participants.find(p => p.userId === currentUser.id && p.eventId === eventId);
    if (existing) {
      return { success: false, message: 'You are already registered for this event!' };
    }

    if (currentUser.academyXp < ev.entryFeeTokens) {
      return {
        success: false,
        message: `Insufficient Academy XP tokens. You need ${ev.entryFeeTokens} XP, but have ${currentUser.academyXp} XP.`,
      };
    }

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, academyXp: u.academyXp - ev.entryFeeTokens };
      }
      return u;
    }));

    const accKey = getAccountKey(currentUser.id, eventId);
    const newAccount: PortfolioAccount = {
      id: eventId,
      name: ev.title,
      type: 'EVENT',
      eventId: eventId,
      initialBalance: ev.startingCapital,
      cashBalance: ev.startingCapital,
      portfolioValue: ev.startingCapital,
      totalReturn: 0.00,
      totalReturnPct: 0.00,
      realizedPnl: 0.00,
      positions: [],
      orders: [],
    };

    setAccountsMap(prev => ({
      ...prev,
      [accKey]: newAccount,
    }));

    const newParticipant: EventParticipant = {
      id: `part-${currentUser.id}-${eventId}`,
      eventId,
      userId: currentUser.id,
      userHandle: currentUser.handle,
      userFullName: currentUser.fullName,
      userRole: currentUser.role,
      rankTier: currentUser.rankTier,
      cashBalance: ev.startingCapital,
      portfolioValue: ev.startingCapital,
      roiPercentage: 0.00,
      maxDrawdownPct: 0.00,
      disciplineScore: 80.0,
      researchPoints: 0.0,
      compositeScore: 48.00,
      currentRank: participants.filter(p => p.eventId === eventId).length + 1,
      previousRank: participants.filter(p => p.eventId === eventId).length + 1,
      rankDelta: 0,
      violationsCount: 0,
      thesesCount: 0,
      sectorsInvested: [],
      registeredAt: new Date().toISOString().split('T')[0],
    };

    setParticipants(prev => [...prev, newParticipant]);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, participantsCount: e.participantsCount + 1 } : e));
    setActiveAccountId(eventId);

    return {
      success: true,
      message: `Registration successful! Allocated ₦${ev.startingCapital.toLocaleString()} event funds.`,
    };
  };

  const createChallengeEvent = (eventData: Omit<ChallengeEvent, 'id' | 'createdBy' | 'createdByName' | 'participantsCount'>) => {
    if (currentUser.role !== 'MANAGER' && currentUser.role !== 'ADMIN') return false;

    const newEvent: ChallengeEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      createdBy: currentUser.id,
      createdByName: currentUser.fullName,
      participantsCount: 0,
    };

    setEvents(prev => [newEvent, ...prev]);
    return true;
  };

  const updateChallengeEvent = (eventId: string, updates: Partial<ChallengeEvent>) => {
    if (currentUser.role !== 'MANAGER' && currentUser.role !== 'ADMIN') return false;
    let success = false;
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        success = true;
        return { ...e, ...updates };
      }
      return e;
    }));
    return success;
  };

  const deleteChallengeEvent = (eventId: string) => {
    if (currentUser.role !== 'MANAGER' && currentUser.role !== 'ADMIN') return false;
    const ev = events.find(e => e.id === eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setParticipants(prev => prev.filter(p => p.eventId !== eventId));

    logAuditAction({
      actionType: 'UPDATE_EVENT_RULES',
      eventId,
      eventTitle: ev?.title,
      description: `${currentUser.fullName} (${currentUser.role}) deleted challenge event "${ev?.title || eventId}".`,
    });
    return true;
  };

  // Event Manager Delegation & Cohort Student Control
  const assignManagerToEvent = (eventId: string, managerId: string) => {
    if (currentUser.role !== 'ADMIN') return false;
    const manager = users.find(u => u.id === managerId);
    if (!manager) return false;

    let success = false;
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        success = true;
        return {
          ...e,
          assignedManagerId: manager.id,
          assignedManagerName: manager.fullName,
        };
      }
      return e;
    }));

    if (success) {
      const ev = events.find(e => e.id === eventId);
      logAuditAction({
        actionType: 'ASSIGN_MANAGER',
        eventId,
        eventTitle: ev?.title,
        targetUserId: manager.id,
        targetUserName: manager.fullName,
        description: `Super Admin assigned ${manager.fullName} as Executive Course Manager for "${ev?.title || eventId}".`,
      });
    }
    return success;
  };

  const addStudentToEvent = (eventId: string, studentId: string) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return { success: false, message: 'Event not found.' };

    const isAuthorized = currentUser.role === 'ADMIN' || ev.assignedManagerId === currentUser.id;
    if (!isAuthorized) {
      return { success: false, message: 'Unauthorized. Only the assigned event manager or Super Admin can enroll students into this event.' };
    }

    const student = users.find(u => u.id === studentId);
    if (!student) return { success: false, message: 'Student account not found.' };

    const existing = participants.find(p => p.userId === studentId && p.eventId === eventId);
    if (existing) {
      return { success: false, message: `${student.fullName} is already enrolled in this challenge event.` };
    }

    // Provision event account
    const accKey = getAccountKey(student.id, eventId);
    const newAccount: PortfolioAccount = {
      id: eventId,
      name: ev.title,
      type: 'EVENT',
      eventId: eventId,
      initialBalance: ev.startingCapital,
      cashBalance: ev.startingCapital,
      portfolioValue: ev.startingCapital,
      totalReturn: 0.00,
      totalReturnPct: 0.00,
      realizedPnl: 0.00,
      positions: [],
      orders: [],
    };

    setAccountsMap(prev => ({
      ...prev,
      [accKey]: newAccount,
    }));

    const newParticipant: EventParticipant = {
      id: `part-${student.id}-${eventId}`,
      eventId,
      userId: student.id,
      userHandle: student.handle,
      userFullName: student.fullName,
      userRole: student.role,
      rankTier: student.rankTier,
      cashBalance: ev.startingCapital,
      portfolioValue: ev.startingCapital,
      roiPercentage: 0.00,
      maxDrawdownPct: 0.00,
      disciplineScore: 80.0,
      researchPoints: 0.0,
      compositeScore: 48.00,
      currentRank: participants.filter(p => p.eventId === eventId).length + 1,
      previousRank: participants.filter(p => p.eventId === eventId).length + 1,
      rankDelta: 0,
      violationsCount: 0,
      thesesCount: 0,
      sectorsInvested: [],
      registeredAt: new Date().toISOString().split('T')[0],
    };

    setParticipants(prev => [...prev, newParticipant]);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, participantsCount: e.participantsCount + 1 } : e));

    logAuditAction({
      actionType: 'ADD_STUDENT_TO_EVENT',
      eventId,
      eventTitle: ev.title,
      targetUserId: student.id,
      targetUserName: student.fullName,
      description: `${currentUser.fullName} (${currentUser.role}) enrolled student ${student.fullName} into "${ev.title}" with ₦${ev.startingCapital.toLocaleString()} virtual allocation.`,
    });

    return { success: true, message: `Successfully enrolled ${student.fullName} into "${ev.title}".` };
  };

  const removeStudentFromEvent = (eventId: string, studentId: string, reason?: string) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return { success: false, message: 'Event not found.' };

    const isAuthorized = currentUser.role === 'ADMIN' || ev.assignedManagerId === currentUser.id;
    if (!isAuthorized) {
      return { success: false, message: 'Unauthorized. Only the assigned event manager or Super Admin can remove students.' };
    }

    const student = users.find(u => u.id === studentId);
    const studentName = student ? student.fullName : studentId;

    setParticipants(prev => prev.filter(p => !(p.eventId === eventId && p.userId === studentId)));
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, participantsCount: Math.max(0, e.participantsCount - 1) } : e));

    logAuditAction({
      actionType: 'REMOVE_STUDENT_FROM_EVENT',
      eventId,
      eventTitle: ev.title,
      targetUserId: studentId,
      targetUserName: studentName,
      description: `${currentUser.fullName} (${currentUser.role}) removed student ${studentName} from "${ev.title}". Reason: ${reason || 'Administrative rebalancing'}`,
    });

    return { success: true, message: `Removed ${studentName} from "${ev.title}".` };
  };

  const awardStudentXp = (userId: string, xpAmount: number, reason: string = 'Academy Achievement') => {
    let success = false;
    let studentName = '';
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        success = true;
        studentName = u.fullName;
        const newXp = Math.max(0, u.academyXp + xpAmount);
        let tier = u.rankTier;
        if (newXp >= 1000) tier = 'Chartered Contender';
        else if (newXp >= 400) tier = 'Portfolio Strategist';
        else if (newXp >= 200) tier = 'Junior Analyst';
        else tier = 'Novice Observer';
        return { ...u, academyXp: newXp, rankTier: tier };
      }
      return u;
    }));

    if (success) {
      soundFx.playDividendCashChime();
      logAuditAction({
        actionType: 'AWARD_STUDENT_XP',
        targetUserId: userId,
        targetUserName: studentName,
        description: `${currentUser.fullName} (${currentUser.role}) awarded ${xpAmount >= 0 ? `+${xpAmount}` : xpAmount} Academy XP to ${studentName}. Rationale: ${reason}`,
      });
    }
    return success;
  };

  // Market Simulation, News & WhatsApp Broadcasting
  const publishMarketNews = (newsData: {
    headline: string;
    summary: string;
    sourceName: string;
    sourceCategory: NewsSourceCredibility;
    authorPersona: string;
    authorTitle: string;
    category: MarketSimulationCategory;
    scope: NewsScope;
    eventId?: string;
    eventTitle?: string;
    affectedTicker?: string;
    affectedSector?: NGXSector;
    sentiment: 'HIGHLY_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'HIGHLY_BEARISH';
    priceImpactPct: number;
    corporateDisclosure?: {
      patGrowthPct?: number;
      dividendPerShare?: number;
      revenueChangePct?: number;
    };
  }) => {
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      return { success: false, message: 'Unauthorized. Manager or Admin access required to publish market simulations.' };
    }

    const whatsappDraft = generateWhatsAppBroadcastText({
      ...newsData,
      affectedSector: newsData.affectedSector,
    });

    const newNewsItem: MarketNewsItem = {
      ...newsData,
      id: `news-${Date.now()}`,
      whatsappHeadline: `🚨 ${newsData.headline.toUpperCase()}`,
      whatsappDraft,
      publishedAt: new Date().toISOString(),
      publishedBy: currentUser.id,
      publishedByName: currentUser.fullName,
    };

    setMarketNewsFeed(prev => [newNewsItem, ...prev]);

    // Apply immediate price impact to stock universe based on credibility & sentiment
    setStocks(prevStocks => applyMacroeconomicNewsImpact(prevStocks, newNewsItem));

    logAuditAction({
      actionType: 'POST_MARKET_UPDATE',
      eventId: newsData.eventId,
      eventTitle: newsData.eventTitle,
      description: `${currentUser.fullName} (${currentUser.role}) published ${newsData.sourceCategory} disclosure: "${newsData.headline}" (${newsData.priceImpactPct >= 0 ? '+' : ''}${newsData.priceImpactPct}% on ${newsData.affectedTicker || newsData.affectedSector || 'Macro Universe'}).`,
      metadata: {
        headline: newsData.headline,
        sentiment: newsData.sentiment,
        impactPct: newsData.priceImpactPct,
        scope: newsData.scope,
      }
    });

    return {
      success: true,
      message: `Market update published! Stock prices and order book depth adjusted. WhatsApp headline generated.`,
      newsItem: newNewsItem,
    };
  };

  const adjustSectorIndex = (sector: NGXSector, deltaPct: number, reason: string) => {
    if (currentUser.role !== 'ADMIN') return false;
    setStocks(prev => adjustSectorIndexPrices(prev, sector, deltaPct));
    logAuditAction({
      actionType: 'ADJUST_SECTOR_INDEX',
      description: `Super Admin shifted ${sector} All-Share Index by ${deltaPct >= 0 ? '+' : ''}${deltaPct}%. Rationale: ${reason}`,
      metadata: { sector, deltaPct, reason }
    });
    return true;
  };

  const adjustStockPrice = (ticker: string, deltaPct: number, reason: string) => {
    if (currentUser.role !== 'ADMIN') return false;
    setStocks(prev => prev.map(s => {
      if (s.ticker !== ticker) return s;
      const factor = deltaPct / 100;
      let newPrice = Number((s.currentPrice * (1 + factor)).toFixed(2));
      const maxAllowed = Number((s.previousClose * 1.10).toFixed(2));
      const minAllowed = Number((s.previousClose * 0.90).toFixed(2));
      newPrice = Math.max(minAllowed, Math.min(maxAllowed, newPrice));
      const dayChange = Number((newPrice - s.previousClose).toFixed(2));
      const dayChangePct = Number(((dayChange / s.previousClose) * 100).toFixed(2));
      return {
        ...s,
        currentPrice: newPrice,
        dayChange,
        dayChangePct,
        dayHigh: Math.max(s.dayHigh, newPrice),
        dayLow: Math.min(s.dayLow, newPrice),
      };
    }));

    logAuditAction({
      actionType: 'ADJUST_STOCK_PRICE',
      description: `Super Admin adjusted ${ticker} market price by ${deltaPct >= 0 ? '+' : ''}${deltaPct}%. Rationale: ${reason}`,
      metadata: { ticker, deltaPct, reason }
    });
    return true;
  };

  // Price Alerts Operations
  const addPriceAlert = (ticker: string, targetPrice: number, condition: 'ABOVE' | 'BELOW') => {
    const s = stocks.find(x => x.ticker === ticker);
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser.id,
      ticker,
      stockName: s?.name || ticker,
      targetPrice,
      condition,
      createdAt: new Date().toISOString(),
      isTriggered: false
    };
    setPriceAlerts(prev => [newAlert, ...prev]);
  };

  const removePriceAlert = (alertId: string) => {
    setPriceAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const clearTriggeredAlerts = () => {
    setPriceAlerts(prev => prev.filter(a => !a.isTriggered));
  };

  // Corporate Actions & Automated Dividend Distribution
  const distributeCorporateDividends = (targetAccountId?: string) => {
    const accId = targetAccountId || activeAccountId;
    const accKey = getAccountKey(currentUser.id, accId);
    const currentAcc = accountsMap[accKey] || activeAccount;

    const result = processDividendsForAccount(currentAcc, stocks, currentUser.id);
    if (result.totalNetCredited > 0) {
      setAccountsMap(prev => ({
        ...prev,
        [accKey]: result.updatedAccount,
      }));
      setDividendRecords(prev => [...result.records, ...prev]);
      soundFx.playDividendCashChime();
      logAuditAction({
        actionType: 'POST_MARKET_UPDATE',
        description: `Automated Corporate Action: Credited ₦${result.totalNetCredited.toLocaleString()} net dividends (after 10% FIRS WHT) across ${result.records.length} qualifying holdings.`,
        metadata: { totalCredited: result.totalNetCredited, recordsCount: result.records.length }
      });
    }
    return { totalCredited: result.totalNetCredited, count: result.records.length };
  };

  // Community Theses
  const publishThesis = (data: {
    ticker: string;
    companyName: string;
    orderSide: OrderSide;
    price: number;
    thesisText: string;
    keyMetricHighlight?: string;
    orderId?: string;
  }) => {
    const newThesis: CommunityThesis = {
      id: `thesis-${Date.now()}`,
      orderId: data.orderId,
      userId: currentUser.id,
      userFullName: currentUser.fullName,
      userHandle: currentUser.handle,
      userRole: currentUser.role,
      rankTier: currentUser.rankTier,
      avatarUrl: currentUser.avatarUrl,
      ticker: data.ticker,
      companyName: data.companyName,
      orderSide: data.orderSide,
      price: data.price,
      thesisText: data.thesisText,
      keyMetricHighlight: data.keyMetricHighlight,
      createdAt: new Date().toISOString(),
      upvotes: [currentUser.id],
      comments: [],
      isMentorApproved: currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER'
    };
    setCommunityTheses(prev => [newThesis, ...prev]);
    awardStudentXp(currentUser.id, 25, 'Published Investment Thesis to Trading Floor');
  };

  const upvoteThesis = (thesisId: string) => {
    setCommunityTheses(prev => prev.map(t => {
      if (t.id === thesisId) {
        const hasUpvoted = t.upvotes.includes(currentUser.id);
        const newUpvotes = hasUpvoted
          ? t.upvotes.filter(id => id !== currentUser.id)
          : [...t.upvotes, currentUser.id];
        return { ...t, upvotes: newUpvotes };
      }
      return t;
    }));
  };

  const addThesisComment = (thesisId: string, text: string) => {
    const newComment: ThesisComment = {
      id: `comm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      text,
      createdAt: new Date().toISOString()
    };
    setCommunityTheses(prev => prev.map(t => {
      if (t.id === thesisId) {
        return { ...t, comments: [...t.comments, newComment] };
      }
      return t;
    }));
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUserId('user-admin');
    setIsAuthenticated(true);
    setStocks(NGX_STOCKS);
    setSelectedStockTicker('ZENITHBANK');
    setEvents(INITIAL_EVENTS);
    setParticipants(INITIAL_PARTICIPANTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setMarketNewsFeed(INITIAL_MARKET_NEWS);
    setAccountsMap({});
    setActiveAccountId('sandbox');
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        users,
        login,
        registerUser,
        logout,
        switchUserById,

        updateUser,
        approveUser,
        deleteUser,
        grantManagementAccess,
        revokeManagementAccess,

        stocks,
        selectedStock,
        setSelectedStock: (s: Stock) => setSelectedStockTicker(s.ticker),
        watchlist,
        toggleWatchlist,
        isSimulating,
        toggleSimulation,
        isLiveTradingViewSynced,
        lastTradingViewSyncTime,
        syncTradingViewQuotes,

        activeAccountId,
        setActiveAccountId,
        activeAccount,
        userAccounts,

        placeOrder,
        cancelOrder,

        priceAlerts,
        addPriceAlert,
        removePriceAlert,
        clearTriggeredAlerts,

        dividendRecords,
        distributeCorporateDividends,

        communityTheses,
        publishThesis,
        upvoteThesis,
        addThesisComment,

        events,
        participants,
        registerForEvent,
        createChallengeEvent,
        updateChallengeEvent,
        deleteChallengeEvent,

        assignManagerToEvent,
        addStudentToEvent,
        removeStudentFromEvent,
        awardStudentXp,

        marketNews: marketNewsFeed,
        publishMarketNews,
        adjustSectorIndex,
        adjustStockPrice,

        auditLogs,
        logAuditAction,

        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

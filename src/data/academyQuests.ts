import { AcademyQuest } from '../types';

export const INITIAL_ACADEMY_QUESTS: AcademyQuest[] = [
  {
    id: 'quest-first-trade',
    title: 'Novice\'s First Bid',
    description: 'Execute your maiden equity order on the Nigerian Exchange with full statutory fee compliance.',
    category: 'BEGINNER',
    rewardXp: 50,
    isCompleted: false,
    progress: 0,
    maxProgress: 1,
    badgeUnlock: 'Market Initiate'
  },
  {
    id: 'quest-stop-loss',
    title: 'Capital Preservation Discipline',
    description: 'Establish a Stop-Loss or Stop-Limit execution order to safeguard capital against volatile NGX swings.',
    category: 'INTERMEDIATE',
    rewardXp: 75,
    isCompleted: false,
    progress: 0,
    maxProgress: 1,
    badgeUnlock: 'Risk Guard'
  },
  {
    id: 'quest-sector-diversity',
    title: 'Multi-Sector Asset Allocation',
    description: 'Hold active positions spanning at least 3 distinct Nigerian economic sectors (e.g., Banking, Telco, Industrial).',
    category: 'INTERMEDIATE',
    rewardXp: 100,
    isCompleted: false,
    progress: 0,
    maxProgress: 3,
    badgeUnlock: 'Macro Allocator'
  },
  {
    id: 'quest-financial-teardown',
    title: 'Fundamental Statement Auditor',
    description: 'Inspect the 3-statement teardown (Balance Sheet, Income Statement, Cash Flow) of an NGX company on PSA Terminal.',
    category: 'BEGINNER',
    rewardXp: 75,
    isCompleted: false,
    progress: 0,
    maxProgress: 1,
    badgeUnlock: 'Equity Sleuth'
  },
  {
    id: 'quest-corporate-action',
    title: 'Dividend Harvest Strategist',
    description: 'Acquire and retain shares in an NGX dividend-paying blue-chip prior to the qualification closure date.',
    category: 'ADVANCED',
    rewardXp: 150,
    isCompleted: false,
    progress: 0,
    maxProgress: 1,
    badgeUnlock: 'Yield Harvester'
  }
];

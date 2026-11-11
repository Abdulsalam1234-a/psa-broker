import { ChallengeEvent, EventParticipant, User } from '../types';

export const exportEventGradebookCSV = (
  event: ChallengeEvent,
  participants: EventParticipant[],
  users: User[]
): { success: boolean; filename: string; count: number } => {
  if (!event || participants.length === 0) {
    return { success: false, filename: '', count: 0 };
  }

  // Sort participants by currentRank ascending
  const sorted = [...participants].sort((a, b) => a.currentRank - b.currentRank);

  const headers = [
    'Rank',
    'Student Full Name',
    'Trading Handle',
    'Rank Tier',
    'Academy XP (pts)',
    'Starting Capital (NGN)',
    'Current Portfolio Value (NGN)',
    'Net Profit/Loss (NGN)',
    'ROI (%)',
    'Max Drawdown (%)',
    'Discipline Score (/100)',
    'Research Points',
    'Composite Score',
    'Theses Submitted',
    'Rule Violations',
    'Sectors Invested',
    'Challenge Cohort',
    'Export Date'
  ];

  const initialCap = event.startingCapital || 500000;
  const exportDate = new Date().toISOString().split('T')[0];

  const escapeCSV = (value: any) => {
    const str = String(value ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = sorted.map(p => {
    const userObj = users.find(u => u.id === p.userId);
    const netReturn = p.portfolioValue - initialCap;
    const sectorsStr = (p.sectorsInvested || []).join('; ');

    return [
      p.currentRank,
      escapeCSV(p.userFullName),
      escapeCSV(p.userHandle),
      escapeCSV(p.rankTier),
      userObj?.academyXp || p.researchPoints || 0,
      initialCap.toFixed(2),
      p.portfolioValue.toFixed(2),
      netReturn.toFixed(2),
      p.roiPercentage.toFixed(2),
      p.maxDrawdownPct ? p.maxDrawdownPct.toFixed(2) : '0.00',
      p.disciplineScore.toFixed(1),
      p.researchPoints,
      p.compositeScore.toFixed(1),
      p.thesesCount,
      p.violationsCount,
      escapeCSV(sectorsStr),
      escapeCSV(event.title),
      exportDate
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const safeEventSlug = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
  const filename = `psa-gradebook-${safeEventSlug}-${exportDate}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, filename, count: sorted.length };
};

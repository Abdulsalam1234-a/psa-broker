import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  ChallengeEvent, 
  EventParticipant, 
  NewsSourceCredibility, 
  MarketSimulationCategory, 
  NGXSector 
} from '../../types';
import { formatNaira } from '../../services/feeEngine';
import { generateWhatsAppBroadcastText, getWhatsAppShareUrl } from '../../services/whatsappFormatter';
import { 
  Sliders, 
  Users, 
  UserPlus, 
  UserMinus, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  Calendar, 
  Layers, 
  ShieldAlert, 
  History, 
  Send, 
  Copy, 
  ExternalLink, 
  Share2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileText,
  PlusCircle,
  HelpCircle,
  Check,
  Download
} from 'lucide-react';
import { exportEventGradebookCSV } from '../../services/gradebookExport';

export const ManagerStudioView: React.FC = () => {
  const { 
    currentUser, 
    events, 
    participants, 
    users, 
    addStudentToEvent, 
    removeStudentFromEvent, 
    awardStudentXp,
    publishMarketNews,
    createChallengeEvent,
    auditLogs 
  } = useApp();

  // Role Protection
  if (currentUser.role !== 'MANAGER' && currentUser.role !== 'ADMIN') {
    return (
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 text-center space-y-3 max-w-lg mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-gold-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Course Manager Authorization Required</h2>
        <p className="text-xs text-slate-400">
          This portal is reserved for designated Academy Course Directors and Cohort Managers. Switch persona in the top navigation bar to Dr. Funke Adeyemi or PSA Super Administrator.
        </p>
      </div>
    );
  }

  // Filter events assigned to this manager (or all if admin)
  const accessibleEvents = useMemo(() => {
    if (currentUser.role === 'ADMIN') return events;
    return events.filter(e => e.assignedManagerId === currentUser.id);
  }, [events, currentUser]);

  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    return accessibleEvents[0]?.id || events[0]?.id || '';
  });

  const activeEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId) || accessibleEvents[0] || events[0];
  }, [events, selectedEventId, accessibleEvents]);

  // Manager Sub-tabs
  const [managerTab, setManagerTab] = useState<'STUDENTS' | 'NEWS' | 'AUDIT' | 'LAUNCH'>('STUDENTS');

  // Student Cohort Management State
  const [studentSearch, setStudentSearch] = useState('');
  const [studentToEnrollId, setStudentToEnrollId] = useState('');
  const [awardXpStudentId, setAwardXpStudentId] = useState<string | null>(null);
  const [xpAmount, setXpAmount] = useState<number>(50);
  const [xpReason, setXpReason] = useState<string>('Exemplary 3-Statement Balance Sheet Teardown');
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Simulation News State (Event-Scoped)
  const [newsHeadline, setNewsHeadline] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsSource, setNewsSource] = useState('Central Bank of Nigeria (Official Gazette)');
  const [newsCredibility, setNewsCredibility] = useState<NewsSourceCredibility>('OFFICIAL_REGULATORY');
  const [newsAuthor, setNewsAuthor] = useState('Dr. Olayemi Cardoso');
  const [newsAuthorTitle, setNewsAuthorTitle] = useState('Governor, CBN');
  const [newsCategory, setNewsCategory] = useState<MarketSimulationCategory>('DOMESTIC_MACRO');
  const [newsTicker, setNewsTicker] = useState('ZENITHBANK');
  const [newsSector, setNewsSector] = useState<NGXSector>('Financial Services');
  const [newsSentiment, setNewsSentiment] = useState<'HIGHLY_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'HIGHLY_BEARISH'>('BULLISH');
  const [newsPriceImpact, setNewsPriceImpact] = useState<number>(3.5);
  const [patGrowthPct, setPatGrowthPct] = useState<number | undefined>(25);
  const [dividendPerShare, setDividendPerShare] = useState<number | undefined>(2.50);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Challenge creation wizard state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCapital, setNewCapital] = useState(2000000);
  const [newTokens, setNewTokens] = useState(50);
  const [weightRoi, setWeightRoi] = useState(0.40);
  const [weightDiscipline, setWeightDiscipline] = useState(0.35);
  const [weightResearch, setWeightResearch] = useState(0.25);
  const [maxSingleStockPct, setMaxSingleStockPct] = useState(0.25);
  const [minSectors, setMinSectors] = useState(3);
  const [startDate, setStartDate] = useState('2026-11-15');
  const [endDate, setEndDate] = useState('2026-11-30');

  const [notification, setNotification] = useState<{ success: boolean; message: string } | null>(null);

  // Enrolled participants in active event
  const eventParticipants = useMemo(() => {
    if (!activeEvent) return [];
    return participants.filter(p => p.eventId === activeEvent.id);
  }, [participants, activeEvent]);

  // Active students eligible to be added
  const availableStudents = useMemo(() => {
    if (!activeEvent) return [];
    const enrolledUserIds = new Set(eventParticipants.map(p => p.userId));
    return users.filter(u => u.role === 'STUDENT' && u.status === 'ACTIVE' && !enrolledUserIds.has(u.id));
  }, [users, eventParticipants, activeEvent]);

  // Manager's specific audit logs
  const managerAuditLogs = useMemo(() => {
    return auditLogs.filter(l => 
      l.actorId === currentUser.id || 
      (activeEvent && l.eventId === activeEvent.id)
    );
  }, [auditLogs, currentUser, activeEvent]);

  // Live WhatsApp preview generator
  const generatedWhatsAppDraft = useMemo(() => {
    if (!newsHeadline.trim()) return '';
    return generateWhatsAppBroadcastText({
      headline: newsHeadline,
      summary: newsSummary || 'Market participants are advised to analyze upcoming liquidity adjustments.',
      sourceName: newsSource,
      sourceCategory: newsCredibility,
      authorPersona: newsAuthor,
      authorTitle: newsAuthorTitle,
      scope: 'EVENT',
      eventTitle: activeEvent?.title,
      affectedTicker: newsTicker,
      affectedSector: newsSector,
      sentiment: newsSentiment,
      priceImpactPct: newsPriceImpact,
      corporateDisclosure: {
        patGrowthPct,
        dividendPerShare,
      }
    });
  }, [
    newsHeadline, 
    newsSummary, 
    newsSource, 
    newsCredibility, 
    newsAuthor, 
    newsAuthorTitle, 
    activeEvent, 
    newsTicker, 
    newsSector, 
    newsSentiment, 
    newsPriceImpact,
    patGrowthPct,
    dividendPerShare
  ]);

  // Actions
  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEnrollId || !activeEvent) return;

    const res = addStudentToEvent(activeEvent.id, studentToEnrollId);
    setNotification(res);
    if (res.success) {
      setStudentToEnrollId('');
    }
  };

  const handleRemoveStudent = (participant: EventParticipant) => {
    if (!activeEvent) return;
    const reason = prompt(`Reason for removing ${participant.userFullName} from ${activeEvent.title}?`, 'Cohort restructuring');
    if (reason === null) return;

    const res = removeStudentFromEvent(activeEvent.id, participant.userId, reason);
    setNotification(res);
  };

  const handleAwardXp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardXpStudentId) return;

    const success = awardStudentXp(awardXpStudentId, xpAmount, xpReason);
    if (success) {
      setNotification({ success: true, message: `Successfully awarded ${xpAmount} XP to student.` });
      setAwardXpStudentId(null);
    } else {
      setNotification({ success: false, message: 'Failed to award XP.' });
    }
  };

  const handlePublishEventNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsHeadline.trim() || !activeEvent) {
      setNotification({ success: false, message: 'Please enter a valid news headline.' });
      return;
    }

    const res = publishMarketNews({
      headline: newsHeadline,
      summary: newsSummary,
      sourceName: newsSource,
      sourceCategory: newsCredibility,
      authorPersona: newsAuthor,
      authorTitle: newsAuthorTitle,
      category: newsCategory,
      scope: 'EVENT',
      eventId: activeEvent.id,
      eventTitle: activeEvent.title,
      affectedTicker: newsTicker,
      affectedSector: newsSector,
      sentiment: newsSentiment,
      priceImpactPct: newsPriceImpact,
      corporateDisclosure: {
        patGrowthPct,
        dividendPerShare,
      }
    });

    setNotification(res);
    if (res.success) {
      setNewsHeadline('');
      setNewsSummary('');
    }
  };

  const handleCopyWhatsApp = () => {
    if (!generatedWhatsAppDraft) return;
    navigator.clipboard.writeText(generatedWhatsAppDraft);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = Number((weightRoi + weightDiscipline + weightResearch).toFixed(2));
    if (Math.abs(sum - 1.0) > 0.01) {
      setNotification({ success: false, message: `Scoring weights must sum to exactly 100%. Current: ${(sum * 100).toFixed(0)}%` });
      return;
    }

    const ok = createChallengeEvent({
      title: newTitle,
      description: newDescription,
      startTime: `${startDate}T08:00:00Z`,
      endTime: `${endDate}T17:00:00Z`,
      status: 'ACTIVE',
      startingCapital: newCapital,
      entryFeeTokens: newTokens,
      weightRoi,
      weightDiscipline,
      weightResearch,
      maxSingleStockPct,
      minSectorsRequired: minSectors,
    });

    if (ok) {
      setNotification({ success: true, message: `Challenge "${newTitle}" created and published!` });
      setNewTitle('');
      setNewDescription('');
      setManagerTab('STUDENTS');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header Bar with Assigned Event Selector */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-gold-500/30 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/50 flex items-center justify-center text-gold-300">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">Manager Executive Studio</h1>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40 font-mono font-bold">
                  {currentUser.fullName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Assign and manage student cohorts, award XP, track audit history, and broadcast simulation headlines to WhatsApp.
              </p>
            </div>
          </div>

          {/* Event Pick Dropdown */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider shrink-0">
              Managing Event:
            </span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full sm:w-80 bg-navy-950 border border-gold-500/40 text-gold-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none shadow-inner"
            >
              {accessibleEvents.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({participants.filter(p => p.eventId === ev.id).length} traders)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Studio Sub-Nav */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-navy-800 text-xs font-bold">
          <button
            onClick={() => setManagerTab('STUDENTS')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              managerTab === 'STUDENTS'
                ? 'bg-gold-500 text-navy-950 shadow-md font-black'
                : 'bg-navy-950/70 text-slate-400 hover:text-white border border-navy-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students ({eventParticipants.length})</span>
          </button>

          <button
            onClick={() => setManagerTab('NEWS')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              managerTab === 'NEWS'
                ? 'bg-gold-500 text-navy-950 shadow-md font-black'
                : 'bg-navy-950/70 text-slate-400 hover:text-white border border-navy-800'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>WhatsApp News Dispatch</span>
          </button>

          <button
            onClick={() => setManagerTab('AUDIT')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              managerTab === 'AUDIT'
                ? 'bg-gold-500 text-navy-950 shadow-md font-black'
                : 'bg-navy-950/70 text-slate-400 hover:text-white border border-navy-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit History ({managerAuditLogs.length})</span>
          </button>

          <button
            onClick={() => setManagerTab('LAUNCH')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              managerTab === 'LAUNCH'
                ? 'bg-gold-500 text-navy-950 shadow-md font-black'
                : 'bg-navy-950/70 text-slate-400 hover:text-white border border-navy-800'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Launch Challenge</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 animate-in fade-in ${
          notification.success 
            ? 'bg-bull/15 border border-bull/40 text-bull' 
            : 'bg-bear/15 border border-bear/40 text-bear'
        }`}>
          <div className="flex items-center gap-2">
            {notification.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-[10px] underline hover:opacity-80 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. TAB: STUDENTS IN THIS EVENT */}
      {managerTab === 'STUDENTS' && activeEvent && (
        <div className="space-y-5">
          
          {/* Quick Enroll Box */}
          <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-gold-400" />
                  <span>Enroll Student into "{activeEvent.title}"</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select an active Naira Stock Academy student from the directory to provision their ₦{activeEvent.startingCapital.toLocaleString()} event portfolio.
                </p>
              </div>

              <form onSubmit={handleEnrollStudent} className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={studentToEnrollId}
                  onChange={(e) => setStudentToEnrollId(e.target.value)}
                  className="bg-navy-950 border border-navy-700 text-slate-200 text-xs rounded-xl px-3 py-2 w-full md:w-64 focus:outline-none focus:border-gold-500 font-semibold"
                >
                  <option value="">Select Student to Enroll...</option>
                  {availableStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.rankTier} • {s.academyXp} XP)
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={!studentToEnrollId}
                  className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-navy-800 disabled:text-slate-600 text-navy-950 font-black text-xs transition-all shrink-0 flex items-center gap-1.5 shadow-md shadow-gold-500/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enroll</span>
                </button>
              </form>
            </div>
          </div>

          {/* Enrolled Students Table */}
          <div className="bg-navy-900 border border-navy-700/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 bg-navy-950/60 border-b border-navy-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gold-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Cohort Roster ({eventParticipants.length} Traders)
                </h4>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const res = exportEventGradebookCSV(activeEvent, eventParticipants, users);
                    if (res.success) {
                      setExportSuccessMessage(`Exported ${res.count} student grades to ${res.filename}`);
                      setTimeout(() => setExportSuccessMessage(null), 5000);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all border border-emerald-400/40"
                  title="Download complete cohort gradebook in CSV format"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Gradebook (CSV)</span>
                </button>

                <div className="relative w-48 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Filter roster..."
                    className="w-full pl-8 pr-3 py-1 bg-navy-900 border border-navy-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {exportSuccessMessage && (
              <div className="bg-emerald-950/80 border-b border-emerald-600/50 p-2.5 px-4 text-xs text-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{exportSuccessMessage}</span>
                </div>
                <button onClick={() => setExportSuccessMessage(null)} className="text-emerald-400 hover:text-white text-xs">Dismiss</button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-navy-950/90 text-[11px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-navy-700/70">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-3 text-right">Academy XP</th>
                    <th className="py-3 px-3 text-right">Portfolio Value</th>
                    <th className="py-3 px-3 text-right">ROI %</th>
                    <th className="py-3 px-3 text-right">Discipline Score</th>
                    <th className="py-3 px-3 text-center">Rank</th>
                    <th className="py-3 px-4 text-center">Manager Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 font-medium">
                  {eventParticipants
                    .filter(p => p.userFullName.toLowerCase().includes(studentSearch.toLowerCase()) || p.userHandle.toLowerCase().includes(studentSearch.toLowerCase()))
                    .map(p => {
                      const userObj = users.find(u => u.id === p.userId);
                      return (
                        <tr key={p.id} className="hover:bg-navy-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white text-sm">{p.userFullName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{p.userHandle}</div>
                            <span className="text-[10px] text-gold-400">{p.rankTier}</span>
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-gold-400">
                            {userObj?.academyXp || 0} pts
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-white">
                            {formatNaira(p.portfolioValue)}
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold">
                            <span className={p.roiPercentage >= 0 ? 'text-bull' : 'text-bear'}>
                              {p.roiPercentage >= 0 ? '+' : ''}{p.roiPercentage.toFixed(2)}%
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-slate-300">
                            {p.disciplineScore.toFixed(1)}/100
                            <div className="text-[10px] text-slate-500">{p.violationsCount} violations</div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-navy-800 border border-navy-700 font-mono font-bold text-gold-300">
                              #{p.currentRank}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setAwardXpStudentId(p.userId)}
                                className="px-2 py-1 rounded bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 font-bold text-[11px] border border-gold-500/30 transition-all flex items-center gap-1"
                                title="Award Academy XP"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>Award XP</span>
                              </button>

                              <button
                                onClick={() => handleRemoveStudent(p)}
                                className="px-2 py-1 rounded bg-navy-800 hover:bg-bear hover:text-white text-slate-400 font-bold text-[11px] border border-navy-700 transition-all flex items-center gap-1"
                                title="Remove student from event"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: SIMULATION NEWS & WHATSAPP HEADLINE DISPATCH */}
      {managerTab === 'NEWS' && activeEvent && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form: Create Simulation News (7 cols) */}
          <div className="lg:col-span-7 bg-navy-900 border border-navy-700/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-gold-400" />
                <span>Publish Market Simulation Event</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate news and regulatory circulars that directly move stock prices and generate viral headlines for the WhatsApp community.
              </p>
            </div>

            <form onSubmit={handlePublishEventNews} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block text-slate-300 font-bold mb-1">Breaking News Headline</label>
                <input
                  type="text"
                  required
                  value={newsHeadline}
                  onChange={(e) => setNewsHeadline(e.target.value)}
                  placeholder="e.g. CBN MPC Hikes Benchmark Interest Rate by 150bps"
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Intelligence Summary & Market Impact Details</label>
                <textarea
                  rows={3}
                  required
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  placeholder="Explain why this information matters, liquidity impacts, and guidance for cohort portfolios..."
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Information Source</label>
                  <input
                    type="text"
                    value={newsSource}
                    onChange={(e) => setNewsSource(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Source Credibility Tier</label>
                  <select
                    value={newsCredibility}
                    onChange={(e) => setNewsCredibility(e.target.value as NewsSourceCredibility)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-gold-400 font-bold"
                  >
                    <option value="OFFICIAL_REGULATORY">Official Regulatory (100% Impact)</option>
                    <option value="INSTITUTIONAL_MEDIA">Institutional Press (80% Impact)</option>
                    <option value="MARKET_ANALYST">Research Analyst (65% Impact)</option>
                    <option value="SOCIAL_INFLUENCER">Social / Influencer (35% Volatility)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Persona Disclosing News</label>
                  <input
                    type="text"
                    value={newsAuthor}
                    onChange={(e) => setNewsAuthor(e.target.value)}
                    placeholder="e.g. Dr. Olayemi Cardoso"
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Persona Title</label>
                  <input
                    type="text"
                    value={newsAuthorTitle}
                    onChange={(e) => setNewsAuthorTitle(e.target.value)}
                    placeholder="e.g. Governor, CBN"
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Stock</label>
                  <select
                    value={newsTicker}
                    onChange={(e) => setNewsTicker(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-mono font-bold"
                  >
                    <option value="ZENITHBANK">ZENITHBANK</option>
                    <option value="GTCO">GTCO</option>
                    <option value="MTNN">MTNN</option>
                    <option value="DANGCEM">DANGCEM</option>
                    <option value="SEPLAT">SEPLAT</option>
                    <option value="AIRTELAFRI">AIRTELAFRI</option>
                    <option value="BUACEMENT">BUACEMENT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sentiment</label>
                  <select
                    value={newsSentiment}
                    onChange={(e) => setNewsSentiment(e.target.value as any)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-bold"
                  >
                    <option value="HIGHLY_BULLISH">🚀 Highly Bullish</option>
                    <option value="BULLISH">📈 Bullish</option>
                    <option value="NEUTRAL">⚖️ Neutral</option>
                    <option value="BEARISH">📉 Bearish</option>
                    <option value="HIGHLY_BEARISH">💥 Highly Bearish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Price Impact (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newsPriceImpact}
                    onChange={(e) => setNewsPriceImpact(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Corporate Disclosure Elements */}
              <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
                <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider">
                  Optional Corporate Earnings & Dividend Disclosure
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400">PAT Growth (% YoY)</label>
                    <input
                      type="number"
                      value={patGrowthPct || ''}
                      onChange={(e) => setPatGrowthPct(e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="e.g. 45"
                      className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Proposed Dividend (₦/share)</label>
                    <input
                      type="number"
                      step="0.10"
                      value={dividendPerShare || ''}
                      onChange={(e) => setDividendPerShare(e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="e.g. 3.50"
                      className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 text-navy-950 font-black text-sm shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast Event News & Shift Market Prices</span>
              </button>
            </form>
          </div>

          {/* Right Preview: Live WhatsApp Community Broadcast (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0b141a] border border-[#202c33] rounded-2xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#202c33] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-[#e9edef] uppercase tracking-wider">
                    WhatsApp Community Dispatch Preview
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyWhatsApp}
                    className="px-2.5 py-1 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-[#00a884] text-xs font-bold transition-all flex items-center gap-1"
                    title="Copy to Clipboard"
                  >
                    {copiedNotification ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNotification ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <a
                    href={getWhatsAppShareUrl(generatedWhatsAppDraft)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#00a884] hover:bg-[#02906f] text-black text-xs font-black transition-all flex items-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Open WA</span>
                  </a>
                </div>
              </div>

              {/* Formatted Message Card */}
              <div className="p-4 rounded-xl bg-[#111b21] border border-[#202c33] text-[12px] font-mono text-[#d1d7db] leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto shadow-inner select-all">
                {generatedWhatsAppDraft || (
                  <span className="text-slate-500 italic">
                    Type a headline on the left to see the instant WhatsApp community broadcast format...
                  </span>
                )}
              </div>

              <div className="text-[10px] text-slate-400 text-center">
                Formatted with Markdown emojis and actionable links for Naira Stock Academy WhatsApp groups.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 4. TAB: MANAGER AUDIT LOG */}
      {managerTab === 'AUDIT' && (
        <div className="bg-navy-900 border border-navy-700/80 rounded-2xl shadow-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gold-400" />
              <h3 className="text-base font-bold text-white">Manager Activity & Governance Audit Trail</h3>
            </div>
            <span className="text-xs text-slate-400">
              Logged actions are permanently archived for Super Admin review
            </span>
          </div>

          <div className="divide-y divide-navy-800 text-xs">
            {managerAuditLogs.length > 0 ? (
              managerAuditLogs.map(log => (
                <div key={log.id} className="py-3.5 first:pt-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-navy-950 text-gold-300 font-mono font-bold">
                      {log.actionType}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-200 font-medium">
                    {log.description}
                  </p>
                  <div className="text-[11px] text-slate-400">
                    Executed by: <strong className="text-white">{log.actorName}</strong> ({log.actorRole})
                    {log.eventTitle && <> • Event: <span className="text-gold-400">{log.eventTitle}</span></>}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                No activity logs recorded yet for this manager or event.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB: LAUNCH NEW CHALLENGE */}
      {managerTab === 'LAUNCH' && (
        <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto space-y-4">
          <div>
            <h3 className="text-base font-black text-white">Launch New Cohort Challenge</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Create a new competition for your cohort students.
            </p>
          </div>

          <form onSubmit={handleCreateChallenge} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Challenge Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. November Capital Markets Alpha Challenge"
                className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Challenge Description & Thesis Focus</label>
              <textarea
                rows={2}
                required
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Starting Capital (₦)</label>
                <input
                  type="number"
                  step="500000"
                  value={newCapital}
                  onChange={(e) => setNewCapital(parseFloat(e.target.value) || 2000000)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Entry Tokens (XP)</label>
                <input
                  type="number"
                  value={newTokens}
                  onChange={(e) => setNewTokens(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
              <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider">
                Scoring Weight Distribution (Must equal 100%)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400">ROI %</label>
                  <input
                    type="number"
                    step="0.05"
                    value={weightRoi}
                    onChange={(e) => setWeightRoi(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Risk Discipline</label>
                  <input
                    type="number"
                    step="0.05"
                    value={weightDiscipline}
                    onChange={(e) => setWeightDiscipline(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Research Points</label>
                  <input
                    type="number"
                    step="0.05"
                    value={weightResearch}
                    onChange={(e) => setWeightResearch(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-sm shadow-lg shadow-gold-500/20 transition-all"
            >
              Launch Challenge Event
            </button>
          </form>
        </div>
      )}

      {/* Award XP Modal */}
      {awardXpStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-navy-900 border border-gold-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-400" />
              <span>Award Academy XP to Student</span>
            </h3>

            <form onSubmit={handleAwardXp} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">XP Points</label>
                <input
                  type="number"
                  value={xpAmount}
                  onChange={(e) => setXpAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Rationale / Reason</label>
                <input
                  type="text"
                  required
                  value={xpReason}
                  onChange={(e) => setXpReason(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAwardXpStudentId(null)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black"
                >
                  Confirm XP Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  UserRole, 
  UserStatus, 
  RankTier, 
  ChallengeEvent, 
  EventParticipant,
  NewsSourceCredibility, 
  MarketSimulationCategory, 
  NewsScope, 
  NGXSector 
} from '../../types';
import { formatNaira } from '../../services/feeEngine';
import { generateWhatsAppBroadcastText, getWhatsAppShareUrl } from '../../services/whatsappFormatter';
import { 
  ShieldCheck, 
  Users, 
  Trophy, 
  UserPlus, 
  UserMinus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Sliders, 
  Search, 
  AlertCircle, 
  Sparkles, 
  ShieldAlert, 
  Award, 
  Calendar, 
  PlusCircle, 
  Send, 
  Share2, 
  Copy, 
  Check, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Radio, 
  Briefcase,
  FileText,
  Download
} from 'lucide-react';
import { exportEventGradebookCSV } from '../../services/gradebookExport';

export const SuperAdminStudioView: React.FC = () => {
  const { 
    currentUser, 
    users, 
    updateUser, 
    approveUser, 
    deleteUser, 
    grantManagementAccess, 
    revokeManagementAccess,
    events,
    participants,
    createChallengeEvent,
    updateChallengeEvent,
    deleteChallengeEvent,
    assignManagerToEvent,
    addStudentToEvent,
    removeStudentFromEvent,
    publishMarketNews,
    adjustSectorIndex,
    adjustStockPrice,
    auditLogs
  } = useApp();

  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'EVENTS' | 'SIMULATION' | 'AUDIT'>('MEMBERS');
  const [notification, setNotification] = useState<{ success: boolean; message: string } | null>(null);

  // ----------------------------------------------------
  // 1. Members State
  // ----------------------------------------------------
  const [searchMember, setSearchMember] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('STUDENT');
  const [editStatus, setEditStatus] = useState<UserStatus>('ACTIVE');
  const [editXp, setEditXp] = useState<number>(0);
  const [editRank, setEditRank] = useState<RankTier>('Novice Observer');

  // ----------------------------------------------------
  // 2. Events & Managers State
  // ----------------------------------------------------
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const activeEvent = useMemo(() => events.find(e => e.id === selectedEventId) || events[0], [events, selectedEventId]);

  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChallengeEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventCapital, setEventCapital] = useState(2000000);
  const [eventFee, setEventFee] = useState(50);
  const [eventRoiWeight, setEventRoiWeight] = useState(0.40);
  const [eventDiscWeight, setEventDiscWeight] = useState(0.35);
  const [eventResWeight, setEventResWeight] = useState(0.25);
  const [eventSingleStockMax, setEventSingleStockMax] = useState(0.25);
  const [eventMinSectors, setEventMinSectors] = useState(3);
  const [eventStartDate, setEventStartDate] = useState('2026-11-15');
  const [eventEndDate, setEventEndDate] = useState('2026-11-30');
  const [eventManagerId, setEventManagerId] = useState('user-funke');

  // Add student to event state
  const [studentToEnrollId, setStudentToEnrollId] = useState('');

  // ----------------------------------------------------
  // 3. Macro Simulation & WhatsApp News State
  // ----------------------------------------------------
  const [simHeadline, setSimHeadline] = useState('');
  const [simSummary, setSimSummary] = useState('');
  const [simSource, setSimSource] = useState('Central Bank of Nigeria (Official Gazette)');
  const [simCredibility, setSimCredibility] = useState<NewsSourceCredibility>('OFFICIAL_REGULATORY');
  const [simPersona, setSimPersona] = useState('Dr. Olayemi Cardoso');
  const [simTitle, setSimTitle] = useState('Governor, Central Bank of Nigeria');
  const [simScope, setSimScope] = useState<NewsScope>('GLOBAL');
  const [simEventId, setSimEventId] = useState<string>(events[0]?.id || '');
  const [simCategory, setSimCategory] = useState<MarketSimulationCategory>('DOMESTIC_MACRO');
  const [simTicker, setSimTicker] = useState('ZENITHBANK');
  const [simSector, setSimSector] = useState<NGXSector>('Financial Services');
  const [simSentiment, setSimSentiment] = useState<'HIGHLY_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'HIGHLY_BEARISH'>('BULLISH');
  const [simPriceImpact, setSimPriceImpact] = useState<number>(4.5);
  const [simPatGrowth, setSimPatGrowth] = useState<number | undefined>(35);
  const [simDividend, setSimDividend] = useState<number | undefined>(3.50);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Sector Quick Shift State
  const [shiftSector, setShiftSector] = useState<NGXSector>('Financial Services');
  const [shiftDelta, setShiftDelta] = useState<number>(2.5);
  const [shiftReason, setShiftReason] = useState('CBN Monetary Policy Rate Surplus');

  // Stock Quick Shift State
  const [shiftTicker, setShiftTicker] = useState('MTNN');
  const [shiftTickerDelta, setShiftTickerDelta] = useState<number>(3.0);
  const [shiftTickerReason, setShiftTickerReason] = useState('Unaudited Foreign Exchange Gain');

  // ----------------------------------------------------
  // 4. Audit Log Filter State
  // ----------------------------------------------------
  const [auditSearch, setAuditSearch] = useState('');

  // Security Check
  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="bg-navy-900 border border-bear/40 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto my-12">
        <ShieldAlert className="w-14 h-14 text-bear mx-auto" />
        <h2 className="text-xl font-black text-white">Super Administrator Authorization Required</h2>
        <p className="text-xs text-slate-400">
          Access is strictly reserved for PSA Super Administrators. Switch persona to PSA Super Administrator in the top navigation bar.
        </p>
      </div>
    );
  }

  // Filtered members list
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchMember.toLowerCase()) ||
      u.email.toLowerCase().includes(searchMember.toLowerCase()) ||
      u.handle.toLowerCase().includes(searchMember.toLowerCase()) ||
      u.phoneNumber.includes(searchMember);

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const availableManagers = users.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN');
  const activeEventParticipants = participants.filter(p => p.eventId === activeEvent?.id);
  const unenrolledStudents = users.filter(u => 
    u.role === 'STUDENT' && 
    u.status === 'ACTIVE' && 
    !activeEventParticipants.some(p => p.userId === u.id)
  );

  // Generated WhatsApp Headline & Broadcast draft for preview
  const generatedWhatsAppDraft = useMemo(() => {
    if (!simHeadline.trim()) return '';
    return generateWhatsAppBroadcastText({
      headline: simHeadline,
      summary: simSummary || 'Market participants are analyzing upcoming macroeconomic conditions.',
      sourceName: simSource,
      sourceCategory: simCredibility,
      authorPersona: simPersona,
      authorTitle: simTitle,
      scope: simScope,
      eventTitle: simScope === 'EVENT' ? events.find(e => e.id === simEventId)?.title : undefined,
      affectedTicker: simCategory === 'STOCK_SPECIFIC' ? simTicker : undefined,
      affectedSector: simCategory === 'SECTOR_INDEX' || simCategory === 'DOMESTIC_MACRO' ? simSector : undefined,
      sentiment: simSentiment,
      priceImpactPct: simPriceImpact,
      corporateDisclosure: {
        patGrowthPct: simPatGrowth,
        dividendPerShare: simDividend,
      }
    });
  }, [
    simHeadline, 
    simSummary, 
    simSource, 
    simCredibility, 
    simPersona, 
    simTitle, 
    simScope, 
    simEventId, 
    simCategory, 
    simTicker, 
    simSector, 
    simSentiment, 
    simPriceImpact,
    simPatGrowth,
    simDividend,
    events
  ]);

  // Actions
  const handleApprove = (user: User) => {
    approveUser(user.id);
    setNotification({ success: true, message: `Approved member ${user.fullName}. Their account is now ACTIVE.` });
  };

  const handleGrantManager = (user: User) => {
    grantManagementAccess(user.id);
    setNotification({ success: true, message: `Promoted ${user.fullName} to MANAGER role with challenge governance access.` });
  };

  const handleRevokeManager = (user: User) => {
    revokeManagementAccess(user.id);
    setNotification({ success: true, message: `Revoked manager access from ${user.fullName}. Role returned to STUDENT.` });
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser.id) {
      setNotification({ success: false, message: 'Cannot delete your own Super Administrator account!' });
      return;
    }
    if (confirm(`Are you sure you want to delete member ${user.fullName}?`)) {
      deleteUser(user.id);
      setNotification({ success: true, message: `Deleted member ${user.fullName}.` });
    }
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.fullName);
    setEditEmail(user.email);
    setEditPhone(user.phoneNumber);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditXp(user.academyXp);
    setEditRank(user.rankTier);
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUser(editingUser.id, {
      fullName: editFullName,
      email: editEmail,
      phoneNumber: editPhone,
      role: editRole,
      status: editStatus,
      academyXp: editXp,
      rankTier: editRank,
    });
    setNotification({ success: true, message: `Updated profile for ${editFullName}.` });
    setEditingUser(null);
  };

  // Event Manager Re-assignment
  const handleAssignManager = (managerId: string) => {
    if (!activeEvent) return;
    const ok = assignManagerToEvent(activeEvent.id, managerId);
    if (ok) {
      const mgr = users.find(u => u.id === managerId);
      setNotification({ success: true, message: `Assigned ${mgr?.fullName} as Course Manager for "${activeEvent.title}".` });
    }
  };

  // Student Enrollment / Removal in Event
  const handleEnrollStudentInEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEnrollId || !activeEvent) return;
    const res = addStudentToEvent(activeEvent.id, studentToEnrollId);
    setNotification(res);
    if (res.success) setStudentToEnrollId('');
  };

  const handleRemoveStudentFromEvent = (participant: EventParticipant) => {
    if (!activeEvent) return;
    const reason = prompt(`Reason for removing ${participant.userFullName} from ${activeEvent.title}?`, 'Executive reallocation');
    if (reason === null) return;
    const res = removeStudentFromEvent(activeEvent.id, participant.userId, reason);
    setNotification(res);
  };

  // Event Creation & Deletion
  const openCreateEvent = () => {
    setEditingEvent(null);
    setEventTitle('');
    setEventDesc('');
    setEventCapital(2000000);
    setEventFee(50);
    setEventRoiWeight(0.40);
    setEventDiscWeight(0.35);
    setEventResWeight(0.25);
    setEventSingleStockMax(0.25);
    setEventMinSectors(3);
    setEventStartDate('2026-11-15');
    setEventEndDate('2026-11-30');
    setEventManagerId('user-funke');
    setIsCreateEventOpen(true);
  };

  const openEditEvent = (ev: ChallengeEvent) => {
    setEditingEvent(ev);
    setEventTitle(ev.title);
    setEventDesc(ev.description);
    setEventCapital(ev.startingCapital);
    setEventFee(ev.entryFeeTokens);
    setEventRoiWeight(ev.weightRoi);
    setEventDiscWeight(ev.weightDiscipline);
    setEventResWeight(ev.weightResearch);
    setEventSingleStockMax(ev.maxSingleStockPct);
    setEventMinSectors(ev.minSectorsRequired);
    setEventStartDate(ev.startTime.split('T')[0]);
    setEventEndDate(ev.endTime.split('T')[0]);
    setEventManagerId(ev.assignedManagerId || 'user-funke');
    setIsCreateEventOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = Number((eventRoiWeight + eventDiscWeight + eventResWeight).toFixed(2));
    if (Math.abs(sum - 1.0) > 0.01) {
      setNotification({ success: false, message: `Weights must equal 100%. Current: ${(sum * 100).toFixed(0)}%` });
      return;
    }

    const mgr = users.find(u => u.id === eventManagerId);

    if (editingEvent) {
      updateChallengeEvent(editingEvent.id, {
        title: eventTitle,
        description: eventDesc,
        startingCapital: eventCapital,
        entryFeeTokens: eventFee,
        weightRoi: eventRoiWeight,
        weightDiscipline: eventDiscWeight,
        weightResearch: eventResWeight,
        maxSingleStockPct: eventSingleStockMax,
        minSectorsRequired: eventMinSectors,
        assignedManagerId: mgr?.id,
        assignedManagerName: mgr?.fullName,
        startTime: `${eventStartDate}T08:00:00Z`,
        endTime: `${eventEndDate}T17:00:00Z`,
      });
      setNotification({ success: true, message: `Challenge "${eventTitle}" updated!` });
    } else {
      createChallengeEvent({
        title: eventTitle,
        description: eventDesc,
        startTime: `${eventStartDate}T08:00:00Z`,
        endTime: `${eventEndDate}T17:00:00Z`,
        status: 'ACTIVE',
        startingCapital: eventCapital,
        entryFeeTokens: eventFee,
        weightRoi: eventRoiWeight,
        weightDiscipline: eventDiscWeight,
        weightResearch: eventResWeight,
        maxSingleStockPct: eventSingleStockMax,
        minSectorsRequired: eventMinSectors,
        assignedManagerId: mgr?.id,
        assignedManagerName: mgr?.fullName,
      });
      setNotification({ success: true, message: `Challenge "${eventTitle}" created and published!` });
    }

    setIsCreateEventOpen(false);
  };

  const handleDeleteEvent = (ev: ChallengeEvent) => {
    if (confirm(`Delete challenge "${ev.title}"? All enrolled participants will be removed.`)) {
      deleteChallengeEvent(ev.id);
      setNotification({ success: true, message: `Deleted challenge "${ev.title}".` });
    }
  };

  // Publish Global or Event Simulation News
  const handlePublishSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simHeadline.trim()) {
      setNotification({ success: false, message: 'Please enter a headline.' });
      return;
    }

    const targetEv = events.find(e => e.id === simEventId);

    const res = publishMarketNews({
      headline: simHeadline,
      summary: simSummary,
      sourceName: simSource,
      sourceCategory: simCredibility,
      authorPersona: simPersona,
      authorTitle: simTitle,
      category: simCategory,
      scope: simScope,
      eventId: simScope === 'EVENT' ? targetEv?.id : undefined,
      eventTitle: simScope === 'EVENT' ? targetEv?.title : undefined,
      affectedTicker: simCategory === 'STOCK_SPECIFIC' ? simTicker : undefined,
      affectedSector: simCategory === 'SECTOR_INDEX' || simCategory === 'DOMESTIC_MACRO' ? simSector : undefined,
      sentiment: simSentiment,
      priceImpactPct: simPriceImpact,
      corporateDisclosure: {
        patGrowthPct: simPatGrowth,
        dividendPerShare: simDividend,
      }
    });

    setNotification(res);
    if (res.success) {
      setSimHeadline('');
      setSimSummary('');
    }
  };

  const handleCopyWhatsApp = () => {
    if (!generatedWhatsAppDraft) return;
    navigator.clipboard.writeText(generatedWhatsAppDraft);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Quick Sector Shift
  const handleQuickSectorShift = (e: React.FormEvent) => {
    e.preventDefault();
    adjustSectorIndex(shiftSector, shiftDelta, shiftReason);
    setNotification({ success: true, message: `Shifted ${shiftSector} All-Share Index by ${shiftDelta >= 0 ? '+' : ''}${shiftDelta}%.` });
  };

  // Quick Stock Shift
  const handleQuickStockShift = (e: React.FormEvent) => {
    e.preventDefault();
    adjustStockPrice(shiftTicker, shiftTickerDelta, shiftTickerReason);
    setNotification({ success: true, message: `Adjusted ${shiftTicker} price by ${shiftTickerDelta >= 0 ? '+' : ''}${shiftTickerDelta}%.` });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-navy-900 to-navy-950 border border-purple-500/40 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">Super Administrator Control Center</h1>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-900/80 text-purple-200 border border-purple-500/50 font-bold font-mono">
                  SUPREME GOVERNANCE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full oversight over Members, Manager Assignments, Real-time Market Simulations, WhatsApp Community Broadcasting, and System Audit Logs.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-navy-950 p-1.5 rounded-2xl border border-navy-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('MEMBERS')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'MEMBERS'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Members ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('EVENTS')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'EVENTS'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Events & Managers</span>
            </button>

            <button
              onClick={() => setActiveTab('SIMULATION')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'SIMULATION'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Macro & WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'AUDIT'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Trail ({auditLogs.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
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

      {/* ---------------------------------------------------- */}
      {/* 2. TAB: MEMBERS MANAGEMENT                           */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="Search by name, email, handle or phone..."
                className="w-full pl-9 pr-3 py-1.5 bg-navy-950 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-navy-950 border border-navy-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 font-semibold"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="MANAGER">Managers</option>
                <option value="ADMIN">Admins</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-navy-950 border border-navy-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending Approval</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-navy-900 border border-navy-700/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-navy-950/80 text-[11px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-navy-700/70">
                    <th className="py-3 px-4">Member Name & Identity</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3 text-center">Role</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Academy XP</th>
                    <th className="py-3 px-4 text-center">Governance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 font-medium">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    return (
                      <tr key={u.id} className="hover:bg-navy-800/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-navy-700 shrink-0">
                              <img 
                                src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'} 
                                alt={u.fullName}
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                <span>{u.fullName}</span>
                                {isSelf && <span className="text-[10px] text-purple-400 font-normal">(You)</span>}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">{u.handle}</div>
                              <div className="text-[10px] text-gold-400">{u.rankTier}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-slate-300 font-mono text-[11px]">{u.email}</div>
                          <div className="text-slate-500 font-mono text-[10px]">{u.phoneNumber}</div>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase ${
                            u.role === 'ADMIN' ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50' :
                            u.role === 'MANAGER' ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40' :
                            'bg-navy-800 text-slate-300 border border-navy-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                            u.status === 'ACTIVE' ? 'bg-bull/20 text-bull border border-bull/30' :
                            u.status === 'PENDING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' :
                            'bg-bear/20 text-bear border border-bear/30'
                          }`}>
                            {u.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-200">
                          {u.academyXp} pts
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {u.status === 'PENDING' && (
                              <button
                                onClick={() => handleApprove(u)}
                                className="px-2 py-1 rounded bg-bull/20 hover:bg-bull hover:text-navy-950 text-bull font-bold text-[11px] border border-bull/40 transition-all flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}

                            {u.role === 'STUDENT' ? (
                              <button
                                onClick={() => handleGrantManager(u)}
                                className="px-2 py-1 rounded bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-gold-400 font-bold text-[11px] border border-gold-500/30 transition-all flex items-center gap-1"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>+ Make Mgr</span>
                              </button>
                            ) : u.role === 'MANAGER' ? (
                              <button
                                onClick={() => handleRevokeManager(u)}
                                className="px-2 py-1 rounded bg-navy-800 hover:bg-amber-600 hover:text-white text-slate-300 font-bold text-[11px] border border-navy-700 transition-all"
                              >
                                Revoke Mgr
                              </button>
                            ) : null}

                            <button
                              onClick={() => openEditUser(u)}
                              className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white border border-navy-700 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1 rounded bg-navy-800 hover:bg-bear hover:text-white text-slate-400 transition-colors border border-navy-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
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

      {/* ---------------------------------------------------- */}
      {/* 3. TAB: EVENTS, MANAGERS & COHORTS                   */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'EVENTS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                <span>Events & Manager Delegation Studio</span>
              </h2>
              <p className="text-xs text-slate-400">
                Assign executive course managers to each event, manage enrolled students, and edit event parameters.
              </p>
            </div>

            <button
              onClick={openCreateEvent}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Launch New Challenge Event</span>
            </button>
          </div>

          {/* Active Event Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((ev) => {
              const isSelected = ev.id === activeEvent?.id;
              const enrolled = participants.filter(p => p.eventId === ev.id).length;
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-navy-900 border-purple-500 shadow-xl shadow-purple-500/10'
                      : 'bg-navy-950/70 border-navy-800 hover:border-navy-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-purple-900/60 text-purple-300">
                      {ev.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {formatNaira(ev.startingCapital)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2 truncate">{ev.title}</h3>

                  <div className="mt-3 pt-2 border-t border-navy-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500">Course Manager:</span>
                      <div className="font-bold text-gold-400 text-[11px] truncate max-w-[130px]">
                        {ev.assignedManagerName || 'Unassigned'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500">Students:</span>
                      <div className="font-bold text-white">{enrolled}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Management Panel for Selected Event */}
          {activeEvent && (
            <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-navy-800">
                <div>
                  <h3 className="text-base font-black text-white">
                    Managing: {activeEvent.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{activeEvent.description}</p>
                </div>

                {/* Manager Reassignment Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold shrink-0">Assigned Manager:</span>
                  <select
                    value={activeEvent.assignedManagerId || ''}
                    onChange={(e) => handleAssignManager(e.target.value)}
                    className="bg-navy-950 border border-purple-500/50 text-gold-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none font-bold"
                  >
                    <option value="">Select Qualified Manager...</option>
                    {availableManagers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.role})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      const res = exportEventGradebookCSV(activeEvent, participants.filter(p => p.eventId === activeEvent.id), users);
                      if (res.success) {
                        setNotification({
                          success: true,
                          message: `Gradebook successfully exported (${res.count} students) to ${res.filename}`
                        });
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all border border-emerald-400/40"
                    title="Export complete event student roster and gradebook to CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Gradebook (CSV)</span>
                  </button>

                  <button
                    onClick={() => openEditEvent(activeEvent)}
                    className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700"
                    title="Edit Event Rules"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteEvent(activeEvent)}
                    className="p-1.5 rounded-lg bg-navy-800 hover:bg-bear text-slate-400 hover:text-white border border-navy-700"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add Student into this Event */}
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-purple-400" />
                    <span>Direct Student Enrollment</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Add any student to this event with ₦{activeEvent.startingCapital.toLocaleString()} event capital allocation.
                  </p>
                </div>

                <form onSubmit={handleEnrollStudentInEvent} className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={studentToEnrollId}
                    onChange={(e) => setStudentToEnrollId(e.target.value)}
                    className="bg-navy-900 border border-navy-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 w-full md:w-60 font-semibold"
                  >
                    <option value="">Select Student to Enroll...</option>
                    {unenrolledStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.rankTier})
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={!studentToEnrollId}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-navy-800 disabled:text-slate-600 text-white font-black text-xs transition-all shrink-0"
                  >
                    Enroll
                  </button>
                </form>
              </div>

              {/* Active Participants in this Event */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Enrolled Students ({activeEventParticipants.length})
                </h4>

                <div className="divide-y divide-navy-800 bg-navy-950/60 rounded-xl border border-navy-800 text-xs">
                  {activeEventParticipants.map(p => (
                    <div key={p.id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">{p.userFullName}</span>
                        <span className="text-slate-400 ml-2 font-mono text-[11px]">{p.userHandle}</span>
                        <div className="text-[10px] text-gold-400 mt-0.5">
                          Portfolio: {formatNaira(p.portfolioValue)} • ROI: {p.roiPercentage.toFixed(2)}%
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-navy-800 font-mono font-bold text-purple-300">
                          Rank #{p.currentRank}
                        </span>

                        <button
                          onClick={() => handleRemoveStudentFromEvent(p)}
                          className="px-2 py-1 rounded bg-navy-800 hover:bg-bear hover:text-white text-slate-400 text-[11px] font-bold border border-navy-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. TAB: MACRO SIMULATION & WHATSAPP HEADLINE HUB     */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'SIMULATION' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                <span>Macroeconomic Simulation & WhatsApp News Engine</span>
              </h2>
              <p className="text-xs text-slate-400">
                Broadcast breaking regulatory circulars, earnings surges, and OPEC+ macro events to shift prices and generate formatted WhatsApp community broadcasts.
              </p>
            </div>
          </div>

          {/* Quick All-Share Index & Stock Movers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Quick Sector Index Shift */}
            <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gold-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Direct Sector All-Share Index Shift
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Directly adjust all stocks belonging to an NGX sector industry by a specific percentage.
              </p>

              <form onSubmit={handleQuickSectorShift} className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Target Sector</label>
                    <select
                      value={shiftSector}
                      onChange={(e) => setShiftSector(e.target.value as NGXSector)}
                      className="w-full px-2.5 py-1.5 bg-navy-950 border border-navy-700 rounded-lg text-white font-bold"
                    >
                      <option value="Financial Services">Financial Services</option>
                      <option value="ICT & Telecommunications">ICT & Telecommunications</option>
                      <option value="Industrial Goods">Industrial Goods</option>
                      <option value="Consumer Goods">Consumer Goods</option>
                      <option value="Oil & Gas">Oil & Gas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Shift Delta (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={shiftDelta}
                      onChange={(e) => setShiftDelta(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-navy-950 border border-navy-700 rounded-lg text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Reason / Rationale</label>
                  <input
                    type="text"
                    value={shiftReason}
                    onChange={(e) => setShiftReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-navy-950 border border-navy-700 rounded-lg text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-gold-400 font-bold text-xs transition-all border border-gold-500/30"
                >
                  Apply Sector Shift
                </button>
              </form>
            </div>

            {/* Quick Single Stock Shift */}
            <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Direct Stock Price Adjustment
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Manually shift a single equity price to simulate custom news shocks.
              </p>

              <form onSubmit={handleQuickStockShift} className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Ticker</label>
                    <select
                      value={shiftTicker}
                      onChange={(e) => setShiftTicker(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-navy-950 border border-navy-700 rounded-lg text-white font-mono font-bold"
                    >
                      <option value="ZENITHBANK">ZENITHBANK</option>
                      <option value="GTCO">GTCO</option>
                      <option value="MTNN">MTNN</option>
                      <option value="DANGCEM">DANGCEM</option>
                      <option value="SEPLAT">SEPLAT</option>
                      <option value="AIRTELAFRI">AIRTELAFRI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Delta (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={shiftTickerDelta}
                      onChange={(e) => setShiftTickerDelta(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-navy-950 border border-navy-700 rounded-lg text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Reason / Rationale</label>
                  <input
                    type="text"
                    value={shiftTickerReason}
                    onChange={(e) => setShiftTickerReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-navy-950 border border-navy-700 rounded-lg text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-navy-800 hover:bg-purple-500 hover:text-white text-purple-300 font-bold text-xs transition-all border border-purple-500/40"
                >
                  Apply Stock Price Delta
                </button>
              </form>
            </div>
          </div>

          {/* Full Simulation News & WhatsApp Dispatcher */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form */}
            <div className="lg:col-span-7 bg-navy-900 border border-navy-700/80 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" />
                  <span>Publish News Disclosure & Trigger Market Reaction</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sources with higher credibility (Regulatory 100%) have immediate price shocks; Influencer sources (35%) trigger high-volatility speculation.
                </p>
              </div>

              <form onSubmit={handlePublishSimulation} className="space-y-3.5 text-xs">
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Target Scope</label>
                    <select
                      value={simScope}
                      onChange={(e) => setSimScope(e.target.value as NewsScope)}
                      className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-bold"
                    >
                      <option value="GLOBAL">🌐 Global (Entire NGX Universe)</option>
                      <option value="EVENT">🏆 Specific Cohort Event Only</option>
                    </select>
                  </div>

                  {simScope === 'EVENT' && (
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Select Event</label>
                      <select
                        value={simEventId}
                        onChange={(e) => setSimEventId(e.target.value)}
                        className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-gold-400 font-bold"
                      >
                        {events.map(e => (
                          <option key={e.id} value={e.id}>{e.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Breaking News Headline</label>
                  <input
                    type="text"
                    required
                    value={simHeadline}
                    onChange={(e) => setSimHeadline(e.target.value)}
                    placeholder="e.g. SEC Nigeria Approves Tier-1 Recapitalization Capital Calls"
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Intelligence Summary & Economic Thesis</label>
                  <textarea
                    rows={3}
                    required
                    value={simSummary}
                    onChange={(e) => setSimSummary(e.target.value)}
                    placeholder="State key financial ratios, foreign exchange implications, and dividend impacts..."
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Source Attribution</label>
                    <input
                      type="text"
                      value={simSource}
                      onChange={(e) => setSimSource(e.target.value)}
                      className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Source Credibility Tier</label>
                    <select
                      value={simCredibility}
                      onChange={(e) => setSimCredibility(e.target.value as NewsSourceCredibility)}
                      className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-gold-400 font-bold"
                    >
                      <option value="OFFICIAL_REGULATORY">Official Regulatory (100% Impact)</option>
                      <option value="INSTITUTIONAL_MEDIA">Institutional Press (80% Impact)</option>
                      <option value="MARKET_ANALYST">Research Analyst (65% Impact)</option>
                      <option value="SOCIAL_INFLUENCER">Social / Rumor (35% Volatility)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Persona Name</label>
                    <input
                      type="text"
                      value={simPersona}
                      onChange={(e) => setSimPersona(e.target.value)}
                      placeholder="e.g. Dr. Emomotimi Agama"
                      className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Persona Title</label>
                    <input
                      type="text"
                      value={simTitle}
                      onChange={(e) => setSimTitle(e.target.value)}
                      placeholder="e.g. Director General, SEC Nigeria"
                      className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Category</label>
                    <select
                      value={simCategory}
                      onChange={(e) => setSimCategory(e.target.value as MarketSimulationCategory)}
                      className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-bold"
                    >
                      <option value="STOCK_SPECIFIC">Stock Specific</option>
                      <option value="SECTOR_INDEX">Sector Index</option>
                      <option value="DOMESTIC_MACRO">Domestic Macro (CBN/NGX)</option>
                      <option value="WORLD_MACRO">World Macro (OPEC+/Fed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Target Ticker</label>
                    <select
                      value={simTicker}
                      onChange={(e) => setSimTicker(e.target.value)}
                      className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-mono font-bold"
                    >
                      <option value="ZENITHBANK">ZENITHBANK</option>
                      <option value="GTCO">GTCO</option>
                      <option value="MTNN">MTNN</option>
                      <option value="DANGCEM">DANGCEM</option>
                      <option value="SEPLAT">SEPLAT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Price Impact (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={simPriceImpact}
                      onChange={(e) => setSimPriceImpact(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Corporate Disclosure Data (Auto-Adjusts Stock EPS & Yield)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400">PAT Growth (% YoY)</label>
                      <input
                        type="number"
                        value={simPatGrowth || ''}
                        onChange={(e) => setSimPatGrowth(e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="e.g. 45"
                        className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">Proposed Dividend (₦/share)</label>
                      <input
                        type="number"
                        step="0.10"
                        value={simDividend || ''}
                        onChange={(e) => setSimDividend(e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="e.g. 3.50"
                        className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-navy-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish News Disclosure & Move Market</span>
                </button>
              </form>
            </div>

            {/* WhatsApp Community Dispatch Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#0b141a] border border-[#202c33] rounded-2xl p-5 shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#202c33] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-[#e9edef] uppercase tracking-wider">
                      WhatsApp Broadcast Headline
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyWhatsApp}
                      className="px-2.5 py-1 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-[#00a884] text-xs font-bold transition-all flex items-center gap-1"
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
                      <span>Share WA</span>
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#111b21] border border-[#202c33] text-[12px] font-mono text-[#d1d7db] leading-relaxed whitespace-pre-wrap max-h-[520px] overflow-y-auto shadow-inner select-all">
                  {generatedWhatsAppDraft || (
                    <span className="text-slate-500 italic">
                      Type a headline on the left to generate the ready-to-copy WhatsApp broadcast message...
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 text-center">
                  Formatted specifically for Naira Stock Academy student and cohort WhatsApp communities.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. TAB: SYSTEM AUDIT LOGS & GOVERNANCE HISTORY       */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'AUDIT' && (
        <div className="bg-navy-900 border border-navy-700/80 rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-navy-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                <span>Super Administrator Governance Audit Log</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Full chronological ledger of every change made by course managers, students, and system administrators.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="w-full pl-9 pr-3 py-1.5 bg-navy-950 border border-navy-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="divide-y divide-navy-800 text-xs">
            {auditLogs
              .filter(l => 
                l.description.toLowerCase().includes(auditSearch.toLowerCase()) ||
                l.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
                l.actionType.toLowerCase().includes(auditSearch.toLowerCase())
              )
              .map(log => (
                <div key={log.id} className="py-3.5 first:pt-1 space-y-1 hover:bg-navy-800/20 px-2 rounded-lg transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                        log.actionType.includes('ADD') ? 'bg-bull/20 text-bull border border-bull/30' :
                        log.actionType.includes('REMOVE') || log.actionType.includes('DELETE') ? 'bg-bear/20 text-bear border border-bear/30' :
                        log.actionType.includes('NEWS') || log.actionType.includes('POST') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        'bg-purple-900/60 text-purple-300 border border-purple-500/40'
                      }`}>
                        {log.actionType}
                      </span>
                      {log.eventTitle && (
                        <span className="text-[11px] text-gold-400 font-semibold truncate max-w-[200px]">
                          [{log.eventTitle}]
                        </span>
                      )}
                    </div>

                    <span className="text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-slate-100 font-medium leading-relaxed">
                    {log.description}
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Actor: <strong className="text-white">{log.actorName}</strong> ({log.actorRole})</span>
                    {log.targetUserName && (
                      <>
                        <span>•</span>
                        <span>Target: <strong className="text-gold-300">{log.targetUserName}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-navy-900 border border-purple-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <h3 className="text-base font-black text-white">Edit Member: {editingUser.fullName}</h3>
            
            <form onSubmit={handleSaveUserEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-semibold"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Academy XP</label>
                  <input
                    type="number"
                    value={editXp}
                    onChange={(e) => setEditXp(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Rank Tier</label>
                  <select
                    value={editRank}
                    onChange={(e) => setEditRank(e.target.value as RankTier)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
                  >
                    <option value="Novice Observer">Novice Observer</option>
                    <option value="Junior Analyst">Junior Analyst</option>
                    <option value="Portfolio Strategist">Portfolio Strategist</option>
                    <option value="Chartered Contender">Chartered Contender</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Challenge Event Modal */}
      {isCreateEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-navy-900 border border-purple-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-white">
              {editingEvent ? `Edit Event: ${editingEvent.title}` : 'Launch New Challenge Event'}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Challenge Title</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Q4 NGX Alpha Sprint"
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Description & Rules</label>
                <textarea
                  rows={2}
                  required
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Describe focus, sector limits, and graduation criteria..."
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Assigned Course Manager</label>
                <select
                  value={eventManagerId}
                  onChange={(e) => setEventManagerId(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-gold-400 font-bold"
                >
                  {availableManagers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Virtual Capital (₦)</label>
                  <input
                    type="number"
                    step="100000"
                    value={eventCapital}
                    onChange={(e) => setEventCapital(parseFloat(e.target.value) || 2000000)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Entry Fee (XP)</label>
                  <input
                    type="number"
                    value={eventFee}
                    onChange={(e) => setEventFee(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
                <div className="text-[11px] font-bold text-gold-400 uppercase tracking-wider">
                  Composite Score Weighting Formula (Must equal 100%)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400">ROI %</label>
                    <input
                      type="number"
                      step="0.05"
                      value={eventRoiWeight}
                      onChange={(e) => setEventRoiWeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Risk Discipline</label>
                    <input
                      type="number"
                      step="0.05"
                      value={eventDiscWeight}
                      onChange={(e) => setEventDiscWeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Research Points</label>
                    <input
                      type="number"
                      step="0.05"
                      value={eventResWeight}
                      onChange={(e) => setEventResWeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-navy-900 border border-navy-700 rounded text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateEventOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black"
                >
                  {editingEvent ? 'Save Event Updates' : 'Launch Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

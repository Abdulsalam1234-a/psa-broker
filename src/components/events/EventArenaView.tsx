import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChallengeEvent } from '../../types';
import { formatNaira } from '../../services/feeEngine';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

interface EventArenaViewProps {
  onEnterEventTrading: (eventId: string) => void;
  onViewLeaderboard: (eventId: string) => void;
}

export const EventArenaView: React.FC<EventArenaViewProps> = ({ 
  onEnterEventTrading, 
  onViewLeaderboard 
}) => {
  const { 
    events, 
    participants, 
    currentUser, 
    registerForEvent, 
    activeAccountId, 
    setActiveAccountId 
  } = useApp();

  const [selectedEventForModal, setSelectedEventForModal] = useState<ChallengeEvent | null>(null);
  const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isUserRegistered = (eventId: string) => {
    return participants.some(p => p.userId === currentUser.id && p.eventId === eventId);
  };

  const handleRegisterConfirm = () => {
    if (!selectedEventForModal) return;
    setModalMessage(null);

    const res = registerForEvent(selectedEventForModal.id);
    if (res.success) {
      setModalMessage({ type: 'success', text: res.message });
      setTimeout(() => {
        setSelectedEventForModal(null);
        setModalMessage(null);
        onEnterEventTrading(selectedEventForModal.id);
      }, 1500);
    } else {
      setModalMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40 text-xs font-bold tracking-wider uppercase">
            <Trophy className="w-3.5 h-3.5 text-gold-400" />
            <span>Naira Stock Academy Gated Challenge Arena</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Institutional Capital Arena & Gamified Tournaments
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Apply for dedicated challenge portfolios with up to ₦5,000,000 in virtual capital. Compete against peers across cohorts governed by the anti-gambling Composite Mastery Engine (balancing ROI, stop-loss discipline, and fundamental teardown theses).
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-gold-400">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>Your Academy XP: <strong>{currentUser.academyXp} pts</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-bull" />
              <span>Enforced Max 25% Concentration Cap</span>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-gold-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Events Listing Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Active & Upcoming Cohort Challenges
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {events.length} Competitions Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(ev => {
            const registered = isUserRegistered(ev.id);
            const isCurrentlyActiveAccount = activeAccountId === ev.id;
            const myStanding = participants.find(p => p.userId === currentUser.id && p.eventId === ev.id);

            return (
              <div 
                key={ev.id}
                className={`bg-navy-900/90 border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all hover:scale-[1.01] ${
                  registered 
                    ? 'border-gold-500/50 shadow-gold-500/10' 
                    : 'border-navy-700/80'
                }`}
              >
                <div className="space-y-3">
                  {/* Status & Entry Fee Pill */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                      ev.status === 'ACTIVE' 
                        ? 'bg-bull/20 text-bull border border-bull/40' 
                        : 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                    }`}>
                      {ev.status}
                    </span>

                    <span className="text-xs font-semibold text-gold-400 font-mono flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {ev.entryFeeTokens === 0 ? 'Free Entry' : `${ev.entryFeeTokens} XP Tokens`}
                    </span>
                  </div>

                  {/* Title & Host */}
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                      {ev.title}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Organized by <strong className="text-slate-200">{ev.createdByName}</strong>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {ev.description}
                  </p>

                  {/* Allocation & Parameters Grid */}
                  <div className="p-3 bg-navy-950/70 rounded-xl border border-navy-800 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Virtual Capital:</span>
                      <strong className="text-white text-sm">{formatNaira(ev.startingCapital)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Participants:</span>
                      <strong className="text-slate-200 text-sm flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gold-400" />
                        {ev.participantsCount}
                      </strong>
                    </div>
                  </div>

                  {/* Scoring Weights */}
                  <div className="space-y-1.5 text-[11px]">
                    <div className="text-slate-400 font-semibold uppercase text-[10px]">
                      Mastery Score Weights:
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-center font-mono">
                      <div className="bg-navy-800/80 p-1 rounded border border-navy-700">
                        <span className="text-slate-400 block text-[9px]">ROI</span>
                        <strong className="text-gold-300">{(ev.weightRoi * 100).toFixed(0)}%</strong>
                      </div>
                      <div className="bg-navy-800/80 p-1 rounded border border-navy-700">
                        <span className="text-slate-400 block text-[9px]">Discipline</span>
                        <strong className="text-bull">{(ev.weightDiscipline * 100).toFixed(0)}%</strong>
                      </div>
                      <div className="bg-navy-800/80 p-1 rounded border border-navy-700">
                        <span className="text-slate-400 block text-[9px]">Research</span>
                        <strong className="text-slate-200">{(ev.weightResearch * 100).toFixed(0)}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Registered User Standing Preview */}
                  {myStanding && (
                    <div className="p-2.5 bg-gold-500/10 border border-gold-500/30 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Your Current Standings:</span>
                        <strong className="text-gold-400 font-mono">
                          Rank #{myStanding.currentRank} ({myStanding.compositeScore.toFixed(1)} pts)
                        </strong>
                      </div>
                      <span className={`font-mono text-xs font-bold ${myStanding.roiPercentage >= 0 ? 'text-bull' : 'text-bear'}`}>
                        {myStanding.roiPercentage >= 0 ? '+' : ''}{myStanding.roiPercentage.toFixed(2)}% ROI
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-navy-800/80 flex items-center gap-2">
                  {registered ? (
                    <>
                      <button
                        onClick={() => {
                          setActiveAccountId(ev.id);
                          onEnterEventTrading(ev.id);
                        }}
                        className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                          isCurrentlyActiveAccount
                            ? 'bg-bull text-navy-950 font-black'
                            : 'bg-gold-500 hover:bg-gold-400 text-navy-950 font-black'
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                        <span>{isCurrentlyActiveAccount ? 'Active Account (Trade)' : 'Switch to Account'}</span>
                      </button>
                      <button
                        onClick={() => onViewLeaderboard(ev.id)}
                        className="py-2.5 px-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 font-bold text-xs transition-colors"
                        title="View Event Leaderboard"
                      >
                        <Trophy className="w-4 h-4 text-gold-400" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setSelectedEventForModal(ev)}
                      disabled={ev.status === 'UPCOMING'}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                        ev.status === 'UPCOMING'
                          ? 'bg-navy-800 text-slate-500 cursor-not-allowed border border-navy-700'
                          : 'bg-gold-500 hover:bg-gold-400 text-navy-950 font-extrabold shadow-gold-500/20'
                      }`}
                    >
                      <span>{ev.status === 'UPCOMING' ? 'Opens Soon' : 'Apply for Capital & Register'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Registration & Fund Application Modal */}
      {selectedEventForModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border-2 border-gold-500/70 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-navy-700 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-500/40 uppercase tracking-wider">
                  Event Fund Allocation
                </span>
                <div className="text-lg font-bold text-white mt-1">
                  {selectedEventForModal.title}
                </div>
              </div>
              <button
                onClick={() => { setSelectedEventForModal(null); setModalMessage(null); }}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                By entering this event, a dedicated virtual trading account will be created specifically for you with the starting capital below. All trades executed in this challenge are isolated from your standard sandbox account.
              </p>

              <div className="p-3.5 bg-navy-950 rounded-xl border border-navy-800 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Allocated Virtual Funds:</span>
                  <span className="font-bold text-white text-sm">{formatNaira(selectedEventForModal.startingCapital)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entry Token Requirement:</span>
                  <span className="font-bold text-gold-400">{selectedEventForModal.entryFeeTokens} Academy XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Your Current XP Balance:</span>
                  <span className="text-slate-200">{currentUser.academyXp} XP</span>
                </div>
                <div className="flex justify-between border-t border-navy-800 pt-1 text-slate-300">
                  <span>Balance After Registration:</span>
                  <span className="font-bold text-gold-300">{currentUser.academyXp - selectedEventForModal.entryFeeTokens} XP</span>
                </div>
              </div>

              {/* Tournament Discipline Rules */}
              <div className="p-3 bg-navy-800/80 rounded-xl border border-navy-700 space-y-1.5 text-slate-300">
                <span className="font-semibold text-gold-400 block">Competition Rules:</span>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-bull" />
                  <span>Maximum position concentration: <strong>25% of portfolio</strong>.</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-bull" />
                  <span>Attaching Stop-Losses earns +10 discipline bonus.</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-bull" />
                  <span>Submitting trade theses boosts Research Points up to 100.</span>
                </div>
              </div>

              {modalMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  modalMessage.type === 'success'
                    ? 'bg-bull/20 text-bull border border-bull/40'
                    : 'bg-bear/20 text-bear border border-bear/40'
                }`}>
                  {modalMessage.text}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setSelectedEventForModal(null); setModalMessage(null); }}
                className="flex-1 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegisterConfirm}
                className="flex-1 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
              >
                Accept Terms & Fund Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

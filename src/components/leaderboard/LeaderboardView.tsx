import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../services/feeEngine';
import { EventParticipant } from '../../types';
import { 
  Trophy, 
  Award, 
  Medal, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle,
  ChevronUp,
  Layers,
  ArrowUp
} from 'lucide-react';

interface LeaderboardViewProps {
  initialEventId?: string;
  onTradeNow: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ initialEventId, onTradeNow }) => {
  const { events, participants, currentUser, users } = useApp();

  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialEventId || (events[0] ? events[0].id : 'event-ngx-championship')
  );
  const [searchQuery, setSearchQuery] = useState('');

  const currentEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId) || events[0];
  }, [events, selectedEventId]);

  // Participants for selected event, sorted by currentRank
  const eventParticipants = useMemo(() => {
    let list = participants.filter(p => p.eventId === selectedEventId);
    list.sort((a, b) => a.currentRank - b.currentRank);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.userFullName.toLowerCase().includes(q) || 
        p.userHandle.toLowerCase().includes(q)
      );
    }

    return list;
  }, [participants, selectedEventId, searchQuery]);

  // Podium top 3
  const top1 = eventParticipants.find(p => p.currentRank === 1);
  const top2 = eventParticipants.find(p => p.currentRank === 2);
  const top3 = eventParticipants.find(p => p.currentRank === 3);

  // Current logged in user standing in this event
  const myStanding = useMemo(() => {
    return participants.find(p => p.userId === currentUser.id && p.eventId === selectedEventId);
  }, [participants, currentUser.id, selectedEventId]);

  // Next rank target points
  const pointsToNextRank = useMemo(() => {
    if (!myStanding || myStanding.currentRank <= 1) return null;
    const higherRank = participants.find(
      p => p.eventId === selectedEventId && p.currentRank === myStanding.currentRank - 1
    );
    if (!higherRank) return null;
    const diff = Number((higherRank.compositeScore - myStanding.compositeScore).toFixed(2));
    return {
      targetHandle: higherRank.userHandle,
      pointsDiff: Math.max(0.1, diff),
    };
  }, [myStanding, participants, selectedEventId]);

  return (
    <div className="space-y-6 pb-20">
      {/* Event Header & Selector */}
      <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-gold-400" />
              Dynamic Institutional Leaderboard
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1">
            {currentEvent ? currentEvent.title : 'Competition Standings'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Rankings governed by Composite Mastery: {((currentEvent?.weightRoi || 0.4) * 100).toFixed(0)}% Risk-Adjusted ROI, {((currentEvent?.weightDiscipline || 0.35) * 100).toFixed(0)}% Discipline, {((currentEvent?.weightResearch || 0.25) * 100).toFixed(0)}% Research Theses.
          </p>
        </div>

        {/* Event Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full md:w-auto bg-navy-800 border border-navy-600 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-gold-400"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.participantsCount} participants)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Silver (2nd) */}
        {top2 && (
          <div className="order-2 md:order-1 bg-gradient-to-b from-navy-850 to-navy-900 border border-slate-400/40 rounded-2xl p-5 shadow-xl flex flex-col items-center text-center space-y-2 relative overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-slate-300 text-navy-950 font-black text-sm flex items-center justify-center shadow-md">
              2nd
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-300 shadow-md">
              <img 
                src={users.find(u => u.id === top2.userId)?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'} 
                alt={top2.userFullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-white text-base">{top2.userFullName}</div>
              <div className="text-xs text-slate-400">{top2.userHandle}</div>
            </div>
            <div className="p-2 w-full bg-navy-950/70 rounded-xl border border-navy-800 font-mono text-xs">
              <div className="text-slate-400 text-[10px] uppercase">Composite Score</div>
              <div className="text-lg font-black text-slate-200">{top2.compositeScore.toFixed(2)} pts</div>
              <div className={`text-xs font-semibold ${top2.roiPercentage >= 0 ? 'text-bull' : 'text-bear'}`}>
                {top2.roiPercentage >= 0 ? '+' : ''}{top2.roiPercentage.toFixed(2)}% ROI
              </div>
            </div>
          </div>
        )}

        {/* Gold (1st) */}
        {top1 && (
          <div className="order-1 md:order-2 bg-gradient-to-b from-navy-800 to-navy-900 border-2 border-gold-500 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-2.5 relative overflow-hidden scale-102">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600" />
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-navy-950 font-black text-base flex items-center justify-center shadow-lg animate-bounce">
              <Trophy className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold-400 shadow-lg">
              <img 
                src={users.find(u => u.id === top1.userId)?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120'} 
                alt={top1.userFullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-extrabold text-white text-lg flex items-center justify-center gap-1.5">
                <span>{top1.userFullName}</span>
                <Medal className="w-4 h-4 text-gold-400" />
              </div>
              <div className="text-xs text-gold-400 font-semibold">{top1.userHandle} • {top1.rankTier}</div>
            </div>
            <div className="p-3 w-full bg-navy-950 rounded-xl border border-gold-500/40 font-mono text-xs shadow-inner">
              <div className="text-slate-400 text-[10px] uppercase font-sans">Champion Score</div>
              <div className="text-2xl font-black text-gold-400">{top1.compositeScore.toFixed(2)} pts</div>
              <div className={`text-xs font-bold ${top1.roiPercentage >= 0 ? 'text-bull' : 'text-bear'}`}>
                {top1.roiPercentage >= 0 ? '+' : ''}{top1.roiPercentage.toFixed(2)}% ROI ({formatNaira(top1.portfolioValue)})
              </div>
            </div>
          </div>
        )}

        {/* Bronze (3rd) */}
        {top3 && (
          <div className="order-3 bg-gradient-to-b from-navy-850 to-navy-900 border border-amber-700/50 rounded-2xl p-5 shadow-xl flex flex-col items-center text-center space-y-2 relative overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow-md">
              3rd
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-700 shadow-md">
              <img 
                src={users.find(u => u.id === top3.userId)?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'} 
                alt={top3.userFullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-white text-base">{top3.userFullName}</div>
              <div className="text-xs text-slate-400">{top3.userHandle}</div>
            </div>
            <div className="p-2 w-full bg-navy-950/70 rounded-xl border border-navy-800 font-mono text-xs">
              <div className="text-slate-400 text-[10px] uppercase">Composite Score</div>
              <div className="text-lg font-black text-amber-300">{top3.compositeScore.toFixed(2)} pts</div>
              <div className={`text-xs font-semibold ${top3.roiPercentage >= 0 ? 'text-bull' : 'text-bear'}`}>
                {top3.roiPercentage >= 0 ? '+' : ''}{top3.roiPercentage.toFixed(2)}% ROI
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search & Full Roster Table */}
      <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-navy-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search participants by handle or name..."
              className="w-full bg-navy-800 border border-navy-600 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-gold-500 font-medium"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {eventParticipants.length} Competitors Ranked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-navy-700/60 bg-navy-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-4">Student Participant</th>
                <th className="py-3 px-4 text-right">Composite Score</th>
                <th className="py-3 px-4 text-right">ROI % (Drawdown)</th>
                <th className="py-3 px-4 text-center">Discipline Audit</th>
                <th className="py-3 px-4 text-center">Research</th>
                <th className="py-3 px-4 text-right">Portfolio Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/40">
              {eventParticipants.map(participant => {
                const isMe = participant.userId === currentUser.id;
                const isRankUp = participant.rankDelta > 0;
                const isRankDown = participant.rankDelta < 0;

                return (
                  <tr 
                    key={participant.id}
                    className={`transition-colors ${
                      isMe 
                        ? 'bg-gold-500/10 hover:bg-gold-500/15 font-semibold' 
                        : 'hover:bg-navy-800/50'
                    }`}
                  >
                    {/* Rank & Movement Arrow */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 font-mono font-bold text-sm">
                        <span className={
                          participant.currentRank === 1 ? 'text-gold-400' :
                          participant.currentRank === 2 ? 'text-slate-300' :
                          participant.currentRank === 3 ? 'text-amber-400' :
                          'text-slate-400'
                        }>
                          #{participant.currentRank}
                        </span>

                        {isRankUp && (
                          <span className="text-bull text-[10px] flex items-center font-bold" title={`Moved up ${participant.rankDelta} positions`}>
                            <TrendingUp className="w-3 h-3" />
                            +{participant.rankDelta}
                          </span>
                        )}
                        {isRankDown && (
                          <span className="text-bear text-[10px] flex items-center font-bold" title={`Dropped ${Math.abs(participant.rankDelta)} positions`}>
                            <TrendingDown className="w-3 h-3" />
                            {participant.rankDelta}
                          </span>
                        )}
                        {!isRankUp && !isRankDown && (
                          <Minus className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                    </td>

                    {/* Participant Handle & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-navy-600 shrink-0">
                          <img 
                            src={users.find(u => u.id === participant.userId)?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'} 
                            alt={participant.userFullName} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{participant.userFullName}</span>
                            {isMe && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-gold-500 text-navy-950 font-extrabold uppercase">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {participant.userHandle} • {participant.rankTier}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Composite Mastery Score */}
                    <td className="py-3 px-4 text-right font-mono">
                      <div className="text-base font-black text-gold-400">
                        {participant.compositeScore.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">out of 100 pts</div>
                    </td>

                    {/* ROI & Max Drawdown */}
                    <td className="py-3 px-4 text-right font-mono">
                      <div className={`font-bold ${participant.roiPercentage >= 0 ? 'text-bull' : 'text-bear'}`}>
                        {participant.roiPercentage >= 0 ? '+' : ''}{participant.roiPercentage.toFixed(2)}%
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Max DD: {participant.maxDrawdownPct.toFixed(1)}%
                      </div>
                    </td>

                    {/* Discipline Audit Badges */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          participant.disciplineScore >= 80 
                            ? 'bg-bull/20 text-bull border border-bull/40' 
                            : 'bg-bear/20 text-bear border border-bear/40'
                        }`}>
                          {participant.disciplineScore.toFixed(0)} pts
                        </span>

                        {participant.violationsCount > 0 ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-bear/20 text-bear font-mono" title={`${participant.violationsCount} concentration violations`}>
                            ⚠️ {participant.violationsCount} Violations
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-bull/15 text-bull font-mono" title="Zero risk parameter violations">
                            ✓ Compliant
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Research Theses */}
                    <td className="py-3 px-4 text-center font-mono">
                      <div className="font-bold text-slate-200">
                        {participant.thesesCount} Theses
                      </div>
                      <div className="text-[10px] text-gold-400">
                        {participant.researchPoints.toFixed(0)} pts
                      </div>
                    </td>

                    {/* Total Portfolio Value */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                      {formatNaira(participant.portfolioValue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Bottom "My Position" Bar */}
      {myStanding && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-navy-950/95 backdrop-blur-md border-t-2 border-gold-500/80 px-4 py-3 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-500 text-navy-950 font-black text-sm flex items-center justify-center">
                #{myStanding.currentRank}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Your Current Rank: <strong>#{myStanding.currentRank}</strong></span>
                  <span className="text-slate-400">•</span>
                  <span className="text-gold-400 font-mono">{myStanding.compositeScore.toFixed(2)} pts</span>
                </div>
                {pointsToNextRank && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ArrowUp className="w-3 h-3 text-bull" />
                    <span>Need <strong className="text-bull font-mono">{pointsToNextRank.pointsDiff} pts</strong> to overtake {pointsToNextRank.targetHandle}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right font-mono text-xs">
                <div className="text-slate-400">Portfolio Return:</div>
                <div className={`font-bold ${myStanding.roiPercentage >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {myStanding.roiPercentage >= 0 ? '+' : ''}{myStanding.roiPercentage.toFixed(2)}%
                </div>
              </div>

              <button
                onClick={onTradeNow}
                className="py-2 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-extrabold text-xs uppercase tracking-wider transition-colors shadow-lg"
              >
                Trade to Boost Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

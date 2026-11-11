import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../services/feeEngine';
import { 
  Award, 
  Sparkles, 
  ShieldCheck, 
  Trophy, 
  RotateCcw, 
  CheckCircle2, 
  ExternalLink,
  Briefcase
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, userAccounts, participants, resetAllData } = useApp();

  if (!isOpen) return null;

  // Determine progress towards next rank tier
  const xp = currentUser.academyXp;
  let nextTier = 'Chartered Contender';
  let targetXp = 1000;
  let prevTierXp = 400;

  if (xp < 200) {
    nextTier = 'Junior Analyst';
    targetXp = 200;
    prevTierXp = 0;
  } else if (xp < 400) {
    nextTier = 'Portfolio Strategist';
    targetXp = 400;
    prevTierXp = 200;
  } else if (xp < 1000) {
    nextTier = 'Chartered Contender';
    targetXp = 1000;
    prevTierXp = 400;
  } else {
    nextTier = 'Chartered Master (Max)';
    targetXp = 1000;
    prevTierXp = 1000;
  }

  const progressPct = Math.min(100, Math.max(0, ((xp - prevTierXp) / (targetXp - prevTierXp)) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navy-900 border-2 border-gold-500/70 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-navy-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-gold-400 shadow-md">
              <img 
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'} 
                alt={currentUser.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{currentUser.fullName}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  currentUser.role === 'ADMIN' ? 'bg-purple-900/60 text-purple-300' :
                  currentUser.role === 'MANAGER' ? 'bg-gold-500/20 text-gold-300' :
                  'bg-navy-700 text-slate-300'
                }`}>
                  {currentUser.role}
                </span>
              </h2>
              <div className="text-xs text-gold-400 font-mono">{currentUser.handle}</div>
              <div className="text-[11px] text-slate-400">{currentUser.email} • {currentUser.phoneNumber}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Academy XP & Progression Tier */}
        <div className="p-4 bg-navy-950 rounded-2xl border border-gold-500/30 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
              Rank Progression Tier
            </span>
            <span className="font-bold text-gold-400 font-mono text-sm">{currentUser.rankTier}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-navy-800 rounded-full h-3 overflow-hidden border border-navy-700">
            <div 
              className="bg-gradient-to-r from-gold-500 to-gold-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Current: <strong>{xp} XP</strong></span>
            <span>Next: <strong>{targetXp} XP ({nextTier})</strong></span>
          </div>
        </div>

        {/* Risk Discipline & Achievement Badges */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Discipline & Achievement Badges
          </span>
          <div className="flex flex-wrap gap-2">
            {currentUser.badges.map((badge, i) => (
              <span 
                key={i}
                className="px-3 py-1 rounded-xl bg-navy-800 border border-gold-500/30 text-gold-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Award className="w-3.5 h-3.5 text-gold-400" />
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Active Accounts & Events Portfolio */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            My Portfolio Accounts ({userAccounts.length})
          </span>
          <div className="space-y-2">
            {userAccounts.map(acc => (
              <div 
                key={acc.id}
                className="p-3 bg-navy-950/60 rounded-xl border border-navy-800 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="font-bold text-white font-sans">{acc.name}</div>
                  <div className="text-[11px] text-slate-400">
                    Cash: {formatNaira(acc.cashBalance)} • {acc.positions.length} Positions
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gold-400">{formatNaira(acc.portfolioValue)}</div>
                  <div className={`text-[10px] ${acc.totalReturn >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {acc.totalReturn >= 0 ? '+' : ''}{acc.totalReturnPct.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-navy-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Reset demo state to initial seed data?')) {
                resetAllData();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-bear transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

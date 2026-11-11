import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommunityThesis, ThesisComment, StudentCertificate } from '../../types';
import { formatNaira } from '../../services/feeEngine';
import { 
  MessageSquare, 
  ThumbsUp, 
  Award, 
  Send, 
  Filter, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Printer, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  User, 
  FileCheck2, 
  X,
  Share2
} from 'lucide-react';

interface TradingFloorViewProps {
  onSelectStock?: (ticker: string) => void;
}

export const TradingFloorView: React.FC<TradingFloorViewProps> = ({ onSelectStock }) => {
  const { 
    currentUser, 
    stocks, 
    communityTheses, 
    upvoteThesis, 
    addThesisComment, 
    publishThesis 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'feed' | 'certificate'>('feed');
  const [filterTag, setFilterTag] = useState<'ALL' | 'MENTOR' | 'BUY' | 'SELL'>('ALL');
  const [searchTicker, setSearchTicker] = useState<string>('');
  
  // New Thesis Composer State
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [newTicker, setNewTicker] = useState<string>('ZENITHBANK');
  const [newSide, setNewSide] = useState<'BUY' | 'SELL'>('BUY');
  const [newThesisText, setNewThesisText] = useState<string>('');
  const [newMetricHighlight, setNewMetricHighlight] = useState<string>('P/E: 4.8x | Dividend Yield: 10.2%');

  // Comment input per thesis
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Filtered theses
  const filteredTheses = communityTheses.filter(t => {
    if (filterTag === 'MENTOR' && !t.isMentorApproved) return false;
    if (filterTag === 'BUY' && t.orderSide !== 'BUY') return false;
    if (filterTag === 'SELL' && t.orderSide !== 'SELL') return false;
    if (searchTicker.trim() && !t.ticker.toLowerCase().includes(searchTicker.toLowerCase())) return false;
    return true;
  });

  const handlePostThesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThesisText.trim()) return;

    const s = stocks.find(x => x.ticker === newTicker);
    publishThesis({
      ticker: newTicker,
      companyName: s?.name || newTicker,
      orderSide: newSide,
      price: s?.currentPrice || 0,
      thesisText: newThesisText,
      keyMetricHighlight: newMetricHighlight
    });

    setNewThesisText('');
    setIsComposerOpen(false);
  };

  const handleSendComment = (thesisId: string) => {
    const text = commentInputs[thesisId];
    if (!text || !text.trim()) return;

    addThesisComment(thesisId, text);
    setCommentInputs(prev => ({ ...prev, [thesisId]: '' }));
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-gold-500/30 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>Naira Stock Academy Cohort Trading Floor</span>
              </span>
              <span className="text-slate-400 text-xs">• Peer-Reviewed Investment Network</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              The Trading Floor & Cohort Theses
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Every trade in the Nigerian market requires a well-documented investment thesis. Publish your trade rationale, receive feedback from Dr. Adeyemi, and earn your Chartered Contender Certificate.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsComposerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs transition-all shadow-md flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Publish Trade Thesis</span>
            </button>
          </div>
        </div>

        {/* View Switcher: Feed vs Certificate */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-navy-800">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'feed'
                ? 'bg-gold-500 text-navy-950 shadow-md font-black'
                : 'bg-navy-800 text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Community Feed ({communityTheses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'certificate'
                ? 'bg-gold-500 text-navy-950 shadow-md font-black'
                : 'bg-navy-800 text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Chartered Contender Certificate</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. THESES FEED */}
      {/* ========================================================= */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-navy-900 border border-navy-750 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </span>
              <button
                onClick={() => setFilterTag('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filterTag === 'ALL' ? 'bg-gold-500 text-navy-950' : 'bg-navy-800 text-slate-300 hover:text-white'
                }`}
              >
                All Theses
              </button>
              <button
                onClick={() => setFilterTag('MENTOR')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  filterTag === 'MENTOR' ? 'bg-purple-600 text-white' : 'bg-navy-800 text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Dr. Adeyemi Endorsed</span>
              </button>
              <button
                onClick={() => setFilterTag('BUY')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filterTag === 'BUY' ? 'bg-bull text-white' : 'bg-navy-800 text-slate-300 hover:text-white'
                }`}
              >
                Long (BUY) Only
              </button>
              <button
                onClick={() => setFilterTag('SELL')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  filterTag === 'SELL' ? 'bg-bear text-white' : 'bg-navy-800 text-slate-300 hover:text-white'
                }`}
              >
                Short/Exit (SELL)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticker (e.g. GTCO)..."
                value={searchTicker}
                onChange={(e) => setSearchTicker(e.target.value)}
                className="bg-navy-950 border border-navy-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 font-mono"
              />
            </div>
          </div>

          {/* List of Theses */}
          <div className="space-y-4">
            {filteredTheses.map(thesis => {
              const hasUpvoted = thesis.upvotes.includes(currentUser.id);

              return (
                <div
                  key={thesis.id}
                  className="p-5 sm:p-6 rounded-2xl bg-navy-900 border border-navy-750 shadow-xl space-y-4"
                >
                  {/* Author Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500 to-navy-800 flex items-center justify-center font-bold text-white text-sm border border-gold-500/40">
                        {thesis.userFullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{thesis.userFullName}</span>
                          <span className="text-slate-400 text-xs font-mono">{thesis.userHandle}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-navy-800 text-gold-300 border border-gold-500/20 font-semibold">
                            {thesis.rankTier}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(thesis.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {thesis.isMentorApproved && (
                      <span className="px-2.5 py-1 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/40 text-[10px] font-bold flex items-center gap-1.5 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Mentor Certified Rationale</span>
                      </span>
                    )}
                  </div>

                  {/* Stock Position Callout */}
                  <div className="p-3 rounded-xl bg-navy-850 border border-navy-750 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        thesis.orderSide === 'BUY'
                          ? 'bg-bull/20 text-bull border border-bull/30'
                          : 'bg-bear/20 text-bear border border-bear/30'
                      }`}>
                        {thesis.orderSide} ORDER
                      </span>
                      <strong className="text-white text-sm">{thesis.ticker}</strong>
                      <span className="text-slate-400 font-sans">{thesis.companyName}</span>
                    </div>

                    {thesis.keyMetricHighlight && (
                      <div className="text-gold-300 text-[11px] font-mono">
                        {thesis.keyMetricHighlight}
                      </div>
                    )}
                  </div>

                  {/* Thesis Text */}
                  <div className="text-slate-200 text-xs sm:text-sm leading-relaxed font-sans">
                    {thesis.thesisText}
                  </div>

                  {/* Upvotes & Interactions */}
                  <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
                    <button
                      onClick={() => upvoteThesis(thesis.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        hasUpvoted
                          ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                          : 'bg-navy-800 hover:bg-navy-750 text-slate-300'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{thesis.upvotes.length} Upvotes</span>
                    </button>

                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{thesis.comments.length} Discussion Notes</span>
                    </div>
                  </div>

                  {/* Discussion Thread */}
                  {thesis.comments.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-navy-850">
                      {thesis.comments.map(comment => (
                        <div key={comment.id} className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-200 flex items-center gap-1.5">
                              <span>{comment.authorName}</span>
                              {comment.authorRole === 'ADMIN' && (
                                <span className="text-[9px] bg-purple-900/60 text-purple-300 px-1.5 py-0.2 rounded font-mono font-bold">
                                  CHIEF MENTOR
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-300 font-sans leading-relaxed">
                            {comment.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add institutional peer review or question..."
                      value={commentInputs[thesis.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [thesis.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendComment(thesis.id);
                        }
                      }}
                      className="flex-1 bg-navy-950 border border-navy-750 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                    />
                    <button
                      onClick={() => handleSendComment(thesis.id)}
                      className="p-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 transition-colors"
                      title="Post Comment"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CHARTERED CONTENDER CERTIFICATE GENERATOR */}
      {/* ========================================================= */}
      {activeTab === 'certificate' && (
        <div className="space-y-6">
          
          <div className="p-4 rounded-xl bg-navy-900 border border-navy-750 flex items-center justify-between gap-4 print:hidden">
            <div>
              <h3 className="font-bold text-white text-sm">Official Verification & Export</h3>
              <p className="text-xs text-slate-400">
                Print or save your high-resolution Certificate of Capital Market Proficiency accredited by Naira Stock Academy.
              </p>
            </div>

            <button
              onClick={handlePrintCertificate}
              className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs transition-all shadow-md flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>

          {/* Printable Diploma Layout */}
          <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-navy-900 via-navy-950 to-navy-900 border-4 border-double border-gold-500/60 shadow-2xl relative overflow-hidden print:m-0 print:border-4 print:border-amber-700 print:bg-white print:text-black">
            
            {/* Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <Award className="w-96 h-96 text-gold-400" />
            </div>

            <div className="relative z-10 text-center space-y-6">
              
              {/* Institutional Attribution Header */}
              <div className="space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-widest text-gold-400 print:text-amber-800 font-bold">
                  PSA INVESTMENT PROPERTY & NAIRA STOCK ACADEMY
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-white print:text-black tracking-wide uppercase">
                  Certificate of Capital Market Proficiency
                </h2>
                <div className="text-xs text-slate-400 print:text-gray-600 font-sans">
                  Issued in accordance with Nigerian Capital Market Educational Simulation Standards
                </div>
              </div>

              {/* Recipient */}
              <div className="py-4 border-y border-gold-500/30 print:border-amber-700/40">
                <div className="text-xs text-slate-400 print:text-gray-600 uppercase tracking-widest">
                  This is proudly presented to
                </div>
                <div className="text-3xl sm:text-4xl font-serif font-black text-gold-300 print:text-amber-900 mt-2">
                  {currentUser.fullName}
                </div>
                <div className="text-sm font-mono text-slate-300 print:text-gray-700 mt-1">
                  Candidate ID: {currentUser.handle} • Tier: {currentUser.rankTier}
                </div>
              </div>

              {/* Citation Body */}
              <div className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-300 print:text-gray-800 leading-relaxed font-sans">
                For demonstrating exceptional analytical competence, rigorous risk management discipline, 3-statement financial teardown proficiency, and sound equity allocation on the Nigerian Exchange (NGX) simulation terminal.
              </div>

              {/* Performance Badges */}
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto py-2">
                <div className="p-3 rounded-xl bg-navy-850/60 print:bg-gray-100 border border-gold-500/30">
                  <div className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-mono">Academy XP</div>
                  <div className="text-lg font-black text-gold-400 print:text-amber-800 font-mono">
                    {currentUser.academyXp.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-navy-850/60 print:bg-gray-100 border border-gold-500/30">
                  <div className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-mono">Risk Discipline</div>
                  <div className="text-lg font-black text-bull print:text-green-800 font-mono">
                    94/100
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-navy-850/60 print:bg-gray-100 border border-gold-500/30">
                  <div className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-mono">Settlement</div>
                  <div className="text-lg font-black text-white print:text-black font-mono">
                    T+1 NGX
                  </div>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <div className="font-serif italic text-base text-gold-300 print:text-black border-b border-slate-600 pb-1">
                    Dr. Femi Adeyemi, CFA
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600 mt-1">
                    Chief Academic Mentor, Naira Stock Academy
                  </div>
                </div>

                {/* Gold Seal Graphic */}
                <div className="w-20 h-20 rounded-full border-4 border-gold-400 print:border-amber-800 bg-gold-500/20 flex flex-col items-center justify-center p-2 text-center shadow-lg">
                  <ShieldCheck className="w-6 h-6 text-gold-400 print:text-amber-800" />
                  <span className="text-[7px] font-black uppercase text-gold-300 print:text-amber-900 mt-0.5">
                    VERIFIED
                  </span>
                </div>

                <div className="text-center sm:text-right">
                  <div className="font-serif italic text-base text-gold-300 print:text-black border-b border-slate-600 pb-1">
                    PSA Omnitech Systems
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-600 mt-1">
                    Principal Financial Systems Architect
                  </div>
                </div>
              </div>

              {/* Verification Hash */}
              <div className="pt-4 border-t border-navy-800 print:border-gray-300 text-[9px] font-mono text-slate-500 print:text-gray-500">
                VERIFICATION HASH: PSA-NSA-2026-{currentUser.id.toUpperCase()}-VERIFIED-NGX-SIM
              </div>

            </div>
          </div>

        </div>
      )}

      {/* New Thesis Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-navy-900 border border-gold-500/40 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-navy-800">
              <h3 className="font-bold text-white text-base">Publish Cohort Trade Thesis</h3>
              <button
                onClick={() => setIsComposerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostThesis} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Stock Ticker
                  </label>
                  <select
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-750 rounded-lg px-2.5 py-2 text-xs text-white font-mono"
                  >
                    {stocks.map(s => (
                      <option key={s.ticker} value={s.ticker}>
                        {s.ticker} (₦{s.currentPrice.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Order Side
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-navy-950 p-1 rounded-lg border border-navy-750">
                    <button
                      type="button"
                      onClick={() => setNewSide('BUY')}
                      className={`py-1 text-xs font-bold rounded ${newSide === 'BUY' ? 'bg-bull text-white' : 'text-slate-400'}`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSide('SELL')}
                      className={`py-1 text-xs font-bold rounded ${newSide === 'SELL' ? 'bg-bear text-white' : 'text-slate-400'}`}
                    >
                      SELL
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Key Valuation Highlight (Ratios / Metrics)
                </label>
                <input
                  type="text"
                  placeholder="e.g. P/E: 4.8x | Dividend Yield: 10.2% | Target: ₦62"
                  value={newMetricHighlight}
                  onChange={(e) => setNewMetricHighlight(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-750 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Detailed Investment Thesis
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain why this trade fits your portfolio strategy: macro factors, 3-statement analysis, cash flow robustness, catalysts..."
                  value={newThesisText}
                  onChange={(e) => setNewThesisText(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-750 rounded-lg px-3 py-2 text-xs text-white font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newThesisText.trim()}
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-navy-950 font-black text-xs transition-all shadow-md"
                >
                  Publish to Trading Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

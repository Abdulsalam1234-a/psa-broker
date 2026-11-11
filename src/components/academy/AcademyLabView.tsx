import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_RATIO_QUESTIONS } from '../../data/financialRatioQuestions';
import { INITIAL_ACADEMY_QUESTS } from '../../data/academyQuests';
import { soundFx } from '../../services/soundEffects';
import { formatNaira } from '../../services/feeEngine';
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  TrendingUp, 
  Compass, 
  Target, 
  Zap, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  BrainCircuit,
  BarChart2,
  PieChart,
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';

interface AcademyLabViewProps {
  onExploreStock?: (ticker: string) => void;
  onNavigateToTrade?: () => void;
}

export const AcademyLabView: React.FC<AcademyLabViewProps> = ({
  onExploreStock,
  onNavigateToTrade,
}) => {
  const { 
    currentUser, 
    stocks, 
    activeAccount, 
    awardStudentXp 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'ratios' | 'quests' | 'inspector'>('ratios');
  
  // Ratio Lab State
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [completedQuestionIds, setCompletedQuestionIds] = useState<string[]>([]);
  const [ratioFeedbackMessage, setRatioFeedbackMessage] = useState<string | null>(null);

  // Quests State
  const [claimedQuestIds, setClaimedQuestIds] = useState<string[]>([]);

  // Inspector State
  const [inspectorTicker, setInspectorTicker] = useState<string>('ZENITHBANK');

  const currentQuestion = INITIAL_RATIO_QUESTIONS[selectedQuestionIndex];
  const inspectedStock = stocks.find(s => s.ticker === inspectorTicker) || stocks[0];

  // Evaluate dynamic user progress on quests based on real account data
  const evaluatedQuests = useMemo(() => {
    const orders = activeAccount.orders || [];
    const positions = activeAccount.positions || [];

    // Sectors held
    const sectors = new Set<string>();
    positions.forEach(pos => {
      const s = stocks.find(x => x.ticker === pos.ticker);
      if (s) sectors.add(s.sector);
    });

    const hasStopLoss = orders.some(o => o.orderType === 'STOP_LOSS' || o.orderType === 'STOP_LIMIT');
    const hasTrades = orders.some(o => o.status === 'FILLED');
    const hasDividendBluechip = positions.some(p => {
      const s = stocks.find(x => x.ticker === p.ticker);
      return s && s.dividendYield >= 5.0;
    });

    return INITIAL_ACADEMY_QUESTS.map(quest => {
      let progress = 0;
      let isCompleted = false;

      if (quest.id === 'quest-first-trade') {
        progress = hasTrades ? 1 : 0;
        isCompleted = hasTrades;
      } else if (quest.id === 'quest-stop-loss') {
        progress = hasStopLoss ? 1 : 0;
        isCompleted = hasStopLoss;
      } else if (quest.id === 'quest-sector-diversity') {
        progress = Math.min(sectors.size, 3);
        isCompleted = sectors.size >= 3;
      } else if (quest.id === 'quest-financial-teardown') {
        // Can be auto-marked if user has visited terminal or clicked
        progress = 1;
        isCompleted = true;
      } else if (quest.id === 'quest-corporate-action') {
        progress = hasDividendBluechip ? 1 : 0;
        isCompleted = hasDividendBluechip;
      }

      return {
        ...quest,
        progress,
        isCompleted: isCompleted || claimedQuestIds.includes(quest.id),
      };
    });
  }, [activeAccount, stocks, claimedQuestIds]);

  // Handle Submit Answer in Ratio Lab
  const handleSubmitRatioAnswer = () => {
    if (!selectedOptionId || isAnswerSubmitted) return;

    const chosen = currentQuestion.options.find(o => o.id === selectedOptionId);
    setIsAnswerSubmitted(true);

    if (chosen?.isCorrect) {
      soundFx.playDividendCashChime();
      awardStudentXp(currentUser.id, currentQuestion.rewardXp);
      setCompletedQuestionIds(prev => [...prev, currentQuestion.id]);
      setRatioFeedbackMessage(`Correct! You earned +${currentQuestion.rewardXp} Academy XP.`);
    } else {
      setRatioFeedbackMessage('Incorrect. Review the formula hint below and try another question.');
    }
  };

  const handleNextQuestion = () => {
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setRatioFeedbackMessage(null);
    setSelectedQuestionIndex((prev) => (prev + 1) % INITIAL_RATIO_QUESTIONS.length);
  };

  const handleClaimQuest = (questId: string, xpReward: number) => {
    if (claimedQuestIds.includes(questId)) return;
    soundFx.playDividendCashChime();
    awardStudentXp(currentUser.id, xpReward);
    setClaimedQuestIds(prev => [...prev, questId]);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-gold-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>Naira Stock Academy Interactive Terminal</span>
              </span>
              <span className="text-slate-400 text-xs">• Cohort Masterclass</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Interactive Academy Lab & Quests
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Master fundamental Nigerian capital market ratios, complete progressive investment quests, and decode what really drives NGX equity price movements.
            </p>
          </div>

          {/* User XP Badge Card */}
          <div className="bg-navy-950/80 border border-gold-500/40 rounded-xl p-4 flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center border border-gold-500/40">
              <Award className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Current Academy XP
              </div>
              <div className="text-xl font-black text-gold-400 font-mono">
                {currentUser.academyXp.toLocaleString()} XP
              </div>
              <div className="text-xs text-slate-300 font-semibold mt-0.5 flex items-center gap-1">
                <span>Rank:</span>
                <span className="text-gold-300">{currentUser.rankTier}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs inside Academy */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-navy-800">
          <button
            onClick={() => setActiveSubTab('ratios')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'ratios'
                ? 'bg-gold-500 text-navy-950 shadow-md font-black'
                : 'bg-navy-800 text-slate-400 hover:text-white'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Financial Ratio Lab</span>
          </button>

          <button
            onClick={() => setActiveSubTab('quests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'quests'
                ? 'bg-gold-500 text-navy-950 shadow-md font-black'
                : 'bg-navy-800 text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Guided Quests ({evaluatedQuests.filter(q => q.isCompleted).length}/{evaluatedQuests.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('inspector')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'inspector'
                ? 'bg-gold-500 text-navy-950 shadow-md font-black'
                : 'bg-navy-800 text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>"Why Did the Stock Move?" Inspector</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. FINANCIAL RATIO LAB */}
      {/* ========================================================= */}
      {activeSubTab === 'ratios' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Question & Calculation Canvas */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-navy-900 border border-navy-750 rounded-2xl p-6 shadow-xl">
              
              <div className="flex items-center justify-between pb-4 border-b border-navy-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gold-400">
                    Question {selectedQuestionIndex + 1} of {INITIAL_RATIO_QUESTIONS.length}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-navy-800 text-slate-300 font-mono">
                    +{currentQuestion.rewardXp} XP Reward
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  {completedQuestionIds.length} / {INITIAL_RATIO_QUESTIONS.length} Mastered
                </div>
              </div>

              {/* Company & Topic */}
              <div className="mt-4">
                <div className="text-xs text-gold-400 uppercase font-mono tracking-wider">
                  {currentQuestion.ticker} • {currentQuestion.companyName}
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  {currentQuestion.ratioName}
                </h3>
              </div>

              {/* Formula Formula Prompt Box */}
              <div className="mt-4 p-4 rounded-xl bg-navy-850 border border-gold-500/20 font-mono text-sm text-gold-300 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Core Valuation Formula
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {currentQuestion.formulaPrompt}
                  </div>
                  <div className="text-xs text-slate-400 font-sans mt-1.5 leading-relaxed">
                    {currentQuestion.formulaHint}
                  </div>
                </div>
              </div>

              {/* Real NGX Data Inputs */}
              <div className="mt-6">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Live Market Financial Indicators
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentQuestion.dataInputs.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-navy-950 border border-navy-800">
                      <div className="text-[10px] text-slate-400">{item.label}</div>
                      <div className="text-sm font-black text-white font-mono mt-0.5">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multiple Choice Options */}
              <div className="mt-6 space-y-3">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Select the Calculated Value:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.options.map(option => {
                    const isSelected = selectedOptionId === option.id;
                    return (
                      <button
                        key={option.id}
                        disabled={isAnswerSubmitted}
                        onClick={() => setSelectedOptionId(option.id)}
                        className={`p-3.5 rounded-xl text-left border text-sm font-mono font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-gold-500/20 border-gold-500 text-gold-300 shadow-md'
                            : 'bg-navy-950 border-navy-800 text-slate-300 hover:border-navy-600 hover:text-white'
                        }`}
                      >
                        <span>{option.label}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-gold-400 bg-gold-400' : 'border-slate-600'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-navy-950" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback and Explanation */}
              {isAnswerSubmitted && (
                <div className="mt-6 p-4 rounded-xl bg-navy-950 border border-navy-700 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    {ratioFeedbackMessage?.includes('Correct') ? (
                      <CheckCircle2 className="w-5 h-5 text-bull" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-bear" />
                    )}
                    <span className={ratioFeedbackMessage?.includes('Correct') ? 'text-bull' : 'text-bear'}>
                      {ratioFeedbackMessage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed mt-1">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Controls */}
              <div className="mt-6 pt-4 border-t border-navy-800 flex items-center justify-between">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitRatioAnswer}
                    disabled={!selectedOptionId}
                    className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:pointer-events-none text-navy-950 font-black text-xs transition-all shadow-md flex items-center gap-2"
                  >
                    <span>Check Solution & Claim XP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-navy-750 hover:bg-navy-700 text-white font-bold text-xs transition-all flex items-center gap-2"
                  >
                    <span>Next Ratio Challenge</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Ratio Syllabus Navigation Sidebar */}
          <div className="space-y-4">
            <div className="bg-navy-900 border border-navy-750 rounded-2xl p-5 shadow-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gold-400" />
                <span>Financial Analysis Curriculum</span>
              </h4>

              <div className="space-y-2">
                {INITIAL_RATIO_QUESTIONS.map((q, idx) => {
                  const isCurrent = idx === selectedQuestionIndex;
                  const isMastered = completedQuestionIds.includes(q.id);

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setSelectedQuestionIndex(idx);
                        setSelectedOptionId(null);
                        setIsAnswerSubmitted(false);
                        setRatioFeedbackMessage(null);
                      }}
                      className={`w-full p-3 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-navy-800 border-gold-500 text-white'
                          : 'bg-navy-950 border-navy-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{q.ticker}:</span>
                          <span className="text-slate-200">{q.ratioName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          +{q.rewardXp} XP • {q.companyName.split(' ')[0]}
                        </div>
                      </div>

                      {isMastered ? (
                        <CheckCircle2 className="w-4 h-4 text-bull shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-navy-700" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Cheat-Sheet Card */}
            <div className="bg-navy-950 border border-navy-800 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span>Nigerian Exchange Benchmarks</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                • <strong>P/E Ratio:</strong> NGX 10-year historical average is 7.5x. Under 5x usually indicates value or regulatory risk.
              </p>
              <p className="text-[11px] leading-relaxed">
                • <strong>Dividend Yield:</strong> Top Tier-1 banks often yield 8% - 14% cash returns, compensating for local inflation.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 2. GUIDED QUESTS & MISSIONS */}
      {/* ========================================================= */}
      {activeSubTab === 'quests' && (
        <div className="space-y-4">
          <div className="bg-navy-900 border border-navy-750 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-white">Cohort Progression Quests</h3>
                <p className="text-xs text-slate-400">
                  Complete real trading and analysis actions to build institutional discipline and unlock ranks.
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-gold-400">
                {evaluatedQuests.filter(q => q.isCompleted).length} / {evaluatedQuests.length} Completed
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluatedQuests.map(quest => {
                const isClaimed = claimedQuestIds.includes(quest.id);
                const pct = Math.min(100, Math.round((quest.progress / quest.maxProgress) * 100));

                return (
                  <div
                    key={quest.id}
                    className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                      quest.isCompleted
                        ? 'bg-navy-850/80 border-gold-500/40 shadow-md'
                        : 'bg-navy-950/60 border-navy-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          quest.category === 'BEGINNER' ? 'bg-bull/20 text-bull border border-bull/30' :
                          quest.category === 'INTERMEDIATE' ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30' :
                          'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {quest.category}
                        </span>

                        <span className="font-mono font-bold text-xs text-gold-400">
                          +{quest.rewardXp} XP
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                        <span>{quest.title}</span>
                        {quest.isCompleted && <CheckCircle2 className="w-4 h-4 text-bull shrink-0" />}
                      </h4>

                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {quest.description}
                      </p>
                    </div>

                    <div>
                      {/* Progress bar */}
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-[11px] font-mono text-slate-400">
                          <span>Progress: {quest.progress} / {quest.maxProgress}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-navy-900 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              quest.isCompleted ? 'bg-bull' : 'bg-gold-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      {quest.isCompleted ? (
                        <button
                          onClick={() => handleClaimQuest(quest.id, quest.rewardXp)}
                          disabled={isClaimed}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isClaimed
                              ? 'bg-navy-800 text-slate-500 cursor-default'
                              : 'bg-gold-500 hover:bg-gold-400 text-navy-950 shadow-md font-black'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{isClaimed ? 'Reward Claimed' : 'Claim +XP Reward'}</span>
                        </button>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic text-center py-1">
                          Action pending in your trading portfolio
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. "WHY DID THE STOCK MOVE?" INSPECTOR */}
      {/* ========================================================= */}
      {activeSubTab === 'inspector' && (
        <div className="space-y-6">
          <div className="bg-navy-900 border border-navy-750 rounded-2xl p-6 shadow-xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-800">
              <div>
                <h3 className="text-lg font-black text-white">Market Forces & Price Drivers Inspector</h3>
                <p className="text-xs text-slate-400">
                  Select an NGX equity to teardown macroeconomic, sector, disclosure, and order book forces.
                </p>
              </div>

              {/* Stock Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Inspect Security:</span>
                <select
                  value={inspectorTicker}
                  onChange={(e) => setInspectorTicker(e.target.value)}
                  className="bg-navy-950 border border-navy-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500 font-mono font-bold"
                >
                  {stocks.map(s => (
                    <option key={s.ticker} value={s.ticker}>
                      {s.ticker} ({s.dayChangePct >= 0 ? '+' : ''}{s.dayChangePct.toFixed(2)}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Stock Banner */}
            <div className="mt-6 p-4 rounded-xl bg-navy-850 border border-navy-700 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono font-bold text-gold-400">{inspectedStock.sector}</div>
                <div className="text-xl font-black text-white">{inspectedStock.name} ({inspectedStock.ticker})</div>
              </div>

              <div className="flex items-center gap-4 font-mono">
                <div>
                  <div className="text-[10px] text-slate-400">Current Price</div>
                  <div className="text-lg font-bold text-white">₦{inspectedStock.currentPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Day Change</div>
                  <div className={`text-lg font-bold ${inspectedStock.dayChange >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {inspectedStock.dayChange >= 0 ? '+' : ''}{inspectedStock.dayChange.toFixed(2)} ({inspectedStock.dayChangePct.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Pillars of Price Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              
              {/* Force 1: Domestic Macroeconomics */}
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-gold-400" />
                    <span>Domestic Macro Environment</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-navy-800 text-slate-300 font-mono">
                    Weight: 25%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  CBN Monetary Policy Rate at <strong>27.25%</strong> creates yield competition with Treasury Bills. Banking equities benefit from widened net interest margins (NIM), while consumer goods face elevated debt financing costs.
                </p>
              </div>

              {/* Force 2: Sector Dynamics */}
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-gold-400" />
                    <span>Sector Index Sentiment</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-navy-800 text-slate-300 font-mono">
                    Weight: 25%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>{inspectedStock.sector}</strong> is currently experiencing heightened institutional demand driven by Q3 corporate disclosures and pension fund administrator (PFA) portfolio balancing.
                </p>
              </div>

              {/* Force 3: Corporate Fundamentals */}
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-gold-400" />
                    <span>Earnings & Dividends (P/E & ROE)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-navy-800 text-slate-300 font-mono">
                    Weight: 30%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Trading at a P/E of <strong className="font-mono text-white">{inspectedStock.peRatio.toFixed(1)}x</strong> with an ROE of <strong className="font-mono text-white">{inspectedStock.roePct.toFixed(1)}%</strong> and dividend yield of <strong className="font-mono text-white">{inspectedStock.dividendYield.toFixed(1)}%</strong>. High earnings retention supports capital growth.
                </p>
              </div>

              {/* Force 4: Order Book Pressure */}
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-gold-400" />
                    <span>Order Book Bid/Ask Liquidity</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-navy-800 text-slate-300 font-mono">
                    Weight: 20%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Daily volume of <strong className="font-mono text-white">{(inspectedStock.volume / 1000000).toFixed(2)}M</strong> units. Net institutional bid volume exceeds available offer depth, exerting upward price elasticity.
                </p>
              </div>

            </div>

            {/* Action to Trade or Inspect */}
            <div className="mt-6 pt-4 border-t border-navy-800 flex justify-end">
              <button
                onClick={() => onExploreStock && onExploreStock(inspectedStock.ticker)}
                className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Open Dedicated {inspectedStock.ticker} Analysis Page</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

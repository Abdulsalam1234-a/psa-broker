import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  TrendingUp, 
  BarChart3, 
  ShieldCheck, 
  Award, 
  Briefcase,
  Layers,
  HelpCircle
} from 'lucide-react';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Welcome to PSA Broker',
      subtitle: 'Official Nigerian Capital Market Academic Simulation',
      tag: 'Overview',
      icon: Sparkles,
      iconColor: 'text-gold-400 bg-gold-500/10 border-gold-500/30',
      description: 'PSA Broker provides a real-world institutional terminal simulation powered by PSA Omnitech in strategic partnership with Naira Stock Academy. Practice trading with authentic Nigerian equities, real market hours (9:00 AM – 4:00 PM WAT), and standard T+1 settlement.',
      features: [
        'Live Nigerian Exchange (NGX) equities universe with authentic prices',
        'Dual Sandbox & Event challenge account segregation',
        'Official statutory fees: SEC (0.30%), CSCS (0.35%), Broker (0.70%) & VAT'
      ],
      targetTab: 'portfolio'
    },
    {
      title: 'Real-Time Markets & Sector Heatmap',
      subtitle: '139 Equities with TradingView Live Feed',
      tag: 'Market Intelligence',
      icon: BarChart3,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Explore all 139 equities listed on the NGX. Toggle seamlessly between the directory table and the Finviz-style Market Heatmap to spot market breadth, daily advancers, decliners, and sector capital flows.',
      features: [
        'Automatic 10-second sync with official TradingView NSENG scanner',
        'Finviz-style Market Heatmap weighted by market capitalization',
        'Level 2 Market Depth (5-tier order book) for institutional transparency'
      ],
      targetTab: 'markets'
    },
    {
      title: 'Flexible Order Execution',
      subtitle: 'Market Orders, Limit Orders & Value Input',
      tag: 'Order Routing',
      icon: TrendingUp,
      iconColor: 'text-bull bg-bull/10 border-bull/30',
      description: 'Place trades your way. You can specify exact unit quantities or enter any desired Naira amount (minimum gross trade value of ₦1,000). Every trade calculates exact statutory fee slips and requires conscious review.',
      features: [
        'Flexible Dual-Mode: Trade by Shares Quantity or by Exact Naira Value',
        'Limit order placement executed when market price crosses limit threshold',
        'Pre-Trade Investment Thesis notes to earn bonus Academy XP (+25 XP)'
      ],
      targetTab: 'markets'
    },
    {
      title: 'Modern Portfolio Theory (MPT) & Risk',
      subtitle: 'Beta, Sharpe Ratio & Sector Donut',
      tag: 'Risk Analytics',
      icon: Briefcase,
      iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      description: 'Monitor your personal portfolio health with quantitative risk metrics calibrated against the Central Bank of Nigeria (CBN) Monetary Policy Rate of 27.25%.',
      features: [
        'Portfolio Beta (\u03B2\u209A) tracking sensitivity against NGX All-Share Index',
        'Annualized Sharpe Ratio measuring risk-adjusted excess returns',
        'Interactive SVG Sector Allocation Donut Chart with cash weighting'
      ],
      targetTab: 'portfolio'
    },
    {
      title: 'Academy Lab, Challenges & Disclosures',
      subtitle: 'Earn Academy XP & WhatsApp News Broadcasts',
      tag: 'Gamified Growth',
      icon: Award,
      iconColor: 'text-gold-400 bg-gold-500/10 border-gold-500/30',
      description: 'Compete in faculty challenge tournaments, analyze authentic 3-statement financial teardowns (Balance Sheet, Income Statement, Cash Flow), and react to live simulation news with 1-click WhatsApp community broadcasts.',
      features: [
        'Interactive Leaderboards ranking traders by ROI and discipline scores',
        'Super Admin & Course Manager news dispatch with macro sentiment tags',
        '1-Click WhatsApp community headline formatting for active discussion'
      ],
      targetTab: 'academy'
    }
  ];

  const current = tourSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('psa_tour_completed', 'true');
      onClose();
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (onNavigateTab && tourSteps[nextStep].targetTab) {
        onNavigateTab(tourSteps[nextStep].targetTab);
      }
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (onNavigateTab && tourSteps[prevStep].targetTab) {
        onNavigateTab(tourSteps[prevStep].targetTab);
      }
    }
  };

  const handleSkip = () => {
    localStorage.setItem('psa_tour_completed', 'true');
    onClose();
  };

  const IconComponent = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-navy-900 border border-navy-700 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Top Gradient Ribbon */}
        <div className="h-2 w-full bg-gradient-to-r from-gold-500 via-emerald-400 to-purple-500" />

        {/* Modal Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800 transition-colors"
          title="Skip Tour"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Step Tag & Indicator */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-navy-800 text-gold-300 border border-gold-500/30">
              Step {currentStep + 1} of {tourSteps.length} • {current.tag}
            </span>

            {/* Progress Dots */}
            <div className="flex items-center gap-1.5">
              {tourSteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentStep(idx);
                    if (onNavigateTab && tourSteps[idx].targetTab) {
                      onNavigateTab(tourSteps[idx].targetTab);
                    }
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStep ? 'w-6 bg-gold-400' : 'w-2 bg-navy-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Icon & Title */}
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${current.iconColor}`}>
              <IconComponent className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {current.title}
              </h3>
              <p className="text-xs text-gold-400/90 font-medium mt-0.5">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed">
            {current.description}
          </p>

          {/* Bullet Feature Highlights */}
          <div className="bg-navy-950/70 border border-navy-800 rounded-2xl p-4 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Key Capabilities:
            </div>
            {current.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-navy-800">
            <button
              onClick={handleSkip}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-gold-500/20"
              >
                <span>{isLast ? 'Complete & Start Trading' : 'Next Step'}</span>
                {isLast ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

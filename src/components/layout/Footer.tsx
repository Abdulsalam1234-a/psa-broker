import React from 'react';
import { ShieldCheck, BookOpen, ExternalLink, Award, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 border-t border-navy-700/80 text-slate-400 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Platform Overview */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gold-500 flex items-center justify-center font-bold text-navy-950 text-sm">
                PSA
              </div>
              <span className="text-base font-bold text-white tracking-wide">
                PSA Broker <span className="text-gold-400 font-medium">| NGX Terminal</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              PSA Broker is an institutional-grade stock market simulation, academic trading terminal, and gamified competition engine designed specifically for Nigerian capital market education. Built to bridge the gap between financial statement theory and practical portfolio execution.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gold-400/90 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-bull" />
              <span>Realistic statutory NGX fee modeling (SEC, CSCS, Stamp Duty, Brokerage Commission)</span>
            </div>
          </div>

          {/* Col 2: Educational Modules */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Academy Curriculum
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <span className="hover:text-gold-300 transition-colors cursor-pointer flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-gold-500" />
                  3-Statement Teardown
                </span>
              </li>
              <li>
                <span className="hover:text-gold-300 transition-colors cursor-pointer flex items-center gap-1">
                  <Award className="w-3 h-3 text-gold-500" />
                  Risk Discipline & Stop-Losses
                </span>
              </li>
              <li>
                <span className="hover:text-gold-300 transition-colors cursor-pointer flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-gold-500" />
                  Composite Mastery Scoring
                </span>
              </li>
              <li>
                <span className="hover:text-gold-300 transition-colors cursor-pointer">
                  NGX Sector Diversification
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Governance */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Governance & Disclaimer
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This terminal operates with virtual practice capital (demo funds) for academic instruction and trading competitions. Simulated equities track real-world Nigerian market dynamics.
            </p>
            <div className="pt-1 text-[11px] text-slate-400">
              Target Audience: University students, finance researchers, and Naira Stock Academy cohorts.
            </div>
          </div>
        </div>

        {/* Bottom Attribution Bar (Explicitly mandated) */}
        <div className="pt-6 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="text-xs text-slate-300 font-medium">
            PSA Broker © PSA Investment Property | Powered by PSA Omnitech in strategic partnership with Naira Stock Academy
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span>All rights reserved</span>
            <span>•</span>
            <span className="text-gold-400">NGX Virtual Edition v2.5</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

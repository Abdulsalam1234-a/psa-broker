import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Stock } from '../../types';
import { ACCOUNTING_TOOLTIPS, MetricDefinition } from '../../data/accountingTooltips';
import { 
  BookOpen, 
  HelpCircle, 
  FileText, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  ChevronRight,
  DollarSign,
  PieChart,
  Percent,
  Layers
} from 'lucide-react';

interface FinancialExplorerViewProps {
  onTradeStock: (stock: Stock) => void;
}

export const FinancialExplorerView: React.FC<FinancialExplorerViewProps> = ({ onTradeStock }) => {
  const { selectedStock, setSelectedStock, stocks, currentUser } = useApp();

  const [activeStatementTab, setActiveStatementTab] = useState<'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'CASH_FLOW' | 'DISCLOSURES'>('BALANCE_SHEET');
  const [activeTooltip, setActiveTooltip] = useState<MetricDefinition | null>(null);

  const bs = selectedStock.balanceSheet;
  const inc = selectedStock.incomeStatement;
  const cf = selectedStock.cashFlow;

  const showTooltip = (key: string) => {
    const tip = ACCOUNTING_TOOLTIPS[key];
    if (tip) setActiveTooltip(tip);
  };

  return (
    <div className="space-y-6">
      {/* Terminal Header & Stock Selector */}
      <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-gold-400" />
              PSA Institutional Terminal • Financial Teardown
            </span>
          </div>
          <div className="text-xl font-black text-white font-mono mt-1 flex items-center gap-2">
            <span>{selectedStock.ticker}</span>
            <span className="text-slate-400 font-sans text-sm font-normal">• {selectedStock.name}</span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
            {selectedStock.description}
          </p>
        </div>

        {/* Stock Selector & Trade CTA */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStock.ticker}
            onChange={(e) => {
              const s = stocks.find(st => st.ticker === e.target.value);
              if (s) setSelectedStock(s);
            }}
            className="bg-navy-800 border border-navy-600 rounded-xl px-3 py-2 text-sm font-bold font-mono text-white focus:outline-none focus:border-gold-400"
          >
            {stocks.map(s => (
              <option key={s.ticker} value={s.ticker}>
                {s.ticker} ({s.sector})
              </option>
            ))}
          </select>

          <button
            onClick={() => onTradeStock(selectedStock)}
            className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
          >
            Trade {selectedStock.ticker}
          </button>
        </div>
      </div>

      {/* Fundamental Metric Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* P/E */}
        <div 
          onClick={() => showTooltip('peRatio')}
          className="bg-navy-900/80 hover:bg-navy-800/80 border border-navy-700/80 rounded-xl p-3 cursor-pointer transition-colors shadow-sm group"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase">
            <span>P/E Ratio</span>
            <HelpCircle className="w-3 h-3 text-gold-400 group-hover:scale-110" />
          </div>
          <div className="text-lg font-bold font-mono text-gold-400 mt-1">
            {selectedStock.peRatio}x
          </div>
          <div className="text-[10px] text-slate-400">Industry Avg: ~5.8x</div>
        </div>

        {/* ROE */}
        <div 
          onClick={() => showTooltip('roePct')}
          className="bg-navy-900/80 hover:bg-navy-800/80 border border-navy-700/80 rounded-xl p-3 cursor-pointer transition-colors shadow-sm group"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase">
            <span>Return on Equity</span>
            <HelpCircle className="w-3 h-3 text-gold-400 group-hover:scale-110" />
          </div>
          <div className="text-lg font-bold font-mono text-bull mt-1">
            {selectedStock.roePct}%
          </div>
          <div className="text-[10px] text-slate-400">Efficiency Metric</div>
        </div>

        {/* Dividend Yield */}
        <div 
          onClick={() => showTooltip('dividendYield')}
          className="bg-navy-900/80 hover:bg-navy-800/80 border border-navy-700/80 rounded-xl p-3 cursor-pointer transition-colors shadow-sm group"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase">
            <span>Dividend Yield</span>
            <HelpCircle className="w-3 h-3 text-gold-400 group-hover:scale-110" />
          </div>
          <div className="text-lg font-bold font-mono text-bull mt-1">
            {selectedStock.dividendYield}%
          </div>
          <div className="text-[10px] text-slate-400">Cash Return</div>
        </div>

        {/* Debt to Equity */}
        <div 
          onClick={() => showTooltip('debtToEquity')}
          className="bg-navy-900/80 hover:bg-navy-800/80 border border-navy-700/80 rounded-xl p-3 cursor-pointer transition-colors shadow-sm group"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase">
            <span>Debt-to-Equity</span>
            <HelpCircle className="w-3 h-3 text-gold-400 group-hover:scale-110" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-200 mt-1">
            {selectedStock.debtToEquity}x
          </div>
          <div className="text-[10px] text-slate-400">Leverage Factor</div>
        </div>

        {/* EPS */}
        <div 
          onClick={() => showTooltip('eps')}
          className="bg-navy-900/80 hover:bg-navy-800/80 border border-navy-700/80 rounded-xl p-3 cursor-pointer transition-colors shadow-sm group"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase">
            <span>Earnings Per Share</span>
            <HelpCircle className="w-3 h-3 text-gold-400 group-hover:scale-110" />
          </div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            ₦{selectedStock.eps.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400">Per Ordinary Share</div>
        </div>

        {/* Market Cap */}
        <div className="bg-navy-900/80 border border-navy-700/80 rounded-xl p-3 shadow-sm">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">
            Market Cap
          </div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            ₦{selectedStock.marketCap.toLocaleString()}B
          </div>
          <div className="text-[10px] text-gold-400">{selectedStock.sector}</div>
        </div>
      </div>

      {/* Main Statement Tabs & Interactive Viewer */}
      <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl overflow-hidden shadow-2xl">
        {/* Tab Headers */}
        <div className="bg-navy-950/80 px-4 py-3 border-b border-navy-700/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'BALANCE_SHEET', label: 'Balance Sheet (Statement of Financial Position)' },
              { id: 'INCOME_STATEMENT', label: 'Income Statement (Comprehensive Profit & Loss)' },
              { id: 'CASH_FLOW', label: 'Cash Flow Statement' },
              { id: 'DISCLOSURES', label: 'Corporate Actions & Dividend Tracker' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveStatementTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeStatementTab === tab.id
                    ? 'bg-navy-700 text-gold-400 border border-gold-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-mono hidden sm:inline">
            Reporting Period: <strong className="text-white">{bs.fiscalYear}</strong> ({bs.currency})
          </div>
        </div>

        {/* Statement Content */}
        <div className="p-5">
          {/* ===================================== */}
          {/* 1. BALANCE SHEET TAB */}
          {/* ===================================== */}
          {activeStatementTab === 'BALANCE_SHEET' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assets Column */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-gold-400 uppercase tracking-wider pb-1 border-b border-navy-700">
                    Assets Breakdown
                  </div>

                  {/* Current Assets */}
                  <div className="bg-navy-950/60 rounded-xl p-3 space-y-2 border border-navy-800 text-xs font-mono">
                    <div className="font-sans font-semibold text-slate-300">Current Assets</div>
                    <div 
                      onClick={() => showTooltip('cashAndEquivalents')}
                      className="flex justify-between hover:text-gold-300 cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        <span>Cash & Short-Term Placements</span>
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                      </span>
                      <span>₦{bs.cashAndEquivalents.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Trade & Other Receivables</span>
                      <span>₦{bs.tradeReceivables.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Inventories</span>
                      <span>₦{bs.inventories.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-navy-800">
                      <span>Total Current Assets</span>
                      <span>₦{bs.totalCurrentAssets.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Non-Current Assets */}
                  <div className="bg-navy-950/60 rounded-xl p-3 space-y-2 border border-navy-800 text-xs font-mono">
                    <div className="font-sans font-semibold text-slate-300">Non-Current Assets</div>
                    <div className="flex justify-between text-slate-400">
                      <span>Property, Plant & Equipment (PP&E)</span>
                      <span>₦{bs.propertyPlantEquipment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Intangible Assets & Goodwill</span>
                      <span>₦{bs.intangibleAssets.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-navy-800">
                      <span>Total Non-Current Assets</span>
                      <span>₦{bs.totalNonCurrentAssets.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Total Assets Row */}
                  <div 
                    onClick={() => showTooltip('totalAssets')}
                    className="p-3 bg-navy-800/90 rounded-xl border border-navy-600 flex justify-between font-bold text-sm text-white font-mono cursor-pointer hover:border-gold-500/60 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-gold-300 font-sans">
                      <span>Total Assets</span>
                      <HelpCircle className="w-3.5 h-3.5 text-gold-400" />
                    </span>
                    <span>₦{bs.totalAssets.toLocaleString()}</span>
                  </div>
                </div>

                {/* Liabilities & Equity Column */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-gold-400 uppercase tracking-wider pb-1 border-b border-navy-700">
                    Liabilities & Shareholders' Equity
                  </div>

                  {/* Liabilities */}
                  <div className="bg-navy-950/60 rounded-xl p-3 space-y-2 border border-navy-800 text-xs font-mono">
                    <div className="font-sans font-semibold text-slate-300">Liabilities</div>
                    <div 
                      onClick={() => showTooltip('shortTermDebt')}
                      className="flex justify-between hover:text-gold-300 cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        <span>Short-Term Borrowings</span>
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                      </span>
                      <span>₦{bs.shortTermDebt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Trade & Customer Deposits</span>
                      <span>₦{bs.accountsPayable.toLocaleString()}</span>
                    </div>
                    <div 
                      onClick={() => showTooltip('longTermDebt')}
                      className="flex justify-between hover:text-gold-300 cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        <span>Long-Term Debt & Bonds</span>
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                      </span>
                      <span>₦{bs.longTermDebt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-navy-800">
                      <span>Total Liabilities</span>
                      <span>₦{bs.totalLiabilities.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Equity */}
                  <div className="bg-navy-950/60 rounded-xl p-3 space-y-2 border border-navy-800 text-xs font-mono">
                    <div className="font-sans font-semibold text-slate-300">Shareholders' Equity</div>
                    <div 
                      onClick={() => showTooltip('retainedEarnings')}
                      className="flex justify-between hover:text-gold-300 cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        <span className="text-gold-300 font-semibold">Retained Earnings</span>
                        <HelpCircle className="w-3 h-3 text-gold-400" />
                      </span>
                      <span className="text-gold-300 font-bold">₦{bs.retainedEarnings.toLocaleString()}</span>
                    </div>
                    <div 
                      onClick={() => showTooltip('shareholdersEquity')}
                      className="flex justify-between font-bold text-slate-200 pt-1 border-t border-navy-800 hover:text-gold-300 cursor-pointer"
                    >
                      <span>Total Shareholders' Equity</span>
                      <span>₦{bs.shareholdersEquity.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Total Liabilities & Equity Check */}
                  <div className="p-3 bg-navy-800/90 rounded-xl border border-navy-600 flex justify-between font-bold text-sm text-white font-mono">
                    <span className="text-gold-300 font-sans">Total Liabilities + Equity</span>
                    <span>₦{(bs.totalLiabilities + bs.shareholdersEquity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================== */}
          {/* 2. INCOME STATEMENT TAB */}
          {/* ===================================== */}
          {activeStatementTab === 'INCOME_STATEMENT' && (
            <div className="max-w-3xl mx-auto space-y-3 font-mono text-xs">
              <div 
                onClick={() => showTooltip('revenue')}
                className="p-3.5 bg-navy-950/80 rounded-xl border border-navy-800 flex justify-between items-center hover:bg-navy-800 cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-sans font-bold text-sm text-white flex items-center gap-1.5">
                    <span>Revenue (Gross Turnover)</span>
                    <HelpCircle className="w-3.5 h-3.5 text-gold-400" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">Primary operating sales</div>
                </div>
                <div className="text-base font-bold text-white">
                  ₦{inc.revenue.toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-navy-950/40 rounded-xl border border-navy-800/80 flex justify-between items-center text-slate-400">
                <span className="font-sans">Cost of Sales (COGS)</span>
                <span className="text-bear">-₦{inc.costOfSales.toLocaleString()}</span>
              </div>

              <div 
                onClick={() => showTooltip('grossProfit')}
                className="p-3.5 bg-navy-950/80 rounded-xl border border-navy-800 flex justify-between items-center hover:bg-navy-800 cursor-pointer transition-colors"
              >
                <div className="font-sans font-bold text-slate-200 flex items-center gap-1.5">
                  <span>Gross Profit</span>
                  <HelpCircle className="w-3.5 h-3.5 text-gold-400" />
                </div>
                <div className="text-sm font-bold text-slate-200">
                  ₦{inc.grossProfit.toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-navy-950/40 rounded-xl border border-navy-800/80 flex justify-between items-center text-slate-400">
                <span className="font-sans">Operating Expenses (Admin & Selling OPEX)</span>
                <span className="text-bear">-₦{inc.operatingExpenses.toLocaleString()}</span>
              </div>

              <div 
                onClick={() => showTooltip('ebitda')}
                className="p-3.5 bg-navy-950/80 rounded-xl border border-navy-800 flex justify-between items-center hover:bg-navy-800 cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-sans font-bold text-slate-200 flex items-center gap-1.5">
                    <span>EBITDA</span>
                    <HelpCircle className="w-3.5 h-3.5 text-gold-400" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">Operating cash profitability</div>
                </div>
                <div className="text-sm font-bold text-gold-300">
                  ₦{inc.ebitda.toLocaleString()}
                </div>
              </div>

              <div 
                onClick={() => showTooltip('operatingProfit')}
                className="p-3.5 bg-navy-950/80 rounded-xl border border-navy-800 flex justify-between items-center hover:bg-navy-800 cursor-pointer transition-colors"
              >
                <div className="font-sans font-bold text-slate-200 flex items-center gap-1.5">
                  <span>Operating Profit (EBIT)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-gold-400" />
                </div>
                <div className="text-sm font-bold text-white">
                  ₦{inc.operatingProfit.toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-navy-950/40 rounded-xl border border-navy-800/80 flex justify-between items-center text-slate-400">
                <span className="font-sans">Net Finance Costs / Forex Gain/Loss</span>
                <span className={inc.netFinanceCost < 0 ? 'text-bear' : 'text-bull'}>
                  {inc.netFinanceCost < 0 ? '-' : ''}₦{Math.abs(inc.netFinanceCost).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 bg-navy-950/80 rounded-xl border border-navy-800 flex justify-between items-center">
                <span className="font-sans font-bold text-slate-200">Profit Before Tax (PBT)</span>
                <span className="text-sm font-bold text-white">₦{inc.profitBeforeTax.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-navy-950/40 rounded-xl border border-navy-800/80 flex justify-between items-center text-slate-400">
                <span className="font-sans">Income Tax Expense</span>
                <span className="text-bear">-₦{inc.taxExpense.toLocaleString()}</span>
              </div>

              {/* Bottom Line Net Income */}
              <div 
                onClick={() => showTooltip('netIncome')}
                className="p-4 bg-navy-800 rounded-xl border-2 border-gold-500/60 flex justify-between items-center hover:border-gold-400 cursor-pointer transition-colors shadow-lg"
              >
                <div>
                  <div className="font-sans font-extrabold text-base text-gold-400 flex items-center gap-2">
                    <span>Net Income (Profit After Tax - PAT)</span>
                    <HelpCircle className="w-4 h-4 text-gold-400" />
                  </div>
                  <div className="text-xs text-slate-300 font-sans">
                    EPS: ₦{inc.eps.toFixed(2)} per share
                  </div>
                </div>
                <div className="text-xl font-black text-bull">
                  ₦{inc.netIncome.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* ===================================== */}
          {/* 3. CASH FLOW STATEMENT TAB */}
          {/* ===================================== */}
          {activeStatementTab === 'CASH_FLOW' && (
            <div className="max-w-3xl mx-auto space-y-4 font-mono text-xs">
              {/* OCF */}
              <div 
                onClick={() => showTooltip('operatingCashFlow')}
                className="p-4 bg-navy-950/80 rounded-xl border border-navy-800 hover:bg-navy-800 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-sans font-bold text-sm text-bull flex items-center gap-1.5">
                    <span>Cash Flow from Operations (OCF)</span>
                    <HelpCircle className="w-3.5 h-3.5 text-bull" />
                  </span>
                  <span className="text-base font-bold text-bull">
                    ₦{cf.operatingCashFlow.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Actual physical cash collected from operations after working capital adjustments.
                </p>
              </div>

              {/* CapEx & Investing */}
              <div 
                onClick={() => showTooltip('capitalExpenditures')}
                className="p-4 bg-navy-950/80 rounded-xl border border-navy-800 hover:bg-navy-800 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-sans font-bold text-sm text-slate-200 flex items-center gap-1.5">
                    <span>Capital Expenditures (CapEx)</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                  <span className="text-base font-bold text-bear">
                    -₦{cf.capitalExpenditures.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Investment in fixed plants, network infrastructure, and capacity expansion.
                </p>
              </div>

              {/* Free Cash Flow */}
              <div 
                onClick={() => showTooltip('freeCashFlow')}
                className="p-4 bg-navy-800 rounded-xl border-2 border-gold-500/60 flex justify-between items-center hover:border-gold-400 cursor-pointer transition-colors shadow-lg"
              >
                <div>
                  <div className="font-sans font-extrabold text-base text-gold-400 flex items-center gap-2">
                    <span>Free Cash Flow to Firm (FCF)</span>
                    <HelpCircle className="w-4 h-4 text-gold-400" />
                  </div>
                  <div className="text-xs text-slate-300 font-sans">
                    Discretionary cash for dividends, buybacks, and debt retirement
                  </div>
                </div>
                <div className="text-xl font-black text-bull">
                  ₦{cf.freeCashFlow.toLocaleString()}
                </div>
              </div>

              {/* Financing Cash Flow */}
              <div className="p-4 bg-navy-950/80 rounded-xl border border-navy-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-sans font-bold text-sm text-slate-200">
                    Financing Cash Flow & Dividend Payouts
                  </span>
                  <span className="text-base font-bold text-slate-300">
                    ₦{cf.financingCashFlow.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                  <span>Dividends Distributed to Shareholders:</span>
                  <span className="text-gold-300 font-bold">₦{cf.dividendsPaid.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* ===================================== */}
          {/* 4. CORPORATE DISCLOSURES & DIVIDENDS TAB */}
          {/* ===================================== */}
          {activeStatementTab === 'DISCLOSURES' && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Historical Corporate Actions, Dividends & AGM Announcements
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedStock.corporateActions.map(action => (
                  <div 
                    key={action.id}
                    className="bg-navy-950/80 border border-navy-800 rounded-xl p-4 space-y-2 hover:border-gold-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        action.type === 'DIVIDEND' ? 'bg-bull/20 text-bull border border-bull/40' :
                        action.type === 'EARNINGS' ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40' :
                        'bg-navy-700 text-slate-300'
                      }`}>
                        {action.type}
                      </span>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {action.date}
                      </span>
                    </div>

                    <div className="font-bold text-white text-sm">
                      {action.title}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {action.details}
                    </p>

                    {action.dividendAmount && (
                      <div className="pt-2 border-t border-navy-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-400 block">Dividend:</span>
                          <span className="font-bold text-gold-400">₦{action.dividendAmount.toFixed(2)} / share</span>
                        </div>
                        {action.paymentDate && (
                          <div>
                            <span className="text-slate-400 block">Payment Date:</span>
                            <span className="text-white">{action.paymentDate}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Accounting Glossary Modal / Popover */}
      {activeTooltip && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border-2 border-gold-500/70 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-navy-700 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-500/40 uppercase tracking-wider">
                  {activeTooltip.category}
                </span>
                <div className="text-lg font-bold text-white mt-1">
                  {activeTooltip.name}
                </div>
              </div>
              <button
                onClick={() => setActiveTooltip(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <span className="font-semibold text-gold-400 block mb-0.5">Core Definition:</span>
                <p className="text-slate-200">{activeTooltip.definition}</p>
              </div>

              {activeTooltip.formula && (
                <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 font-mono text-gold-300">
                  <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Calculation Formula:</span>
                  {activeTooltip.formula}
                </div>
              )}

              <div>
                <span className="font-semibold text-bull block mb-0.5">Nigerian Market Context (NGX):</span>
                <p className="text-slate-300">{activeTooltip.ngxContext}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-300 block mb-0.5">Analyst Interpretation:</span>
                <p className="text-slate-400">{activeTooltip.interpretation}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTooltip(null)}
              className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Understood • Return to Terminal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

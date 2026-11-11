export interface MetricDefinition {
  name: string;
  category: 'Balance Sheet' | 'Income Statement' | 'Cash Flow' | 'Valuation & Ratios';
  definition: string;
  formula?: string;
  ngxContext: string;
  interpretation: string;
}

export const ACCOUNTING_TOOLTIPS: Record<string, MetricDefinition> = {
  // Balance Sheet Metrics
  retainedEarnings: {
    name: "Retained Earnings",
    category: "Balance Sheet",
    definition: "The cumulative net income retained by the company after paying out dividends to shareholders since inception.",
    formula: "Beginning Retained Earnings + Net Income - Dividends Paid",
    ngxContext: "Critical for Nigerian banks like Zenith and GTCO meeting CBN's ₦500 Billion minimum recapitalization threshold without excessive rights dilution.",
    interpretation: "A positive, growing retained earnings balance indicates sustainable compounding and internal funding capacity."
  },
  shareholdersEquity: {
    name: "Shareholders' Equity (Book Value)",
    category: "Balance Sheet",
    definition: "The net worth of the company belonging to shareholders after all liabilities are deducted from total assets.",
    formula: "Total Assets - Total Liabilities",
    ngxContext: "In NGX industrials like Dangote Cement and BUA Cement, high equity backing supports large-scale clinker capacity expansion.",
    interpretation: "If Market Cap is significantly below Shareholders' Equity (P/B < 1.0), the stock trades below its underlying net asset value."
  },
  cashAndEquivalents: {
    name: "Cash & Cash Equivalents",
    category: "Balance Sheet",
    definition: "Currency, bank balances, short-term treasury bills, and high-liquidity financial instruments readily convertible to cash.",
    ngxContext: "Vital buffer in Nigeria against foreign exchange volatility and rising CBN monetary policy rates (MPR).",
    interpretation: "High cash reserves provide downside protection and liquidity during tight macroeconomic liquidity cycles."
  },
  totalAssets: {
    name: "Total Assets",
    category: "Balance Sheet",
    definition: "The total economic resources owned and controlled by the corporation expected to generate future economic benefits.",
    ngxContext: "Top Tier-1 Nigerian banks (FUGAZ: FirstBank, UBA, GTCO, Access, Zenith) boast balance sheets exceeding ₦15–20 Trillion.",
    interpretation: "Asset growth must be evaluated alongside Return on Assets (ROA) to verify productive asset deployment."
  },
  shortTermDebt: {
    name: "Short-Term Debt & Current Borrowings",
    category: "Balance Sheet",
    definition: "Commercial papers, overdrafts, and bank loans due for repayment within 12 months.",
    ngxContext: "With Nigerian prime lending rates exceeding 25–30%, excessive short-term debt can quickly erode operating margins.",
    interpretation: "Must be covered comfortably by Cash and Current Receivables to avoid short-term insolvency."
  },
  longTermDebt: {
    name: "Long-Term Debt & Bonds",
    category: "Balance Sheet",
    definition: "Corporate bonds, multilateral facility loans, and debentures due beyond one operating cycle (over 12 months).",
    ngxContext: "Often issued via FMDQ or corporate infrastructure debt to finance long-term energy and manufacturing projects.",
    interpretation: "Evaluated using Debt-to-Equity and Interest Coverage ratios to gauge long-term solvency."
  },

  // Income Statement Metrics
  revenue: {
    name: "Revenue / Turnover",
    category: "Income Statement",
    definition: "The gross inflow of economic benefits from primary sales of goods and services during the reporting period.",
    ngxContext: "For MTNN, driven by Voice, Data, and MoMo Fintech revenue; for Seplat, driven by crude oil liftings and gas delivery.",
    interpretation: "Top-line revenue expansion shows market demand and pricing power against local inflation."
  },
  grossProfit: {
    name: "Gross Profit",
    category: "Income Statement",
    definition: "Profit remaining after deducting direct production/raw material costs (Cost of Goods Sold).",
    formula: "Revenue - Cost of Sales",
    ngxContext: "Indicates how well Nigerian manufacturers absorb raw material and energy cost surges (e.g. natural gas & diesel).",
    interpretation: "High gross margins signal strong competitive moats and brand loyalty."
  },
  ebitda: {
    name: "EBITDA",
    category: "Income Statement",
    definition: "Earnings Before Interest, Taxes, Depreciation, and Amortization. Gauges pure operational cash profitability.",
    formula: "Operating Profit + Depreciation + Amortization",
    ngxContext: "Standard metric for telecommunications (MTN Nigeria, Airtel) and heavy capital asset operators.",
    interpretation: "Removes non-cash accounting charges to display baseline operating efficiency."
  },
  operatingProfit: {
    name: "Operating Profit (EBIT)",
    category: "Income Statement",
    definition: "Profit generated from ordinary core operations before accounting for financing costs and government taxation.",
    formula: "Gross Profit - Operating Expenses (OPEX)",
    ngxContext: "Reflects management's discipline in keeping overhead, admin, and selling expenses controlled.",
    interpretation: "A company with strong gross profit but weak operating profit suffers from bloated operational overhead."
  },
  netIncome: {
    name: "Net Income (Profit After Tax - PAT)",
    category: "Income Statement",
    definition: "The final residual 'bottom line' profit available for equity distribution or reinvestment into retained earnings.",
    formula: "Profit Before Tax - Tax Expense",
    ngxContext: "Directly determines the quantum of final dividend payments approved at Annual General Meetings (AGM).",
    interpretation: "Sustainable net income growth fuels capital appreciation and dividend yields."
  },
  eps: {
    name: "Earnings Per Share (EPS)",
    category: "Income Statement",
    definition: "Net profit generated allocated to each outstanding ordinary share of the company.",
    formula: "Net Income / Weighted Average Outstanding Shares",
    ngxContext: "Quoted in Nigerian Naira (₦). A stock trading at ₦40 with ₦8 EPS has an attractive P/E of 5.0x.",
    interpretation: "Core metric for calculating Price-to-Earnings valuation multiples."
  },

  // Cash Flow Metrics
  operatingCashFlow: {
    name: "Operating Cash Flow (OCF)",
    category: "Cash Flow",
    definition: "Actual net physical cash generated from day-to-day business operations, adjusting for working capital changes.",
    ngxContext: "Separates genuine cash-generative firms from paper-profit companies facing customer collection delays.",
    interpretation: "Consistently higher OCF than Net Income indicates stellar earnings quality."
  },
  capitalExpenditures: {
    name: "Capital Expenditures (CapEx)",
    category: "Cash Flow",
    definition: "Funds spent by the business on acquiring, upgrading, or maintaining physical fixed assets (plants, towers, equipment).",
    ngxContext: "Heavy for Dangote Cement (kilns/transport fleet) and MTN Nigeria (5G network infrastructure).",
    interpretation: "Essential for growth, but must yield returns exceeding the Weighted Average Cost of Capital (WACC)."
  },
  freeCashFlow: {
    name: "Free Cash Flow to Firm (FCF)",
    category: "Cash Flow",
    definition: "Discretionary cash remaining after funding all operational expenses and required capital asset maintenance.",
    formula: "Operating Cash Flow - Capital Expenditures",
    ngxContext: "The ultimate source of dividend payouts and share buybacks on the Nigerian Exchange.",
    interpretation: "Positive FCF allows a company to weather recessions, pay dividends, and eliminate expensive bank debt."
  },

  // Valuation & Key Ratios
  peRatio: {
    name: "Price-to-Earnings Ratio (P/E)",
    category: "Valuation & Ratios",
    definition: "Multiple measuring how much investors are willing to pay for each ₦1 of company annual earnings.",
    formula: "Current Share Price / Earnings Per Share (EPS)",
    ngxContext: "NGX Banking stocks traditionally trade at conservative P/E multiples (3x–6x), while Consumer/Tech trade at 12x–25x.",
    interpretation: "Low P/E can indicate undervaluation or market skepticism regarding earnings sustainability."
  },
  dividendYield: {
    name: "Dividend Yield",
    category: "Valuation & Ratios",
    definition: "Annual percentage return an investor receives purely in cash dividends relative to current market price.",
    formula: "(Annual Dividend Per Share / Current Share Price) * 100",
    ngxContext: "Nigerian equities frequently offer generous dividend yields (7%–14%), offering substantial income streams.",
    interpretation: "Should be checked against payout ratio (Dividends/Net Income) to verify dividend sustainability."
  },
  roePct: {
    name: "Return on Equity (ROE)",
    category: "Valuation & Ratios",
    definition: "Measures managerial efficiency at turning every ₦1 of shareholders' equity into net bottom-line profit.",
    formula: "(Net Income / Shareholders' Equity) * 100",
    ngxContext: "Tier-1 Nigerian banks and prime industrial giants often deliver ROEs exceeding 20%–35%.",
    interpretation: "High ROE paired with low debt signals strong operational moats and efficient capital allocation."
  },
  debtToEquity: {
    name: "Debt-to-Equity Ratio (D/E)",
    category: "Valuation & Ratios",
    definition: "Measures financial leverage and capital structure by comparing total debt against shareholder equity.",
    formula: "Total Debt / Shareholders' Equity",
    ngxContext: "Crucial indicator of solvency in high interest rate and currency devaluation regimes in Nigeria.",
    interpretation: "A D/E ratio under 1.0 indicates conservative leverage; over 2.0 indicates significant financial risk."
  }
};

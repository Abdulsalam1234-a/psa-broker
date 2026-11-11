import { FinancialRatioQuestion } from '../types';

export const INITIAL_RATIO_QUESTIONS: FinancialRatioQuestion[] = [
  {
    id: 'pe-ratio-gtco',
    ticker: 'GTCO',
    companyName: 'Guaranty Trust Holding Company Plc',
    ratioName: 'Price-to-Earnings (P/E) Ratio',
    formulaPrompt: 'P/E Ratio = Market Price per Share ÷ Earnings per Share (EPS)',
    formulaHint: 'The P/E ratio tells you how many Naira investors are willing to pay for every ₦1 of current company profits. A lower P/E relative to sector peers often signals undervaluation.',
    dataInputs: [
      { label: 'Current Market Price', value: '₦54.50' },
      { label: 'Earnings Per Share (EPS)', value: '₦10.90' },
      { label: 'Industry Banking Avg P/E', value: '4.8x' }
    ],
    options: [
      { id: 'opt-1', label: '5.0x', isCorrect: true },
      { id: 'opt-2', label: '8.5x', isCorrect: false },
      { id: 'opt-3', label: '2.5x', isCorrect: false },
      { id: 'opt-4', label: '10.9x', isCorrect: false }
    ],
    explanation: '₦54.50 ÷ ₦10.90 = 5.0x. This means GTCO is trading at exactly 5 times its annual earnings per share, very close to the banking sector median of 4.8x.',
    rewardXp: 40
  },
  {
    id: 'roe-mtnn',
    ticker: 'MTNN',
    companyName: 'MTN Nigeria Communications Plc',
    ratioName: 'Return on Equity (ROE %)',
    formulaPrompt: 'ROE (%) = (Net Income ÷ Total Shareholders\' Equity) × 100',
    formulaHint: 'Return on Equity measures management efficiency in generating profits from shareholder capital. ROE above 20% in Nigeria typically indicates an outstanding economic moat.',
    dataInputs: [
      { label: 'Net Income (Trailing 12M)', value: '₦280.0 Billion' },
      { label: 'Shareholders\' Equity', value: '₦700.0 Billion' },
      { label: 'Cost of Equity (WACC)', value: '18.5%' }
    ],
    options: [
      { id: 'opt-1', label: '15.0%', isCorrect: false },
      { id: 'opt-2', label: '40.0%', isCorrect: true },
      { id: 'opt-3', label: '25.0%', isCorrect: false },
      { id: 'opt-4', label: '33.3%', isCorrect: false }
    ],
    explanation: '(₦280.0B ÷ ₦700.0B) × 100 = 40.0%. MTN Nigeria earns ₦40 in pure net profit for every ₦100 of equity invested in the telecom business.',
    rewardXp: 50
  },
  {
    id: 'current-ratio-dangote',
    ticker: 'DANGCEM',
    companyName: 'Dangote Cement Plc',
    ratioName: 'Current Ratio (Liquidity)',
    formulaPrompt: 'Current Ratio = Total Current Assets ÷ Total Current Liabilities',
    formulaHint: 'Current ratio gauges short-term financial solvency. A ratio above 1.2x means the enterprise can comfortably extinguish obligations due within 12 months with short-term assets.',
    dataInputs: [
      { label: 'Total Current Assets', value: '₦650.0 Billion' },
      { label: 'Total Current Liabilities', value: '₦433.3 Billion' },
      { label: 'Cash & Cash Equivalents', value: '₦180.0 Billion' }
    ],
    options: [
      { id: 'opt-1', label: '0.85x', isCorrect: false },
      { id: 'opt-2', label: '1.50x', isCorrect: true },
      { id: 'opt-3', label: '2.25x', isCorrect: false },
      { id: 'opt-4', label: '1.10x', isCorrect: false }
    ],
    explanation: '₦650.0B ÷ ₦433.3B = 1.50x. Dangote Cement possesses ₦1.50 of liquid assets for every ₦1.00 of upcoming short-term liabilities, demonstrating robust solvency.',
    rewardXp: 45
  },
  {
    id: 'de-ratio-zenith',
    ticker: 'ZENITHBANK',
    companyName: 'Zenith Bank Plc',
    ratioName: 'Dividend Yield (%)',
    formulaPrompt: 'Dividend Yield (%) = (Annual Dividend per Share ÷ Market Price) × 100',
    formulaHint: 'Dividend yield tells income-focused investors how much annual cash return they receive per share bought. In Nigeria, high dividend yields provide inflation protection.',
    dataInputs: [
      { label: 'Market Price per Share', value: '₦42.00' },
      { label: 'Full Year Dividend Payout', value: '₦4.20' },
      { label: 'Current CBN MPR Rate', value: '27.25%' }
    ],
    options: [
      { id: 'opt-1', label: '10.0%', isCorrect: true },
      { id: 'opt-2', label: '4.2%', isCorrect: false },
      { id: 'opt-3', label: '14.0%', isCorrect: false },
      { id: 'opt-4', label: '8.0%', isCorrect: false }
    ],
    explanation: '(₦4.20 ÷ ₦42.00) × 100 = 10.0%. Zenith Bank provides a 10% dividend cash yield, paying ₦4.20 on a ₦42 share.',
    rewardXp: 45
  }
];

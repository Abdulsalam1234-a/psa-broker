import { Stock, PortfolioAccount, DividendRecord, CorporateAction } from '../types';

export interface DividendDistributionResult {
  records: DividendRecord[];
  updatedAccount: PortfolioAccount;
  totalNetCredited: number;
}

/**
 * Executes official NGX corporate action dividend distributions.
 * Follows Nigerian Federal Inland Revenue Service (FIRS) statutory deduction:
 * 10% Withholding Tax (WHT) deducted at source, 90% credited directly into investor cash balance.
 */
export function processDividendsForAccount(
  account: PortfolioAccount,
  stocks: Stock[],
  userId: string
): DividendDistributionResult {
  const newRecords: DividendRecord[] = [];
  let totalNetCredited = 0;

  // Clone account
  const updatedAccount: PortfolioAccount = {
    ...account,
    positions: [...account.positions],
  };

  const todayStr = new Date().toISOString().split('T')[0];

  stocks.forEach(stock => {
    // Find dividend corporate action
    const divAction = stock.corporateActions.find(
      ca => ca.type === 'DIVIDEND' && ca.dividendAmount && ca.dividendAmount > 0
    );

    if (!divAction || !divAction.dividendAmount) return;

    // Check if user has an active position in this stock
    const position = updatedAccount.positions.find(p => p.ticker === stock.ticker);
    if (!position || position.quantity <= 0) return;

    const shares = position.quantity;
    const dps = divAction.dividendAmount;
    const grossPayout = Number((shares * dps).toFixed(2));
    const wht = Number((grossPayout * 0.10).toFixed(2)); // 10% Nigerian WHT
    const netPayout = Number((grossPayout - wht).toFixed(2));

    const record: DividendRecord = {
      id: `div-${stock.ticker}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      accountId: account.id,
      ticker: stock.ticker,
      stockName: stock.name,
      sharesHeld: shares,
      dividendPerShare: dps,
      totalPayoutGross: grossPayout,
      withholdingTax: wht,
      netPayoutCredited: netPayout,
      paymentDate: divAction.paymentDate || todayStr,
      qualificationDate: divAction.qualificationDate || todayStr,
      paidAt: new Date().toISOString()
    };

    newRecords.push(record);
    totalNetCredited += netPayout;
  });

  if (totalNetCredited > 0) {
    updatedAccount.cashBalance = Number((updatedAccount.cashBalance + totalNetCredited).toFixed(2));
    updatedAccount.portfolioValue = Number((updatedAccount.portfolioValue + totalNetCredited).toFixed(2));
    updatedAccount.realizedPnl = Number((updatedAccount.realizedPnl + totalNetCredited).toFixed(2));
  }

  return {
    records: newRecords,
    updatedAccount,
    totalNetCredited
  };
}

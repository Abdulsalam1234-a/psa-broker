/**
 * Nigerian Exchange (NGX) Official Market Hours & Settlement Service
 * Official Trading Sessions: Monday – Friday, 9:00 AM – 4:00 PM West Africa Time (WAT, UTC+1)
 * Official Settlement Basis: T+1 (Next business day delivery versus payment via CSCS)
 * Closed on Weekends (Saturdays & Sundays) and Official Public Holidays
 */

export interface MarketStatus {
  isOpen: boolean;
  statusText: string;
  sessionDetails: string;
  isWeekend: boolean;
  nextSessionText: string;
  watTimeStr: string;
  settlementCycle: string;
}

export function getNGXMarketStatus(): MarketStatus {
  const now = new Date();
  
  // Convert current time to West Africa Time (UTC+1)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const watDate = new Date(utc + (3600000 * 1));

  const dayOfWeek = watDate.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = watDate.getHours();
  const minutes = watDate.getMinutes();
  const timeInMinutes = (hours * 60) + minutes;

  const isSaturday = dayOfWeek === 6;
  const isSunday = dayOfWeek === 0;
  const isWeekend = isSaturday || isSunday;

  // Updated Official NGX Trading Window: 9:00 AM (540 mins) to 4:00 PM (960 mins) WAT
  const MARKET_OPEN_MINS = 9 * 60;   // 9:00 AM WAT
  const MARKET_CLOSE_MINS = 16 * 60; // 4:00 PM WAT

  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isOpen = isWeekday && (timeInMinutes >= MARKET_OPEN_MINS && timeInMinutes <= MARKET_CLOSE_MINS);

  const hoursStr = watDate.getHours().toString().padStart(2, '0');
  const minsStr = watDate.getMinutes().toString().padStart(2, '0');
  const watTimeStr = `${hoursStr}:${minsStr} WAT`;
  const settlementCycle = 'T+1 Settlement Basis';

  if (isWeekend) {
    return {
      isOpen: false,
      statusText: 'NGX MARKET CLOSED',
      sessionDetails: 'Weekend Session (Official Closing Fix Preserved)',
      isWeekend: true,
      nextSessionText: 'Next Trading: Monday at 9:00 AM WAT',
      watTimeStr,
      settlementCycle,
    };
  }

  if (timeInMinutes < MARKET_OPEN_MINS) {
    return {
      isOpen: false,
      statusText: 'PRE-MARKET AUCTION',
      sessionDetails: 'Pre-Market Order Routing (Continuous Trading at 9:00 AM)',
      isWeekend: false,
      nextSessionText: 'Opens today at 9:00 AM WAT',
      watTimeStr,
      settlementCycle,
    };
  }

  if (timeInMinutes > MARKET_CLOSE_MINS) {
    return {
      isOpen: false,
      statusText: 'MARKET CLOSED',
      sessionDetails: 'Official Daily Closing Fix Established (T+1 Clearing)',
      isWeekend: false,
      nextSessionText: 'Next session tomorrow at 9:00 AM WAT',
      watTimeStr,
      settlementCycle,
    };
  }

  return {
    isOpen: true,
    statusText: 'NGX MARKET LIVE',
    sessionDetails: 'Continuous Automated Order Execution Active (T+1)',
    isWeekend: false,
    nextSessionText: 'Closes today at 4:00 PM WAT',
    watTimeStr,
    settlementCycle,
  };
}

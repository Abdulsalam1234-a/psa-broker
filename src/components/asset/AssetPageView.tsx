import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Stock, OrderType, OrderSide, StockNewsItem } from '../../types';
import { formatNaira, calculateNGXTransactionFee } from '../../services/feeEngine';
import { getNGXMarketStatus } from '../../services/marketHours';
import { TradingViewChart } from '../trading/TradingViewChart';
import { TradingViewWidget } from '../trading/TradingViewWidget';
import { OrderBookLevel2 } from '../trading/OrderBookLevel2';
import { generateOrderBook } from '../../services/marketSimulator';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Clock, 
  ShieldCheck, 
  Info, 
  FileText, 
  Newspaper, 
  BarChart2, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Layers,
  ChevronDown,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink,
  Share2
} from 'lucide-react';
import { getWhatsAppShareUrl } from '../../services/whatsappFormatter';

interface AssetPageViewProps {
  ticker: string;
  onBack: () => void;
  onInspectFundamentals?: (stock: Stock) => void;
}

export const AssetPageView: React.FC<AssetPageViewProps> = ({ 
  ticker, 
  onBack,
  onInspectFundamentals
}) => {
  const { 
    stocks, 
    activeAccount, 
    watchlist, 
    toggleWatchlist, 
    placeOrder, 
    currentUser,
    marketNews
  } = useApp();

  const stock = useMemo(() => {
    return stocks.find(s => s.ticker === ticker) || stocks[0];
  }, [stocks, ticker]);

  const marketStatus = getNGXMarketStatus();
  const isWatchlisted = watchlist.includes(stock.ticker);

  // User's personal holding in this specific stock
  const holding = useMemo(() => {
    return activeAccount.positions.find(p => p.ticker === stock.ticker);
  }, [activeAccount.positions, stock.ticker]);

  // Order Book
  const orderBook = useMemo(() => {
    return generateOrderBook(stock);
  }, [stock]);

  // View settings
  const [chartMode, setChartMode] = useState<'CANVAS' | 'TRADINGVIEW'>('CANVAS');
  const [statementTab, setStatementTab] = useState<'BS' | 'IS' | 'CF'>('BS');

  // Order Form State
  const [ticketInputMode, setTicketInputMode] = useState<'UNITS' | 'NAIRA'>('UNITS');
  const [nairaTicketInput, setNairaTicketInput] = useState<string>('50000');
  const [activeSide, setActiveSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState<number>(100);
  const [targetPrice, setTargetPrice] = useState<number>(stock.currentPrice);
  const [stopLossPrice, setStopLossPrice] = useState<number | undefined>(undefined);
  const [thesisNote, setThesisNote] = useState<string>('');

  // Confirmation Pop-up State
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [orderResult, setOrderResult] = useState<{ success: boolean; message: string } | null>(null);

  // Computed Order Amounts
  const executionBasePrice = orderType === 'MARKET' ? stock.currentPrice : (targetPrice || stock.currentPrice);
  const grossAmount = Number((executionBasePrice * quantity).toFixed(2));
  const feeDetails = useMemo(() => calculateNGXTransactionFee(grossAmount), [grossAmount]);
  const netAmount = activeSide === 'BUY'
    ? Number((grossAmount + feeDetails.totalFee).toFixed(2))
    : Number((grossAmount - feeDetails.totalFee).toFixed(2));

  // Max sellable units constraint
  const maxSellUnits = holding ? holding.quantity : 0;
  const canSell = maxSellUnits > 0;

  // Max buyable units constraint based on cash
  const maxBuyUnits = Math.max(0, Math.floor(activeAccount.cashBalance / (executionBasePrice * 1.014775)));

  // Filter relevant live simulation news
  const liveNewsForAsset = useMemo(() => {
    const live = marketNews.filter(n => 
      n.affectedTicker === stock.ticker || 
      n.affectedSector === stock.sector ||
      n.category === 'DOMESTIC_MACRO' ||
      n.category === 'WORLD_MACRO'
    );
    return live;
  }, [marketNews, stock.ticker, stock.sector]);

  // Handle open confirm modal
  const handleInitiateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderResult(null);

    if (activeSide === 'SELL') {
      if (!canSell) {
        setOrderResult({ success: false, message: `You cannot sell ${stock.ticker} because you do not hold any shares in this portfolio.` });
        return;
      }
      if (quantity > maxSellUnits) {
        setOrderResult({ success: false, message: `Cannot sell ${quantity} units. You only hold ${maxSellUnits} units.` });
        return;
      }
    } else {
      if (netAmount > activeAccount.cashBalance) {
        setOrderResult({ success: false, message: `Insufficient cash. Required ${formatNaira(netAmount)}, but available cash is ${formatNaira(activeAccount.cashBalance)}.` });
        return;
      }
    }

    if (quantity <= 0) {
      setOrderResult({ success: false, message: 'Please enter a valid unit quantity greater than zero.' });
      return;
    }

    if (grossAmount < 1000) {
      const minUnits = Math.ceil(1000 / (executionBasePrice || 1));
      setOrderResult({ 
        success: false, 
        message: `Minimum order value on PSA Broker is ₦1,000.00 (Current order: ${formatNaira(grossAmount)}). Please trade at least ${minUnits.toLocaleString()} units.` 
      });
      return;
    }

    setShowConfirmModal(true);
  };

  // Execute finalized order
  const handleConfirmOrder = () => {
    const result = placeOrder({
      ticker: stock.ticker,
      orderType,
      orderSide: activeSide,
      quantity,
      targetPrice: orderType === 'LIMIT' ? targetPrice : undefined,
      stopLossPrice,
      thesisNote: thesisNote.trim().length > 0 ? thesisNote : undefined,
    });

    setOrderResult(result);
    setShowConfirmModal(false);

    if (result.success) {
      setThesisNote('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-700/80 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-600 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">{stock.ticker}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-navy-800 text-gold-300 border border-gold-500/30 font-semibold">
                {stock.sector}
              </span>
              <button
                onClick={() => toggleWatchlist(stock.ticker)}
                className={`p-1.5 rounded-lg border transition-all ${
                  isWatchlisted
                    ? 'bg-gold-500/20 text-gold-400 border-gold-500/40'
                    : 'bg-navy-800 text-slate-400 border-navy-700 hover:text-white'
                }`}
                title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-gold-400' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{stock.name}</p>
          </div>
        </div>

        {/* Current Price & Day Change */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              ₦{stock.currentPrice.toFixed(2)}
            </div>
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold font-mono">
              <span className={stock.dayChange >= 0 ? 'text-bull' : 'text-bear'}>
                {stock.dayChange >= 0 ? '+' : ''}₦{stock.dayChange.toFixed(2)} ({stock.dayChangePct >= 0 ? '+' : ''}{stock.dayChangePct}%)
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Personal Holding Banner (User Requirement) */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        holding 
          ? 'bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border-gold-500/40 shadow-xl' 
          : 'bg-navy-900/60 border-navy-800 text-slate-400'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${holding ? 'text-gold-400' : 'text-slate-500'}`} />
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-300">
              Your Position in {stock.ticker} ({activeAccount.name})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            T+1 Settlement
          </span>
        </div>

        {holding ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-navy-950/60 p-3 rounded-xl border border-navy-800">
              <div className="text-[11px] text-slate-400">Units Owned</div>
              <div className="text-base font-black font-mono text-white mt-0.5">
                {holding.quantity.toLocaleString()} shares
              </div>
              <div className="text-[10px] text-gold-400">{holding.portfolioWeightPct}% of portfolio</div>
            </div>

            <div className="bg-navy-950/60 p-3 rounded-xl border border-navy-800">
              <div className="text-[11px] text-slate-400">Average Buy Price</div>
              <div className="text-base font-black font-mono text-slate-200 mt-0.5">
                ₦{holding.avgBuyPrice.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500">Total: {formatNaira(holding.totalCost)}</div>
            </div>

            <div className="bg-navy-950/60 p-3 rounded-xl border border-navy-800">
              <div className="text-[11px] text-slate-400">Current Value</div>
              <div className="text-base font-black font-mono text-white mt-0.5">
                {formatNaira(holding.marketValue)}
              </div>
              <div className="text-[10px] text-slate-400">At ₦{stock.currentPrice.toFixed(2)}/sh</div>
            </div>

            <div className="bg-navy-950/60 p-3 rounded-xl border border-navy-800">
              <div className="text-[11px] text-slate-400">Growth Rate (%)</div>
              <div className={`text-base font-black font-mono mt-0.5 flex items-center gap-1 ${
                holding.unrealizedPnl >= 0 ? 'text-bull' : 'text-bear'
              }`}>
                {holding.unrealizedPnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{holding.unrealizedPnl >= 0 ? '+' : ''}{holding.unrealizedPnlPct.toFixed(2)}%</span>
              </div>
              <div className="text-[10px] text-slate-400">Unrealized return</div>
            </div>

            <div className="bg-navy-950/60 p-3 rounded-xl border border-navy-800 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-400">Amount Grown By (₦)</div>
              <div className={`text-base font-black font-mono mt-0.5 ${
                holding.unrealizedPnl >= 0 ? 'text-bull' : 'text-bear'
              }`}>
                {holding.unrealizedPnl >= 0 ? '+' : ''}{formatNaira(holding.unrealizedPnl)}
              </div>
              <div className="text-[10px] text-slate-400">Net profit/loss</div>
            </div>
          </div>
        ) : (
          <div className="py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Info className="w-4 h-4 text-gold-400 shrink-0" />
              <span>
                You do not currently own any shares of <strong>{stock.ticker}</strong> in this account. Use the Buy panel below to initiate an equity stake.
              </span>
            </div>
            <div className="text-slate-300 font-mono">
              Available Cash: <strong className="text-white">{formatNaira(activeAccount.cashBalance)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* 3. Interactive Chart & Trading Engine Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Chart Container (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-4 shadow-xl">
            {/* Chart Header Bar */}
            <div className="flex items-center justify-between mb-3 border-b border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-gold-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Technical Candlestick Chart
                </span>
              </div>

              {/* Engine Toggle */}
              <div className="flex items-center gap-1.5 bg-navy-950 p-1 rounded-xl border border-navy-800 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setChartMode('CANVAS')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    chartMode === 'CANVAS'
                      ? 'bg-gold-500 text-navy-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Lightweight Canvas (Simulated & Local)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('TRADINGVIEW')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    chartMode === 'TRADINGVIEW'
                      ? 'bg-gold-500 text-navy-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  TradingView Cloud (NSENG)
                </button>
              </div>
            </div>

            {/* Actual Chart Embed */}
            <div className="min-h-[420px] rounded-xl overflow-hidden bg-navy-950 border border-navy-800">
              {chartMode === 'TRADINGVIEW' ? (
                <TradingViewWidget stock={stock} onSwitchToCanvas={() => setChartMode('CANVAS')} />
              ) : (
                <TradingViewChart stock={stock} />
              )}
            </div>

            {/* Key Ratios Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-navy-800 text-xs">
              <div className="p-2 rounded-lg bg-navy-950/60">
                <span className="text-[10px] text-slate-500">Day High / Low</span>
                <div className="font-mono font-bold text-white">₦{stock.dayHigh.toFixed(2)} - ₦{stock.dayLow.toFixed(2)}</div>
              </div>
              <div className="p-2 rounded-lg bg-navy-950/60">
                <span className="text-[10px] text-slate-500">52-Wk High / Low</span>
                <div className="font-mono font-bold text-white">₦{stock.yearHigh.toFixed(2)} - ₦{stock.yearLow.toFixed(2)}</div>
              </div>
              <div className="p-2 rounded-lg bg-navy-950/60">
                <span className="text-[10px] text-slate-500">P/E Ratio</span>
                <div className="font-mono font-bold text-white">{stock.peRatio}x</div>
              </div>
              <div className="p-2 rounded-lg bg-navy-950/60">
                <span className="text-[10px] text-slate-500">Dividend Yield</span>
                <div className="font-mono font-bold text-gold-400">{stock.dividendYield}%</div>
              </div>
            </div>
          </div>

          {/* Market News & Disclosures Section */}
          <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-gold-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live NGX Market Disclosures & WhatsApp Broadcasts
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Institutional Feed</span>
            </div>

            <div className="divide-y divide-navy-800">
              {liveNewsForAsset.length > 0 ? (
                liveNewsForAsset.map((news) => (
                  <div key={news.id} className="py-3.5 first:pt-1 last:pb-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-navy-950 text-gold-300 border border-navy-800">
                          {news.sourceName}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          news.sentiment.includes('BULLISH') ? 'bg-bull/20 text-bull border border-bull/30' :
                          news.sentiment.includes('BEARISH') ? 'bg-bear/20 text-bear border border-bear/30' :
                          'bg-navy-800 text-slate-300'
                        }`}>
                          {news.sentiment.replace('_', ' ')} ({news.priceImpactPct >= 0 ? '+' : ''}{news.priceImpactPct}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(news.publishedAt).toLocaleDateString()}
                        </span>

                        <a
                          href={getWhatsAppShareUrl(news.whatsappDraft || news.headline)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded-lg bg-[#00a884]/20 hover:bg-[#00a884] text-[#00a884] hover:text-black text-[10px] font-black transition-all flex items-center gap-1 border border-[#00a884]/40"
                          title="Share to WhatsApp Community"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Share WA</span>
                        </a>
                      </div>
                    </div>

                    <h4 className="text-xs font-black text-white hover:text-gold-400 transition-colors leading-snug">
                      {news.headline}
                    </h4>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {news.summary}
                    </p>

                    {news.corporateDisclosure && (
                      <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-300 font-mono">
                        {news.corporateDisclosure.patGrowthPct !== undefined && (
                          <span>PAT: <strong className="text-bull">+{news.corporateDisclosure.patGrowthPct}% YoY</strong></span>
                        )}
                        {news.corporateDisclosure.dividendPerShare !== undefined && (
                          <span>Dividend: <strong className="text-gold-400">₦{news.corporateDisclosure.dividendPerShare.toFixed(2)}/sh</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-slate-500 text-xs">
                  No direct corporate filings recorded for {stock.ticker} today. Price remains anchored to NGX benchmarks.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Buy / Sell Order Panel & Level 2 Depth (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Order Placement Box */}
          <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-5 shadow-xl space-y-4">
            
            {/* Side Selector (BUY vs SELL) */}
            <div className="grid grid-cols-2 p-1 bg-navy-950 rounded-xl border border-navy-800 font-black text-xs">
              <button
                type="button"
                onClick={() => { setActiveSide('BUY'); setOrderResult(null); }}
                className={`py-2 rounded-lg transition-all ${
                  activeSide === 'BUY'
                    ? 'bg-bull text-navy-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                BUY {stock.ticker}
              </button>
              <button
                type="button"
                onClick={() => { setActiveSide('SELL'); setOrderResult(null); }}
                className={`py-2 rounded-lg transition-all ${
                  activeSide === 'SELL'
                    ? 'bg-bear text-white shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SELL {stock.ticker}
              </button>
            </div>

            {/* Notification Messages */}
            {orderResult && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 animate-in fade-in ${
                orderResult.success 
                  ? 'bg-bull/15 border border-bull/40 text-bull' 
                  : 'bg-bear/15 border border-bear/40 text-bear'
              }`}>
                {orderResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>{orderResult.message}</span>
              </div>
            )}

            {/* Sell Restriction Check */}
            {activeSide === 'SELL' && !canSell && (
              <div className="p-3.5 rounded-xl bg-navy-950 border border-bear/40 text-bear text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Position Required to Sell</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  You hold 0 units of {stock.ticker} in this account. Short selling is prohibited under standard Nigerian Exchange rules.
                </p>
              </div>
            )}

            <form onSubmit={handleInitiateOrder} className="space-y-3.5">
              
              {/* Order Type Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Order Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('MARKET')}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      orderType === 'MARKET'
                        ? 'bg-gold-500 text-navy-950 border-gold-400 font-black'
                        : 'bg-navy-950 text-slate-300 border-navy-700 hover:border-slate-500'
                    }`}
                  >
                    Market (Instant)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('LIMIT')}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      orderType === 'LIMIT'
                        ? 'bg-gold-500 text-navy-950 border-gold-400 font-black'
                        : 'bg-navy-950 text-slate-300 border-navy-700 hover:border-slate-500'
                    }`}
                  >
                    Limit Order
                  </button>
                </div>
              </div>

              {/* Quantity / Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 bg-navy-950 p-0.5 rounded-lg border border-navy-800">
                    <button
                      type="button"
                      onClick={() => setTicketInputMode('UNITS')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                        ticketInputMode === 'UNITS'
                          ? 'bg-gold-500 text-navy-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      By Units
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTicketInputMode('NAIRA');
                        setNairaTicketInput(String(Math.max(1000, grossAmount)));
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                        ticketInputMode === 'NAIRA'
                          ? 'bg-gold-500 text-navy-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      By Value (₦)
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {activeSide === 'SELL' ? `Max: ${maxSellUnits.toLocaleString()} units` : `Max: ${maxBuyUnits.toLocaleString()} units`}
                  </span>
                </div>

                {ticketInputMode === 'UNITS' ? (
                  <div>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      max={activeSide === 'SELL' ? maxSellUnits : undefined}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      placeholder="Enter share units..."
                      className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-gold-500"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 px-0.5">
                      <span>Order Value: <strong className="text-white font-mono">{formatNaira(grossAmount)}</strong></span>
                      <span className={grossAmount >= 1000 ? 'text-bull font-bold' : 'text-amber-400 font-bold'}>
                        {grossAmount >= 1000 ? '✓ Value ≥ ₦1,000' : '⚠️ Min order value is ₦1,000'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">₦</span>
                      <input
                        type="number"
                        min="1000"
                        step="100"
                        value={nairaTicketInput}
                        onChange={(e) => {
                          const str = e.target.value;
                          setNairaTicketInput(str);
                          const val = parseFloat(str) || 0;
                          const calculatedUnits = Math.max(1, Math.floor(val / (executionBasePrice || 1)));
                          setQuantity(calculatedUnits);
                        }}
                        placeholder="Min ₦1,000 (e.g. 50000)"
                        className="w-full pl-7 pr-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 px-0.5">
                      <span>Equivalent: <strong className="text-gold-400 font-mono font-bold">{quantity.toLocaleString()} units</strong></span>
                      <span className={grossAmount >= 1000 ? 'text-bull font-bold' : 'text-amber-400 font-bold'}>
                        {grossAmount >= 1000 ? '✓ Valid (≥ ₦1,000)' : '⚠️ Min ₦1,000'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Unit Shortcuts */}
                {activeSide === 'SELL' && canSell && (
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, Math.floor(maxSellUnits * 0.25)))}
                      className="py-1 rounded bg-navy-950 hover:bg-navy-800 text-[10px] text-slate-300 border border-navy-800 font-mono"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, Math.floor(maxSellUnits * 0.50)))}
                      className="py-1 rounded bg-navy-950 hover:bg-navy-800 text-[10px] text-slate-300 border border-navy-800 font-mono"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuantity(maxSellUnits)}
                      className="py-1 rounded bg-navy-950 hover:bg-navy-800 text-[10px] text-gold-400 border border-gold-500/30 font-mono font-bold"
                    >
                      100% (All)
                    </button>
                  </div>
                )}
              </div>

              {/* Limit Target Price (if Limit) */}
              {orderType === 'LIMIT' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Target Execution Price (₦)
                    </label>
                    <span className="text-[10px] text-gold-400">Current: ₦{stock.currentPrice.toFixed(2)}</span>
                  </div>
                  <input
                    type="number"
                    step="0.05"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(parseFloat(e.target.value) || stock.currentPrice)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              )}

              {/* Research Thesis / Notes (Academy XP Reward) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                    <span>Thesis Note (+25 XP)</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </div>
                <input
                  type="text"
                  value={thesisNote}
                  onChange={(e) => setThesisNote(e.target.value)}
                  placeholder="Rationale e.g. Q3 earnings growth, dividend yield..."
                  className="w-full px-3 py-1.5 bg-navy-950 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Itemized Order Estimate */}
              <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Value:</span>
                  <span className="font-mono text-slate-200">{formatNaira(grossAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <span>Est. NGX Fees (~1.48%):</span>
                    <span title="SEC 0.3%, CSCS 0.35%, Broker 0.7%, Stamp 0.075%, VAT">
                      <HelpCircle className="w-3 h-3 text-slate-500" />
                    </span>
                  </span>
                  <span className="font-mono text-slate-200">{formatNaira(feeDetails.totalFee)}</span>
                </div>
                <div className="pt-1.5 border-t border-navy-800 flex justify-between font-bold">
                  <span className="text-white">
                    {activeSide === 'BUY' ? 'Total Cash Debit:' : 'Net Proceeds to Credit:'}
                  </span>
                  <span className={`font-mono ${activeSide === 'BUY' ? 'text-gold-400' : 'text-bull'}`}>
                    {formatNaira(netAmount)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={activeSide === 'SELL' && !canSell}
                className={`w-full py-3 rounded-xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                  activeSide === 'BUY'
                    ? 'bg-bull hover:bg-emerald-400 text-navy-950 shadow-bull/20'
                    : canSell 
                      ? 'bg-bear hover:bg-rose-600 text-white shadow-bear/20'
                      : 'bg-navy-800 text-slate-500 cursor-not-allowed border border-navy-700'
                }`}
              >
                <span>
                  Review & Confirm {activeSide} Order
                </span>
              </button>
            </form>
          </div>

          {/* Level 2 Order Book Depth */}
          <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-4 shadow-xl">
            <OrderBookLevel2 stock={stock} />
          </div>

        </div>

      </div>

      {/* 4. 3-Statement Financial Teardown Section (Terminal Integration) */}
      <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-navy-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-black text-white">
                3-Statement Financial Teardown
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-500/30 font-semibold">
                {stock.balanceSheet.fiscalYear}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official institutional filings for Nigerian corporate analysis and valuation models.
            </p>
          </div>

          {/* Statement Tab Buttons */}
          <div className="flex items-center gap-1.5 bg-navy-950 p-1 rounded-xl border border-navy-800 text-xs font-bold">
            <button
              onClick={() => setStatementTab('BS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statementTab === 'BS'
                  ? 'bg-gold-500 text-navy-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Balance Sheet
            </button>
            <button
              onClick={() => setStatementTab('IS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statementTab === 'IS'
                  ? 'bg-gold-500 text-navy-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income Statement
            </button>
            <button
              onClick={() => setStatementTab('CF')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statementTab === 'CF'
                  ? 'bg-gold-500 text-navy-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cash Flow
            </button>
          </div>
        </div>

        {/* Statement Content */}
        {statementTab === 'BS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-2 text-xs">
              <h4 className="font-bold text-gold-400 uppercase text-[11px] tracking-wider">Assets ({stock.balanceSheet.currency})</h4>
              <div className="flex justify-between py-1 border-b border-navy-800/80">
                <span className="text-slate-400">Cash & Equivalents:</span>
                <span className="font-mono font-bold text-white">₦{stock.balanceSheet.cashAndEquivalents.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-800/80">
                <span className="text-slate-400">Trade Receivables:</span>
                <span className="font-mono text-slate-300">₦{stock.balanceSheet.tradeReceivables.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-800/80">
                <span className="text-slate-400">Property, Plant & Equipment:</span>
                <span className="font-mono text-slate-300">₦{stock.balanceSheet.propertyPlantEquipment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-white">
                <span>Total Assets:</span>
                <span className="font-mono text-gold-400">₦{stock.balanceSheet.totalAssets.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-2 text-xs">
              <h4 className="font-bold text-gold-400 uppercase text-[11px] tracking-wider">Liabilities & Equity ({stock.balanceSheet.currency})</h4>
              <div className="flex justify-between py-1 border-b border-navy-800/80">
                <span className="text-slate-400">Short-Term Debt & Payables:</span>
                <span className="font-mono text-slate-300">₦{stock.balanceSheet.totalCurrentLiabilities.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-800/80">
                <span className="text-slate-400">Long-Term Debt:</span>
                <span className="font-mono text-slate-300">₦{stock.balanceSheet.longTermDebt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-800/80">
                <span className="text-slate-400">Retained Earnings:</span>
                <span className="font-mono text-bull font-bold">₦{stock.balanceSheet.retainedEarnings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-white">
                <span>Shareholders Equity:</span>
                <span className="font-mono text-gold-400">₦{stock.balanceSheet.shareholdersEquity.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {statementTab === 'IS' && (
          <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-2 text-xs">
            <h4 className="font-bold text-gold-400 uppercase text-[11px] tracking-wider">Income Statement Performance ({stock.incomeStatement.currency})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-navy-800/80">
                  <span className="text-slate-400">Gross Revenue:</span>
                  <span className="font-mono font-bold text-white">₦{stock.incomeStatement.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-800/80">
                  <span className="text-slate-400">Cost of Sales:</span>
                  <span className="font-mono text-slate-300">₦{stock.incomeStatement.costOfSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-800/80">
                  <span className="text-slate-400">Gross Profit:</span>
                  <span className="font-mono text-bull font-bold">₦{stock.incomeStatement.grossProfit.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-navy-800/80">
                  <span className="text-slate-400">Operating Profit (EBIT):</span>
                  <span className="font-mono text-slate-200">₦{stock.incomeStatement.operatingProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-800/80">
                  <span className="text-slate-400">Profit Before Tax (PBT):</span>
                  <span className="font-mono text-slate-200">₦{stock.incomeStatement.profitBeforeTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-800/80">
                  <span className="text-slate-400">Net Income:</span>
                  <span className="font-mono text-gold-400 font-bold">₦{stock.incomeStatement.netIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 font-bold text-white">
                  <span>Earnings Per Share (EPS):</span>
                  <span className="font-mono text-bull">₦{stock.incomeStatement.eps.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {statementTab === 'CF' && (
          <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-2 text-xs">
            <h4 className="font-bold text-gold-400 uppercase text-[11px] tracking-wider">Cash Flow Statement ({stock.cashFlow.currency})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-navy-800/80">
                  <span className="text-slate-400">Operating Cash Flow:</span>
                  <span className="font-mono font-bold text-bull">₦{stock.cashFlow.operatingCashFlow.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-800/80">
                  <span className="text-slate-400">Capital Expenditures (CapEx):</span>
                  <span className="font-mono text-bear">₦{stock.cashFlow.capitalExpenditures.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-800/80">
                  <span className="text-slate-400">Free Cash Flow:</span>
                  <span className="font-mono text-gold-400 font-bold">₦{stock.cashFlow.freeCashFlow.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-navy-800/80">
                  <span className="text-slate-400">Investing Cash Flow:</span>
                  <span className="font-mono text-slate-300">₦{stock.cashFlow.investingCashFlow.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-navy-800/80">
                  <span className="text-slate-400">Dividends Paid to Shareholders:</span>
                  <span className="font-mono text-bear">₦{stock.cashFlow.dividendsPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 font-bold text-white">
                  <span>Net Cash Flow:</span>
                  <span className="font-mono text-white">₦{stock.cashFlow.netCashFlow.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Order Confirmation Pop-up Modal (Mandatory User Requirement) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-navy-900 border border-gold-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-navy-950 p-5 border-b border-navy-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                  activeSide === 'BUY' ? 'bg-bull/20 text-bull' : 'bg-bear/20 text-bear'
                }`}>
                  {activeSide === 'BUY' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Confirm {activeSide} Order: {stock.ticker}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Nigerian Exchange Statutory Review & Pre-Execution Verification
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body: Itemized Breakdown */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account:</span>
                  <span className="font-bold text-white">{activeAccount.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ticker:</span>
                  <span className="font-bold text-gold-400">{stock.ticker} ({stock.name})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Order Side & Type:</span>
                  <span className="font-bold text-white">{activeSide} ({orderType})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity:</span>
                  <span className="font-mono font-bold text-white">{quantity.toLocaleString()} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unit Price:</span>
                  <span className="font-mono text-slate-200">₦{executionBasePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-navy-800 font-bold">
                  <span className="text-slate-300">Gross Consideration:</span>
                  <span className="font-mono text-white">{formatNaira(grossAmount)}</span>
                </div>
              </div>

              {/* Itemized NGX Statutory Fee Table */}
              <div className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Itemized Regulatory Fees (NGX / CSCS / SEC)
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>SEC Regulatory Fee (0.30%):</span>
                  <span className="font-mono text-slate-300">₦{feeDetails.secFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>CSCS Clearing Fee (0.35%):</span>
                  <span className="font-mono text-slate-300">₦{feeDetails.cscsFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Brokerage Commission (0.70%):</span>
                  <span className="font-mono text-slate-300">₦{feeDetails.brokerFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Stamp Duty (0.075%):</span>
                  <span className="font-mono text-slate-300">₦{feeDetails.stampDuty.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>VAT (7.5% on Brokerage):</span>
                  <span className="font-mono text-slate-300">₦{feeDetails.vatFee.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-navy-800 flex justify-between font-bold text-sm">
                  <span className="text-white">
                    {activeSide === 'BUY' ? 'Total Cash Required:' : 'Net Proceeds to Receive:'}
                  </span>
                  <span className={`font-mono ${activeSide === 'BUY' ? 'text-gold-400 font-black' : 'text-bull font-black'}`}>
                    {formatNaira(netAmount)}
                  </span>
                </div>
              </div>

              {/* Settlement Notice */}
              <div className="p-3 rounded-xl bg-navy-800/80 border border-gold-500/30 text-[11px] text-slate-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">T+1 Settlement Policy:</strong> Cash and equity delivery will settle next business day in accordance with official NGX / CSCS clearing rules.
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-navy-950 p-4 border-t border-navy-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel & Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                className={`px-6 py-2.5 rounded-xl font-black text-xs shadow-lg transition-all flex items-center gap-2 ${
                  activeSide === 'BUY'
                    ? 'bg-bull hover:bg-emerald-400 text-navy-950 shadow-bull/20'
                    : 'bg-bear hover:bg-rose-600 text-white shadow-bear/20'
                }`}
              >
                <span>Authorize & Place {activeSide} Order</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

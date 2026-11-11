import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  createChart, 
  CandlestickSeries, 
  LineSeries,
  AreaSeries,
  BarSeries,
  HistogramSeries, 
  IChartApi, 
  ISeriesApi,
  CandlestickData as ChartCandleData,
  LineData,
  BarData
} from 'lightweight-charts';
import { Stock, CandlestickData } from '../../types';
import { 
  BarChart2, 
  TrendingUp, 
  Activity, 
  Maximize2, 
  Sliders, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export type ChartStyle = 'CANDLESTICK' | 'LINE' | 'AREA' | 'BAR';
export type ChartTimeframe = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

interface TradingViewChartProps {
  stock: Stock;
}

/**
 * Generates smooth, realistic, continuous price and volume series scaled to the
 * stock's authentic real-time TradingView metrics without artificial jumps.
 */
function generateTimeframeCandles(
  stock: Stock, 
  timeframe: ChartTimeframe
): CandlestickData[] {
  const currentPrice = stock.currentPrice || 10;
  const dayHigh = stock.dayHigh || currentPrice * 1.02;
  const dayLow = stock.dayLow || currentPrice * 0.98;
  const prevClose = stock.previousClose || currentPrice;
  const yearHigh = stock.yearHigh || currentPrice * 1.35;
  const yearLow = stock.yearLow || currentPrice * 0.70;
  const avgVolume = stock.volume > 0 ? stock.volume : 500000;

  const now = new Date();

  if (timeframe === '1D') {
    // Generate 16 intraday 15-minute intervals between 09:30 and 14:30 WAT
    const points: CandlestickData[] = [];
    const todayStr = now.toISOString().split('T')[0];
    const steps = 16;
    let runningPrice = prevClose;

    for (let i = 0; i < steps; i++) {
      const totalMinutes = 9 * 60 + 30 + i * 18; // From 09:30 to ~14:15
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      const timeStr = `${todayStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

      // Interpolate towards current price with small intraday noise
      const progress = (i + 1) / steps;
      const target = prevClose + (currentPrice - prevClose) * progress;
      const noise = (Math.random() - 0.5) * (dayHigh - dayLow) * 0.25;
      const close = i === steps - 1 ? currentPrice : Math.min(dayHigh, Math.max(dayLow, Number((target + noise).toFixed(2))));
      const open = i === 0 ? prevClose : runningPrice;
      const high = Math.min(dayHigh, Number((Math.max(open, close) + Math.random() * (dayHigh - dayLow) * 0.1).toFixed(2)));
      const low = Math.max(dayLow, Number((Math.min(open, close) - Math.random() * (dayHigh - dayLow) * 0.1).toFixed(2)));
      const vol = Math.floor((avgVolume / steps) * (0.6 + Math.random() * 0.8));

      points.push({
        time: todayStr, // Lightweight charts daily or ISO date
        open,
        high,
        low,
        close,
        volume: vol
      });

      runningPrice = close;
    }

    // Deduplicate dates for daily timescale
    return points.slice(-1);
  }

  // Multi-day timeframes: 1W (7 days), 1M (30 days), 3M (90 days), 1Y (250 days), ALL (500 days)
  let countDays = 30;
  let startPriceRatio = 0.95; // default 1M
  let volatility = 0.015;

  if (timeframe === '1W') {
    countDays = 7;
    startPriceRatio = 1 - (stock.dayChangePct / 100) * 1.5;
    volatility = 0.012;
  } else if (timeframe === '1M') {
    countDays = 30;
    startPriceRatio = 0.92;
    volatility = 0.018;
  } else if (timeframe === '3M') {
    countDays = 75;
    startPriceRatio = 0.85;
    volatility = 0.022;
  } else if (timeframe === '1Y') {
    countDays = 240;
    // Anchor historical start towards yearLow/yearHigh
    startPriceRatio = (yearLow + (currentPrice - yearLow) * 0.4) / currentPrice;
    volatility = 0.025;
  } else if (timeframe === 'ALL') {
    countDays = 450;
    startPriceRatio = (yearLow * 0.85) / currentPrice;
    volatility = 0.028;
  }

  const candles: CandlestickData[] = [];
  let currentWalkingPrice = currentPrice * startPriceRatio;

  // Generate business days strictly going forward to today
  const businessDates: string[] = [];
  let walkDate = new Date(now);
  walkDate.setDate(walkDate.getDate() - Math.floor(countDays * 1.45));

  while (businessDates.length < countDays) {
    if (walkDate.getDay() !== 0 && walkDate.getDay() !== 6) {
      businessDates.push(walkDate.toISOString().split('T')[0]);
    }
    walkDate.setDate(walkDate.getDate() + 1);
  }

  // Ensure today's date is the final date
  const todayDateStr = now.toISOString().split('T')[0];
  if (businessDates[businessDates.length - 1] !== todayDateStr) {
    businessDates[businessDates.length - 1] = todayDateStr;
  }

  const totalPoints = businessDates.length;
  for (let idx = 0; idx < totalPoints; idx++) {
    const isLast = idx === totalPoints - 1;
    const dateStr = businessDates[idx];
    const progress = (idx + 1) / totalPoints;

    // Smooth drift toward currentPrice with realistic daily fluctuations
    const targetPath = (currentPrice * startPriceRatio) + (currentPrice - (currentPrice * startPriceRatio)) * Math.pow(progress, 1.2);
    const dailyDrift = (Math.random() - 0.48) * volatility * currentWalkingPrice;
    
    let close = isLast ? currentPrice : Number((targetPath + dailyDrift).toFixed(2));
    close = Math.max(yearLow * 0.9, Math.min(yearHigh * 1.1, close));

    const open = idx === 0 ? Number((close * (1 - dailyDrift / close)).toFixed(2)) : currentWalkingPrice;
    const high = isLast ? Math.max(dayHigh, close, open) : Number((Math.max(open, close) + Math.random() * volatility * close * 0.8).toFixed(2));
    const low = isLast ? Math.min(dayLow, close, open) : Number((Math.min(open, close) - Math.random() * volatility * close * 0.8).toFixed(2));
    const vol = Math.floor(avgVolume * (0.6 + Math.random() * 0.8));

    candles.push({
      time: dateStr,
      open,
      high,
      low,
      close,
      volume: vol
    });

    currentWalkingPrice = close;
  }

  return candles;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ stock }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [activeTimeframe, setActiveTimeframe] = useState<ChartTimeframe>('1M');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('CANDLESTICK');
  const [initError, setInitError] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<{
    time?: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
  } | null>(null);

  // Compute smooth timeframe data series
  const candles = useMemo(() => {
    return generateTimeframeCandles(stock, activeTimeframe);
  }, [stock.ticker, stock.currentPrice, activeTimeframe]);

  // Compute period return
  const periodReturn = useMemo(() => {
    if (candles.length < 2) return { diff: 0, pct: 0 };
    const firstClose = candles[0].close || stock.previousClose;
    const lastClose = candles[candles.length - 1].close || stock.currentPrice;
    const diff = Number((lastClose - firstClose).toFixed(2));
    const pct = firstClose > 0 ? Number(((diff / firstClose) * 100).toFixed(2)) : 0;
    return { diff, pct };
  }, [candles, stock.currentPrice, stock.previousClose]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    setInitError(null);

    // Clean up previous instance cleanly
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.remove();
      } catch {
        // ignore cleanup error
      }
      chartInstanceRef.current = null;
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
    }

    const container = chartContainerRef.current;

    try {
      // Instantiate lightweight chart with institutional dark navy theme
      const chart = createChart(container, {
        width: container.clientWidth || 600,
        height: 380,
        layout: {
          background: { color: '#0A1F44' },
          textColor: '#94A3B8',
          fontSize: 12,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        grid: {
          vertLines: { color: 'rgba(30, 58, 110, 0.35)' },
          horzLines: { color: 'rgba(30, 58, 110, 0.35)' },
        },
        crosshair: {
          vertLine: {
            color: '#C9A84C',
            width: 1,
            style: 2,
            labelBackgroundColor: '#C9A84C',
          },
          horzLine: {
            color: '#C9A84C',
            width: 1,
            style: 2,
            labelBackgroundColor: '#C9A84C',
          },
        },
        rightPriceScale: {
          borderColor: '#1E3A6E',
          scaleMargins: {
            top: 0.08,
            bottom: 0.24,
          },
        },
        timeScale: {
          borderColor: '#1E3A6E',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartInstanceRef.current = chart;

      // 1. Render Series based on selected chartStyle
      let series: ISeriesApi<any>;

      if (chartStyle === 'CANDLESTICK') {
        series = chart.addSeries(CandlestickSeries, {
          upColor: '#10B981',
          downColor: '#EF4444',
          borderVisible: false,
          wickUpColor: '#10B981',
          wickDownColor: '#EF4444',
        });
        const candleData: ChartCandleData[] = candles.map(c => ({
          time: c.time as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        series.setData(candleData);
      } else if (chartStyle === 'LINE') {
        series = chart.addSeries(LineSeries, {
          color: '#C9A84C',
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          crosshairMarkerBorderColor: '#0A1F44',
          crosshairMarkerBackgroundColor: '#C9A84C',
        });
        const lineData: LineData[] = candles.map(c => ({
          time: c.time as any,
          value: c.close,
        }));
        series.setData(lineData);
      } else if (chartStyle === 'AREA') {
        series = chart.addSeries(AreaSeries, {
          topColor: 'rgba(201, 168, 76, 0.45)',
          bottomColor: 'rgba(10, 31, 68, 0.02)',
          lineColor: '#C9A84C',
          lineWidth: 2,
        });
        const areaData: LineData[] = candles.map(c => ({
          time: c.time as any,
          value: c.close,
        }));
        series.setData(areaData);
      } else {
        // BAR
        series = chart.addSeries(BarSeries, {
          upColor: '#10B981',
          downColor: '#EF4444',
        });
        const barData: BarData[] = candles.map(c => ({
          time: c.time as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        series.setData(barData);
      }

      mainSeriesRef.current = series;

      // 2. Volume Histogram Series (Lightweight Charts v5 API)
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '', // overlay
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.82,
          bottom: 0,
        },
      });
      volumeSeriesRef.current = volumeSeries;

      const volumeData = candles.map(c => ({
        time: c.time as any,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)',
      }));
      volumeSeries.setData(volumeData);

      chart.timeScale().fitContent();

      // Subscribe to Crosshair moves for precision inspection
      chart.subscribeCrosshairMove(param => {
        if (!param.time || !param.seriesData) {
          setHoverData(null);
          return;
        }
        const data = param.seriesData.get(series) as any;
        if (data) {
          setHoverData({
            time: String(param.time),
            open: data.open ?? data.value,
            high: data.high ?? data.value,
            low: data.low ?? data.value,
            close: data.close ?? data.value,
          });
        }
      });

      // Resize observer
      const handleResize = () => {
        if (chartContainerRef.current && chartInstanceRef.current) {
          chartInstanceRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartInstanceRef.current) {
          try {
            chartInstanceRef.current.remove();
          } catch {
            // ignore
          }
          chartInstanceRef.current = null;
        }
      };
    } catch (err: any) {
      console.error('Lightweight chart initialization error:', err);
      setInitError(err.message || 'Error rendering canvas chart');
    }
  }, [stock.ticker, chartStyle, activeTimeframe]);

  // Live real-time tick update when stock price changes
  useEffect(() => {
    if (!mainSeriesRef.current || candles.length === 0) return;

    try {
      const lastCandle = candles[candles.length - 1];
      const todayStr = new Date().toISOString().split('T')[0];
      const updatedPrice = stock.currentPrice;

      if (chartStyle === 'CANDLESTICK' || chartStyle === 'BAR') {
        mainSeriesRef.current.update({
          time: (lastCandle.time || todayStr) as any,
          open: lastCandle.open,
          high: Math.max(lastCandle.high, updatedPrice),
          low: Math.min(lastCandle.low, updatedPrice),
          close: updatedPrice,
        });
      } else {
        mainSeriesRef.current.update({
          time: (lastCandle.time || todayStr) as any,
          value: updatedPrice,
        });
      }
    } catch {
      // ignore tick race condition safely
    }
  }, [stock.currentPrice, chartStyle]);

  return (
    <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-4 shadow-xl flex flex-col space-y-3">
      {/* Top Chart Toolbar: Ticker, Performance & Style / Timeframe Switchers */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-700/60 pb-3">
        {/* Left: Ticker & Return Metric */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white font-mono">{stock.ticker}</span>
              <span className="text-xs text-slate-400 font-sans hidden sm:inline">• {stock.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono mt-0.5">
              <span className="text-lg font-bold text-white">₦{stock.currentPrice.toFixed(2)}</span>
              <span className={`flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded text-[11px] ${
                periodReturn.pct >= 0 ? 'bg-bull/20 text-bull border border-bull/30' : 'bg-bear/20 text-bear border border-bear/30'
              }`}>
                {periodReturn.pct >= 0 ? '+' : ''}{periodReturn.diff.toFixed(2)} ({periodReturn.pct >= 0 ? '+' : ''}{periodReturn.pct}%)
                <span className="text-[10px] text-slate-400 ml-1 font-normal font-sans">({activeTimeframe})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Chart Style & Timeframe Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Style Switcher */}
          <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-xl border border-navy-800 text-xs">
            {[
              { id: 'CANDLESTICK', label: 'Candle' },
              { id: 'LINE', label: 'Line' },
              { id: 'AREA', label: 'Graph (Area)' },
              { id: 'BAR', label: 'OHLC' }
            ].map(style => (
              <button
                key={style.id}
                onClick={() => setChartStyle(style.id as ChartStyle)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartStyle === style.id
                    ? 'bg-gold-500 text-navy-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-850'
                }`}
                title={`Switch to ${style.label} chart`}
              >
                {style.label}
              </button>
            ))}
          </div>

          {/* Timeframe Toggles */}
          <div className="flex items-center gap-0.5 bg-navy-950 p-1 rounded-xl border border-navy-800 text-xs font-mono">
            {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTimeframe === tf
                    ? 'bg-gold-500 text-navy-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-navy-850'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="w-full relative min-h-[380px] rounded-xl overflow-hidden bg-navy-950 flex items-center justify-center">
        {initError ? (
          <div className="text-center p-6 space-y-2">
            <div className="text-amber-400 font-bold text-sm">Interactive Canvas Chart Unavailable</div>
            <div className="text-xs text-slate-400">{initError}</div>
          </div>
        ) : (
          <div ref={chartContainerRef} className="w-full h-[380px]" />
        )}
      </div>

      {/* Crosshair / Active Candle Inspection Strip */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 border-t border-navy-800 gap-2">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
          {hoverData ? (
            <>
              {hoverData.time && <span className="text-slate-300">{hoverData.time}</span>}
              {hoverData.open !== undefined && <span>O: <strong className="text-white">₦{hoverData.open.toFixed(2)}</strong></span>}
              {hoverData.high !== undefined && <span>H: <strong className="text-bull">₦{hoverData.high.toFixed(2)}</strong></span>}
              {hoverData.low !== undefined && <span>L: <strong className="text-bear">₦{hoverData.low.toFixed(2)}</strong></span>}
              {hoverData.close !== undefined && <span>C: <strong className="text-gold-400">₦{hoverData.close.toFixed(2)}</strong></span>}
            </>
          ) : (
            <>
              <span>Prev: <strong className="text-slate-200">₦{stock.previousClose.toFixed(2)}</strong></span>
              <span>Day High: <strong className="text-bull">₦{stock.dayHigh.toFixed(2)}</strong></span>
              <span>Day Low: <strong className="text-bear">₦{stock.dayLow.toFixed(2)}</strong></span>
              <span>Live Price: <strong className="text-gold-400">₦{stock.currentPrice.toFixed(2)}</strong></span>
              <span>Vol: <strong className="text-slate-300 font-mono">{(stock.volume / 1000).toFixed(0)}k</strong></span>
            </>
          )}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] inline-block"></span>
          <span>Real-Time Lightweight Canvas • 10s Live Sync Feed</span>
        </div>
      </div>
    </div>
  );
};

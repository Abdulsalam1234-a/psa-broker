import React, { useEffect, useRef, useState } from 'react';
import { Stock } from '../../types';
import { BarChart2, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface TradingViewWidgetProps {
  stock: Stock;
  onSwitchToCanvas?: () => void;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ stock, onSwitchToCanvas }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadTimeout, setLoadTimeout] = useState<boolean>(false);

  useEffect(() => {
    if (!containerRef.current) return;

    setLoadTimeout(false);
    containerRef.current.innerHTML = '';

    const containerId = `tv_chart_container_${stock.ticker}_${Date.now()}`;
    const widgetDiv = document.createElement('div');
    widgetDiv.id = containerId;
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = '100%';
    containerRef.current.appendChild(widgetDiv);

    // Official Nigerian Exchange prefix on TradingView is "NSENG:"
    const tvSymbol = `NSENG:${stock.ticker}`;

    // Load TradingView TV script dynamically
    const scriptId = 'tradingview-widget-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initWidget = () => {
      try {
        if ((window as any).TradingView) {
          new (window as any).TradingView.widget({
            autosize: true,
            symbol: tvSymbol,
            interval: 'D',
            timezone: 'Africa/Lagos',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#0A1F44',
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: containerId,
            hide_side_toolbar: false,
            studies: ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies'],
            custom_css_url: '',
          });
        }
      } catch (e) {
        console.warn('TradingView initialization notice:', e);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      if ((window as any).TradingView) {
        initWidget();
      } else {
        script.addEventListener('load', initWidget);
      }
    }

    const timer = setTimeout(() => {
      setLoadTimeout(true);
    }, 4000);

    return () => {
      clearTimeout(timer);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [stock.ticker]);

  return (
    <div className="bg-navy-900/90 border border-navy-700/80 rounded-2xl p-4 shadow-xl flex flex-col space-y-3">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-700/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white font-mono">{stock.ticker}</span>
          <span className="text-xs text-gold-400 font-semibold">• TradingView Official Cloud Feed (NGX)</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-[11px] text-slate-400 font-mono">
            Symbol: <strong className="text-white">NSENG:{stock.ticker}</strong>
          </div>
          {onSwitchToCanvas && (
            <button
              onClick={onSwitchToCanvas}
              className="px-2 py-0.5 rounded bg-navy-800 hover:bg-navy-700 border border-gold-500/30 text-gold-300 text-[11px] font-semibold flex items-center gap-1 transition-all"
              title="Switch to local interactive canvas chart"
            >
              <BarChart2 className="w-3 h-3 text-gold-400" />
              <span>Use Canvas Chart</span>
            </button>
          )}
        </div>
      </div>

      {/* Widget Container */}
      <div 
        ref={containerRef} 
        className="w-full h-[400px] rounded-xl overflow-hidden bg-navy-950 border border-navy-800 relative"
      />

      {/* Helpful Hint Bar */}
      <div className="text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-navy-800">
        <div className="flex items-center gap-1.5">
          <span className="text-bull font-bold">● TradingView Feed (NSENG)</span>
          <span>• If symbol does not appear or is outside TradingView's free quota, use the <strong>Lightweight Canvas</strong> tab above.</span>
        </div>

        {onSwitchToCanvas && (
          <button
            onClick={onSwitchToCanvas}
            className="text-gold-400 hover:text-gold-300 font-semibold underline transition-colors"
          >
            Switch to Lightweight Canvas →
          </button>
        )}
      </div>
    </div>
  );
};

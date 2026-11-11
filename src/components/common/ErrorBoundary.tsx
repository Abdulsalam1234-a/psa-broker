import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside PSA Broker component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] flex items-center justify-center p-6 bg-navy-950/80 border border-bear/40 rounded-2xl text-center space-y-4">
          <div className="max-w-md space-y-3">
            <div className="w-12 h-12 rounded-full bg-bear/20 border border-bear/40 flex items-center justify-center mx-auto text-bear">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Component Render Recovery
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {this.props.fallbackMessage || 
                'An unexpected error occurred while rendering this terminal view. Your account balances and orders remain safe in local memory.'}
            </p>
            {this.state.error && (
              <div className="p-3 bg-navy-900 rounded-xl border border-navy-800 text-[11px] font-mono text-bear text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
                className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry View</span>
              </button>
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 text-xs font-semibold transition-colors"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

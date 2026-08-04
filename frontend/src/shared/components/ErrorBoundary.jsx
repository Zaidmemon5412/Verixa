import React, { Component } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

/**
 * Reusable Global Error Boundary Component.
 * Catches JavaScript rendering errors anywhere in child component trees,
 * logs errors, and renders a graceful recovery UI instead of crashing the app.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error to monitoring platform / console for debugging
    console.error('Unhandled React Render Error captured by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 select-none">
          <div className="max-w-lg w-full glass-panel p-8 rounded-2xl border border-red-500/20 text-center space-y-6 shadow-2xl">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-xl shadow-red-500/10 animate-pulse">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Something Went Wrong
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected rendering error occurred. The application intercepted this failure to prevent data corruption.
              </p>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5 text-left text-[11px] font-mono text-red-300 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-brand-500/10 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 font-semibold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Go to Homepage</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

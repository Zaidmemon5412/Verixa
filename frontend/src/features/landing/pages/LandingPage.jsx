import { Link } from 'react-router-dom';
import { Building2, Search, ShieldCheck, ArrowRight, Layers, BarChart3 } from 'lucide-react';

/**
 * LandingPage Shell Placeholder component.
 * Route: /
 */
export const LandingPage = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section Placeholder */}
      <div className="text-center space-y-6 max-w-3xl mx-auto py-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Next-Generation Real Estate Risk Verification</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Verixa Intelligence Platform
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Comprehensive real estate risk assessment, geospatial mapping, builder verification, and decision matrix analytics.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/properties"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center space-x-2"
          >
            <span>Explore Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/builders"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center"
          >
            Verified Builders
          </Link>
        </div>
      </div>

      {/* Feature Shell Grid Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Smart Property Search</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Filter properties by valuation, risk parameters, zoning, and legal certification statuses.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Geospatial Overlay</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Map boundaries, easement intersections, flood plains, and municipal zoning boundaries.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Decision Matrix</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Side-by-side risk forecasting, structural metrics, and investment safety scoring.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

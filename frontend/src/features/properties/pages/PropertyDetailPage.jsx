import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, ShieldCheck, MapPin } from 'lucide-react';

/**
 * PropertyDetailPage Shell Placeholder component.
 * Route: /property/:id
 */
export const PropertyDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <Link
        to="/properties"
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Properties</span>
      </Link>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Title & Zoning</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Property Listing Details #{id}</h1>
            <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>District 4, Metropolitan Zone</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600">
            <Building2 className="w-16 h-16" />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Specifications Shell</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/50">
                <span className="text-slate-400">Property ID</span>
                <span className="font-semibold text-white">#PR-{id}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/50">
                <span className="text-slate-400">Verification Status</span>
                <span className="font-semibold text-emerald-400">Complete (Level 3)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/50">
                <span className="text-slate-400">Zoning Risk Index</span>
                <span className="font-semibold text-brand-300">Low Risk (0.04)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;

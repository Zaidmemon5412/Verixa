import { Link } from 'react-router-dom';
import { Building2, Search, Filter } from 'lucide-react';

/**
 * PropertiesPage Shell Placeholder component.
 * Route: /properties
 */
export const PropertiesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Properties Registry</h1>
          <p className="text-xs text-slate-400">Search and filter verified real estate listings.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
          </div>
          <button className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center space-x-1.5 hover:bg-slate-800">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((id) => (
          <div key={id} className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="h-40 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600">
              <Building2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Sample Property #{id}</h3>
              <p className="text-xs text-slate-400">Verified Residential Complex</p>
            </div>
            <Link
              to={`/property/${id}`}
              className="block w-full py-2 text-center rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold hover:bg-brand-500/20 transition-all"
            >
              View Property Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertiesPage;

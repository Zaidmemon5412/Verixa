import { Link } from 'react-router-dom';
import { Award, ShieldCheck, Search } from 'lucide-react';

/**
 * BuildersPage Shell Placeholder component.
 * Route: /builders
 */
export const BuildersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Verified Builders Registry</h1>
          <p className="text-xs text-slate-400">Explore developer credentials and compliance track records.</p>
        </div>

        <div className="relative md:w-64">
          <input
            type="text"
            placeholder="Search builders..."
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((id) => (
          <div key={id} className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold mb-1">
                <ShieldCheck className="w-3 h-3" />
                <span>RERA Certified</span>
              </div>
              <h3 className="text-sm font-bold text-white">Apex Developers Group #{id}</h3>
              <p className="text-xs text-slate-400">12 Projects Completed</p>
            </div>
            <Link
              to={`/builder/${id}`}
              className="block w-full py-2 text-center rounded-lg bg-slate-900 border border-white/5 text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-all"
            >
              View Builder Profile
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuildersPage;

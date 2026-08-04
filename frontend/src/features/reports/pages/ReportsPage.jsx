import { FileText, Download, ShieldCheck } from 'lucide-react';

/**
 * ReportsPage Shell Placeholder component.
 * Route: /reports
 */
export const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Verified Reports Archive</h1>
        <p className="text-xs text-slate-400">Generated title deeds, zoning risk reports, and inspection certifications.</p>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="glass-panel p-4 rounded-xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Zoning & Compliance Audit #{idx}04</h4>
                <p className="text-xs text-slate-400">Generated on August {idx + 10}, 2026</p>
              </div>
            </div>

            <button className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;

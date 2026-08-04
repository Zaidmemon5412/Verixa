import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

/**
 * BuilderDetailPage Shell Placeholder component.
 * Route: /builder/:id
 */
export const BuilderDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <Link
        to="/builders"
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Builders</span>
      </Link>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6">
        <div className="flex items-center space-x-4 border-b border-white/5 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Apex Developers Group #{id}</h1>
            <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Regulatory Compliance Certified</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
            <span className="text-slate-400">Delivered Projects</span>
            <p className="text-lg font-extrabold text-white">12 Commercial & Res.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
            <span className="text-slate-400">Litigation Rating</span>
            <p className="text-lg font-extrabold text-emerald-400">Clear Track Record</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
            <span className="text-slate-400">Verification Index</span>
            <p className="text-lg font-extrabold text-brand-300">98.4% Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderDetailPage;

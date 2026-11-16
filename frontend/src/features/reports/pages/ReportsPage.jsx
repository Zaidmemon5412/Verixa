import { FileText, Download, ShieldCheck } from 'lucide-react';
import { SEOHead } from '../../../shared/components/SEOHead';

/**
 * ReportsPage Shell Placeholder component.
 * Route: /reports
 */
export const ReportsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6">
      <SEOHead
        title="Verified Reports Archive – Verixa"
        description="Access your generated title deeds, zoning risk reports, and inspection certifications."
        canonicalPath="/reports"
        noindex={true}
      />
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Verified Reports Archive</h1>
        <p className="text-xs text-muted-foreground">Generated title deeds, zoning risk reports, and inspection certifications.</p>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="glass-panel p-4 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Zoning & Compliance Audit #{idx}04</h4>
                <p className="text-xs text-muted-foreground">Generated on August {idx + 10}, 2026</p>
              </div>
            </div>

            <button className="px-3 py-2 sm:py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors w-full sm:w-auto">
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

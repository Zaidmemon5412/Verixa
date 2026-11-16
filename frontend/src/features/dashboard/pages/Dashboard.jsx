import { SEOHead } from '../../../shared/components/SEOHead';

export const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8">
      <SEOHead
        title="Verixa Intelligence Dashboard"
        description="Verixa user intelligence dashboard."
        canonicalPath="/dashboard"
        noindex={true}
      />
      <div className="p-5 sm:p-8 glass-panel rounded-2xl border border-border bg-card backdrop-blur-md">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3 sm:mb-4">Verixa Intelligence Dashboard</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Welcome to the core portal. Select an analytics app from the navigation to begin.</p>
      </div>
    </div>
  );
};

export default Dashboard;

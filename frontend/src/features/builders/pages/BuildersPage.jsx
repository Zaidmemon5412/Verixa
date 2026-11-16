import React, { useState, useEffect } from 'react';
import { Award, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { builderService } from '../services/builderService';
import { BuilderCard } from '../components/BuilderCard';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { SEOHead } from '../../../shared/components/SEOHead';
import { buildBreadcrumbSchema } from '../../../shared/utils/seoUtils';

export function BuildersPage({ onSelectBuilder }) {
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBuilders() {
      setLoading(true);
      try {
        const data = await builderService.getBuilders();
        setBuilders(data);
      } catch (err) {
        console.error('Failed to load builders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBuilders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      <SEOHead
        title="Top RERA Verified Real Estate Developers & Builders in Ahmedabad"
        description="Compare Ahmedabad real estate developers by on-time delivery rate, RERA registration track record, completed projects, and Verixa algorithmic trust scores."
        canonicalPath="/builders"
        keywords="Ahmedabad real estate builders, RERA verified developers Gujarat, builder trust score, Verixa"
        schema={buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Verified Builders', path: '/builders' },
        ])}
      />
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-primary/10 text-primary mb-2">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Delivery & Financial Reliability Audit</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Property Developers</h1>

        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Detailed developer profiles, past completion records, and delivery delay benchmarks
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-2xl p-6 space-y-4">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {builders.map((builder) => (
            <BuilderCard
              key={builder.id}
              builder={builder}
              onSelect={onSelectBuilder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BuildersPage;


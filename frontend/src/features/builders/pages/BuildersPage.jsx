import React, { useState, useEffect } from 'react';
import { Award, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { builderService } from '../services/builderService';
import { BuilderCard } from '../components/BuilderCard';
import { Skeleton } from '../../../shared/components/ui/skeleton';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Delivery & Financial Reliability Audit</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Verified Developers</h1>
        <p className="text-sm text-muted-foreground mt-1">
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

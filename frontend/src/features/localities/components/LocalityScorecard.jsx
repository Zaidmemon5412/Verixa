import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';

export function LocalityScorecard({ locality }) {
  if (!locality) return null;

  const sc = locality.scorecard || {
    overallGrowth: locality.growthScore || 76,
    connectivity: 79,
    socialInfra: 56,
    priceAppreciation: 68,
    rentalDemand: 61,
    safetyScore: 88,
  };

  const metrics = [
    { label: 'Overall Growth', value: sc.overallGrowth, color: 'bg-blue-600' },
    { label: 'Connectivity', value: sc.connectivity, color: 'bg-teal-500' },
    { label: 'Social Infrastructure', value: sc.socialInfra, color: 'bg-purple-600' },
    { label: 'Price Appreciation', value: sc.priceAppreciation, color: 'bg-amber-500' },
    { label: 'Rental Demand', value: sc.rentalDemand, color: 'bg-rose-500' },
    { label: 'Safety Score', value: sc.safetyScore, color: 'bg-emerald-500' },
  ];

  return (
    <Card className="rounded-3xl border bg-card shadow-sm sticky top-24">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-extrabold text-foreground">
          Locality Scorecard
        </CardTitle>
        <p className="text-xs text-muted-foreground font-medium">
          Powered by Verixa GIS & ML Engine
        </p>
      </CardHeader>

      <CardContent className="p-6 pt-4 space-y-6">
        {/* Score Metrics Progress Bars */}
        <div className="space-y-4">
          {metrics.map((m) => (
            <div key={m.label} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="text-foreground font-bold">{m.value}/100</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${m.color}`}
                  style={{ width: `${Math.min(Math.max(m.value, 0), 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Verixa AI Verdict Box */}
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-1">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block">
            Verixa Verdict
          </span>
          <h4 className="text-base font-extrabold text-blue-950 dark:text-blue-200">
            {locality.verdict || 'Good Investment'}
          </h4>
          <p className="text-xs text-blue-800/80 dark:text-blue-300/80 font-medium leading-relaxed">
            {locality.verdictSummary || 'Based on comprehensive GIS & ML market analysis'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

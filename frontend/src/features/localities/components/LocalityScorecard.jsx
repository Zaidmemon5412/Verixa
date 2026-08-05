import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';

export function LocalityScorecard({ locality }) {
  if (!locality) return null;

  const sc = locality.scorecard || {};

  const metrics = [
    { label: 'Overall Growth', value: sc.overallGrowth ?? locality.growthScore, color: 'bg-blue-600' },
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
          Powered by Verixa GIS & Intelligence Engine
        </p>
      </CardHeader>

      <CardContent className="p-6 pt-4 space-y-6">
        {/* Score Metrics Progress Bars */}
        <div className="space-y-4">
          {metrics.map((m) => (
            <div key={m.label} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="text-foreground font-bold">{m.value != null ? m.value : '--'}/100</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${m.color}`}
                  style={{ width: `${Math.min(Math.max(m.value || 0, 0), 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Verixa AI Verdict Box */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Verixa Verdict
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              GIS Verified
            </span>
          </div>
          <h4 className="text-base font-extrabold text-blue-950 dark:text-blue-100">
            {locality.verdict || 'Good Investment'}
          </h4>
          <p className="text-xs text-blue-900/80 dark:text-blue-200/80 font-medium leading-relaxed">
            {locality.verdictSummary || 'Based on comprehensive GIS & intelligence market analysis'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

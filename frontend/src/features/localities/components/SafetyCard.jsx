import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/card';

export function SafetyCard({ locality }) {
  if (!locality) return null;

  return (
    <Card className="rounded-2xl border bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 shadow-sm">
      <CardContent className="p-4 md:p-5 space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Safety Index</span>
        </div>
        <h3 className="text-xl md:text-2xl font-extrabold text-emerald-900 dark:text-emerald-200">
          {locality.safety || 'Safe Area'}
        </h3>
        <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-medium">
          {locality.safetyDesc || 'Based on public safety records'}
        </p>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Navigation } from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/card';

export function TrafficCard({ locality }) {
  if (!locality) return null;

  return (
    <Card className="rounded-2xl border bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 shadow-sm">
      <CardContent className="p-4 md:p-5 space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
          <Navigation className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Traffic Congestion</span>
        </div>
        <h3 className="text-xl md:text-2xl font-extrabold text-amber-900 dark:text-amber-200">
          {locality.traffic || 'Medium'}
        </h3>
        <p className="text-xs text-amber-700/80 dark:text-amber-400/80 font-medium">
          {locality.trafficDesc || 'Peak hour traffic analysis'}
        </p>
      </CardContent>
    </Card>
  );
}

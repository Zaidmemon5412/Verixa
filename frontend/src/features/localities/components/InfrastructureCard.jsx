import React from 'react';
import { Card, CardContent } from '../../../shared/components/ui/card';

export function InfrastructureCard({ label, value, icon: Icon, color }) {
  return (
    <Card className="rounded-2xl border bg-card hover:border-primary/40 transition-all duration-200 shadow-sm text-center">
      <CardContent className="p-4 md:p-5 flex flex-col items-center justify-center space-y-2">
        <div className={`p-2.5 rounded-xl ${color || 'bg-primary/10 text-primary'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight block">
            {value}
          </span>
          <span className="text-xs text-muted-foreground font-medium block mt-0.5">
            {label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Building2, SearchX } from 'lucide-react';

export function EmptyState({ title = "No Projects Found", message = "No active verified properties are currently listed for this locality in the database.", icon: Icon = Building2 }) {
  return (
    <div className="border border-dashed rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto bg-card shadow-sm">
      <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto text-primary">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

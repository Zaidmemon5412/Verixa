import React from 'react';
import { 
  Building2, 
  Star, 
  TrendingUp, 
  Award, 
  Layers 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Skeleton } from '../../../shared/components/ui/skeleton';

export function BuilderIntelligenceSection({ buildersData, isLoading }) {
  if (isLoading) {
    return <Skeleton className="h-72 rounded-2xl" />;
  }

  const items = buildersData || [];

  return (
    <Card className="rounded-2xl border border-border/70 shadow-xs overflow-hidden">
      <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Award className="w-4 h-4 text-amber-500" />
              Builder Intelligence & Market Share Rankings
            </CardTitle>
            <CardDescription className="text-xs">
              Top developer performance ranked by active project count, sales velocity, and execution rating
            </CardDescription>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Top Developers
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30 text-muted-foreground font-semibold">
              <th className="py-3 px-4">Rank & Builder</th>
              <th className="py-3 px-4">Active Projects</th>
              <th className="py-3 px-4">Avg Price</th>
              <th className="py-3 px-4">Sales Velocity</th>
              <th className="py-3 px-4">Market Share</th>
              <th className="py-3 px-4 text-right">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {items.map((b, idx) => (
              <tr key={idx} className="hover:bg-accent/5 transition-colors">
                <td className="py-3 px-4 font-bold text-foreground flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    {b.name}
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold text-foreground">
                  {b.activeProjects} projects
                </td>
                <td className="py-3 px-4 font-medium text-foreground">{b.avgPrice}</td>
                <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                  {b.salesVelocity}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{b.marketShare}</span>
                    <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: typeof b.marketShare === 'number' ? `${b.marketShare}%` : (b.marketShare || '15%') }} />

                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-amber-600 dark:text-amber-400 flex items-center justify-end gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {b.rating}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export default BuilderIntelligenceSection;

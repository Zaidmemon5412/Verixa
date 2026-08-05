import React, { useState } from 'react';
import { 
  Flame, 
  MapPin, 
  TrendingUp, 
  ArrowUpRight, 
  Search, 
  Building2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Skeleton } from '../../../shared/components/ui/skeleton';

export function MarketHeatMapTable({ localityData, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return <Skeleton className="h-80 rounded-2xl" />;
  }

  const items = Array.isArray(localityData) ? localityData : [];
  const filteredItems = items.filter(loc => 
    loc && loc.name && String(loc.name).toLowerCase().includes(String(searchTerm || '').toLowerCase())
  );


  const getRatingBadge = (rating) => {
    switch (rating) {
      case "Hot Market":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
            Hot Market
          </span>
        );
      case "Growing Market":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3 h-3" />
            Growing Market
          </span>
        );
      case "Stable Market":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-3 h-3" />
            Stable Market
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <AlertCircle className="w-3 h-3" />
            Declining Market
          </span>
        );
    }
  };

  return (
    <Card className="rounded-2xl border border-border/70 shadow-xs overflow-hidden">
      <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Flame className="w-4 h-4 text-orange-500" />
              Locality Performance Dashboard & Heat Map
            </CardTitle>
            <CardDescription className="text-xs">
              Micro-market rankings categorized by demand score, inventory turnover, and price growth
            </CardDescription>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search locality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded-xl border border-border/60 bg-background pl-9 pr-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30 text-muted-foreground font-semibold">
              <th className="py-3 px-4">Locality</th>
              <th className="py-3 px-4">Avg Price</th>
              <th className="py-3 px-4">Growth %</th>
              <th className="py-3 px-4">Demand Score</th>
              <th className="py-3 px-4">Market Classification</th>
              <th className="py-3 px-4 text-right">Active Listings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredItems.map((row, idx) => (
              <tr key={idx} className="hover:bg-accent/5 transition-colors">
                <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  {row.name}
                </td>
                <td className="py-3 px-4 font-semibold text-foreground">{row.avgPrice}</td>
                <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                  {row.growthPct}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-foreground">{row.demandScore}/100</span>
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${row.demandScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {getRatingBadge(row.rating)}
                </td>
                <td className="py-3 px-4 text-right font-medium text-muted-foreground">
                  {row.totalListings} listings
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export default MarketHeatMapTable;

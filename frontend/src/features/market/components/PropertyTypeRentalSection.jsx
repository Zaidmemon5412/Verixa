import React from 'react';
import { 
  Building2, 
  Home, 
  Layers, 
  Sparkles, 
  Store, 
  Percent, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Skeleton } from '../../../shared/components/ui/skeleton';

export function PropertyTypeRentalSection({ propertyTypes, rentalData, isLoading }) {
  if (isLoading) {
    return <Skeleton className="h-80 rounded-2xl" />;
  }

  const pTypes = propertyTypes || [];
  const rent = rentalData || {};

  const getIcon = (type) => {
    switch (type) {
      case "Villa": return <Home className="w-4 h-4 text-emerald-500" />;
      case "Plot": return <Layers className="w-4 h-4 text-purple-500" />;
      case "Penthouse": return <Sparkles className="w-4 h-4 text-amber-500" />;
      case "Commercial": return <Store className="w-4 h-4 text-rose-500" />;
      default: return <Building2 className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Property Type Breakdown */}
      <Card className="rounded-2xl border border-border/70 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <Building2 className="w-4 h-4 text-primary" />
            Property Asset Class Analytics
          </CardTitle>
          <CardDescription className="text-xs">
            Performance comparison across Apartments, Villas, Plots, Penthouses & Commercial
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {pTypes.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-muted/50">
                  {getIcon(item.type)}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">{item.type}</div>
                  <div className="text-[11px] text-muted-foreground">{item.listingsCount} active listings</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <div className="font-bold text-foreground">{item.avgPrice}</div>
                  <div className="text-[10px] text-muted-foreground">Avg Price</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{item.growthPct}</div>
                  <div className="text-[10px] text-muted-foreground">Growth</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs">
                  {item.demandScore} Score
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rental Market & Rent vs Buy Recommendation */}
      <Card className="rounded-2xl border border-border/70 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <Percent className="w-4 h-4 text-emerald-500" />
            Rental Yield & Rent vs Buy Recommendation
          </CardTitle>
          <CardDescription className="text-xs">
            Investor yield benchmarks and decision analysis for property acquisition vs leasing
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* Rent vs Buy Decision Banner */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Strategic Decision Index
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-xs">
                {rent.recommendation || "Buying Recommended"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {rent.reasoning}
            </p>
          </div>

          {/* Rental Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-border/60 bg-card">
              <div className="text-[11px] text-muted-foreground font-semibold">Average Rent</div>
              <div className="text-lg font-black text-foreground mt-1">{rent.avgRent}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> {rent.rentGrowthPct}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-card">
              <div className="text-[11px] text-muted-foreground font-semibold">Rental Yield (ROI)</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{rent.rentalYield}</div>
              <div className="text-[10px] text-muted-foreground mt-1">Above Tier-1 city average</div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-card">
              <div className="text-[11px] text-muted-foreground font-semibold">Occupancy Rate</div>
              <div className="text-lg font-black text-foreground mt-1">{rent.occupancyTrend}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center">
                <CheckCircle2 className="w-3 h-3" /> High Tenant Demand
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-card">
              <div className="text-[11px] text-muted-foreground font-semibold">Lease Growth</div>
              <div className="text-lg font-black text-foreground mt-1">{rent.rentGrowthPct}</div>
              <div className="text-[10px] text-muted-foreground mt-1">Strong leasing activity</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PropertyTypeRentalSection;

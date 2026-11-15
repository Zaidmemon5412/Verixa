import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Building2, 
  MapPin,
  ArrowUpRight 
} from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Skeleton } from '../../../shared/components/ui/skeleton';

export function MarketKpiCards({ isLoading, totalListings, kpiMetrics }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  const avgPrice = kpiMetrics?.avgPrice || "₹1.25 Cr";
  const pricePerSqft = kpiMetrics?.pricePerSqft || "₹7,970";
  const activeListings = kpiMetrics?.activeListings !== undefined ? kpiMetrics.activeListings : (totalListings || 672);
  const totalLocalities = kpiMetrics?.totalLocalities || 6;
  const localityName = kpiMetrics?.localityName || 'All';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Average Property Price */}
        <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Avg Property Price</span>
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2 text-lg sm:text-xl font-black text-foreground">{avgPrice}</div>
            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-muted-foreground mt-1">
              <span className="truncate">{localityName !== 'All' ? localityName : 'DB Average'}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center shrink-0">
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> +8.4%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Average Price / SqFt */}
        <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Avg Price / SqFt</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2 text-lg sm:text-xl font-black text-foreground">{pricePerSqft} <span className="text-[11px] sm:text-xs font-normal text-muted-foreground">/sqft</span></div>
            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-muted-foreground mt-1">
              <span className="truncate">Benchmark</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center shrink-0">
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> +6.2%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Active Properties */}
        <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-blue-500/5 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Active Properties</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2 text-lg sm:text-xl font-black text-foreground">{activeListings} <span className="text-[11px] sm:text-xs font-normal text-muted-foreground">Listings</span></div>
            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-muted-foreground mt-1">
              <span className="truncate">Verified DB</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">Active</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Micro-Markets */}
        <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-purple-500/5 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Micro-Markets</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2 text-lg sm:text-xl font-black text-foreground">{totalLocalities} <span className="text-[11px] sm:text-xs font-normal text-muted-foreground">Localities</span></div>
            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-muted-foreground mt-1">
              <span className="truncate">Covered Areas</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold shrink-0">Live</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MarketKpiCards;


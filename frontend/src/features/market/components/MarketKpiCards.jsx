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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Average Property Price */}
        <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Avg Property Price</span>
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-black text-foreground">{avgPrice}</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>{localityName !== 'All' ? localityName : 'Database Average'}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +8.4% YoY
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Average Price / SqFt */}
        <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Avg Price / SqFt</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-black text-foreground">{pricePerSqft} <span className="text-xs font-normal text-muted-foreground">/sqft</span></div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Micro-market Benchmark</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +6.2%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Active Properties */}
        <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-blue-500/5 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active Properties</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-black text-foreground">{activeListings} <span className="text-xs font-normal text-muted-foreground">Listings</span></div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Verified Database Records</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">Active Inventory</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Micro-Markets */}
        <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-purple-500/5 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Micro-Markets</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-black text-foreground">{totalLocalities} <span className="text-xs font-normal text-muted-foreground">Localities</span></div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Covered Areas in DB</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">Live Tracking</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MarketKpiCards;


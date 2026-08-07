import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Layers, 
  Zap, 
  Percent, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Skeleton } from '../../../shared/components/ui/skeleton';

export function MarketKpiCards({ isLoading, totalListings, kpiMetrics }) {
  const [kpiPeriod, setKpiPeriod] = useState('Monthly'); // 'Monthly' | 'Quarterly' | 'Yearly'

  const getKpiData = () => {
    const baseAvgPrice = kpiMetrics?.avgPrice || "₹77.0 Lakhs";
    const basePriceSqft = kpiMetrics?.pricePerSqft || "₹5,690";
    const baseListings = kpiMetrics?.activeListings !== undefined ? kpiMetrics.activeListings : (totalListings || 185);
    const baseNewListings = kpiMetrics?.newListings || "28";

    if (kpiPeriod === 'Monthly') {
      return {
        avgPrice: baseAvgPrice,
        pricePerSqft: basePriceSqft,
        activeListings: baseListings,
        newListings: baseNewListings,
        inventoryChange: "+4.2%",
        isInventoryUp: true,
        demandIndex: "88/100",
        rentalYield: "3.85%",
        marketGrowth: "+2.4%"
      };
    } else if (kpiPeriod === 'Quarterly') {
      return {
        avgPrice: baseAvgPrice,
        pricePerSqft: basePriceSqft,
        activeListings: baseListings * 3,
        newListings: `${parseInt(baseNewListings || "28") * 3}`,
        inventoryChange: "+8.6%",
        isInventoryUp: true,
        demandIndex: "85/100",
        rentalYield: "3.90%",
        marketGrowth: "+5.1%"
      };
    } else {
      return {
        avgPrice: baseAvgPrice,
        pricePerSqft: basePriceSqft,
        activeListings: baseListings * 11,
        newListings: `${parseInt(baseNewListings || "28") * 10}`,
        inventoryChange: "+14.8%",
        isInventoryUp: true,
        demandIndex: "82/100",
        rentalYield: "4.10%",
        marketGrowth: "+8.4%"
      };
    }
  };

  const data = getKpiData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          Key Market Metrics {kpiMetrics?.localityName && kpiMetrics.localityName !== 'All' ? `(${kpiMetrics.localityName})` : ''}
        </h2>

        {/* View Switcher: Monthly / Quarterly / Yearly */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60">
          {['Monthly', 'Quarterly', 'Yearly'].map((view) => (
            <button
              key={view}
              onClick={() => setKpiPeriod(view)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                kpiPeriod === view
                  ? 'bg-background text-foreground shadow-xs border border-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

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
            <div className="mt-2 text-xl font-black text-foreground">{data.avgPrice}</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>{kpiPeriod} Average</span>
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
            <div className="mt-2 text-xl font-black text-foreground">{data.pricePerSqft} <span className="text-xs font-normal text-muted-foreground">/sqft</span></div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Micro-market benchmark</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +6.2%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Active Listings */}
        <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-blue-500/5 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active Listings</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-black text-foreground">{data.activeListings} <span className="text-xs font-normal text-muted-foreground">Properties</span></div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Verified In-Stock</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">Active Inventory</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: New Listings */}
        <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-purple-500/5 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">New Listings</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-black text-foreground">{data.newListings} <span className="text-xs font-normal text-muted-foreground">This Period</span></div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>New Supply Additions</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">+12% Velocity</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Inventory Change % */}
        <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Inventory Change</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-black text-foreground">{data.inventoryChange}</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>MoM Stock Velocity</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Stable Supply</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Demand Index */}
        <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-rose-500/5 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Demand Index</span>
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-black text-foreground">{data.demandIndex}</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Buyer Search Heat</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">High Absorption</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 7: Rental Yield */}
        <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-teal-500/5 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Rental Yield</span>
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-black text-foreground">{data.rentalYield}</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Annual Investor ROI</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">Above Avg</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 8: Market Growth % */}
        <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-indigo-500/5 shadow-xs hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Market Growth</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-black text-foreground">{data.marketGrowth}</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Index Momentum</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Bullish</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MarketKpiCards;

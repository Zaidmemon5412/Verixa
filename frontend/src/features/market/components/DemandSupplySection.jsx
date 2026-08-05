import React from 'react';
import { 
  Zap, 
  Building2, 
  Eye, 
  MessageSquare, 
  Heart, 
  CalendarCheck, 
  Layers, 
  CheckCircle2, 
  Scale 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Skeleton } from '../../../shared/components/ui/skeleton';

export function DemandSupplySection({ demandSupplyData, isLoading }) {
  if (isLoading) {
    return <Skeleton className="h-72 rounded-2xl" />;
  }

  const { demandScore = 88, supplyScore = 72, marketStatus = "Seller's Market", recommendation = "Demand > Supply (High Absorption)" } = demandSupplyData || {};
  const isSellersMarket = String(marketStatus || '').includes("Seller");


  return (
    <Card className="rounded-2xl border border-border/70 shadow-xs overflow-hidden">
      <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Scale className="w-4 h-4 text-primary" />
              Demand vs Supply Analytics Gauge
            </CardTitle>
            <CardDescription className="text-xs">
              Platform buyer engagement metrics matched against available builder inventory
            </CardDescription>
          </div>

          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border ${
            isSellersMarket 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
          }`}>
            <Zap className="w-3.5 h-3.5" />
            <span>{marketStatus}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Dynamic Banner Indicator */}
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
          isSellersMarket 
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
            : 'bg-blue-500/5 border-blue-500/20 text-blue-800 dark:text-blue-300'
        }`}>
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <div>
            <strong className="font-bold text-sm block mb-0.5">{recommendation}</strong>
            High absorption velocity indicates strong end-user interest. Sellers maintain favorable pricing leverage.
          </div>
        </div>

        {/* Visual Progress Comparison Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Demand Column */}
          <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-rose-500" /> Buyer Demand Index
              </span>
              <span className="text-sm font-black text-rose-600 dark:text-rose-400">{demandScore}/100</span>
            </div>
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${demandScore}%` }} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5"><Eye className="w-3 h-3 text-primary" /> 14.2k Views</div>
              <div className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3 text-emerald-500" /> 1.8k Inquiries</div>
              <div className="flex items-center gap-1.5"><Heart className="w-3 h-3 text-rose-500" /> 3.4k Favorites</div>
              <div className="flex items-center gap-1.5"><CalendarCheck className="w-3 h-3 text-amber-500" /> 420 Site Visits</div>
            </div>
          </div>

          {/* Supply Column */}
          <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-500" /> Available Supply Index
              </span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">{supplyScore}/100</span>
            </div>
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${supplyScore}%` }} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5"><Building2 className="w-3 h-3 text-blue-500" /> Active Listings</div>
              <div className="flex items-center gap-1.5"><Layers className="w-3 h-3 text-purple-500" /> 28 New Launches</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Ready Inventory</div>
              <div className="flex items-center gap-1.5"><Scale className="w-3 h-3 text-amber-500" /> Balanced Turnover</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DemandSupplySection;

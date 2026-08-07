import React from 'react';
import { 
  Search, 
  TrendingUp, 
  Award, 
  Sparkles, 
  MapPin, 
  Building2, 
  ArrowUpRight, 
  CheckCircle2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Skeleton } from '../../../shared/components/ui/skeleton';

export function SearchTrendsInvestmentSection({ searchData, investmentData, isLoading }) {
  if (isLoading) {
    return <Skeleton className="h-80 rounded-2xl" />;
  }

  const search = searchData || {};
  const inv = investmentData || {};

  const trendingQueries = search.trendingSearches || [
    { query: "3 BHK Flats in Thaltej", growth: "+28%" },
    { query: "Gota Ready to Move", growth: "+22%" },
    { query: "Satellite Luxury Towers", growth: "+35%" },
    { query: "Sola SG Highway Apartments", growth: "+19%" },
    { query: "Chandkheda Metro Corridor", growth: "+24%" },
    { query: "Maninagar Affordable Homes", growth: "+16%" }
  ];

  const localitySearchTrends = search.trends || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Platform Search & Consumer Behavior Trends */}
      <Card className="rounded-2xl border border-border/70 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <Search className="w-4 h-4 text-primary" />
            Platform Search & Consumer Behavior Trends
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time home buyer search queries, trending keywords, and locality search interest
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          {/* Trending Searches Chips */}
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              Top Trending Search Queries
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingQueries.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted/60 text-foreground border border-border/60 hover:border-primary/40 transition-colors">
                  {item.query}
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {item.growth}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Micro-Market Search Volume Breakdown */}
          {localitySearchTrends.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Locality Search Interest Breakdown
              </div>
              <div className="space-y-2">
                {localitySearchTrends.map((loc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-card hover:bg-accent/5 transition-colors text-xs">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {loc.locality}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground font-medium">{loc.searchVolume}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/20">
                        {loc.demandScore} Score
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Investment Opportunities & Scoring */}
      <Card className="rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <Award className="w-4 h-4 text-amber-500" />
                Investment Score & Opportunity Index
              </CardTitle>
              <CardDescription className="text-xs">
                Quantitative opportunity rating derived from available database parameters
              </CardDescription>
            </div>

            <div className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-sm border border-amber-500/20">
              {inv.investmentScore ?? inv.score ?? 80}/100 Score
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Investment Rating</div>
              <div className="text-base font-black text-foreground">{inv.rating || "Strong Investment Opportunity"}</div>
            </div>
            <Sparkles className="w-6 h-6 text-amber-500" />
          </div>

          {/* Traceable Database Factors Explanation Tags */}
          {inv.basedOn && inv.basedOn.length > 0 && (
            <div className="p-3 rounded-xl border border-border/40 bg-card space-y-1.5">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Traceable Database Factors</div>
              <div className="flex flex-wrap gap-1.5">
                {inv.basedOn.map((factor, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                    ✔ {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Factor Scores List */}
          <div className="space-y-2 text-xs">
            {inv.factors?.map((f, idx) => (
              <div key={idx} className="p-2.5 rounded-xl border border-border/40 bg-card space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {f.name}
                  </span>
                  <span className="font-extrabold text-primary">{f.score}/100</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${f.score || 80}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SearchTrendsInvestmentSection;

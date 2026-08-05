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
            Real-time home buyer search queries, trending keywords, and top viewed projects
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Trending Searches Chips */}
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              Trending Queries (+24% to +42%)
            </div>
            <div className="flex flex-wrap gap-2">
              {search.trendingSearches?.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted/60 text-foreground border border-border/60 hover:bg-accent/10 transition-colors">
                  {item.query}
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">{item.growth}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-border/30">
            {/* Most Searched Localities */}
            <div className="p-3 rounded-xl bg-card border border-border/50">
              <div className="font-bold text-foreground mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Top Localities
              </div>
              <ul className="space-y-1 text-muted-foreground text-[11px]">
                {search.mostSearchedLocalities?.slice(0, 4).map((loc, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>{loc}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">High Vol</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Most Viewed Projects */}
            <div className="p-3 rounded-xl bg-card border border-border/50">
              <div className="font-bold text-foreground mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-500" /> Top Viewed Projects
              </div>
              <ul className="space-y-1 text-muted-foreground text-[11px]">
                {search.mostViewedProjects?.slice(0, 3).map((proj, i) => (
                  <li key={i} className="flex items-center justify-between truncate">
                    <span className="truncate">{proj}</span>
                    <span className="text-primary font-semibold">Hot</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
                Quantitative opportunity rating derived from yield, infra, and builder activity
              </CardDescription>
            </div>

            <div className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-sm border border-amber-500/20">
              {inv.score || 91}/100 Score
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Investment Rating</div>
              <div className="text-base font-black text-foreground">{inv.rating || "Excellent Opportunity"}</div>
            </div>
            <Sparkles className="w-6 h-6 text-amber-500" />
          </div>

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
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${f.score || 85}%` }} />

                </div>
                <div className="text-[10px] text-muted-foreground">{f.detail}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SearchTrendsInvestmentSection;

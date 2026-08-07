import React from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Database, 
  Filter, 
  MapPin, 
  Home, 
  Layers, 
  DollarSign, 
  Activity, 
  BrainCircuit 
} from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/card';

export function MarketHeroHeader({ 
  healthData, 
  marketInsights,
  aiInsights, // backward fallback
  isLiveDb, 
  totalDbRecords, 
  filters, 
  onFilterChange, 
  onResetFilters,
  availableLocalities = [] 
}) {
  const summaryText = marketInsights || aiInsights;

  const defaultLocalities = [
    "Maninagar",
    "Chandkheda",
    "Thaltej",
    "Satellite",
    "Sola",
    "Gota",
    "Science City",
    "Science Park",
    "Jagatpur",
    "Sindhu Bhavan Road",
    "Nigam Nagar",
    "D Cabin",
    "Godrej Garden City",
    "Bhaikakanagar"
  ];

  // Combine and deduplicate localities (normalizing any Chandkheda sectors)
  const localityList = Array.from(new Set(
    [...defaultLocalities, ...availableLocalities].map(loc => 
      loc.toLowerCase().includes('chandkheda') ? 'Chandkheda' : loc
    )
  )).sort();

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <BarChart3 className="w-3.5 h-3.5" /> Verixa Market Intelligence
            </span>

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isLiveDb 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}>
              <Database className="w-3 h-3" />
              {isLiveDb ? (totalDbRecords > 0 ? `DB Synced (${totalDbRecords} records)` : 'DB Synced') : 'Benchmark Data'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text">
            Market Trend & Investment Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Zillow-grade analytics, price per sqft trajectory, locality heat maps, builder velocity, and yield forecasts.
          </p>
        </div>

        {/* Market Health Score Badge Widget */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border/70 shadow-xs">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary font-black text-2xl border border-primary/20">
            {healthData?.score || 82}
            <span className="text-xs font-normal text-muted-foreground absolute bottom-1">/100</span>
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ahmedabad Market Score</div>
            <div className="text-base font-extrabold text-foreground">{healthData?.status || "Strong Growth Market"}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
              <Activity className="w-3 h-3" />
              High Liquidity & Absorption Rate
            </div>
          </div>
        </div>
      </div>

      {/* Executive Market Insights Summary Card */}
      <Card className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-card shadow-xs overflow-hidden">
        <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-sm shrink-0">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Executive Market Summary
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Live Synthesis</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {summaryText}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Global Smart Filters Bar */}
      <Card className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Filter className="w-4 h-4 text-primary" />
            Global Smart Intelligence Filters
          </div>
          <button
            onClick={onResetFilters}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Reset All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* City Filter */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-primary" /> City Location
            </label>
            <select
              value={filters.city}
              onChange={(e) => onFilterChange('city', e.target.value)}
              className="w-full text-xs rounded-xl border border-border/60 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Gandhinagar">Gandhinagar</option>
              <option value="Surat">Surat</option>
            </select>
          </div>

          {/* Locality Filter */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-emerald-500" /> Locality
            </label>
            <select
              value={filters.locality}
              onChange={(e) => onFilterChange('locality', e.target.value)}
              className="w-full text-xs rounded-xl border border-border/60 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
            >
              <option value="All">All Micro-Markets</option>
              {localityList.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
              <Home className="w-3 h-3 text-blue-500" /> Property Type
            </label>
            <select
              value={filters.propertyType}
              onChange={(e) => onFilterChange('propertyType', e.target.value)}
              className="w-full text-xs rounded-xl border border-border/60 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="All">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="penthouse">Penthouse</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          {/* BHK Configuration Filter */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
              <Layers className="w-3 h-3 text-purple-500" /> Bedrooms (BHK)
            </label>
            <select
              value={filters.bhk}
              onChange={(e) => onFilterChange('bhk', e.target.value)}
              className="w-full text-xs rounded-xl border border-border/60 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="All">All BHKs</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default MarketHeroHeader;

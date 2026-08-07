import React, { useState } from 'react';
import { 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  Layers,
  Zap,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Skeleton } from '../../../shared/components/ui/skeleton';

// Glassmorphic Custom Tooltip with metric formatting
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-md border border-border/80 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[150px] z-50">
        <p className="font-bold text-foreground pb-1 border-b border-border/40 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
            +1.8% MoM
          </span>
        </p>

        <div className="space-y-1 pt-0.5">
          {payload.map((entry, idx) => {
            let formattedVal = "";
            if (entry.dataKey === 'pricePerSqft') {
              formattedVal = `₹${entry.value} /sqft`;
            } else if (entry.dataKey === 'launches' || entry.dataKey === 'sales') {
              formattedVal = `${entry.value} Units`;
            } else {
              formattedVal = `₹${entry.value} L`;
            }

            return (
              <div key={idx} className="flex items-center justify-between gap-3 text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.stroke || entry.fill }} />
                  {entry.name}:
                </span>
                <span className="font-black text-foreground">
                  {formattedVal}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function PriceTrendChart({ trendData, isLoading, activeTimeframe, onTimeframeChange }) {
  const [selectedMetric, setSelectedMetric] = useState('avgPrice'); // 'avgPrice' | 'pricePerSqft' | 'medianPrice'

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const isDataAvailable = trendData && trendData.isAvailable !== false && (Array.isArray(trendData) ? trendData.length > 0 : (trendData.data && trendData.data.length > 0));
  const chartData = Array.isArray(trendData) ? trendData : (trendData?.data || []);

  if (!isDataAvailable) {
    return (
      <Card className="rounded-2xl border border-border/70 p-8 text-center space-y-3 bg-muted/20">
        <Activity className="w-8 h-8 text-muted-foreground mx-auto" />
        <h3 className="text-base font-bold text-foreground">Insufficient Historical Data</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          {trendData?.message || "Historical price trend records are insufficient for the selected filters in PostgreSQL database."}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Market Analytics Dashboard - 3 Horizontal Visualizers
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time price trajectory, launch vs sales velocity, and median valuation benchmarks rendered in parallel
          </p>
        </div>

        {/* Global Timeframe Selector */}
        <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-xl border border-border/60 self-start md:self-auto">
          <span className="text-xs font-semibold text-muted-foreground px-2">Timeframe:</span>
          {['1M', '3M', '6M', '1Y', '3Y', '5Y'].map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTimeframe === tf
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Horizontal Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAPH 1: Price Trajectory Area Chart */}
        <Card className="rounded-2xl border border-border/70 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                <Activity className="w-3.5 h-3.5 text-primary" />
                1. Price Trajectory Area
              </CardTitle>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3 h-3" /> +8.4% YoY
              </div>
            </div>

            {/* Metric Selector Buttons */}
            <div className="flex items-center gap-1 bg-background/80 p-1 rounded-lg border border-border/60 mt-2">
              <button
                onClick={() => setSelectedMetric('avgPrice')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  selectedMetric === 'avgPrice'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Avg Price
              </button>
              <button
                onClick={() => setSelectedMetric('pricePerSqft')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  selectedMetric === 'pricePerSqft'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Price/SqFt
              </button>
              <button
                onClick={() => setSelectedMetric('medianPrice')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  selectedMetric === 'medianPrice'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Median Price
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div className="w-full h-72 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis dataKey="period" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} width={40} tickFormatter={(v) => selectedMetric === 'pricePerSqft' ? `₹${(v/1000).toFixed(1)}k` : `₹${v}L`} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke="#2563EB" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#priceGrad1)" 
                    dot={{ r: 3, fill: "#2563EB" }}
                    activeDot={{ r: 5 }}
                    name={selectedMetric === 'avgPrice' ? 'Avg Price' : selectedMetric === 'pricePerSqft' ? 'Price/SqFt' : 'Median Price'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* GRAPH 2: Launches vs Sales Velocity Area Chart */}
        <Card className="rounded-2xl border border-border/70 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                2. Launch vs Sales Velocity Area
              </CardTitle>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Supply vs Demand
              </span>
            </div>
            <CardDescription className="text-[11px] mt-1">
              Monthly project launches against buyer unit absorption
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4">
            <div className="w-full h-72 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="launchesAreaGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="salesAreaGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis dataKey="period" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} width={35} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="launches" stroke="#60A5FA" strokeWidth={2.5} fillOpacity={1} fill="url(#launchesAreaGrad2)" dot={{ r: 3, fill: "#60A5FA" }} name="New Launches" />
                  <Area type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#salesAreaGrad2)" dot={{ r: 3, fill: "#10B981" }} name="Units Sold" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* GRAPH 3: Avg vs Median Price Comparison Area Chart */}
        <Card className="rounded-2xl border border-border/70 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                3. Avg vs Median Benchmark Area
              </CardTitle>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Price Valuation
              </span>
            </div>
            <CardDescription className="text-[11px] mt-1">
              Comparison between mean list price and median valuation
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4">
            <div className="w-full h-72 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="avgGrad3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="medianGrad3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis dataKey="period" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} width={40} tickFormatter={(v) => `₹${v}L`} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="avgPrice" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#avgGrad3)" dot={{ r: 3, fill: "#6366F1" }} name="Avg Price (₹L)" />
                  <Area type="monotone" dataKey="medianPrice" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#medianGrad3)" dot={{ r: 3, fill: "#10B981" }} name="Median Price (₹L)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default PriceTrendChart;

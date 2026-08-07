import React, { useState } from 'react';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';

export function MarketTrendChart({ locality }) {
  const [timeRange, setTimeRange] = useState('1Y');

  if (!locality) return null;

  const rawTrends = locality.priceTrends || [
    { month: "Jan 24", price: 4200, yield: 3.1, demand: 75 },
    { month: "Mar 24", price: 4320, yield: 3.2, demand: 77 },
    { month: "May 24", price: 4400, yield: 3.3, demand: 79 },
    { month: "Jul 24", price: 4510, yield: 3.4, demand: 80 },
    { month: "Sep 24", price: 4600, yield: 3.4, demand: 81 },
    { month: "Nov 24", price: 4690, yield: 3.5, demand: 82 },
    { month: "Jan 25", price: 4750, yield: 3.5, demand: 83 },
    { month: "Mar 25", price: 4800, yield: 3.5, demand: 84 }
  ];

  // Slice price trends according to selected range filter
  const displayedTrends = 
    timeRange === '6M' ? rawTrends.slice(-4) :
    timeRange === '3Y' ? [...rawTrends, { month: "Jul 25", price: 4950, yield: 3.6, demand: 86 }, { month: "Jan 26", price: 5100, yield: 3.7, demand: 88 }] :
    rawTrends;

  return (
    <div className="space-y-6">
      {/* Locality Market Intelligence Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Locality Market Intelligence
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-foreground">
            Market Analysis & Price Growth in {locality.name}
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Historical pricing, rental yield, and demand score progression with analytical data points
          </p>
        </div>

        {/* Time Range Filter for Both Charts */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl w-fit shrink-0">
          {['6M', '1Y', '3Y', '5Y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Responsive Grid Layout (Price Trend & Yield Index Side-by-Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: Price Trend (₹/sqft) */}
        <Card className="rounded-3xl border bg-card shadow-sm flex flex-col justify-between overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <CardTitle className="text-base font-extrabold text-foreground">
                  Price Trend (₹/sqft)
                </CardTitle>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                {locality.psf}/sqft
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Average price per sqft progression
            </p>
          </CardHeader>

          <CardContent className="p-5 pt-2 flex-1 flex flex-col justify-between">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={displayedTrends}
                  margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="localityPriceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.15)" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11, fill: 'currentColor' }} 
                    className="text-muted-foreground font-medium"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'currentColor' }} 
                    className="text-muted-foreground font-medium"
                    axisLine={false}
                    tickLine={false}
                    domain={['dataMin - 150', 'dataMax + 150']}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.15)', 
                      borderRadius: '14px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '600',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                    }}
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}/sqft`, 'Price per Sqft']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#localityPriceGradient)" 
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 7, fill: '#059669', strokeWidth: 3, stroke: '#ffffff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: Yield & Demand Index */}
        <Card className="rounded-3xl border bg-card shadow-sm flex flex-col justify-between overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <BarChart3 className="w-4 h-4" />
                </span>
                <CardTitle className="text-base font-extrabold text-foreground">
                  Yield & Demand Index
                </CardTitle>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 shrink-0">
                Yield: {locality.rentalYield}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Rental yield (%) & market demand score (/100)
            </p>
          </CardHeader>

          <CardContent className="p-5 pt-2 flex-1 flex flex-col justify-between">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={displayedTrends}
                  margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.15)" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11, fill: 'currentColor' }} 
                    className="text-muted-foreground font-medium"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: 'currentColor' }} 
                    className="text-muted-foreground font-medium"
                    axisLine={false}
                    tickLine={false}
                    domain={[2.0, 6.0]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: 'currentColor' }} 
                    className="text-muted-foreground font-medium"
                    axisLine={false}
                    tickLine={false}
                    domain={[50, 100]}
                    tickFormatter={(v) => `${v} pts`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.15)', 
                      borderRadius: '14px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                    formatter={(val, name) => [
                      name === 'yield' ? `${val}%` : `${val} Score`,
                      name === 'yield' ? 'Rental Yield' : 'Demand Index'
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="yield" 
                    name="Rental Yield (%)" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="demand" 
                    name="Demand Index" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MarketTrendChart;

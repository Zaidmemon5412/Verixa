import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';

export function MarketTrendChart({ locality }) {
  const [timeRange, setTimeRange] = useState('1Y');

  if (!locality) return null;

  const rawTrends = locality.priceTrends || [
    { month: "Jan 24", price: 4200 },
    { month: "Mar 24", price: 4320 },
    { month: "May 24", price: 4400 },
    { month: "Jul 24", price: 4510 },
    { month: "Sep 24", price: 4600 },
    { month: "Nov 24", price: 4690 },
    { month: "Jan 25", price: 4750 },
    { month: "Mar 25", price: 4800 }
  ];

  // Slice price trends according to selected range filter
  const displayedTrends = 
    timeRange === '6M' ? rawTrends.slice(-4) :
    timeRange === '3Y' ? [...rawTrends, { month: "Jul 25", price: 4950 }, { month: "Jan 26", price: 5100 }] :
    rawTrends;

  return (
    <Card className="rounded-3xl border bg-card shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-lg font-extrabold text-foreground">
            Price Trend in {locality.name}
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            ₹/sqft historical growth analysis
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl w-fit">
          {['6M', '1Y', '3Y', '5Y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4">
        <div className="h-64 md:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={displayedTrends}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="localityPriceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
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
                domain={['dataMin - 200', 'dataMax + 200']}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  borderColor: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
                formatter={(val) => [`₹${val.toLocaleString('en-IN')}/sqft`, 'Price']}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#localityPriceGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

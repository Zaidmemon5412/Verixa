import React from 'react';
import { TrendingUp, BarChart3, Shield, Zap } from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { MARKET_TREND_DATA, LOCALITY_PRICE_DATA } from '../constants/marketData';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';

export function MarketTrendsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Real-Time Market Analytics & Yield Radar</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Market Trend Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quarterly new launches vs sales velocity and price per sqft trajectory across key micro-markets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Sales Velocity */}
        <Card className="rounded-2xl border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              New Property Launches vs Sales Velocity
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MARKET_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="launches" fill="#93C5FD" name="New Launches" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sales" fill="#2563EB" name="Units Sold" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Price per sqft by Locality */}
        <Card className="rounded-2xl border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Average Price (₹/sqft) by Key Locality
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LOCALITY_PRICE_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" fontSize={12} unit="k" />
                <YAxis dataKey="name" type="category" fontSize={12} />
                <Tooltip />
                <Bar dataKey="price" fill="#10B981" name="Avg Price (k/sqft)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MarketTrendsPage;


import React from 'react';
import { Home, Square, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/ui/card';

export function LocalityStats({ locality }) {
  if (!locality) return null;

  const stats = [
    {
      id: 'price',
      label: 'Avg Property Price',
      value: locality.avgPrice,
      icon: Home,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    },
    {
      id: 'psf',
      label: 'Price per Sqft',
      value: locality.psf,
      icon: Square,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    },
    {
      id: 'yield',
      label: 'Rental Yield',
      value: locality.rentalYield,
      icon: TrendingUp,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'score',
      label: 'Growth Score',
      value: locality.growthScore,
      icon: Zap,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.id} className="rounded-2xl border bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 md:p-5 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${item.color}`}>
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs text-muted-foreground font-medium truncate">
                  {item.label}
                </span>
              </div>
              <p className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
                {item.value}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

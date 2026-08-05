import React from 'react';
import { BookOpen, Hospital, Train, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { InfrastructureCard } from './InfrastructureCard';

export function InfrastructureSection({ locality }) {
  if (!locality) return null;

  const infra = locality.infra || {
    schools: 12,
    hospitals: 6,
    metro: "2.4 km",
    shopping: 8,
  };

  const items = [
    {
      id: 'schools',
      label: 'Schools nearby',
      value: infra.schools,
      icon: BookOpen,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    },
    {
      id: 'hospitals',
      label: 'Hospitals nearby',
      value: infra.hospitals,
      icon: Hospital,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
    },
    {
      id: 'metro',
      label: 'Nearest Metro',
      value: infra.metro,
      icon: Train,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    },
    {
      id: 'shopping',
      label: 'Shopping centers',
      value: infra.shopping,
      icon: ShoppingBag,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    }
  ];

  return (
    <Card className="rounded-3xl border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-extrabold text-foreground">
          Infrastructure & Connectivity
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 pt-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <InfrastructureCard
              key={item.id}
              label={item.label}
              value={item.value}
              icon={item.icon}
              color={item.color}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

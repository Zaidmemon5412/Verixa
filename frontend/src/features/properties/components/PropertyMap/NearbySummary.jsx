import React from 'react';
import { Card, CardContent } from '../../../../shared/components/ui/card';
import { formatDistance } from '../../services/nearbyService';

export function NearbySummary({ nearbyPlaces = [], onSelectCategory }) {
  const summaryCategories = [
    { key: 'hospitals', label: 'Hospitals', icon: '🏥', bg: 'bg-rose-500/10 text-rose-600 border-rose-200' },
    { key: 'schools', label: 'Schools', icon: '🏫', bg: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    { key: 'metro', label: 'Metro', icon: '🚇', bg: 'bg-purple-500/10 text-purple-600 border-purple-200' },
    { key: 'parks', label: 'Parks', icon: '🌳', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
    { key: 'shopping', label: 'Shopping', icon: '🛍️', bg: 'bg-pink-500/10 text-pink-600 border-pink-200' },
    { key: 'restaurants', label: 'Restaurants', icon: '🍽️', bg: 'bg-orange-500/10 text-orange-600 border-orange-200' }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <span>⚡</span>
          <span>Surrounding Ecosystem Highlights</span>
        </h4>
        <span className="text-xs text-muted-foreground">Nearest amenities within radius</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {summaryCategories.map((cat) => {
          const items = nearbyPlaces.filter(p => p.category === cat.key);
          const totalCount = items.length;
          const nearestItem = items.length > 0
            ? items.reduce((prev, curr) => (curr.distanceKm < prev.distanceKm ? curr : prev), items[0])
            : null;

          const nearestDistFormatted = nearestItem ? formatDistance(nearestItem.distanceKm) : 'N/A';

          return (
            <Card
              key={cat.key}
              onClick={() => onSelectCategory && onSelectCategory(cat.key)}
              className="rounded-2xl border bg-card cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all duration-200 group"
            >
              <CardContent className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${cat.bg}`}>
                    {totalCount} Places
                  </span>
                </div>
                <div>
                  <h5 className="font-extrabold text-foreground text-xs">{cat.label}</h5>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Nearest: <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">{nearestDistFormatted}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default NearbySummary;

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../shared/components/ui/card';
import { Input } from '../../../../shared/components/ui/input';
import { MapPin, Search, Navigation, Building } from 'lucide-react';
import { CATEGORY_CONFIG } from '../../services/nearbyService';

export function NearbyList({ nearbyPlaces = [], activeCategory = 'all' }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter & sort nearest first
  const sortedPlaces = [...nearbyPlaces]
    .filter(place => {
      if (activeCategory !== 'all' && place.category !== activeCategory) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          place.name.toLowerCase().includes(query) ||
          (place.address && place.address.toLowerCase().includes(query)) ||
          place.categoryLabel.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <Navigation className="w-4 h-4 text-indigo-600" />
            <span>Surrounding Ecosystem Directory</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-extrabold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              {sortedPlaces.length} Nearby Spots
            </span>
          </CardTitle>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search places or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-9 rounded-xl bg-muted/30"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {sortedPlaces.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Building className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-xs font-semibold text-muted-foreground">
              No nearby places found for the selected category or radius.
            </p>
            <p className="text-[11px] text-muted-foreground/80">
              Try increasing the radius to 2 KM or 5 KM using the map controls above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto scrollbar-thin">
            {sortedPlaces.map((place) => {
              const catConfig = CATEGORY_CONFIG[place.category] || { icon: '📍', label: 'Place' };

              return (
                <div
                  key={place.id}
                  className="p-3.5 hover:bg-muted/40 transition-colors flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-muted/60 dark:bg-slate-800 border flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                      {catConfig.icon}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h6 className="font-bold text-foreground text-xs truncate">
                          {place.name}
                        </h6>
                        <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded capitalize">
                          {place.categoryLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                        <span>{place.address || 'Vicinity Zone'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-extrabold px-2.5 py-1 rounded-xl shadow-xs">
                      {place.distanceFormatted}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NearbyList;

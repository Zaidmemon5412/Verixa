import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../shared/components/ui/card';
import { Input } from '../../../../shared/components/ui/input';
import { MapPin, Search, Navigation, Building2, School, Hospital, ShoppingBag, Train, Trees } from 'lucide-react';
import { CATEGORY_CONFIG } from '../../services/nearbyService';

export function NearbyList({ nearbyPlaces = [], activeCategory = 'all' }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter places based on search term
  const filteredPlaces = nearbyPlaces
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

  // Group places into 5 primary columns for multi-column dashboard
  const columnsConfig = [
    {
      id: 'schools',
      title: 'Schools & Education',
      icon: <School className="w-4 h-4 text-blue-500" />,
      headerBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      categories: ['schools']
    },
    {
      id: 'hospitals',
      title: 'Hospitals & Health',
      icon: <Hospital className="w-4 h-4 text-rose-500" />,
      headerBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      categories: ['hospitals']
    },
    {
      id: 'shopping',
      title: 'Shopping & Malls',
      icon: <ShoppingBag className="w-4 h-4 text-pink-500" />,
      headerBg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
      categories: ['shopping']
    },
    {
      id: 'transport',
      title: 'Transport & Metro',
      icon: <Train className="w-4 h-4 text-purple-500" />,
      headerBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      categories: ['metro', 'bus_stops']
    },
    {
      id: 'parks',
      title: 'Parks & Lifestyle',
      icon: <Trees className="w-4 h-4 text-emerald-500" />,
      headerBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      categories: ['parks', 'restaurants', 'banks', 'petrol_pumps', 'other']
    }
  ];

  const getTravelTime = (distKm) => {
    if (!distKm || isNaN(distKm)) return null;
    if (distKm < 0.8) {
      const mins = Math.max(1, Math.round((distKm * 1000) / 80));
      return `${mins} min walk`;
    }
    const mins = Math.max(2, Math.round(distKm * 3.5));
    return `${mins} min drive`;
  };

  return (
    <Card className="rounded-2xl border-2 border-border/80 bg-card shadow-sm w-full overflow-hidden text-foreground">
      <CardHeader className="border-b p-4 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base font-extrabold flex items-center gap-2 text-foreground">
            <Navigation className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>Surrounding Ecosystem Directory</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              {filteredPlaces.length} Verified Spots
            </span>
          </CardTitle>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search schools, hospitals, metro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-9 rounded-xl bg-muted/40"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {filteredPlaces.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Building2 className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-xs font-semibold text-muted-foreground">
              No nearby places found matching your filter criteria.
            </p>
          </div>
        ) : (
          /* RESPONSIVE FULL-WIDTH 5-COLUMN LOCALITY INTELLIGENCE DASHBOARD */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
            {columnsConfig.map((col) => {
              const colPlaces = filteredPlaces.filter(p => col.categories.includes(p.category));

              return (
                <div 
                  key={col.id}
                  className="rounded-2xl border bg-muted/10 overflow-hidden flex flex-col h-full min-h-[300px]"
                >
                  {/* Visually Highlighted Sticky Column Header */}
                  <div className={`p-3 border-b flex items-center justify-between font-bold text-xs ${col.headerBg}`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      {col.icon}
                      <span className="truncate">{col.title}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10 font-black">
                      {colPlaces.length}
                    </span>
                  </div>

                  {/* Column List of Places */}
                  <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[360px] scrollbar-thin">
                    {colPlaces.length === 0 ? (
                      <div className="p-4 text-center text-[11px] text-muted-foreground italic">
                        No places listed in this category
                      </div>
                    ) : (
                      colPlaces.map((place) => {
                        const travelTime = getTravelTime(place.distanceKm);

                        return (
                          <div
                            key={place.id}
                            className="p-2.5 rounded-xl border bg-card hover:border-primary/40 transition-all space-y-1 group shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <h6 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {place.name}
                              </h6>
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-semibold pt-0.5">
                              <span className="text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">
                                {place.distanceFormatted}
                              </span>
                              {travelTime && (
                                <span className="text-muted-foreground text-[10px]">
                                  {travelTime}
                                </span>
                              )}
                            </div>

                            {place.address && (
                              <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1 pt-0.5">
                                <MapPin className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                                <span>{place.address}</span>
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
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

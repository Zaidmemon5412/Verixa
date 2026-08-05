import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../shared/components/ui/card';
import { Button } from '../../../../shared/components/ui/button';
import { Skeleton } from '../../../../shared/components/ui/skeleton';
import { Badge } from '../../../../shared/components/ui/badge';
import { MapPin, Sparkles, AlertCircle, RefreshCw, Compass, Footprints, ShieldCheck } from 'lucide-react';
import { nearbyService } from '../../services/nearbyService';
import PropertyMap from './PropertyMap';
import MapControls from './MapControls';
import RadiusSelector from './RadiusSelector';
import CategoryChips from './CategoryChips';
import NearbySummary from './NearbySummary';
import NearbyList from './NearbyList';

export function PropertyMapSection({ property }) {
  const [radiusKm, setRadiusKm] = useState(2);
  const [activeCategory, setActiveCategory] = useState('all');
  const [mapType, setMapType] = useState('streets');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNearbyData = async () => {
    if (!property) return;
    setLoading(true);
    setError(null);

    try {
      const places = await nearbyService.getNearbyPlaces({
        propertyId: property.id,
        latitude: property.latitude,
        longitude: property.longitude,
        radiusKm: radiusKm,
        category: null
      });
      setNearbyPlaces(places || []);
    } catch (err) {
      console.error('Failed to load nearby places:', err);
      setError('Unable to fetch nearby places from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (property) {
      loadNearbyData();
    }
  }, [property?.id, property?.latitude, property?.longitude, radiusKm]);

  // Compute Category Counts
  const counts = useMemo(() => {
    return nearbyPlaces.reduce((acc, place) => {
      acc[place.category] = (acc[place.category] || 0) + 1;
      return acc;
    }, {});
  }, [nearbyPlaces]);

  // Calculate Walkability & Connectivity Estimates
  const totalSpots = nearbyPlaces.length;
  const walkabilityScore = Math.min(96, Math.max(50, 60 + totalSpots * 2));
  const connectivityScore = Math.min(98, Math.max(55, 65 + (counts.metro || 0) * 10 + (counts.bus_stops || 0) * 5));

  // Filtered places for map view
  const filteredPlaces = useMemo(() => {
    if (activeCategory === 'all') return nearbyPlaces;
    return nearbyPlaces.filter(p => p.category === activeCategory);
  }, [nearbyPlaces, activeCategory]);

  return (
    <div className="space-y-6 scroll-mt-20 my-8" id="location-map-section">
      {/* Header & Controls Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500" />
              Verixa Nearby Intelligence
            </Badge>
            <span className="text-xs text-muted-foreground">• Live Ecosystem</span>
          </div>
          <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            Location & Surrounding Ecosystem
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {property?.location || 'Ahmedabad, Gujarat'} &bull; Interactive spatial map & neighborhood metrics
          </p>
        </div>

        <RadiusSelector selectedRadius={radiusKm} onChange={setRadiusKm} />
      </div>

      {/* Verixa AI Intelligence Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent rounded-2xl border border-indigo-500/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-extrabold block tracking-wider">
              Walkability Score
            </span>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
              {walkabilityScore}/100 <span className="text-xs text-emerald-600 font-semibold">(Very Walkable)</span>
            </span>
          </div>
        </div>

        <div className="p-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-2xl border border-emerald-500/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-extrabold block tracking-wider">
              Transit & Connectivity
            </span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {connectivityScore}/100 <span className="text-xs text-emerald-600 font-semibold">(Excellent)</span>
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 bg-muted/40 rounded-2xl border flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-extrabold block tracking-wider">
              Verified Radius
            </span>
            <span className="text-xs font-bold text-foreground block">
              Within {radiusKm} KM Circle Boundary
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <CategoryChips
        activeCategory={activeCategory}
        counts={counts}
        onSelectCategory={setActiveCategory}
      />

      {/* Map Main Engine Container */}
      <div className="relative w-full h-[460px] rounded-3xl overflow-hidden border border-border shadow-xl bg-muted/20">
        <MapControls
          mapType={mapType}
          onToggleMapType={setMapType}
          onRecenter={loadNearbyData}
        />

        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/40 p-6 space-y-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="w-48 h-4 rounded-lg" />
            <Skeleton className="w-64 h-3 rounded-lg" />
            <span className="text-xs text-muted-foreground font-semibold animate-pulse">
              Syncing Verixa Spatial Engine & Nearby APIs...
            </span>
          </div>
        ) : error ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-rose-500/5">
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <h4 className="font-bold text-foreground text-sm">{error}</h4>
            <Button onClick={loadNearbyData} variant="outline" size="sm" className="gap-2 rounded-xl">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry API Fetch</span>
            </Button>
          </div>
        ) : (
          <PropertyMap
            property={property}
            nearbyPlaces={nearbyPlaces}
            radiusKm={radiusKm}
            mapType={mapType}
            activeCategory={activeCategory}
          />
        )}
      </div>

      {/* Nearby Summary Cards */}
      <NearbySummary
        nearbyPlaces={nearbyPlaces}
        onSelectCategory={setActiveCategory}
      />

      {/* Nearby Places Directory List */}
      <NearbyList
        nearbyPlaces={nearbyPlaces}
        activeCategory={activeCategory}
      />
    </div>
  );
}

export default PropertyMapSection;

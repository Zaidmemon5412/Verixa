import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '../../../../shared/components/ui/button';
import { Skeleton } from '../../../../shared/components/ui/skeleton';
import { Badge } from '../../../../shared/components/ui/badge';
import { MapPin, Sparkles, AlertCircle, RefreshCw, Compass, Footprints, ShieldCheck } from 'lucide-react';
import { nearbyService, resolveAhmedabadCoordinates } from '../../services/nearbyService';
import PropertyMap from './PropertyMap';
import MapControls from './MapControls';
import RadiusSelector from './RadiusSelector';
import CategoryChips from './CategoryChips';
import NearbySummary from './NearbySummary';
import NearbyList from './NearbyList';

export function PropertyMapSection({ property }) {
  const [radiusKm, setRadiusKm] = useState(2);
  const [activeCategory, setActiveCategory] = useState('all');
  const [mapType, setMapType] = useState('hybrid');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolvedPropertyCoords = useMemo(
    () =>
      resolveAhmedabadCoordinates(
        property?.latitude,
        property?.longitude,
        `${property?.locality || ''} ${property?.location || ''} ${property?.address || ''} ${property?.name || ''}`,
        property?.id
      ),
    [property?.latitude, property?.longitude, property?.locality, property?.location, property?.address, property?.name, property?.id]
  );

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${resolvedPropertyCoords.latitude},${resolvedPropertyCoords.longitude}`;

  const loadNearbyData = useCallback(async () => {
    if (!property) return;
    setLoading(true);
    setError(null);
    setSelectedPlace(null);

    try {
      const places = await nearbyService.getNearbyPlaces({
        propertyId: property.id,
        latitude: resolvedPropertyCoords.latitude,
        longitude: resolvedPropertyCoords.longitude,
        locality: property.locality || property.location || '',
        radiusKm: radiusKm,
        category: null,
      });
      setNearbyPlaces(places || []);
    } catch (err) {
      console.error('Failed to load nearby places:', err);
      setError('Unable to fetch nearby places from server.');
    } finally {
      setLoading(false);
    }
  }, [property, resolvedPropertyCoords.latitude, resolvedPropertyCoords.longitude, radiusKm]);

  useEffect(() => {
    if (property) {
      loadNearbyData();
    }
  }, [loadNearbyData, property]);

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
  const connectivityScore = Math.min(
    98,
    Math.max(55, 65 + (counts.metro || 0) * 10 + (counts.bus_stops || 0) * 5)
  );

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    const mapEl = document.getElementById('verixa-interactive-map-container');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <div className="space-y-6 scroll-mt-20 my-8" id="location-map-section">
      {/* Header & Controls Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500" />
              Verixa Nearby Intelligence
            </Badge>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              • Multi-Provider Spatial Engine Active
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            Location & Surrounding Ecosystem
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {property?.location || 'Ahmedabad, Gujarat'} &bull; GPS{' '}
            {resolvedPropertyCoords.latitude.toFixed(4)}°N,{' '}
            {resolvedPropertyCoords.longitude.toFixed(4)}°E
          </p>
        </div>

        <RadiusSelector selectedRadius={radiusKm} onChange={setRadiusKm} />
      </div>

      {/* Verixa AI Intelligence Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div className="p-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent rounded-2xl border border-indigo-500/20 flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            <Footprints className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-extrabold block tracking-wider truncate">
              Walkability
            </span>
            <span className="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 block truncate">
              {walkabilityScore}/100{' '}
              <span className="hidden sm:inline text-xs text-emerald-600 font-semibold">
                (Very Walkable)
              </span>
            </span>
          </div>
        </div>

        <div className="p-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-2xl border border-emerald-500/20 flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-extrabold block tracking-wider truncate">
              Connectivity
            </span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 block truncate">
              {connectivityScore}/100{' '}
              <span className="hidden sm:inline text-xs text-emerald-600 font-semibold">
                (Excellent)
              </span>
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 bg-muted/40 rounded-2xl border flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-extrabold block tracking-wider">
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
      <div
        id="verixa-interactive-map-container"
        className={`relative w-full ${isFullscreen ? 'h-[75vh] min-h-[520px]' : 'h-[360px] sm:h-[460px]'
          } rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-xl bg-muted/20 transition-all duration-300`}
      >
        <MapControls
          mapType={mapType}
          onToggleMapType={setMapType}
          onRecenter={() => {
            setSelectedPlace(null);
            loadNearbyData();
          }}
          onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
          isFullscreen={isFullscreen}
          googleMapsUrl={googleMapsUrl}
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
            property={{
              ...property,
              latitude: resolvedPropertyCoords.latitude,
              longitude: resolvedPropertyCoords.longitude,
            }}
            nearbyPlaces={nearbyPlaces}
            radiusKm={radiusKm}
            mapType={mapType}
            activeCategory={activeCategory}
            selectedPlace={selectedPlace}
            onSelectPlace={setSelectedPlace}
            isFullscreen={isFullscreen}
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
        propertyCoords={resolvedPropertyCoords}
        selectedPlace={selectedPlace}
        onSelectPlace={handleSelectPlace}
      />
    </div>
  );
}

export default PropertyMapSection;

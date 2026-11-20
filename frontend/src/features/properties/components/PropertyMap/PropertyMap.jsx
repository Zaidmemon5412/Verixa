import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import NearbyMarkers from './NearbyMarkers';
import { resolveAhmedabadCoordinates } from '../../services/nearbyService';

/**
 * Multi-provider spatial tile configuration with automatic keyless failover.
 * Works out-of-the-box with zero API key errors, while optionally supporting
 * VITE_MAP_API_KEY (MapTiler / LocationIQ) when a valid key is provided.
 */
function getTileProviders() {
  const rawKey = (
    import.meta.env.VITE_MAP_API_KEY ||
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    ''
  ).trim();

  // Only treat a key as a MapTiler key if explicitly configured and non-placeholder
  const hasMapTilerKey =
    rawKey.length >= 16 &&
    !rawKey.startsWith('AIza') &&
    !rawKey.startsWith('AQ.') &&
    !rawKey.toLowerCase().includes('your_') &&
    import.meta.env.VITE_MAP_PROVIDER === 'maptiler';

  return {
    streets: [
      ...(hasMapTilerKey
        ? [
            {
              url: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${rawKey}`,
              attribution: '&copy; MapTiler &copy; OpenStreetMap contributors',
            },
          ]
        : []),
      {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      },
      {
        url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        attribution: 'Map data &copy; Google Maps',
      },
      {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
      },
    ],
    hybrid: [
      {
        url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        attribution: 'Imagery & Roads &copy; Google Maps',
      },
      {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri World Imagery',
      },
    ],
    satellite: [
      {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      },
      {
        url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        attribution: 'Satellite Imagery &copy; Google',
      },
    ],
  };
}

/**
 * Controller component to handle map re-centering, selected-marker flyTo, and container resize
 */
function MapViewController({ center, zoom, selectedPlace, isFullscreen }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 120);
    return () => clearTimeout(timer);
  }, [map, isFullscreen]);

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);

  useEffect(() => {
    if (selectedPlace && selectedPlace.latitude && selectedPlace.longitude) {
      const lat = parseFloat(selectedPlace.latitude);
      const lng = parseFloat(selectedPlace.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 16, { duration: 0.7 });
      }
    }
  }, [selectedPlace, map]);

  return null;
}

export function PropertyMap({
  property,
  nearbyPlaces = [],
  radiusKm = 2,
  mapType = 'streets',
  activeCategory = 'all',
  selectedPlace = null,
  onSelectPlace,
  isFullscreen = false,
}) {
  const [fallbackIdx, setFallbackIdx] = useState(0);

  useEffect(() => {
    setFallbackIdx(0);
  }, [mapType]);

  const resolvedCoords = useMemo(
    () =>
      resolveAhmedabadCoordinates(
        property?.latitude,
        property?.longitude,
        `${property?.locality || ''} ${property?.location || ''} ${property?.address || ''} ${property?.name || ''}`,
        property?.id
      ),
    [property?.latitude, property?.longitude, property?.locality, property?.location, property?.address, property?.name, property?.id]
  );

  const center = useMemo(
    () => [resolvedCoords.latitude, resolvedCoords.longitude],
    [resolvedCoords.latitude, resolvedCoords.longitude]
  );

  const providersByMode = useMemo(() => getTileProviders(), []);
  const modeProviders = providersByMode[mapType] || providersByMode.streets;
  const activeTile = modeProviders[Math.min(fallbackIdx, modeProviders.length - 1)];

  const radiusInMeters = radiusKm * 1000;
  const defaultZoom = radiusKm <= 0.5 ? 16 : radiusKm <= 1 ? 15 : radiusKm <= 2 ? 14 : 13;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={defaultZoom}
        scrollWheelZoom={false}
        className="w-full h-full z-0 rounded-2xl"
      >
        <TileLayer
          key={`${mapType}-${fallbackIdx}-${activeTile.url}`}
          attribution={activeTile.attribution}
          url={activeTile.url}
          maxZoom={19}
          eventHandlers={{
            tileerror: () => {
              setFallbackIdx((prev) => (prev + 1 < modeProviders.length ? prev + 1 : prev));
            },
          }}
        />

        {/* Subtle Dynamic Radius Circle Overlay */}
        <Circle
          center={center}
          radius={radiusInMeters}
          pathOptions={{
            fillColor: '#6366f1',
            fillOpacity: 0.06,
            color: '#4f46e5',
            weight: 1.5,
            dashArray: '4, 4',
          }}
        />

        {/* Property & Nearby Markers */}
        <NearbyMarkers
          property={{
            ...property,
            latitude: resolvedCoords.latitude,
            longitude: resolvedCoords.longitude,
          }}
          nearbyPlaces={nearbyPlaces}
          activeCategory={activeCategory}
          selectedPlace={selectedPlace}
          onSelectPlace={onSelectPlace}
        />

        <MapViewController
          center={center}
          zoom={defaultZoom}
          selectedPlace={selectedPlace}
          isFullscreen={isFullscreen}
        />
      </MapContainer>
    </div>
  );
}

export default PropertyMap;

import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import NearbyMarkers from './NearbyMarkers';
import { resolveAhmedabadCoordinates } from '../../services/nearbyService';

/**
 * Clean, 100% keyless multi-provider tile stack with automatic failover on tileerror.
 * Street view automatically matches Light (CartoDB Voyager) and Dark (CartoDB Dark Matter) themes.
 */
function getTileProviders(isDark) {
  return {
    streets: [
      isDark
        ? {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          }
        : {
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

function MapViewController({ center, zoom, selectedPlace, isFullscreen }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
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
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  // Sync map tiles live when user toggles Dark / Light mode
  useEffect(() => {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'));
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setFallbackIdx(0);
  }, [mapType, isDark]);

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

  const providersByMode = useMemo(() => getTileProviders(isDark), [isDark]);
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
          key={`${mapType}-${isDark ? 'dark' : 'light'}-${fallbackIdx}-${activeTile.url}`}
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
            fillOpacity: isDark && mapType === 'streets' ? 0.1 : 0.06,
            color: '#6366f1',
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

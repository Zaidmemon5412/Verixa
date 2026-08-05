import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import NearbyMarkers from './NearbyMarkers';

const TILE_SERVERS = {
  streets: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

/**
 * Controller component to handle map re-centering dynamically when property coords change
 */
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);

  return null;
}

export function PropertyMap({ property, nearbyPlaces = [], radiusKm = 2, mapType = 'streets', activeCategory = 'all' }) {
  const hasValidCoords = property?.latitude != null && property?.longitude != null && !isNaN(parseFloat(property.latitude)) && !isNaN(parseFloat(property.longitude));

  const center = useMemo(() => [
    hasValidCoords ? parseFloat(property.latitude) : 23.0225,
    hasValidCoords ? parseFloat(property.longitude) : 72.5714
  ], [property?.latitude, property?.longitude, hasValidCoords]);

  if (!hasValidCoords) {
    return (
      <div className="w-full h-full min-h-[300px] rounded-2xl bg-muted/40 border border-dashed border-border flex flex-col items-center justify-center p-6 text-center space-y-2">
        <div className="p-3 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <span className="font-extrabold text-sm">Location Unavailable</span>
        </div>
        <p className="text-xs text-muted-foreground max-w-xs">
          GPS latitude/longitude coordinates are not specified in database for property "{property?.name || 'Selected Property'}".
        </p>
      </div>
    );
  }


  const radiusInMeters = radiusKm * 1000;
  const currentTile = TILE_SERVERS[mapType] || TILE_SERVERS.streets;
  const mapKey = `map-${property?.id || 'prop'}-${center[0]}-${center[1]}-${mapType}`;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        key={mapKey}
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full z-0 rounded-2xl"
      >
        <TileLayer
          attribution={currentTile.attribution}
          url={currentTile.url}
          maxZoom={19}
        />

        {/* Subtle Dynamic Radius Circle Overlay */}
        <Circle
          center={center}
          radius={radiusInMeters}
          pathOptions={{
            fillColor: '#6366f1',
            fillOpacity: 0.05,
            color: '#4f46e5',
            weight: 1.5,
            dashArray: '4, 4'
          }}
        />

        {/* Property & Nearby Markers */}
        <NearbyMarkers 
          property={property} 
          nearbyPlaces={nearbyPlaces} 
          activeCategory={activeCategory} 
        />

        <MapViewController center={center} zoom={14} />
      </MapContainer>
    </div>
  );
}

export default PropertyMap;

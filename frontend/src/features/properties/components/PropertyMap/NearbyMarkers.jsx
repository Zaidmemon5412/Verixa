import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Building2, MapPin, ShieldCheck, ExternalLink } from 'lucide-react';
import { CATEGORY_CONFIG } from '../../services/nearbyService';

function createPropertyIcon() {
  return L.divIcon({
    className: 'custom-property-pin-marker',
    html: `
      <div class="relative flex items-center justify-center group">
        <span class="absolute w-12 h-12 bg-indigo-500/25 rounded-full animate-ping"></span>
        <div class="relative w-11 h-11 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-900 text-white rounded-2xl shadow-2xl border-2 border-white flex items-center justify-center transform hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div class="absolute -bottom-1.5 w-2.5 h-2.5 bg-violet-900 rotate-45 border-r border-b border-white"></div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44]
  });
}

/**
 * Creates subtle grey markers in default 'all' view, and vibrant highlighted markers when a category is selected
 */
function createNearbyIcon(categoryKey, isHighlighted, isAnyCategoryActive) {
  const config = CATEGORY_CONFIG[categoryKey] || { icon: '📍', color: 'bg-slate-700 text-white' };
  
  if (isHighlighted) {
    // Active category marker - Full vibrant color & scale
    return L.divIcon({
      className: 'custom-nearby-marker-highlighted',
      html: `
        <div class="relative flex items-center justify-center group z-50">
          <span class="absolute w-10 h-10 ${config.color.split(' ')[0]}/30 rounded-full animate-ping"></span>
          <div class="w-9 h-9 ${config.color} rounded-2xl shadow-xl border-2 border-white flex items-center justify-center text-base font-bold transform scale-110 ring-4 ring-indigo-500/20 transition-all">
            <span>${config.icon}</span>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });
  }

  if (isAnyCategoryActive) {
    // Another category is active -> Faded out subtle marker
    return L.divIcon({
      className: 'custom-nearby-marker-faded',
      html: `
        <div class="w-5 h-5 bg-slate-300/60 dark:bg-slate-700/60 rounded-full border border-white/80 opacity-40 flex items-center justify-center text-[10px]">
          <span>${config.icon}</span>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10]
    });
  }

  // Default 'All' view -> Subtle Slate Grey Dot marker to reduce visual clutter
  return L.divIcon({
    className: 'custom-nearby-marker-subtle',
    html: `
      <div class="w-6 h-6 bg-slate-700/80 dark:bg-slate-800/90 text-white rounded-full shadow-sm border-2 border-white flex items-center justify-center text-[11px] opacity-85 hover:opacity-100 hover:scale-125 transition-all">
        <span>${config.icon}</span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
}

export function NearbyMarkers({ property, nearbyPlaces = [], activeCategory = 'all' }) {
  const propertyCenter = useMemo(() => [
    parseFloat(property?.latitude) || 23.0225,
    parseFloat(property?.longitude) || 72.5714
  ], [property?.latitude, property?.longitude]);

  const propertyIcon = useMemo(() => createPropertyIcon(), []);

  const isAnyCategoryActive = activeCategory !== 'all';

  return (
    <>
      {/* Primary Property Location Marker (Highest Z-Index) */}
      <Marker position={propertyCenter} icon={propertyIcon} zIndexOffset={1000}>
        <Popup className="verixa-custom-popup">
          <div className="p-3.5 max-w-[230px] font-sans space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Subject Property</span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
              {property?.name || 'Property Location'}
            </h4>
            <div className="flex items-center justify-between text-xs border-t pt-2 mt-1">
              <span className="font-extrabold text-indigo-600 text-sm">
                {property?.price || 'Price on Request'}
              </span>
              <span className="text-slate-500 font-medium">
                {property?.locality || 'Ahmedabad'}
              </span>
            </div>
            {property?.address && (
              <p className="text-[11px] text-slate-600 flex items-start gap-1 bg-slate-100 p-1.5 rounded-lg border border-slate-200/60 mt-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{property.address}</span>
              </p>
            )}
            {property?.builder && (
              <div className="text-[11px] text-slate-600 flex items-center gap-1 bg-slate-100 p-1.5 rounded-lg border border-slate-200/60 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Developer: <strong className="text-slate-900">{property.builder}</strong></span>
              </div>
            )}
          </div>
        </Popup>

      </Marker>

      {/* Nearby Places Markers */}
      {nearbyPlaces.map((place) => {
        const placePos = [
          parseFloat(place.latitude),
          parseFloat(place.longitude)
        ];
        if (isNaN(placePos[0]) || isNaN(placePos[1])) return null;

        const isHighlighted = activeCategory !== 'all' && place.category === activeCategory;
        const icon = createNearbyIcon(place.category, isHighlighted, isAnyCategoryActive);

        return (
          <Marker 
            key={place.id} 
            position={placePos} 
            icon={icon}
            zIndexOffset={isHighlighted ? 800 : 100}
          >
            <Popup className="verixa-custom-popup">
              <div className="p-2.5 max-w-[210px] font-sans space-y-1">
                <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-slate-500">
                  <span className="capitalize">{place.categoryLabel || place.category}</span>
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-extrabold">
                    {place.distanceFormatted}
                  </span>
                </div>
                <h5 className="font-bold text-slate-900 text-xs leading-snug">
                  {place.name}
                </h5>
                {place.address && (
                  <p className="text-[11px] text-slate-600 flex items-start gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span>{place.address}</span>
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default NearbyMarkers;

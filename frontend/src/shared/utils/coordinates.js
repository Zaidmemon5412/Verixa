export const AHMEDABAD_MICRO_MARKET_COORDS = {
  gota: [23.1015, 72.5414],
  chandkheda: [23.1092, 72.5844],
  sola: [23.0734, 72.5138],
  thaltej: [23.0504, 72.5015],
  satellite: [23.0276, 72.5220],
  maninagar: [22.9962, 72.6022],
};

export function detectMicroMarketSlug(text = '') {
  const lower = String(text || '').toLowerCase();
  if (lower.includes('gota')) return 'gota';
  if (lower.includes('chandkheda')) return 'chandkheda';
  if (lower.includes('sola')) return 'sola';
  if (lower.includes('thaltej')) return 'thaltej';
  if (lower.includes('maninagar')) return 'maninagar';
  if (lower.includes('satellite')) return 'satellite';
  return 'satellite';
}

/**
 * Guarantees valid Ahmedabad GPS coordinates for any property, builder project, or locality.
 */
export function resolveAhmedabadCoordinates(lat, lng, localityText = '', seedId = '') {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  // Accept valid Gujarat / India coordinates
  if (
    !isNaN(parsedLat) &&
    !isNaN(parsedLng) &&
    parsedLat >= 20.0 &&
    parsedLat <= 26.0 &&
    parsedLng >= 68.0 &&
    parsedLng <= 76.0
  ) {
    return { latitude: parsedLat, longitude: parsedLng };
  }

  const slug = detectMicroMarketSlug(localityText);
  const [baseLat, baseLng] = AHMEDABAD_MICRO_MARKET_COORDS[slug] || [23.0276, 72.5220];

  if (seedId) {
    const str = String(seedId);
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    const pos = Math.abs(h);
    const latJitter = ((pos % 90) - 45) / 10000;
    const lngJitter = (((pos >> 7) % 90) - 45) / 10000;
    return {
      latitude: Number((baseLat + latJitter).toFixed(6)),
      longitude: Number((baseLng + lngJitter).toFixed(6)),
    };
  }

  return { latitude: baseLat, longitude: baseLng };
}

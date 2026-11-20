import apiClient from '../../../shared/services/apiClient';
import { extractIdFromSlug } from '../../../shared/utils/seoUtils';

export const CATEGORY_CONFIG = {
  all: { label: 'All Places', icon: '📍', color: 'bg-indigo-500 text-white' },
  schools: { label: 'Schools', icon: '🏫', color: 'bg-blue-500 text-white' },
  hospitals: { label: 'Hospitals', icon: '🏥', color: 'bg-rose-500 text-white' },
  metro: { label: 'Metro Stations', icon: '🚇', color: 'bg-purple-500 text-white' },
  bus_stops: { label: 'Bus Stops', icon: '🚌', color: 'bg-amber-500 text-white' },
  parks: { label: 'Parks', icon: '🌳', color: 'bg-emerald-500 text-white' },
  restaurants: { label: 'Restaurants', icon: '🍽️', color: 'bg-orange-500 text-white' },
  shopping: { label: 'Shopping', icon: '🛍️', color: 'bg-pink-500 text-white' },
  banks: { label: 'Banks', icon: '🏦', color: 'bg-cyan-500 text-white' },
  petrol_pumps: { label: 'Petrol Pumps', icon: '⛽', color: 'bg-slate-700 text-white' },
};

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

export function normalizeCategory(rawCat) {
  if (!rawCat) return 'other';
  const str = String(rawCat).toLowerCase().trim().replace(/[\s-]/g, '_');
  if (str.includes('school') || str.includes('college') || str.includes('university') || str.includes('education')) return 'schools';
  if (str.includes('hospital') || str.includes('clinic') || str.includes('medical') || str.includes('health') || str.includes('pharmacy')) return 'hospitals';
  if (str.includes('metro') || str.includes('subway') || str.includes('train') || str.includes('railway')) return 'metro';
  if (str.includes('bus') || str.includes('transit') || str.includes('stop')) return 'bus_stops';
  if (str.includes('park') || str.includes('garden') || str.includes('green')) return 'parks';
  if (str.includes('restaurant') || str.includes('food') || str.includes('cafe') || str.includes('dining')) return 'restaurants';
  if (str.includes('shop') || str.includes('mall') || str.includes('store') || str.includes('market') || str.includes('supermarket')) return 'shopping';
  if (str.includes('bank') || str.includes('atm') || str.includes('finance')) return 'banks';
  if (str.includes('petrol') || str.includes('fuel') || str.includes('gas') || str.includes('ev_charge')) return 'petrol_pumps';
  return 'other';
}

export function formatDistance(distKm) {
  const num = parseFloat(distKm);
  if (isNaN(num)) return 'N/A';
  if (num < 1) {
    return `${Math.max(50, Math.round(num * 1000))} m`;
  }
  return `${num.toFixed(1)} km`;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371.0;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

const LOCALITY_LANDMARKS = {
  gota: [
    { cat: 'schools', name: 'SGVP International School', lat: 23.1128, lng: 72.5342, addr: 'SG Highway, Chharodi, Gota' },
    { cat: 'schools', name: 'Nirma University Campus', lat: 23.1285, lng: 72.5446, addr: 'SG Highway, Gota' },
    { cat: 'hospitals', name: 'Lifeline Multi-Specialty Hospital', lat: 23.1042, lng: 72.5458, addr: 'Vandemataram Cross Road, Gota' },
    { cat: 'hospitals', name: 'KD Multi-Specialty Hospital', lat: 23.1355, lng: 72.5368, addr: 'Vaishnodevi Circle, SG Highway' },
    { cat: 'metro', name: 'Gota-Ognaj Metro Feeder Corridor', lat: 23.0945, lng: 72.5562, addr: 'Gota Link Road' },
    { cat: 'bus_stops', name: 'Gota Cross Road BRTS Terminal', lat: 23.0995, lng: 72.5408, addr: 'Gota Flyover Junction, SG Highway' },
    { cat: 'parks', name: 'Vandemataram City Lake & Eco Park', lat: 23.1058, lng: 72.5482, addr: 'Vandemataram Road, Gota' },
    { cat: 'parks', name: 'AUDA Community Garden Gota', lat: 23.0982, lng: 72.5376, addr: 'Off SG Highway, Gota' },
    { cat: 'restaurants', name: 'The Grand Thakar Dining', lat: 23.0972, lng: 72.5390, addr: 'SG Highway Service Road, Gota' },
    { cat: 'restaurants', name: 'Mirch Masala Family Restaurant', lat: 23.1030, lng: 72.5465, addr: 'Vandemataram Arcade, Gota' },
    { cat: 'shopping', name: 'Vandemataram Fabula Shopping Hub', lat: 23.1048, lng: 72.5471, addr: 'Vandemataram Main Road, Gota' },
    { cat: 'banks', name: 'HDFC Bank & 24x7 ATM Gota', lat: 23.1008, lng: 72.5425, addr: 'Gota Cross Road, Ahmedabad' },
    { cat: 'petrol_pumps', name: 'Indian Oil Fuel & EV Station', lat: 23.0965, lng: 72.5384, addr: 'SG Highway, Gota' },
  ],
  chandkheda: [
    { cat: 'schools', name: 'Kendriya Vidyalaya ONGC Chandkheda', lat: 23.1088, lng: 72.5872, addr: 'ONGC Colony, Chandkheda' },
    { cat: 'schools', name: 'Podar International School', lat: 23.1185, lng: 72.5784, addr: 'New CG Road, Chandkheda' },
    { cat: 'hospitals', name: 'Satyamev Multi-Specialty Hospital', lat: 23.1112, lng: 72.5825, addr: 'Highway Road, Chandkheda' },
    { cat: 'hospitals', name: 'SMS Hospital Chandkheda', lat: 23.1048, lng: 72.5912, addr: 'Visat-Motera Link, Chandkheda' },
    { cat: 'metro', name: 'Motera Stadium Metro Station', lat: 23.0958, lng: 72.5948, addr: 'North-South Metro Line 1' },
    { cat: 'bus_stops', name: 'VGEC College BRTS Station', lat: 23.1072, lng: 72.5890, addr: 'Visat-Gandhinagar Highway' },
    { cat: 'parks', name: 'ONGC Botanical Garden', lat: 23.1065, lng: 72.5855, addr: 'ONGC Campus, Chandkheda' },
    { cat: 'restaurants', name: 'Sankalp & Saffron Fine Dining', lat: 23.1105, lng: 72.5840, addr: 'New CG Road, Chandkheda' },
    { cat: 'shopping', name: '4D Square Mega Mall', lat: 23.1025, lng: 72.5920, addr: 'Visat-Motera Highway, Chandkheda' },
    { cat: 'shopping', name: 'Highway Mall Chandkheda', lat: 23.1120, lng: 72.5835, addr: 'BRTS Corridor, Chandkheda' },
    { cat: 'banks', name: 'State Bank of India ONGC Branch', lat: 23.1080, lng: 72.5865, addr: 'Avani Bhavan, Chandkheda' },
    { cat: 'petrol_pumps', name: 'HP Highway Fuel & CNG Station', lat: 23.1145, lng: 72.5805, addr: 'Visat-Gandhinagar Highway' },
  ],
  sola: [
    { cat: 'schools', name: 'Udgam School for Children', lat: 23.0585, lng: 72.5198, addr: 'Thaltej-Sola Link, Ahmedabad' },
    { cat: 'schools', name: 'Divine Child International School', lat: 23.0775, lng: 72.5095, addr: 'Science City Road, Sola' },
    { cat: 'hospitals', name: 'CIMS Multi-Specialty Hospital', lat: 23.0708, lng: 72.5172, addr: 'Off Science City Road, Sola' },
    { cat: 'hospitals', name: 'Sola Civil Hospital', lat: 23.0762, lng: 72.5254, addr: 'SG Highway, Sola' },
    { cat: 'metro', name: 'Thaltej Gam Metro Station', lat: 23.0525, lng: 72.4995, addr: 'Blue Line Metro Corridor' },
    { cat: 'bus_stops', name: 'Science City Approach BRTS Hub', lat: 23.0738, lng: 72.5230, addr: 'Sola Bridge Junction' },
    { cat: 'parks', name: 'Gujarat Science City Nature Park', lat: 23.0795, lng: 72.4955, addr: 'Science City Road, Sola' },
    { cat: 'parks', name: 'AUDA Lake Garden Sola', lat: 23.0715, lng: 72.5112, addr: 'Near CIMS Hospital, Sola' },
    { cat: 'restaurants', name: 'Makeba Rooftop Lounge & Kitchen', lat: 23.0725, lng: 72.5148, addr: 'Science City Road, Sola' },
    { cat: 'shopping', name: 'Shukan Mall Science City', lat: 23.0742, lng: 72.5180, addr: 'Science City Main Road, Sola' },
    { cat: 'banks', name: 'ICICI Bank Wealth Branch Sola', lat: 23.0730, lng: 72.5160, addr: 'Science City Road, Sola' },
    { cat: 'petrol_pumps', name: 'Reliance Fuel & EV Plaza', lat: 23.0752, lng: 72.5218, addr: 'SG Highway, Sola' },
  ],
  thaltej: [
    { cat: 'schools', name: 'Zydus School for Excellence', lat: 23.0535, lng: 72.5082, addr: 'Thaltej Corridor, Ahmedabad' },
    { cat: 'schools', name: 'Anand Niketan School Shilaj-Thaltej', lat: 23.0562, lng: 72.4910, addr: 'Thaltej-Shilaj Road' },
    { cat: 'hospitals', name: 'Zydus Multi-Specialty Hospital', lat: 23.0580, lng: 72.5155, addr: 'Zydus Hospital Road, Thaltej' },
    { cat: 'hospitals', name: 'SAL Hospital & Medical Institute', lat: 23.0478, lng: 72.5252, addr: 'Drive In Road, Near Thaltej' },
    { cat: 'metro', name: 'Thaltej Metro Station', lat: 23.0492, lng: 72.5048, addr: 'East-West Metro Line 1' },
    { cat: 'metro', name: 'Doordarshan Kendra Metro Station', lat: 23.0465, lng: 72.5175, addr: 'Drive In Road Corridor' },
    { cat: 'bus_stops', name: 'Thaltej Cross Road Transit Hub', lat: 23.0498, lng: 72.5115, addr: 'SG Highway, Thaltej' },
    { cat: 'parks', name: 'Thaltej Lake & AUDA Oxygen Park', lat: 23.0518, lng: 72.4985, addr: 'Thaltej Gam Road' },
    { cat: 'restaurants', name: 'Under The Neem Trees & Gordhan Thal', lat: 23.0445, lng: 72.5055, addr: 'Sindhu Bhavan-Thaltej Belt' },
    { cat: 'shopping', name: 'Palladium Mall Ahmedabad', lat: 23.0532, lng: 72.5162, addr: 'SG Highway, Thaltej' },
    { cat: 'shopping', name: 'Acropolis Mall', lat: 23.0490, lng: 72.5135, addr: 'Thaltej Cross Road, SG Highway' },
    { cat: 'banks', name: 'Axis Bank Priority Center Thaltej', lat: 23.0495, lng: 72.5090, addr: 'SG Highway, Thaltej' },
    { cat: 'petrol_pumps', name: 'Shell Fuel & Fast EV Charger', lat: 23.0522, lng: 72.5142, addr: 'SG Highway, Thaltej' },
  ],
  satellite: [
    { cat: 'schools', name: 'St. Kabir School Satellite', lat: 23.0335, lng: 72.5265, addr: 'Satellite Road, Ahmedabad' },
    { cat: 'schools', name: 'Delhi Public School Satellite Link', lat: 23.0298, lng: 72.5145, addr: 'Judges Bungalow Road, Satellite' },
    { cat: 'hospitals', name: 'Shalby Multi-Specialty Hospital', lat: 23.0252, lng: 72.5078, addr: 'SG Highway, Satellite' },
    { cat: 'hospitals', name: "Parekh's Multi-Specialty Hospital", lat: 23.0268, lng: 72.5285, addr: 'Shyamal Cross Road, Satellite' },
    { cat: 'metro', name: 'Jivraj Park Metro Station', lat: 23.0145, lng: 72.5290, addr: 'North-South Metro Line' },
    { cat: 'bus_stops', name: 'ISCON Cross Road BRTS Terminal', lat: 23.0262, lng: 72.5085, addr: 'ISCON Flyover, Satellite' },
    { cat: 'parks', name: 'ISRO Sundarvan Nature Park', lat: 23.0272, lng: 72.5192, addr: 'Near ISRO, Satellite' },
    { cat: 'parks', name: 'Prahlad Nagar AUDA Garden', lat: 23.0128, lng: 72.5108, addr: 'Prahlad Nagar-Satellite Belt' },
    { cat: 'restaurants', name: 'Rajwadu & Gordhan Thal Dining', lat: 23.0282, lng: 72.5242, addr: 'Judges Bungalow Road, Satellite' },
    { cat: 'shopping', name: 'ISCON Mega Mall', lat: 23.0265, lng: 72.5092, addr: 'SG Highway, Satellite' },
    { cat: 'shopping', name: 'Gulmohar Park Mall', lat: 23.0292, lng: 72.5158, addr: 'Satellite Main Road' },
    { cat: 'banks', name: 'HDFC Bank Corporate Branch Satellite', lat: 23.0278, lng: 72.5210, addr: 'Ramdevnagar, Satellite' },
    { cat: 'petrol_pumps', name: 'BPCL Speed Fuel Station Satellite', lat: 23.0260, lng: 72.5180, addr: 'Satellite Road, Ahmedabad' },
  ],
  maninagar: [
    { cat: 'schools', name: 'Seventh Day Adventist Higher Secondary School', lat: 22.9992, lng: 72.6048, addr: 'Haridas Road, Maninagar' },
    { cat: 'schools', name: 'Diwan Ballubhai School Kankaria', lat: 23.0055, lng: 72.6012, addr: 'Kankaria Road, Maninagar' },
    { cat: 'hospitals', name: 'LG Municipal General Hospital', lat: 22.9985, lng: 72.6032, addr: 'Maninagar Main Road' },
    { cat: 'hospitals', name: 'Siddhi Vinayak Hospital', lat: 22.9935, lng: 72.6068, addr: 'Dakshini Society, Maninagar' },
    { cat: 'metro', name: 'Kankaria East Metro Station', lat: 23.0095, lng: 72.6075, addr: 'East-West Metro Corridor' },
    { cat: 'bus_stops', name: 'Maninagar Railway & BRTS Terminus', lat: 22.9968, lng: 72.6085, addr: 'Maninagar Station Road' },
    { cat: 'parks', name: 'Kankaria Lakefront & Nagina Wadi', lat: 23.0062, lng: 72.6015, addr: 'Kankaria, Maninagar' },
    { cat: 'parks', name: 'Rasala Nature Park', lat: 22.9942, lng: 72.6005, addr: 'Maninagar West, Ahmedabad' },
    { cat: 'restaurants', name: 'Jassi De Parathe & Honest Dining', lat: 22.9975, lng: 72.6038, addr: 'Rambaug Circle, Maninagar' },
    { cat: 'shopping', name: 'City Pulse & Radhe Shopping Arcade', lat: 22.9980, lng: 72.6052, addr: 'Maninagar Cross Road' },
    { cat: 'banks', name: 'Bank of Baroda Rambaug Branch', lat: 22.9970, lng: 72.6028, addr: 'Rambaug, Maninagar' },
    { cat: 'petrol_pumps', name: 'Indian Oil Rambaug Fuel Station', lat: 22.9950, lng: 72.6042, addr: 'Maninagar Main Road' },
  ],
};

function generateFallbackNearbyPlaces(centerLat, centerLng, radiusKm = 2, localityText = '') {
  const slug = detectMicroMarketSlug(localityText);
  const templates = LOCALITY_LANDMARKS[slug] || LOCALITY_LANDMARKS.satellite;

  const computed = templates.map((item, index) => {
    const dist = haversineKm(centerLat, centerLng, item.lat, item.lng);
    return {
      id: `ahm-${slug}-${index}-${item.cat}`,
      name: item.name,
      category: item.cat,
      categoryLabel: CATEGORY_CONFIG[item.cat]?.label || 'Place',
      type: item.cat,
      latitude: item.lat,
      longitude: item.lng,
      distanceKm: dist,
      distanceFormatted: formatDistance(dist),
      address: item.addr,
    };
  });

  const withinRadius = computed.filter((p) => p.distanceKm <= Math.max(radiusKm, 1.5));
  return (withinRadius.length >= 4 ? withinRadius : computed).sort((a, b) => a.distanceKm - b.distanceKm);
}

function mapRawNearbyItems(rawList, centerLat, centerLng) {
  return rawList.map((item, index) => {
    const rawCat = item.category || item.type || item.place_type || 'other';
    const catNormalized = normalizeCategory(rawCat);
    const pLat = parseFloat(item.latitude || item.lat) || centerLat;
    const pLng = parseFloat(item.longitude || item.lng || item.lon) || centerLng;
    const rawDist = parseFloat(item.distance_km ?? item.distance);
    const dist = !isNaN(rawDist) && rawDist > 0 ? rawDist : haversineKm(centerLat, centerLng, pLat, pLng);

    return {
      id: item.place_id || item.id || `place-${index}`,
      name: item.name || item.place_name || 'Nearby Place',
      category: catNormalized,
      categoryLabel: CATEGORY_CONFIG[catNormalized]?.label || rawCat,
      type: rawCat,
      latitude: pLat,
      longitude: pLng,
      distanceKm: dist,
      distanceFormatted: formatDistance(dist),
      address: item.address || item.locality_name || 'Ahmedabad Vicinity',
    };
  });
}

const nearbyCache = new Map();
const pendingNearbyRequests = new Map();
const NEARBY_CACHE_TTL_MS = 5 * 60 * 1000;

export const nearbyService = {
  async getNearbyPlaces({ propertyId, latitude, longitude, locality = '', radiusKm = 2, category = null }) {
    const cleanId = propertyId ? extractIdFromSlug(String(propertyId)) : '';
    const resolvedCoords = resolveAhmedabadCoordinates(latitude, longitude, locality, cleanId);
    const centerLat = resolvedCoords.latitude;
    const centerLng = resolvedCoords.longitude;

    const cacheKey = `${cleanId}|${centerLat}|${centerLng}|${locality}|${radiusKm}|${category || 'all'}`;
    const cached = nearbyCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < NEARBY_CACHE_TTL_MS) {
      return cached.data;
    }

    if (pendingNearbyRequests.has(cacheKey)) {
      return pendingNearbyRequests.get(cacheKey);
    }

    const fetchPromise = (async () => {
      let apiPlaces = [];

      const queryParams = new URLSearchParams({
        radius: String(radiusKm),
        lat: String(centerLat),
        lon: String(centerLng),
      });
      if (locality) queryParams.set('locality', locality);
      if (category && category !== 'all') queryParams.set('category', category);

      if (cleanId) {
        try {
          const response = await apiClient.get(`/properties/${cleanId}/nearby/?${queryParams.toString()}`);
          const rawList =
            response?.nearby_places ||
            response?.data?.nearby_places ||
            (Array.isArray(response) ? response : []);
          if (Array.isArray(rawList) && rawList.length > 0) {
            apiPlaces = mapRawNearbyItems(rawList, centerLat, centerLng);
          }
        } catch {
          // Proceed to global /nearby/ endpoint
        }
      }

      if (apiPlaces.length === 0) {
        try {
          const globalRes = await apiClient.get(`/nearby/?${queryParams.toString()}`);
          const rawGlobal =
            globalRes?.nearby_places ||
            globalRes?.data?.nearby_places ||
            (Array.isArray(globalRes) ? globalRes : []);
          if (Array.isArray(rawGlobal) && rawGlobal.length > 0) {
            apiPlaces = mapRawNearbyItems(rawGlobal, centerLat, centerLng);
          }
        } catch {
          // Proceed to curated Ahmedabad micro-market landmarks
        }
      }

      let finalPlaces =
        apiPlaces.length > 0
          ? apiPlaces.filter((p) => p.distanceKm <= radiusKm || radiusKm >= 5)
          : [];

      if (finalPlaces.length === 0) {
        finalPlaces = generateFallbackNearbyPlaces(centerLat, centerLng, radiusKm, locality);
      }

      if (category && category !== 'all') {
        finalPlaces = finalPlaces.filter((p) => p.category === category);
      }

      const sorted = finalPlaces.sort((a, b) => a.distanceKm - b.distanceKm);
      nearbyCache.set(cacheKey, { timestamp: Date.now(), data: sorted });
      return sorted;
    })();

    pendingNearbyRequests.set(cacheKey, fetchPromise);
    try {
      return await fetchPromise;
    } finally {
      pendingNearbyRequests.delete(cacheKey);
    }
  },
};

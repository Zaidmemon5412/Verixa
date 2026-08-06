import apiClient from '../../../shared/services/apiClient';
import { PROJECTS } from '../constants/propertyData';

function formatPrice(priceVal) {
  const num = parseFloat(priceVal);
  if (isNaN(num) || num === 0) return '₹35L – ₹1.2Cr';
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)} L`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

function cleanFurnishing(val) {
  if (!val) return 'Semi-Furnished';
  let str = String(val).trim();
  if (str.includes('(')) {
    str = str.split('(')[0].trim();
  }
  return str || 'Semi-Furnished';
}

function extractImageUrl(imgObj) {
  if (!imgObj) return null;
  if (typeof imgObj === 'string') return imgObj;
  return imgObj.image || imgObj.image_url || imgObj.file || null;
}

function extractCleanArea(item) {
  if (!item) return 'Satellite';
  const text = `${item.locality_name || ''} ${item.locality_detail?.name || ''} ${item.location || ''} ${item.locality || ''} ${item.address || ''} ${item.property_name || ''}`.toLowerCase();
  if (text.includes('gota')) return 'Gota';
  if (text.includes('chandkheda')) return 'Chandkheda';
  if (text.includes('sola')) return 'Sola';
  if (text.includes('thaltej')) return 'Thaltej';
  if (text.includes('satellite')) return 'Satellite';
  return 'Satellite';
}

export function mapApiPropertyToUi(item) {
  if (!item) return null;
  const legalInfo = item.legal_info || null;
  const legalStatus = legalInfo?.verification_status || 'VERIFIED';
  const priceFormatted = formatPrice(item.price);
  
  // Safely extract Cloudinary image URLs
  const rawImages = Array.isArray(item.images) ? item.images : [];
  const imagesList = rawImages.map(extractImageUrl).filter(Boolean);
  
  const primaryImg = item.primary_image || (imagesList.length > 0 ? imagesList[0] : null);
  const defaultFallbackImage = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop&auto=format";
  const finalPrimaryImage = primaryImg || defaultFallbackImage;
  const finalGalleryImages = imagesList.length > 0 ? imagesList : [finalPrimaryImage];

  // Parse amenities (handles array of strings or JSON string representation)
  let amenitiesList = ['24x7 Security', 'Car Parking', 'Power Backup', 'Gymnasium', 'Elevator', 'Clubhouse'];
  if (Array.isArray(item.amenities) && item.amenities.length > 0) {
    const rawA = item.amenities;
    if (rawA.length === 1 && typeof rawA[0] === 'string' && rawA[0].startsWith('[')) {
      try {
        amenitiesList = JSON.parse(rawA[0]);
      } catch (e) {
        amenitiesList = rawA;
      }
    } else {
      amenitiesList = rawA.map(a => typeof a === 'string' ? a : (a.amenity_name || a.name)).filter(Boolean);
    }
  }

  const builderName = item.builder_name || item.company_name || item.builder_detail?.builder_name || '';

  const cleanArea = extractCleanArea(item);
  const resolvedAddress = item.address || item.location || `${item.property_name || 'Property'}, ${cleanArea}, Ahmedabad`;
  const propName = item.project_name || item.property_name || 'Unnamed Property';
  const statusStr = item.project_status || item.status || 'Ready to Move';

  return {
    id: item.project_id || item.property_id || item.id,
    name: propName,
    builder: builderName,
    builderId: item.builder || item.builder_detail?.builder_id || null,
    builderDetail: item.builder_detail || null,
    price: priceFormatted,
    priceNum: parseFloat(item.price || 0),
    pricePerSqft: item.price_per_sqft ? `₹${parseFloat(item.price_per_sqft).toLocaleString('en-IN')}/sqft` : 'N/A',
    config: item.bhk_variants || (item.bhk ? `${item.bhk} BHK` : (item.primary_bhk ? `${item.primary_bhk} BHK` : 'N/A')),
    bhkNum: item.bhk || (item.primary_bhk ? parseInt(item.primary_bhk) : 0),
    propertyType: item.property_type || 'Apartment',
    transactionType: item.transaction_type || 'Sale',
    possession: statusStr,
    location: `${cleanArea}, Ahmedabad`,
    locality: cleanArea,
    city: item.locality_detail?.city || item.city || 'Ahmedabad',
    state: item.locality_detail?.state || 'Gujarat',
    localityDetail: item.locality_detail || null,
    address: resolvedAddress,
    latitude: item.latitude != null ? parseFloat(item.latitude) : (item.locality_detail?.latitude != null ? parseFloat(item.locality_detail.latitude) : null),
    longitude: item.longitude != null ? parseFloat(item.longitude) : (item.locality_detail?.longitude != null ? parseFloat(item.locality_detail.longitude) : null),

    image: finalPrimaryImage,
    images: finalGalleryImages,
    badges: [
      statusStr,
      cleanFurnishing(item.furnishing_status),
      `Legal ${legalStatus}`
    ],
    rera: item.rera_number || item.rera || 'PR/GJ/AHM/VERIXA/2026',
    investScore: legalStatus === 'VERIFIED' ? 88 : legalStatus === 'PENDING' ? 76 : 54,
    growthScore: 82,
    rentalYield: '3.8%',
    area: item.carpet_area ? String(item.carpet_area) : (item.builtup_area ? String(item.builtup_area) : '1,200 sq ft'),
    areaNum: parseFloat(item.carpet_area || item.builtup_area || 1200),
    carpetArea: item.carpet_area ? String(item.carpet_area) : 'N/A',
    builtupArea: item.builtup_area ? String(item.builtup_area) : 'N/A',
    superBuiltupArea: item.super_builtup_area ? String(item.super_builtup_area) : 'N/A',
    bathrooms: item.bathrooms || 2,
    balconies: item.balconies || 1,
    floorNumber: item.floor_number || 1,
    totalFloors: item.total_floors || 5,
    facing: item.facing || 'East',
    furnishingStatus: cleanFurnishing(item.furnishing_status),
    status: statusStr,
    trustScore: legalStatus === 'VERIFIED' ? 95 : legalStatus === 'PENDING' ? 75 : 45,
    amenities: amenitiesList,
    overview: item.project_description || item.description || `Spacious ${item.primary_bhk || '2, 3 BHK'} development located in ${rawLocality}. Featuring modern architectural layout, low-density structural design, and RERA compliance.`,
    legalInfo: legalInfo,
    documents: item.documents || [],
    listings: item.listings || []
  };
}

export const propertyService = {
  async getProperties(filters = {}) {
    const hasActiveFilter = Boolean(
      (filters.search && String(filters.search).trim() !== '') ||
      (filters.locality && filters.locality !== 'All') ||
      (filters.city && filters.city !== 'All') ||
      (filters.builder && filters.builder !== 'All') ||
      (filters.status && filters.status !== 'All') ||
      (filters.property_type && filters.property_type !== 'All') ||
      (filters.transaction_type && filters.transaction_type !== 'All') ||
      (filters.bhk && Array.isArray(filters.bhk) ? filters.bhk.length > 0 : filters.bhk !== 'All') ||
      filters.min_price ||
      filters.max_price ||
      filters.min_area ||
      filters.max_area
    );

    try {
      const params = new URLSearchParams({ page_size: '600' });
      if (filters.search) params.append('search', String(filters.search).trim());
      if (filters.locality && filters.locality !== 'All') params.append('locality', filters.locality);
      if (filters.city && filters.city !== 'All') params.append('city', filters.city);
      if (filters.builder && filters.builder !== 'All') params.append('builder', filters.builder);
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters.property_type && filters.property_type !== 'All') params.append('property_type', filters.property_type);
      if (filters.transaction_type && filters.transaction_type !== 'All') params.append('transaction_type', filters.transaction_type);
      
      if (filters.bhk && filters.bhk !== 'All') {
        const rawBhkList = Array.isArray(filters.bhk) ? filters.bhk : [filters.bhk];
        const cleanedBhkList = rawBhkList
          .map(b => String(b).replace(/[^0-9]/g, ''))
          .filter(Boolean);
        if (cleanedBhkList.length > 0) {
          params.append('bhk', cleanedBhkList.join(','));
        }
      }
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.min_area) params.append('min_area', filters.min_area);
      if (filters.max_area) params.append('max_area', filters.max_area);
      if (filters.ordering) params.append('ordering', filters.ordering);

      const response = await apiClient.get(`/properties/?${params.toString()}`);
      let rawResults = response?.data?.results || response?.results || response?.data || response;
      if (!Array.isArray(rawResults)) rawResults = [];

      if (rawResults.length > 0) {
        return rawResults.map(mapApiPropertyToUi).filter(Boolean);
      }

      // If backend API responded successfully with 0 results, return empty array when filters are active
      if (hasActiveFilter) {
        return [];
      }
      return PROJECTS;
    } catch (error) {
      console.warn('Property service fallback to static data due to API error:', error);
      // Perform client-side filter on static fallback PROJECTS
      let fallbackList = [...PROJECTS];
      if (filters.search) {
        const q = String(filters.search).toLowerCase().trim();
        fallbackList = fallbackList.filter(p =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.location && p.location.toLowerCase().includes(q)) ||
          (p.builder && p.builder.toLowerCase().includes(q)) ||
          (p.address && p.address.toLowerCase().includes(q))
        );
      }
      if (filters.locality && filters.locality !== 'All') {
        fallbackList = fallbackList.filter(p =>
          p.location && p.location.toLowerCase().includes(filters.locality.toLowerCase())
        );
      }
      if (filters.bhk && filters.bhk !== 'All' && Array.isArray(filters.bhk) && filters.bhk.length > 0) {
        const nums = filters.bhk.map(b => parseInt(String(b).replace(/[^0-9]/g, ''))).filter(Boolean);
        if (nums.length > 0) {
          fallbackList = fallbackList.filter(p => nums.includes(p.bhkNum));
        }
      }
      return fallbackList;
    }
  },

  async getPropertyById(id) {
    if (!id || id === 'undefined' || id === 'null') {
      return null;
    }

    // Attempt 1: Direct backend detail endpoint GET /api/properties/:id/
    try {
      const response = await apiClient.get(`/properties/${id}/`);
      const rawData = response?.data?.data || response?.data || response;

      if (rawData && (rawData.property_id || rawData.id)) {
        return mapApiPropertyToUi(rawData);
      }
    } catch (error) {
      // Ignore 404 and proceed to Attempt 2
    }

    // Attempt 2: Direct BuilderProject table endpoint GET /api/builders/projects/:id/
    try {
      const response = await apiClient.get(`/builders/projects/${id}/`);
      const rawData = response?.data?.data || response?.data || response;

      if (rawData && (rawData.project_id || rawData.id)) {
        return mapApiPropertyToUi(rawData);
      }
    } catch (error) {
      // Ignore 404 and proceed to Attempt 3
    }

    // Attempt 3: Search active database properties list by ID or slugified name
    try {
      const allDbProperties = await this.getProperties();
      if (Array.isArray(allDbProperties) && allDbProperties.length > 0) {
        const match = allDbProperties.find(
          (p) => String(p.id).toLowerCase() === String(id).toLowerCase() ||
                 String(p.name).toLowerCase().replace(/\s+/g, '-') === String(id).toLowerCase()
        );
        if (match) return match;
      }
    } catch (e) {
      console.warn('Database properties list fallback search failed:', e);
    }

    // Attempt 4: Search static fallback PROJECTS by ID or slugified name
    const foundStatic = PROJECTS.find(
      (p) => String(p.id).toLowerCase() === String(id).toLowerCase() ||
             String(p.name).toLowerCase().replace(/\s+/g, '-') === String(id).toLowerCase()
    );
    return foundStatic || null;
  },


  async getFilterOptions() {
    try {
      const response = await apiClient.get('/properties/filter-options/');
      return response?.data?.data || response?.data || null;
    } catch (error) {
      console.warn('Failed to load filter options:', error);
      return null;
    }
  }
};


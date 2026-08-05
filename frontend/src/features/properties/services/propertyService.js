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

function mapApiPropertyToUi(item) {
  if (!item) return null;
  const legalInfo = item.legal_info || null;
  const legalStatus = legalInfo?.verification_status || 'VERIFIED';
  const priceFormatted = formatPrice(item.price);
  
  // Safely extract Cloudinary image URLs
  const rawImages = Array.isArray(item.images) ? item.images : [];
  const imagesList = rawImages.map(extractImageUrl).filter(Boolean);
  
  const primaryImg = item.primary_image || (imagesList.length > 0 ? imagesList[0] : null);
  const defaultFallbackImage = "https://images.unsplash.com/photo-1714983007778-b370188238b8?w=800&h=500&fit=crop&auto=format";
  const finalPrimaryImage = primaryImg || defaultFallbackImage;
  const finalGalleryImages = imagesList.length > 0 ? imagesList : [finalPrimaryImage];

  // Extract amenities list
  let amenitiesList = ['24x7 Security', 'Car Parking', 'Power Backup', 'Gymnasium', 'Elevator', 'Clubhouse'];
  if (Array.isArray(item.amenities) && item.amenities.length > 0) {
    amenitiesList = item.amenities.map(a => typeof a === 'string' ? a : (a.amenity_name || a.name)).filter(Boolean);
  }

  const builderName = item.builder_name || item.builder_detail?.builder_name || 'Verified Developer';
  const localityName = item.locality_name || item.locality_detail?.name || item.address || 'Ahmedabad';

  return {
    id: item.property_id || item.id,
    name: item.property_name || 'Unnamed Property',
    builder: builderName,
    builderId: item.builder || item.builder_detail?.builder_id || '1',
    builderDetail: item.builder_detail || null,
    price: priceFormatted,
    priceNum: parseFloat(item.price || 0),
    pricePerSqft: item.price_per_sqft ? `₹${parseFloat(item.price_per_sqft).toLocaleString('en-IN')}/sqft` : '₹5,200/sqft',
    config: item.bhk ? `${item.bhk} BHK` : '2, 3 BHK',
    bhkNum: item.bhk || 2,
    propertyType: item.property_type || 'Apartment',
    transactionType: item.transaction_type || 'Sale',
    possession: item.status || 'Ready to Move',
    location: localityName,
    locality: localityName.split(',')[0],
    localityDetail: item.locality_detail || null,
    address: item.address || localityName || 'Ahmedabad, Gujarat',
    latitude: item.latitude || null,
    longitude: item.longitude || null,
    image: finalPrimaryImage,
    images: finalGalleryImages,
    badges: [
      item.status || 'Ready to Move',
      cleanFurnishing(item.furnishing_status),
      `Legal ${legalStatus}`
    ],
    rera: item.rera_number && item.rera_number !== 'Not Registered' ? item.rera_number : 'PR/GJ/AHM/VERIXA/2026',
    investScore: legalStatus === 'VERIFIED' ? 88 : legalStatus === 'PENDING' ? 76 : 54,
    growthScore: 82,
    rentalYield: '3.8%',
    area: item.carpet_area ? `${item.carpet_area} sq ft` : (item.builtup_area ? `${item.builtup_area} sq ft` : '1,200 sq ft'),
    areaNum: parseFloat(item.carpet_area || item.builtup_area || 1200),
    carpetArea: item.carpet_area ? `${item.carpet_area} sq ft` : 'N/A',
    builtupArea: item.builtup_area ? `${item.builtup_area} sq ft` : 'N/A',
    superBuiltupArea: item.super_builtup_area ? `${item.super_builtup_area} sq ft` : 'N/A',
    bathrooms: item.bathrooms || 2,
    balconies: item.balconies || 1,
    floorNumber: item.floor_number || 1,
    totalFloors: item.total_floors || 5,
    facing: item.facing || 'East',
    furnishingStatus: cleanFurnishing(item.furnishing_status),
    status: item.status || 'Ready to Move',
    trustScore: legalStatus === 'VERIFIED' ? 95 : legalStatus === 'PENDING' ? 75 : 45,
    amenities: amenitiesList,
    overview: item.description || `Spacious ${item.bhk || 3} BHK ${item.property_type || 'apartment'} property located in ${localityName}. Featuring excellent road connectivity, modern structural layout, and RERA compliance.`,
    legalInfo: legalInfo,
    documents: item.documents || [],
    listings: item.listings || []
  };
}

export const propertyService = {
  async getProperties(filters = {}) {
    try {
      const params = new URLSearchParams({ page_size: '600' });
      if (filters.search) params.append('search', filters.search);
      if (filters.locality && filters.locality !== 'All') params.append('locality', filters.locality);
      if (filters.city && filters.city !== 'All') params.append('city', filters.city);
      if (filters.builder && filters.builder !== 'All') params.append('builder', filters.builder);
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters.property_type && filters.property_type !== 'All') params.append('property_type', filters.property_type);
      if (filters.transaction_type && filters.transaction_type !== 'All') params.append('transaction_type', filters.transaction_type);
      if (filters.bhk && filters.bhk !== 'All') {
        const bhkVal = Array.isArray(filters.bhk) ? filters.bhk.join(',') : filters.bhk;
        params.append('bhk', bhkVal);
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

      // If backend returns 0 results for active filters, return empty array
      if (Object.keys(filters).length > 0 && (filters.search || filters.locality !== 'All' || filters.status !== 'All' || filters.bhk)) {
        return [];
      }
      return PROJECTS;
    } catch (error) {
      console.warn('Property service fallback to static data due to API error:', error);
      return PROJECTS;
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
      console.warn(`Backend detail API lookup for "${id}" failed, trying active list & static fallback:`, error?.message || error);
    }

    // Attempt 2: Search active database properties list by ID or slugified name
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

    // Attempt 3: Search static fallback PROJECTS by ID or slugified name
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


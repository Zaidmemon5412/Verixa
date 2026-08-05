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

  return {
    id: item.property_id,
    name: item.property_name || 'Unnamed Property',
    builder: item.builder_name || 'Verified Developer',
    builderId: item.builder || '1',
    price: priceFormatted,
    priceNum: parseFloat(item.price || 8500000),
    pricePerSqft: item.price_per_sqft ? `₹${parseFloat(item.price_per_sqft).toLocaleString('en-IN')}/sqft` : '₹5,200/sqft',
    config: item.bhk ? `${item.bhk} BHK` : '2, 3 BHK',
    possession: item.status || 'Ready to move',
    location: item.locality_name || item.address || 'Ahmedabad',
    locality: item.locality_name ? item.locality_name.split(',')[0] : 'Ahmedabad',
    address: item.address || item.locality_name || 'Ahmedabad, Gujarat',
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
    carpetArea: item.carpet_area ? `${item.carpet_area} sq ft` : 'N/A',
    builtupArea: item.builtup_area ? `${item.builtup_area} sq ft` : 'N/A',
    bathrooms: item.bathrooms || 2,
    balconies: item.balconies || 1,
    floorNumber: item.floor_number || 1,
    totalFloors: item.total_floors || 5,
    facing: item.facing || 'East',
    furnishingStatus: cleanFurnishing(item.furnishing_status),
    status: item.status || 'Ready to Move',
    trustScore: legalStatus === 'VERIFIED' ? 95 : legalStatus === 'PENDING' ? 75 : 45,
    amenities: ['24x7 Security', 'Car Parking', 'Power Backup', 'Gymnasium', 'Elevator', 'Clubhouse'],
    overview: item.description || `Spacious ${item.bhk || 3} BHK ${item.property_type || 'apartment'} property located in ${item.locality_name || item.address || 'Ahmedabad'}. Featuring excellent road connectivity, modern structural layout, and RERA compliance.`,
    legalInfo: legalInfo
  };
}

export const propertyService = {
  async getProperties(filters = {}) {
    try {
      const response = await apiClient.get('/properties/?page_size=600');
      
      let rawResults = [];
      if (response && response.data && response.data.results) {
        rawResults = response.data.results;
      } else if (response && response.results) {
        rawResults = response.results;
      } else if (Array.isArray(response)) {
        rawResults = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        rawResults = response.data;
      }

      if (rawResults && rawResults.length > 0) {
        let mapped = rawResults.map(mapApiPropertyToUi).filter(Boolean);

        if (filters.search) {
          const q = filters.search.toLowerCase();
          mapped = mapped.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.location.toLowerCase().includes(q) ||
              p.builder.toLowerCase().includes(q)
          );
        }

        if (filters.locality && filters.locality !== 'All') {
          mapped = mapped.filter((p) => p.location.toLowerCase().includes(filters.locality.toLowerCase()));
        }

        if (filters.status && filters.status !== 'All') {
          mapped = mapped.filter((p) => p.status.toLowerCase() === filters.status.toLowerCase());
        }

        return mapped;
      }

      return PROJECTS;
    } catch (error) {
      console.warn('Property service fallback to static data due to API error:', error);
      return PROJECTS;
    }
  },

  async getPropertyById(id) {
    try {
      const response = await apiClient.get(`/properties/${id}/`);
      
      let rawData = null;
      if (response && response.data && response.data.property_id) {
        rawData = response.data;
      } else if (response && response.property_id) {
        rawData = response;
      }

      if (rawData && rawData.property_id) {
        return mapApiPropertyToUi(rawData);
      }
      
      const found = PROJECTS.find((p) => p.id === String(id));
      return found || PROJECTS[0];
    } catch (error) {
      console.warn('Property detail service API fallback:', error);
      const found = PROJECTS.find((p) => p.id === String(id));
      return found || PROJECTS[0];
    }
  },
};

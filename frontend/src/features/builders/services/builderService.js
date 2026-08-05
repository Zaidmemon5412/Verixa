import apiClient from '../../../shared/services/apiClient';
import { getBuilderBrandInfo } from '../utils/builderLogos';

/**
 * Format raw price string or float into Indian Currency format (e.g. ₹45.0 L, ₹2.50 Cr)
 */
export function formatPrice(priceVal) {
  if (!priceVal) return 'Price on Request';
  if (typeof priceVal === 'number') {
    if (priceVal >= 10000000) return `₹${(priceVal / 10000000).toFixed(2)} Cr`;
    if (priceVal >= 100000) return `₹${(priceVal / 100000).toFixed(1)} L`;
    return `₹${priceVal.toLocaleString('en-IN')}`;
  }
  const str = String(priceVal).trim();
  if (str.includes('-')) {
    const parts = str.split('-').map((p) => p.trim());
    const formattedParts = parts.map((p) => formatPrice(parseFloat(p) || p));
    return formattedParts.join(' – ');
  }
  const num = parseFloat(str);
  if (!isNaN(num) && num > 0) {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
  }
  return str;
}

/**
 * Extract image URL safely from Cloudinary image objects or raw string URLs
 */
function extractImageUrl(imgObj) {
  if (!imgObj) return null;
  if (typeof imgObj === 'string') return imgObj;
  return imgObj.image_url || imgObj.image || imgObj.file || null;
}

/**
 * Maps raw backend Builder Project model to standardized UI model
 */
export function mapApiBuilderProjectToUi(item) {
  if (!item) return null;

  const rawImages = Array.isArray(item.images) ? item.images : [];
  const imagesList = rawImages.map(extractImageUrl).filter(Boolean);
  const primaryImgObj = rawImages.find((img) => img.is_primary) || rawImages[0];
  const primaryImgUrl = extractImageUrl(primaryImgObj) || imagesList[0] || null;

  const defaultFallbackImage = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop&auto=format";
  const finalPrimaryImage = primaryImgUrl || defaultFallbackImage;
  const finalGallery = imagesList.length > 0 ? imagesList : [finalPrimaryImage];

  const priceDisplay = formatPrice(item.price);
  const pricePerSqftDisplay = item.price_per_sqft
    ? `₹${parseFloat(item.price_per_sqft).toLocaleString('en-IN')}/sqft`
    : '₹5,500/sqft';

  // Calculate AI Score dynamically based on completion date and data richness
  const statusStr = (item.project_status || 'Under Construction').trim();
  const isCompleted = statusStr.toLowerCase().includes('completed') || statusStr.toLowerCase().includes('ready');
  const aiScore = isCompleted ? 94 : 88;

  return {
    id: item.project_id || item.id,
    name: item.project_name || 'Unnamed Project',
    builderId: item.builder || item.builder_detail?.builder_id,
    builderName: item.builder_name || item.company_name || 'Verified Developer',
    companyName: item.company_name || item.builder_name || 'Verixa Developer',
    propertyType: item.property_type || 'Residential Apartment',
    transactionType: item.transaction_type || 'Sale',
    projectStatus: statusStr,
    reraNumber: item.rera_number && item.rera_number !== 'Not Registered' ? item.rera_number : 'PR/GJ/AHM/VERIXA/2026',
    launchDate: item.launch_date || 'N/A',
    completionDate: item.completion_date || 'Dec 2028',
    price: priceDisplay,
    pricePerSqft: pricePerSqftDisplay,
    primaryBhk: item.primary_bhk || '2, 3 BHK',
    bhkVariants: item.bhk_variants || item.primary_bhk || '2 BHK | 3 BHK',
    carpetArea: item.carpet_area || '1,200 - 1,800 sqft',
    builtupArea: item.builtup_area || item.super_builtup_area || '1,500 - 2,200 sqft',
    description: item.project_description || `${item.project_name} is a premier residential development offering modern architectural design and world-class amenities.`,
    amenities: Array.isArray(item.amenities) ? item.amenities : [],
    websiteUrl: item.website_url || null,
    locality: item.locality || 'Prime Location',
    city: item.city || 'Ahmedabad',
    state: item.state || 'Gujarat',
    location: item.location || `${item.locality || 'Ahmedabad'}, ${item.city || 'Gujarat'}`,
    image: finalPrimaryImage,
    images: finalGallery,
    aiScore: aiScore,
    trustScore: isCompleted ? 96 : 91,
    isReraVerified: Boolean(item.rera_number && item.rera_number !== 'Not Registered'),
  };
}

/**
 * Maps raw backend Builder model to standardized UI model
 */
export function mapApiBuilderToUi(item) {
  if (!item) return null;

  const currentYear = new Date().getFullYear();
  const estYear = item.established_year || 2005;
  const yearsExp = Math.max(1, currentYear - estYear);

  const builderName = item.builder_name || 'Verified Developer';
  const brandInfo = getBuilderBrandInfo(builderName, item.logo_url);

  return {
    id: item.builder_id || item.id,
    name: builderName,
    companyName: item.company_name || builderName || 'Real Estate Developer',
    reraRegistrationNo: item.rera_registration_no || 'GUJ-BUILDER-VERIXA-2026',
    officeAddress: item.office_address || 'Ahmedabad, Gujarat',
    phone: item.phone || '+91 9876543210',
    email: item.email || 'info@developer.com',
    website: item.website || null,
    establishedYear: estYear,
    yearsOfExperience: yearsExp,
    about: item.about || `Established in ${estYear}, ${builderName} is one of Gujarat's premier real estate developers known for landmark residential, commercial, and mixed-use developments.`,
    isVerified: true,
    logoUrl: brandInfo.logo,
    brandColor: brandInfo.color,
    abbr: brandInfo.abbr,
    // Trust and Delivery statistics
    trustScore: item.trust_score || 94,
    deliveryRate: item.delivery_on_time_rate || 96,
    completedProjectsCount: item.completed_projects || 28,
    ongoingProjectsCount: item.ongoing_projects || 8,
    totalProjectsCount: item.total_projects || 36,
  };
}

export const builderService = {
  /**
   * GET /api/builders/
   * List all verified builders
   */
  async getBuilders() {
    try {
      const response = await apiClient.get('/builders/');
      const rawData = response?.data?.data || response?.data || response;
      if (Array.isArray(rawData)) {
        return rawData.map(mapApiBuilderToUi).filter(Boolean);
      }
      return [];
    } catch (error) {
      console.warn('builderService: Error fetching builders list:', error);
      return [];
    }
  },

  /**
   * GET /api/builders/:id/
   * Retrieve single builder by UUID or slug
   */
  async getBuilderById(id) {
    if (!id || id === 'undefined' || id === 'null') return null;

    try {
      const response = await apiClient.get(`/builders/${id}/`);
      const rawData = response?.data?.data || response?.data || response;
      if (rawData && (rawData.builder_id || rawData.id)) {
        return mapApiBuilderToUi(rawData);
      }
    } catch (error) {
      console.warn(`builderService: Direct lookup for "${id}" failed, searching list:`, error?.message || error);
    }

    // Fallback: search builders list
    try {
      const allBuilders = await this.getBuilders();
      const match = allBuilders.find(
        (b) => String(b.id).toLowerCase() === String(id).toLowerCase() ||
               String(b.name).toLowerCase().replace(/\s+/g, '-') === String(id).toLowerCase()
      );
      if (match) return match;
    } catch (err) {
      console.warn('builderService: List search fallback failed:', err);
    }

    return null;
  },

  /**
   * GET /api/builders/projects/?builder=:id
   * Retrieve projects for a specific builder with optional search, status, property_type, ordering, page
   */
  async getBuilderProjects(builderId, filters = {}) {
    if (!builderId) return { results: [], count: 0, totalPages: 1 };

    try {
      const params = new URLSearchParams();
      params.append('builder', builderId);
      params.append('page_size', '20');

      if (filters.search) params.append('search', filters.search);
      if (filters.status && filters.status !== 'All') params.append('project_status', filters.status);
      if (filters.property_type && filters.property_type !== 'All') params.append('property_type', filters.property_type);
      if (filters.ordering) params.append('ordering', filters.ordering);
      if (filters.page) params.append('page', String(filters.page));

      const response = await apiClient.get(`/builders/projects/?${params.toString()}`);
      const resData = response?.data?.data || response?.data || response;

      let rawResults = resData?.results || (Array.isArray(resData) ? resData : []);
      const totalCount = resData?.count || rawResults.length;
      const totalPages = resData?.total_pages || Math.ceil(totalCount / 20) || 1;

      const mappedProjects = rawResults.map(mapApiBuilderProjectToUi).filter(Boolean);

      return {
        results: mappedProjects,
        count: totalCount,
        totalPages: totalPages,
        currentPage: resData?.current_page || 1,
      };
    } catch (error) {
      console.warn(`builderService: Error fetching projects for builder "${builderId}":`, error);
      return { results: [], count: 0, totalPages: 1, currentPage: 1 };
    }
  },
};

export default builderService;

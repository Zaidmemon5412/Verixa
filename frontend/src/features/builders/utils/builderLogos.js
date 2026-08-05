/**
 * Maps builder names to authentic brand logos, brand color accents, and initials
 */
export const BUILDER_BRAND_MAP = {
  'bakeri group': {
    logo: 'https://logo.clearbit.com/bakeri.com',
    color: '#0284c7', // Sky Blue
    abbr: 'BG'
  },
  'ganesh housing limited': {
    logo: 'https://logo.clearbit.com/ganeshhousing.com',
    color: '#0d9488', // Teal
    abbr: 'GH'
  },
  'goyal & co': {
    logo: 'https://logo.clearbit.com/goyalco.com',
    color: '#2563eb', // Royal Blue
    abbr: 'GC'
  },
  'jp iscon group': {
    logo: 'https://logo.clearbit.com/iscongroup.com',
    color: '#4f46e5', // Indigo
    abbr: 'IS'
  },
  'shilp group': {
    logo: 'https://logo.clearbit.com/shilpgroup.com',
    color: '#059669', // Emerald
    abbr: 'SG'
  },
  'sun builders group': {
    logo: 'https://logo.clearbit.com/sunbuilders.in',
    color: '#d97706', // Amber
    abbr: 'SB'
  },
  'godrej properties': {
    logo: 'https://logo.clearbit.com/godrejproperties.com',
    color: '#14b8a6', // Teal
    abbr: 'GP'
  },
  'adani realty': {
    logo: 'https://logo.clearbit.com/adanirealty.com',
    color: '#1d4ed8', // Blue
    abbr: 'AR'
  },
  'sobha developers': {
    logo: 'https://logo.clearbit.com/sobha.com',
    color: '#7c3aed', // Purple
    abbr: 'SD'
  },
  'shivalik group': {
    logo: 'https://logo.clearbit.com/shivalikgroup.com',
    color: '#ea580c', // Orange
    abbr: 'SK'
  }
};

/**
 * Returns authentic logo URL for builder based on builder name or existing URL
 */
export function getBuilderLogo(builderName, existingLogoUrl = null) {
  if (existingLogoUrl && existingLogoUrl.startsWith('http')) {
    return existingLogoUrl;
  }

  if (!builderName) return null;

  const key = String(builderName).toLowerCase().trim();

  for (const [nameKey, brand] of Object.entries(BUILDER_BRAND_MAP)) {
    if (key.includes(nameKey) || nameKey.includes(key)) {
      return brand.logo;
    }
  }

  return null;
}

/**
 * Returns brand info (logo, accent color, initials) for builder name
 */
export function getBuilderBrandInfo(builderName, existingLogoUrl = null) {
  const logo = getBuilderLogo(builderName, existingLogoUrl);
  const key = String(builderName || '').toLowerCase().trim();

  for (const [nameKey, brand] of Object.entries(BUILDER_BRAND_MAP)) {
    if (key.includes(nameKey) || nameKey.includes(key)) {
      return {
        logo: logo || brand.logo,
        color: brand.color,
        abbr: brand.abbr
      };
    }
  }

  const words = String(builderName || 'Developer').split(' ').filter(Boolean);
  const abbr = words.length >= 2 
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : String(builderName || 'VD').substring(0, 2).toUpperCase();

  return {
    logo: logo,
    color: '#0284c7',
    abbr: abbr
  };
}

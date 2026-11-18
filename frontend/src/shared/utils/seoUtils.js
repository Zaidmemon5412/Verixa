export const SITE_URL = 'https://verixa-phi.vercel.app';
export const SITE_NAME = 'Verixa';
export const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=630&fit=crop&auto=format';

/**
 * Convert arbitrary text into a lowercase hyphenated URL slug.
 */
export function slugify(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Create a hybrid SEO slug for a property: "{name-locality}--{uuid}".
 */
export function createPropertySlug(property) {
  if (!property) return '';
  const namePart = slugify(`${property.name || 'property'}-${property.locality || 'ahmedabad'}`);
  if (property.id) {
    return `${namePart || 'property'}--${property.id}`;
  }
  return namePart || 'property';
}

/**
 * Create a hybrid SEO slug for a builder: "{name}--{uuid}".
 */
export function createBuilderSlug(builder) {
  if (!builder) return '';
  const namePart = slugify(builder.name || 'developer');
  if (builder.id) {
    return `${namePart || 'developer'}--${builder.id}`;
  }
  return namePart || 'developer';
}

/**
 * Extract the underlying ID/UUID from a hybrid SEO slug or raw ID.
 */
export function extractIdFromSlug(slugOrId) {
  if (!slugOrId) return '';
  const raw = String(slugOrId).trim();
  if (raw.includes('--')) {
    const parts = raw.split('--');
    return parts[parts.length - 1].trim();
  }
  const uuidMatch = raw.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  if (uuidMatch) {
    return uuidMatch[1];
  }
  return raw;
}

/**
 * Homepage WebSite + SearchAction & RealEstateAgent JSON-LD schemas.
 */
export function buildWebsiteSchema() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description:
        'RERA-verified properties, AI fair price valuation, builder delay benchmarks, and legal title verification in Ahmedabad.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/properties?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      name: SITE_NAME,
      url: SITE_URL,
      logo: DEFAULT_OG_IMAGE,
      image: DEFAULT_OG_IMAGE,
      areaServed: {
        '@type': 'City',
        name: 'Ahmedabad',
        addressRegion: 'Gujarat',
        addressCountry: 'IN',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Ahmedabad',
        addressRegion: 'Gujarat',
        addressCountry: 'IN',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does Verixa verify RERA registration and legal land titles in Ahmedabad?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Verixa cross-checks Gujarat RERA filings, NA (Non-Agricultural) land conversion status, Khata and survey records, and sub-registrar title documents through automated OCR and compliance verification checks before listing any project as verified.',
          },
        },
        {
          '@type': 'Question',
          name: "How accurate is Verixa's XGBoost AI Fair Price Valuation?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Verixa trains gradient-boosted valuation models on 50,000+ historical micro-market transactions, carpet-area benchmarks, and builder reputation signals to detect overpriced listings and calculate an objective Fair Market Price band.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which micro-markets in Ahmedabad offer the best rental yield and price appreciation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Key high-momentum micro-markets tracked on Verixa include Thaltej, Satellite, Sola, Gota, Chandkheda, and Maninagar, each benchmarked on rental yield, metro connectivity, schools, hospitals, and 5-year appreciation trajectories.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is the Verixa Builder Trust & Delivery Score calculated?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Builder Trust Score evaluates RERA registration compliance, years of development experience, completed-to-ongoing project ratio, and historical on-time delivery accuracy across Ahmedabad developments.',
          },
        },
      ],
    },
  ];
}

/**
 * Build a Schema.org ItemList object for directory and programmatic catalog pages.
 */
export function buildItemListSchema(items = [], listName = 'Verified Properties in Ahmedabad') {
  if (!Array.isArray(items) || items.length === 0) return null;
  const sliced = items.slice(0, 12);
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: sliced.length,
    itemListElement: sliced.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      url: item.path?.startsWith('http') ? item.path : `${SITE_URL}${item.path || '/'}`,
    })),
  };
}

/**
 * Build Schema.org Article + FAQPage objects for a Verixa Guide article page.
 */
export function buildArticleSchema(guide) {
  if (!guide) return [];
  const canonicalUrl = `${SITE_URL}/guides/${guide.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.metaDescription || guide.summary,
    image: [guide.heroImage || DEFAULT_OG_IMAGE],
    datePublished: guide.publishedAt || '2026-11-15',
    dateModified: guide.updatedAt || '2026-11-18',
    author: {
      '@type': 'Organization',
      name: guide.author || 'Verixa Legal & Quantitative Research Desk',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const schemas = [articleSchema];

  if (Array.isArray(guide.faqs) && guide.faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guide.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    });
  }

  return schemas;
}

/**
 * Build a Schema.org BreadcrumbList from [{ name, path }].
 */
export function buildBreadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path?.startsWith('http') ? item.path : `${SITE_URL}${item.path || '/'}`,
    })),
  };
}

/**
 * Build a Schema.org RealEstateListing + Residence object for a property page.
 */
export function buildPropertySchema(project, builder) {
  if (!project) return null;
  const canonicalUrl = `${SITE_URL}/properties/${project.slug || project.id}`;
  const images =
    Array.isArray(project.images) && project.images.length > 0
      ? project.images
      : [project.image || DEFAULT_OG_IMAGE];

  const schema = {
    '@context': 'https://schema.org',
    '@type': ['RealEstateListing', 'Residence'],
    name: project.name,
    description:
      project.overview ||
      `${project.name} in ${project.locality || 'Ahmedabad'} - ${project.config || 'Residential'} RERA verified property.`,
    url: canonicalUrl,
    image: images,
    address: {
      '@type': 'PostalAddress',
      streetAddress: project.address || project.location || `${project.locality || 'Satellite'}, Ahmedabad`,
      addressLocality: project.city || 'Ahmedabad',
      addressRegion: project.state || 'Gujarat',
      addressCountry: 'IN',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: canonicalUrl,
    },
  };

  if (project.priceNum && Number(project.priceNum) > 0) {
    schema.offers.price = Number(project.priceNum);
  }

  if (project.bhkNum && Number(project.bhkNum) > 0) {
    schema.numberOfRooms = Number(project.bhkNum);
  }

  if (project.areaNum && Number(project.areaNum) > 0) {
    schema.floorSize = {
      '@type': 'QuantitativeValue',
      value: Number(project.areaNum),
      unitCode: 'FTK',
    };
  }

  if (project.latitude != null && project.longitude != null) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: Number(project.latitude),
      longitude: Number(project.longitude),
    };
  }

  if (builder?.name || project.builder) {
    schema.provider = {
      '@type': 'Organization',
      name: builder?.name || project.builder,
    };
  }

  return schema;
}

/**
 * Build a Schema.org Organization + AggregateRating object for a developer page.
 */
export function buildBuilderSchema(builder) {
  if (!builder) return null;
  const ratingValue = (((builder.trustScore || 90) / 20)).toFixed(1);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: builder.name,
    description:
      builder.about ||
      `${builder.name} is a RERA-verified real estate developer operating in Ahmedabad, Gujarat.`,
    url: `${SITE_URL}/builders/${builder.slug || builder.id}`,
    foundingDate: builder.establishedYear ? String(builder.establishedYear) : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: builder.officeAddress || 'Ahmedabad, Gujarat',
      addressLocality: 'Ahmedabad',
      addressRegion: 'Gujarat',
      addressCountry: 'IN',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue,
      bestRating: '5',
      worstRating: '1',
      ratingCount: builder.totalProjectsCount || 25,
    },
  };
}

/**
 * Build Schema.org Place + FAQPage objects for a locality page.
 */
export function buildLocalitySchema(locality) {
  if (!locality) return [];
  const locName = locality.name || 'Ahmedabad';
  const locUrl = `${SITE_URL}/localities/${locality.slug || locality.id || slugify(locName)}`;

  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${locName}, ${locality.city || 'Ahmedabad'}`,
    description:
      locality.description ||
      `Real estate intelligence, average sqft rates, rental yield, and infrastructure overview for ${locName}, Ahmedabad.`,
    url: locUrl,
    image: locality.image || DEFAULT_OG_IMAGE,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locName,
      addressRegion: locality.state || 'Gujarat',
      addressCountry: 'IN',
    },
  };

  if (locality.latitude != null && locality.longitude != null) {
    placeSchema.geo = {
      '@type': 'GeoCoordinates',
      latitude: Number(locality.latitude),
      longitude: Number(locality.longitude),
    };
  }

  const schoolsCount = locality.infra?.schools ?? locality.schools ?? 'multiple reputed';
  const hospitalsCount = locality.infra?.hospitals ?? locality.hospitals ?? 'leading';
  const metroInfo = locality.infra?.metro || locality.metro || 'nearby Ahmedabad Metro';

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the average property price in ${locName}, Ahmedabad?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The average property price in ${locName}, Ahmedabad is ${locality.avgPrice || '₹85 L – ₹1.6 Cr'} with an average rate around ${locality.psf || '₹6,500'}/sqft for verified residential projects.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the rental yield and growth score in ${locName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${locName} offers an estimated rental yield of ${locality.rentalYield || '3.5%'} and holds a Verixa Locality Growth Score of ${locality.growthScore || 82}/100 driven by buyer demand and infrastructure appreciation.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is ${locName} well-connected to schools, hospitals, and metro in Ahmedabad?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, ${locName} provides access to ${schoolsCount} schools, ${hospitalsCount} hospitals, and ${metroInfo} connectivity along with strong neighborhood livability and safety benchmarks.`,
        },
      },
    ],
  };

  return [placeSchema, faqSchema];
}

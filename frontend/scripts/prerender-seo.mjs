import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEO_GUIDES } from '../src/features/guides/constants/guidesData.js';
import { LOCALITIES } from '../src/features/localities/constants/localityData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(FRONTEND_ROOT, 'dist');
const SITE_URL = 'https://verixa-phi.vercel.app';
const API_BASE_URL = 'https://verixa-backend-hwqz.onrender.com/api';
const SITE_NAME = 'Verixa';
const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=630&fit=crop&auto=format';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str);
}

function slugify(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractCleanArea(item) {
  if (!item) return 'Satellite';
  const text = `${item.locality_name || ''} ${item.locality_detail?.name || ''} ${item.location || ''} ${item.locality || ''} ${item.address || ''} ${item.property_name || ''}`.toLowerCase();
  if (text.includes('gota')) return 'Gota';
  if (text.includes('chandkheda')) return 'Chandkheda';
  if (text.includes('sola')) return 'Sola';
  if (text.includes('thaltej')) return 'Thaltej';
  if (text.includes('satellite')) return 'Satellite';
  if (text.includes('maninagar')) return 'Maninagar';
  return 'Ahmedabad';
}

function createPropertySlug(item) {
  const id = item?.property_id || item?.project_id || item?.id;
  const name = item?.property_name || item?.project_name || item?.name || 'property';
  const locality = extractCleanArea(item);
  const namePart = slugify(`${name}-${locality}`);
  return id ? `${namePart || 'property'}--${id}` : namePart || 'property';
}

function createBuilderSlug(builder) {
  const id = builder?.builder_id || builder?.id;
  const name = builder?.builder_name || builder?.name || 'developer';
  const namePart = slugify(name);
  return id ? `${namePart || 'developer'}--${id}` : namePart || 'developer';
}

function formatPriceShort(priceVal) {
  const num = parseFloat(priceVal);
  if (isNaN(num) || num === 0) return '₹35L – ₹1.2Cr';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

function fullTitle(title) {
  if (!title) {
    return `${SITE_NAME} – RERA Verified Properties, AI Price Valuation & Legal Title Audit in Ahmedabad`;
  }
  return title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME} – Verified Real Estate Intelligence`;
}

function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${SITE_URL}${item.path}`,
    })),
  };
}

function buildWebsiteSchema() {
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
    },
  ];
}

async function fetchJsonWithTimeout(url, timeoutMs = 15000, retries = 1) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        return await res.json();
      }
      if (res.status < 500 || attempt >= retries) {
        return null;
      }
    } catch {
      if (attempt >= retries) {
        return null;
      }
    } finally {
      clearTimeout(timer);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  return null;
}

async function fetchLiveCatalog() {
  const [buildersPayload, propsPayload, filterOptionsPayload, featuredProjectsPayload] =
    await Promise.all([
      fetchJsonWithTimeout(`${API_BASE_URL}/builders/`, 18000, 1),
      fetchJsonWithTimeout(`${API_BASE_URL}/properties/?page_size=500&compact=1`, 18000, 1),
      fetchJsonWithTimeout(`${API_BASE_URL}/properties/filter-options/`, 18000, 1),
      fetchJsonWithTimeout(`${API_BASE_URL}/builders/projects/?page_size=12`, 18000, 1),
    ]);

  const rawBuilders =
    buildersPayload?.data || (Array.isArray(buildersPayload) ? buildersPayload : []);
  const rawProps =
    propsPayload?.data?.results ||
    propsPayload?.results ||
    (Array.isArray(propsPayload?.data) ? propsPayload.data : []);
  const rawFeaturedProjects =
    featuredProjectsPayload?.data?.results ||
    featuredProjectsPayload?.results ||
    (Array.isArray(featuredProjectsPayload?.data) ? featuredProjectsPayload.data : []);
  const rawFilterOptions = filterOptionsPayload?.data || null;

  const safeRawBuilders = Array.isArray(rawBuilders) ? rawBuilders : [];
  const safeRawProps = Array.isArray(rawProps) ? rawProps : [];
  const safeRawFeatured = Array.isArray(rawFeaturedProjects) ? rawFeaturedProjects : [];
  const liveCount =
    typeof propsPayload?.data?.count === 'number'
      ? propsPayload.data.count
      : typeof propsPayload?.count === 'number'
      ? propsPayload.count
      : safeRawProps.length;

  const builders = safeRawBuilders
    .filter((b) => b && (b.builder_id || b.id))
    .map((b) => ({
      id: b.builder_id || b.id,
      slug: createBuilderSlug(b),
      name: b.builder_name || b.name || 'Verified Developer',
      yearsExp: b.years_of_experience || 10,
      completedProjects: b.completed_projects ?? 15,
      trustScore: b.trust_score || 90,
      updatedAt: b.updated_at ? String(b.updated_at).slice(0, 10) : null,
    }));

  const properties = safeRawProps
    .filter((p) => p && (p.property_id || p.project_id || p.id))
    .map((p) => ({
      id: p.property_id || p.project_id || p.id,
      slug: createPropertySlug(p),
      name: p.property_name || p.project_name || 'Verified Property',
      locality: extractCleanArea(p),
      price: formatPriceShort(p.price),
      bhk: p.bhk ? `${p.bhk} BHK` : 'Residential',
      status: p.status || 'Ready to Move',
      builderName: p.builder_name || '',
      updatedAt: p.created_at ? String(p.created_at).slice(0, 10) : null,
    }));

  return {
    builders,
    properties,
    rawBuilders: safeRawBuilders,
    rawProperties: safeRawProps,
    rawFeaturedProjects: safeRawFeatured,
    rawFilterOptions,
    liveCount,
  };
}

function buildNavFooterHtml() {
  return `
    <footer class="vx-footer-nav">
      <div class="vx-links-row">
        <a href="/">Home</a>
        <a href="/properties">Verified Properties</a>
        <a href="/builders">Builders Directory</a>
        <a href="/localities">Ahmedabad Localities</a>
        <a href="/comparison">Compare Properties</a>
        <a href="/market">Market Trends</a>
        <a href="/guides">Buyer &amp; RERA Guides</a>
      </div>
      <div class="vx-links-row" style="margin-top:10px;">
        <a href="/properties?locality=Satellite">Flats in Satellite</a>
        <a href="/properties?locality=Thaltej">Homes in Thaltej</a>
        <a href="/properties?locality=Sola">Projects in Sola</a>
        <a href="/properties?locality=Gota">Flats in Gota</a>
        <a href="/properties?locality=Chandkheda">Flats in Chandkheda</a>
        <a href="/properties?locality=Maninagar">Flats in Maninagar</a>
        <a href="/properties?bhk=2">2 BHK Ahmedabad</a>
        <a href="/properties?bhk=3">3 BHK Ahmedabad</a>
        <a href="/properties?type=villa">Villas in Ahmedabad</a>
        <a href="/properties?status=ready">Ready to Move</a>
      </div>
    </footer>`;
}

function buildRoutes({ builders = [], properties = [] } = {}) {
  const routes = [];
  const featuredProps = properties.slice(0, 24);

  // 1. Homepage /
  routes.push({
    routePath: '/',
    title: 'Verixa – RERA Verified Properties, AI Fair Price & Legal Title Audit in Ahmedabad',
    description:
      'Buy verified properties in Ahmedabad with 100% legal confidence. Verixa audits RERA filings, builder delivery track records, and XGBoost fair price valuations across Thaltej, Satellite, Sola, Gota, Chandkheda & Maninagar.',
    keywords:
      'Ahmedabad real estate, RERA verified flats Ahmedabad, legal title verification, AI fair price calculator, Verixa',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    schemas: buildWebsiteSchema(),
    bodyHtml: `
      <main class="vx-wrap vx-main">
        <header class="vx-hero">
          <span class="vx-pill-tag">100% RERA &amp; Title Audited • Ahmedabad Real Estate</span>
          <h1 class="vx-h1">Buy Verified Properties in Ahmedabad with 100% Legal Confidence</h1>
          <p class="vx-lead">Verixa audits Gujarat RERA filings, builder delivery track records, and XGBoost AI fair price valuations across Satellite, Thaltej, Sola, Gota, Chandkheda, and Maninagar.</p>
          <div class="vx-cta-row">
            <a class="vx-btn-primary" href="/properties">Explore Verified Properties</a>
            <a class="vx-btn-outline" href="/guides">Read Gujarat RERA &amp; Buyer Guides</a>
            <a class="vx-btn-outline" href="/localities">Compare Micro-Markets</a>
          </div>
        </header>

        <section class="vx-section">
          <h2 class="vx-h2">Ahmedabad Micro-Market Intelligence</h2>
          <div class="vx-card-grid vx-grid-3">
            ${LOCALITIES.map(
              (l) => `
              <article class="vx-card-item">
                <h3><a class="vx-link" href="/localities/${escapeAttr(l.slug)}">${escapeHtml(l.name)}, Ahmedabad</a></h3>
                <p class="vx-meta">Avg ${escapeHtml(l.avgPrice)} (${escapeHtml(l.psf)}/sqft) • Yield ${escapeHtml(l.rentalYield)} • Growth ${escapeHtml(l.growthScore)}/100</p>
              </article>`
            ).join('')}
          </div>
        </section>

        ${
          featuredProps.length > 0
            ? `<section class="vx-section">
                <h2 class="vx-h2">Verified RERA Properties in Ahmedabad</h2>
                <div class="vx-card-grid vx-grid-3">
                  ${featuredProps
                    .slice(0, 9)
                    .map(
                      (p) => `
                    <article class="vx-card-item">
                      <h3><a class="vx-link" href="/properties/${escapeAttr(p.slug)}">${escapeHtml(p.name)}</a></h3>
                      <p class="vx-meta">${escapeHtml(p.locality)}, Ahmedabad • ${escapeHtml(p.bhk)} • ${escapeHtml(p.price)}</p>
                    </article>`
                    )
                    .join('')}
                </div>
              </section>`
            : ''
        }

        <section class="vx-section">
          <h2 class="vx-h2">Latest Ahmedabad Buyer &amp; RERA Verification Guides</h2>
          <div class="vx-card-grid vx-grid-3">
            ${SEO_GUIDES.map(
              (g) => `
              <article class="vx-card-item">
                <h3><a class="vx-link" href="/guides/${escapeAttr(g.slug)}">${escapeHtml(g.title)}</a></h3>
                <p class="vx-meta">${escapeHtml(g.summary)}</p>
              </article>`
            ).join('')}
          </div>
        </section>
        ${buildNavFooterHtml()}
      </main>`,
  });

  // 2. Properties Catalog /properties
  routes.push({
    routePath: '/properties',
    title: 'RERA Verified Properties in Ahmedabad – Flats, Villas & Plots',
    description:
      'Explore verified residential projects across Gota, Chandkheda, Sola, Thaltej, Satellite & Maninagar backed by ML decision analytics and legal title search.',
    keywords:
      'properties in Ahmedabad, RERA verified projects Ahmedabad, 2 BHK 3 BHK flats Thaltej Satellite Sola Gota, Verixa',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    schemas: [
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Verified Properties', path: '/properties' },
      ]),
    ],
    bodyHtml: `
      <main class="vx-wrap vx-main">
        <header class="vx-hero">
          <span class="vx-pill-tag">RERA &amp; Title Audited • All 6 Micro-Markets</span>
          <h1 class="vx-h1">Verified Properties in Ahmedabad</h1>
          <p class="vx-lead">Explore RERA and title-audited apartments, villas, penthouses, and residential developments across Thaltej, Satellite, Sola, Gota, Chandkheda, and Maninagar.</p>
        </header>

        <section class="vx-section">
          <h2 class="vx-h2">Browse Properties by Locality &amp; Configuration</h2>
          <div class="vx-links-row">
            <a href="/properties?locality=Thaltej">Properties in Thaltej</a>
            <a href="/properties?locality=Satellite">Properties in Satellite</a>
            <a href="/properties?locality=Sola">Properties in Sola</a>
            <a href="/properties?locality=Gota">Properties in Gota</a>
            <a href="/properties?locality=Chandkheda">Properties in Chandkheda</a>
            <a href="/properties?locality=Maninagar">Properties in Maninagar</a>
            <a href="/properties?bhk=2">2 BHK Flats in Ahmedabad</a>
            <a href="/properties?bhk=3">3 BHK Flats in Ahmedabad</a>
            <a href="/properties?bhk=4">4 BHK Luxury Flats</a>
            <a href="/properties?type=villa">Villas in Ahmedabad</a>
            <a href="/properties?status=ready">Ready to Move Flats</a>
          </div>
        </section>

        ${
          featuredProps.length > 0
            ? `<section class="vx-section">
                <h2 class="vx-h2">Featured Verified Listings (${properties.length}+ Active Properties)</h2>
                <div class="vx-card-grid vx-grid-3">
                  ${featuredProps
                    .map(
                      (p) => `
                    <article class="vx-card-item">
                      <h3><a class="vx-link" href="/properties/${escapeAttr(p.slug)}">${escapeHtml(p.name)}</a></h3>
                      <p class="vx-meta">${escapeHtml(p.locality)}, Ahmedabad • ${escapeHtml(p.bhk)} • ${escapeHtml(p.price)} • ${escapeHtml(p.status)}</p>
                    </article>`
                    )
                    .join('')}
                </div>
              </section>`
            : ''
        }
        ${buildNavFooterHtml()}
      </main>`,
  });

  // 3. Builders Directory /builders
  routes.push({
    routePath: '/builders',
    title: 'Top RERA Verified Real Estate Developers & Builders in Ahmedabad',
    description:
      'Compare Ahmedabad real estate developers by on-time delivery rate, RERA registration track record, completed projects, and Verixa algorithmic trust scores.',
    keywords: 'Ahmedabad real estate builders, RERA verified developers Gujarat, builder trust score, Verixa',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    schemas: [
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Verified Builders', path: '/builders' },
      ]),
    ],
    bodyHtml: `
      <main class="vx-wrap vx-main">
        <header class="vx-hero">
          <span class="vx-pill-tag">Delivery &amp; Financial Reliability Audit</span>
          <h1 class="vx-h1">Property Developers &amp; Builder Trust Directory in Ahmedabad</h1>
          <p class="vx-lead">Evaluate real estate builders across Ahmedabad by completion history, GujRERA promoter compliance, and on-time delivery benchmarks.</p>
        </header>
        ${
          builders.length > 0
            ? `<section class="vx-section">
                <h2 class="vx-h2">Verified Real Estate Developers (${builders.length})</h2>
                <div class="vx-card-grid vx-grid-2">
                  ${builders
                    .map(
                      (b) => `
                    <article class="vx-card-item">
                      <h3><a class="vx-link" href="/builders/${escapeAttr(b.slug)}">${escapeHtml(b.name)}</a></h3>
                      <p class="vx-meta">${escapeHtml(b.yearsExp)} Years Experience • ${escapeHtml(b.completedProjects)} Completed Projects • Trust Score ${escapeHtml(b.trustScore)}%</p>
                    </article>`
                    )
                    .join('')}
                </div>
              </section>`
            : ''
        }
        ${buildNavFooterHtml()}
      </main>`,
  });

  // 4. Localities Directory /localities
  routes.push({
    routePath: '/localities',
    title: 'Ahmedabad Micro-Market Intelligence – Price Trends, Rental Yield & Infrastructure',
    description:
      'Compare property rates per sqft, rental yields, metro connectivity, schools, and hospital access across Satellite, Thaltej, Gota, Sola, Chandkheda & Maninagar in Ahmedabad.',
    keywords: 'Ahmedabad localities, Satellite Thaltej Gota Sola Chandkheda Maninagar property rates, Verixa',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    schemas: [
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Localities', path: '/localities' },
      ]),
    ],
    bodyHtml: `
      <main class="vx-wrap vx-main">
        <header class="vx-hero">
          <span class="vx-pill-tag">Neighborhood Appreciation &amp; Infrastructure Index</span>
          <h1 class="vx-h1">Ahmedabad Locality Growth Engine</h1>
          <p class="vx-lead">In-depth neighborhood growth ratings, average rate per sqft, rental yields, metro distance, and infrastructure benchmarks.</p>
        </header>
        <section class="vx-section">
          <div class="vx-card-grid vx-grid-3">
            ${LOCALITIES.map(
              (l) => `
              <article class="vx-card-item">
                <h3><a class="vx-link" href="/localities/${escapeAttr(l.slug)}">${escapeHtml(l.name)}, Ahmedabad</a></h3>
                <p class="vx-meta">${escapeHtml(l.avgPrice)} (${escapeHtml(l.psf)}/sqft) • Yield ${escapeHtml(l.rentalYield)} • Growth Score ${escapeHtml(l.growthScore)}/100</p>
              </article>`
            ).join('')}
          </div>
        </section>
        ${buildNavFooterHtml()}
      </main>`,
  });

  // 5-10. Individual Locality Pages /localities/<slug>
  for (const loc of LOCALITIES) {
    const locPath = `/localities/${loc.slug}`;
    const locProps = properties
      .filter((p) => p.locality.toLowerCase() === loc.name.toLowerCase())
      .slice(0, 12);

    routes.push({
      routePath: locPath,
      title: `${loc.name}, Ahmedabad Real Estate – Avg Price ${loc.psf}/sqft, Yield & Projects`,
      description: `In-depth real estate intelligence for ${loc.name}, Ahmedabad: average price ${loc.avgPrice} (${loc.psf}/sqft), ${loc.rentalYield} rental yield, ${loc.growthScore}/100 growth score, and verified RERA projects.`,
      keywords: `${loc.name} Ahmedabad real estate, ${loc.name} property rates per sqft, ${loc.name} rental yield, Verixa`,
      ogType: 'website',
      ogImage: loc.image || DEFAULT_OG_IMAGE,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'Place',
          name: `${loc.name}, Ahmedabad`,
          description: loc.verdictSummary,
          url: `${SITE_URL}${locPath}`,
        },
        buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Localities', path: '/localities' },
          { name: `${loc.name}, Ahmedabad`, path: locPath },
        ]),
      ],
      bodyHtml: `
        <main class="vx-wrap vx-main">
          <header class="vx-hero">
            <span class="vx-pill-tag">${escapeHtml(loc.city || 'Ahmedabad')}, Gujarat • Growth Score ${escapeHtml(loc.growthScore)}/100</span>
            <h1 class="vx-h1">${escapeHtml(loc.name)}, Ahmedabad Real Estate Market Intelligence</h1>
            <p class="vx-lead">${escapeHtml(loc.verdictSummary)}</p>
            <div class="vx-cta-row">
              <a class="vx-btn-primary" href="/properties?locality=${escapeAttr(loc.name)}">Browse Verified Properties in ${escapeHtml(loc.name)}</a>
            </div>
          </header>
          <section class="vx-section">
            <h2 class="vx-h2">${escapeHtml(loc.name)} Price &amp; Livability Metrics</h2>
            <ul class="vx-list">
              <li>Average Property Price: ${escapeHtml(loc.avgPrice)} (${escapeHtml(loc.psf)}/sqft)</li>
              <li>Estimated Rental Yield: ${escapeHtml(loc.rentalYield)}</li>
              <li>Verixa Growth Score: ${escapeHtml(loc.growthScore)}/100</li>
              <li>Infrastructure: ${escapeHtml(loc.infra.schools)} Schools, ${escapeHtml(loc.infra.hospitals)} Hospitals, Metro ${escapeHtml(loc.infra.metro)}</li>
            </ul>
          </section>
          ${
            locProps.length > 0
              ? `<section class="vx-section">
                  <h2 class="vx-h2">Verified Properties in ${escapeHtml(loc.name)}</h2>
                  <div class="vx-card-grid vx-grid-3">
                    ${locProps
                      .map(
                        (p) => `
                      <article class="vx-card-item">
                        <h3><a class="vx-link" href="/properties/${escapeAttr(p.slug)}">${escapeHtml(p.name)}</a></h3>
                        <p class="vx-meta">${escapeHtml(p.bhk)} • ${escapeHtml(p.price)} • ${escapeHtml(p.status)}</p>
                      </article>`
                      )
                      .join('')}
                  </div>
                </section>`
              : ''
          }
          ${buildNavFooterHtml()}
        </main>`,
    });
  }

  // 11. Market Trends /market
  routes.push({
    routePath: '/market',
    title: 'Ahmedabad Real Estate Market Trends, Price per Sqft & Investment Heat Map',
    description:
      'Live real estate price trajectory, demand vs supply velocity, locality heat map rankings, builder market share, and rental yield analytics in Ahmedabad.',
    keywords: 'Ahmedabad real estate market trends, property price per sqft Ahmedabad, locality heat map, Verixa',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    schemas: [
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Market Trends', path: '/market' },
      ]),
    ],
    bodyHtml: `
      <main class="vx-wrap vx-main">
        <header class="vx-hero">
          <span class="vx-pill-tag">Live Price Trajectory &amp; Heat Map</span>
          <h1 class="vx-h1">Ahmedabad Market Trend &amp; Investment Intelligence</h1>
          <p class="vx-lead">Live price per sqft trajectory, launch vs sales absorption velocity, locality heat maps, and rental yield recommendations across Ahmedabad.</p>
        </header>
        <section class="vx-section">
          <h2 class="vx-h2">Micro-Market Benchmark Snapshot</h2>
          <div class="vx-card-grid vx-grid-3">
            ${LOCALITIES.map(
              (l) => `
              <article class="vx-card-item">
                <h3><a class="vx-link" href="/localities/${escapeAttr(l.slug)}">${escapeHtml(l.name)}</a></h3>
                <p class="vx-meta">${escapeHtml(l.psf)}/sqft • Rental Yield ${escapeHtml(l.rentalYield)} • Appreciation Trend: ${escapeHtml(l.growthScore)}/100</p>
              </article>`
            ).join('')}
          </div>
        </section>
        ${buildNavFooterHtml()}
      </main>`,
  });

  // 12. Comparison /comparison
  routes.push({
    routePath: '/comparison',
    title: 'Compare Verified Properties Side-by-Side – Price, Sqft Rate, RERA & AI Valuation',
    description:
      'Compare up to 4 Ahmedabad properties side-by-side across asking price, rate per sqft, AI fair price valuation, carpet area, RERA compliance, and amenities.',
    keywords: 'compare properties Ahmedabad, property comparison matrix, RERA comparison, Verixa',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    schemas: [
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Compare Properties', path: '/comparison' },
      ]),
    ],
    bodyHtml: `
      <main class="vx-wrap vx-main">
        <header class="vx-hero">
          <span class="vx-pill-tag">Side-by-Side Buyer Decision Matrix</span>
          <h1 class="vx-h1">Property Comparison Engine</h1>
          <p class="vx-lead">Compare verified properties side-by-side on asking price, price per sqft, carpet area, RERA registration, trust rating, and amenities.</p>
          <div class="vx-cta-row">
            <a class="vx-btn-primary" href="/properties">Select Properties to Compare</a>
          </div>
        </header>
        ${buildNavFooterHtml()}
      </main>`,
  });

  // 13. Guides Hub /guides
  routes.push({
    routePath: '/guides',
    title: 'Ahmedabad Real Estate Guides – RERA Verification, NA Check & Investment Intelligence',
    description:
      'Expert buyer guides on Gujarat RERA verification, NA land conversion, 7/12 title deeds, AI fair price valuation, and Ahmedabad locality price & yield comparisons.',
    keywords: 'Gujarat RERA guide, NA land verification Ahmedabad, 7/12 title check, Ahmedabad property investment guide, Verixa',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    schemas: [
      buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Buyer & RERA Guides', path: '/guides' },
      ]),
    ],
    bodyHtml: `
      <main class="vx-wrap vx-main">
        <header class="vx-hero">
          <span class="vx-pill-tag">Verixa Real Estate Research Hub</span>
          <h1 class="vx-h1">Ahmedabad Real Estate Verification &amp; Investment Guides</h1>
          <p class="vx-lead">In-depth checklists and quantitative comparisons for verifying Gujarat RERA, NA land conversion, builder trust scores, and neighborhood ROI.</p>
        </header>
        <section class="vx-section">
          <div class="vx-card-grid vx-grid-3">
            ${SEO_GUIDES.map(
              (g) => `
              <article class="vx-card-item">
                <h3><a class="vx-link" href="/guides/${escapeAttr(g.slug)}">${escapeHtml(g.title)}</a></h3>
                <p class="vx-meta">${escapeHtml(g.summary)}</p>
              </article>`
            ).join('')}
          </div>
        </section>
        ${buildNavFooterHtml()}
      </main>`,
  });

  // 14-19. Individual Guide Article Pages /guides/<slug>
  for (const guide of SEO_GUIDES) {
    const guidePath = `/guides/${guide.slug}`;
    routes.push({
      routePath: guidePath,
      title: guide.metaTitle || guide.title,
      description: guide.metaDescription || guide.summary,
      keywords: guide.keywords,
      ogType: 'article',
      ogImage: guide.heroImage || DEFAULT_OG_IMAGE,
      schemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.metaDescription || guide.summary,
          image: [guide.heroImage || DEFAULT_OG_IMAGE],
          datePublished: guide.publishedAt,
          dateModified: guide.updatedAt,
          author: { '@type': 'Organization', name: guide.author },
          publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        },
        buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
          { name: guide.title, path: guidePath },
        ]),
      ],
      bodyHtml: `
        <main class="vx-wrap vx-main">
          <article class="vx-article">
            <header class="vx-hero">
              <span class="vx-pill-tag">${escapeHtml(guide.category)} • ${escapeHtml(guide.readTime)} • Updated ${escapeHtml(guide.updatedAt)}</span>
              <h1 class="vx-h1">${escapeHtml(guide.title)}</h1>
              <p class="vx-lead">${escapeHtml(guide.summary)}</p>
            </header>
            ${(guide.keyTakeaways || []).length > 0 ? `<section class="vx-section"><h2 class="vx-h2">Key Takeaways</h2><ul class="vx-list">${guide.keyTakeaways.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul></section>` : ''}
            ${(guide.sections || [])
              .map(
                (sec) => `
              <section class="vx-section">
                <h2 class="vx-h2">${escapeHtml(sec.heading)}</h2>
                ${(sec.paragraphs || []).map((p) => `<p class="vx-p">${escapeHtml(p)}</p>`).join('')}
                ${(sec.bullets || []).length > 0 ? `<ul class="vx-list">${sec.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''}
                ${
                  sec.comparisonTable
                    ? `<table class="vx-table"><thead><tr>${sec.comparisonTable.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${sec.comparisonTable.rows.map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
                    : ''
                }
              </section>`
              )
              .join('')}
            ${
              (guide.faqs || []).length > 0
                ? `<section class="vx-section"><h2 class="vx-h2">Frequently Asked Questions</h2>${guide.faqs.map((f) => `<details open class="vx-faq"><summary>${escapeHtml(f.q)}</summary><p class="vx-p">${escapeHtml(f.a)}</p></details>`).join('')}</section>`
                : ''
            }
          </article>
          ${buildNavFooterHtml()}
        </main>`,
    });
  }

  return routes;
}

function buildAppShellHtml(route) {
  return `
    <style data-verixa-shell="true">
      :root {
        --vx-bg: #ffffff;
        --vx-fg: #0f172a;
        --vx-muted-fg: #475569;
        --vx-card: #ffffff;
        --vx-muted: #f1f5f9;
        --vx-border: #e2e8f0;
        --vx-nav: rgba(255, 255, 255, 0.94);
        --vx-badge-bg: rgba(37, 99, 235, 0.08);
        --vx-badge-fg: #2563eb;
      }
      html.dark {
        --vx-bg: #020817;
        --vx-fg: #f8fafc;
        --vx-muted-fg: #94a3b8;
        --vx-card: #0f172a;
        --vx-muted: #1e293b;
        --vx-border: rgba(148, 163, 184, 0.18);
        --vx-nav: rgba(15, 23, 42, 0.94);
        --vx-badge-bg: rgba(59, 130, 246, 0.16);
        --vx-badge-fg: #60a5fa;
      }
      .vx-shell { min-height: 100vh; background: var(--vx-bg); color: var(--vx-fg); font-family: Inter, system-ui, -apple-system, sans-serif; }
      .vx-nav { height: 60px; border-bottom: 1px solid var(--vx-border); background: var(--vx-nav); display: flex; align-items: center; }
      .vx-wrap { width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 18px; box-sizing: border-box; }
      .vx-nav-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
      .vx-brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; font-size: 18px; letter-spacing: -0.02em; color: var(--vx-fg); text-decoration: none; }
      .vx-logo { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, #2563eb, #1d4ed8); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; color: #ffffff; }
      .vx-nav-links { display: none; gap: 16px; align-items: center; }
      .vx-nav-links a { font-size: 13px; font-weight: 600; color: var(--vx-muted-fg); text-decoration: none; }
      .vx-nav-links a:hover { color: var(--vx-badge-fg); }
      .vx-main { padding-top: 28px; padding-bottom: 48px; }
      .vx-hero { padding: 20px 0 24px; border-bottom: 1px solid var(--vx-border); margin-bottom: 24px; }
      .vx-pill-tag { display: inline-block; font-size: 11px; font-weight: 700; color: var(--vx-badge-fg); background: var(--vx-badge-bg); border: 1px solid var(--vx-border); padding: 4px 10px; border-radius: 999px; margin-bottom: 12px; }
      .vx-h1 { font-size: clamp(1.6rem, 3.2vw, 2.5rem); font-weight: 800; line-height: 1.18; margin: 0 0 12px; letter-spacing: -0.02em; }
      .vx-h2 { font-size: 1.25rem; font-weight: 800; margin: 0 0 14px; }
      .vx-lead { font-size: 0.98rem; line-height: 1.6; color: var(--vx-muted-fg); max-width: 780px; margin: 0; }
      .vx-p { font-size: 0.92rem; line-height: 1.65; color: var(--vx-muted-fg); margin: 0 0 10px; }
      .vx-cta-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
      .vx-btn-primary { display: inline-flex; align-items: center; padding: 10px 18px; border-radius: 12px; background: #2563eb; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; }
      .vx-btn-outline { display: inline-flex; align-items: center; padding: 10px 16px; border-radius: 12px; border: 1px solid var(--vx-border); background: var(--vx-card); color: var(--vx-fg); font-size: 13px; font-weight: 600; text-decoration: none; }
      .vx-section { margin: 28px 0; }
      .vx-card-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
      .vx-card-item { border: 1px solid var(--vx-border); background: var(--vx-card); border-radius: 16px; padding: 16px; }
      .vx-card-item h3 { margin: 0 0 6px; font-size: 1rem; font-weight: 700; }
      .vx-link { color: var(--vx-fg); text-decoration: none; }
      .vx-link:hover { color: var(--vx-badge-fg); text-decoration: underline; }
      .vx-meta { font-size: 12px; line-height: 1.5; color: var(--vx-muted-fg); margin: 0; }
      .vx-list { padding-left: 18px; margin: 0; color: var(--vx-muted-fg); font-size: 14px; line-height: 1.7; }
      .vx-links-row { display: flex; flex-wrap: wrap; gap: 8px; }
      .vx-links-row a { font-size: 12px; font-weight: 600; color: var(--vx-muted-fg); text-decoration: none; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--vx-border); background: var(--vx-card); }
      .vx-links-row a:hover { color: var(--vx-badge-fg); border-color: var(--vx-badge-fg); }
      .vx-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
      .vx-table th, .vx-table td { border: 1px solid var(--vx-border); padding: 8px 10px; text-align: left; }
      .vx-faq { border: 1px solid var(--vx-border); border-radius: 12px; padding: 12px 14px; margin-bottom: 10px; background: var(--vx-card); }
      .vx-faq summary { font-weight: 700; font-size: 14px; cursor: pointer; }
      .vx-footer-nav { margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--vx-border); }
      @media (min-width: 768px) {
        .vx-nav-links { display: flex; }
        .vx-grid-2 { grid-template-columns: repeat(2, 1fr); }
        .vx-grid-3 { grid-template-columns: repeat(2, 1fr); }
      }
      @media (min-width: 1024px) {
        .vx-grid-3 { grid-template-columns: repeat(3, 1fr); }
      }
    </style>
    <div class="vx-shell">
      <div class="vx-nav">
        <div class="vx-wrap vx-nav-inner">
          <a href="/" class="vx-brand">
            <div class="vx-logo">V</div>
            <span>VERIXA</span>
          </a>
          <nav class="vx-nav-links" aria-label="Primary Navigation">
            <a href="/">Home</a>
            <a href="/properties">Properties</a>
            <a href="/builders">Builders</a>
            <a href="/localities">Localities</a>
            <a href="/comparison">Compare</a>
            <a href="/market">Market Trends</a>
            <a href="/guides">Guides</a>
          </nav>
        </div>
      </div>
      ${route.bodyHtml}
    </div>`;
}

function renderHtml(templateHtml, route) {
  const resolvedTitle = fullTitle(route.title);
  const canonicalUrl = `${SITE_URL}${route.routePath}`;
  const ogImage = route.ogImage || DEFAULT_OG_IMAGE;

  let html = templateHtml;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(resolvedTitle)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeAttr(route.description)}" />`
  );
  html = html.replace(
    /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="keywords" content="${escapeAttr(route.keywords)}" />`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`
  );

  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="${escapeAttr(route.ogType || 'website')}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeAttr(resolvedTitle)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeAttr(route.description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeAttr(canonicalUrl)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeAttr(ogImage)}" />`
  );

  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeAttr(resolvedTitle)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeAttr(route.description)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeAttr(ogImage)}" />`
  );

  html = html.replace(/<script[^>]*data-verixa-seo="true"[^>]*>[\s\S]*?<\/script>/gi, '');
  const jsonLdScripts = (route.schemas || [])
    .filter(Boolean)
    .map(
      (schemaObj) =>
        `<script type="application/ld+json" data-verixa-seo="true">${JSON.stringify(schemaObj).replace(/</g, '\\u003c')}</script>`
    )
    .join('\n    ');

  if (jsonLdScripts) {
    html = html.replace('</head>', `    ${jsonLdScripts}\n  </head>`);
  }

  const shellHtml = buildAppShellHtml(route);
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${shellHtml}</div>`);

  return html;
}

function generateSitemapXml({ builders = [], properties = [] } = {}) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const seen = new Set();
  const entries = [];

  const addUrl = (urlPath, { lastmod = todayIso, changefreq = 'weekly', priority = '0.80' } = {}) => {
    const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
    if (seen.has(cleanPath)) return;
    seen.add(cleanPath);
    const fullUrl = escapeHtml(`${SITE_URL}${cleanPath}`);
    entries.push(
      `  <url>\n` +
        `    <loc>${fullUrl}</loc>\n` +
        `    <lastmod>${escapeHtml(lastmod || todayIso)}</lastmod>\n` +
        `    <changefreq>${changefreq}</changefreq>\n` +
        `    <priority>${priority}</priority>\n` +
        `  </url>`
    );
  };

  // Core platform pages
  addUrl('/', { changefreq: 'daily', priority: '1.0' });
  addUrl('/properties', { changefreq: 'daily', priority: '0.95' });
  addUrl('/builders', { changefreq: 'weekly', priority: '0.90' });
  addUrl('/localities', { changefreq: 'weekly', priority: '0.90' });
  addUrl('/market', { changefreq: 'daily', priority: '0.90' });
  addUrl('/comparison', { changefreq: 'weekly', priority: '0.85' });
  addUrl('/guides', { changefreq: 'weekly', priority: '0.90' });

  // Guide articles
  for (const guide of SEO_GUIDES) {
    addUrl(`/guides/${guide.slug}`, {
      lastmod: guide.updatedAt || todayIso,
      changefreq: 'weekly',
      priority: '0.88',
    });
  }

  // Localities
  for (const loc of LOCALITIES) {
    addUrl(`/localities/${loc.slug}`, { changefreq: 'weekly', priority: '0.88' });
  }

  // Programmatic filter landing URLs
  for (const loc of ['Satellite', 'Thaltej', 'Gota', 'Sola', 'Chandkheda', 'Maninagar']) {
    addUrl(`/properties?locality=${loc}`, { changefreq: 'daily', priority: '0.85' });
  }
  addUrl('/properties?bhk=2', { changefreq: 'daily', priority: '0.82' });
  addUrl('/properties?bhk=3', { changefreq: 'daily', priority: '0.82' });
  addUrl('/properties?bhk=4', { changefreq: 'daily', priority: '0.80' });
  addUrl('/properties?type=villa', { changefreq: 'daily', priority: '0.80' });
  addUrl('/properties?status=ready', { changefreq: 'daily', priority: '0.80' });

  // Live builders & properties when backend API is reachable at build time
  for (const builder of builders) {
    addUrl(`/builders/${builder.slug}`, {
      lastmod: builder.updatedAt || todayIso,
      changefreq: 'weekly',
      priority: '0.82',
    });
  }

  for (const prop of properties) {
    addUrl(`/properties/${prop.slug}`, {
      lastmod: prop.updatedAt || todayIso,
      changefreq: 'weekly',
      priority: '0.80',
    });
  }

  return {
    xml:
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      entries.join('\n') +
      '\n</urlset>\n',
    urlCount: entries.length,
  };
}

async function main() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`dist/index.html not found at ${templatePath}`);
  }

  const baseTemplate = fs.readFileSync(templatePath, 'utf8');
  const catalog = await fetchLiveCatalog();
  const routes = buildRoutes(catalog);

  for (const route of routes) {
    const outHtml = renderHtml(baseTemplate, route);
    const outPath =
      route.routePath === '/'
        ? templatePath
        : path.join(DIST_DIR, route.routePath.replace(/^\//, ''), 'index.html');

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, outHtml, 'utf8');
  }

  const { xml, urlCount } = generateSitemapXml(catalog);
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml, 'utf8');

  const snapshotDir = path.join(DIST_DIR, 'data');
  fs.mkdirSync(snapshotDir, { recursive: true });
  const initialCatalog = {
    generatedAt: new Date().toISOString(),
    count: catalog.liveCount || catalog.rawProperties.length || 0,
    properties: catalog.rawProperties.slice(0, 48),
    builders: catalog.rawBuilders || [],
    featuredProjects: catalog.rawFeaturedProjects.slice(0, 12),
    filterOptions: catalog.rawFilterOptions || null,
  };
  fs.writeFileSync(
    path.join(snapshotDir, 'initial-catalog.json'),
    JSON.stringify(initialCatalog),
    'utf8'
  );

  console.log(`[prerender-seo] Pre-rendered ${routes.length} static SEO routes into dist/`);
  console.log(
    `[prerender-seo] Generated dist/sitemap.xml with ${urlCount} URLs (builders: ${catalog.builders.length}, properties: ${catalog.properties.length})`
  );
  console.log(
    `[prerender-seo] Wrote dist/data/initial-catalog.json (properties: ${initialCatalog.properties.length}, builders: ${initialCatalog.builders.length}, featured: ${initialCatalog.featuredProjects.length})`
  );
}

main();

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

function buildNavFooterHtml() {
  return `
    <nav aria-label="Primary Real Estate Directory Links" style="margin-top:24px;padding-top:16px;border-top:1px solid #334155;">
      <p><a href="/">Home</a> | <a href="/properties">Verified Properties</a> | <a href="/builders">Builders</a> | <a href="/localities">Localities</a> | <a href="/comparison">Compare Properties</a> | <a href="/market">Market Trends</a> | <a href="/guides">Buyer &amp; RERA Guides</a></p>
    </nav>`;
}

function buildRoutes() {
  const routes = [];

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
      <main class="max-w-7xl mx-auto px-4 py-8 text-slate-100">
        <header>
          <h1>Buy Verified Properties in Ahmedabad with 100% Legal Confidence</h1>
          <p>Verixa audits Gujarat RERA filings, builder delivery track records, and XGBoost AI fair price valuations across Satellite, Thaltej, Sola, Gota, Chandkheda, and Maninagar.</p>
          <p><a href="/properties">Explore Verified Properties</a> | <a href="/guides">Read Gujarat RERA &amp; Buyer Guides</a></p>
        </header>
        <section>
          <h2>Ahmedabad Micro-Market Intelligence</h2>
          <ul>
            ${LOCALITIES.map(
              (l) =>
                `<li><a href="/localities/${escapeAttr(l.slug)}">${escapeHtml(l.name)}, Ahmedabad</a> – Avg Price ${escapeHtml(l.avgPrice)} (${escapeHtml(l.psf)}/sqft), Rental Yield ${escapeHtml(l.rentalYield)}, Growth Score ${escapeHtml(l.growthScore)}/100</li>`
            ).join('')}
          </ul>
        </section>
        <section>
          <h2>Latest Ahmedabad Buyer &amp; RERA Verification Guides</h2>
          <ul>
            ${SEO_GUIDES.map(
              (g) =>
                `<li><a href="/guides/${escapeAttr(g.slug)}">${escapeHtml(g.title)}</a> – ${escapeHtml(g.summary)}</li>`
            ).join('')}
          </ul>
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
      <main class="max-w-7xl mx-auto px-4 py-8 text-slate-100">
        <h1>Verified Properties in Ahmedabad</h1>
        <p>Explore RERA and title-audited apartments, villas, penthouses, and residential developments across Ahmedabad micro-markets.</p>
        <section>
          <h2>Browse Properties by Ahmedabad Locality &amp; BHK</h2>
          <ul>
            <li><a href="/properties?locality=Thaltej">Properties in Thaltej</a></li>
            <li><a href="/properties?locality=Satellite">Properties in Satellite</a></li>
            <li><a href="/properties?locality=Sola">Properties in Sola</a></li>
            <li><a href="/properties?locality=Gota">Properties in Gota</a></li>
            <li><a href="/properties?locality=Chandkheda">Properties in Chandkheda</a></li>
            <li><a href="/properties?locality=Maninagar">Properties in Maninagar</a></li>
            <li><a href="/properties?bhk=2">2 BHK Flats in Ahmedabad</a></li>
            <li><a href="/properties?bhk=3">3 BHK Flats in Ahmedabad</a></li>
            <li><a href="/properties?type=villa">Villas in Ahmedabad</a></li>
          </ul>
        </section>
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
      <main class="max-w-7xl mx-auto px-4 py-8 text-slate-100">
        <h1>Property Developers &amp; Builder Trust Directory in Ahmedabad</h1>
        <p>Evaluate real estate builders across Ahmedabad by completion history, GujRERA promoter compliance, and on-time delivery benchmarks.</p>
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
      <main class="max-w-7xl mx-auto px-4 py-8 text-slate-100">
        <h1>Ahmedabad Locality Growth Engine</h1>
        <p>In-depth neighborhood growth ratings, average rate per sqft, rental yields, metro distance, and infrastructure benchmarks.</p>
        <ul>
          ${LOCALITIES.map(
            (l) =>
              `<li><a href="/localities/${escapeAttr(l.slug)}">${escapeHtml(l.name)}, Ahmedabad</a> – ${escapeHtml(l.avgPrice)} (${escapeHtml(l.psf)}/sqft) | Yield: ${escapeHtml(l.rentalYield)} | Score: ${escapeHtml(l.growthScore)}/100</li>`
          ).join('')}
        </ul>
        ${buildNavFooterHtml()}
      </main>`,
  });

  // 5-10. Individual Locality Pages /localities/<slug>
  for (const loc of LOCALITIES) {
    const locPath = `/localities/${loc.slug}`;
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
        <main class="max-w-7xl mx-auto px-4 py-8 text-slate-100">
          <h1>${escapeHtml(loc.name)}, Ahmedabad Real Estate Market Intelligence</h1>
          <p>${escapeHtml(loc.verdictSummary)}</p>
          <ul>
            <li>Average Property Price: ${escapeHtml(loc.avgPrice)} (${escapeHtml(loc.psf)}/sqft)</li>
            <li>Rental Yield: ${escapeHtml(loc.rentalYield)}</li>
            <li>Verixa Growth Score: ${escapeHtml(loc.growthScore)}/100</li>
            <li>Infrastructure: ${escapeHtml(loc.infra.schools)} Schools, ${escapeHtml(loc.infra.hospitals)} Hospitals, Metro ${escapeHtml(loc.infra.metro)}</li>
          </ul>
          <p><a href="/properties?locality=${escapeAttr(loc.name)}">Browse Verified Properties in ${escapeHtml(loc.name)}</a></p>
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
      <main class="max-w-7xl mx-auto px-4 py-8 text-slate-100">
        <h1>Ahmedabad Market Trend &amp; Investment Intelligence</h1>
        <p>Live price per sqft trajectory, launch vs sales absorption velocity, locality heat maps, and rental yield recommendations.</p>
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
      <main class="max-w-7xl mx-auto px-4 py-8 text-slate-100">
        <h1>Property Comparison Engine</h1>
        <p>Compare verified properties side-by-side on asking price, price per sqft, carpet area, RERA registration, trust rating, and amenities.</p>
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
      <main class="max-w-7xl mx-auto px-4 py-8 text-slate-100">
        <h1>Ahmedabad Real Estate Verification &amp; Investment Guides</h1>
        <p>In-depth checklists and quantitative comparisons for verifying Gujarat RERA, NA land conversion, builder trust scores, and neighborhood ROI.</p>
        <ul>
          ${SEO_GUIDES.map(
            (g) =>
              `<li><article><h2><a href="/guides/${escapeAttr(g.slug)}">${escapeHtml(g.title)}</a></h2><p>${escapeHtml(g.summary)}</p></article></li>`
          ).join('')}
        </ul>
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
        <main class="max-w-7xl mx-auto px-4 py-8 text-slate-100">
          <article>
            <header>
              <p>${escapeHtml(guide.category)} • ${escapeHtml(guide.readTime)} • Updated ${escapeHtml(guide.updatedAt)}</p>
              <h1>${escapeHtml(guide.title)}</h1>
              <p>${escapeHtml(guide.summary)}</p>
            </header>
            ${(guide.keyTakeaways || []).length > 0 ? `<section><h2>Key Takeaways</h2><ul>${guide.keyTakeaways.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul></section>` : ''}
            ${(guide.sections || [])
              .map(
                (sec) => `
              <section>
                <h2>${escapeHtml(sec.heading)}</h2>
                ${(sec.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
                ${(sec.bullets || []).length > 0 ? `<ul>${sec.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''}
                ${
                  sec.comparisonTable
                    ? `<table><thead><tr>${sec.comparisonTable.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${sec.comparisonTable.rows.map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
                    : ''
                }
              </section>`
              )
              .join('')}
            ${
              (guide.faqs || []).length > 0
                ? `<section><h2>Frequently Asked Questions</h2>${guide.faqs.map((f) => `<details open><summary>${escapeHtml(f.q)}</summary><p>${escapeHtml(f.a)}</p></details>`).join('')}</section>`
                : ''
            }
          </article>
          ${buildNavFooterHtml()}
        </main>`,
    });
  }

  return routes;
}

function buildRouteSkeletonBody(routePath) {
  if (routePath === '/') {
    return `
      <div class="vx-banner"></div>
      <div class="vx-wrap vx-main">
        <div class="vx-split-hero">
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="vx-shimmer" style="height:48px;width:92%;border-radius:14px;"></div>
            <div class="vx-shimmer" style="height:42px;width:72%;border-radius:14px;"></div>
            <div class="vx-shimmer-soft" style="height:16px;width:85%;border-radius:8px;"></div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;padding-top:6px;">
              <div class="vx-shimmer" style="height:46px;width:210px;border-radius:14px;"></div>
              <div class="vx-shimmer-soft" style="height:46px;width:190px;border-radius:14px;"></div>
            </div>
          </div>
          <div class="vx-shimmer" style="width:100%;aspect-ratio:4/3;border-radius:24px;"></div>
        </div>
        <div class="vx-grid-3" style="margin-top:32px;">
          <div class="vx-card"><div class="vx-thumb"></div><div class="vx-line"></div><div class="vx-line-sm"></div></div>
          <div class="vx-card"><div class="vx-thumb"></div><div class="vx-line"></div><div class="vx-line-sm"></div></div>
          <div class="vx-card"><div class="vx-thumb"></div><div class="vx-line"></div><div class="vx-line-sm"></div></div>
        </div>
      </div>`;
  }

  if (routePath === '/properties') {
    return `
      <div class="vx-wrap vx-main">
        <div class="vx-header-block">
          <div class="vx-pill-sm"></div>
          <div class="vx-title"></div>
          <div class="vx-sub"></div>
        </div>
        <div class="vx-box" style="margin-bottom:24px;">
          <div class="vx-shimmer-soft" style="height:42px;width:100%;border-radius:12px;margin-bottom:12px;"></div>
          <div style="display:flex;gap:8px;overflow:hidden;">
            <div class="vx-shimmer-soft" style="height:30px;width:80px;border-radius:999px;"></div>
            <div class="vx-shimmer-soft" style="height:30px;width:90px;border-radius:999px;"></div>
            <div class="vx-shimmer-soft" style="height:30px;width:84px;border-radius:999px;"></div>
            <div class="vx-shimmer-soft" style="height:30px;width:96px;border-radius:999px;"></div>
          </div>
        </div>
        <div class="vx-grid-3">
          ${Array.from({ length: 6 }).map(() => '<div class="vx-card"><div class="vx-thumb"></div><div class="vx-line"></div><div class="vx-line-sm"></div></div>').join('')}
        </div>
      </div>`;
  }

  if (routePath === '/builders') {
    return `
      <div class="vx-wrap vx-main">
        <div class="vx-header-block">
          <div class="vx-pill-sm"></div>
          <div class="vx-title"></div>
          <div class="vx-sub"></div>
        </div>
        <div class="vx-grid-2">
          ${Array.from({ length: 4 }).map(() => '<div class="vx-card" style="height:210px;"><div style="display:flex;gap:14px;align-items:center;"><div class="vx-shimmer" style="width:52px;height:52px;border-radius:14px;flex-shrink:0;"></div><div style="flex:1;"><div class="vx-line" style="margin-bottom:8px;"></div><div class="vx-line-sm"></div></div></div><div class="vx-shimmer-soft" style="height:34px;border-radius:10px;"></div></div>').join('')}
        </div>
      </div>`;
  }

  if (routePath === '/localities') {
    return `
      <div class="vx-wrap vx-main">
        <div class="vx-header-block">
          <div class="vx-pill-sm"></div>
          <div class="vx-title"></div>
          <div class="vx-sub"></div>
        </div>
        <div class="vx-grid-3">
          ${Array.from({ length: 6 }).map(() => '<div class="vx-card"><div class="vx-thumb"></div><div class="vx-line"></div><div class="vx-line-sm"></div></div>').join('')}
        </div>
      </div>`;
  }

  if (routePath.startsWith('/localities/')) {
    return `
      <div class="vx-wrap vx-main">
        <div style="display:flex;gap:8px;margin-bottom:20px;overflow:hidden;">
          ${Array.from({ length: 6 }).map(() => '<div class="vx-shimmer-soft" style="height:38px;width:105px;border-radius:12px;flex-shrink:0;"></div>').join('')}
        </div>
        <div class="vx-shimmer" style="height:230px;width:100%;border-radius:24px;margin-bottom:24px;"></div>
        <div class="vx-split-3">
          <div style="display:flex;flex-direction:column;gap:16px;">
            <div class="vx-grid-4">
              <div class="vx-kpi"></div><div class="vx-kpi"></div><div class="vx-kpi"></div><div class="vx-kpi"></div>
            </div>
            <div class="vx-shimmer-soft" style="height:240px;border-radius:20px;"></div>
          </div>
          <div class="vx-box" style="height:340px;"></div>
        </div>
      </div>`;
  }

  if (routePath === '/market') {
    return `
      <div class="vx-wrap vx-main">
        <div class="vx-header-block">
          <div class="vx-pill-sm"></div>
          <div class="vx-title"></div>
          <div class="vx-sub"></div>
        </div>
        <div class="vx-box" style="height:86px;margin-bottom:20px;"></div>
        <div class="vx-grid-4" style="margin-bottom:24px;">
          <div class="vx-kpi"></div><div class="vx-kpi"></div><div class="vx-kpi"></div><div class="vx-kpi"></div>
        </div>
        <div class="vx-grid-3">
          <div class="vx-card" style="height:260px;"></div>
          <div class="vx-card" style="height:260px;"></div>
          <div class="vx-card" style="height:260px;"></div>
        </div>
      </div>`;
  }

  if (routePath === '/comparison') {
    return `
      <div class="vx-wrap vx-main">
        <div class="vx-header-block">
          <div class="vx-pill-sm"></div>
          <div class="vx-title"></div>
          <div class="vx-sub"></div>
        </div>
        <div class="vx-box" style="height:92px;margin-bottom:24px;"></div>
        <div class="vx-box" style="height:360px;"></div>
      </div>`;
  }

  if (routePath === '/guides') {
    return `
      <div class="vx-wrap vx-main">
        <div class="vx-header-block">
          <div class="vx-pill-sm"></div>
          <div class="vx-title"></div>
          <div class="vx-sub"></div>
        </div>
        <div class="vx-box" style="height:210px;margin-bottom:24px;"></div>
        <div class="vx-grid-3">
          ${Array.from({ length: 6 }).map(() => '<div class="vx-card"><div class="vx-thumb"></div><div class="vx-line"></div><div class="vx-line-sm"></div></div>').join('')}
        </div>
      </div>`;
  }

  // Individual /guides/:slug or fallback
  return `
    <div class="vx-wrap vx-main">
      <div class="vx-header-block">
        <div class="vx-pill-sm"></div>
        <div class="vx-title" style="width:78%;"></div>
        <div class="vx-sub"></div>
      </div>
      <div class="vx-shimmer" style="height:240px;width:100%;border-radius:24px;margin-bottom:24px;"></div>
      <div class="vx-split-3">
        <div class="vx-box" style="height:320px;"></div>
        <div class="vx-box" style="height:260px;"></div>
      </div>
    </div>`;
}

function buildAppShellSkeleton(routePath = '/') {
  return `
    <style data-verixa-shell="true">
      :root {
        --vx-bg: #ffffff;
        --vx-fg: #0f172a;
        --vx-card: #ffffff;
        --vx-muted: #f1f5f9;
        --vx-shimmer: #e2e8f0;
        --vx-border: #e2e8f0;
        --vx-nav: rgba(255, 255, 255, 0.92);
        --vx-badge-bg: rgba(37, 99, 235, 0.1);
        --vx-badge-fg: #2563eb;
      }
      html.dark {
        --vx-bg: #020817;
        --vx-fg: #f8fafc;
        --vx-card: #0f172a;
        --vx-muted: #1e293b;
        --vx-shimmer: #1e293b;
        --vx-border: rgba(148, 163, 184, 0.16);
        --vx-nav: rgba(15, 23, 42, 0.92);
        --vx-badge-bg: rgba(59, 130, 246, 0.16);
        --vx-badge-fg: #60a5fa;
      }
      @keyframes verixaShimmer { 0%, 100% { opacity: .5; } 50% { opacity: .95; } }
      .vx-shell { min-height: 100vh; background: var(--vx-bg); color: var(--vx-fg); font-family: Inter, system-ui, -apple-system, sans-serif; padding-bottom: 64px; }
      .vx-nav { height: 56px; border-bottom: 1px solid var(--vx-border); background: var(--vx-nav); display: flex; align-items: center; }
      .vx-wrap { width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 16px; box-sizing: border-box; }
      .vx-nav-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
      .vx-brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 18px; letter-spacing: -0.02em; color: var(--vx-fg); }
      .vx-logo { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, #2563eb, #1d4ed8); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); font-size: 16px; font-weight: 900; color: #ffffff; }
      .vx-badge { display: none; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--vx-badge-fg); background: var(--vx-badge-bg); border: 1px solid var(--vx-border); padding: 3px 7px; border-radius: 6px; }
      .vx-pills { display: none; gap: 10px; }
      .vx-pill { width: 72px; height: 14px; border-radius: 999px; background: var(--vx-shimmer); animation: verixaShimmer 1.5s ease-in-out infinite; }
      .vx-main { padding: 24px 16px; }
      .vx-banner { height: 36px; background: linear-gradient(90deg, #2563eb, #4338ca); opacity: 0.85; }
      .vx-header-block { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
      .vx-pill-sm { width: 180px; height: 22px; border-radius: 999px; background: var(--vx-badge-bg); animation: verixaShimmer 1.5s ease-in-out infinite; }
      .vx-title { width: 340px; max-width: 90%; height: 32px; border-radius: 12px; background: var(--vx-shimmer); animation: verixaShimmer 1.5s ease-in-out infinite; }
      .vx-sub { width: 520px; max-width: 98%; height: 15px; border-radius: 8px; background: var(--vx-muted); animation: verixaShimmer 1.5s ease-in-out infinite; }
      .vx-shimmer { background: var(--vx-shimmer); animation: verixaShimmer 1.5s ease-in-out infinite; }
      .vx-shimmer-soft { background: var(--vx-muted); animation: verixaShimmer 1.5s ease-in-out infinite; }
      .vx-box { border-radius: 20px; border: 1px solid var(--vx-border); background: var(--vx-card); padding: 16px; }
      .vx-kpi { height: 96px; border-radius: 16px; border: 1px solid var(--vx-border); background: var(--vx-card); animation: verixaShimmer 1.5s ease-in-out infinite; }
      .vx-split-hero, .vx-split-3, .vx-grid-2, .vx-grid-3 { display: grid; grid-template-columns: 1fr; gap: 20px; }
      .vx-grid-4 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .vx-card { border-radius: 18px; border: 1px solid var(--vx-border); background: var(--vx-card); padding: 16px; height: 240px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; }
      .vx-thumb { width: 100%; height: 135px; border-radius: 12px; background: var(--vx-muted); animation: verixaShimmer 1.5s ease-in-out infinite; }
      .vx-line { width: 70%; height: 14px; border-radius: 6px; background: var(--vx-shimmer); animation: verixaShimmer 1.5s ease-in-out infinite; }
      .vx-line-sm { width: 45%; height: 12px; border-radius: 6px; background: var(--vx-muted); animation: verixaShimmer 1.5s ease-in-out infinite; }
      .vx-bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; height: 58px; border-top: 1px solid var(--vx-border); background: var(--vx-nav); display: grid; grid-template-columns: repeat(5, 1fr); align-items: center; justify-items: center; }
      .vx-bdot { width: 32px; height: 26px; border-radius: 8px; background: var(--vx-muted); animation: verixaShimmer 1.5s ease-in-out infinite; }
      @media (min-width: 768px) {
        .vx-nav { height: 64px; }
        .vx-pills { display: flex; }
        .vx-shell { padding-bottom: 0; }
        .vx-bottom-nav { display: none; }
        .vx-grid-2 { grid-template-columns: repeat(2, 1fr); }
        .vx-grid-3 { grid-template-columns: repeat(2, 1fr); }
        .vx-grid-4 { grid-template-columns: repeat(4, 1fr); gap: 16px; }
      }
      @media (min-width: 1024px) {
        .vx-badge { display: inline-block; }
        .vx-grid-3 { grid-template-columns: repeat(3, 1fr); }
        .vx-split-hero { grid-template-columns: 7fr 5fr; align-items: center; gap: 36px; }
        .vx-split-3 { grid-template-columns: 2fr 1fr; align-items: start; gap: 28px; }
      }
    </style>
    <div class="vx-shell" aria-busy="true">
      <div class="vx-nav">
        <div class="vx-wrap vx-nav-inner">
          <div class="vx-brand">
            <div class="vx-logo">V</div>
            <span>VERIXA</span>
            <span class="vx-badge">Decision Engine</span>
          </div>
          <div class="vx-pills">
            <div class="vx-pill"></div>
            <div class="vx-pill"></div>
            <div class="vx-pill"></div>
            <div class="vx-pill"></div>
            <div class="vx-pill"></div>
          </div>
        </div>
      </div>
      ${buildRouteSkeletonBody(routePath)}
      <div class="vx-bottom-nav">
        <div class="vx-bdot"></div><div class="vx-bdot"></div><div class="vx-bdot"></div><div class="vx-bdot"></div><div class="vx-bdot"></div>
      </div>
    </div>`;
}

function renderHtml(templateHtml, route) {
  const resolvedTitle = fullTitle(route.title);
  const canonicalUrl = `${SITE_URL}${route.routePath}`;
  const ogImage = route.ogImage || DEFAULT_OG_IMAGE;

  let html = templateHtml;

  // Replace title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(resolvedTitle)}</title>`);

  // Replace standard meta tags & canonical
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

  // Replace Open Graph tags
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

  // Replace Twitter tags
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

  // Remove any previously injected data-verixa-seo scripts & inject route JSON-LD scripts
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

  // Embed polished zero-FOUC theme-adaptive & route-matched app shell skeleton + SEO HTML
  const shellHtml = buildAppShellSkeleton(route.routePath);
  const seoSnapshotHtml = `<div class="sr-only" aria-hidden="false" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">${route.bodyHtml}</div>`;
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${shellHtml}${seoSnapshotHtml}</div>`);

  return html;
}

function main() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`dist/index.html not found at ${templatePath}`);
  }

  const baseTemplate = fs.readFileSync(templatePath, 'utf8');
  const routes = buildRoutes();

  for (const route of routes) {
    const outHtml = renderHtml(baseTemplate, route);
    const outPath =
      route.routePath === '/'
        ? templatePath
        : path.join(DIST_DIR, route.routePath.replace(/^\//, ''), 'index.html');

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, outHtml, 'utf8');
  }

  console.log(`[prerender-seo] Pre-rendered ${routes.length} static SEO routes into dist/`);
}

main();

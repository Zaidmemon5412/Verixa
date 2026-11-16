import { useEffect } from 'react';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '../utils/seoUtils';

/**
 * Zero-dependency React SEO head manager.
 * Dynamically updates document title, meta description, keywords, robots,
 * canonical URL, Open Graph, Twitter Cards, and JSON-LD structured data.
 */
export function SEOHead({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = 'website',
  keywords,
  noindex = false,
  schema = null,
}) {
  const schemaSerialized = schema ? JSON.stringify(schema) : '';

  useEffect(() => {
    const resolvedTitle = title
      ? title.includes(SITE_NAME)
        ? title
        : `${title} | ${SITE_NAME} – Verified Real Estate Intelligence`
      : `${SITE_NAME} – RERA Verified Properties, AI Price Valuation & Legal Title Audit in Ahmedabad`;

    document.title = resolvedTitle;

    const resolvedDescription =
      description ||
      "Buy RERA-verified apartments, villas, and plots in Ahmedabad with Verixa's AI Fair Price Valuation, Builder Delay Index, and Legal Title Verification.";

    const currentPath =
      canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const normalizedPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;
    const canonicalUrl = `${SITE_URL}${normalizedPath}`;
    const resolvedImage = ogImage || DEFAULT_OG_IMAGE;
    const robotsContent = noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1';

    const setMetaTag = (attrName, attrValue, content) => {
      if (content == null || content === '') return;
      let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', String(content));
    };

    const removeMetaTag = (attrName, attrValue) => {
      const element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (element) {
        element.remove();
      }
    };

    // Standard meta tags
    setMetaTag('name', 'description', resolvedDescription);
    setMetaTag('name', 'robots', robotsContent);
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    } else {
      removeMetaTag('name', 'keywords');
    }

    // Canonical URL
    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Open Graph meta tags
    setMetaTag('property', 'og:title', resolvedTitle);
    setMetaTag('property', 'og:description', resolvedDescription);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', resolvedImage);
    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:locale', 'en_IN');

    // Twitter Card meta tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', resolvedTitle);
    setMetaTag('name', 'twitter:description', resolvedDescription);
    setMetaTag('name', 'twitter:image', resolvedImage);

    // Clear previous JSON-LD scripts injected by SEOHead
    const removeExistingSchemas = () => {
      const existingScripts = document.head.querySelectorAll('script[data-verixa-seo="true"]');
      existingScripts.forEach((scriptNode) => scriptNode.remove());
    };

    removeExistingSchemas();

    if (schemaSerialized) {
      try {
        const parsed = JSON.parse(schemaSerialized);
        const schemaList = Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed].filter(Boolean);
        schemaList.forEach((schemaObj) => {
          const scriptEl = document.createElement('script');
          scriptEl.type = 'application/ld+json';
          scriptEl.setAttribute('data-verixa-seo', 'true');
          scriptEl.textContent = JSON.stringify(schemaObj);
          document.head.appendChild(scriptEl);
        });
      } catch (err) {
        // Ignore malformed schema serialization
      }
    }

    return () => {
      removeExistingSchemas();
    };
  }, [title, description, canonicalPath, ogImage, ogType, keywords, noindex, schemaSerialized]);

  return null;
}

export default SEOHead;

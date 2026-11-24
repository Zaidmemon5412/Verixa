const IMAGE_PRESETS = {
  card: {
    w: 640,
    h: 400,
    cld: 'f_auto,q_auto:good,c_fill,w_640,h_400',
  },
  hero: {
    w: 1200,
    h: 750,
    cld: 'f_auto,q_auto:good,c_fill,w_1200,h_750',
  },
  thumb: {
    w: 240,
    h: 160,
    cld: 'f_auto,q_auto:eco,c_fill,w_240,h_160',
  },
  logo: {
    w: 160,
    h: 160,
    cld: 'f_auto,q_auto:good,c_fit,w_160,h_160',
  },
};

/**
 * Rewrites Cloudinary & Unsplash URLs on the fly for automatic AVIF/WebP delivery,
 * adaptive compression, and exact viewport dimensions without altering source URLs in SEO schemas.
 */
export function optimizeImageUrl(url, preset = 'card') {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  const cfg = IMAGE_PRESETS[preset] || IMAGE_PRESETS.card;

  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/image/upload/')) {
    const marker = '/image/upload/';
    const idx = trimmed.indexOf(marker);
    const tail = trimmed.slice(idx + marker.length);
    if (!/(^|\/)(f_auto|q_auto|w_\d+)/.test(tail.split('/')[0] || '')) {
      return `${trimmed.slice(0, idx + marker.length)}${cfg.cld}/${tail}`;
    }
    return trimmed;
  }

  if (trimmed.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(trimmed);
      parsed.searchParams.set('w', String(cfg.w));
      parsed.searchParams.set('h', String(cfg.h));
      parsed.searchParams.set('q', '75');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('auto', 'format');
      return parsed.toString();
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

export default optimizeImageUrl;

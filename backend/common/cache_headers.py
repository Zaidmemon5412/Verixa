"""
Shared HTTP caching utilities for public CDN-cacheable API responses.
"""
import hashlib


def safe_cache_key(prefix: str, *parts) -> str:
    """Build a memcached-safe ASCII cache key by hashing arbitrary URL/query fragments."""
    raw = "|".join("" if p is None else str(p) for p in parts)
    digest = hashlib.md5(raw.encode("utf-8")).hexdigest()
    return f"{prefix}_{digest}"


def apply_public_edge_cache(
    response,
    *,
    max_age: int = 60,
    s_maxage: int = 300,
    swr: int = 86400,
    cache_status: str | None = None,
):
    """
    Configure Cache-Control / CDN-Cache-Control headers for Vercel Edge CDN caching
    and strip Vary: Cookie (which causes Vercel Edge `vary_key_denied` misses when
    DRF SessionAuthentication is active in DEFAULT_AUTHENTICATION_CLASSES).
    """
    response['Cache-Control'] = (
        f'public, max-age={max_age}, s-maxage={s_maxage}, stale-while-revalidate={swr}'
    )
    response['CDN-Cache-Control'] = (
        f'public, s-maxage={s_maxage}, stale-while-revalidate={swr}'
    )
    if cache_status:
        response['X-Cache-Status'] = cache_status

    vary_header = response.get('Vary')
    if vary_header:
        filtered_vary = [
            part.strip()
            for part in vary_header.split(',')
            if part.strip() and part.strip().lower() != 'cookie'
        ]
        if filtered_vary:
            response['Vary'] = ', '.join(filtered_vary)
        else:
            del response['Vary']

    return response

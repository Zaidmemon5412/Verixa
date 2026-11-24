import logging
import time
import uuid

logger = logging.getLogger(__name__)


class RequestLogMiddleware:
    """
    Production observability & security headers middleware:
    - Assigns or propagates an `X-Request-ID` correlation header on every request/response.
    - Attaches `X-Response-Time-Ms` performance header.
    - Attaches `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and
      `X-RateLimit-Scope` headers whenever DRF throttling evaluates the request.
    - Enforces enterprise HTTP security headers (`Permissions-Policy`, `X-Content-Type-Options`,
      `X-Frame-Options`, `Referrer-Policy`, `Content-Security-Policy`).
    - Emits structured access telemetry for downstream log aggregation.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.perf_counter()

        request_id = request.META.get('HTTP_X_REQUEST_ID') or uuid.uuid4().hex[:12]
        request.request_id = request_id

        response = self.get_response(request)

        duration_ms = (time.perf_counter() - start_time) * 1000.0
        response['X-Request-ID'] = request_id
        response['X-Response-Time-Ms'] = f"{duration_ms:.2f}"

        # Attach rate-limit headers if a DRF throttle evaluated the request
        rate_info = getattr(request, '_rate_limit_info', None)
        if rate_info:
            response['X-RateLimit-Limit'] = str(rate_info['limit'])
            response['X-RateLimit-Remaining'] = str(rate_info['remaining'])
            response['X-RateLimit-Reset'] = str(rate_info['reset'])
            response['X-RateLimit-Scope'] = str(rate_info['scope'])
            if response.status_code == 429 and not response.has_header('Retry-After'):
                response['Retry-After'] = str(rate_info['reset'])

        # Enforce defense-in-depth security headers
        if not response.has_header('X-Content-Type-Options'):
            response['X-Content-Type-Options'] = 'nosniff'
        if not response.has_header('X-Frame-Options'):
            response['X-Frame-Options'] = 'DENY'
        if not response.has_header('Referrer-Policy'):
            response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        if not response.has_header('Permissions-Policy'):
            response['Permissions-Policy'] = 'geolocation=(self), microphone=(), camera=(), payment=()'
        if not response.has_header('Cross-Origin-Opener-Policy'):
            response['Cross-Origin-Opener-Policy'] = 'same-origin'
        if request.path.startswith('/api/') and not response.has_header('Content-Security-Policy'):
            response['Content-Security-Policy'] = "default-src 'none'; frame-ancestors 'none'"

        logger.info(
            "request_id=%s method=%s path=%s status=%s duration_ms=%.2f",
            request_id,
            request.method,
            request.path,
            response.status_code,
            duration_ms,
        )

        return response


class EdgeCacheVaryMiddleware:
    """
    Strips `Cookie` from the `Vary` header on responses marked as publicly CDN-cacheable
    (`CDN-Cache-Control`) after Django's SessionMiddleware and CsrfViewMiddleware run on response exit.
    Prevents Vercel Edge CDN `vary_key_denied` misses while keeping private/authenticated responses untouched.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if response.has_header('CDN-Cache-Control') and response.has_header('Vary'):
            filtered_vary = [
                part.strip()
                for part in response['Vary'].split(',')
                if part.strip() and part.strip().lower() != 'cookie'
            ]
            if filtered_vary:
                response['Vary'] = ', '.join(filtered_vary)
            else:
                del response['Vary']
        return response

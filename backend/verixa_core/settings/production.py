from django.core.exceptions import ImproperlyConfigured
from .base import *  # noqa: F403, F401

DEBUG = False

# ------------------------------------------------------------------------------
# Secret Key & Host Validation (Fail-Fast in Production)
# ------------------------------------------------------------------------------
if (
    not SECRET_KEY  # noqa: F405
    or SECRET_KEY == 'fallback-insecure-key-1234'  # noqa: F405
    or SECRET_KEY.startswith('django-insecure-')  # noqa: F405
):
    raise ImproperlyConfigured(
        "Production deployment blocked: DJANGO_SECRET_KEY must be set to a strong, "
        "non-default cryptographic secret in the environment."
    )

ALLOWED_HOSTS = env.list(  # noqa: F405
    'DJANGO_ALLOWED_HOSTS',
    default=['.onrender.com', 'localhost', '127.0.0.1'],
)
if not ALLOWED_HOSTS or '*' in ALLOWED_HOSTS:
    raise ImproperlyConfigured(
        "Production deployment blocked: DJANGO_ALLOWED_HOSTS must be explicitly "
        "configured with production domain names and cannot contain '*'."
    )

# ------------------------------------------------------------------------------
# CORS & CSRF Domain Locking
# ------------------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = False
_default_frontend_origins = [
    'https://verixa-phi.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
CORS_ALLOWED_ORIGINS = list(
    set(_default_frontend_origins + env.list('DJANGO_CORS_ALLOWED_ORIGINS', default=[]))  # noqa: F405
)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
    r"^https://.*\.onrender\.com$",
    r"^https://.*\.netlify\.app$",
]
CSRF_TRUSTED_ORIGINS = list(
    set(
        [
            'https://verixa-phi.vercel.app',
            'https://*.vercel.app',
            'https://*.onrender.com',
            'https://*.netlify.app',
        ]
        + env.list('DJANGO_CSRF_TRUSTED_ORIGINS', default=[])  # noqa: F405
    )
)

# ------------------------------------------------------------------------------
# Reverse Proxy, TLS/HTTPS & Cookie Hardening
# ------------------------------------------------------------------------------
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

# Default False inside container because Render/Nginx edge handles HTTPS redirect
# and internal HTTP healthchecks hit localhost over plain HTTP
SECURE_SSL_REDIRECT = env.bool('DJANGO_SECURE_SSL_REDIRECT', default=False)  # noqa: F405

SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'

SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
X_FRAME_OPTIONS = 'DENY'

# ------------------------------------------------------------------------------
# Database Connection Persistence & Health Checks
# ------------------------------------------------------------------------------
DATABASES['default']['CONN_MAX_AGE'] = env.int('CONN_MAX_AGE', default=60)  # noqa: F405
DATABASES['default']['CONN_HEALTH_CHECKS'] = True  # noqa: F405

# ------------------------------------------------------------------------------
# Distributed Redis Cache (Shared Rate-Limiting & Caching Across Workers)
# Falls back to process-shared FileBasedCache on multi-worker containers if REDIS_URL is not set
# ------------------------------------------------------------------------------
import tempfile

if REDIS_URL and 'localhost' not in REDIS_URL and '127.0.0.1' not in REDIS_URL:  # noqa: F405
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': REDIS_URL,  # noqa: F405
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
            'LOCATION': os.path.join(tempfile.gettempdir(), 'verixa_shared_cache'),  # noqa: F405
            'TIMEOUT': 300,
            'OPTIONS': {
                'MAX_ENTRIES': 10000,
                'CULL_FREQUENCY': 4,
            },
        }
    }

# ------------------------------------------------------------------------------
# Production Structured JSON Logging Configuration
# ------------------------------------------------------------------------------
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'common.logging_formatters.StructuredJsonFormatter',
        },
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': env.str('DJANGO_LOG_LEVEL', default='INFO'),  # noqa: F405
    },
    'loggers': {
        'django.security': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'common.throttling': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'common.middleware': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

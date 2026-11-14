from .base import *  # noqa: F403, F401

DEBUG = env.bool('DJANGO_DEBUG', default=True)  # noqa: F405

# Explicit local hosts instead of wildcard '*'
ALLOWED_HOSTS = env.list(  # noqa: F405
    'DJANGO_ALLOWED_HOSTS',
    default=['localhost', '127.0.0.1', '0.0.0.0', 'testserver'],
)

# Restrict CORS to local frontend dev servers by default
CORS_ALLOW_ALL_ORIGINS = env.bool('DJANGO_CORS_ALLOW_ALL', default=False)  # noqa: F405
CORS_ALLOWED_ORIGINS = env.list(  # noqa: F405
    'DJANGO_CORS_ALLOWED_ORIGINS',
    default=[
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
)
CSRF_TRUSTED_ORIGINS = env.list(  # noqa: F405
    'DJANGO_CSRF_TRUSTED_ORIGINS',
    default=[
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
)

# Optionally use Redis cache in local Docker dev if USE_REDIS_CACHE=True
if env.bool('USE_REDIS_CACHE', default=False):  # noqa: F405
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': REDIS_URL,  # noqa: F405
        }
    }

# Email settings: dynamically use EMAIL_BACKEND from .env/base.py
EMAIL_BACKEND = env.str(  # noqa: F405
    'EMAIL_BACKEND',
    default='django.core.mail.backends.smtp.EmailBackend',
)

# Use isolated in-memory SQLite during automated test runs so tests never touch live cloud DBs
import sys
if any(arg in sys.argv[0].lower() or arg in [a.lower() for a in sys.argv] for arg in ('pytest', 'test')):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
    EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

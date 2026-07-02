from .base import *  # noqa: F403, F401

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

CORS_ALLOW_ALL_ORIGINS = True  # Convenient for local multi-container dev

# Email settings for development (output to console)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

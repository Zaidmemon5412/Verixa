from .base import *  # noqa: F403, F401

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

CORS_ALLOW_ALL_ORIGINS = True  # Convenient for local multi-container dev

# Email settings: dynamically use EMAIL_BACKEND from .env/base.py
EMAIL_BACKEND = env.str('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')


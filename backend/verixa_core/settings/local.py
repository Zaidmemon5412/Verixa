from .base import *  # noqa: F403, F401

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

CORS_ALLOW_ALL_ORIGINS = True  # Convenient for local multi-container dev

# Email settings: Automatically use SMTP if valid host & user configured, else console fallback
if EMAIL_HOST and EMAIL_HOST_USER and EMAIL_HOST_USER != 'your_email@gmail.com':
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
else:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

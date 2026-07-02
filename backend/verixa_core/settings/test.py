from .base import *  # noqa: F403, F401

DEBUG = False

# Use fast MD5 hashing for testing speeds
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Use local test database overrides if required
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Silence emails
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Turn off caching operations in test environment
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

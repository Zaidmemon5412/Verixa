import os
from datetime import timedelta
from pathlib import Path
import environ

# Initialize environment parser
env = environ.Env()

# Build paths inside the project like this: BASE_DIR / 'subdir'
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Read .env file if it exists at root level
environ.Env.read_env(os.path.join(BASE_DIR.parent, '.env'))

SECRET_KEY = env.str('DJANGO_SECRET_KEY', default='fallback-insecure-key-1234')

DEBUG = env.bool('DJANGO_DEBUG', default=False)

ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party Packages
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'drf_spectacular',

    # Verixa Local Apps
    'apps.core.apps.CoreConfig',
    'apps.accounts.apps.AccountsConfig',
    'apps.properties.apps.PropertiesConfig',
    'apps.builders.apps.BuildersConfig',
    'apps.locations.apps.LocationsConfig',
    'apps.comparison.apps.ComparisonConfig',
    'apps.reports.apps.ReportsConfig',
    'apps.inquiries.apps.InquiriesConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Put near top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'common.middleware.RequestLogMiddleware',
]

ROOT_URLCONF = 'verixa_core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Database Config - defaults to Postgres inside Docker if not overridden
DB_CONN_STR = (
    f"postgres://{env.str('DB_USER', 'verixa_user')}:"
    f"{env.str('DB_PASSWORD', 'verixa_secure_password')}@"
    f"{env.str('DB_HOST', 'localhost')}:{env.int('DB_PORT', 5432)}/"
    f"{env.str('DB_NAME', 'verixa_db')}"
)
DATABASES = {
    'default': env.db('DATABASE_URL', default=DB_CONN_STR)
}

# Custom User Auth settings
AUTH_USER_MODEL = 'accounts.User'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = 'media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'common.throttling.AnonSustainedRateThrottle',
        'common.throttling.UserSustainedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': env.str('THROTTLE_RATE_ANON', default='120/min'),
        'user': env.str('THROTTLE_RATE_USER', default='300/min'),
        'auth': env.str('THROTTLE_RATE_AUTH', default='10/min'),
        'password_reset': env.str('THROTTLE_RATE_PASSWORD_RESET', default='5/hour'),
        'ai_advisor': env.str('THROTTLE_RATE_AI_ADVISOR', default='15/min'),
        'write_action': env.str('THROTTLE_RATE_WRITE_ACTION', default='20/min'),
    },
    'EXCEPTION_HANDLER': 'common.exceptions.custom_exception_handler',
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Cache Configuration (Overridden by Redis in production.py)
REDIS_URL = env.str('REDIS_URL', default='redis://localhost:6379/0')
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'verixa-local-cache',
    }
}

# Request & File Upload Abuse Protection Limits (10 MB default)
DATA_UPLOAD_MAX_MEMORY_SIZE = env.int('DATA_UPLOAD_MAX_MEMORY_SIZE', default=10 * 1024 * 1024)
FILE_UPLOAD_MAX_MEMORY_SIZE = env.int('FILE_UPLOAD_MAX_MEMORY_SIZE', default=10 * 1024 * 1024)
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000

# Simple JWT Authentication configuration
SIMPLE_JWT = {
    # Token lifespan settings
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),

    # Token rotation configuration (revokes old token and issues a new one)
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,

    # Syncs user last login column on auth success
    'UPDATE_LAST_LOGIN': True,

    # Cryptographic keys and signature algorithm
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,

    # HTTP Header name and type
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',

    # Custom identifier claim referencing primary key field 'user_id'
    'USER_ID_FIELD': 'user_id',
    'USER_ID_CLAIM': 'user_id',

    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',

    'JTI_CLAIM': 'jti',
}

# Swagger Settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'Verixa API Docs',
    'DESCRIPTION': 'Intelligent Property Decision & Verification Platform Core Backend Engine',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# Celery Configurations (Hardened for reliable background processing)
CELERY_BROKER_URL = env.str('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = env.str('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_ACKS_LATE = True
CELERY_TASK_REJECT_ON_WORKER_LOST = True
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_TASK_SOFT_TIME_LIMIT = env.int('CELERY_TASK_SOFT_TIME_LIMIT', default=240)
CELERY_TASK_TIME_LIMIT = env.int('CELERY_TASK_TIME_LIMIT', default=300)
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True

# OCR Path Setting
TESSERACT_CMD_PATH = env.str('TESSERACT_CMD_PATH', default='/usr/bin/tesseract')

# Supported locations configuration
SUPPORTED_CITIES = env.list('SUPPORTED_CITIES', default=['Ahmedabad'])
SUPPORTED_STATES = env.list('SUPPORTED_STATES', default=['Gujarat'])

# Email Configuration (Reads from .env file)
EMAIL_BACKEND = env.str('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = env.str('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER = env.str('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env.str('EMAIL_HOST_PASSWORD', default='').replace(' ', '')
DEFAULT_FROM_EMAIL = env.str('DEFAULT_FROM_EMAIL', default='Verixa Support <noreply@verixa.com>')
FRONTEND_URL = env.str('FRONTEND_URL', default='http://localhost:5173')


# Cloudinary Configurations
CLOUDINARY_CLOUD_NAME = env.str('CLOUDINARY_CLOUD_NAME', default='')
CLOUDINARY_API_KEY = env.str('CLOUDINARY_API_KEY', default='')
CLOUDINARY_API_SECRET = env.str('CLOUDINARY_API_SECRET', default='')

# Google Gemini LLM API Configuration
GEMINI_API_KEY = env.str('GEMINI_API_KEY', default='')




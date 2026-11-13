import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'verixa_core.settings.production')

application = get_asgi_application()

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Accounts authentication and profiles endpoints
    path('api/accounts/', include('apps.accounts.urls')),

    # Builders endpoints
    path('api/builders/', include('apps.builders.urls')),

    # Comparison endpoints
    path('api/comparisons/', include('apps.comparison.urls')),

    # Enquiries endpoints
    path('api/enquiries/', include('apps.inquiries.urls')),

    # Reports endpoints
    path('api/reports/', include('apps.reports.urls')),

    # Properties endpoints (amenities, property-amenities, images, documents)
    path('api/', include('apps.properties.urls')),

    # Locations endpoints (localities, nearby-places)
    path('api/locations/', include('apps.locations.urls')),
    path('api/', include('apps.locations.urls')),
    # API Documentation (drf-spectacular)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]


# Static & Media routing in local environment
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

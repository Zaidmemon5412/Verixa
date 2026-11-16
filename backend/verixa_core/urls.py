from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from apps.core.views import HealthCheckAPIView, SitemapXMLView


def api_root_view(request):
    return JsonResponse({
        "success": True,
        "service": "Verixa Intelligent Property Decision & Verification API",
        "status": "online",
        "endpoints": {
            "health": "/api/health/",
            "properties": "/api/properties/",
            "builders": "/api/builders/",
            "localities": "/api/locations/localities/",
            "market_trends": "/api/properties/market-trends/",
            "swagger_docs": "/api/schema/swagger-ui/",
        },
    })


urlpatterns = [
    path('', api_root_view, name='api-root'),
    path('sitemap.xml', SitemapXMLView.as_view(), name='sitemap-xml'),
    path('api/sitemap.xml', SitemapXMLView.as_view(), name='api-sitemap-xml'),
    path('admin/', admin.site.urls),

    # Infrastructure Liveness & Readiness Probe
    path('api/health/', HealthCheckAPIView.as_view(), name='health-check'),

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
    path('api/', include('apps.locations.urls', namespace='locations-root')),
    # API Documentation (drf-spectacular)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]


# Static & Media routing in local environment
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

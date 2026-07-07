"""
URL Routing for the properties app.
Maps endpoints for Amenity and PropertyAmenity resources.
"""
from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import AmenityViewSet, PropertyAmenityViewSet

app_name = 'properties'

router = SimpleRouter()
router.register(r'amenities', AmenityViewSet, basename='amenity')
router.register(r'property-amenities', PropertyAmenityViewSet, basename='property-amenity')

urlpatterns = [
    path('', include(router.urls)),
]

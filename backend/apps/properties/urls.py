"""
URL Routing for the properties app.
Maps endpoints for Amenity, PropertyAmenity, PropertyImage, and PropertyDocument resources.
"""
from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    AmenityViewSet,
    PropertyAmenityViewSet,
    PropertyViewSet,
    PropertyListingViewSet,
    PropertyLegalViewSet,
    PropertyImageListCreateView,
    PropertyImageDetailView,
    PropertyImageSetPrimaryView,
    PropertyImageReorderView,
    PropertyDocumentListCreateView,
    PropertyDocumentDetailView,
)

app_name = 'properties'

router = SimpleRouter()
router.register(r'amenities', AmenityViewSet, basename='amenity')
router.register(r'property-amenities', PropertyAmenityViewSet, basename='property-amenity')
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'property-listings', PropertyListingViewSet, basename='property-listing')
router.register(r'property-legals', PropertyLegalViewSet, basename='property-legal')

urlpatterns = [
    path('', include(router.urls)),

    # Property Images Endpoints
    path('properties/<uuid:property_id>/images/', PropertyImageListCreateView.as_view(), name='property-image-list-create'),
    path('properties/images/<uuid:image_id>/', PropertyImageDetailView.as_view(), name='property-image-detail'),
    path('properties/images/<uuid:image_id>/set-primary/', PropertyImageSetPrimaryView.as_view(), name='property-image-set-primary'),
    path('properties/<uuid:property_id>/images/reorder/', PropertyImageReorderView.as_view(), name='property-image-reorder'),

    # Property Documents Endpoints
    path('properties/<uuid:property_id>/documents/', PropertyDocumentListCreateView.as_view(), name='property-document-list-create'),
    path('properties/documents/<uuid:doc_id>/', PropertyDocumentDetailView.as_view(), name='property-document-detail'),
]

from django.urls import path
from .views import (
    PropertyImageListCreateView,
    PropertyImageDetailView,
    PropertyImageSetPrimaryView,
    PropertyImageReorderView,
    PropertyDocumentListCreateView,
    PropertyDocumentDetailView,
)

urlpatterns = [
    # Property Images Endpoints
    path('properties/<uuid:property_id>/images/', PropertyImageListCreateView.as_view(), name='property-image-list-create'),
    path('properties/images/<uuid:image_id>/', PropertyImageDetailView.as_view(), name='property-image-detail'),
    path('properties/images/<uuid:image_id>/set-primary/', PropertyImageSetPrimaryView.as_view(), name='property-image-set-primary'),
    path('properties/<uuid:property_id>/images/reorder/', PropertyImageReorderView.as_view(), name='property-image-reorder'),

    # Property Documents Endpoints
    path('properties/<uuid:property_id>/documents/', PropertyDocumentListCreateView.as_view(), name='property-document-list-create'),
    path('properties/documents/<uuid:doc_id>/', PropertyDocumentDetailView.as_view(), name='property-document-detail'),
]

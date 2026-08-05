"""
URL Routing for the locations app.
Maps endpoints for Locality and NearbyPlace resources to REST views.
"""
from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import LocalityViewSet, NearbyPlaceViewSet, GlobalNearbyPlacesAPIView

app_name = 'locations'

router = SimpleRouter()
router.register(r'localities', LocalityViewSet, basename='locality')
router.register(r'nearby-places', NearbyPlaceViewSet, basename='nearby-place')

urlpatterns = [
    path('nearby/', GlobalNearbyPlacesAPIView.as_view(), name='global-nearby-places'),
    path('', include(router.urls)),
]

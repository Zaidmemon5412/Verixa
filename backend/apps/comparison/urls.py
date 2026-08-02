"""
URL routing for the Comparison app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComparisonSessionViewSet

app_name = 'comparison'

router = DefaultRouter()
router.register(r'', ComparisonSessionViewSet, basename='comparison-session')

urlpatterns = [
    path('', include(router.urls)),
]

"""
URL Routing for the builders app.
Maps endpoints for builder resources to REST views.
"""
from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    BuilderViewSet,
    BuilderProjectViewSet,
    BuilderProjectImageViewSet,
)

app_name = 'builders'

router = SimpleRouter()
router.register(r'projects', BuilderProjectViewSet, basename='builder-project')
router.register(r'project-images', BuilderProjectImageViewSet, basename='builder-project-image')
router.register(r'', BuilderViewSet, basename='builder')

urlpatterns = [
    path('', include(router.urls)),
]


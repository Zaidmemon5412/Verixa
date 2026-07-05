"""
URL Routing for the accounts app.
Configures URL patterns to map requests to the correct views.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, GoogleOAuthView

app_name = 'accounts'

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Router views (list, detail, creation, update, delete for Users)
    path('', include(router.urls)),

    # Google OAuth endpoint
    path('auth/google/', GoogleOAuthView.as_view(), name='google-oauth'),
]

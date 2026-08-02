"""
URL Routing for the accounts app.
Maps accounts authentication, profile, verification, and saved properties endpoints to REST views.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    ChangePasswordView,
    GoogleOAuthView,
)
from .saved_properties_views import SavedPropertyViewSet

app_name = 'accounts'

router = DefaultRouter()
router.register(r'saved-properties', SavedPropertyViewSet, basename='saved-property')

urlpatterns = [
    # Core Authentication Routes
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Profile Management Routes (GET and PUT)
    path('profile/', ProfileView.as_view(), name='profile'),

    # Security Settings Routes
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),

    # Simple JWT Token verification routes
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token-verify'),

    # Third Party OAuth Routes
    path('auth/google/', GoogleOAuthView.as_view(), name='google-oauth'),

    # Router Endpoints (Saved Properties)
    path('', include(router.urls)),
]

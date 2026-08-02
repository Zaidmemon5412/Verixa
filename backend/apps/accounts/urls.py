"""
URL Routing for the accounts app.
Maps accounts authentication, profile, verification, saved properties, and password reset endpoints to REST views.
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
from .password_reset_views import (
    ForgotPasswordView,
    VerifyResetTokenView,
    ResetPasswordView,
)

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

    # Password Reset Flow Routes
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/verify/', VerifyResetTokenView.as_view(), name='reset-password-verify'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),

    # Simple JWT Token verification routes
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token-verify'),

    # Third Party OAuth Routes
    path('auth/google/', GoogleOAuthView.as_view(), name='google-oauth'),

    # Router Endpoints (Saved Properties)
    path('', include(router.urls)),
]

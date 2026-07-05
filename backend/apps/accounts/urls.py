"""
URL Routing for the accounts app.
Maps accounts authentication, profile, and verification endpoints to REST views.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    ChangePasswordView,
    GoogleOAuthView,
)

app_name = 'accounts'

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
]

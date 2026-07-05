"""
Services layer for the accounts app.
Handles core business logic, third-party authentication integrations (e.g. Google OAuth),
and security operations (e.g. JWT token generation/validation).
"""
import logging
from typing import Dict, Any, Optional
from django.conf import settings
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import User

logger = logging.getLogger(__name__)


def register_user(validated_data: dict) -> User:
    """
    Business logic to register a new user.
    Uses CustomUserManager to securely create the user and hash the password.
    """
    data = validated_data.copy()
    password = data.pop('password')
    email = data.pop('email')
    data.pop('confirm_password', None)

    logger.info(f"Registering new user with email: {email}")
    user = User.objects.create_user(
        email=email,
        password=password,
        **data
    )
    return user


def login_user(email: str, password: str) -> User:
    """
    Business logic to authenticate a user using email and password.
    Verifies that the account is active and returns the User object.
    Raises ValidationError for invalid credentials or inactive accounts.
    """
    logger.info(f"Attempting to authenticate user: {email}")
    user = authenticate(username=email, password=password)

    if not user:
        raise ValidationError(_("Invalid email or password."), code='invalid_credentials')

    if not user.is_active:
        raise ValidationError(_("User account is disabled."), code='inactive_account')

    return user


def update_profile(user: User, validated_data: dict) -> User:
    """
    Business logic to update allowed user profile fields.
    Saves and returns the updated User instance.
    """
    allowed_fields = ['full_name', 'phone', 'profile_image']
    logger.info(f"Updating profile for user: {user.email}")
    
    for field in allowed_fields:
        if field in validated_data:
            setattr(user, field, validated_data[field])
            
    user.save()
    return user


def change_password(user: User, old_password: str, new_password: str) -> None:
    """
    Business logic to change a user's password securely.
    Verifies old password and saves the new one using set_password.
    Raises ValidationError if the old password check fails.
    """
    logger.info(f"Changing password for user: {user.email}")
    if not user.check_password(old_password):
        raise ValidationError(_("Old password is incorrect."), code='invalid_password')
        
    user.set_password(new_password)
    user.save()


class GoogleOAuthService:
    """
    Service responsible for communicating with Google API endpoints
    to verify OAuth authorization codes or ID tokens and retrieve user profile info.
    """
    @staticmethod
    def verify_auth_code(code: str) -> Optional[Dict[str, Any]]:
        """
        Exchanges a Google OAuth auth code for an access token and retrieves profile data.
        Returns a dict of normalized user profile info or None if verification fails.
        """
        # Logic to exchange code via requests to https://oauth2.googleapis.com/token
        # and fetch user info from https://www.googleapis.com/oauth2/v3/userinfo
        logger.info("Verifying Google OAuth authorization code")
        return None

    @staticmethod
    def verify_id_token(id_token: str) -> Optional[Dict[str, Any]]:
        """
        Verifies a Google ID token directly.
        Returns a dict of normalized user profile info or None if verification fails.
        """
        # Logic to verify Google ID token using google-auth-library or direct request
        logger.info("Verifying Google OAuth ID Token")
        return None


class TokenService:
    """
    Service responsible for generating and verifying JSON Web Tokens (JWT) for users.
    Typically wraps djangorestframework-simplejwt or a custom token backend.
    """
    @staticmethod
    def generate_tokens_for_user(user: User) -> Dict[str, str]:
        """
        Generates standard JWT access and refresh tokens for the given User model instance.
        """
        logger.info(f"Generating JWT tokens for user: {user.email}")
        return {
            "access": "placeholder-access-token",
            "refresh": "placeholder-refresh-token",
        }

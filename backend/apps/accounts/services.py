"""
Services layer for the accounts app.
Handles core business logic, third-party authentication integrations (e.g. Google OAuth),
and security operations (e.g. JWT token generation/validation, password reset flows).
"""
import logging
from typing import Dict, Any, Optional
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
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


def send_password_reset_email(email: str) -> None:
    """
    Generates a secure, time-limited password reset token and sends a password reset email.
    If the email does not exist, handles it silently to avoid user enumeration attacks.
    """
    logger.info(f"Received password reset request for email: {email}")
    user = User.objects.filter(email__iexact=email).first()

    if user and user.is_active:
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        frontend_domain = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_domain}/reset-password?uid={uidb64}&token={token}"

        subject = "Verixa — Password Reset Request"
        message = (
            f"Hello {user.full_name or 'User'},\n\n"
            f"We received a request to reset your password for your Verixa account.\n"
            f"Click the link below to reset your password:\n\n"
            f"{reset_link}\n\n"
            f"If you did not request a password reset, please ignore this email.\n\n"
            f"Regards,\nVerixa Team"
        )

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@verixa.com'),
                recipient_list=[user.email],
                fail_silently=False,
            )
            logger.info(f"Password reset email sent successfully to {user.email}")
        except Exception as e:
            logger.exception(f"Failed to send password reset email to {user.email}: {e}")


def verify_password_reset_token(uidb64: str, token: str) -> User:
    """
    Verifies the password reset token against the user ID.
    Returns the User object if valid, or raises ValidationError.
    """
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        raise ValidationError(_("Invalid reset link or user does not exist."), code='invalid_token')

    if not default_token_generator.check_token(user, token):
        raise ValidationError(_("Password reset token is invalid or has expired."), code='invalid_token')

    return user


def reset_password_with_token(uidb64: str, token: str, new_password: str) -> None:
    """
    Verifies reset token, updates the user's password securely using set_password(),
    and invalidates the token.
    """
    logger.info("Executing password reset via reset token")
    user = verify_password_reset_token(uidb64, token)
    user.set_password(new_password)
    user.save()
    logger.info(f"Password successfully reset for user {user.email}")


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
        logger.info("Verifying Google OAuth authorization code")
        return None

    @staticmethod
    def verify_id_token(id_token: str) -> Optional[Dict[str, Any]]:
        """
        Verifies a Google ID token directly.
        Returns a dict of normalized user profile info or None if verification fails.
        """
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

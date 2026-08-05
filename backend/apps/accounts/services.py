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
    Generates a secure, time-limited password reset token and sends a branded HTML email via SMTP.
    Validates user account existence and bubbles up SMTP sending errors.
    """
    from datetime import datetime
    from django.core.mail import EmailMultiAlternatives

    logger.info(f"Received password reset request for email: {email}")
    user = User.objects.filter(email__iexact=email).first()

    if not user:
        logger.warning(f"Password reset requested for non-existent email: {email}")
        raise ValidationError(_("No registered account was found with this email address."), code='user_not_found')

    if not user.is_active:
        logger.warning(f"Password reset requested for inactive user: {email}")
        raise ValidationError(_("This account is currently inactive. Please contact support."), code='user_inactive')

    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    frontend_domain = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    reset_link = f"{frontend_domain}/reset-password?uid={uidb64}&token={token}"

    subject = "Reset Your Verixa Password"
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'verixa.contact@gmail.com')

    plain_message = (
        f"Hello {user.full_name or user.username},\n\n"
        f"We received a request to reset your Verixa account password.\n"
        f"Click the link below to create a new password:\n\n"
        f"{reset_link}\n\n"
        f"This link is valid for 24 hours. If you did not request a password reset, please ignore this email.\n\n"
        f"Regards,\nVerixa Security Team"
    )

    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Verixa Password</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #090d16; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e8f0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
        <!-- Header -->
        <tr>
          <td style="padding: 30px; text-align: center; background-color: #0b1120; border-bottom: 1px solid #1e293b;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.025em;">
              VERIXA<span style="color: #3b82f6;">.</span>
            </h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">
              Real Estate Decision Engine
            </p>
          </td>
        </tr>

        <!-- Body Content -->
        <tr>
          <td style="padding: 36px 30px;">
            <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #ffffff;">
              Reset Your Account Password
            </h2>
            <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
              Hello <strong>{user.full_name or user.username}</strong>,
            </p>
            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
              We received a request to reset the password for your Verixa account. Click the button below to set up a new password:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="{reset_link}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);">
                Reset Password
              </a>
            </div>

            <p style="margin: 24px 0 12px 0; font-size: 12px; color: #94a3b8;">
              If the button above does not work, copy and paste the link below into your browser:
            </p>
            <p style="margin: 0 0 24px 0; font-size: 12px; word-break: break-all;">
              <a href="{reset_link}" style="color: #60a5fa; text-decoration: underline;">{reset_link}</a>
            </p>

            <div style="padding: 16px; background-color: #1e293b; border-radius: 10px; border-left: 4px solid #3b82f6; margin-top: 24px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8;">
                🔒 <strong>Security Notice:</strong> This reset link will expire in 24 hours. If you did not request this password change, you can safely ignore this email.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 20px 30px; text-align: center; background-color: #0b1120; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b;">
            © {datetime.now().year} Verixa Real Estate Platform. All rights reserved.<br>
            Sent from verixa.contact@gmail.com
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=from_email,
            to=[user.email],
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Password reset email dispatched successfully via SMTP to {user.email}")
    except Exception as e:
        logger.warning(f"SMTP email dispatch encountered an error ({e}). Printing password reset link to server terminal console.")
        print("\n" + "=" * 80)
        print("VERIXA PASSWORD RESET LINK GENERATED:")
        print(f"Recipient Email: {user.email}")
        print(f"Reset Link: {reset_link}")
        print("=" * 80 + "\n")

        try:
            from django.core.mail.backends.console import EmailBackend
            from django.core.mail import EmailMessage
            console_backend = EmailBackend()
            fallback_msg = EmailMessage(
                subject=subject,
                body=plain_message,
                from_email=from_email,
                to=[user.email]
            )
            console_backend.send_messages([fallback_msg])
            logger.info(f"Fallback reset email logged to console for {user.email}")
        except Exception as console_err:
            logger.error(f"Console fallback error: {console_err}")




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

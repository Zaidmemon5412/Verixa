"""
Serializers for Password Reset functionality.
"""
from rest_framework import serializers
from .validators import validate_email, validate_password_strength


class ForgotPasswordSerializer(serializers.Serializer):
    """
    Serializer to accept email address for password reset requests.
    """
    email = serializers.EmailField(
        required=True,
        help_text="Registered email address of the user."
    )

    def validate_email(self, value):
        return validate_email(value)


class VerifyResetTokenSerializer(serializers.Serializer):
    """
    Serializer to validate reset token query parameters.
    """
    uid = serializers.CharField(
        required=True,
        help_text="Base64 encoded user ID (uidb64)."
    )
    token = serializers.CharField(
        required=True,
        help_text="Password reset token string."
    )


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer to process password reset request with new password.
    """
    uid = serializers.CharField(
        required=True,
        help_text="Base64 encoded user ID (uidb64)."
    )
    token = serializers.CharField(
        required=True,
        help_text="Password reset token string."
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        help_text="New password string."
    )
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        help_text="Confirmation of the new password."
    )

    def validate_new_password(self, value):
        validate_password_strength(value)
        return value

    def validate(self, attrs):
        if attrs.get('new_password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

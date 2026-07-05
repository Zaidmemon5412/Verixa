"""
Serializers for the accounts app.
Defines serializers for registration, login, user presentation,
profile updates, and password changes.
"""
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User
from .validators import (
    validate_email,
    validate_password_strength,
    validate_full_name,
    validate_phone_number,
)


class UserSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for presenting user metadata.
    Never exposes passwords.
    """
    class Meta:
        model = User
        fields = [
            'user_id',
            'full_name',
            'username',
            'email',
            'phone',
            'role',
            'profile_image',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer handling user registration workflow.
    Validates name, phone, email, and password, ensuring safety and integrity constraints.
    """
    confirm_password = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'full_name',
            'username',
            'email',
            'phone',
            'password',
            'confirm_password',
        ]

    def validate_full_name(self, value: str) -> str:
        try:
            return validate_full_name(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_email(self, value: str) -> str:
        try:
            normalized_email = validate_email(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

        if User.objects.filter(email=normalized_email).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return normalized_email

    def validate_username(self, value: str) -> str:
        if not value:
            raise serializers.ValidationError("Username is required.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_phone(self, value: str) -> str:
        if not value:
            return value
        try:
            normalized_phone = validate_phone_number(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

        if User.objects.filter(phone=normalized_phone).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return normalized_phone

    def validate(self, data: dict) -> dict:
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        # Validate password strength parameters
        try:
            validate_password_strength(password)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})

        # Match check
        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        return data

    def create(self, validated_data: dict) -> User:
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        email = validated_data.pop('email')

        # create user using model manager
        user = User.objects.create_user(
            email=email,
            password=password,
            **validated_data
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer verifying user login credentials and returning the authenticated user.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs: dict) -> dict:
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")

        # Authenticate via default backend (USERNAME_FIELD is 'email')
        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        # Store authenticated user inside serializer validation payload
        self.user = user
        attrs['user'] = user
        return attrs


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer restricting profile updates to name, phone, and profile image.
    """
    class Meta:
        model = User
        fields = [
            'full_name',
            'phone',
            'profile_image',
        ]

    def validate_full_name(self, value: str) -> str:
        try:
            return validate_full_name(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_phone(self, value: str) -> str:
        if not value:
            return value
        try:
            normalized_phone = validate_phone_number(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

        # Check unique constraint excluding current user
        request = self.context.get('request')
        current_user = request.user if request else None

        queryset = User.objects.filter(phone=normalized_phone)
        if current_user and current_user.is_authenticated:
            queryset = queryset.exclude(user_id=current_user.user_id)

        if queryset.exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return normalized_phone


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer validating password changes.
    Verifies old password match and new password complexity criteria.
    Does not modify database records.
    """
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate_old_password(self, value: str) -> str:
        request = self.context.get('request')
        current_user = request.user if request else None

        if current_user and current_user.is_authenticated:
            if not current_user.check_password(value):
                raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, attrs: dict) -> dict:
        old_password = attrs.get('old_password')
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')

        try:
            validate_password_strength(new_password)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})

        if new_password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "New passwords do not match."})

        if old_password == new_password:
            raise serializers.ValidationError({"new_password": "New password cannot be the same as the old password."})

        return attrs


class GoogleOAuthSerializer(serializers.Serializer):
    """
    Serializer for validating Google OAuth credentials.
    """
    code = serializers.CharField(required=False)
    id_token = serializers.CharField(required=False)

    def validate(self, attrs: dict) -> dict:
        if not attrs.get('code') and not attrs.get('id_token'):
            raise serializers.ValidationError("Either 'code' or 'id_token' must be provided.")
        return attrs


# Alias for backward compatibility with views.py
UserRegisterSerializer = RegisterSerializer


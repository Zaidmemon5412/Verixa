"""
Serializers for the accounts app.
Converts User and authentication data between JSON representations and python objects.
Prepares the app for JWT authentication and Google OAuth integration.
"""
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Standard serializer for retrieving user profile information.
    """
    class Meta:
        model = User
        fields = [
            'user_id',
            'username',
            'email',
            'full_name',
            'phone',
            'role',
            'profile_image',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['user_id', 'email', 'created_at']


class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for handling new user registrations.
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'full_name',
            'phone',
            'role',
        ]

    def create(self, validated_data):
        # Implementation of registration logic will go here
        pass


class GoogleOAuthSerializer(serializers.Serializer):
    """
    Serializer for validating Google OAuth credential tokens or authorization codes.
    """
    code = serializers.CharField(
        required=False,
        help_text="The authorization code returned from Google OAuth consent screen."
    )
    id_token = serializers.CharField(
        required=False,
        help_text="The identity token returned from Google's frontend credential login."
    )

    def validate(self, attrs):
        if not attrs.get('code') and not attrs.get('id_token'):
            raise serializers.ValidationError("Either 'code' or 'id_token' must be provided.")
        return attrs

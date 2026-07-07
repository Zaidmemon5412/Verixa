"""
Serializers for the builders app.
Defines serializers for listing/presenting, creating, and updating builders.
"""
from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Builder
from .validators import (
    validate_builder_name,
    validate_email,
    validate_phone_number,
    validate_website_url,
    validate_rera_registration_no,
    validate_established_year,
)


class BuilderSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for presenting builder metadata.
    """
    class Meta:
        model = Builder
        fields = [
            'builder_id',
            'builder_name',
            'company_name',
            'rera_registration_no',
            'office_address',
            'phone',
            'email',
            'website',
            'established_year',
            'about',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class BuilderCreateSerializer(serializers.ModelSerializer):
    """
    Serializer handling the validation and creation of new Builder instances.
    """
    class Meta:
        model = Builder
        fields = [
            'builder_id',
            'builder_name',
            'company_name',
            'rera_registration_no',
            'office_address',
            'phone',
            'email',
            'website',
            'established_year',
            'about',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['builder_id', 'created_at', 'updated_at']

    def validate_builder_name(self, value: str) -> str:
        try:
            return validate_builder_name(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_email(self, value: str) -> str:
        try:
            return validate_email(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_phone(self, value: str) -> str:
        try:
            return validate_phone_number(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_website(self, value: str) -> str:
        if not value:
            return value
        try:
            return validate_website_url(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_rera_registration_no(self, value: str) -> str:
        try:
            return validate_rera_registration_no(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_established_year(self, value: int) -> int:
        try:
            return validate_established_year(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))


class BuilderUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer handling the update of existing Builder instances.
    Prevents modification of protected fields (like RERA Registration Number).
    """
    class Meta:
        model = Builder
        fields = [
            'builder_id',
            'builder_name',
            'company_name',
            'rera_registration_no',
            'office_address',
            'phone',
            'email',
            'website',
            'established_year',
            'about',
            'created_at',
            'updated_at',
        ]
        # Prevent modification of 'rera_registration_no' and auto-managed fields
        read_only_fields = [
            'builder_id',
            'rera_registration_no',
            'created_at',
            'updated_at',
        ]

    def validate_builder_name(self, value: str) -> str:
        try:
            return validate_builder_name(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_email(self, value: str) -> str:
        try:
            return validate_email(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_phone(self, value: str) -> str:
        try:
            return validate_phone_number(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_website(self, value: str) -> str:
        if not value:
            return value
        try:
            return validate_website_url(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def validate_established_year(self, value: int) -> int:
        try:
            return validate_established_year(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))

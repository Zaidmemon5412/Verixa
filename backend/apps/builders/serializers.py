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


# ============================================================================
# BUILDER PROJECT & IMAGE SERIALIZERS
# ============================================================================

from .models import BuilderProject, BuilderProjectImage
from .validators import validate_project_name, validate_image_url


class BuilderProjectImageSerializer(serializers.ModelSerializer):
    """
    Serializer for Builder Project gallery images.
    """
    class Meta:
        model = BuilderProjectImage
        fields = [
            'image_id',
            'project',
            'image_url',
            'display_order',
            'is_primary',
            'created_at',
        ]
        read_only_fields = ['image_id', 'created_at']

    def validate_image_url(self, value: str) -> str:
        try:
            return validate_image_url(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))


class BuilderProjectSerializer(serializers.ModelSerializer):
    """
    Read serializer for Builder Project presenting detailed metadata,
    nested builder summary, and associated gallery images.
    """
    builder_name = serializers.CharField(source='builder.builder_name', read_only=True)
    company_name = serializers.CharField(source='builder.company_name', read_only=True)
    images = BuilderProjectImageSerializer(many=True, read_only=True)

    class Meta:
        model = BuilderProject
        fields = [
            'project_id',
            'builder',
            'builder_name',
            'company_name',
            'project_name',
            'property_type',
            'transaction_type',
            'project_status',
            'rera_number',
            'launch_date',
            'completion_date',
            'construction_type',
            'land_area',
            'price',
            'price_per_sqft',
            'primary_bhk',
            'bhk_variants',
            'carpet_area',
            'super_builtup_area',
            'builtup_area',
            'project_description',
            'amenities',
            'website_url',
            'latitude',
            'longitude',
            'locality',
            'city',
            'state',
            'pincode',
            'location',
            'images',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class BuilderProjectCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Write serializer handling validation, creation, and updates for Builder Projects.
    """
    class Meta:
        model = BuilderProject
        fields = [
            'project_id',
            'builder',
            'project_name',
            'property_type',
            'transaction_type',
            'project_status',
            'rera_number',
            'launch_date',
            'completion_date',
            'construction_type',
            'land_area',
            'price',
            'price_per_sqft',
            'primary_bhk',
            'bhk_variants',
            'carpet_area',
            'super_builtup_area',
            'builtup_area',
            'project_description',
            'amenities',
            'website_url',
            'latitude',
            'longitude',
            'locality',
            'city',
            'state',
            'pincode',
            'location',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['project_id', 'created_at', 'updated_at']

    def validate_project_name(self, value: str) -> str:
        try:
            return validate_project_name(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))


"""
Serializers for the builders app.
Defines serializers for listing/presenting, creating, and updating builders.
"""
from django.db.models import Q
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
    Read-only serializer for presenting builder metadata with algorithmic Trust Score.
    """
    trust_score = serializers.SerializerMethodField()
    years_of_experience = serializers.SerializerMethodField()
    completed_projects = serializers.SerializerMethodField()
    ongoing_projects = serializers.SerializerMethodField()
    total_projects = serializers.SerializerMethodField()
    delivery_on_time_rate = serializers.SerializerMethodField()

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
            'years_of_experience',
            'about',
            'trust_score',
            'completed_projects',
            'ongoing_projects',
            'total_projects',
            'delivery_on_time_rate',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_years_of_experience(self, obj) -> int:
        from datetime import datetime
        current_year = datetime.now().year
        est_year = obj.established_year or 2010
        return max(1, current_year - est_year)

    def get_total_projects(self, obj) -> int:
        return obj.projects.count()

    def get_completed_projects(self, obj) -> int:
        return obj.projects.filter(
            Q(project_status__icontains='completed') |
            Q(project_status__icontains='ready')
        ).count()

    def get_ongoing_projects(self, obj) -> int:
        total = self.get_total_projects(obj)
        completed = self.get_completed_projects(obj)
        return max(0, total - completed)

    def get_delivery_on_time_rate(self, obj) -> int:
        total = self.get_total_projects(obj)
        if total == 0:
            return 95
        completed = self.get_completed_projects(obj)
        rate = int((completed / total) * 100) if total > 0 else 90
        return min(98, max(75, rate if rate > 0 else 88))

    def get_trust_score(self, obj) -> int:
        """
        Calculates dynamic Builder Trust Score (0-100%) based on 4 weighted criteria:
        1. RERA Registration (30 pts)
        2. Experience Years (25 pts)
        3. Project Delivery Ratio (25 pts)
        4. Data & Contact Completeness (20 pts)
        """
        score = 0

        # 1. RERA Registration Check (30 pts)
        rera = (obj.rera_registration_no or '').strip()
        if rera and rera.lower() != 'not registered':
            score += 30
        else:
            score += 10

        # 2. Years of Experience (25 pts)
        exp = self.get_years_of_experience(obj)
        if exp >= 15:
            score += 25
        elif exp >= 10:
            score += 20
        elif exp >= 5:
            score += 15
        else:
            score += 10

        # 3. Project Delivery Track Record (25 pts)
        total = self.get_total_projects(obj)
        completed = self.get_completed_projects(obj)
        if total > 0:
            ratio = completed / total
            score += int(ratio * 25)
        else:
            score += 18

        # 4. Contact & Information Completeness (20 pts)
        if obj.email: score += 5
        if obj.phone: score += 5
        if obj.website: score += 5
        if obj.office_address: score += 5

        return min(99, max(50, score))


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


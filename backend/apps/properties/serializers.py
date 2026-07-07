"""
Serializers for the properties app.
Defines serializers for Amenity and PropertyAmenity models.
"""
from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Amenity, PropertyAmenity, Property
from .validators import validate_amenity_name


class AmenitySerializer(serializers.ModelSerializer):
    """
    Read-only serializer for presenting Amenity metadata.
    """
    class Meta:
        model = Amenity
        fields = ['amenity_id', 'amenity_name']
        read_only_fields = fields


class AmenityCreateSerializer(serializers.ModelSerializer):
    """
    Serializer handling creation of new Amenity instances.
    """
    class Meta:
        model = Amenity
        fields = ['amenity_id', 'amenity_name']
        read_only_fields = ['amenity_id']

    def validate_amenity_name(self, value: str) -> str:
        try:
            return validate_amenity_name(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))


class AmenityUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer handling updates to existing Amenity instances.
    """
    class Meta:
        model = Amenity
        fields = ['amenity_name']

    def validate_amenity_name(self, value: str) -> str:
        try:
            # Exclude current instance when validating unique name
            exclude_id = self.instance.amenity_id if self.instance else None
            return validate_amenity_name(value, exclude_id=exclude_id)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))


class PropertyAmenitySerializer(serializers.ModelSerializer):
    """
    Serializer for presenting Property-Amenity mapping metadata.
    """
    property_id = serializers.PrimaryKeyRelatedField(
        source='property',
        queryset=Property.objects.all(),
        label="Property"
    )
    amenity_id = serializers.PrimaryKeyRelatedField(
        source='amenity',
        queryset=Amenity.objects.all(),
        label="Amenity"
    )

    class Meta:
        model = PropertyAmenity
        fields = ['id', 'property_id', 'amenity_id']


class PropertyAmenityCreateSerializer(serializers.ModelSerializer):
    """
    Serializer handling creation of Property-Amenity mappings.
    Checks that relations exist and prevents duplicate mappings.
    """
    property_id = serializers.PrimaryKeyRelatedField(
        source='property',
        queryset=Property.objects.all(),
        label="Property"
    )
    amenity_id = serializers.PrimaryKeyRelatedField(
        source='amenity',
        queryset=Amenity.objects.all(),
        label="Amenity"
    )

    class Meta:
        model = PropertyAmenity
        fields = ['id', 'property_id', 'amenity_id']
        read_only_fields = ['id']

    def validate(self, attrs):
        property_obj = attrs.get('property')
        amenity_obj = attrs.get('amenity')

        # Prevent duplicate Property-Amenity mapping
        if PropertyAmenity.objects.filter(property=property_obj, amenity=amenity_obj).exists():
            raise serializers.ValidationError(
                "This property-amenity mapping already exists."
            )
        return attrs


class PropertyAmenityUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer handling updates to Property-Amenity mappings.
    Checks constraints when mapping values are updated.
    """
    property_id = serializers.PrimaryKeyRelatedField(
        source='property',
        queryset=Property.objects.all(),
        required=False,
        label="Property"
    )
    amenity_id = serializers.PrimaryKeyRelatedField(
        source='amenity',
        queryset=Amenity.objects.all(),
        required=False,
        label="Amenity"
    )

    class Meta:
        model = PropertyAmenity
        fields = ['property_id', 'amenity_id']

    def validate(self, attrs):
        # Fall back to instance values if not provided in request
        property_obj = attrs.get('property', self.instance.property if self.instance else None)
        amenity_obj = attrs.get('amenity', self.instance.amenity if self.instance else None)

        if property_obj and amenity_obj:
            query = PropertyAmenity.objects.filter(property=property_obj, amenity=amenity_obj)
            if self.instance:
                query = query.exclude(id=self.instance.id)
            if query.exists():
                raise serializers.ValidationError(
                    "This property-amenity mapping already exists."
                )
        return attrs

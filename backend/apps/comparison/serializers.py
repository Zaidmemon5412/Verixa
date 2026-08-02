"""
Serializers for the Comparison module.
"""
from rest_framework import serializers
from apps.properties.models import Property
from apps.properties.serializers import PropertySerializer
from .models import ComparisonSession, ComparisonProperty


class ComparisonPropertySerializer(serializers.ModelSerializer):
    """
    Serializer linking a comparison session and property with embedded property data.
    """
    property_details = PropertySerializer(source='property', read_only=True)

    class Meta:
        model = ComparisonProperty
        fields = ['id', 'comparison', 'property', 'property_details', 'added_at']
        read_only_fields = ['id', 'comparison', 'added_at']


class ComparisonSessionSerializer(serializers.ModelSerializer):
    """
    Summary serializer for ComparisonSession list views.
    """
    properties_count = serializers.IntegerField(source='comparison_properties.count', read_only=True)

    class Meta:
        model = ComparisonSession
        fields = ['comparison_id', 'user', 'comparison_name', 'properties_count', 'created_at', 'updated_at']
        read_only_fields = ['comparison_id', 'user', 'created_at', 'updated_at']


class ComparisonSessionCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a comparison session with optional initial property IDs.
    """
    comparison_name = serializers.CharField(
        max_length=255,
        required=True,
        help_text="Name of the comparison session (e.g., 3BHK Villas in Satellite)."
    )
    property_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        default=list,
        help_text="List of property UUIDs to add initially."
    )

    def validate_property_ids(self, value):
        """
        Ensure all provided property UUIDs exist.
        """
        if value:
            existing_count = Property.objects.filter(property_id__in=value).count()
            if existing_count != len(set(value)):
                raise serializers.ValidationError("One or more property IDs provided do not exist.")
        return value


class ComparisonAddPropertySerializer(serializers.Serializer):
    """
    Serializer for adding a property to an existing comparison session.
    """
    property_id = serializers.UUIDField(
        required=True,
        help_text="UUID of the property to add to comparison."
    )

    def validate_property_id(self, value):
        if not Property.objects.filter(property_id=value).exists():
            raise serializers.ValidationError("Property with this ID does not exist.")
        return value


class ComparisonDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for a ComparisonSession including full property list and comparison matrix.
    """
    compared_properties = serializers.SerializerMethodField()

    class Meta:
        model = ComparisonSession
        fields = [
            'comparison_id',
            'user',
            'comparison_name',
            'compared_properties',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['comparison_id', 'user', 'created_at', 'updated_at']

    def get_compared_properties(self, obj):
        comparison_props = obj.comparison_properties.select_related('property', 'property__locality', 'property__builder').all()
        return [
            {
                "junction_id": str(item.id),
                "added_at": item.added_at,
                "property": PropertySerializer(item.property).data
            }
            for item in comparison_props
        ]

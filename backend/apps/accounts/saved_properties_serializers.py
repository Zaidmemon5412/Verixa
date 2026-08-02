"""
Serializers for the Saved Properties feature within the accounts app.
"""
from rest_framework import serializers
from apps.properties.models import Property
from apps.properties.serializers import PropertySerializer
from .models import SavedProperty


class SavedPropertySerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving SavedProperty instances with embedded Property details.
    """
    property_details = PropertySerializer(source='property', read_only=True)

    class Meta:
        model = SavedProperty
        fields = [
            'id',
            'user',
            'property',
            'property_details',
            'saved_at'
        ]
        read_only_fields = ['id', 'user', 'saved_at']


class SavedPropertyCreateSerializer(serializers.Serializer):
    """
    Serializer for saving a property to user favorites.
    """
    property_id = serializers.UUIDField(
        required=True,
        help_text="UUID of the property to be saved."
    )

    def validate_property_id(self, value):
        """
        Validate that the target property exists in the database.
        """
        if not Property.objects.filter(property_id=value).exists():
            raise serializers.ValidationError("Property with this ID does not exist.")
        return value

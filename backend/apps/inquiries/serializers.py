"""
Serializers for the Enquiries module.
"""
from rest_framework import serializers
from apps.properties.models import Property
from apps.properties.serializers import PropertySerializer
from apps.accounts.serializers import UserSerializer
from .models import Enquiry
from .validators import validate_enquiry_message, validate_enquiry_status


class EnquirySerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving Enquiry details.
    """
    property_details = PropertySerializer(source='property', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Enquiry
        fields = [
            'enquiry_id',
            'property',
            'property_details',
            'user',
            'user_details',
            'message',
            'status',
            'created_at'
        ]
        read_only_fields = ['enquiry_id', 'user', 'created_at']


class EnquiryCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a new property enquiry.
    """
    property_id = serializers.UUIDField(
        required=True,
        help_text="UUID of the property to inquire about."
    )
    message = serializers.CharField(
        required=True,
        help_text="Message content for the enquiry."
    )

    def validate_property_id(self, value):
        if not Property.objects.filter(property_id=value).exists():
            raise serializers.ValidationError("Property with this ID does not exist.")
        return value

    def validate_message(self, value):
        return validate_enquiry_message(value)


class EnquiryStatusUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating status of an enquiry.
    """
    status = serializers.CharField(
        required=True,
        help_text="New status choice ('pending', 'replied', 'closed')."
    )

    def validate_status(self, value):
        return validate_enquiry_status(value)

"""
Serializers for the Reports module.
"""
from rest_framework import serializers
from apps.properties.models import Property
from apps.properties.serializers import PropertySerializer
from .models import Report
from .validators import validate_report_type, validate_report_url


class ReportSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving Report records.
    """
    property_details = PropertySerializer(source='property', read_only=True)

    class Meta:
        model = Report
        fields = [
            'report_id',
            'user',
            'property',
            'property_details',
            'report_type',
            'report_url',
            'generated_at'
        ]
        read_only_fields = ['report_id', 'user', 'generated_at']


class ReportCreateSerializer(serializers.Serializer):
    """
    Serializer for generating/creating a report record.
    """
    property_id = serializers.UUIDField(
        required=True,
        help_text="UUID of the property for which to generate the report."
    )
    report_type = serializers.CharField(
        required=True,
        max_length=100,
        help_text="Type of report (e.g., Valuation Estimation, Legal Verification, Market Analytics)."
    )
    report_url = serializers.CharField(
        required=False,
        default="",
        allow_blank=True,
        help_text="URL location of the generated report document."
    )

    def validate_property_id(self, value):
        if not Property.objects.filter(property_id=value).exists():
            raise serializers.ValidationError("Property with this ID does not exist.")
        return value

    def validate_report_type(self, value):
        return validate_report_type(value)

    def validate_report_url(self, value):
        if value:
            return validate_report_url(value)
        return value

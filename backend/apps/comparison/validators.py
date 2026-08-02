"""
Validators for the comparison app.
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.properties.models import Property


def validate_comparison_name(value: str) -> str:
    """
    Validates that comparison name is not empty or whitespace only.
    """
    if not value or not value.strip():
        raise ValidationError(_("Comparison name cannot be empty."))
    if len(value.strip()) > 255:
        raise ValidationError(_("Comparison name cannot exceed 255 characters."))
    return value.strip()


def validate_property_exists(property_id) -> Property:
    """
    Validates that a property with given ID exists.
    """
    try:
        return Property.objects.get(property_id=property_id)
    except Property.DoesNotExist:
        raise ValidationError(_("Property with this ID does not exist."))

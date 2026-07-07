"""
Validators for the properties app.
Defines reusable field validation functions for amenities.
"""
import uuid
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import Amenity


def validate_amenity_name(value: str, exclude_id: uuid.UUID = None) -> str:
    """
    Validates the amenity name:
    - Cannot be empty
    - Remove extra whitespace
    - Minimum 2 characters
    - Maximum 100 characters
    - Prevent duplicate amenity names (case-insensitive)
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("Amenity name must be a valid string."), code='invalid_type')
        
    cleaned_name = " ".join(value.split())
    
    if not cleaned_name:
        raise ValidationError(_("Amenity name cannot be empty."), code='empty')
        
    if len(cleaned_name) < 2:
        raise ValidationError(
            _("Amenity name must be at least 2 characters long."),
            code='name_too_short'
        )
        
    if len(cleaned_name) > 100:
        raise ValidationError(
            _("Amenity name must be at most 100 characters long."),
            code='name_too_long'
        )
        
    # Prevent duplicate amenity names (case-insensitive)
    query = Amenity.objects.filter(amenity_name__iexact=cleaned_name)
    if exclude_id:
        query = query.exclude(amenity_id=exclude_id)
        
    if query.exists():
        raise ValidationError(
            _("An amenity with this name already exists."),
            code='duplicate_name'
        )
        
    return cleaned_name

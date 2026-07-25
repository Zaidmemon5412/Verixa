"""
Validators for the properties app.
Defines reusable field validation functions for amenities, images, and documents.
"""
import os
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


def validate_image_file(file):
    """
    Validates uploaded images.
    Restrictions: JPEG, PNG, WEBP. Max size 5MB.
    """
    max_size = 5 * 1024 * 1024  # 5MB
    if file.size > max_size:
        raise ValidationError(f"File size exceeds 5MB limit. (Current size: {file.size / (1024 * 1024):.2f}MB)")
    
    ext = os.path.splitext(file.name)[1].lower()
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    if ext not in valid_extensions:
        raise ValidationError(f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(valid_extensions)}")

    # Check MIME type if available
    content_type = getattr(file, 'content_type', '')
    if content_type:
        valid_mime_types = ['image/jpeg', 'image/png', 'image/webp']
        if content_type not in valid_mime_types:
            raise ValidationError(f"Unsupported file MIME type '{content_type}'. Allowed MIME types: {', '.join(valid_mime_types)}")


def validate_document_file(file):
    """
    Validates uploaded documents.
    Restrictions: PDF, DOCX, PNG, JPEG. Max size 10MB.
    """
    max_size = 10 * 1024 * 1024  # 10MB
    if file.size > max_size:
        raise ValidationError(f"File size exceeds 10MB limit. (Current size: {file.size / (1024 * 1024):.2f}MB)")
    
    ext = os.path.splitext(file.name)[1].lower()
    valid_extensions = ['.pdf', '.docx', '.png', '.jpeg', '.jpg']
    if ext not in valid_extensions:
        raise ValidationError(f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(valid_extensions)}")

    # Check MIME type if available
    content_type = getattr(file, 'content_type', '')
    if content_type:
        valid_mime_types = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'image/png',
            'image/jpeg',
            'image/jpg'
        ]
        if content_type not in valid_mime_types:
            raise ValidationError(f"Unsupported file MIME type '{content_type}'. Allowed MIME types: {', '.join(valid_mime_types)}")


def validate_price(value):
    """Validates that price is a non-negative number."""
    if value is not None and value < 0:
        raise ValidationError(_("Price cannot be negative."))


def validate_area(value):
    """Validates that area is greater than 0."""
    if value is not None and value <= 0:
        raise ValidationError(_("Area must be greater than 0."))


def validate_construction_age(value):
    """Validates that construction age is between 0 and 150 years."""
    if value is not None:
        if value < 0 or value > 150:
            raise ValidationError(_("Construction age must be between 0 and 150 years."))


def validate_positive_integer(value, field_name="Value"):
    """Validates that an integer field is non-negative."""
    if value is not None and value < 0:
        raise ValidationError(_(f"{field_name} cannot be negative."))


def validate_floor_number(floor_number, total_floors=None):
    """Validates that floor number is non-negative and <= total floors if total floors is provided."""
    if floor_number is not None:
        if floor_number < 0:
            raise ValidationError(_("Floor number cannot be negative."))
        if total_floors is not None and floor_number > total_floors:
            raise ValidationError(_("Floor number cannot exceed total floors."))


def validate_survey_number(value: str) -> str:
    """Validates survey number formatting."""
    if value is not None:
        cleaned = str(value).strip()
        if not cleaned:
            raise ValidationError(_("Survey number cannot be blank."))
        if len(cleaned) > 100:
            raise ValidationError(_("Survey number cannot exceed 100 characters."))
        return cleaned
    return value


def validate_khata_number(value: str) -> str:
    """Validates khata number formatting."""
    if value is not None:
        cleaned = str(value).strip()
        if not cleaned:
            raise ValidationError(_("Khata number cannot be blank."))
        if len(cleaned) > 100:
            raise ValidationError(_("Khata number cannot exceed 100 characters."))
        return cleaned
    return value


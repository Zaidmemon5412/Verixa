"""
Validators for the builders app.
Defines reusable field validation functions for builder name, email,
phone number, website URL, RERA registration number, and established year.
"""
import re
from django.core.exceptions import ValidationError
from django.core.validators import validate_email as django_validate_email, URLValidator
from django.utils.translation import gettext_lazy as _


def validate_builder_name(value: str) -> str:
    """
    Validates builder name:
    - Must be a valid string
    - Minimum 3 characters
    - Maximum 255 characters
    - Allow letters, numbers, spaces, and standard name punctuation (&, -, ., ,, ', /, (, ))
    - Trim extra spaces
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("Builder name must be a valid string."), code='invalid_type')
        
    cleaned_name = " ".join(value.split())
    
    if len(cleaned_name) < 3:
        raise ValidationError(
            _("Builder name must be at least 3 characters long."),
            code='builder_name_too_short'
        )
        
    if len(cleaned_name) > 255:
        raise ValidationError(
            _("Builder name must be at most 255 characters long."),
            code='builder_name_too_long'
        )
        
    # Standard builder names can contain letters, digits, spaces, and punctuation: & - . , ' / ( )
    if not re.match(r'^[a-zA-Z0-9\s&\-.,\'/()]+$', cleaned_name):
        raise ValidationError(
            _("Builder name contains invalid characters."),
            code='builder_name_invalid_characters'
        )
        
    return cleaned_name


def validate_email(value: str) -> str:
    """
    Validates email format and normalizes to lowercase.
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("Email must be a valid string."), code='invalid_type')
        
    normalized_email = value.strip().lower()
    try:
        django_validate_email(normalized_email)
    except ValidationError:
        raise ValidationError(_("Enter a valid email address."), code='invalid_email')
        
    return normalized_email


def validate_phone_number(value: str) -> str:
    """
    Validates phone numbers to ensure they match E.164 standard formatting.
    Format: '+999999999'. Up to 15 digits allowed.
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("Phone number must be a valid string."), code='invalid_type')
        
    cleaned_phone = value.strip()
    pattern = r'^\+?1?\d{9,15}$'
    if not re.match(pattern, cleaned_phone):
        raise ValidationError(
            _("Phone number must be entered in format: '+999999999'. Up to 15 digits allowed."),
            code='invalid_phone_number'
        )
        
    return cleaned_phone


def validate_website_url(value: str) -> str:
    """
    Validates website URL format.
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("Website URL must be a valid string."), code='invalid_type')
        
    cleaned_url = value.strip()
    validator = URLValidator(schemes=['http', 'https'])
    try:
        validator(cleaned_url)
    except ValidationError:
        raise ValidationError(_("Enter a valid website URL."), code='invalid_url')
        
    return cleaned_url


def validate_rera_registration_no(value: str) -> str:
    """
    Validates formatting of RERA registration number:
    - Minimum 5 characters
    - Maximum 100 characters
    - Alphanumeric, hyphens, slashes, dots, underscores
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("RERA registration number must be a valid string."), code='invalid_type')
        
    cleaned_rera = value.strip().upper()
    if len(cleaned_rera) < 5:
        raise ValidationError(
            _("RERA registration number must be at least 5 characters long."),
            code='rera_too_short'
        )
        
    if len(cleaned_rera) > 100:
        raise ValidationError(
            _("RERA registration number must be at most 100 characters long."),
            code='rera_too_long'
        )
        
    if not re.match(r'^[A-Z0-9/\-._\s]+$', cleaned_rera):
        raise ValidationError(
            _("RERA registration number must only contain alphanumeric characters, hyphens, slashes, dots, and underscores."),
            code='rera_invalid_characters'
        )
        
    return cleaned_rera


def validate_established_year(value: int) -> int:
    """
    Validates established year:
    - Must be an integer between 1800 and 2100.
    """
    try:
        year = int(value)
    except (ValueError, TypeError):
        raise ValidationError(_("Established year must be a valid integer."), code='invalid_type')
        
    if year < 1800 or year > 2100:
        raise ValidationError(
            _("Established year must be between 1800 and 2100."),
            code='established_year_out_of_range'
        )
        
    return year

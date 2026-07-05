"""
Validators for the accounts app.
Defines reusable field validation functions for email, password strength,
full name, and Indian mobile numbers.
"""
import re
from django.core.exceptions import ValidationError
from django.core.validators import validate_email as django_validate_email
from django.utils.translation import gettext_lazy as _


def validate_email(value: str) -> str:
    """
    Validates the format of an email address and normalizes it to lowercase.
    Raises ValidationError for invalid email addresses.
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("Email must be a valid string."), code='invalid_type')
    
    normalized_email = value.strip().lower()
    try:
        django_validate_email(normalized_email)
    except ValidationError:
        raise ValidationError(_("Enter a valid email address."), code='invalid_email')
        
    return normalized_email


def validate_password_strength(value: str) -> None:
    """
    Validates that a password meets production security requirements:
    - Minimum 8 characters
    - Maximum 128 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("Password must be a valid string."), code='invalid_type')
        
    if len(value) < 8:
        raise ValidationError(
            _("The password must be at least 8 characters long."),
            code='password_too_short'
        )
        
    if len(value) > 128:
        raise ValidationError(
            _("The password must be at most 128 characters long."),
            code='password_too_long'
        )

    if not re.search(r'[A-Z]', value):
        raise ValidationError(
            _("The password must contain at least one uppercase letter."),
            code='password_no_uppercase'
        )

    if not re.search(r'[a-z]', value):
        raise ValidationError(
            _("The password must contain at least one lowercase letter."),
            code='password_no_lowercase'
        )

    if not re.search(r'\d', value):
        raise ValidationError(
            _("The password must contain at least one digit."),
            code='password_no_digit'
        )

    if not re.search(r'[^a-zA-Z0-9]', value):
        raise ValidationError(
            _("The password must contain at least one special character."),
            code='password_no_special'
        )


def validate_full_name(value: str) -> str:
    """
    Validates full name requirements:
    - Minimum 3 characters
    - Maximum 100 characters
    - Allow only alphabets and spaces
    - Trim extra spaces (including multiple consecutive spaces)
    - Reject numbers and special characters
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("Full name must be a valid string."), code='invalid_type')

    # Trim leading/trailing spaces and normalize multiple internal spaces to a single space
    cleaned_name = " ".join(value.split())

    if len(cleaned_name) < 3:
        raise ValidationError(
            _("Full name must be at least 3 characters long."),
            code='full_name_too_short'
        )

    if len(cleaned_name) > 100:
        raise ValidationError(
            _("Full name must be at most 100 characters long."),
            code='full_name_too_long'
        )

    if not re.match(r'^[a-zA-Z\s]+$', cleaned_name):
        raise ValidationError(
            _("Full name must only contain letters and spaces."),
            code='full_name_invalid_characters'
        )

    return cleaned_name


def validate_phone_number(value: str) -> str:
    """
    Validates and normalizes Indian mobile numbers:
    - Must be a valid 10-digit number
    - Starts with digits 6-9
    - Handles optional prefixes (+91, 91, or 0)
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("Phone number must be a valid string."), code='invalid_type')

    cleaned_phone = value.strip()

    # Normalize standard Indian prefixes
    if cleaned_phone.startswith('+91'):
        cleaned_phone = cleaned_phone[3:]
    elif cleaned_phone.startswith('91') and len(cleaned_phone) == 12:
        cleaned_phone = cleaned_phone[2:]
    elif cleaned_phone.startswith('0') and len(cleaned_phone) == 11:
        cleaned_phone = cleaned_phone[1:]

    # Enforce exactly 10 digits starting with 6-9
    if not re.match(r'^[6-9]\d{9}$', cleaned_phone):
        raise ValidationError(
            _("Enter a valid 10-digit Indian mobile number starting with 6-9."),
            code='invalid_phone_number'
        )

    return cleaned_phone

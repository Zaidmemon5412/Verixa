import re
from django.core.exceptions import ValidationError


def validate_phone_number(value):
    """
    Validates phone numbers to ensure they match E.164 standard formatting.
    """
    if value:
        pattern = r'^\+?1?\d{9,15}$'
        if not re.match(pattern, str(value)):
            raise ValidationError(
                "Phone number must be entered in format: '+999999999'. Up to 15 digits allowed."
            )


def validate_pincode(value):
    """
    Validates pin code formatting to ensure it is exactly 6 digits.
    """
    if value:
        pattern = r'^\d{6}$'
        if not re.match(pattern, str(value)):
            raise ValidationError("Pincode must be exactly 6 digits.")


def validate_file_size(value):
    """
    Restricts file uploads to a maximum of 10 megabytes.
    """
    limit_kb = 10240  # 10MB limit
    if value and value.size > limit_kb * 1024:
        raise ValidationError(
            f"Max file size is 10MB (current size: {value.size / (1024 * 1024):.2f}MB)"
        )

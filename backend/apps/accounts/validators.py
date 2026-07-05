"""
Validators for the accounts app.
Defines custom field validation functions for account-related model and serializer fields.
"""
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_password_strength(value: str):
    """
    Validates that a password is sufficiently strong:
    - Minimum 8 characters.
    - Contains at least one digit.
    - Contains at least one uppercase letter.
    """
    if len(value) < 8:
        raise ValidationError(
            _("The password must be at least 8 characters long."),
            code='password_too_short'
        )

    if not re.search(r'\d', value):
        raise ValidationError(
            _("The password must contain at least one digit."),
            code='password_no_digit'
        )

    if not re.search(r'[A-Z]', value):
        raise ValidationError(
            _("The password must contain at least one uppercase letter."),
            code='password_no_uppercase'
        )

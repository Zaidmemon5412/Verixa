"""
Validators for the enquiries app.
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.properties.models import Property

STATUS_CHOICES = ('pending', 'replied', 'closed')


def validate_enquiry_message(value: str) -> str:
    """
    Validates message is present and of adequate length.
    """
    if not value or not value.strip():
        raise ValidationError(_("Enquiry message cannot be empty."))
    cleaned = value.strip()
    if len(cleaned) < 5:
        raise ValidationError(_("Enquiry message must be at least 5 characters long."))
    return cleaned


def validate_enquiry_status(value: str) -> str:
    """
    Validates status choice string.
    """
    if value not in STATUS_CHOICES:
        raise ValidationError(
            _("Invalid status. Allowed choices are: pending, replied, closed."),
            code='invalid_status'
        )
    return value

"""
Validators for the reports app.
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.properties.models import Property


def validate_report_type(value: str) -> str:
    """
    Validates report type string.
    """
    if not value or not value.strip():
        raise ValidationError(_("Report type cannot be empty."))
    cleaned = value.strip()
    if len(cleaned) > 100:
        raise ValidationError(_("Report type cannot exceed 100 characters."))
    return cleaned


def validate_report_url(value: str) -> str:
    """
    Validates report file URL string.
    """
    if not value or not value.strip():
        raise ValidationError(_("Report URL cannot be empty."))
    cleaned = value.strip()
    if not (cleaned.startswith("http://") or cleaned.startswith("https://") or cleaned.startswith("/media/")):
        raise ValidationError(_("Report URL must be a valid URL string starting with http://, https://, or /media/."))
    return cleaned

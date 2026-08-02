"""
Services layer for the Reports module.
Implements business logic for managing report generation and retrieval.
"""
import uuid
import logging
from typing import Union, Optional, Dict
from django.db.models import QuerySet, Q
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.properties.models import Property
from .models import Report
from .validators import validate_report_type, validate_report_url

logger = logging.getLogger(__name__)


def generate_report(
    user,
    property_id: Union[uuid.UUID, str],
    report_type: str,
    report_url: Optional[str] = None
) -> Report:
    """
    Generates a new report record for a given property.
    If `report_url` is omitted, constructs a standard media file URL placeholder.
    """
    cleaned_type = validate_report_type(report_type)
    logger.info(f"Generating report '{cleaned_type}' for property {property_id} by user {user.user_id}")

    try:
        target_property = Property.objects.get(property_id=property_id)
    except Property.DoesNotExist:
        raise ValidationError(_("Property not found."), code='not_found')

    final_url = report_url if report_url else f"https://verixa-reports.storage.googleapis.com/reports/{target_property.property_id}_{uuid.uuid4().hex[:8]}.pdf"
    cleaned_url = validate_report_url(final_url)

    report = Report.objects.create(
        user=user,
        property=target_property,
        report_type=cleaned_type,
        report_url=cleaned_url
    )

    logger.info(f"Successfully generated report record {report.report_id}")
    return report


def get_user_reports(user, filters: Optional[Dict] = None) -> QuerySet[Report]:
    """
    Retrieves report records for a user with optional report_type and search filters.
    """
    logger.info(f"Retrieving reports for user {user.user_id}")
    
    if user.role in ['admin'] or user.is_staff or user.is_superuser:
        qs = Report.objects.all()
    else:
        qs = Report.objects.filter(user=user)

    qs = qs.select_related('property', 'user', 'property__locality', 'property__builder')

    if filters:
        report_type = filters.get('report_type')
        if report_type:
            qs = qs.filter(report_type__icontains=report_type)

        search_query = filters.get('search')
        if search_query:
            qs = qs.filter(
                Q(report_type__icontains=search_query) |
                Q(property__property_name__icontains=search_query) |
                Q(user__full_name__icontains=search_query)
            )

    return qs


def get_report_by_id(user, report_id: Union[uuid.UUID, str]) -> Report:
    """
    Retrieves a report record by ID checking user permission.
    """
    logger.info(f"Retrieving report {report_id} for user {user.user_id}")
    try:
        report = Report.objects.select_related('property', 'user').get(report_id=report_id)
    except Report.DoesNotExist:
        raise ValidationError(_("Report not found."), code='not_found')

    if report.user != user and user.role not in ['admin'] and not user.is_staff:
        raise ValidationError(_("Permission denied to access this report."), code='permission_denied')

    return report


def delete_report(user, report_id: Union[uuid.UUID, str]) -> None:
    """
    Deletes a report record.
    """
    logger.info(f"Deleting report {report_id} by user {user.user_id}")
    report = get_report_by_id(user, report_id)
    report.delete()
    logger.info(f"Successfully deleted report {report_id}")

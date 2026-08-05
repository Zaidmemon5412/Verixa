"""
Services layer for the Enquiries module.
Implements business logic for managing property enquiries.
"""
import uuid
import logging
from typing import Union, Optional, Dict
from django.db.models import QuerySet, Q
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.properties.models import Property
from .models import Enquiry
from .validators import validate_enquiry_message, validate_enquiry_status

logger = logging.getLogger(__name__)


def create_enquiry(user, property_id: Union[uuid.UUID, str, None], message: str) -> Enquiry:
    """
    Creates a new enquiry on a property.
    Supports flexible property_id or automatic fallback to default property.
    """
    cleaned_message = validate_enquiry_message(message)
    logger.info(f"User {user.user_id} creating enquiry for property {property_id}")

    target_property = None
    if property_id:
        val_str = str(property_id).strip()
        try:
            target_property = Property.objects.filter(property_id=val_str).first()
        except (DjangoValidationError, ValueError, TypeError):
            pass

        if not target_property and val_str:
            try:
                target_property = Property.objects.filter(property_id=uuid.UUID(val_str)).first()
            except (DjangoValidationError, ValueError, TypeError, AttributeError):
                pass

    if not target_property:
        target_property = Property.objects.first()

    if not target_property:
        raise ValidationError(_("Property not found."), code='not_found')

    enquiry = Enquiry.objects.create(
        user=user,
        property=target_property,
        message=cleaned_message,
        status='pending'
    )

    logger.info(f"Successfully created enquiry {enquiry.enquiry_id}")
    return enquiry


def get_user_enquiries(user, filters: Optional[Dict] = None) -> QuerySet[Enquiry]:
    """
    Retrieves enquiries for a user (if normal user, returns their created enquiries;
    if admin or agent, allows viewing all or filtered enquiries).
    Supports searching and filtering by status.
    """
    logger.info(f"Retrieving enquiries for user {user.user_id} (role={user.role})")
    
    if user.role in ['admin', 'agent'] or user.is_staff or user.is_superuser:
        qs = Enquiry.objects.all()
    else:
        qs = Enquiry.objects.filter(user=user)

    qs = qs.select_related('property', 'user', 'property__locality', 'property__builder')

    if filters:
        status_filter = filters.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        search_query = filters.get('search')
        if search_query:
            qs = qs.filter(
                Q(message__icontains=search_query) |
                Q(property__property_name__icontains=search_query) |
                Q(user__full_name__icontains=search_query)
            )

    return qs


def get_enquiry_by_id(user, enquiry_id: Union[uuid.UUID, str]) -> Enquiry:
    """
    Retrieves a single enquiry by ID with ownership/access control.
    """
    logger.info(f"Retrieving enquiry {enquiry_id} for user {user.user_id}")
    try:
        enquiry = Enquiry.objects.select_related('property', 'user').get(enquiry_id=enquiry_id)
    except Enquiry.DoesNotExist:
        raise ValidationError(_("Enquiry not found."), code='not_found')

    # Allow access if owner, admin, or staff
    if enquiry.user != user and user.role not in ['admin', 'agent'] and not user.is_staff:
        raise ValidationError(_("Permission denied to view this enquiry."), code='permission_denied')

    return enquiry


def update_enquiry_status(user, enquiry_id: Union[uuid.UUID, str], new_status: str) -> Enquiry:
    """
    Updates status of an enquiry (Admin, agent, or property owner permission).
    """
    cleaned_status = validate_enquiry_status(new_status)
    logger.info(f"Updating status of enquiry {enquiry_id} to '{cleaned_status}' by user {user.user_id}")

    enquiry = get_enquiry_by_id(user, enquiry_id)

    # Permission check for updating status
    if user.role not in ['admin', 'agent'] and not user.is_staff and enquiry.user != user:
        raise ValidationError(_("Only platform administrators or agents can update enquiry status."), code='permission_denied')

    enquiry.status = cleaned_status
    enquiry.save()

    logger.info(f"Successfully updated status for enquiry {enquiry_id}")
    return enquiry


def delete_enquiry(user, enquiry_id: Union[uuid.UUID, str]) -> None:
    """
    Deletes an enquiry record.
    """
    logger.info(f"Deleting enquiry {enquiry_id} by user {user.user_id}")
    enquiry = get_enquiry_by_id(user, enquiry_id)

    if enquiry.user != user and user.role not in ['admin'] and not user.is_staff:
        raise ValidationError(_("Permission denied to delete this enquiry."), code='permission_denied')

    enquiry.delete()
    logger.info(f"Successfully deleted enquiry {enquiry_id}")

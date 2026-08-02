"""
Services layer for the Saved Properties feature.
Encapsulates business logic for managing user saved properties.
"""
import uuid
import logging
from typing import Union
from django.db.models import QuerySet
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.properties.models import Property
from .models import SavedProperty, User

logger = logging.getLogger(__name__)


def save_property(user: User, property_id: Union[uuid.UUID, str]) -> SavedProperty:
    """
    Business logic to save a property for a user.
    Prevents duplicate entries.
    """
    logger.info(f"User {user.user_id} attempting to save property {property_id}")
    
    try:
        target_property = Property.objects.get(property_id=property_id)
    except Property.DoesNotExist:
        raise ValidationError(_("Property not found."), code='not_found')

    saved_obj, created = SavedProperty.objects.get_or_create(
        user=user,
        property=target_property
    )

    if not created:
        raise ValidationError(
            _("This property is already in your saved list."),
            code='already_saved'
        )

    logger.info(f"Successfully saved property {property_id} for user {user.user_id}")
    return saved_obj


def remove_saved_property(user: User, identifier: Union[uuid.UUID, str]) -> None:
    """
    Business logic to remove a saved property entry.
    `identifier` can be either the SavedProperty `id` or the `property_id`.
    """
    logger.info(f"User {user.user_id} attempting to remove saved property: {identifier}")
    
    # Check if identifier matches SavedProperty primary key
    saved_entry = SavedProperty.objects.filter(user=user, id=identifier).first()
    
    # If not found, check if identifier matches Property primary key
    if not saved_entry:
        saved_entry = SavedProperty.objects.filter(user=user, property_id=identifier).first()

    if not saved_entry:
        raise ValidationError(
            _("Saved property record not found."),
            code='not_found'
        )

    saved_entry.delete()
    logger.info(f"Successfully removed saved property {identifier} for user {user.user_id}")


def get_user_saved_properties(user: User) -> QuerySet[SavedProperty]:
    """
    Retrieves all saved property instances for a specific user.
    """
    logger.info(f"Retrieving saved properties for user {user.user_id}")
    return SavedProperty.objects.filter(user=user).select_related('property', 'property__builder', 'property__locality')


def check_property_saved(user: User, property_id: Union[uuid.UUID, str]) -> dict:
    """
    Checks if a given property is saved by the specified user.
    """
    logger.info(f"Checking if property {property_id} is saved by user {user.user_id}")
    saved_entry = SavedProperty.objects.filter(user=user, property_id=property_id).first()
    
    if saved_entry:
        return {
            "is_saved": True,
            "saved_id": str(saved_entry.id),
            "saved_at": saved_entry.saved_at
        }
    return {
        "is_saved": False,
        "saved_id": None,
        "saved_at": None
    }

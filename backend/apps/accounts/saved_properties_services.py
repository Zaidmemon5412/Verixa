"""
Services layer for the Saved Properties feature.
Encapsulates business logic for managing user saved properties.
"""
import uuid
import logging
from typing import Union
from django.db.models import QuerySet, Q
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.properties.models import Property
from .models import SavedProperty, User

logger = logging.getLogger(__name__)


def save_property(user: User, property_id: Union[uuid.UUID, str]) -> SavedProperty:
    """
    Business logic to save a property for a user.
    Prevents duplicate entries gracefully.
    """
    val_str = str(property_id).strip()
    logger.info(f"User {user.user_id} attempting to save property {val_str}")
    
    target_property = Property.objects.filter(property_id=val_str).first()
    if not target_property and val_str:
        try:
            target_property = Property.objects.filter(property_id=uuid.UUID(val_str)).first()
        except (ValueError, AttributeError):
            pass

    if not target_property:
        raise ValidationError(_("Property not found."), code='not_found')

    saved_obj, created = SavedProperty.objects.get_or_create(
        user=user,
        property=target_property
    )

    logger.info(f"Successfully processed save for property {val_str} (created={created}) for user {user.user_id}")
    return saved_obj


def remove_saved_property(user: User, identifier: Union[uuid.UUID, str]) -> None:
    """
    Business logic to remove a saved property entry.
    `identifier` can be either the SavedProperty `id` or the `property_id`.
    """
    val_str = str(identifier).strip()
    logger.info(f"User {user.user_id} attempting to remove saved property: {val_str}")
    
    saved_entries = SavedProperty.objects.filter(
        Q(user=user) & (Q(id=val_str) | Q(property_id=val_str))
    )
    
    if saved_entries.exists():
        saved_entries.delete()
        logger.info(f"Successfully removed saved property {val_str} for user {user.user_id}")
    else:
        logger.info(f"No saved property found for identifier {val_str}, skipping deletion.")


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
    val_str = str(property_id).strip()
    logger.info(f"Checking if property {val_str} is saved by user {user.user_id}")
    saved_entry = SavedProperty.objects.filter(
        Q(user=user) & Q(property_id=val_str)
    ).first()
    
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

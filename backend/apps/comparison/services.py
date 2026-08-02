"""
Services layer for the Comparison app.
Handles core business logic for user comparison sessions and property comparisons.
"""
import uuid
import logging
from typing import Union, List, Optional
from django.db.models import QuerySet
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.properties.models import Property
from .models import ComparisonSession, ComparisonProperty
from .validators import validate_comparison_name

logger = logging.getLogger(__name__)


def create_comparison_session(
    user,
    comparison_name: str,
    property_ids: Optional[List[Union[uuid.UUID, str]]] = None
) -> ComparisonSession:
    """
    Creates a new comparison session for a user and optionally attaches initial properties.
    """
    cleaned_name = validate_comparison_name(comparison_name)
    logger.info(f"Creating comparison session '{cleaned_name}' for user {user.user_id}")

    session = ComparisonSession.objects.create(
        user=user,
        comparison_name=cleaned_name
    )

    if property_ids:
        properties = Property.objects.filter(property_id__in=property_ids)
        for prop in properties:
            ComparisonProperty.objects.get_or_create(
                comparison=session,
                property=prop
            )

    logger.info(f"Successfully created comparison session {session.comparison_id}")
    return session


def get_user_comparison_sessions(user) -> QuerySet[ComparisonSession]:
    """
    Retrieves all comparison sessions for a specific user.
    """
    logger.info(f"Retrieving comparison sessions for user {user.user_id}")
    return ComparisonSession.objects.filter(user=user).prefetch_related('comparison_properties')


def get_comparison_details(user, comparison_id: Union[uuid.UUID, str]) -> ComparisonSession:
    """
    Retrieves a single comparison session owned by the user.
    """
    logger.info(f"Retrieving comparison session {comparison_id} for user {user.user_id}")
    try:
        return ComparisonSession.objects.get(comparison_id=comparison_id, user=user)
    except ComparisonSession.DoesNotExist:
        raise ValidationError(_("Comparison session not found."), code='not_found')


def add_property_to_comparison(
    user,
    comparison_id: Union[uuid.UUID, str],
    property_id: Union[uuid.UUID, str]
) -> ComparisonProperty:
    """
    Adds a property to an existing user comparison session.
    """
    logger.info(f"Adding property {property_id} to comparison {comparison_id} for user {user.user_id}")
    
    session = get_comparison_details(user, comparison_id)

    try:
        target_property = Property.objects.get(property_id=property_id)
    except Property.DoesNotExist:
        raise ValidationError(_("Property not found."), code='not_found')

    comp_prop, created = ComparisonProperty.objects.get_or_create(
        comparison=session,
        property=target_property
    )

    if not created:
        raise ValidationError(_("Property is already added to this comparison session."), code='already_exists')

    logger.info(f"Successfully added property {property_id} to comparison {comparison_id}")
    return comp_prop


def remove_property_from_comparison(
    user,
    comparison_id: Union[uuid.UUID, str],
    property_id: Union[uuid.UUID, str]
) -> None:
    """
    Removes a property from a user's comparison session.
    """
    logger.info(f"Removing property {property_id} from comparison {comparison_id} for user {user.user_id}")
    
    session = get_comparison_details(user, comparison_id)

    deleted_count, _ = ComparisonProperty.objects.filter(
        comparison=session,
        property_id=property_id
    ).delete()

    if deleted_count == 0:
        # Also try matching by junction `id`
        deleted_count, _ = ComparisonProperty.objects.filter(
            comparison=session,
            id=property_id
        ).delete()

    if deleted_count == 0:
        raise ValidationError(_("Property record not found in this comparison session."), code='not_found')

    logger.info(f"Successfully removed property from comparison session {comparison_id}")


def delete_comparison_session(user, comparison_id: Union[uuid.UUID, str]) -> None:
    """
    Deletes an entire comparison session owned by the user.
    """
    logger.info(f"Deleting comparison session {comparison_id} for user {user.user_id}")
    session = get_comparison_details(user, comparison_id)
    session.delete()
    logger.info(f"Successfully deleted comparison session {comparison_id}")

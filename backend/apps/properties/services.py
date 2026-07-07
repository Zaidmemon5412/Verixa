"""
Services layer for the properties app.
Handles core business logic for Amenity and PropertyAmenity mappings.
"""
import uuid
import logging
from typing import Union
from django.core.exceptions import ValidationError
from django.db.models import QuerySet
from django.utils.translation import gettext_lazy as _
from .models import Amenity, PropertyAmenity, Property

logger = logging.getLogger(__name__)


# ==================================================
# AMENITY SERVICES
# ==================================================

def create_amenity(validated_data: dict) -> Amenity:
    """
    Creates a new Amenity profile.
    Name check is already handled by the serializer calling validate_amenity_name.
    """
    name = validated_data.get('amenity_name')
    logger.info(f"Creating amenity with name: '{name}'")
    return Amenity.objects.create(**validated_data)


def get_amenity(amenity_id: Union[uuid.UUID, str]) -> Amenity:
    """
    Retrieves an Amenity by ID. Raises Amenity.DoesNotExist if not found.
    """
    logger.info(f"Retrieving amenity with ID: {amenity_id}")
    return Amenity.objects.get(amenity_id=amenity_id)


def get_all_amenities() -> QuerySet[Amenity]:
    """
    Retrieves all Amenities.
    """
    logger.info("Retrieving all amenities")
    return Amenity.objects.all()


def update_amenity(amenity: Amenity, validated_data: dict) -> Amenity:
    """
    Updates fields on an existing Amenity.
    Saves and returns the updated Amenity instance.
    """
    logger.info(f"Updating amenity: {amenity.amenity_name} (ID: {amenity.amenity_id})")
    for field, value in validated_data.items():
        setattr(amenity, field, value)
    amenity.save()
    return amenity


def delete_amenity(amenity: Amenity) -> None:
    """
    Deletes an Amenity profile.
    """
    logger.info(f"Deleting amenity: {amenity.amenity_name} (ID: {amenity.amenity_id})")
    amenity.delete()


# ==================================================
# PROPERTY AMENITY SERVICES
# ==================================================

def assign_amenity_to_property(
    property_id: Union[uuid.UUID, str], 
    amenity_id: Union[uuid.UUID, str]
) -> PropertyAmenity:
    """
    Assigns an Amenity to a Property.
    Resolves Property and Amenity instances and validates them.
    Raises Property.DoesNotExist, Amenity.DoesNotExist, or ValidationError.
    """
    logger.info(f"Assigning amenity {amenity_id} to property {property_id}")
    
    # Resolve models
    try:
        property_obj = Property.objects.get(property_id=property_id)
    except (Property.DoesNotExist, ValidationError, ValueError):
        logger.warning(f"Property not found: {property_id}")
        raise Property.DoesNotExist(_("Property not found."))
        
    try:
        amenity_obj = Amenity.objects.get(amenity_id=amenity_id)
    except (Amenity.DoesNotExist, ValidationError, ValueError):
        logger.warning(f"Amenity not found: {amenity_id}")
        raise Amenity.DoesNotExist(_("Amenity not found."))

    # Check duplicate mapping
    if PropertyAmenity.objects.filter(property=property_obj, amenity=amenity_obj).exists():
        raise ValidationError(
            _("This property-amenity mapping already exists."),
            code='duplicate_mapping'
        )

    mapping = PropertyAmenity.objects.create(property=property_obj, amenity=amenity_obj)
    logger.info(f"Assigned successfully: Mapping ID {mapping.id}")
    return mapping


def remove_amenity_from_property(property_amenity_id: Union[int, str]) -> None:
    """
    Removes a Property-Amenity mapping.
    """
    logger.info(f"Removing property amenity mapping with ID: {property_amenity_id}")
    try:
        mapping = PropertyAmenity.objects.get(id=property_amenity_id)
    except (PropertyAmenity.DoesNotExist, ValueError):
        raise PropertyAmenity.DoesNotExist(_("Property-Amenity mapping not found."))
        
    mapping.delete()
    logger.info(f"Successfully removed mapping ID: {property_amenity_id}")


def get_property_amenities(property_id: Union[uuid.UUID, str]) -> QuerySet[PropertyAmenity]:
    """
    Retrieves all Amenity mappings for a specific Property.
    """
    logger.info(f"Retrieving mappings for property: {property_id}")
    return PropertyAmenity.objects.filter(property_id=property_id)


def get_amenity_properties(amenity_id: Union[uuid.UUID, str]) -> QuerySet[PropertyAmenity]:
    """
    Retrieves all Property mappings for a specific Amenity.
    """
    logger.info(f"Retrieving mappings for amenity: {amenity_id}")
    return PropertyAmenity.objects.filter(amenity_id=amenity_id)

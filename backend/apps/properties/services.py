"""
Services layer for the properties app.
Handles core business logic for Property CRUD operations.
"""
import logging
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.translation import gettext_lazy as _
from .models import Property
from .validators import validate_property_data

logger = logging.getLogger(__name__)


def create_property(validated_data: dict) -> Property:
    """
    Business logic to create a new property.
    Applies custom validations and creates the record.
    """
    logger.info("Validating and creating new property.")
    validate_property_data(validated_data)
    
    # Extract any nested or non-model fields if necessary in the future
    # Currently handled by simple creation
    property_instance = Property.objects.create(**validated_data)
    return property_instance


def update_property(property_instance: Property, validated_data: dict) -> Property:
    """
    Business logic to update an existing property.
    Applies custom validations before saving.
    """
    logger.info(f"Validating and updating property: {property_instance.property_id}")
    
    # Merge existing data with new data for comprehensive logic validation
    current_data = {
        'price': property_instance.price,
        'price_per_sqft': property_instance.price_per_sqft,
        'bhk': property_instance.bhk,
        'carpet_area': property_instance.carpet_area,
        'builtup_area': property_instance.builtup_area,
        'land_area': property_instance.land_area,
        'latitude': property_instance.latitude,
        'longitude': property_instance.longitude,
    }
    current_data.update(validated_data)
    
    validate_property_data(current_data)
    
    for field, value in validated_data.items():
        setattr(property_instance, field, value)
        
    property_instance.save()
    return property_instance


def delete_property(property_instance: Property) -> None:
    """
    Business logic to delete a property.
    Could handle any required pre-deletion hooks (e.g. archiving or removing images).
    """
    logger.info(f"Deleting property: {property_instance.property_id}")
    property_instance.delete()


def get_property(property_id: str) -> Property:
    """
    Retrieves a single property instance or raises exception.
    """
    try:
        return Property.objects.get(property_id=property_id)
    except Property.DoesNotExist:
        raise DjangoValidationError(_("Property does not exist."), code='not_found')

"""
Services layer for the locations app.
Handles core business logic for Locality and NearbyPlace management.
"""
import uuid
import logging
from typing import Union
from django.db.models import QuerySet
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from django.conf import settings
from .models import Locality, NearbyPlace

logger = logging.getLogger(__name__)


def _validate_supported_location(city: str, state: str) -> None:
    """
    Validates if the given city and state are supported.
    Case-insensitive match.
    """
    supported_cities = [c.lower() for c in getattr(settings, 'SUPPORTED_CITIES', [])]
    supported_states = [s.lower() for s in getattr(settings, 'SUPPORTED_STATES', [])]
    
    if city and city.lower() not in supported_cities:
        raise ValidationError(
            _("City '{city}' is not supported.").format(city=city),
            code='unsupported_city'
        )
    if state and state.lower() not in supported_states:
        raise ValidationError(
            _("State '{state}' is not supported.").format(state=state),
            code='unsupported_state'
        )


def create_locality(validated_data: dict) -> Locality:
    """
    Business logic to create a new geographic locality.
    Enforces geographic uniqueness constraints and supported city/state settings before creation.
    """
    name = validated_data.get('name')
    city = validated_data.get('city')
    state = validated_data.get('state')
    
    logger.info(f"Attempting to create locality: {name}, {city}, {state}")
    
    if city or state:
        _validate_supported_location(city, state)
        
    if name and city and state:
        if Locality.objects.filter(name__iexact=name, city__iexact=city, state__iexact=state).exists():
            raise ValidationError(
                _("A locality with this name, city, and state already exists."),
                code='duplicate_locality'
            )
            
    locality = Locality.objects.create(**validated_data)
    logger.info(f"Successfully created locality: {locality.name} (ID: {locality.locality_id})")
    return locality


def get_locality(locality_id: Union[uuid.UUID, str]) -> Locality:
    """
    Business logic to retrieve a locality by ID.
    Raises Locality.DoesNotExist if not found.
    """
    logger.info(f"Retrieving locality with ID: {locality_id}")
    return Locality.objects.get(locality_id=locality_id)


def get_all_localities() -> QuerySet[Locality]:
    """
    Business logic to retrieve all localities.
    Ordered by city and name.
    """
    logger.info("Retrieving all localities")
    return Locality.objects.all()


def update_locality(locality: Locality, validated_data: dict) -> Locality:
    """
    Business logic to update an existing locality instance.
    Checks uniqueness and location support if name, city, or state changes.
    """
    logger.info(f"Updating locality ID: {locality.locality_id}")
    
    name = validated_data.get('name', locality.name)
    city = validated_data.get('city', locality.city)
    state = validated_data.get('state', locality.state)
    
    if 'city' in validated_data or 'state' in validated_data:
        _validate_supported_location(city, state)
        
    if name != locality.name or city != locality.city or state != locality.state:
        if Locality.objects.filter(name__iexact=name, city__iexact=city, state__iexact=state).exclude(pk=locality.pk).exists():
            raise ValidationError(
                _("A locality with this name, city, and state already exists."),
                code='duplicate_locality'
            )
            
    for field, value in validated_data.items():
        setattr(locality, field, value)
        
    locality.save()
    logger.info(f"Successfully updated locality: {locality.name} (ID: {locality.locality_id})")
    return locality


def delete_locality(locality: Locality) -> None:
    """
    Business logic to delete a locality.
    """
    logger.info(f"Deleting locality: {locality.name} (ID: {locality.locality_id})")
    locality.delete()
    logger.info(f"Successfully deleted locality (ID: {locality.locality_id})")


def create_nearby_place(validated_data: dict) -> NearbyPlace:
    """
    Business logic to create a nearby place.
    """
    name = validated_data.get('name')
    logger.info(f"Attempting to create nearby place: {name}")
    
    nearby_place = NearbyPlace.objects.create(**validated_data)
    logger.info(f"Successfully created nearby place: {nearby_place.name} (ID: {nearby_place.place_id})")
    return nearby_place


def get_nearby_place(place_id: Union[uuid.UUID, str]) -> NearbyPlace:
    """
    Business logic to retrieve a nearby place by ID.
    Raises NearbyPlace.DoesNotExist if not found.
    """
    logger.info(f"Retrieving nearby place with ID: {place_id}")
    return NearbyPlace.objects.get(place_id=place_id)


def get_all_nearby_places() -> QuerySet[NearbyPlace]:
    """
    Business logic to retrieve all nearby places.
    Ordered by distance.
    """
    logger.info("Retrieving all nearby places")
    return NearbyPlace.objects.all()


def update_nearby_place(nearby_place: NearbyPlace, validated_data: dict) -> NearbyPlace:
    """
    Business logic to update an existing nearby place.
    """
    logger.info(f"Updating nearby place ID: {nearby_place.place_id}")
    
    for field, value in validated_data.items():
        setattr(nearby_place, field, value)
        
    nearby_place.save()
    logger.info(f"Successfully updated nearby place: {nearby_place.name} (ID: {nearby_place.place_id})")
    return nearby_place


def delete_nearby_place(nearby_place: NearbyPlace) -> None:
    """
    Business logic to delete a nearby place.
    """
    logger.info(f"Deleting nearby place: {nearby_place.name} (ID: {nearby_place.place_id})")
    nearby_place.delete()
    logger.info(f"Successfully deleted nearby place (ID: {nearby_place.place_id})")

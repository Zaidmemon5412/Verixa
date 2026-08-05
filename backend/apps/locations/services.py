"""
Services layer for the locations app.
Handles core business logic for Locality and NearbyPlace management.
"""
import uuid
import logging
from typing import Union, List, Optional, Any
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


def sync_locality_nearby_places(
    locality: Locality,
    radius_km: float = 5.0,
    force: bool = False
) -> dict:
    """
    Fetches nearby places from OpenStreetMap for a given locality and updates
    the NearbyPlace database records idempotently.
    Returns a dictionary of sync statistics.
    """
    from .osm_service import OSMNearbySearchService, validate_coordinates

    stats = {
        "imported": 0,
        "skipped": 0,
        "failed": 0,
    }

    is_valid, lat, lon = validate_coordinates(locality.latitude, locality.longitude)
    if not is_valid:
        logger.error(f"Locality {locality.name} ({locality.locality_id}) has invalid coordinates: lat={locality.latitude}, lon={locality.longitude}")
        stats["failed"] += 1
        return stats

    osm_service = OSMNearbySearchService()
    try:
        places_data = osm_service.fetch_nearby_places(lat, lon, radius_km=radius_km)
    except Exception as exc:
        logger.error(f"Failed to fetch OSM nearby places for locality {locality.name}: {exc}")
        stats["failed"] += 1
        return stats

    for place_dict in places_data:
        osm_id = place_dict.get("osm_id")
        name = place_dict.get("name")
        place_type = place_dict.get("type")
        latitude = place_dict.get("latitude")
        longitude = place_dict.get("longitude")

        # Idempotency check: Look up existing record by osm_id or composite properties
        existing = None
        if osm_id:
            existing = NearbyPlace.objects.filter(locality=locality, osm_id=osm_id).first()

        if not existing:
            existing = NearbyPlace.objects.filter(
                locality=locality,
                name=name,
                type=place_type,
                latitude=latitude,
                longitude=longitude
            ).first()

        if existing:
            if force:
                existing.distance_km = place_dict.get("distance_km")
                existing.distance = place_dict.get("distance")
                existing.travel_time = place_dict.get("travel_time", 0)
                existing.address = place_dict.get("address", "")
                existing.source = place_dict.get("source", "OpenStreetMap")
                if osm_id:
                    existing.osm_id = osm_id
                existing.save()
                stats["imported"] += 1
            else:
                stats["skipped"] += 1
        else:
            try:
                NearbyPlace.objects.create(
                    locality=locality,
                    name=name,
                    type=place_type,
                    distance_km=place_dict.get("distance_km"),
                    distance=place_dict.get("distance"),
                    travel_time=place_dict.get("travel_time", 0),
                    address=place_dict.get("address", ""),
                    latitude=latitude,
                    longitude=longitude,
                    source=place_dict.get("source", "OpenStreetMap"),
                    osm_id=osm_id,
                )
                stats["imported"] += 1
            except Exception as exc:
                logger.error(f"Error creating NearbyPlace record '{name}' for locality {locality.name}: {exc}")
                stats["failed"] += 1

    return stats


def get_property_nearby_places_with_distances(
    property_obj,
    category: Optional[str] = None,
    radius: Optional[Any] = None,
    limit: Optional[Any] = None
) -> List[dict]:
    """
    Calculates exact distances from a Property's coordinates to all nearby places
    stored in the database for its locality.
    """
    from .distance_engine import DistanceEngine

    lat = property_obj.latitude
    lon = property_obj.longitude
    if lat is None or lon is None:
        if property_obj.locality:
            lat = property_obj.locality.latitude
            lon = property_obj.locality.longitude

    if not property_obj.locality_id:
        return []

    # Fetch stored places from PostgreSQL DB (NO OpenStreetMap calls)
    nearby_qs = NearbyPlace.objects.filter(locality_id=property_obj.locality_id)
    return DistanceEngine.calculate_distances(
        origin_lat=lat,
        origin_lon=lon,
        nearby_places=nearby_qs,
        category=category,
        radius=radius,
        limit=limit
    )


def get_locality_nearby_places_with_distances(
    locality_obj,
    category: Optional[str] = None,
    radius: Optional[Any] = None,
    limit: Optional[Any] = None
) -> List[dict]:
    """
    Calculates exact distances from a Locality's coordinates to all nearby places
    stored in the database for that locality.
    """
    from .distance_engine import DistanceEngine

    lat = locality_obj.latitude
    lon = locality_obj.longitude

    # Fetch stored places from PostgreSQL DB (NO OpenStreetMap calls)
    nearby_qs = NearbyPlace.objects.filter(locality=locality_obj)
    return DistanceEngine.calculate_distances(
        origin_lat=lat,
        origin_lon=lon,
        nearby_places=nearby_qs,
        category=category,
        radius=radius,
        limit=limit
    )


def get_global_nearby_places_with_distances(
    locality_filter: Optional[str] = None,
    origin_lat: Optional[Any] = None,
    origin_lon: Optional[Any] = None,
    category: Optional[str] = None,
    radius: Optional[Any] = None,
    limit: Optional[Any] = None
) -> List[dict]:
    """
    Global nearby place search service querying stored PostgreSQL NearbyPlace records.
    """
    from django.db.models import Q
    from .distance_engine import DistanceEngine, validate_coordinates

    nearby_qs = NearbyPlace.objects.select_related('locality').all()

    target_locality = None
    if locality_filter:
        locality_str = str(locality_filter).strip()
        try:
            target_locality = Locality.objects.get(locality_id=locality_str)
        except Exception:
            target_locality = Locality.objects.filter(
                Q(name__iexact=locality_str) | Q(name__icontains=locality_str)
            ).first()

    if target_locality:
        nearby_qs = nearby_qs.filter(locality=target_locality)

    calc_lat = origin_lat
    calc_lon = origin_lon

    if (calc_lat is None or calc_lon is None) and target_locality:
        calc_lat = target_locality.latitude
        calc_lon = target_locality.longitude

    is_valid, float_lat, float_lon = validate_coordinates(calc_lat, calc_lon)
    if not is_valid:
        if target_locality:
            float_lat = float(target_locality.latitude)
            float_lon = float(target_locality.longitude)
        else:
            first_loc = Locality.objects.first()
            if first_loc:
                float_lat = float(first_loc.latitude)
                float_lon = float(first_loc.longitude)

    if float_lat is None or float_lon is None:
        return []

    return DistanceEngine.calculate_distances(
        origin_lat=float_lat,
        origin_lon=float_lon,
        nearby_places=nearby_qs,
        category=category,
        radius=radius,
        limit=limit
    )



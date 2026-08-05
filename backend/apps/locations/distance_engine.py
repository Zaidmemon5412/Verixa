"""
Distance Calculation Engine for Nearby Intelligence Module.

Provides reusable, high-performance GIS distance calculation, sorting, and filtering
for Properties, Localities, and arbitrary geographic coordinates.
"""
import math
import logging
from typing import List, Dict, Any, Optional, Tuple, Union
from decimal import Decimal, InvalidOperation

logger = logging.getLogger(__name__)


def validate_coordinates(lat: Any, lon: Any) -> Tuple[bool, Optional[float], Optional[float]]:
    """
    Validates latitude and longitude values.
    Returns (is_valid, float_lat, float_lon).
    """
    if lat is None or lon is None:
        return False, None, None
    try:
        float_lat = float(lat)
        float_lon = float(lon)
        if -90.0 <= float_lat <= 90.0 and -180.0 <= float_lon <= 180.0:
            return True, float_lat, float_lon
        return False, None, None
    except (ValueError, TypeError):
        return False, None, None


def calculate_haversine_distance_m_and_km(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> Tuple[int, float]:
    """
    Calculates exact straight-line geographical distance between two points
    using the Haversine formula.
    
    Returns tuple: (distance_m: int, distance_km: float)
    """
    R_meters = 6371000.0  # Earth radius in meters
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    
    distance_m = int(round(R_meters * c))
    distance_km = round(distance_m / 1000.0, 2)
    return distance_m, distance_km


def parse_radius_meters(radius_param: Any) -> Optional[int]:
    """
    Parses radius query parameter into meters.
    If radius <= 50, treats input as kilometers and converts to meters.
    Example: radius=5 -> 5000 meters; radius=5000 -> 5000 meters.
    """
    if radius_param is None or str(radius_param).strip() == "":
        return None
    try:
        val = float(radius_param)
        if val <= 0:
            return None
        if val <= 50.0:
            # Value provided in KM -> convert to meters
            return int(round(val * 1000.0))
        return int(round(val))
    except (ValueError, TypeError):
        return None


class DistanceEngine:
    """
    Reusable GIS service to compute distance from an origin point to nearby places,
    filter by category/radius, and return nearest places sorted by distance.
    """

    @classmethod
    def calculate_distances(
        cls,
        origin_lat: Any,
        origin_lon: Any,
        nearby_places: Any,
        category: Optional[str] = None,
        radius: Optional[Any] = None,
        limit: Optional[Any] = None,
    ) -> List[Dict[str, Any]]:
        """
        Calculates distance from (origin_lat, origin_lon) to each place in nearby_places.
        
        Parameters:
        - origin_lat: Latitude of origin (Property / Locality center)
        - origin_lon: Longitude of origin
        - nearby_places: QuerySet or iterable of NearbyPlace instances
        - category: Optional category filter string (e.g. "School", "Hospital")
        - radius: Optional radius limit in meters (or KM if <= 50)
        - limit: Optional max number of results to return
        
        Returns:
        - List of dicts ordered by distance_m ASC (nearest first)
        """
        is_valid, float_origin_lat, float_origin_lon = validate_coordinates(origin_lat, origin_lon)
        if not is_valid:
            logger.warning(
                f"DistanceEngine: Invalid origin coordinates supplied: lat={origin_lat}, lon={origin_lon}"
            )
            return []

        if not nearby_places:
            return []

        radius_meters = parse_radius_meters(radius)
        
        # Format category query filter (support comma-separated or single)
        target_categories = set()
        if category and str(category).strip():
            for cat_item in str(category).split(','):
                cat_cleaned = cat_item.strip().lower()
                if cat_cleaned:
                    target_categories.add(cat_cleaned)

        parsed_limit = None
        if limit is not None:
            try:
                parsed_limit = max(1, int(limit))
            except (ValueError, TypeError):
                parsed_limit = None

        processed_results = []

        for place in nearby_places:
            # Handle both model objects and dicts
            p_lat = getattr(place, 'latitude', None) if not isinstance(place, dict) else place.get('latitude')
            p_lon = getattr(place, 'longitude', None) if not isinstance(place, dict) else place.get('longitude')

            is_p_valid, float_p_lat, float_p_lon = validate_coordinates(p_lat, p_lon)
            if not is_p_valid:
                continue

            p_type = (
                getattr(place, 'type', '') if not isinstance(place, dict) else place.get('type', '')
            ) or ""
            
            # Category filter
            if target_categories:
                p_type_lower = p_type.strip().lower()
                if p_type_lower not in target_categories:
                    # Also check partial/alias match
                    match_found = False
                    for target_cat in target_categories:
                        if target_cat in p_type_lower or p_type_lower in target_cat:
                            match_found = True
                            break
                    if not match_found:
                        continue

            # Calculate Haversine distance from origin coordinates
            distance_m, distance_km = calculate_haversine_distance_m_and_km(
                float_origin_lat, float_origin_lon, float_p_lat, float_p_lon
            )

            # Radius filter
            if radius_meters is not None and distance_m > radius_meters:
                continue

            place_id = getattr(place, 'place_id', None) if not isinstance(place, dict) else place.get('place_id')
            name = getattr(place, 'name', '') if not isinstance(place, dict) else place.get('name', '')
            address = getattr(place, 'address', '') if not isinstance(place, dict) else place.get('address', '')
            travel_time = getattr(place, 'travel_time', 0) if not isinstance(place, dict) else place.get('travel_time', 0)
            source = getattr(place, 'source', 'OpenStreetMap') if not isinstance(place, dict) else place.get('source', 'OpenStreetMap')
            rating = getattr(place, 'rating', None) if not isinstance(place, dict) else place.get('rating')

            processed_results.append({
                "place_id": str(place_id) if place_id else None,
                "name": name or f"Unnamed {p_type}",
                "category": p_type,
                "type": p_type,
                "distance_m": distance_m,
                "distance_km": distance_km,
                "travel_time": int(travel_time) if travel_time is not None else 0,
                "address": address or "",
                "latitude": float_p_lat,
                "longitude": float_p_lon,
                "source": source or "OpenStreetMap",
                "rating": float(rating) if rating is not None else None,
            })

        # Sort by distance_m ascending (nearest first)
        processed_results.sort(key=lambda item: item["distance_m"])

        # Apply limit if requested
        if parsed_limit is not None:
            processed_results = processed_results[:parsed_limit]

        return processed_results

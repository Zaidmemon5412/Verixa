"""
Views for the locations app.
Handles incoming REST API requests for Locality and NearbyPlace resources,
invokes service functions, and returns standardized JSON responses.
"""
import logging
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.views import APIView

from .models import Locality, NearbyPlace
from .serializers import (
    LocalitySerializer,
    LocalityCreateSerializer,
    LocalityUpdateSerializer,
    NearbyPlaceSerializer,
    NearbyPlaceCreateSerializer,
    NearbyPlaceUpdateSerializer,
    NearbyPlaceDistanceSerializer,
)
from .services import (
    create_locality,
    get_locality,
    get_all_localities,
    update_locality,
    delete_locality,
    create_nearby_place,
    get_nearby_place,
    get_all_nearby_places,
    update_nearby_place,
    delete_nearby_place,
    get_locality_nearby_places_with_distances,
    get_global_nearby_places_with_distances,
    get_locations_cache_version,
)
from common.cache_headers import apply_public_edge_cache, safe_cache_key

logger = logging.getLogger(__name__)


class LocalityViewSet(viewsets.ViewSet):
    """
    ViewSet to manage Locality resources.
    Delegates all database writes and reads to the services layer.
    """
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        """
        GET /localities/
        Retrieves all localities.
        """
        try:
            from django.core.cache import cache
            cache_ver = get_locations_cache_version()
            cache_key = f"verixa_localities_list_v{cache_ver}"
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                resp = Response({
                    "success": True,
                    "message": "Localities retrieved successfully.",
                    "data": cached_data
                }, status=status.HTTP_200_OK)
                return apply_public_edge_cache(resp, max_age=120, s_maxage=600, swr=86400, cache_status='HIT')

            localities = get_all_localities()
            serializer = LocalitySerializer(localities, many=True)
            cache.set(cache_key, serializer.data, timeout=600)
            resp = Response({
                "success": True,
                "message": "Localities retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
            return apply_public_edge_cache(resp, max_age=120, s_maxage=600, swr=86400, cache_status='MISS')
        except Exception as e:
            logger.exception("Error listing localities")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        GET /localities/<locality_id>/
        Retrieves a single locality by ID.
        """
        try:
            locality = get_locality(pk)
            serializer = LocalitySerializer(locality)
            resp = Response({
                "success": True,
                "message": "Locality retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
            return apply_public_edge_cache(resp, max_age=120, s_maxage=600, swr=86400)
        except (Locality.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Locality not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error retrieving locality with ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], url_path='nearby')
    def nearby(self, request, pk=None, *args, **kwargs):
        """
        GET /localities/<locality_id>/nearby/
        Retrieves nearby places for a locality with calculated distances.
        Supports query parameters: category, radius, limit.
        """
        from django.core.cache import cache
        category = request.query_params.get('category')
        radius = request.query_params.get('radius')
        limit = request.query_params.get('limit')
        cache_ver = get_locations_cache_version()
        cache_key = safe_cache_key(f"verixa_loc_nearby_v{cache_ver}", pk, category, radius, limit)
        cached_payload = cache.get(cache_key)
        if cached_payload is not None:
            resp = Response(cached_payload, status=status.HTTP_200_OK)
            return apply_public_edge_cache(resp, max_age=300, s_maxage=600, swr=86400, cache_status='HIT')

        try:
            locality = get_locality(pk)
        except (Locality.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Locality not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        nearby_places_list = get_locality_nearby_places_with_distances(
            locality_obj=locality,
            category=category,
            radius=radius,
            limit=limit
        )

        payload = {
            "success": True,
            "message": "Locality nearby places retrieved successfully.",
            "locality_id": str(locality.locality_id),
            "locality": locality.name,
            "city": locality.city,
            "total_count": len(nearby_places_list),
            "nearby_places": nearby_places_list
        }
        cache.set(cache_key, payload, timeout=600)
        resp = Response(payload, status=status.HTTP_200_OK)
        return apply_public_edge_cache(resp, max_age=300, s_maxage=600, swr=86400, cache_status='MISS')

    @action(detail=True, methods=['get'], url_path='analytics')
    def analytics(self, request, pk=None, *args, **kwargs):
        """
        GET /localities/<locality_id>/analytics/
        Calculates live database metrics and dynamic scorecard for locality using LocalityScorecardEngine.
        """
        from django.core.cache import cache
        from apps.properties.services import get_properties_cache_version
        from .scorecard_engine import LocalityScorecardEngine

        loc_ver = get_locations_cache_version()
        prop_ver = get_properties_cache_version()
        cache_key = safe_cache_key(f"verixa_loc_analytics_v{loc_ver}_{prop_ver}", pk)
        cached_payload = cache.get(cache_key)
        if cached_payload is not None:
            resp = Response(cached_payload, status=status.HTTP_200_OK)
            return apply_public_edge_cache(resp, max_age=120, s_maxage=600, swr=86400, cache_status='HIT')

        try:
            locality = get_locality(pk)
        except (Locality.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Locality not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        engine = LocalityScorecardEngine(locality)
        scorecard_data = engine.calculate_metrics_and_scores()
        scorecard_data["success"] = True

        cache.set(cache_key, scorecard_data, timeout=600)
        resp = Response(scorecard_data, status=status.HTTP_200_OK)
        return apply_public_edge_cache(resp, max_age=120, s_maxage=600, swr=86400, cache_status='MISS')


    def create(self, request, *args, **kwargs):
        """
        POST /localities/
        Creates a new locality.
        """
        serializer = LocalityCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            locality = create_locality(serializer.validated_data)
            response_data = LocalitySerializer(locality).data
            return Response({
                "success": True,
                "message": "Locality created successfully.",
                "data": response_data
            }, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            return Response({
                "success": False,
                "message": "A database constraint violation occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error creating locality")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, pk=None, *args, **kwargs):
        """
        PUT /localities/<locality_id>/
        Updates an existing locality.
        """
        try:
            locality = get_locality(pk)
        except (Locality.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Locality not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = LocalityUpdateSerializer(locality, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            updated_locality = update_locality(locality, serializer.validated_data)
            response_data = LocalitySerializer(updated_locality).data
            return Response({
                "success": True,
                "message": "Locality updated successfully.",
                "data": response_data
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            return Response({
                "success": False,
                "message": "A database constraint violation occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error updating locality with ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, pk=None, *args, **kwargs):
        """
        DELETE /localities/<locality_id>/
        Deletes a locality.
        """
        try:
            locality = get_locality(pk)
        except (Locality.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Locality not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            delete_locality(locality)
            return Response({
                "success": True,
                "message": "Locality deleted successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Error deleting locality with ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NearbyPlaceViewSet(viewsets.ViewSet):
    """
    ViewSet to manage NearbyPlace resources.
    Delegates all database writes and reads to the services layer.
    """
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        """
        GET /nearby-places/
        Retrieves all nearby places.
        """
        try:
            places = get_all_nearby_places()
            serializer = NearbyPlaceSerializer(places, many=True)
            return Response({
                "success": True,
                "message": "Nearby places retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error listing nearby places")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        GET /nearby-places/<place_id>/
        Retrieves a single nearby place by ID.
        """
        try:
            place = get_nearby_place(pk)
            serializer = NearbyPlaceSerializer(place)
            return Response({
                "success": True,
                "message": "Nearby place retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except (NearbyPlace.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Nearby place not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error retrieving nearby place with ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        """
        POST /nearby-places/
        Creates a new nearby place.
        """
        serializer = NearbyPlaceCreateSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            # If the validation failed because the locality was not found
            if 'locality' in errors and any("does not exist" in str(err) for err in errors['locality']):
                return Response({
                    "success": False,
                    "message": "Locality not found.",
                    "data": errors
                }, status=status.HTTP_404_NOT_FOUND)
                
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            place = create_nearby_place(serializer.validated_data)
            response_data = NearbyPlaceSerializer(place).data
            return Response({
                "success": True,
                "message": "Nearby place created successfully.",
                "data": response_data
            }, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            return Response({
                "success": False,
                "message": "A database constraint violation occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error creating nearby place")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, pk=None, *args, **kwargs):
        """
        PUT /nearby-places/<place_id>/
        Updates an existing nearby place.
        """
        try:
            place = get_nearby_place(pk)
        except (NearbyPlace.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Nearby place not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = NearbyPlaceUpdateSerializer(place, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            updated_place = update_nearby_place(place, serializer.validated_data)
            response_data = NearbyPlaceSerializer(updated_place).data
            return Response({
                "success": True,
                "message": "Nearby place updated successfully.",
                "data": response_data
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            return Response({
                "success": False,
                "message": "A database constraint violation occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error updating nearby place with ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, pk=None, *args, **kwargs):
        """
        DELETE /nearby-places/<place_id>/
        Deletes a nearby place.
        """
        try:
            place = get_nearby_place(pk)
        except (NearbyPlace.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Nearby place not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            delete_nearby_place(place)
            return Response({
                "success": True,
                "message": "Nearby place deleted successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Error deleting nearby place with ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GlobalNearbyPlacesAPIView(APIView):
    """
    GET /api/nearby/
    Global nearby place search endpoint querying stored PostgreSQL database records.
    Supports query parameters: locality, category, radius, limit, lat, lon.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        from django.core.cache import cache

        locality_param = request.query_params.get('locality')
        category = request.query_params.get('category')
        radius = request.query_params.get('radius')
        limit = request.query_params.get('limit')
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')

        cache_ver = get_locations_cache_version()
        cache_key = safe_cache_key(
            f"verixa_global_nearby_v2_{cache_ver}",
            locality_param,
            category,
            radius,
            limit,
            lat,
            lon,
        )
        cached_payload = cache.get(cache_key)
        if cached_payload is not None:
            resp = Response(cached_payload, status=status.HTTP_200_OK)
            return apply_public_edge_cache(resp, max_age=300, s_maxage=600, swr=86400, cache_status='HIT')

        try:
            nearby_places_list = get_global_nearby_places_with_distances(
                locality_filter=locality_param,
                origin_lat=lat,
                origin_lon=lon,
                category=category,
                radius=radius,
                limit=limit
            )

            payload = {
                "success": True,
                "message": "Nearby places retrieved successfully.",
                "total_count": len(nearby_places_list),
                "nearby_places": nearby_places_list
            }
            cache.set(cache_key, payload, timeout=600)
            resp = Response(payload, status=status.HTTP_200_OK)
            return apply_public_edge_cache(resp, max_age=300, s_maxage=600, swr=86400, cache_status='MISS')
        except Exception as e:
            logger.exception("Error querying global nearby places")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

from .models import Locality, NearbyPlace
from .serializers import (
    LocalitySerializer,
    LocalityCreateSerializer,
    LocalityUpdateSerializer,
    NearbyPlaceSerializer,
    NearbyPlaceCreateSerializer,
    NearbyPlaceUpdateSerializer,
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
)

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
            localities = get_all_localities()
            serializer = LocalitySerializer(localities, many=True)
            return Response({
                "success": True,
                "message": "Localities retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
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
            return Response({
                "success": True,
                "message": "Locality retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
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

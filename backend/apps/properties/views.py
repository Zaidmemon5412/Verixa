"""
Views for the properties app.
Handles incoming REST API requests for Amenity and PropertyAmenity resources,
invokes services, and returns standardized JSON responses.
"""
import logging
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Amenity, PropertyAmenity, Property
from .serializers import (
    AmenitySerializer,
    AmenityCreateSerializer,
    AmenityUpdateSerializer,
    PropertyAmenitySerializer,
    PropertyAmenityCreateSerializer,
)
from .services import (
    create_amenity,
    get_amenity,
    get_all_amenities,
    update_amenity,
    delete_amenity,
    assign_amenity_to_property,
    remove_amenity_from_property,
    get_property_amenities,
    get_amenity_properties,
)

logger = logging.getLogger(__name__)


class AmenityViewSet(viewsets.ViewSet):
    """
    ViewSet for managing standard amenities.
    """
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        """
        GET /amenities/
        """
        try:
            amenities = get_all_amenities()
            serializer = AmenitySerializer(amenities, many=True)
            return Response({
                "success": True,
                "message": "Amenities retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error listing amenities")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        GET /amenities/<amenity_id>/
        """
        try:
            amenity = get_amenity(pk)
            serializer = AmenitySerializer(amenity)
            return Response({
                "success": True,
                "message": "Amenity retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except (Amenity.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Amenity not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error retrieving amenity ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        """
        POST /amenities/
        """
        serializer = AmenityCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            amenity = create_amenity(serializer.validated_data)
            response_data = AmenitySerializer(amenity).data
            return Response({
                "success": True,
                "message": "Amenity created successfully.",
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
            logger.exception("Error creating amenity")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, pk=None, *args, **kwargs):
        """
        PUT /amenities/<amenity_id>/
        """
        try:
            amenity = get_amenity(pk)
        except (Amenity.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Amenity not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = AmenityUpdateSerializer(amenity, data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            updated_amenity = update_amenity(amenity, serializer.validated_data)
            response_data = AmenitySerializer(updated_amenity).data
            return Response({
                "success": True,
                "message": "Amenity updated successfully.",
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
            logger.exception(f"Error updating amenity ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, pk=None, *args, **kwargs):
        """
        DELETE /amenities/<amenity_id>/
        """
        try:
            amenity = get_amenity(pk)
        except (Amenity.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Amenity not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            delete_amenity(amenity)
            return Response({
                "success": True,
                "message": "Amenity deleted successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Error deleting amenity ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PropertyAmenityViewSet(viewsets.ViewSet):
    """
    ViewSet for assigning/removing amenities to/from properties.
    """
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        """
        GET /property-amenities/
        Optionally filter by property_id or amenity_id using query parameters.
        """
        property_id = request.query_params.get('property_id')
        amenity_id = request.query_params.get('amenity_id')

        try:
            if property_id:
                # Validate Property exists
                if not Property.objects.filter(property_id=property_id).exists():
                    return Response({
                        "success": False,
                        "message": "Property not found.",
                        "data": {}
                    }, status=status.HTTP_404_NOT_FOUND)
                mappings = get_property_amenities(property_id)
            elif amenity_id:
                # Validate Amenity exists
                if not Amenity.objects.filter(amenity_id=amenity_id).exists():
                    return Response({
                        "success": False,
                        "message": "Amenity not found.",
                        "data": {}
                    }, status=status.HTTP_404_NOT_FOUND)
                mappings = get_amenity_properties(amenity_id)
            else:
                mappings = PropertyAmenity.objects.all()

            serializer = PropertyAmenitySerializer(mappings, many=True)
            return Response({
                "success": True,
                "message": "Property-Amenity mappings retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except (DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Invalid ID format provided in query parameters.",
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error listing property amenities")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        GET /property-amenities/<id>/
        """
        try:
            mapping = PropertyAmenity.objects.get(id=pk)
            serializer = PropertyAmenitySerializer(mapping)
            return Response({
                "success": True,
                "message": "Property-Amenity mapping retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except (PropertyAmenity.DoesNotExist, ValueError):
            return Response({
                "success": False,
                "message": "Property-Amenity mapping not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error retrieving mapping ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        """
        POST /property-amenities/
        """
        serializer = PropertyAmenityCreateSerializer(data=request.data)
        if not serializer.is_valid():
            # Match required HTTP 404 responses for non-existent Property/Amenity
            errors = serializer.errors
            if 'property_id' in errors:
                return Response({
                    "success": False,
                    "message": "Property not found.",
                    "data": errors
                }, status=status.HTTP_404_NOT_FOUND)
            if 'amenity_id' in errors:
                return Response({
                    "success": False,
                    "message": "Amenity not found.",
                    "data": errors
                }, status=status.HTTP_404_NOT_FOUND)
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": errors
            }, status=status.HTTP_400_BAD_REQUEST)

        property_val = request.data.get('property_id')
        amenity_val = request.data.get('amenity_id')

        try:
            mapping = assign_amenity_to_property(property_val, amenity_val)
            response_data = PropertyAmenitySerializer(mapping).data
            return Response({
                "success": True,
                "message": "Amenity assigned to property successfully.",
                "data": response_data
            }, status=status.HTTP_201_CREATED)
        except Property.DoesNotExist:
            return Response({
                "success": False,
                "message": "Property not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
        except Amenity.DoesNotExist:
            return Response({
                "success": False,
                "message": "Amenity not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            return Response({
                "success": False,
                "message": "A database constraint violation occurred (e.g. duplicate mapping).",
                "data": {"detail": str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error assigning amenity to property")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, pk=None, *args, **kwargs):
        """
        DELETE /property-amenities/<id>/
        """
        try:
            remove_amenity_from_property(pk)
            return Response({
                "success": True,
                "message": "Amenity removed from property successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except PropertyAmenity.DoesNotExist:
            return Response({
                "success": False,
                "message": "Property-Amenity mapping not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error removing mapping ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

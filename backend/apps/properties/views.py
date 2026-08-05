"""
Views for the properties app.
Handles incoming REST API requests for Amenity, PropertyAmenity, PropertyImage, and PropertyDocument resources.
"""
import logging
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from rest_framework import viewsets, status
from rest_framework.decorators import action
from apps.locations.serializers import NearbyPlaceSerializer
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Amenity, PropertyAmenity, Property, PropertyImage, PropertyDocument, PropertyListing, PropertyLegal
from .serializers import (
    AmenitySerializer,
    AmenityCreateSerializer,
    AmenityUpdateSerializer,
    PropertyAmenitySerializer,
    PropertyAmenityCreateSerializer,
    PropertyImageSerializer,
    PropertyDocumentSerializer,
    PropertySerializer,
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyCreateSerializer,
    PropertyUpdateSerializer,
    PropertyListingSerializer,
    PropertyLegalSerializer,
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
    PropertyImageService,
    PropertyDocumentService,
    create_property,
    get_property,
    list_properties,
    update_property,
    delete_property,
    create_listing,
    get_listing,
    list_listings,
    update_listing,
    delete_listing,
    create_legal_record,
    get_legal_record,
    list_legal_records,
    update_legal_record,
    delete_legal_record,
)
from .pagination import PropertyPagination, StandardResultsSetPagination
from .permissions import IsAdminOrReadOnly, IsListingOwnerOrBuilderOrAdmin

logger = logging.getLogger(__name__)


# ==================================================
# AMENITY VIEWS
# ==================================================

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


# ==================================================
# PROPERTY AMENITY VIEWS
# ==================================================

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


# ==================================================
# PROPERTY IMAGE AND DOCUMENT API VIEW HELPER & ENDPOINTS
# ==================================================

def api_response(success, data=None, message="", errors=None, status_code=status.HTTP_200_OK):
    """
    Standardized response utility to keep all endpoints matching:
    {"success": bool, "data": ..., "message": "...", "errors": ...}
    """
    return Response({
        "success": success,
        "data": data,
        "message": message,
        "errors": errors
    }, status=status_code)


class PropertyImageListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, property_id):
        """
        List all images for a property ordered by display_order.
        """
        try:
            property_obj = Property.objects.get(pk=property_id)
            images = PropertyImage.objects.filter(property=property_obj).order_by('display_order')
            serializer = PropertyImageSerializer(images, many=True)
            return api_response(success=True, data=serializer.data, message="Images retrieved successfully.")
        except Property.DoesNotExist:
            return api_response(success=False, message="Property not found.", status_code=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, property_id):
        """
        Upload multiple images for a property.
        """
        try:
            files = request.FILES.getlist('image') or request.FILES.getlist('images') or request.FILES.getlist('files') or request.FILES.getlist('file')
            
            if not files and request.FILES:
                first_key = list(request.FILES.keys())[0]
                files = request.FILES.getlist(first_key)

            if not files:
                return api_response(
                    success=False, 
                    message="No image files uploaded. Please upload files under 'image' or 'files' key.", 
                    status_code=status.HTTP_400_BAD_REQUEST
                )
                
            # Perform field validation using serializer
            validation_data = request.data.copy()
            validation_data['property'] = property_id
            serializer = PropertyImageSerializer(data=validation_data, partial=True)
            if not serializer.is_valid():
                return api_response(
                    success=False,
                    message="Validation failed.",
                    errors=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
                
            # Extract normalised image type from validated serializer data or fallback
            image_type = serializer.validated_data.get('image_type', 'elevation')
            
            created_images = PropertyImageService.upload_images(
                property_id=property_id, 
                files=files, 
                image_type=image_type
            )
            serializer_response = PropertyImageSerializer(created_images, many=True)
            return api_response(
                success=True, 
                data=serializer_response.data, 
                message="Images uploaded successfully.", 
                status_code=status.HTTP_201_CREATED
            )
            
        except Property.DoesNotExist:
            return api_response(success=False, message="Property not found.", status_code=status.HTTP_404_NOT_FOUND)
        except DjangoValidationError as e:
            errors = e.message_dict if hasattr(e, 'message_dict') else e.messages
            return api_response(success=False, message="Validation error occurred.", errors=errors, status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PropertyImageDetailView(APIView):
    def get(self, request, image_id):
        """
        Retrieve details of a single property image.
        """
        try:
            img = PropertyImage.objects.get(pk=image_id)
            serializer = PropertyImageSerializer(img)
            return api_response(success=True, data=serializer.data, message="Image retrieved successfully.")
        except PropertyImage.DoesNotExist:
            return api_response(success=False, message="Image not found.", status_code=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, image_id):
        return self._update(request, image_id, partial=False)

    def patch(self, request, image_id):
        return self._update(request, image_id, partial=True)

    def _update(self, request, image_id, partial=False):
        """
        Update fields on a property image (like display_order, is_primary).
        """
        try:
            img = PropertyImage.objects.get(pk=image_id)
            serializer = PropertyImageSerializer(img, data=request.data, partial=partial)
            if serializer.is_valid():
                serializer.save()
                return api_response(success=True, data=serializer.data, message="Image updated successfully.")
            return api_response(success=False, message="Validation failed.", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
        except PropertyImage.DoesNotExist:
            return api_response(success=False, message="Image not found.", status_code=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, image_id):
        """
        Delete a property image and remove it from underlying storage.
        """
        try:
            PropertyImageService.delete_image(image_id)
            return api_response(success=True, message="Image deleted successfully.")
        except PropertyImage.DoesNotExist:
            return api_response(success=False, message="Image not found.", status_code=status.HTTP_404_NOT_FOUND)
        except DjangoValidationError as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PropertyImageSetPrimaryView(APIView):
    def post(self, request, image_id):
        """
        Set this image as primary for its property.
        """
        try:
            img = PropertyImageService.set_primary_image(image_id)
            serializer = PropertyImageSerializer(img)
            return api_response(success=True, data=serializer.data, message="Primary image updated successfully.")
        except PropertyImage.DoesNotExist:
            return api_response(success=False, message="Image not found.", status_code=status.HTTP_404_NOT_FOUND)
        except DjangoValidationError as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PropertyImageReorderView(APIView):
    def post(self, request, property_id):
        """
        Reorder property images by matching indices of ordered_id_list or ordered_ids.
        """
        try:
            ordered_id_list = request.data.get('ordered_id_list', request.data.get('ordered_ids', []))
            if not isinstance(ordered_id_list, list):
                return api_response(success=False, message="ordered_id_list/ordered_ids must be a list of image IDs.", status_code=status.HTTP_400_BAD_REQUEST)
                
            updated_images = PropertyImageService.reorder_images(property_id, ordered_id_list)
            serializer = PropertyImageSerializer(updated_images, many=True)
            return api_response(success=True, data=serializer.data, message="Images reordered successfully.")
        except Property.DoesNotExist:
            return api_response(success=False, message="Property not found.", status_code=status.HTTP_404_NOT_FOUND)
        except DjangoValidationError as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PropertyDocumentListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, property_id):
        """
        List all documents for a property.
        """
        try:
            property_obj = Property.objects.get(pk=property_id)
            documents = PropertyDocument.objects.filter(property=property_obj).order_by('-uploaded_at')
            serializer = PropertyDocumentSerializer(documents, many=True)
            return api_response(success=True, data=serializer.data, message="Documents retrieved successfully.")
        except Property.DoesNotExist:
            return api_response(success=False, message="Property not found.", status_code=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, property_id):
        """
        Upload one or more documents for a property.
        """
        try:
            files = request.FILES.getlist('file') or request.FILES.getlist('files') or request.FILES.getlist('document') or request.FILES.getlist('documents')
            
            if not files and 'file' in request.FILES:
                files = request.FILES['file']
            elif not files and request.FILES:
                first_key = list(request.FILES.keys())[0]
                files = request.FILES.getlist(first_key)
                
            if not files:
                return api_response(
                    success=False, 
                    message="No document files uploaded. Please upload files under 'file' or 'files' key.", 
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            # Perform serializer validation to enforce creation rules (e.g. status flags read-only)
            validation_data = request.data.copy()
            validation_data['property'] = property_id
            serializer = PropertyDocumentSerializer(data=validation_data)
            if not serializer.is_valid():
                return api_response(
                    success=False, 
                    message="Validation failed.", 
                    errors=serializer.errors, 
                    status_code=status.HTTP_400_BAD_REQUEST
                )
                
            # If files is a list with 1 item, treat it as a single upload to serialize as a dictionary (for standard single API test formats)
            is_single = False
            if isinstance(files, list):
                if len(files) == 1:
                    files = files[0]
                    is_single = True
                else:
                    is_single = False
            else:
                is_single = True

            document_type = serializer.validated_data.get('document_type', 'other')
            document_name = request.data.get('document_name', None)
            
            created_docs = PropertyDocumentService.upload_document(
                property_id=property_id,
                files=files,
                document_type=document_type,
                document_name=document_name
            )
            
            if is_single or not isinstance(created_docs, list):
                serializer_response = PropertyDocumentSerializer(created_docs)
            else:
                serializer_response = PropertyDocumentSerializer(created_docs, many=True)
                
            return api_response(
                success=True, 
                data=serializer_response.data, 
                message="Documents uploaded successfully.", 
                status_code=status.HTTP_201_CREATED
            )
            
        except Property.DoesNotExist:
            return api_response(success=False, message="Property not found.", status_code=status.HTTP_404_NOT_FOUND)
        except DjangoValidationError as e:
            errors = e.message_dict if hasattr(e, 'message_dict') else e.messages
            return api_response(success=False, message="Validation error occurred.", errors=errors, status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PropertyDocumentDetailView(APIView):
    def get(self, request, doc_id):
        """
        Retrieve details of a single property document.
        """
        try:
            doc = PropertyDocument.objects.get(pk=doc_id)
            serializer = PropertyDocumentSerializer(doc)
            return api_response(success=True, data=serializer.data, message="Document retrieved successfully.")
        except PropertyDocument.DoesNotExist:
            return api_response(success=False, message="Document not found.", status_code=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, doc_id):
        return self._update(request, doc_id, partial=False)

    def patch(self, request, doc_id):
        return self._update(request, doc_id, partial=True)

    def _update(self, request, doc_id, partial=False):
        """
        Update non-status fields of a property document.
        """
        try:
            doc = PropertyDocument.objects.get(pk=doc_id)
            serializer = PropertyDocumentSerializer(doc, data=request.data, partial=partial)
            if serializer.is_valid():
                serializer.save()
                return api_response(success=True, data=serializer.data, message="Document updated successfully.")
            return api_response(success=False, message="Validation failed.", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
        except PropertyDocument.DoesNotExist:
            return api_response(success=False, message="Document not found.", status_code=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, doc_id):
        """
        Delete a property document and remove it from underlying storage.
        """
        try:
            PropertyDocumentService.delete_document(doc_id)
            return api_response(success=True, message="Document deleted successfully.")
        except PropertyDocument.DoesNotExist:
            return api_response(success=False, message="Document not found.", status_code=status.HTTP_404_NOT_FOUND)
        except DjangoValidationError as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return api_response(success=False, message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================================================
# PROPERTY, LISTING & LEGAL VIEWSETS
# ==================================================

class PropertyViewSet(viewsets.ViewSet):
    """
    ViewSet for managing Property instances.
    Endpoints:
    - GET /api/properties/
    - POST /api/properties/
    - GET /api/properties/<property_id>/
    - PUT /api/properties/<property_id>/
    - PATCH /api/properties/<property_id>/
    - DELETE /api/properties/<property_id>/
    """
    permission_classes = [AllowAny]
    pagination_class = PropertyPagination

    def list(self, request, *args, **kwargs):
        try:
            queryset = list_properties(request.query_params)
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            if page is not None:
                serializer = PropertyListSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)

            serializer = PropertyListSerializer(queryset, many=True)
            return Response({
                "success": True,
                "message": "Properties retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error listing properties")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            property_obj = get_property(pk)
            serializer = PropertyDetailSerializer(property_obj)
            return Response({
                "success": True,
                "message": "Property retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except (Property.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Property not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error retrieving property ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], url_path='nearby')
    def nearby(self, request, pk=None, *args, **kwargs):
        """
        GET /api/properties/<property_id>/nearby/
        Returns nearby places around the property ordered by distance.
        Supports query parameters: category, radius, limit.
        """
        try:
            property_obj = get_property(pk)
        except (Property.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Property not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        category = request.query_params.get('category')
        radius = request.query_params.get('radius')
        limit = request.query_params.get('limit')

        from apps.locations.services import get_property_nearby_places_with_distances
        nearby_places_list = get_property_nearby_places_with_distances(
            property_obj=property_obj,
            category=category,
            radius=radius,
            limit=limit
        )

        return Response({
            "success": True,
            "message": "Property nearby places retrieved successfully.",
            "property_id": str(property_obj.property_id),
            "property_name": property_obj.property_name,
            "locality": property_obj.locality.name if property_obj.locality else None,
            "total_count": len(nearby_places_list),
            "nearby_places": nearby_places_list
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = PropertyCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            property_obj = create_property(serializer.validated_data)
            response_data = PropertyDetailSerializer(property_obj).data
            return Response({
                "success": True,
                "message": "Property created successfully.",
                "data": response_data
            }, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error creating property")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, pk=None, *args, **kwargs):
        return self._update(request, pk, partial=False)

    def partial_update(self, request, pk=None, *args, **kwargs):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk=None, partial=False):
        try:
            property_obj = get_property(pk)
        except (Property.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Property not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = PropertyUpdateSerializer(property_obj, data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            updated_obj = update_property(property_obj, serializer.validated_data)
            response_data = PropertyDetailSerializer(updated_obj).data
            return Response({
                "success": True,
                "message": "Property updated successfully.",
                "data": response_data
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error updating property ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            property_obj = get_property(pk)
        except (Property.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Property not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            delete_property(property_obj)
            return Response({
                "success": True,
                "message": "Property deleted successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Error deleting property ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], url_path='nearby-places')
    def nearby_places(self, request, pk=None, *args, **kwargs):
        """
        Retrieves nearby places associated with the property's locality, grouped by category type.
        Endpoint: GET /api/properties/<property_id>/nearby-places/
        """
        try:
            property_obj = get_property(pk)
            grouped = property_obj.get_nearby_places_grouped()
            response_data = {
                place_type: NearbyPlaceSerializer(places, many=True).data
                for place_type, places in grouped.items()
            }
            return Response({
                "success": True,
                "message": "Nearby places retrieved successfully.",
                "data": response_data
            }, status=status.HTTP_200_OK)
        except (Property.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Property not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error retrieving nearby places for property ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PropertyListingViewSet(viewsets.ViewSet):
    """
    ViewSet for managing PropertyListing instances.
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    def list(self, request, *args, **kwargs):
        try:
            queryset = list_listings(request.query_params)
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            if page is not None:
                serializer = PropertyListingSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)

            serializer = PropertyListingSerializer(queryset, many=True)
            return Response({
                "success": True,
                "message": "Property listings retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error listing property listings")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            listing_obj = get_listing(pk)
            serializer = PropertyListingSerializer(listing_obj)
            return Response({
                "success": True,
                "message": "Property listing retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except (PropertyListing.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Property listing not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error retrieving listing ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        serializer = PropertyListingSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            listing_obj = create_listing(serializer.validated_data)
            response_data = PropertyListingSerializer(listing_obj).data
            return Response({
                "success": True,
                "message": "Property listing created successfully.",
                "data": response_data
            }, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error creating property listing")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, pk=None, *args, **kwargs):
        return self._update(request, pk, partial=False)

    def partial_update(self, request, pk=None, *args, **kwargs):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk=None, partial=False):
        try:
            listing_obj = get_listing(pk)
        except (PropertyListing.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Property listing not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = PropertyListingSerializer(listing_obj, data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            updated_obj = update_listing(listing_obj, serializer.validated_data)
            response_data = PropertyListingSerializer(updated_obj).data
            return Response({
                "success": True,
                "message": "Property listing updated successfully.",
                "data": response_data
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error updating listing ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            listing_obj = get_listing(pk)
        except (PropertyListing.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Property listing not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            delete_listing(listing_obj)
            return Response({
                "success": True,
                "message": "Property listing deleted successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Error deleting listing ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PropertyLegalViewSet(viewsets.ViewSet):
    """
    ViewSet for managing PropertyLegal records.
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    def list(self, request, *args, **kwargs):
        try:
            queryset = list_legal_records(request.query_params)
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            if page is not None:
                serializer = PropertyLegalSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)

            serializer = PropertyLegalSerializer(queryset, many=True)
            return Response({
                "success": True,
                "message": "Property legal records retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error listing legal records")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            legal_obj = get_legal_record(pk)
            serializer = PropertyLegalSerializer(legal_obj)
            return Response({
                "success": True,
                "message": "Property legal record retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except (PropertyLegal.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Property legal record not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error retrieving legal record ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        serializer = PropertyLegalSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            legal_obj = create_legal_record(serializer.validated_data)
            response_data = PropertyLegalSerializer(legal_obj).data
            return Response({
                "success": True,
                "message": "Property legal record created successfully.",
                "data": response_data
            }, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error creating property legal record")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, pk=None, *args, **kwargs):
        return self._update(request, pk, partial=False)

    def partial_update(self, request, pk=None, *args, **kwargs):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk=None, partial=False):
        try:
            legal_obj = get_legal_record(pk)
        except (PropertyLegal.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Property legal record not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = PropertyLegalSerializer(legal_obj, data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            updated_obj = update_legal_record(legal_obj, serializer.validated_data)
            response_data = PropertyLegalSerializer(updated_obj).data
            return Response({
                "success": True,
                "message": "Property legal record updated successfully.",
                "data": response_data
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error updating legal record ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            legal_obj = get_legal_record(pk)
        except (PropertyLegal.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Property legal record not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            delete_legal_record(legal_obj)
            return Response({
                "success": True,
                "message": "Property legal record deleted successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Error deleting legal record ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



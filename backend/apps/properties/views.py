from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import Property, PropertyImage, PropertyDocument
from .serializers import PropertyImageSerializer, PropertyDocumentSerializer
from .services import PropertyImageService, PropertyDocumentService

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

"""
Views for the Enquiries module.
Handles REST requests for property enquiries.
"""
import logging
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from .serializers import (
    EnquirySerializer,
    EnquiryCreateSerializer,
    EnquiryStatusUpdateSerializer,
)
from .services import (
    create_enquiry,
    get_user_enquiries,
    get_enquiry_by_id,
    update_enquiry_status,
    delete_enquiry,
)

logger = logging.getLogger(__name__)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class EnquiryViewSet(viewsets.ViewSet):
    """
    ViewSet for managing property enquiries.
    Requires authentication.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def list(self, request, *args, **kwargs):
        """
        GET /api/enquiries/
        Retrieves user enquiries with optional status filter and search query.
        """
        try:
            filters = {
                'status': request.query_params.get('status'),
                'search': request.query_params.get('search') or request.query_params.get('q')
            }
            queryset = get_user_enquiries(request.user, filters=filters)
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)

            if page is not None:
                serializer = EnquirySerializer(page, many=True)
                return Response({
                    "success": True,
                    "message": "Enquiries retrieved successfully.",
                    "data": {
                        "count": paginator.page.paginator.count,
                        "next": paginator.get_next_link(),
                        "previous": paginator.get_previous_link(),
                        "results": serializer.data
                    }
                }, status=status.HTTP_200_OK)

            serializer = EnquirySerializer(queryset, many=True)
            return Response({
                "success": True,
                "message": "Enquiries retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error listing enquiries")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        GET /api/enquiries/<enquiry_id>/
        Retrieves details of a single enquiry.
        """
        try:
            enquiry = get_enquiry_by_id(request.user, pk)
            serializer = EnquirySerializer(enquiry)
            return Response({
                "success": True,
                "message": "Enquiry retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            code = getattr(e, 'code', None)
            status_code = status.HTTP_404_NOT_FOUND if code == 'not_found' else (
                status.HTTP_403_FORBIDDEN if code == 'permission_denied' else status.HTTP_400_BAD_REQUEST
            )
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status_code)
        except Exception as e:
            logger.exception(f"Error retrieving enquiry {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        """
        POST /api/enquiries/
        Creates a new property enquiry.
        """
        serializer = EnquiryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            enquiry = create_enquiry(
                user=request.user,
                property_id=serializer.validated_data['property_id'],
                message=serializer.validated_data['message']
            )
            response_data = EnquirySerializer(enquiry).data
            return Response({
                "success": True,
                "message": "Enquiry submitted successfully.",
                "data": response_data
            }, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error creating enquiry")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['patch', 'put'], url_path='status')
    def update_status(self, request, pk=None, *args, **kwargs):
        """
        PATCH /api/enquiries/<enquiry_id>/status/
        Updates enquiry status (Admin / Agent role required).
        """
        serializer = EnquiryStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            updated_enquiry = update_enquiry_status(
                user=request.user,
                enquiry_id=pk,
                new_status=serializer.validated_data['status']
            )
            return Response({
                "success": True,
                "message": "Enquiry status updated successfully.",
                "data": EnquirySerializer(updated_enquiry).data
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            code = getattr(e, 'code', None)
            status_code = status.HTTP_404_NOT_FOUND if code == 'not_found' else (
                status.HTTP_403_FORBIDDEN if code == 'permission_denied' else status.HTTP_400_BAD_REQUEST
            )
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status_code)
        except Exception as e:
            logger.exception(f"Error updating status for enquiry {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, pk=None, *args, **kwargs):
        """
        DELETE /api/enquiries/<enquiry_id>/
        Deletes an enquiry.
        """
        try:
            delete_enquiry(user=request.user, enquiry_id=pk)
            return Response({
                "success": True,
                "message": "Enquiry deleted successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            code = getattr(e, 'code', None)
            status_code = status.HTTP_404_NOT_FOUND if code == 'not_found' else (
                status.HTTP_403_FORBIDDEN if code == 'permission_denied' else status.HTTP_400_BAD_REQUEST
            )
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status_code)
        except Exception as e:
            logger.exception(f"Error deleting enquiry {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

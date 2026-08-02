"""
Views for Saved Properties feature.
Handles REST API requests, delegates business logic to services,
and returns DRF standardized responses.
"""
import logging
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from .saved_properties_serializers import (
    SavedPropertySerializer,
    SavedPropertyCreateSerializer,
)
from .saved_properties_services import (
    save_property,
    remove_saved_property,
    get_user_saved_properties,
    check_property_saved,
)

logger = logging.getLogger(__name__)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class SavedPropertyViewSet(viewsets.ViewSet):
    """
    ViewSet to manage user's saved properties.
    Requires authentication for all actions.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def list(self, request, *args, **kwargs):
        """
        GET /api/accounts/saved-properties/
        Retrieves the authenticated user's saved properties list.
        """
        try:
            queryset = get_user_saved_properties(request.user)
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            
            if page is not None:
                serializer = SavedPropertySerializer(page, many=True)
                return Response({
                    "success": True,
                    "message": "Saved properties retrieved successfully.",
                    "data": {
                        "count": paginator.page.paginator.count,
                        "next": paginator.get_next_link(),
                        "previous": paginator.get_previous_link(),
                        "results": serializer.data
                    }
                }, status=status.HTTP_200_OK)

            serializer = SavedPropertySerializer(queryset, many=True)
            return Response({
                "success": True,
                "message": "Saved properties retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error retrieving user saved properties")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        """
        POST /api/accounts/saved-properties/
        Saves a property for the authenticated user.
        """
        serializer = SavedPropertyCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            saved_obj = save_property(
                user=request.user,
                property_id=serializer.validated_data['property_id']
            )
            response_data = SavedPropertySerializer(saved_obj).data
            return Response({
                "success": True,
                "message": "Property saved successfully.",
                "data": response_data
            }, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error saving property")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, pk=None, *args, **kwargs):
        """
        DELETE /api/accounts/saved-properties/<pk>/
        Removes a saved property record by SavedProperty ID or Property ID.
        """
        try:
            remove_saved_property(user=request.user, identifier=pk)
            return Response({
                "success": True,
                "message": "Saved property removed successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND if getattr(e, 'code', None) == 'not_found' else status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error removing saved property {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='check/(?P<property_id>[^/.]+)')
    def check_status(self, request, property_id=None, *args, **kwargs):
        """
        GET /api/accounts/saved-properties/check/<property_id>/
        Checks if a property is in current user's saved list.
        """
        try:
            status_info = check_property_saved(user=request.user, property_id=property_id)
            return Response({
                "success": True,
                "message": "Status checked successfully.",
                "data": status_info
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Error checking saved status for property {property_id}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

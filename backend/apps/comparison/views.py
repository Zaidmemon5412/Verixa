"""
Views for the Comparison module.
Handles REST requests for comparison sessions and property comparison matrix.
"""
import logging
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import (
    ComparisonSessionSerializer,
    ComparisonSessionCreateSerializer,
    ComparisonAddPropertySerializer,
    ComparisonDetailSerializer,
)
from .services import (
    create_comparison_session,
    get_user_comparison_sessions,
    get_comparison_details,
    add_property_to_comparison,
    remove_property_from_comparison,
    delete_comparison_session,
)

logger = logging.getLogger(__name__)


class ComparisonSessionViewSet(viewsets.ViewSet):
    """
    ViewSet for managing comparison sessions and side-by-side property comparison matrix.
    Requires authentication.
    """
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        """
        GET /api/comparisons/
        Retrieves all comparison sessions created by current user.
        """
        try:
            sessions = get_user_comparison_sessions(request.user)
            serializer = ComparisonSessionSerializer(sessions, many=True)
            return Response({
                "success": True,
                "message": "Comparison sessions retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error listing comparison sessions")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        GET /api/comparisons/<comparison_id>/
        Retrieves detailed comparison session including full compared properties details.
        """
        try:
            session = get_comparison_details(user=request.user, comparison_id=pk)
            serializer = ComparisonDetailSerializer(session)
            return Response({
                "success": True,
                "message": "Comparison session retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND if getattr(e, 'code', None) == 'not_found' else status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error retrieving comparison session {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        """
        POST /api/comparisons/
        Creates a new comparison session.
        """
        serializer = ComparisonSessionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = create_comparison_session(
                user=request.user,
                comparison_name=serializer.validated_data['comparison_name'],
                property_ids=serializer.validated_data.get('property_ids', [])
            )
            response_data = ComparisonDetailSerializer(session).data
            return Response({
                "success": True,
                "message": "Comparison session created successfully.",
                "data": response_data
            }, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error creating comparison session")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, pk=None, *args, **kwargs):
        """
        DELETE /api/comparisons/<comparison_id>/
        Deletes a comparison session.
        """
        try:
            delete_comparison_session(user=request.user, comparison_id=pk)
            return Response({
                "success": True,
                "message": "Comparison session deleted successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND if getattr(e, 'code', None) == 'not_found' else status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error deleting comparison session {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='properties')
    def add_property(self, request, pk=None, *args, **kwargs):
        """
        POST /api/comparisons/<comparison_id>/properties/
        Adds a property to an existing comparison session.
        """
        serializer = ComparisonAddPropertySerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            add_property_to_comparison(
                user=request.user,
                comparison_id=pk,
                property_id=serializer.validated_data['property_id']
            )
            session = get_comparison_details(user=request.user, comparison_id=pk)
            return Response({
                "success": True,
                "message": "Property added to comparison session.",
                "data": ComparisonDetailSerializer(session).data
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error adding property to comparison {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['delete'], url_path='properties/(?P<property_id>[^/.]+)')
    def remove_property(self, request, pk=None, property_id=None, *args, **kwargs):
        """
        DELETE /api/comparisons/<comparison_id>/properties/<property_id>/
        Removes a property from a comparison session.
        """
        try:
            remove_property_from_comparison(
                user=request.user,
                comparison_id=pk,
                property_id=property_id
            )
            session = get_comparison_details(user=request.user, comparison_id=pk)
            return Response({
                "success": True,
                "message": "Property removed from comparison session.",
                "data": ComparisonDetailSerializer(session).data
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND if getattr(e, 'code', None) == 'not_found' else status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error removing property from comparison {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

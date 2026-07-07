"""
Views for the builders app.
Handles incoming REST API requests for builder profiles, invokes
appropriate services layer functions, and returns structured JSON responses.
"""
import logging
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Builder
from .serializers import (
    BuilderSerializer,
    BuilderCreateSerializer,
    BuilderUpdateSerializer,
)
from .services import (
    create_builder,
    get_builder,
    get_all_builders,
    update_builder,
    delete_builder,
)

logger = logging.getLogger(__name__)


class BuilderViewSet(viewsets.ViewSet):
    """
    ViewSet to manage Builders.
    Maintains thin handlers and delegates core business logic to the services layer.
    """
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        """
        GET /builders/
        Retrieves all builders.
        """
        try:
            builders = get_all_builders()
            serializer = BuilderSerializer(builders, many=True)
            return Response({
                "success": True,
                "message": "Builders retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error listing builders")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        GET /builders/<builder_id>/
        Retrieves a single builder by ID.
        """
        try:
            builder = get_builder(pk)
            serializer = BuilderSerializer(builder)
            return Response({
                "success": True,
                "message": "Builder retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except (Builder.DoesNotExist, DjangoValidationError, ValueError):
            # ValidationError or ValueError might be raised if pk is an invalid UUID format
            return Response({
                "success": False,
                "message": "Builder not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error retrieving builder with ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        """
        POST /builders/
        Creates a new builder profile.
        """
        serializer = BuilderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            builder = create_builder(serializer.validated_data)
            response_data = BuilderSerializer(builder).data
            return Response({
                "success": True,
                "message": "Builder created successfully.",
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
                "message": "A database constraint violation occurred (e.g. duplicate RERA number).",
                "data": {"detail": str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error creating builder")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, pk=None, *args, **kwargs):
        """
        PUT /builders/<builder_id>/
        Updates an existing builder profile.
        """
        try:
            builder = get_builder(pk)
        except (Builder.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Builder not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        # Allow partial updates since PUT in DRF ViewSet can also handle patch/update
        serializer = BuilderUpdateSerializer(builder, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            updated_builder = update_builder(builder, serializer.validated_data)
            response_data = BuilderSerializer(updated_builder).data
            return Response({
                "success": True,
                "message": "Builder updated successfully.",
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
            logger.exception(f"Error updating builder with ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, pk=None, *args, **kwargs):
        """
        DELETE /builders/<builder_id>/
        Deletes a builder profile.
        """
        try:
            builder = get_builder(pk)
        except (Builder.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Builder not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            delete_builder(builder)
            return Response({
                "success": True,
                "message": "Builder deleted successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Error deleting builder with ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

"""
Views for the properties app.
Handles incoming REST API requests, invokes services,
and returns structured JSON responses.
"""
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Property
from .serializers import PropertySerializer
from .services import (
    create_property,
    update_property,
    delete_property,
    get_property
)


class PropertyListCreateView(APIView):
    """
    API View to list all properties or create a new one.
    """
    # Using AllowAny for GET and IsAuthenticated for POST
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, *args, **kwargs):
        # Basic list implementation. You can add filtering here later if needed.
        properties = Property.objects.all()
        serializer = PropertySerializer(properties, many=True)
        return Response({
            "success": True,
            "message": "Properties retrieved successfully.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = PropertySerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            property_instance = create_property(serializer.validated_data)
            return Response({
                "success": True,
                "message": "Property created successfully.",
                "data": PropertySerializer(property_instance).data
            }, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)


class PropertyDetailView(APIView):
    """
    API View to retrieve, update, or delete a specific property.
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, pk, *args, **kwargs):
        try:
            property_instance = get_property(property_id=pk)
            serializer = PropertySerializer(property_instance)
            return Response({
                "success": True,
                "message": "Property retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": str(e.message) if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk, *args, **kwargs):
        try:
            property_instance = get_property(property_id=pk)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": str(e.message) if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = PropertySerializer(property_instance, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            updated_instance = update_property(property_instance, serializer.validated_data)
            return Response({
                "success": True,
                "message": "Property updated successfully.",
                "data": PropertySerializer(updated_instance).data
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        try:
            property_instance = get_property(property_id=pk)
            delete_property(property_instance)
            return Response({
                "success": True,
                "message": "Property deleted successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": str(e.message) if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)


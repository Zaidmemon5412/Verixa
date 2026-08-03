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


# ============================================================================
# BUILDER PROJECT & GALLERY VIEWSETS
# ============================================================================

from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from .models import BuilderProject, BuilderProjectImage
from .serializers import (
    BuilderProjectSerializer,
    BuilderProjectCreateUpdateSerializer,
    BuilderProjectImageSerializer,
)
from .services import (
    create_builder_project,
    get_builder_project,
    get_all_builder_projects,
    update_builder_project,
    delete_builder_project,
    add_builder_project_image,
    delete_builder_project_image,
    set_primary_project_image,
    import_builder_projects_from_csv,
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            "success": True,
            "message": "Builder projects retrieved successfully.",
            "data": {
                "count": self.page.paginator.count,
                "total_pages": self.page.paginator.num_pages,
                "current_page": self.page.number,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data
            }
        })


class BuilderProjectViewSet(viewsets.ViewSet):
    """
    Dedicated ViewSet to manage Builder Projects.
    Supports CRUD, search, filtering, ordering, pagination, gallery images, and CSV import.
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    @extend_schema(
        summary="List all builder projects",
        description="Retrieves a paginated list of builder projects with optional search, filtering, and ordering.",
        parameters=[
            OpenApiParameter('search', OpenApiTypes.STR, description="Search by project name, locality, city, RERA, or builder name"),
            OpenApiParameter('builder', OpenApiTypes.STR, description="Filter by Builder UUID"),
            OpenApiParameter('city', OpenApiTypes.STR, description="Filter by City"),
            OpenApiParameter('locality', OpenApiTypes.STR, description="Filter by Locality"),
            OpenApiParameter('property_type', OpenApiTypes.STR, description="Filter by Property Type"),
            OpenApiParameter('project_status', OpenApiTypes.STR, description="Filter by Project Status"),
            OpenApiParameter('primary_bhk', OpenApiTypes.STR, description="Filter by Primary BHK"),
            OpenApiParameter('transaction_type', OpenApiTypes.STR, description="Filter by Transaction Type"),
            OpenApiParameter('ordering', OpenApiTypes.STR, description="Order by field, e.g. -created_at, project_name"),
            OpenApiParameter('page', OpenApiTypes.INT, description="Page number"),
            OpenApiParameter('page_size', OpenApiTypes.INT, description="Page size"),
        ],
        responses={200: BuilderProjectSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        try:
            queryset = BuilderProject.objects.select_related('builder').prefetch_related('images').all()

            # Search filter
            search_query = request.query_params.get('search', '').strip()
            if search_query:
                queryset = queryset.filter(
                    Q(project_name__icontains=search_query) |
                    Q(locality__icontains=search_query) |
                    Q(city__icontains=search_query) |
                    Q(rera_number__icontains=search_query) |
                    Q(builder__builder_name__icontains=search_query)
                )

            # Specific field filters
            builder_id = request.query_params.get('builder', '').strip()
            if builder_id:
                queryset = queryset.filter(builder_id=builder_id)

            city = request.query_params.get('city', '').strip()
            if city:
                queryset = queryset.filter(city__iexact=city)

            locality = request.query_params.get('locality', '').strip()
            if locality:
                queryset = queryset.filter(locality__icontains=locality)

            prop_type = request.query_params.get('property_type', '').strip()
            if prop_type:
                queryset = queryset.filter(property_type__icontains=prop_type)

            status_param = request.query_params.get('project_status', '').strip()
            if status_param:
                queryset = queryset.filter(project_status__icontains=status_param)

            bhk = request.query_params.get('primary_bhk', '').strip()
            if bhk:
                queryset = queryset.filter(primary_bhk__icontains=bhk)

            trans_type = request.query_params.get('transaction_type', '').strip()
            if trans_type:
                queryset = queryset.filter(transaction_type__icontains=trans_type)

            # Ordering
            ordering = request.query_params.get('ordering', '').strip()
            if ordering:
                valid_ordering = [
                    'project_name', '-project_name',
                    'created_at', '-created_at',
                    'city', '-city',
                    'launch_date', '-launch_date'
                ]
                if ordering in valid_ordering:
                    queryset = queryset.order_by(ordering)

            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            if page is not None:
                serializer = BuilderProjectSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)

            serializer = BuilderProjectSerializer(queryset, many=True)
            return Response({
                "success": True,
                "message": "Builder projects retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Error listing builder projects")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        summary="Retrieve builder project details",
        description="Retrieves comprehensive details for a specific builder project by ID.",
        responses={200: BuilderProjectSerializer, 404: OpenApiTypes.OBJECT}
    )
    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            project = get_builder_project(pk)
            serializer = BuilderProjectSerializer(project)
            return Response({
                "success": True,
                "message": "Builder project retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except (BuilderProject.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Builder project not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Error retrieving builder project ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        summary="Create a builder project",
        description="Creates a new builder project.",
        request=BuilderProjectCreateUpdateSerializer,
        responses={201: BuilderProjectSerializer, 400: OpenApiTypes.OBJECT}
    )
    def create(self, request, *args, **kwargs):
        serializer = BuilderProjectCreateUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            project = create_builder_project(serializer.validated_data)
            response_data = BuilderProjectSerializer(project).data
            return Response({
                "success": True,
                "message": "Builder project created successfully.",
                "data": response_data
            }, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error creating builder project")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        summary="Update a builder project",
        description="Updates an existing builder project.",
        request=BuilderProjectCreateUpdateSerializer,
        responses={200: BuilderProjectSerializer, 400: OpenApiTypes.OBJECT, 404: OpenApiTypes.OBJECT}
    )
    def update(self, request, pk=None, *args, **kwargs):
        try:
            project = get_builder_project(pk)
        except (BuilderProject.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Builder project not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = BuilderProjectCreateUpdateSerializer(project, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            updated_project = update_builder_project(project, serializer.validated_data)
            response_data = BuilderProjectSerializer(updated_project).data
            return Response({
                "success": True,
                "message": "Builder project updated successfully.",
                "data": response_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Error updating builder project ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        summary="Delete a builder project",
        description="Deletes a builder project.",
        responses={200: OpenApiTypes.OBJECT, 404: OpenApiTypes.OBJECT}
    )
    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            project = get_builder_project(pk)
        except (BuilderProject.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Builder project not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            delete_builder_project(project)
            return Response({
                "success": True,
                "message": "Builder project deleted successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Error deleting builder project ID {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        summary="Get project gallery images",
        description="Retrieves all gallery images associated with the specified builder project.",
        responses={200: BuilderProjectImageSerializer(many=True), 404: OpenApiTypes.OBJECT}
    )
    @action(detail=True, methods=['get'], url_path='gallery')
    def gallery(self, request, pk=None):
        try:
            project = get_builder_project(pk)
            images = project.images.all()
            serializer = BuilderProjectImageSerializer(images, many=True)
            return Response({
                "success": True,
                "message": "Project gallery images retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except (BuilderProject.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Builder project not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary="Add gallery image to project",
        description="Adds a new gallery image URL to the project.",
        responses={201: BuilderProjectImageSerializer, 400: OpenApiTypes.OBJECT}
    )
    @action(detail=True, methods=['post'], url_path='add-image')
    def add_image(self, request, pk=None):
        try:
            project = get_builder_project(pk)
        except (BuilderProject.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Builder project not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

        image_url = request.data.get('image_url')
        if not image_url:
            return Response({
                "success": False,
                "message": "image_url field is required.",
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            display_order = request.data.get('display_order')
            is_primary = request.data.get('is_primary', False)
            image = add_builder_project_image(
                project=project,
                image_url=image_url,
                display_order=int(display_order) if display_order else None,
                is_primary=bool(is_primary)
            )
            serializer = BuilderProjectImageSerializer(image)
            return Response({
                "success": True,
                "message": "Gallery image added successfully.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                "success": False,
                "message": str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Import builder projects from CSV",
        description="Triggers server-side CSV import from master_verixa_builder_projects.csv file.",
        responses={200: OpenApiTypes.OBJECT}
    )
    @action(detail=False, methods=['post'], url_path='import-csv')
    def import_csv(self, request):
        csv_path = request.data.get('csv_path', 'master_verixa_builder_projects.csv')
        try:
            summary = import_builder_projects_from_csv(csv_path)
            return Response({
                "success": True,
                "message": "CSV import executed successfully.",
                "data": summary
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error executing CSV import via API")
            return Response({
                "success": False,
                "message": f"CSV import failed: {str(e)}",
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)


class BuilderProjectImageViewSet(viewsets.ViewSet):
    """
    ViewSet for managing individual Builder Project Gallery Images.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Delete a project image",
        description="Deletes a specific gallery image by ID.",
        responses={200: OpenApiTypes.OBJECT, 404: OpenApiTypes.OBJECT}
    )
    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            delete_builder_project_image(pk)
            return Response({
                "success": True,
                "message": "Image deleted successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except (BuilderProjectImage.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Image not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary="Set image as primary",
        description="Marks the specified image as primary for its project, unsetting primary on other images.",
        responses={200: BuilderProjectImageSerializer, 404: OpenApiTypes.OBJECT}
    )
    @action(detail=True, methods=['post'], url_path='set-primary')
    def set_primary(self, request, pk=None):
        try:
            image = BuilderProjectImage.objects.select_related('project').get(image_id=pk)
            updated_image = set_primary_project_image(image.project, pk)
            serializer = BuilderProjectImageSerializer(updated_image)
            return Response({
                "success": True,
                "message": "Image set as primary successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except (BuilderProjectImage.DoesNotExist, DjangoValidationError, ValueError):
            return Response({
                "success": False,
                "message": "Image not found.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)


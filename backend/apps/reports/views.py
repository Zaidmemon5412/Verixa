"""
Views for the Reports module.
Handles REST requests for generating and retrieving property analytics and valuation reports.
"""
import logging
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from .serializers import (
    ReportSerializer,
    ReportCreateSerializer,
)
from .services import (
    generate_report,
    get_user_reports,
    get_report_by_id,
    delete_report,
)

logger = logging.getLogger(__name__)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ReportViewSet(viewsets.ViewSet):
    """
    ViewSet for managing user property reports.
    Requires authentication.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def list(self, request, *args, **kwargs):
        """
        GET /api/reports/
        Retrieves user reports with optional report_type filter and search query.
        """
        try:
            filters = {
                'report_type': request.query_params.get('report_type'),
                'search': request.query_params.get('search') or request.query_params.get('q')
            }
            queryset = get_user_reports(request.user, filters=filters)
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)

            if page is not None:
                serializer = ReportSerializer(page, many=True)
                return Response({
                    "success": True,
                    "message": "Reports retrieved successfully.",
                    "data": {
                        "count": paginator.page.paginator.count,
                        "next": paginator.get_next_link(),
                        "previous": paginator.get_previous_link(),
                        "results": serializer.data
                    }
                }, status=status.HTTP_200_OK)

            serializer = ReportSerializer(queryset, many=True)
            return Response({
                "success": True,
                "message": "Reports retrieved successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error listing reports")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        GET /api/reports/<report_id>/
        Retrieves details of a single report.
        """
        try:
            report = get_report_by_id(request.user, pk)
            serializer = ReportSerializer(report)
            return Response({
                "success": True,
                "message": "Report retrieved successfully.",
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
            logger.exception(f"Error retrieving report {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        """
        POST /api/reports/
        Generates/creates a new report record for a property.
        """
        serializer = ReportCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            report = generate_report(
                user=request.user,
                property_id=serializer.validated_data['property_id'],
                report_type=serializer.validated_data['report_type'],
                report_url=serializer.validated_data.get('report_url')
            )
            response_data = ReportSerializer(report).data
            return Response({
                "success": True,
                "message": "Report record generated successfully.",
                "data": response_data
            }, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error generating report record")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, pk=None, *args, **kwargs):
        """
        DELETE /api/reports/<report_id>/
        Deletes a report record.
        """
        try:
            delete_report(user=request.user, report_id=pk)
            return Response({
                "success": True,
                "message": "Report deleted successfully.",
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
            logger.exception(f"Error deleting report {pk}")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings


def custom_exception_handler(exc, context):
    """
    Unified API response structure for handling exceptions across all DRF views.
    Returns: {"error": "Error message description", "status_code": 400, "details": {...}}
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            'error': response.data.get('detail', 'A validation or server error occurred.'),
            'status_code': response.status_code,
            'details': response.data
        }
        response.data = custom_data
    else:
        # For unhandled server errors (500)
        return Response({
            'error': 'An internal server error occurred on the Verixa backend.',
            'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'details': str(exc) if settings.DEBUG else {}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response

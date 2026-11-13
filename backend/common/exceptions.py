import math
from rest_framework.views import exception_handler
from rest_framework.exceptions import Throttled
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings


def custom_exception_handler(exc, context):
    """
    Unified API response structure for handling exceptions across all DRF views.
    Provides structured HTTP 429 rate-limit responses and consistent error envelopes.
    """
    response = exception_handler(exc, context)

    if response is not None:
        if isinstance(exc, Throttled):
            wait_seconds = math.ceil(exc.wait) if exc.wait else None
            wait_msg = (
                f"Rate limit exceeded. Please try again in {wait_seconds} seconds."
                if wait_seconds
                else "Rate limit exceeded. Please slow down and try again shortly."
            )
            response.data = {
                'success': False,
                'message': wait_msg,
                'error': wait_msg,
                'status_code': status.HTTP_429_TOO_MANY_REQUESTS,
                'retry_after': wait_seconds,
                'data': {},
                'details': {'detail': str(exc.detail), 'retry_after': wait_seconds},
            }
            return response

        detail_msg = (
            response.data.get('detail')
            if isinstance(response.data, dict)
            else None
        )
        error_message = str(detail_msg) if detail_msg else 'A validation or request error occurred.'

        custom_data = {
            'success': False,
            'message': error_message,
            'error': error_message,
            'status_code': response.status_code,
            'data': response.data if isinstance(response.data, dict) else {'errors': response.data},
            'details': response.data,
        }
        response.data = custom_data
    else:
        # For unhandled server errors (500)
        return Response({
            'success': False,
            'message': 'An internal server error occurred on the Verixa backend.',
            'error': 'An internal server error occurred on the Verixa backend.',
            'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'data': {},
            'details': str(exc) if settings.DEBUG else {},
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response

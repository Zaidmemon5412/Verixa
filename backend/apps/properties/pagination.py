"""
Pagination configurations for the properties app.
Provides standard page-number pagination supporting page and page_size query parameters.
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination class for properties, listings, and legal records.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'success': True,
            'message': 'Data retrieved successfully.',
            'data': {
                'count': self.page.paginator.count,
                'total_pages': self.page.paginator.num_pages,
                'current_page': self.page.number,
                'page_size': self.get_page_size(self.request),
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'results': data
            }
        })


class PropertyPagination(StandardResultsSetPagination):
    """
    Property list pagination settings.
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000

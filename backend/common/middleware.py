import logging
import time

logger = logging.getLogger(__name__)


class RequestLogMiddleware:
    """
    Logs performance metrics and response metadata for incoming requests.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        response = self.get_response(request)
        
        duration = time.time() - start_time
        logger.info(
            f"Path: {request.path} | Method: {request.method} | "
            f"Status: {response.status_code} | Duration: {duration:.4f}s"
        )
        
        return response

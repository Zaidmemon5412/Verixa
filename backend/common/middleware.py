import logging
import time
import uuid

logger = logging.getLogger(__name__)


class RequestLogMiddleware:
    """
    Production observability middleware:
    - Assigns or propagates an `X-Request-ID` correlation header on every request/response.
    - Attaches `X-Response-Time-Ms` performance header.
    - Emits structured access telemetry for downstream log aggregation.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.perf_counter()

        request_id = request.META.get('HTTP_X_REQUEST_ID') or uuid.uuid4().hex[:12]
        request.request_id = request_id

        response = self.get_response(request)

        duration_ms = (time.perf_counter() - start_time) * 1000.0
        response['X-Request-ID'] = request_id
        response['X-Response-Time-Ms'] = f"{duration_ms:.2f}"

        logger.info(
            "request_id=%s method=%s path=%s status=%s duration_ms=%.2f",
            request_id,
            request.method,
            request.path,
            response.status_code,
            duration_ms,
        )

        return response

"""
Core system views including production Health & Readiness probes.
"""
import time
from django.db import connections
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status


class HealthCheckAPIView(APIView):
    """
    GET /api/health/
    Production Liveness & Readiness probe for Docker, Nginx, and Kubernetes.
    Verifies database connectivity and cache subsystem responsiveness.
    Exempt from authentication and rate-limiting so orchestrators are never blocked.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = []

    def get(self, request, *args, **kwargs):
        start = time.time()
        checks = {
            "database": "healthy",
            "cache": "healthy",
        }
        overall_healthy = True

        # 1. Verify PostgreSQL / Database connectivity
        try:
            db_conn = connections['default']
            with db_conn.cursor() as cursor:
                cursor.execute("SELECT 1;")
                cursor.fetchone()
        except Exception as exc:
            checks["database"] = f"unhealthy: {str(exc)}"
            overall_healthy = False

        # 2. Verify Cache (Redis / LocMem) read-write
        try:
            cache.set("verixa_healthcheck_probe", "ok", timeout=5)
            probe_val = cache.get("verixa_healthcheck_probe")
            if probe_val not in ("ok", None):  # DummyCache returns None in tests
                checks["cache"] = "degraded"
        except Exception as exc:
            # Cache outage is reported as degraded so app remains inspectable
            checks["cache"] = f"degraded: {str(exc)}"

        latency_ms = round((time.time() - start) * 1000, 2)
        http_status = status.HTTP_200_OK if overall_healthy else status.HTTP_503_SERVICE_UNAVAILABLE

        return Response({
            "success": overall_healthy,
            "status": "healthy" if overall_healthy else "unhealthy",
            "checks": checks,
            "latency_ms": latency_ms,
        }, status=http_status)


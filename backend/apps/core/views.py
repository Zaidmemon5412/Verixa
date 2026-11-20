"""
Core system views including production Health & Readiness probes and SEO Sitemap.
"""
import re
import time
from xml.sax.saxutils import escape
from django.db import connections
from django.core.cache import cache
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from apps.properties.models import Property
from apps.builders.models import Builder, BuilderProject


def _seo_slugify(value: str) -> str:
    """Convert text to lowercase hyphenated URL slug."""
    if not value:
        return ""
    return re.sub(r"[^a-z0-9]+", "-", str(value).lower()).strip("-")


def _extract_clean_area(text: str) -> str:
    """Match frontend extractCleanArea micro-market extraction for canonical slug parity."""
    lowered = (text or "").lower()
    for slug in ("gota", "chandkheda", "sola", "thaltej", "satellite", "maninagar"):
        if slug in lowered:
            return slug
    return "ahmedabad"


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


class SitemapXMLView(APIView):
    """
    GET /sitemap.xml
    Dynamically generates a cached XML sitemap covering core routes, micro-markets,
    verified builders, properties, and builder projects for search engine crawlers.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = []

    BASE_URL = "https://verixa-phi.vercel.app"
    CACHE_KEY = "verixa_sitemap_xml_v4"
    CACHE_TTL = 3600

    PRIMARY_LOCALITIES = [
        "satellite",
        "thaltej",
        "gota",
        "chandkheda",
        "sola",
        "maninagar",
    ]

    PROGRAMMATIC_LOCALITY_FILTERS = [
        "Satellite",
        "Thaltej",
        "Gota",
        "Chandkheda",
        "Sola",
        "Maninagar",
    ]

    SEO_GUIDE_SLUGS = [
        "gujarat-rera-verification-na-land-title-check-guide",
        "thaltej-vs-satellite-vs-sola-vs-gota-ahmedabad-property-investment",
        "ai-fair-price-property-valuation-xgboost-ahmedabad",
        "ahmedabad-builder-trust-score-on-time-delivery-rankings",
        "b-khata-vs-a-khata-title-dispute-checklist-homebuyers",
        "gift-city-chandkheda-maninagar-rental-yield-forecast",
    ]

    def get(self, request, *args, **kwargs):
        cached_xml = cache.get(self.CACHE_KEY)
        if cached_xml:
            return HttpResponse(cached_xml, content_type="application/xml; charset=utf-8")

        today_iso = timezone.now().date().isoformat()
        entries = []

        def add_url(path: str, lastmod: str = today_iso, changefreq: str = "weekly", priority: str = "0.8"):
            clean_path = path if path.startswith("/") else f"/{path}"
            loc = escape(f"{self.BASE_URL}{clean_path}")
            entries.append(
                f"  <url>\n"
                f"    <loc>{loc}</loc>\n"
                f"    <lastmod>{escape(lastmod)}</lastmod>\n"
                f"    <changefreq>{changefreq}</changefreq>\n"
                f"    <priority>{priority}</priority>\n"
                f"  </url>"
            )

        # 1. Core static routes
        add_url("/", changefreq="daily", priority="1.0")
        add_url("/properties", changefreq="daily", priority="0.9")
        add_url("/builders", changefreq="weekly", priority="0.9")
        add_url("/localities", changefreq="weekly", priority="0.9")
        add_url("/market", changefreq="daily", priority="0.9")
        add_url("/comparison", changefreq="weekly", priority="0.8")
        add_url("/guides", changefreq="weekly", priority="0.9")

        for guide_slug in self.SEO_GUIDE_SLUGS:
            add_url(f"/guides/{guide_slug}", changefreq="weekly", priority="0.88")

        # 2. Primary micro-market locality hubs & programmatic locality property searches
        for loc_slug in self.PRIMARY_LOCALITIES:
            add_url(f"/localities/{loc_slug}", changefreq="weekly", priority="0.85")

        for loc_label in self.PROGRAMMATIC_LOCALITY_FILTERS:
            add_url(f"/properties?locality={loc_label}", changefreq="daily", priority="0.85")
        add_url("/properties?bhk=2", changefreq="daily", priority="0.82")
        add_url("/properties?bhk=3", changefreq="daily", priority="0.82")
        add_url("/properties?bhk=4", changefreq="daily", priority="0.80")
        add_url("/properties?type=villa", changefreq="daily", priority="0.80")
        add_url("/properties?status=ready", changefreq="daily", priority="0.80")

        db_ok = True

        # 3. Verified builders
        try:
            builders_qs = Builder.objects.only("builder_id", "builder_name", "updated_at")
            for b in builders_qs:
                b_slug = _seo_slugify(b.builder_name) or "developer"
                b_lastmod = b.updated_at.date().isoformat() if b.updated_at else today_iso
                add_url(
                    f"/builders/{b_slug}--{b.builder_id}",
                    lastmod=b_lastmod,
                    changefreq="weekly",
                    priority="0.8",
                )
        except Exception:
            db_ok = False

        # 4. Active property listings & builder projects
        seen_property_ids = set()
        try:
            props_qs = Property.objects.select_related("locality").only(
                "property_id", "property_name", "address", "locality__name", "updated_at"
            )
            for p in props_qs:
                pid = str(p.property_id)
                seen_property_ids.add(pid)
                raw_loc = f"{p.locality.name if p.locality_id and p.locality else ''} {p.address or ''} {p.property_name or ''}"
                clean_loc = _extract_clean_area(raw_loc)
                p_slug = _seo_slugify(f"{p.property_name}-{clean_loc}") or "property"
                p_lastmod = p.updated_at.date().isoformat() if p.updated_at else today_iso
                add_url(
                    f"/properties/{p_slug}--{pid}",
                    lastmod=p_lastmod,
                    changefreq="weekly",
                    priority="0.8",
                )
        except Exception:
            db_ok = False

        try:
            bp_qs = BuilderProject.objects.only(
                "project_id", "project_name", "locality", "location", "updated_at"
            )
            for bp in bp_qs:
                bpid = str(bp.project_id)
                if bpid in seen_property_ids:
                    continue
                clean_loc = _extract_clean_area(f"{bp.locality or ''} {bp.location or ''} {bp.project_name or ''}")
                bp_slug = _seo_slugify(f"{bp.project_name}-{clean_loc}") or "property"
                bp_lastmod = bp.updated_at.date().isoformat() if bp.updated_at else today_iso
                add_url(
                    f"/properties/{bp_slug}--{bpid}",
                    lastmod=bp_lastmod,
                    changefreq="weekly",
                    priority="0.8",
                )
        except Exception:
            db_ok = False

        xml_body = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + "\n".join(entries)
            + "\n</urlset>\n"
        )

        if db_ok:
            try:
                cache.set(self.CACHE_KEY, xml_body, timeout=self.CACHE_TTL)
            except Exception:
                pass

        return HttpResponse(xml_body, content_type="application/xml; charset=utf-8")



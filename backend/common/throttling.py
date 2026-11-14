"""
Production-grade API Rate Limiting & Abuse Prevention throttles for Verixa.

Provides multi-tier rate limiting across:
1. Global Anonymous & Authenticated traffic (sustained baseline protection)
2. Authentication endpoints (login, registration, OAuth, token verification)
3. Password reset & credential modification flows (email/token abuse protection)
4. AI Advisor & ML Valuation endpoints (LLM quota & CPU inference protection)
5. Public/Authenticated write & upload operations (spam & storage abuse protection)
"""
import logging
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle, SimpleRateThrottle

logger = logging.getLogger(__name__)


class SafeCacheThrottleMixin:
    """
    Fail-open resilience wrapper around DRF's cache-backed throttling.
    - Extracts true client IP behind Cloudflare / Render / Nginx reverse proxies.
    - Attaches real-time rate-limit telemetry (`limit`, `remaining`, `reset`, `scope`)
      onto `request._rate_limit_info` so response middleware can emit `X-RateLimit-*` headers.
    - If the underlying cache is temporarily unreachable, logs a warning and fails open.
    """

    def get_ident(self, request):
        cf_ip = request.META.get('HTTP_CF_CONNECTING_IP')
        if cf_ip:
            return cf_ip.strip()

        real_ip = request.META.get('HTTP_X_REAL_IP')
        if real_ip:
            return real_ip.strip()

        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        if xff:
            first_ip = xff.split(',')[0].strip()
            if first_ip:
                return first_ip

        return super().get_ident(request)

    def allow_request(self, request, view):
        try:
            allowed = super().allow_request(request, view)
            num_requests = getattr(self, 'num_requests', None)
            duration = getattr(self, 'duration', None)
            if num_requests is not None and duration is not None:
                history = getattr(self, 'history', []) or []
                now = getattr(self, 'now', 0)
                remaining = max(0, num_requests - len(history)) if allowed else 0
                if history and now:
                    reset = int(max(1, duration - (now - history[-1])))
                else:
                    reset = int(duration)

                info = {
                    'limit': num_requests,
                    'remaining': remaining,
                    'reset': reset,
                    'scope': getattr(self, 'scope', 'api'),
                }
                raw_request = getattr(request, '_request', request)
                existing = getattr(raw_request, '_rate_limit_info', None)
                if (
                    existing is None
                    or not allowed
                    or info['remaining'] <= existing['remaining']
                ):
                    request._rate_limit_info = info
                    raw_request._rate_limit_info = info
            return allowed
        except Exception as exc:
            logger.warning(
                "Rate-limit cache unavailable for throttle '%s' (%s). Failing open.",
                getattr(self, 'scope', self.__class__.__name__),
                exc,
            )
            return True


class AnonSustainedRateThrottle(SafeCacheThrottleMixin, AnonRateThrottle):
    """
    Baseline rate limit for unauthenticated (anonymous) clients by IP.
    Configured via DEFAULT_THROTTLE_RATES['anon'].
    """
    scope = 'anon'


class UserSustainedRateThrottle(SafeCacheThrottleMixin, UserRateThrottle):
    """
    Baseline rate limit for authenticated users by user_id (or IP fallback).
    Configured via DEFAULT_THROTTLE_RATES['user'].
    """
    scope = 'user'


class AuthRateThrottle(SafeCacheThrottleMixin, SimpleRateThrottle):
    """
    Strict IP-based rate limit for authentication endpoints (Login, Register,
    Google OAuth, Token Refresh/Verify) to prevent brute-force and credential
    stuffing attacks regardless of authentication state.
    Configured via DEFAULT_THROTTLE_RATES['auth'].
    """
    scope = 'auth'

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }


class PasswordResetRateThrottle(SafeCacheThrottleMixin, SimpleRateThrottle):
    """
    Strict rate limit for sensitive password lifecycle endpoints (Forgot Password,
    Reset Password, Change Password) to prevent SMTP email bombing and token brute-forcing.
    Configured via DEFAULT_THROTTLE_RATES['password_reset'].
    """
    scope = 'password_reset'

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = f"user_{request.user.pk}"
        else:
            ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }


class AIAdvisorRateThrottle(SafeCacheThrottleMixin, SimpleRateThrottle):
    """
    Dedicated rate limit for compute-heavy ML fair-price inference and external
    Google Gemini LLM Property Audit endpoints.
    Configured via DEFAULT_THROTTLE_RATES['ai_advisor'].
    """
    scope = 'ai_advisor'

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = f"user_{request.user.pk}"
        else:
            ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }


class WriteActionRateThrottle(SafeCacheThrottleMixin, SimpleRateThrottle):
    """
    Rate limit for state-changing public/authenticated write operations such as
    submitting property enquiries or uploading media/documents.
    Configured via DEFAULT_THROTTLE_RATES['write_action'].
    """
    scope = 'write_action'

    def get_cache_key(self, request, view):
        # Only throttle mutating HTTP methods (POST, PUT, PATCH, DELETE)
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return None

        if request.user and request.user.is_authenticated:
            ident = f"user_{request.user.pk}"
        else:
            ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }


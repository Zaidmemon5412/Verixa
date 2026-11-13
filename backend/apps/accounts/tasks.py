"""
Asynchronous Celery background tasks for the accounts app.
Offloads blocking SMTP operations from the HTTP request/response loop
with automatic exponential retry backoff and jitter.
"""
import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    name='accounts.send_password_reset_email_task',
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
    max_retries=3,
    acks_late=True,
)
def send_password_reset_email_task(self, email: str) -> dict:
    """
    Asynchronously generates and dispatches the password reset email via SMTP.
    """
    from .services import send_password_reset_email

    logger.info("[Celery Task] Dispatching password reset email for %s (attempt %d)", email, self.request.retries + 1)
    send_password_reset_email(email)
    return {"status": "sent", "email": email}


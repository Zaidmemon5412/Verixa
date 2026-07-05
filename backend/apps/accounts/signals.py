"""
Signals for the accounts app.
Defines signal receivers for model lifecycle events (e.g. post_save events on User).
"""
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import User

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def user_profile_sync_receiver(sender, instance, created, **kwargs):
    """
    Signal receiver triggered whenever a User model instance is saved.
    Prepares profiles, syncs external structures, or fires welcome notifications
    upon new user registrations.
    """
    if created:
        logger.info(f"New user registered: {instance.email} with role: {instance.role}")
        # Initialization logic (e.g. profile creation, metrics) can go here
    else:
        logger.debug(f"User updated: {instance.email}")

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from apps.properties.models import Property

User = get_user_model()


class Enquiry(models.Model):
    """
    Message threads created by buyers inquiring about specific listed properties.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending Response'),
        ('replied', 'Replied'),
        ('closed', 'Closed'),
    )

    enquiry_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Enquiry ID"
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='enquiries',
        verbose_name="Property"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enquiries',
        verbose_name="User"
    )
    message = models.TextField(
        verbose_name="Enquiry Message"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Enquiry Status"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name="Created At"
    )

    class Meta:
        verbose_name = "Enquiry"
        verbose_name_plural = "Enquiries"
        ordering = ['-created_at']

    def __str__(self):
        return f"Enquiry by {self.user.full_name} on {self.property.property_name} - Status: {self.status}"

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import BaseModel
from apps.properties.models import Property

User = get_user_model()


class ComparisonSession(BaseModel):
    """
    Groups compared properties configured by platform buyers.
    """
    comparison_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Comparison ID"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comparison_sessions',
        verbose_name="User"
    )
    comparison_name = models.CharField(
        max_length=255,
        verbose_name="Comparison Name"
    )

    class Meta:
        verbose_name = "Comparison Session"
        verbose_name_plural = "Comparison Sessions"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.comparison_name} by {self.user.full_name}"


class ComparisonProperty(models.Model):
    """
    Junction linking a comparison session and compared properties.
    Enforces composite unique constraint at database level.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="ID"
    )
    comparison = models.ForeignKey(
        ComparisonSession,
        on_delete=models.CASCADE,
        related_name='comparison_properties',
        verbose_name="Comparison Session"
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='comparison_properties',
        verbose_name="Property"
    )
    added_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Added At"
    )

    class Meta:
        verbose_name = "Comparison Property"
        verbose_name_plural = "Comparison Properties"
        ordering = ['-added_at']
        constraints = [
            models.UniqueConstraint(
                fields=['comparison', 'property'],
                name='unique_comparison_property'
            )
        ]

    def __str__(self):
        return f"{self.property.property_name} in {self.comparison.comparison_name}"

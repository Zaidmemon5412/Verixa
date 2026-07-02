import uuid
from django.db import models
from django.contrib.auth import get_user_model
from apps.properties.models import Property

User = get_user_model()


class Report(models.Model):
    """
    Automated valuation, verification, or market analytics reports.
    """
    report_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Report ID"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reports',
        verbose_name="User"
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='reports',
        verbose_name="Property"
    )
    report_type = models.CharField(
        max_length=100,
        verbose_name="Report Type"  # e.g., Valuation Estimation, Legal Verification
    )
    report_url = models.URLField(
        max_length=500,
        verbose_name="Report File URL"
    )
    generated_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name="Generated At"
    )

    class Meta:
        verbose_name = "Report"
        verbose_name_plural = "Reports"
        ordering = ['-generated_at']

    def __str__(self):
        return f"{self.report_type} for {self.property.property_name}"

import uuid
from django.db import models
from django.db.models import CheckConstraint, Q
from apps.core.models import BaseModel
from apps.core.validators import validate_phone_number


class Builder(BaseModel):
    """
    Real estate builder profile containing registration details, contact info,
    and metadata.
    """
    builder_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Builder ID"
    )
    builder_name = models.CharField(
        max_length=255,
        db_index=True,
        verbose_name="Builder Name"
    )
    company_name = models.CharField(
        max_length=255,
        verbose_name="Company Name"
    )
    rera_registration_no = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        verbose_name="RERA Registration No"
    )
    office_address = models.TextField(
        verbose_name="Office Address"
    )
    phone = models.CharField(
        max_length=15,
        validators=[validate_phone_number],
        verbose_name="Phone Number"
    )
    email = models.EmailField(
        verbose_name="Email Address"
    )
    website = models.URLField(
        blank=True,
        null=True,
        verbose_name="Website URL"
    )
    established_year = models.PositiveIntegerField(
        verbose_name="Established Year"
    )
    about = models.TextField(
        blank=True,
        null=True,
        verbose_name="About"
    )

    class Meta:
        verbose_name = "Builder"
        verbose_name_plural = "Builders"
        ordering = ['builder_name']
        constraints = [
            CheckConstraint(
                check=Q(established_year__gte=1800) & Q(established_year__lte=2100),
                name="check_builder_established_year_range"
            )
        ]

    def __str__(self):
        return self.builder_name

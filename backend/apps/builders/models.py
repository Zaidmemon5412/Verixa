import uuid
from django.db import models
from django.db.models import CheckConstraint, Q
# pyrefly: ignore [missing-import]
from apps.core.models import BaseModel
# pyrefly: ignore [missing-import]
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
                # pyrefly: ignore [unexpected-keyword]
                check = Q(established_year__gte=1800) & Q(established_year__lte=2100),
                name="check_builder_established_year_range"
            )
        ]

    def __str__(self):
        return self.builder_name


class BuilderProject(BaseModel):
    """
    Dedicated module for project developments launched by builders.
    Stores project specifics, spatial metadata, specifications, and amenities.
    """
    project_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Project ID"
    )
    builder = models.ForeignKey(
        Builder,
        on_delete=models.CASCADE,
        related_name='projects',
        verbose_name="Builder"
    )
    project_name = models.CharField(
        max_length=255,
        db_index=True,
        verbose_name="Project Name"
    )
    property_type = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Property Type"
    )
    transaction_type = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Transaction Type"
    )
    project_status = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
        verbose_name="Project Status"
    )
    rera_number = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_index=True,
        verbose_name="RERA Number"
    )
    launch_date = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Launch Date"
    )
    completion_date = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Completion Date"
    )
    construction_type = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Construction Type"
    )
    land_area = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Land Area"
    )
    price = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Price"
    )
    price_per_sqft = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Price Per Sqft"
    )
    primary_bhk = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
        verbose_name="Primary BHK"
    )
    bhk_variants = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="BHK Variants"
    )
    carpet_area = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Carpet Area"
    )
    super_builtup_area = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Super Built-up Area"
    )
    builtup_area = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Built-up Area"
    )
    project_description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Project Description"
    )
    amenities = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Amenities"
    )
    website_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="Website URL"
    )
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name="Latitude"
    )
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name="Longitude"
    )
    locality = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_index=True,
        verbose_name="Locality"
    )
    city = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
        verbose_name="City"
    )
    state = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="State"
    )
    pincode = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        db_index=True,
        verbose_name="Pincode"
    )
    location = models.TextField(
        blank=True,
        null=True,
        verbose_name="Location"
    )

    class Meta:
        db_table = 'builders_builderproject'
        verbose_name = "Builder Project"
        verbose_name_plural = "Builder Projects"
        ordering = ['-created_at', 'project_name']
        indexes = [
            models.Index(fields=['city', 'locality']),
            models.Index(fields=['project_status', 'primary_bhk']),
        ]

    def __str__(self):
        return f"{self.project_name} - {self.builder.builder_name}"


class BuilderProjectImage(models.Model):
    """
    Gallery images associated with a Builder Project.
    """
    image_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Image ID"
    )
    project = models.ForeignKey(
        BuilderProject,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name="Builder Project"
    )
    image_url = models.URLField(
        max_length=1000,
        verbose_name="Image URL"
    )
    display_order = models.PositiveIntegerField(
        default=1,
        verbose_name="Display Order"
    )
    is_primary = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Is Primary"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name="Created At"
    )

    class Meta:
        db_table = 'builders_builderprojectimage'
        verbose_name = "Builder Project Image"
        verbose_name_plural = "Builder Project Images"
        ordering = ['display_order', 'created_at']

    def __str__(self):
        return f"Image {self.display_order} for {self.project.project_name}"


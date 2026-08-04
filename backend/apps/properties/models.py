import uuid
from django.db import models
from django.db.models import CheckConstraint, Q
from django.core.exceptions import ValidationError
from apps.core.models import BaseModel
from apps.builders.models import Builder
from apps.locations.models import Locality, NearbyPlace
from apps.core.validators import validate_phone_number


class FurnishingStatus(models.TextChoices):
    UNFURNISHED = 'UNFURNISHED', 'Unfurnished'
    SEMI_FURNISHED = 'SEMI_FURNISHED', 'Semi-Furnished'
    FULLY_FURNISHED = 'FULLY_FURNISHED', 'Fully Furnished'


class FacingDirection(models.TextChoices):
    NORTH = 'NORTH', 'North'
    SOUTH = 'SOUTH', 'South'
    EAST = 'EAST', 'East'
    WEST = 'WEST', 'West'
    NORTH_EAST = 'NORTH_EAST', 'North-East'
    NORTH_WEST = 'NORTH_WEST', 'North-West'
    SOUTH_EAST = 'SOUTH_EAST', 'South-East'
    SOUTH_WEST = 'SOUTH_WEST', 'South-West'


class ListedByType(models.TextChoices):
    OWNER = 'OWNER', 'Owner'
    BUILDER = 'BUILDER', 'Builder'
    BROKER = 'BROKER', 'Broker'
    AGENCY = 'AGENCY', 'Agency'


class ListingStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    PENDING = 'PENDING', 'Pending'
    SOLD = 'SOLD', 'Sold'
    INACTIVE = 'INACTIVE', 'Inactive'


class LegalVerificationStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    VERIFIED = 'VERIFIED', 'Verified'
    REJECTED = 'REJECTED', 'Rejected'


class Property(BaseModel):
    """
    Main real estate registry listing containing sizing details, FK connections
    to builders & locations, pricing, and coordinates.
    """
    PROPERTY_TYPE_CHOICES = (
        ('apartment', 'Apartment'),
        ('villa', 'Villa'),
        ('penthouse', 'Penthouse'),
        ('row_house', 'Row House'),
        ('plot', 'Plot'),
        ('commercial', 'Commercial Space'),
    )

    TRANSACTION_TYPE_CHOICES = (
        ('new', 'New Launch'),
        ('resale', 'Resale'),
    )

    STATUS_CHOICES = (
        ('ready', 'Ready to Move'),
        ('under_construction', 'Under Construction'),
    )

    property_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Property ID"
    )
    builder = models.ForeignKey(
        Builder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='properties',
        verbose_name="Builder"
    )
    locality = models.ForeignKey(
        Locality,
        on_delete=models.PROTECT,
        related_name='properties',
        verbose_name="Locality"
    )
    rera_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
        verbose_name="RERA Number"
    )
    property_name = models.CharField(
        max_length=255,
        db_index=True,
        verbose_name="Property Name"
    )
    property_type = models.CharField(
        max_length=30,
        choices=PROPERTY_TYPE_CHOICES,
        verbose_name="Property Type"
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPE_CHOICES,
        verbose_name="Transaction Type"
    )
    price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        verbose_name="Price"
    )
    price_per_sqft = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Price Per SqFt"
    )
    bhk = models.PositiveIntegerField(
        verbose_name="BHK"
    )
    carpet_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Carpet Area (sqft)"
    )
    builtup_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Builtup Area (sqft)"
    )
    super_builtup_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Super Builtup Area (sqft)"
    )
    bathrooms = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name="Bathrooms"
    )
    balconies = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name="Balconies"
    )
    parking_spaces = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name="Parking Spaces"
    )
    floor_number = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name="Floor Number"
    )
    total_floors = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name="Total Floors"
    )
    furnishing_status = models.CharField(
        max_length=20,
        choices=FurnishingStatus.choices,
        blank=True,
        null=True,
        verbose_name="Furnishing Status"
    )
    facing = models.CharField(
        max_length=20,
        choices=FacingDirection.choices,
        blank=True,
        null=True,
        verbose_name="Facing"
    )
    construction_age = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name="Construction Age (Years)"
    )
    land_area = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Land Area (sqft)"
    )
    address = models.TextField(
        verbose_name="Address"
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        verbose_name="Latitude"
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        verbose_name="Longitude"
    )
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        verbose_name="Status"
    )
    launch_date = models.DateField(
        blank=True,
        null=True,
        verbose_name="Launch Date"
    )
    completion_date = models.DateField(
        blank=True,
        null=True,
        verbose_name="Completion Date"
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Description"
    )

    class Meta:
        verbose_name = "Property"
        verbose_name_plural = "Properties"
        ordering = ['-created_at']
        constraints = [
            CheckConstraint(
                check=Q(price__gte=0),
                name="check_property_price_positive"
            ),
            CheckConstraint(
                check=Q(price_per_sqft__gte=0),
                name="check_property_price_per_sqft_positive"
            ),
            CheckConstraint(
                check=Q(bhk__gte=0),
                name="check_property_bhk_positive"
            ),
            CheckConstraint(
                check=Q(carpet_area__gt=0),
                name="check_property_carpet_area_positive"
            ),
            CheckConstraint(
                check=Q(builtup_area__isnull=True) | Q(builtup_area__gt=0),
                name="check_property_builtup_area_positive"
            ),
            CheckConstraint(
                check=Q(super_builtup_area__isnull=True) | Q(super_builtup_area__gt=0),
                name="check_property_super_builtup_area_positive"
            ),
            CheckConstraint(
                check=Q(land_area__isnull=True) | Q(land_area__gte=0),
                name="check_property_land_area_positive"
            ),
            CheckConstraint(
                check=Q(latitude__gte=-90) & Q(latitude__lte=90),
                name="check_property_latitude_range"
            ),
            CheckConstraint(
                check=Q(longitude__gte=-180) & Q(longitude__lte=180),
                name="check_property_longitude_range"
            )
        ]

    def __str__(self):
        return f"{self.property_name} - {self.locality.name} ({self.property_type})"

    @property
    def nearby_places(self):
        """
        Returns nearby places from the property's associated locality.
        """
        if self.locality_id:
            return self.locality.nearby_places.all()
        return NearbyPlace.objects.none()

    def get_nearby_places_grouped(self):
        """
        Returns nearby places grouped by category/type.
        """
        places = self.nearby_places
        grouped = {}
        for place in places:
            place_type = place.type
            if place_type not in grouped:
                grouped[place_type] = []
            grouped[place_type].append(place)
        return grouped


class Amenity(models.Model):
    """
    Lookup catalog of standard building amenities (e.g. Swimming Pool, Gym).
    """
    amenity_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Amenity ID"
    )
    amenity_name = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        verbose_name="Amenity Name"
    )

    class Meta:
        verbose_name = "Amenity"
        verbose_name_plural = "Amenities"
        ordering = ['amenity_name']

    def __str__(self):
        return self.amenity_name


class PropertyAmenity(models.Model):
    """
    Many-to-Many join table mapping properties to their available amenities.
    Enforces a composite unique constraint at database level.
    """
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='property_amenities',
        verbose_name="Property"
    )
    amenity = models.ForeignKey(
        Amenity,
        on_delete=models.CASCADE,
        related_name='property_amenities',
        verbose_name="Amenity"
    )

    class Meta:
        verbose_name = "Property Amenity"
        verbose_name_plural = "Property Amenities"
        constraints = [
            models.UniqueConstraint(
                fields=['property', 'amenity'],
                name='unique_property_amenity_relation'
            )
        ]

    def __str__(self):
        return f"{self.property.property_name} - {self.amenity.amenity_name}"


class PropertyImage(models.Model):
    """
    Photographs, elevations, and floor plans attached to a property listing.
    """
    IMAGE_TYPE_CHOICES = (
        ('elevation', 'Elevation'),
        ('floor_plan', 'Floor Plan'),
        ('interior', 'Interior'),
        ('exterior', 'Exterior'),
        ('other', 'Other'),
    )

    image_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Image ID"
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name="Property"
    )
    image_url = models.URLField(
        max_length=500,
        verbose_name="Image URL"
    )
    image_type = models.CharField(
        max_length=30,
        choices=IMAGE_TYPE_CHOICES,
        default='elevation',
        verbose_name="Image Type"
    )
    display_order = models.PositiveIntegerField(
        default=0,
        verbose_name="Display Order"
    )
    is_primary = models.BooleanField(
        default=False,
        verbose_name="Is Primary Image"
    )

    class Meta:
        verbose_name = "Property Image"
        verbose_name_plural = "Property Images"
        ordering = ['display_order']
        constraints = [
            CheckConstraint(
                check=Q(display_order__gte=0),
                name="check_image_display_order_positive"
            )
        ]

    def __str__(self):
        return f"Image of {self.property.property_name} ({self.image_type})"


class PropertyDocument(models.Model):
    """
    Legal deeds, layout plans, tax certificates, or title reports.
    Tracks OCR and manual verification states.
    """
    DOCUMENT_TYPE_CHOICES = (
        ('deed', 'Sale Deed / Title Deed'),
        ('layout_plan', 'Approved Layout Plan'),
        ('tax_receipt', 'Property Tax Receipt'),
        ('zoning_plan', 'Zoning Clearance'),
        ('rera_cert', 'RERA Certificate'),
        ('other', 'Other Document'),
    )

    OCR_STATUS_CHOICES = (
        ('idle', 'Idle / Waiting'),
        ('processing', 'OCR Processing'),
        ('completed', 'OCR Completed'),
        ('failed', 'OCR Failed'),
    )

    VERIFICATION_STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('verified', 'Verified Legitimate'),
        ('rejected', 'Rejected / Disputed'),
    )

    document_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Document ID"
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name="Property"
    )
    document_name = models.CharField(
        max_length=255,
        verbose_name="Document Name"
    )
    document_type = models.CharField(
        max_length=40,
        choices=DOCUMENT_TYPE_CHOICES,
        verbose_name="Document Type"
    )
    document_url = models.URLField(
        max_length=500,
        verbose_name="Document URL"
    )
    ocr_status = models.CharField(
        max_length=20,
        choices=OCR_STATUS_CHOICES,
        default='idle',
        verbose_name="OCR Status"
    )
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default='pending',
        verbose_name="Verification Status"
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Uploaded At"
    )

    class Meta:
        verbose_name = "Property Document"
        verbose_name_plural = "Property Documents"
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.document_name} - {self.property.property_name}"


class PriceHistory(models.Model):
    """
    Tracks price changes over time for a property listing.
    """
    history_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="History ID"
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='price_histories',
        verbose_name="Property"
    )
    price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        verbose_name="Price"
    )
    recorded_date = models.DateField(
        db_index=True,
        verbose_name="Recorded Date"
    )

    class Meta:
        verbose_name = "Price History"
        verbose_name_plural = "Price Histories"
        ordering = ['-recorded_date']
        constraints = [
            CheckConstraint(check=Q(price__gte=0), name="check_price_history_positive")
        ]

    def __str__(self):
        return f"{self.property.property_name} - {self.price} on {self.recorded_date}"


class PropertyScore(models.Model):
    """
    Calculated analytics and predicted evaluation scores derived from ML model layers.
    """
    score_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Score ID"
    )
    property = models.OneToOneField(
        Property,
        on_delete=models.CASCADE,
        related_name='score',
        verbose_name="Property"
    )
    predicted_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        verbose_name="Predicted Price"
    )
    fair_price_score = models.IntegerField(
        verbose_name="Fair Price Score"
    )
    builder_score = models.IntegerField(
        verbose_name="Builder Score"
    )
    locality_score = models.IntegerField(
        verbose_name="Locality Score"
    )
    connectivity_score = models.IntegerField(
        verbose_name="Connectivity Score"
    )
    investment_score = models.IntegerField(
        verbose_name="Investment Score"
    )
    risk_score = models.IntegerField(
        verbose_name="Risk Score"
    )
    confidence_score = models.FloatField(
        verbose_name="Confidence Score"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    class Meta:
        verbose_name = "Property Score"
        verbose_name_plural = "Property Scores"
        constraints = [
            CheckConstraint(
                check=Q(predicted_price__gte=0),
                name="check_score_predicted_price_positive"
            ),
            CheckConstraint(
                check=Q(fair_price_score__gte=0) & Q(fair_price_score__lte=100),
                name="check_fair_price_score_range"
            ),
            CheckConstraint(
                check=Q(builder_score__gte=0) & Q(builder_score__lte=100),
                name="check_builder_score_range"
            ),
            CheckConstraint(
                check=Q(locality_score__gte=0) & Q(locality_score__lte=100),
                name="check_locality_score_range"
            ),
            CheckConstraint(
                check=Q(connectivity_score__gte=0) & Q(connectivity_score__lte=100),
                name="check_connectivity_score_range"
            ),
            CheckConstraint(
                check=Q(investment_score__gte=0) & Q(investment_score__lte=100),
                name="check_investment_score_range"
            ),
            CheckConstraint(
                check=Q(risk_score__gte=0) & Q(risk_score__lte=100),
                name="check_risk_score_range"
            ),
            CheckConstraint(
                check=Q(confidence_score__gte=0.0) & Q(confidence_score__lte=1.0),
                name="check_confidence_score_range"
            ),
        ]

    def __str__(self):
        return f"Scores for {self.property.property_name}"


class PropertySource(models.Model):
    """
    Reference links tracing listing feeds back to original crawled portals.
    """
    source_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Source ID"
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='sources',
        verbose_name="Property"
    )
    source_name = models.CharField(
        max_length=100,
        verbose_name="Source Name"  # e.g., 99acres, Magicbricks
    )
    source_url = models.URLField(
        max_length=500,
        verbose_name="Source URL"
    )
    scraped_at = models.DateTimeField(
        verbose_name="Scraped At"
    )
    last_verified_at = models.DateTimeField(
        verbose_name="Last Verified At"
    )

    class Meta:
        verbose_name = "Property Source"
        verbose_name_plural = "Property Sources"

    def __str__(self):
        return f"Source {self.source_name} for {self.property.property_name}"


class PropertyListing(BaseModel):
    """
    Store information about who listed the property (Owner, Builder, Broker, Agency).
    """
    listing_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Listing ID"
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='listings',
        verbose_name="Property"
    )
    listed_by_type = models.CharField(
        max_length=20,
        choices=ListedByType.choices,
        verbose_name="Listed By Type"
    )
    owner = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='property_listings',
        verbose_name="Owner"
    )
    builder = models.ForeignKey(
        Builder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='property_listings',
        verbose_name="Builder"
    )
    contact_name = models.CharField(
        max_length=255,
        verbose_name="Contact Name"
    )
    contact_phone = models.CharField(
        max_length=15,
        validators=[validate_phone_number],
        verbose_name="Contact Phone"
    )
    contact_email = models.EmailField(
        verbose_name="Contact Email"
    )
    is_verified = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Is Verified"
    )
    listing_status = models.CharField(
        max_length=20,
        choices=ListingStatus.choices,
        default=ListingStatus.ACTIVE,
        db_index=True,
        verbose_name="Listing Status"
    )

    class Meta:
        db_table = 'properties_propertylisting'
        verbose_name = "Property Listing"
        verbose_name_plural = "Property Listings"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['property', 'listing_status'], name='idx_listing_prop_status'),
            models.Index(fields=['listed_by_type'], name='idx_listing_listed_by_type'),
            models.Index(fields=['is_verified'], name='idx_listing_is_verified'),
        ]
        constraints = [
            CheckConstraint(
                check=Q(owner__isnull=False) | Q(builder__isnull=False),
                name="check_listing_owner_or_builder_required"
            )
        ]

    def clean(self):
        super().clean()
        if not self.owner and not self.builder:
            raise ValidationError("At least one of owner or builder must be specified for a property listing.")

    def __str__(self):
        return f"Listing ({self.listed_by_type}) for {self.property.property_name}"


class PropertyLegal(BaseModel):
    """
    Store legal information separately from the Property model in a 1-to-1 relationship.
    """
    legal_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Legal ID"
    )
    property = models.OneToOneField(
        Property,
        on_delete=models.CASCADE,
        related_name='legal_info',
        verbose_name="Property"
    )
    survey_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
        verbose_name="Survey Number"
    )
    khata_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
        verbose_name="Khata Number"
    )
    na_converted = models.BooleanField(
        default=False,
        verbose_name="NA Converted"
    )
    verification_status = models.CharField(
        max_length=20,
        choices=LegalVerificationStatus.choices,
        default=LegalVerificationStatus.PENDING,
        db_index=True,
        verbose_name="Verification Status"
    )
    verified_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_legal_records',
        verbose_name="Verified By"
    )
    verified_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Verified At"
    )
    remarks = models.TextField(
        blank=True,
        null=True,
        verbose_name="Remarks"
    )

    class Meta:
        db_table = 'properties_propertylegal'
        verbose_name = "Property Legal Record"
        verbose_name_plural = "Property Legal Records"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['verification_status'], name='idx_legal_verif_status'),
            models.Index(fields=['survey_number'], name='idx_legal_survey_number'),
            models.Index(fields=['khata_number'], name='idx_legal_khata_number'),
        ]

    def __str__(self):
        return f"Legal Record for {self.property.property_name} ({self.verification_status})"


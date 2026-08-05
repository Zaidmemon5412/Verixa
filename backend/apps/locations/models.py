import uuid
from django.db import models
from django.db.models import CheckConstraint, Q
from apps.core.models import BaseModel
from apps.core.validators import validate_pincode


class Locality(BaseModel):
    """
    Geographic locality/neighborhood representing real estate divisions.
    """
    locality_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Locality ID"
    )
    name = models.CharField(
        max_length=255,
        db_index=True,
        verbose_name="Locality Name"
    )
    city = models.CharField(
        max_length=100,
        db_index=True,
        verbose_name="City"
    )
    state = models.CharField(
        max_length=100,
        verbose_name="State"
    )
    pincode = models.CharField(
        max_length=6,
        validators=[validate_pincode],
        verbose_name="Pincode"
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
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Description"
    )

    class Meta:
        verbose_name = "Locality"
        verbose_name_plural = "Localities"
        ordering = ['city', 'name']
        constraints = [
            CheckConstraint(
                check=Q(latitude__gte=-90) & Q(latitude__lte=90),
                name="check_locality_latitude_range"
            ),
            CheckConstraint(
                check=Q(longitude__gte=-180) & Q(longitude__lte=180),
                name="check_locality_longitude_range"
            ),
            # Enforce unique geographic combination at db level
            models.UniqueConstraint(
                fields=['name', 'city', 'state'],
                name='unique_locality_name_city_state'
            )
        ]

    def __str__(self):
        return f"{self.name}, {self.city} ({self.pincode})"


class NearbyPlace(BaseModel):
    """
    Key amenities and transportation hubs surrounding a Locality.
    """
    place_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="Place ID"
    )
    locality = models.ForeignKey(
        Locality,
        on_delete=models.CASCADE,
        related_name='nearby_places',
        verbose_name="Locality"
    )
    name = models.CharField(
        max_length=255,
        verbose_name="Place Name"
    )
    type = models.CharField(
        max_length=100,
        verbose_name="Place Type"  # e.g. Metro Station, School, Hospital
    )
    distance = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Distance (km)"
    )
    distance_km = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Distance (km)"
    )
    address = models.TextField(
        blank=True,
        null=True,
        verbose_name="Address"
    )
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Rating"
    )
    travel_time = models.PositiveIntegerField(
        default=0,
        blank=True,
        null=True,
        verbose_name="Travel Time (minutes)"
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
    source = models.CharField(
        max_length=100,
        default='OpenStreetMap',
        blank=True,
        null=True,
        verbose_name="Data Source"
    )
    osm_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
        verbose_name="OSM ID"
    )

    class Meta:
        verbose_name = "Nearby Place"
        verbose_name_plural = "Nearby Places"
        ordering = ['distance_km', 'distance']
        constraints = [
            CheckConstraint(
                check=Q(distance__isnull=True) | Q(distance__gte=0),
                name="check_nearby_place_distance_positive"
            ),
            CheckConstraint(
                check=Q(distance_km__isnull=True) | Q(distance_km__gte=0),
                name="check_nearby_place_distance_km_positive"
            ),
            CheckConstraint(
                check=Q(rating__isnull=True) | (Q(rating__gte=0) & Q(rating__lte=5)),
                name="check_nearby_place_rating_range"
            ),
            CheckConstraint(
                check=Q(travel_time__gte=0),
                name="check_nearby_place_travel_time_positive"
            ),
            CheckConstraint(
                check=Q(latitude__gte=-90) & Q(latitude__lte=90),
                name="check_nearby_place_latitude_range"
            ),
            CheckConstraint(
                check=Q(longitude__gte=-180) & Q(longitude__lte=180),
                name="check_nearby_place_longitude_range"
            )
        ]

    def save(self, *args, **kwargs):
        if self.distance_km is not None and self.distance is None:
            self.distance = self.distance_km
        elif self.distance is not None and self.distance_km is None:
            self.distance_km = self.distance
        super().save(*args, **kwargs)

    def __str__(self):
        dist = self.distance_km if self.distance_km is not None else self.distance
        return f"{self.name} ({self.type}) - {dist} km from {self.locality.name}"

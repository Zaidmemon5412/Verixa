import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
# pyrefly: ignore [missing-import]
from apps.core.validators import validate_phone_number
# pyrefly: ignore [missing-import]
from apps.properties.models import Property
from .managers import CustomUserManager


class User(AbstractUser):
    """
    Custom user model for the Verixa platform.
    Uses UUID primary keys and defines roles and profile data.
    """
    ROLE_CHOICES = (
        ('buyer', 'Property Buyer'),
        ('agent', 'Real Estate Agent'),
        ('verifier', 'Document Verifier'),
        ('admin', 'Platform Administrator'),
    )

    user_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="User ID"
    )
    full_name = models.CharField(
        max_length=255,
        verbose_name="Full Name"
    )
    email = models.EmailField(
        unique=True,
        db_index=True,
        verbose_name="Email Address"
    )
    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[validate_phone_number],
        verbose_name="Phone Number"
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='buyer',
        verbose_name="User Role"
    )
    profile_image = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="Profile Image URL"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name="Created At"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role', 'full_name']

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.role})"

    def save(self, *args, **kwargs):
        # Sync full_name into first_name and last_name for Django compatibility
        if self.full_name:
            names = self.full_name.split(' ', 1)
            self.first_name = names[0]
            if len(names) > 1:
                self.last_name = names[1]

        super().save(*args, **kwargs)


class SavedProperty(models.Model):
    """
    Many-to-Many connection linking properties saved by users.
    Enforces composite uniqueness on (user, property).
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="ID"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='saved_properties',
        verbose_name="User"
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='saved_by_users',
        verbose_name="Saved Property"
    )
    saved_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Saved At"
    )

    class Meta:
        verbose_name = "Saved Property"
        verbose_name_plural = "Saved Properties"
        ordering = ['-saved_at']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'property'],
                name='unique_user_saved_property'
            )
        ]

    def __str__(self):
        return f"{self.user.full_name} saved {self.property.property_name}"

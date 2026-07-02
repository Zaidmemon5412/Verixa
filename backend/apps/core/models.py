from django.db import models


class BaseModel(models.Model):
    """
    Abstract base model that defines audit timestamps.
    Subclasses must define their own primary key.
    """
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name="Created At"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    class Meta:
        abstract = True


class SoftDeleteMixin(models.Model):
    """
    Mixin to support soft deletion operations on database records.
    """
    is_deleted = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Is Deleted"
    )

    def soft_delete(self):
        self.is_deleted = True
        self.save()

    def restore(self):
        self.is_deleted = False
        self.save()

    class Meta:
        abstract = True


class ActiveMixin(models.Model):
    """
    Mixin to support status activation flags on database records.
    """
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name="Is Active"
    )

    class Meta:
        abstract = True

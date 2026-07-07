"""
Services layer for the builders app.
Handles core business logic for builder profile management.
"""
import uuid
import logging
from typing import Union
from django.db.models import QuerySet
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import Builder

logger = logging.getLogger(__name__)


def create_builder(validated_data: dict) -> Builder:
    """
    Business logic to create a new builder profile.
    Checks for duplicate RERA registration numbers.
    """
    rera_no = validated_data.get('rera_registration_no')
    logger.info(f"Attempting to create builder with RERA Registration No: {rera_no}")
    
    if rera_no and Builder.objects.filter(rera_registration_no=rera_no).exists():
        raise ValidationError(
            _("A builder with this RERA registration number already exists."),
            code='duplicate_rera'
        )
        
    builder = Builder.objects.create(**validated_data)
    logger.info(f"Successfully created builder: {builder.builder_name} (ID: {builder.builder_id})")
    return builder


def get_builder(builder_id: Union[uuid.UUID, str]) -> Builder:
    """
    Business logic to retrieve a builder by ID.
    Raises Builder.DoesNotExist if not found.
    """
    logger.info(f"Retrieving builder with ID: {builder_id}")
    return Builder.objects.get(builder_id=builder_id)


def get_all_builders() -> QuerySet[Builder]:
    """
    Business logic to retrieve all builders.
    """
    logger.info("Retrieving all builders")
    return Builder.objects.all()


def update_builder(builder: Builder, validated_data: dict) -> Builder:
    """
    Business logic to update fields on an existing builder.
    Saves and returns the updated Builder instance.
    """
    logger.info(f"Updating builder: {builder.builder_name} (ID: {builder.builder_id})")
    
    # Update fields from validated_data dynamically
    for field, value in validated_data.items():
        setattr(builder, field, value)
        
    builder.save()
    logger.info(f"Successfully updated builder: {builder.builder_name} (ID: {builder.builder_id})")
    return builder


def delete_builder(builder: Builder) -> None:
    """
    Business logic to delete a builder.
    """
    logger.info(f"Deleting builder: {builder.builder_name} (ID: {builder.builder_id})")
    builder.delete()
    logger.info(f"Successfully deleted builder (ID: {builder.builder_id})")

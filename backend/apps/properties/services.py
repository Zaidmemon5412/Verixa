"""
Services layer for the properties app.
Handles core business logic for Amenity, PropertyAmenity, PropertyImage, and PropertyDocument.
"""
import os
import uuid
import logging
import urllib.parse
from typing import Union
from django.db import transaction, models
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db.models import QuerySet
from django.utils.translation import gettext_lazy as _
from django.conf import settings

from .models import Property, PropertyImage, PropertyDocument, Amenity, PropertyAmenity
from .validators import validate_image_file, validate_document_file

logger = logging.getLogger(__name__)


# ==================================================
# AMENITY SERVICES
# ==================================================

def create_amenity(validated_data: dict) -> Amenity:
    """
    Creates a new Amenity profile.
    Name check is already handled by the serializer calling validate_amenity_name.
    """
    name = validated_data.get('amenity_name')
    logger.info(f"Creating amenity with name: '{name}'")
    return Amenity.objects.create(**validated_data)


def get_amenity(amenity_id: Union[uuid.UUID, str]) -> Amenity:
    """
    Retrieves an Amenity by ID. Raises Amenity.DoesNotExist if not found.
    """
    logger.info(f"Retrieving amenity with ID: {amenity_id}")
    return Amenity.objects.get(amenity_id=amenity_id)


def get_all_amenities() -> QuerySet[Amenity]:
    """
    Retrieves all Amenities.
    """
    logger.info("Retrieving all amenities")
    return Amenity.objects.all()


def update_amenity(amenity: Amenity, validated_data: dict) -> Amenity:
    """
    Updates fields on an existing Amenity.
    Saves and returns the updated Amenity instance.
    """
    logger.info(f"Updating amenity: {amenity.amenity_name} (ID: {amenity.amenity_id})")
    for field, value in validated_data.items():
        setattr(amenity, field, value)
    amenity.save()
    return amenity


def delete_amenity(amenity: Amenity) -> None:
    """
    Deletes an Amenity profile.
    """
    logger.info(f"Deleting amenity: {amenity.amenity_name} (ID: {amenity.amenity_id})")
    amenity.delete()


# ==================================================
# PROPERTY AMENITY SERVICES
# ==================================================

def assign_amenity_to_property(
    property_id: Union[uuid.UUID, str], 
    amenity_id: Union[uuid.UUID, str]
) -> PropertyAmenity:
    """
    Assigns an Amenity to a Property.
    Resolves Property and Amenity instances and validates them.
    Raises Property.DoesNotExist, Amenity.DoesNotExist, or ValidationError.
    """
    logger.info(f"Assigning amenity {amenity_id} to property {property_id}")
    
    # Resolve models
    try:
        property_obj = Property.objects.get(property_id=property_id)
    except (Property.DoesNotExist, ValidationError, ValueError):
        logger.warning(f"Property not found: {property_id}")
        raise Property.DoesNotExist(_("Property not found."))
        
    try:
        amenity_obj = Amenity.objects.get(amenity_id=amenity_id)
    except (Amenity.DoesNotExist, ValidationError, ValueError):
        logger.warning(f"Amenity not found: {amenity_id}")
        raise Amenity.DoesNotExist(_("Amenity not found."))

    # Check duplicate mapping
    if PropertyAmenity.objects.filter(property=property_obj, amenity=amenity_obj).exists():
        raise ValidationError(
            _("This property-amenity mapping already exists."),
            code='duplicate_mapping'
        )

    mapping = PropertyAmenity.objects.create(property=property_obj, amenity=amenity_obj)
    logger.info(f"Assigned successfully: Mapping ID {mapping.id}")
    return mapping


def remove_amenity_from_property(property_amenity_id: Union[int, str]) -> None:
    """
    Removes a Property-Amenity mapping.
    """
    logger.info(f"Removing property amenity mapping with ID: {property_amenity_id}")
    try:
        mapping = PropertyAmenity.objects.get(id=property_amenity_id)
    except (PropertyAmenity.DoesNotExist, ValueError):
        raise PropertyAmenity.DoesNotExist(_("Property-Amenity mapping not found."))
        
    mapping.delete()
    logger.info(f"Successfully removed mapping ID: {property_amenity_id}")


def get_property_amenities(property_id: Union[uuid.UUID, str]) -> QuerySet[PropertyAmenity]:
    """
    Retrieves all Amenity mappings for a specific Property.
    """
    logger.info(f"Retrieving mappings for property: {property_id}")
    return PropertyAmenity.objects.filter(property_id=property_id)


def get_amenity_properties(amenity_id: Union[uuid.UUID, str]) -> QuerySet[PropertyAmenity]:
    """
    Retrieves all Property mappings for a specific Amenity.
    """
    logger.info(f"Retrieving mappings for amenity: {amenity_id}")
    return PropertyAmenity.objects.filter(amenity_id=amenity_id)


# ==================================================
# STORAGE PATH DECODER
# ==================================================

def get_storage_path_from_url(url):
    """
    Decodes the given URL and extracts the relative storage path.
    Example: '/media/properties/images/xyz.jpg' -> 'properties/images/xyz.jpg'
    """
    url_path = urllib.parse.unquote(url)
    media_url = settings.MEDIA_URL  # typically '/media/' or 'media/'
    
    # Strip any leading slashes for comparison
    clean_media_url = media_url.lstrip('/')
    clean_url_path = url_path.lstrip('/')
    
    if clean_url_path.startswith(clean_media_url):
        return clean_url_path[len(clean_media_url):].lstrip('/')
    
    return clean_url_path


# ==================================================
# PROPERTY IMAGE SERVICES
# ==================================================

class PropertyImageService:
    @staticmethod
    @transaction.atomic
    def upload_images(property_id, files, image_type='elevation'):
        """
        Handles multiple file uploads, assigns display orders sequentially,
        and sets the first uploaded image as is_primary=True if no primary image exists.
        """
        try:
            property_obj = Property.objects.get(pk=property_id)
        except Property.DoesNotExist:
            raise ValidationError(f"Property with ID {property_id} does not exist.")

        # Find current maximum display order for this property
        max_order = PropertyImage.objects.filter(property=property_obj).aggregate(
            models.Max('display_order')
        )['display_order__max']
        
        next_order = (max_order + 1) if max_order is not None else 0
        
        # Check if property already has a primary image
        has_primary = PropertyImage.objects.filter(property=property_obj, is_primary=True).exists()
        
        created_images = []
        for i, file in enumerate(files):
            # Validate file size and type
            validate_image_file(file)
            
            # Save file to default storage
            ext = os.path.splitext(file.name)[1].lower()
            filename = f"{uuid.uuid4()}{ext}"
            storage_path = os.path.join('properties/images/', filename)
            saved_path = default_storage.save(storage_path, ContentFile(file.read()))
            image_url = default_storage.url(saved_path)
            
            # Set the first uploaded image as primary if no primary image exists
            is_primary = False
            if not has_primary and i == 0:
                is_primary = True
                has_primary = True
                
            img = PropertyImage.objects.create(
                property=property_obj,
                image_url=image_url,
                image_type=image_type,
                display_order=next_order,
                is_primary=is_primary
            )
            created_images.append(img)
            next_order += 1
            
        return created_images

    @staticmethod
    @transaction.atomic
    def set_primary_image(image_id):
        """
        Atomic transaction ensuring only ONE image per property has is_primary=True.
        Sets all other images for the property to is_primary=False.
        """
        try:
            img = PropertyImage.objects.get(pk=image_id)
        except PropertyImage.DoesNotExist:
            raise ValidationError(f"PropertyImage with ID {image_id} does not exist.")
            
        # Set all other images for this property to false
        PropertyImage.objects.filter(property=img.property).exclude(pk=image_id).update(is_primary=False)
        
        # Set this one to primary
        img.is_primary = True
        img.save(update_fields=['is_primary'])
        return img

    @staticmethod
    @transaction.atomic
    def reorder_images(property_id, ordered_id_list):
        """
        Updates the display order fields for a batch of images cleanly.
        """
        try:
            property_obj = Property.objects.get(pk=property_id)
        except Property.DoesNotExist:
            raise ValidationError(f"Property with ID {property_id} does not exist.")
            
        updated_images = []
        for order, img_id in enumerate(ordered_id_list):
            try:
                img = PropertyImage.objects.get(pk=img_id, property=property_obj)
                img.display_order = order
                img.save(update_fields=['display_order'])
                updated_images.append(img)
            except PropertyImage.DoesNotExist:
                raise ValidationError(
                    f"PropertyImage with ID {img_id} does not exist or does not belong to property {property_id}"
                )
                
        return updated_images

    @staticmethod
    @transaction.atomic
    def delete_image(image_id):
        """
        Handles safe database deletion and triggers underlying file storage cleanup.
        """
        try:
            img = PropertyImage.objects.get(pk=image_id)
        except PropertyImage.DoesNotExist:
            raise ValidationError(f"PropertyImage with ID {image_id} does not exist.")
            
        url = img.image_url
        img.delete()
        
        # Trigger physical file cleanup
        storage_path = get_storage_path_from_url(url)
        if default_storage.exists(storage_path):
            default_storage.delete(storage_path)
            
        return True


# ==================================================
# PROPERTY DOCUMENT SERVICES
# ==================================================

class PropertyDocumentService:
    @staticmethod
    @transaction.atomic
    def upload_document(property_id, files, document_type='other', document_name=None):
        """
        Handles single or batch document uploads.
        Sets initial ocr_status='idle' (pending OCR) and verification_status='pending' (unverified).
        """
        try:
            property_obj = Property.objects.get(pk=property_id)
        except Property.DoesNotExist:
            raise ValidationError(f"Property with ID {property_id} does not exist.")
            
        is_batch = isinstance(files, list) or hasattr(files, '__iter__') and not hasattr(files, 'read')
        file_list = list(files) if is_batch else [files]
        
        created_docs = []
        for file in file_list:
            # Validate file size and type
            validate_document_file(file)
            
            # Save file to default storage
            ext = os.path.splitext(file.name)[1].lower()
            filename = f"{uuid.uuid4()}{ext}"
            storage_path = os.path.join('properties/documents/', filename)
            saved_path = default_storage.save(storage_path, ContentFile(file.read()))
            doc_url = default_storage.url(saved_path)
            
            name = document_name if document_name else file.name
            
            doc = PropertyDocument.objects.create(
                property=property_obj,
                document_name=name,
                document_type=document_type,
                document_url=doc_url,
                ocr_status='idle',  # maps to waiting/pending OCR
                verification_status='pending'  # maps to unverified/pending review
            )
            created_docs.append(doc)
            
        return created_docs if is_batch else created_docs[0]

    @staticmethod
    def update_document_status(document_id, ocr_status=None, verification_status=None):
        """
        Updates document status flags safely.
        """
        try:
            doc = PropertyDocument.objects.get(pk=document_id)
        except PropertyDocument.DoesNotExist:
            raise ValidationError(f"PropertyDocument with ID {document_id} does not exist.")
            
        update_fields = []
        if ocr_status is not None:
            # Validate OCR status choice
            valid_ocr_statuses = [choice[0] for choice in PropertyDocument.OCR_STATUS_CHOICES]
            if ocr_status not in valid_ocr_statuses:
                raise ValidationError(f"Invalid OCR status '{ocr_status}'. Valid choices: {valid_ocr_statuses}")
            doc.ocr_status = ocr_status
            update_fields.append('ocr_status')
            
        if verification_status is not None:
            # Validate verification status choice
            valid_ver_statuses = [choice[0] for choice in PropertyDocument.VERIFICATION_STATUS_CHOICES]
            if verification_status not in valid_ver_statuses:
                raise ValidationError(f"Invalid verification status '{verification_status}'. Valid choices: {valid_ver_statuses}")
            doc.verification_status = verification_status
            update_fields.append('verification_status')
            
        if update_fields:
            doc.save(update_fields=update_fields)
            
        return doc

    @staticmethod
    @transaction.atomic
    def delete_document(document_id):
        """
        Handles safe database deletion and triggers underlying file storage cleanup.
        """
        try:
            doc = PropertyDocument.objects.get(pk=document_id)
        except PropertyDocument.DoesNotExist:
            raise ValidationError(f"PropertyDocument with ID {document_id} does not exist.")
            
        url = doc.document_url
        doc.delete()
        
        # Trigger physical file cleanup
        storage_path = get_storage_path_from_url(url)
        if default_storage.exists(storage_path):
            default_storage.delete(storage_path)
            
        return True

"""
Services layer for the properties app.
Handles core business logic for Amenity, PropertyAmenity, PropertyImage, and PropertyDocument.
"""
from django.core.exceptions import ValidationError as DjangoValidationError

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

from .models import Property, PropertyImage, PropertyDocument, Amenity, PropertyAmenity, PropertyListing, PropertyLegal
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


# ==================================================
# PROPERTY CRUD SERVICES
# ==================================================

def create_property(validated_data: dict) -> Property:
    """
    Creates a new Property record.
    """
    logger.info(f"Creating property: {validated_data.get('property_name')}")
    property_obj = Property.objects.create(**validated_data)
    
    # Automatically track initial price in PriceHistory
    if property_obj.price is not None:
        from django.utils import timezone
        from .models import PriceHistory
        PriceHistory.objects.create(
            property=property_obj,
            price=property_obj.price,
            recorded_date=timezone.now().date()
        )
    return property_obj


def get_property(property_id: Union[uuid.UUID, str]) -> Property:
    """
    Retrieves a Property by UUID, primary key, or slugified name.
    """
    logger.info(f"Retrieving property with identifier: {property_id}")
    qs = Property.objects.select_related('locality', 'builder').prefetch_related(
        'images', 'property_amenities__amenity', 'listings', 'legal_info', 'documents'
    )
    
    clean_id = str(property_id).strip()

    # 1. Try UUID lookup
    try:
        val = uuid.UUID(clean_id)
        return qs.get(property_id=val)
    except (ValueError, TypeError, DjangoValidationError, Property.DoesNotExist):
        pass

    # 2. Try integer primary key if numeric string
    try:
        if clean_id.isdigit():
            return qs.get(pk=int(clean_id))
    except (Property.DoesNotExist, ValueError):
        pass

    # 3. Try slug lookup if column exists
    if hasattr(Property, 'slug'):
        try:
            return qs.get(slug=clean_id)
        except (Property.DoesNotExist, DjangoValidationError):
            pass

    # 4. Try matching slugified property_name or property_id string
    try:
        from django.utils.text import slugify
        for p in qs.all()[:200]:
            if str(p.property_id).lower() == clean_id.lower() or slugify(p.property_name) == clean_id.lower():
                return p
    except Exception:
        pass

    # 5. Last resort fallback
    try:
        return qs.get(property_id=clean_id)
    except Exception:
        raise Property.DoesNotExist(f"Property matching query does not exist for identifier '{property_id}'")



def get_filter_options() -> dict:
    """
    Retrieves dynamic filter metadata from the active database records.
    """
    from django.db.models import Min, Max
    # pyrefly: ignore [missing-import]
    from apps.builders.models import Builder
    # pyrefly: ignore [missing-import]
    from apps.locations.models import Locality

    price_stats = Property.objects.aggregate(min_p=Min('price'), max_p=Max('price'))
    area_stats = Property.objects.aggregate(min_a=Min('carpet_area'), max_a=Max('carpet_area'))
    
    property_types = list(
        Property.objects.values_list('property_type', flat=True)
        .distinct().exclude(property_type__isnull=True).exclude(property_type='')
    )
    statuses = list(
        Property.objects.values_list('status', flat=True)
        .distinct().exclude(status__isnull=True).exclude(status='')
    )
    bhks = sorted(list(
        Property.objects.values_list('bhk', flat=True)
        .distinct().exclude(bhk__isnull=True)
    ))

    builders = list(Builder.objects.values('builder_id', 'builder_name'))
    localities = list(Locality.objects.values('locality_id', 'name', 'city'))

    return {
        "property_types": property_types or ['Apartment', 'Villa', 'Plot', 'Penthouse', 'Studio'],
        "statuses": statuses or ['Ready to Move', 'Under Construction', 'New Launch'],
        "bhks": bhks or [1, 2, 3, 4, 5],
        "builders": builders,
        "localities": localities,
        "price_range": {
            "min": float(price_stats['min_p']) if price_stats['min_p'] is not None else 1000000,
            "max": float(price_stats['max_p']) if price_stats['max_p'] is not None else 100000000
        },
        "area_range": {
            "min": float(area_stats['min_a']) if area_stats['min_a'] is not None else 500,
            "max": float(area_stats['max_a']) if area_stats['max_a'] is not None else 10000
        }
    }


def list_properties(params: dict = None) -> QuerySet[Property]:
    """
    Retrieves list of properties filtered using PropertyFilter.
    """
    logger.info("Listing properties with filters")
    queryset = Property.objects.select_related('locality', 'builder').prefetch_related('images', 'listings', 'legal_info').all()
    if params:
        from .filters import PropertyFilter
        queryset = PropertyFilter.filter_queryset(queryset, params)
    return queryset



def update_property(property_obj: Property, validated_data: dict) -> Property:
    """
    Updates an existing Property record.
    If price changes, automatically records entry in PriceHistory.
    """
    old_price = property_obj.price
    new_price = validated_data.get('price')

    for field, value in validated_data.items():
        setattr(property_obj, field, value)
    property_obj.save()

    if new_price is not None and new_price != old_price:
        from django.utils import timezone
        from .models import PriceHistory
        PriceHistory.objects.create(
            property=property_obj,
            price=new_price,
            recorded_date=timezone.now().date()
        )
    return property_obj


def delete_property(property_obj: Property) -> None:
    """
    Deletes a Property record.
    """
    logger.info(f"Deleting property: {property_obj.property_name} (ID: {property_obj.property_id})")
    property_obj.delete()


# ==================================================
# PROPERTY LISTING CRUD SERVICES
# ==================================================

def create_listing(validated_data: dict) -> PropertyListing:
    """
    Creates a new PropertyListing record.
    Validates that either owner or builder is specified.
    """
    from .models import PropertyListing
    owner = validated_data.get('owner')
    builder = validated_data.get('builder')
    if not owner and not builder:
        raise ValidationError(_("At least one of owner or builder must be specified for a property listing."))

    listing = PropertyListing.objects.create(**validated_data)
    logger.info(f"Created property listing {listing.listing_id} for property {listing.property.property_name}")
    return listing


def get_listing(listing_id: Union[uuid.UUID, str]) -> PropertyListing:
    """
    Retrieves a PropertyListing by UUID.
    """
    from .models import PropertyListing
    logger.info(f"Retrieving listing with ID: {listing_id}")
    return PropertyListing.objects.select_related('property', 'owner', 'builder').get(listing_id=listing_id)


def list_listings(params: dict = None) -> QuerySet[PropertyListing]:
    """
    Retrieves list of PropertyListings filtered using PropertyListingFilter.
    """
    from .models import PropertyListing
    from .filters import PropertyListingFilter
    logger.info("Listing property listings with filters")
    queryset = PropertyListing.objects.select_related('property', 'owner', 'builder').all()
    if params:
        queryset = PropertyListingFilter.filter_queryset(queryset, params)
    return queryset


def update_listing(listing_obj: PropertyListing, validated_data: dict) -> PropertyListing:
    """
    Updates an existing PropertyListing record.
    """
    from .models import PropertyListing
    for field, value in validated_data.items():
        setattr(listing_obj, field, value)

    if not listing_obj.owner and not listing_obj.builder:
        raise ValidationError(_("At least one of owner or builder must be specified for a property listing."))

    listing_obj.save()
    return listing_obj


def delete_listing(listing_obj: PropertyListing) -> None:
    """
    Deletes a PropertyListing record.
    """
    logger.info(f"Deleting property listing: {listing_obj.listing_id}")
    listing_obj.delete()


# ==================================================
# PROPERTY LEGAL CRUD SERVICES
# ==================================================

def create_legal_record(validated_data: dict) -> PropertyLegal:
    """
    Creates a new PropertyLegal record for a property.
    Enforces OneToOne relationship unicity.
    """
    from .models import PropertyLegal
    property_obj = validated_data.get('property')
    if PropertyLegal.objects.filter(property=property_obj).exists():
        raise ValidationError(_("A legal record already exists for this property."))

    legal = PropertyLegal.objects.create(**validated_data)
    logger.info(f"Created legal record {legal.legal_id} for property {property_obj.property_name}")
    return legal


def get_legal_record(legal_id: Union[uuid.UUID, str]) -> PropertyLegal:
    """
    Retrieves a PropertyLegal record by UUID.
    """
    from .models import PropertyLegal
    logger.info(f"Retrieving legal record with ID: {legal_id}")
    return PropertyLegal.objects.select_related('property', 'verified_by').get(legal_id=legal_id)


def list_legal_records(params: dict = None) -> QuerySet[PropertyLegal]:
    """
    Retrieves list of PropertyLegal records filtered using PropertyLegalFilter.
    """
    from .models import PropertyLegal
    from .filters import PropertyLegalFilter
    logger.info("Listing legal records with filters")
    queryset = PropertyLegal.objects.select_related('property', 'verified_by').all()
    if params:
        queryset = PropertyLegalFilter.filter_queryset(queryset, params)
    return queryset


def update_legal_record(legal_obj: PropertyLegal, validated_data: dict) -> PropertyLegal:
    """
    Updates an existing PropertyLegal record.
    """
    for field, value in validated_data.items():
        setattr(legal_obj, field, value)
    legal_obj.save()
    return legal_obj


def delete_legal_record(legal_obj: PropertyLegal) -> None:
    """
    Deletes a PropertyLegal record.
    """
    logger.info(f"Deleting property legal record: {legal_obj.legal_id}")
    legal_obj.delete()


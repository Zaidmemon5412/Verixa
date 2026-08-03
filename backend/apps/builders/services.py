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


# ============================================================================
# BUILDER PROJECT SERVICES
# ============================================================================

from decimal import Decimal
import csv
from django.db import transaction
from .models import BuilderProject, BuilderProjectImage


def create_builder_project(validated_data: dict) -> BuilderProject:
    """
    Business logic to create a new builder project.
    """
    logger.info(f"Creating builder project: {validated_data.get('project_name')}")
    project = BuilderProject.objects.create(**validated_data)
    logger.info(f"Successfully created builder project ID: {project.project_id}")
    return project


def get_builder_project(project_id: Union[uuid.UUID, str]) -> BuilderProject:
    """
    Retrieves a single builder project by ID with pre-fetched builder and images.
    """
    logger.info(f"Retrieving builder project ID: {project_id}")
    return BuilderProject.objects.select_related('builder').prefetch_related('images').get(project_id=project_id)


def get_all_builder_projects() -> QuerySet[BuilderProject]:
    """
    Retrieves all builder projects with pre-fetched builder and images.
    """
    logger.info("Retrieving all builder projects")
    return BuilderProject.objects.select_related('builder').prefetch_related('images').all()


def update_builder_project(project: BuilderProject, validated_data: dict) -> BuilderProject:
    """
    Updates an existing builder project.
    """
    logger.info(f"Updating builder project ID: {project.project_id}")
    for field, value in validated_data.items():
        setattr(project, field, value)
    project.save()
    return project


def delete_builder_project(project: BuilderProject) -> None:
    """
    Deletes a builder project.
    """
    logger.info(f"Deleting builder project ID: {project.project_id}")
    project.delete()


# ============================================================================
# BUILDER PROJECT IMAGE SERVICES
# ============================================================================

def add_builder_project_image(
    project: BuilderProject,
    image_url: str,
    display_order: int = None,
    is_primary: bool = False
) -> BuilderProjectImage:
    """
    Adds a new gallery image to a builder project.
    If is_primary is True, unsets is_primary on previous images.
    """
    if display_order is None:
        last_order = project.images.count()
        display_order = last_order + 1

    if is_primary:
        project.images.filter(is_primary=True).update(is_primary=False)

    image = BuilderProjectImage.objects.create(
        project=project,
        image_url=image_url,
        display_order=display_order,
        is_primary=is_primary
    )
    return image


def delete_builder_project_image(image_id: Union[uuid.UUID, str]) -> None:
    """
    Deletes a project gallery image.
    """
    image = BuilderProjectImage.objects.get(image_id=image_id)
    image.delete()


def set_primary_project_image(project: BuilderProject, image_id: Union[uuid.UUID, str]) -> BuilderProjectImage:
    """
    Sets a specific image as primary for the builder project.
    """
    project.images.all().update(is_primary=False)
    image = project.images.get(image_id=image_id)
    image.is_primary = True
    image.save()
    return image


# ============================================================================
# CSV & CLOUDINARY IMPORT SERVICE
# ============================================================================

import time
from typing import Dict, Any
from .cloudinary_service import (
    upload_remote_image,
    is_valid_image_url,
    get_cloudinary_folder_path,
    CloudinaryUploadError,
)


def import_builder_projects_from_csv(file_path: str, dry_run: bool = False) -> Dict[str, Any]:
    """
    Production-ready Builder Project Import System with automatic Cloudinary image migration.

    Flow:
    1. Read Builder Name -> Find Builder in database. Skip if missing. Never create Builders.
    2. Check duplicate BuilderProject -> Skip if already exists.
    3. Split Images column by '|' separator.
    4. Validate each image URL. Skip invalid URLs.
    5. Upload remote image URL directly to Cloudinary (no local downloads).
    6. Store ONLY returned Cloudinary secure_url in PostgreSQL.
    7. Create BuilderProjectImage records with display_order and is_primary = True for the 1st image.
    8. Fault-tolerant execution wrapping each project in its own atomic transaction.
    """
    start_time = time.time()

    report = {
        'total_projects_in_csv': 0,
        'imported_projects': 0,
        'updated_projects': 0,
        'skipped_projects': 0,
        'duplicate_projects': 0,
        'missing_builders': 0,
        'failed_projects': 0,
        'total_images_in_csv': 0,
        'imported_images': 0,
        'skipped_images': 0,
        'duplicate_images': 0,
        'failed_image_uploads': 0,
        'invalid_image_urls': 0,
        'import_duration_seconds': 0.0,
        'dry_run': dry_run,
        'logs': []
    }

    def log_msg(message: str, level: str = 'info'):
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        formatted = f"[{timestamp}] [{level.upper()}] {message}"
        report['logs'].append(formatted)
        if level == 'warning':
            logger.warning(message)
        elif level == 'error':
            logger.error(message)
        else:
            logger.info(message)

    log_msg(f"Starting Builder Project Import System (Dry-Run: {dry_run}) from file: {file_path}")

    try:
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = list(csv.DictReader(f))
            report['total_projects_in_csv'] = len(reader)

            for row_idx, row in enumerate(reader, start=1):
                builder_name = (row.get('Builder Name') or '').strip()
                project_name = (row.get('Project Name') or '').strip()

                if not builder_name or not project_name:
                    log_msg(f"Row {row_idx}: Missing Builder Name or Project Name. Skipping.", 'warning')
                    report['skipped_projects'] += 1
                    continue

                # STEP 1: Find Builder inside builders_builder. Do NOT create automatically.
                builder = Builder.objects.filter(builder_name__iexact=builder_name).first()
                if not builder:
                    log_msg(f"Skipping project '{project_name}': Builder '{builder_name}' not found in database.", 'warning')
                    report['missing_builders'] += 1
                    report['skipped_projects'] += 1
                    continue

                # STEP 2: Check Duplicate BuilderProject
                existing_project = BuilderProject.objects.filter(builder=builder, project_name__iexact=project_name).first()
                if existing_project and existing_project.images.count() > 0:
                    log_msg(f"Skipping duplicate project '{project_name}' for builder '{builder_name}' (already has images).", 'info')
                    report['duplicate_projects'] += 1
                    report['skipped_projects'] += 1
                    continue

                # STEP 3: Images parsing
                raw_images = row.get('Images', '')
                image_urls = [url.strip() for url in raw_images.split('|') if url.strip()]
                report['total_images_in_csv'] += len(image_urls)

                if dry_run:
                    log_msg(f"[DRY-RUN] Validated project '{project_name}' for builder '{builder_name}'.")
                    if existing_project:
                        report['updated_projects'] += 1
                    else:
                        report['imported_projects'] += 1

                    for img_url in image_urls:
                        if not is_valid_image_url(img_url):
                            log_msg(f"[DRY-RUN] Invalid image URL for project '{project_name}': {img_url}", 'warning')
                            report['invalid_image_urls'] += 1
                            report['skipped_images'] += 1
                        else:
                            report['imported_images'] += 1
                    continue

                # STEP 8 & Per-Project Database Transaction
                try:
                    with transaction.atomic():
                        lat_val = None
                        raw_lat = row.get('Latitude', '').strip()
                        if raw_lat:
                            try:
                                lat_val = Decimal(raw_lat)
                            except Exception:
                                lat_val = None

                        long_val = None
                        raw_long = row.get('Longitude', '').strip()
                        if raw_long:
                            try:
                                long_val = Decimal(raw_long)
                            except Exception:
                                long_val = None

                        raw_amenities = row.get('Amenities', '')
                        amenities_list = [a.strip() for a in raw_amenities.split('|') if a.strip()]

                        if existing_project:
                            project = existing_project
                            log_msg(f"Updating existing BuilderProject '{project_name}' (ID: {project.project_id}) with new images.")
                            report['updated_projects'] += 1
                        else:
                            project = BuilderProject.objects.create(
                                builder=builder,
                                project_name=project_name,
                                property_type=(row.get('Property Type') or '').strip(),
                                transaction_type=(row.get('Transaction Type') or '').strip(),
                                project_status=(row.get('Project Status') or '').strip(),
                                rera_number=(row.get('RERA Number') or '').strip(),
                                launch_date=(row.get('Launch Date') or '').strip(),
                                completion_date=(row.get('Completion Date') or '').strip(),
                                construction_type=(row.get('Construction Type') or '').strip(),
                                land_area=(row.get('Land Area') or '').strip(),
                                price=(row.get('Price') or '').strip(),
                                price_per_sqft=(row.get('Price Per Sqft') or '').strip(),
                                primary_bhk=(row.get('Primary BHK') or '').strip(),
                                bhk_variants=(row.get('BHK Variants') or '').strip(),
                                carpet_area=(row.get('Carpet Area') or '').strip(),
                                super_builtup_area=(row.get('Super Built-up Area') or '').strip(),
                                builtup_area=(row.get('Built-up Area') or '').strip(),
                                project_description=(row.get('Project Description') or '').strip(),
                                amenities=amenities_list,
                                website_url=(row.get('Website') or None),
                                latitude=lat_val,
                                longitude=long_val,
                                locality=(row.get('Locality') or '').strip(),
                                city=(row.get('City') or '').strip(),
                                state=(row.get('State') or '').strip(),
                                pincode=(row.get('Pincode') or '').strip(),
                                location=(row.get('Location') or '').strip(),
                            )
                            log_msg(f"Created BuilderProject '{project_name}' (ID: {project.project_id})")
                            report['imported_projects'] += 1

                        # Process images for project
                        folder_path = get_cloudinary_folder_path(builder_name, project_name)
                        successful_image_count = project.images.count()

                        for idx, img_url in enumerate(image_urls, start=1):
                            # STEP 4: Validate image URL
                            if not is_valid_image_url(img_url):
                                log_msg(f"Invalid image URL skipped for project '{project_name}': {img_url}", 'warning')
                                report['invalid_image_urls'] += 1
                                report['skipped_images'] += 1
                                continue

                            # STEP 5 & 6: Upload to Cloudinary using remote URL
                            try:
                                upload_res = upload_remote_image(
                                    remote_url=img_url,
                                    folder_path=folder_path,
                                    public_id=f"img_{idx}"
                                )
                                cloudinary_url = upload_res['secure_url']
                                public_id = upload_res['public_id']

                                # STEP 7: Create BuilderProjectImage with Cloudinary URL
                                successful_image_count += 1
                                is_primary_flag = (successful_image_count == 1)

                                BuilderProjectImage.objects.create(
                                    project=project,
                                    image_url=cloudinary_url,
                                    display_order=successful_image_count,
                                    is_primary=is_primary_flag
                                )
                                log_msg(f"Uploaded image #{successful_image_count} for '{project_name}' to Cloudinary: Public ID '{public_id}'")
                                report['imported_images'] += 1

                            except CloudinaryUploadError as cue:
                                log_msg(f"Cloudinary upload failed for project '{project_name}', URL: {img_url}. Error: {str(cue)}", 'error')
                                report['failed_image_uploads'] += 1
                                report['skipped_images'] += 1
                            except Exception as img_err:
                                log_msg(f"Unexpected image error for project '{project_name}', URL: {img_url}. Error: {str(img_err)}", 'error')
                                report['failed_image_uploads'] += 1
                                report['skipped_images'] += 1

                except Exception as proj_err:
                    log_msg(f"Failed to import project '{project_name}'. Error: {str(proj_err)}. Rolling back project transaction.", 'error')
                    report['failed_projects'] += 1
                    report['skipped_projects'] += 1


    except Exception as e:
        log_msg(f"Fatal error reading CSV file: {str(e)}", 'error')

    report['import_duration_seconds'] = round(time.time() - start_time, 2)
    log_msg(f"Import process finished in {report['import_duration_seconds']}s")
    return report



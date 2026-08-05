import os
import csv
import logging
import uuid
from decimal import Decimal, InvalidOperation

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.dateparse import parse_datetime, parse_date

from apps.properties.models import Property, PropertyImage
from apps.locations.models import Locality
from apps.builders.models import Builder

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = (
        "Imports Property records and associated Cloudinary PropertyImage records "
        "from CSV files idempotently."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--property-csv",
            type=str,
            default=os.path.join("..", "combined_property_data2.csv"),
            help="Path to property CSV file (default: ../combined_property_data2.csv)",
        )
        parser.add_argument(
            "--image-csv",
            type=str,
            default=os.path.join("..", "verixa_property_images_cloudinary.csv"),
            help="Path to Cloudinary images CSV file (default: ../verixa_property_images_cloudinary.csv)",
        )

    def handle(self, *args, **options):
        property_csv_path = options["property_csv"]
        image_csv_path = options["image_csv"]

        # Resolve paths if specified file doesn't exist directly
        if not os.path.exists(property_csv_path):
            if os.path.exists("combined_property_data2.csv"):
                property_csv_path = "combined_property_data2.csv"
            elif os.path.exists(os.path.join("..", "combined_property_data.csv")):
                property_csv_path = os.path.join("..", "combined_property_data.csv")
            elif os.path.exists("combined_property_data.csv"):
                property_csv_path = "combined_property_data.csv"
            else:
                self.stderr.write(
                    self.style.ERROR(f"Property CSV file not found at: {property_csv_path}")
                )
                return

        if not os.path.exists(image_csv_path):
            if os.path.exists("verixa_property_images_cloudinary.csv"):
                image_csv_path = "verixa_property_images_cloudinary.csv"
            else:
                self.stderr.write(
                    self.style.ERROR(f"Image CSV file not found at: {image_csv_path}")
                )
                return

        self.stdout.write(
            self.style.SUCCESS(
                f"Starting Property & Cloudinary Image Import:\n"
                f" - Property CSV: {property_csv_path}\n"
                f" - Image CSV: {image_csv_path}\n"
            )
        )

        stats = {
            "imported_properties": 0,
            "skipped_properties": 0,
            "duplicate_properties": 0,
            "missing_builders": 0,
            "missing_localities": 0,
            "failed_properties": 0,
            "imported_images": 0,
            "skipped_images": 0,
            "duplicate_images": 0,
            "failed_images": 0,
        }

        # Cache existing FK lookup tables for high performance
        existing_builder_ids = set(
            str(b_id) for b_id in Builder.objects.values_list("builder_id", flat=True)
        )
        existing_locality_ids = set(
            str(l_id) for l_id in Locality.objects.values_list("locality_id", flat=True)
        )

        # ----------------------------------------------------
        # 1. IMPORT PROPERTIES
        # ----------------------------------------------------
        self.stdout.write(self.style.NOTICE("Importing properties..."))

        with open(property_csv_path, mode="r", encoding="utf-8-sig") as p_file:
            reader = csv.DictReader(p_file)
            for row_idx, row in enumerate(reader, start=2):
                prop_id_str = self._clean_str(row.get("property_id"))
                if not prop_id_str:
                    self.stderr.write(f"Row {row_idx}: Missing property_id. Skipping.")
                    stats["failed_properties"] += 1
                    continue
                
                prop_id = self._parse_uuid(prop_id_str)

                # Idempotency check: Skip if Property already exists
                if Property.objects.filter(property_id=prop_id).exists():
                    stats["skipped_properties"] += 1
                    stats["duplicate_properties"] += 1
                    continue

                # FK Resolution & Validation
                locality_id_raw = self._clean_str(row.get("locality_id"))
                if not locality_id_raw:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Skipped Property {prop_id}: Missing Locality ID field."
                        )
                    )
                    stats["missing_localities"] += 1
                    stats["skipped_properties"] += 1
                    continue
                
                locality_id = self._parse_uuid(locality_id_raw)

                if str(locality_id) not in existing_locality_ids and str(locality_id_raw) not in existing_locality_ids:
                    # Create placeholder locality for missing FK to ensure properties import
                    loc_obj, _ = Locality.objects.get_or_create(
                        locality_id=locality_id,
                        defaults={
                            "name": self._clean_str(row.get("address")) or "Unknown Locality",
                            "city": "Ahmedabad",
                            "state": "Gujarat",
                            "pincode": "380001",
                            "latitude": self._parse_decimal(row.get("latitude")),
                            "longitude": self._parse_decimal(row.get("longitude")),
                        }
                    )
                    existing_locality_ids.add(str(locality_id))
                    stats["missing_localities"] += 1

                builder_id_raw = self._clean_str(row.get("builder_id"))
                builder_id = self._parse_uuid(builder_id_raw) if builder_id_raw and builder_id_raw != "0" else None
                if builder_id and str(builder_id) not in existing_builder_ids and builder_id_raw not in existing_builder_ids:
                    logger.warning(
                        f"Property {prop_id} has invalid Builder ID '{builder_id_raw}'. "
                        f"Setting builder to None."
                    )
                    stats["missing_builders"] += 1
                    builder_id = None

                try:
                    with transaction.atomic():
                        Property.objects.create(
                            property_id=prop_id,
                            builder_id=builder_id if builder_id else None,
                            locality_id=locality_id,
                            rera_number=self._clean_str(row.get("rera_number")),
                            property_name=self._clean_str(row.get("property_name")) or "Unnamed Property",
                            property_type=self._clean_str(row.get("property_type")) or "apartment",
                            transaction_type=self._clean_str(row.get("transaction_type")) or "resale",
                            price=self._parse_decimal(row.get("price")),
                            price_per_sqft=self._parse_decimal(row.get("price_per_sqft")),
                            bhk=self._parse_int(row.get("bhk"), default=0),
                            carpet_area=self._parse_decimal(row.get("carpet_area")),
                            builtup_area=self._parse_decimal(row.get("builtup_area")),
                            super_builtup_area=self._parse_decimal(row.get("super_builtup_area")),
                            land_area=self._parse_decimal(row.get("land_area")),
                            bathrooms=self._parse_int(row.get("bathrooms")),
                            balconies=self._parse_int(row.get("balconies")),
                            parking_spaces=self._parse_int(row.get("parking_spaces")),
                            floor_number=self._parse_int(row.get("floor_number")),
                            total_floors=self._parse_int(row.get("total_floors")),
                            furnishing_status=self._clean_str(row.get("furnishing_status"))[:20] if self._clean_str(row.get("furnishing_status")) else None,
                            facing=self._clean_str(row.get("facing"))[:20] if self._clean_str(row.get("facing")) else None,
                            construction_age=self._parse_int(row.get("construction_age")),
                            address=self._clean_str(row.get("address")) or "",
                            latitude=self._parse_decimal(row.get("latitude")),
                            longitude=self._parse_decimal(row.get("longitude")),
                            status=self._clean_str(row.get("status"))[:30] if self._clean_str(row.get("status")) else "ready",
                            launch_date=self._parse_date_val(row.get("launch_date")),
                            completion_date=self._parse_date_val(row.get("completion_date")),
                            description=self._clean_str(row.get("description")),
                            created_at=self._parse_datetime_val(row.get("created_at")),
                            updated_at=self._parse_datetime_val(row.get("updated_at")),
                        )
                        stats["imported_properties"] += 1
                except Exception as e:
                    logger.error(f"Error importing Property {prop_id} at row {row_idx}: {e}")
                    self.stderr.write(f"Failed to import Property {prop_id}: {e}")
                    stats["failed_properties"] += 1

        # ----------------------------------------------------
        # 2. IMPORT CLOUDINARY PROPERTY IMAGES
        # ----------------------------------------------------
        self.stdout.write(self.style.NOTICE("Importing Cloudinary Property Images..."))

        # Pre-load existing properties set to verify FK constraint
        existing_property_ids = set(
            str(p_id) for p_id in Property.objects.values_list("property_id", flat=True)
        )

        with open(image_csv_path, mode="r", encoding="utf-8-sig") as img_file:
            reader = csv.DictReader(img_file)
            
            # Group rows by property_id to maintain correct display order and set is_primary
            property_image_groups = {}
            for row_idx, row in enumerate(reader, start=2):
                img_id = self._clean_str(row.get("image_id"))
                p_id_raw = self._clean_str(row.get("property_id"))
                p_id = str(self._parse_uuid(p_id_raw)) if p_id_raw else None
                img_url = self._clean_str(row.get("image_url"))
                img_type = self._clean_str(row.get("image_type")) or "elevation"

                if not img_id or not p_id or not img_url:
                    stats["failed_images"] += 1
                    continue

                if p_id not in existing_property_ids:
                    # Skip image if associated property doesn't exist in DB
                    stats["skipped_images"] += 1
                    continue

                if p_id not in property_image_groups:
                    property_image_groups[p_id] = []
                property_image_groups[p_id].append({
                    "image_id": img_id,
                    "image_url": img_url,
                    "image_type": img_type,
                    "csv_display_order": self._parse_int(row.get("display_order")),
                })

            for p_id, img_list in property_image_groups.items():
                for idx, img_data in enumerate(img_list, start=1):
                    img_id = img_data["image_id"]

                    # Idempotency check: Skip duplicate image records by ID or Property+URL
                    if PropertyImage.objects.filter(image_id=img_id).exists() or PropertyImage.objects.filter(property_id=p_id, image_url=img_data["image_url"]).exists():
                        stats["skipped_images"] += 1
                        stats["duplicate_images"] += 1
                        continue

                    # Determine display_order & primary image
                    display_order = img_data["csv_display_order"] if img_data["csv_display_order"] is not None else idx
                    is_primary = True if idx == 1 else False

                    try:
                        PropertyImage.objects.create(
                            image_id=img_id,
                            property_id=p_id,
                            image_url=img_data["image_url"],
                            image_type=img_data["image_type"],
                            display_order=display_order,
                            is_primary=is_primary
                        )
                        stats["imported_images"] += 1
                    except Exception as e:
                        logger.error(f"Failed to create PropertyImage {img_id} for property {p_id}: {e}")
                        stats["failed_images"] += 1

        # ----------------------------------------------------
        # 3. FINAL IMPORT REPORT
        # ----------------------------------------------------
        self.stdout.write("\n" + "=" * 50)
        self.stdout.write(self.style.SUCCESS("  PROPERTY & IMAGE IMPORT REPORT"))
        self.stdout.write("=" * 50)
        self.stdout.write(f"  Imported Properties : {stats['imported_properties']}")
        self.stdout.write(f"  Skipped Properties  : {stats['skipped_properties']}")
        self.stdout.write(f"  Duplicate Properties: {stats['duplicate_properties']}")
        self.stdout.write(f"  Missing Localities  : {stats['missing_localities']}")
        self.stdout.write(f"  Missing Builders    : {stats['missing_builders']}")
        self.stdout.write(f"  Failed Properties   : {stats['failed_properties']}")
        self.stdout.write("-" * 50)
        self.stdout.write(f"  Imported Images     : {stats['imported_images']}")
        self.stdout.write(f"  Skipped Images      : {stats['skipped_images']}")
        self.stdout.write(f"  Duplicate Images    : {stats['duplicate_images']}")
        self.stdout.write(f"  Failed Images       : {stats['failed_images']}")
        self.stdout.write("=" * 50 + "\n")

    # ----------------------------------------------------
    # Helper Parsing Utilities
    # ----------------------------------------------------
    def _clean_str(self, val):
        if val is None:
            return None
        val_str = str(val).strip()
        if val_str == "" or val_str.upper() == "NULL" or val_str.upper() == "NONE":
            return None
        return val_str

    def _parse_decimal(self, val):
        cleaned = self._clean_str(val)
        if not cleaned:
            return Decimal("0.00")
        try:
            return Decimal(cleaned)
        except (InvalidOperation, ValueError):
            return Decimal("0.00")

    def _parse_int(self, val, default=None):
        cleaned = self._clean_str(val)
        if not cleaned:
            return default
        try:
            return int(float(cleaned))
        except (ValueError, TypeError):
            return default

    def _parse_date_val(self, val):
        cleaned = self._clean_str(val)
        if not cleaned:
            return None
        return parse_date(cleaned)

    def _parse_datetime_val(self, val):
        cleaned = self._clean_str(val)
        if not cleaned:
            return None
        dt = parse_datetime(cleaned)
        return dt

    def _parse_uuid(self, val):
        cleaned = self._clean_str(val)
        if not cleaned:
            return uuid.uuid4()
        try:
            return uuid.UUID(cleaned)
        except ValueError:
            return uuid.uuid5(uuid.NAMESPACE_DNS, cleaned)

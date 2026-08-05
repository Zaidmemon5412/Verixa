import os
import csv
import logging
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.properties.models import Property, Amenity, PropertyAmenity

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Import Amenity and PropertyAmenity records from properties_amenity.csv into PostgreSQL and Django Admin."

    def add_arguments(self, parser):
        parser.add_argument(
            "--csv",
            type=str,
            default="properties_amenity.csv",
            help="Path to properties_amenity.csv file",
        )

    def handle(self, *args, **options):
        csv_path = options["csv"]

        # Resolve CSV path across expected directories
        if not os.path.exists(csv_path):
            if os.path.exists(os.path.join("..", "properties_amenity.csv")):
                csv_path = os.path.join("..", "properties_amenity.csv")
            elif os.path.exists(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "..", "properties_amenity.csv")):
                csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "..", "properties_amenity.csv")

        if not os.path.exists(csv_path):
            self.stderr.write(self.style.ERROR(f"CSV file not found at: {csv_path}"))
            return

        self.stdout.write(self.style.NOTICE(f"Loading amenities from: {csv_path}"))

        stats = {
            "amenities_created": 0,
            "amenities_existing": 0,
            "property_amenities_created": 0,
            "property_amenities_skipped": 0,
            "missing_properties": 0,
        }

        # Cache existing Property and Amenity IDs for high performance
        existing_properties = {
            str(pid): pid for pid in Property.objects.values_list("property_id", flat=True)
        }
        
        amenities_cache = {}
        for a in Amenity.objects.all():
            amenities_cache[a.amenity_name] = a

        import uuid

        def _parse_uuid(val):
            if not val:
                return None
            try:
                return str(uuid.UUID(val))
            except ValueError:
                return str(uuid.uuid5(uuid.NAMESPACE_DNS, val))

        with open(csv_path, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            
            with transaction.atomic():
                for row_idx, row in enumerate(reader, start=2):
                    prop_id_raw = row.get("property_id", "").strip()
                    prop_id = _parse_uuid(prop_id_raw)
                    amenity_id = row.get("amenity_id", "").strip()
                    amenity_name = row.get("amenity_name", "").strip()

                    if not prop_id or not amenity_name:
                        continue

                    # 1. Get or create Amenity record
                    if amenity_name in amenities_cache:
                        amenity_obj = amenities_cache[amenity_name]
                        stats["amenities_existing"] += 1
                    else:
                        amenity_kwargs = {"amenity_name": amenity_name}
                        if amenity_id:
                            amenity_kwargs["amenity_id"] = amenity_id
                        
                        amenity_obj, created = Amenity.objects.get_or_create(
                            amenity_name=amenity_name,
                            defaults=amenity_kwargs
                        )
                        amenities_cache[amenity_name] = amenity_obj
                        if created:
                            stats["amenities_created"] += 1

                    # 2. Check if Property exists
                    if prop_id not in existing_properties:
                        stats["missing_properties"] += 1
                        continue

                    # 3. Create PropertyAmenity mapping record idempotently
                    prop_obj = Property.objects.get(property_id=prop_id)
                    _, pa_created = PropertyAmenity.objects.get_or_create(
                        property=prop_obj,
                        amenity=amenity_obj
                    )

                    if pa_created:
                        stats["property_amenities_created"] += 1
                    else:
                        stats["property_amenities_skipped"] += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSuccessfully imported property amenities into PostgreSQL:\n"
                f" - Unique Amenities Created: {stats['amenities_created']}\n"
                f" - Property Amenity Mappings Created: {stats['property_amenities_created']}\n"
                f" - Duplicate Mappings Skipped: {stats['property_amenities_skipped']}\n"
                f" - Missing Properties: {stats['missing_properties']}\n"
            )
        )

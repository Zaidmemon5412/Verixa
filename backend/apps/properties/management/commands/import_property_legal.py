import os
import csv
import logging
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.dateparse import parse_datetime
from apps.properties.models import Property, PropertyLegal

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Import PropertyLegal records from properties_propertylegal.csv into PostgreSQL and Django Admin."

    def add_arguments(self, parser):
        parser.add_argument(
            "--csv",
            type=str,
            default="properties_propertylegal.csv",
            help="Path to properties_propertylegal.csv file",
        )

    def handle(self, *args, **options):
        csv_path = options["csv"]

        if not os.path.exists(csv_path):
            if os.path.exists(os.path.join("..", "properties_propertylegal.csv")):
                csv_path = os.path.join("..", "properties_propertylegal.csv")
            elif os.path.exists(r"d:\Verixa\properties_propertylegal.csv"):
                csv_path = r"d:\Verixa\properties_propertylegal.csv"

        if not os.path.exists(csv_path):
            self.stderr.write(self.style.ERROR(f"CSV file not found at: {csv_path}"))
            return

        self.stdout.write(self.style.NOTICE(f"Loading PropertyLegal data from: {csv_path}"))

        stats = {
            "legal_created": 0,
            "legal_updated": 0,
            "missing_properties": 0,
        }

        existing_properties = {
            str(pid): pid for pid in Property.objects.values_list("property_id", flat=True)
        }

        with open(csv_path, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)

            with transaction.atomic():
                for row_idx, row in enumerate(reader, start=2):
                    prop_id = row.get("property_id", "").strip()
                    legal_id = row.get("legal_id", "").strip()

                    if not prop_id or prop_id not in existing_properties:
                        stats["missing_properties"] += 1
                        continue

                    survey_number = row.get("survey_number", "").strip() or None
                    khata_number = row.get("khata_number", "").strip() or None
                    na_converted = str(row.get("na_converted", "")).strip().upper() == "TRUE"
                    verification_status = row.get("verification_status", "").strip().upper() or "PENDING"
                    remarks = row.get("remarks", "").strip() or None

                    verified_at_raw = row.get("verified_at", "").strip()
                    verified_at = parse_datetime(verified_at_raw) if verified_at_raw else None

                    created_at_raw = row.get("created_at", "").strip()
                    created_at = parse_datetime(created_at_raw) if created_at_raw else None

                    updated_at_raw = row.get("updated_at", "").strip()
                    updated_at = parse_datetime(updated_at_raw) if updated_at_raw else None

                    prop_obj = Property.objects.get(property_id=prop_id)

                    defaults = {
                        "survey_number": survey_number,
                        "khata_number": khata_number,
                        "na_converted": na_converted,
                        "verification_status": verification_status,
                        "remarks": remarks,
                        "verified_at": verified_at,
                    }
                    if legal_id:
                        defaults["legal_id"] = legal_id
                    if created_at:
                        defaults["created_at"] = created_at
                    if updated_at:
                        defaults["updated_at"] = updated_at

                    _, created = PropertyLegal.objects.update_or_create(
                        property=prop_obj,
                        defaults=defaults
                    )

                    if created:
                        stats["legal_created"] += 1
                    else:
                        stats["legal_updated"] += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSuccessfully imported PropertyLegal records into PostgreSQL:\n"
                f" - Legal Records Created: {stats['legal_created']}\n"
                f" - Legal Records Updated: {stats['legal_updated']}\n"
                f" - Missing Properties Skipped: {stats['missing_properties']}\n"
            )
        )

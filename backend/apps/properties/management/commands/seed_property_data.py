import os
import csv
import uuid
import logging
from decimal import Decimal
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.locations.models import Locality
from apps.builders.models import Builder
from apps.properties.models import Property, PropertyImage

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Seed Locality, Property, and PropertyImage models from CSV datasets into PostgreSQL'

    def add_arguments(self, parser):
        parser.add_argument(
            '--properties-csv',
            type=str,
            default=r'd:\College\CSE\SEM IV\CSVS\combined_property_data.csv',
            help='Path to combined_property_data.csv'
        )
        parser.add_argument(
            '--images-csv',
            type=str,
            default=r'd:\College\CSE\SEM IV\CSVS\combined_property_images.csv',
            help='Path to combined_property_images.csv'
        )

    def handle(self, *args, **options):
        properties_csv = options['properties_csv']
        images_csv = options['images_csv']

        if not os.path.exists(properties_csv):
            raise CommandError(f"Properties CSV file not found: {properties_csv}")
        if not os.path.exists(images_csv):
            raise CommandError(f"Images CSV file not found: {images_csv}")

        self.stdout.write(self.style.WARNING("=================================================="))
        self.stdout.write(self.style.WARNING(" Starting Property Data Seeding to PostgreSQL"))
        self.stdout.write(self.style.WARNING(f" Properties CSV: {properties_csv}"))
        self.stdout.write(self.style.WARNING(f" Images CSV:     {images_csv}"))
        self.stdout.write(self.style.WARNING("=================================================="))

        # STEP 1: Create Default Locality
        default_locality, _ = Locality.objects.get_or_create(
            name="Chandkheda",
            city="Ahmedabad",
            state="Gujarat",
            defaults={
                'pincode': '382424',
                'latitude': Decimal('23.114818'),
                'longitude': Decimal('72.565680'),
                'description': 'Chandkheda residential locality, Ahmedabad'
            }
        )
        self.stdout.write(self.style.SUCCESS(f"Default Locality: {default_locality.name} ({default_locality.locality_id})"))

        # STEP 2: Read & Insert Properties
        imported_props = 0
        prop_id_map = {}

        with open(properties_csv, mode='r', encoding='utf-8') as f:
            reader = list(csv.DictReader(f))
            self.stdout.write(self.style.SUCCESS(f"Found {len(reader)} property rows in CSV."))

            with transaction.atomic():
                for row in reader:
                    raw_id = row.get('property_id', '').strip()
                    name = row.get('property_name', '').strip() or "Unnamed Property"
                    
                    def safe_decimal(val, default='0.0'):
                        try:
                            v = str(val).strip()
                            if not v or v.lower() in ['nan', 'none', 'unspecified']:
                                return Decimal(default)
                            return Decimal(v)
                        except Exception:
                            return Decimal(default)

                    def safe_int(val, default=0):
                        try:
                            v = str(val).strip()
                            if not v or v.lower() in ['nan', 'none', 'unspecified']:
                                return default
                            return int(float(v))
                        except Exception:
                            return default

                    price = safe_decimal(row.get('price'), '3000000.0')
                    price_sqft = safe_decimal(row.get('price_per_sqft'), '3000.0')
                    carpet = safe_decimal(row.get('carpet_area'), '700.0')
                    builtup = safe_decimal(row.get('builtup_area'), '900.0')
                    super_builtup = safe_decimal(row.get('super_builtup_area'), '1100.0')
                    land = safe_decimal(row.get('land_area'), '0.0')
                    
                    bhk = safe_int(row.get('bhk'), 1)
                    bathrooms = safe_int(row.get('bathrooms'), 1)
                    balconies = safe_int(row.get('balconies'), 0)
                    parking = safe_int(row.get('parking_spaces'), 1)
                    floor_num = safe_int(row.get('floor_number'), 1)
                    total_floors = safe_int(row.get('total_floors'), 5)
                    year = safe_int(row.get('construction_year'), 2020)

                    lat = safe_decimal(row.get('latitude'), '23.114818')
                    lng = safe_decimal(row.get('longitude'), '72.565680')

                    prop_type_raw = (row.get('property_type') or 'apartment').lower()
                    prop_type = 'apartment' if 'apart' in prop_type_raw else ('villa' if 'villa' in prop_type_raw else 'apartment')

                    trans_type_raw = (row.get('transaction_type') or 'resale').lower()
                    trans_type = 'new' if 'new' in trans_type_raw else 'resale'

                    status_raw = (row.get('status') or 'ready').lower()
                    status = 'ready' if 'ready' in status_raw else 'under_construction'

                    furnish_raw = (row.get('furnishing_status') or 'SEMIFURNISHED').upper()
                    furnish = 'SEMIFURNISHED' if 'SEMI' in furnish_raw else ('FULLYFURNISHED' if 'FULL' in furnish_raw else 'UNFURNISHED')

                    facing_raw = (row.get('facing') or 'NORTH').upper().replace(' ', '_').replace('-', '_')
                    valid_facings = ['NORTH', 'SOUTH', 'EAST', 'WEST', 'NORTH_EAST', 'NORTH_WEST', 'SOUTH_EAST', 'SOUTH_WEST']
                    facing = facing_raw if facing_raw in valid_facings else 'NORTH'

                    address = row.get('address') or f"{name}, Chandkheda, Ahmedabad"
                    desc = row.get('description') or f"{bhk} BHK property in {name}"
                    rera = row.get('rera_number') or None

                    prop_obj, created = Property.objects.get_or_create(
                        property_name=name,
                        address=address,
                        defaults={
                            'locality': default_locality,
                            'property_type': prop_type,
                            'transaction_type': trans_type,
                            'price': price,
                            'price_per_sqft': price_sqft,
                            'bhk': bhk,
                            'carpet_area': carpet,
                            'builtup_area': builtup,
                            'super_builtup_area': super_builtup,
                            'land_area': land,
                            'bathrooms': bathrooms,
                            'balconies': balconies,
                            'parking_spaces': parking,
                            'floor_number': floor_num,
                            'total_floors': total_floors,
                            'furnishing_status': furnish,
                            'facing': facing,
                            'construction_age': max(0, 2026 - year) if year > 1900 else 5,
                            'latitude': lat,
                            'longitude': lng,
                            'status': status,
                            'description': desc,
                            'rera_number': rera
                        }
                    )
                    prop_id_map[raw_id] = prop_obj
                    imported_props += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully processed {imported_props} Property records into PostgreSQL."))

        # STEP 3: Read & Insert Property Images
        imported_imgs = 0
        if os.path.exists(images_csv):
            with open(images_csv, mode='r', encoding='utf-8') as f:
                reader = list(csv.DictReader(f))
                self.stdout.write(self.style.SUCCESS(f"Found {len(reader)} property image rows in CSV."))

                with transaction.atomic():
                    for row in reader:
                        raw_prop_id = row.get('property_id', '').strip()
                        img_url = row.get('image_url', '').strip()
                        if not img_url:
                            continue

                        prop_obj = prop_id_map.get(raw_prop_id)
                        if not prop_obj:
                            prop_obj = Property.objects.first()

                        if not prop_obj:
                            continue

                        is_primary = str(row.get('is_primary', 'False')).lower() in ['true', '1', 'yes']
                        order = safe_int(row.get('display_order'), 1)
                        img_type = (row.get('image_type') or 'exterior').lower()
                        if img_type not in ['elevation', 'floor_plan', 'interior', 'exterior', 'other']:
                            img_type = 'exterior'

                        PropertyImage.objects.get_or_create(
                            property=prop_obj,
                            image_url=img_url,
                            defaults={
                                'image_type': img_type,
                                'display_order': order,
                                'is_primary': is_primary
                            }
                        )
                        imported_imgs += 1

            self.stdout.write(self.style.SUCCESS(f"Successfully processed {imported_imgs} PropertyImage records into PostgreSQL."))

        self.stdout.write(self.style.SUCCESS("=================================================="))
        self.stdout.write(self.style.SUCCESS("           PROPERTY DATA SEEDING COMPLETE         "))
        self.stdout.write(self.style.SUCCESS("=================================================="))

"""
==============================================================================
VERIXA POSTGRESQL CSV DATA IMPORT SERVICE
==============================================================================
Imports master combined property dataset (576 properties) and property images
(2,141 images) directly into PostgreSQL verixa_db database using Django ORM.
"""

import os
import sys
import uuid
import re
import pandas as pd
import numpy as np
import django

# Set up Django environment
sys.stdout.reconfigure(encoding='utf-8')
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)
os.environ['DJANGO_SETTINGS_MODULE'] = 'verixa_core.settings.base'
django.setup()

from apps.locations.models import Locality
from apps.builders.models import Builder
from apps.properties.models import Property, PropertyImage, FurnishingStatus, FacingDirection

# File paths
CSV_DIR = os.path.join(os.path.dirname(BACKEND_DIR), "ml", "CSV")
PROP_CSV_PATH = os.path.join(CSV_DIR, "combined_property_data.csv")
IMG_CSV_PATH = os.path.join(CSV_DIR, "combined_property_images.csv")

def map_furnishing(val):
    if pd.isna(val) or not str(val).strip():
        return FurnishingStatus.UNFURNISHED
    s = str(val).lower()
    if 'fully' in s or 'furnished' in s and 'semi' not in s and 'un' not in s:
        return FurnishingStatus.FULLY_FURNISHED
    elif 'semi' in s:
        return FurnishingStatus.SEMI_FURNISHED
    else:
        return FurnishingStatus.UNFURNISHED

def map_facing(val):
    if pd.isna(val) or not str(val).strip():
        return None
    s = str(val).upper().replace(' ', '_').replace('-', '_')
    valid_facings = [choice[0] for choice in FacingDirection.choices]
    if s in valid_facings:
        return s
    # Map common variations
    if 'NORTH_EAST' in s: return FacingDirection.NORTH_EAST
    if 'NORTH_WEST' in s: return FacingDirection.NORTH_WEST
    if 'SOUTH_EAST' in s: return FacingDirection.SOUTH_EAST
    if 'SOUTH_WEST' in s: return FacingDirection.SOUTH_WEST
    if 'NORTH' in s: return FacingDirection.NORTH
    if 'SOUTH' in s: return FacingDirection.SOUTH
    if 'EAST' in s: return FacingDirection.EAST
    if 'WEST' in s: return FacingDirection.WEST
    return None

def map_status(val):
    if pd.isna(val) or not str(val).strip():
        return 'ready'
    s = str(val).lower()
    if 'under' in s or 'construction' in s:
        return 'under_construction'
    return 'ready'

def map_property_type(val):
    if pd.isna(val) or not str(val).strip():
        return 'apartment'
    s = str(val).lower()
    if 'villa' in s: return 'villa'
    if 'penthouse' in s: return 'penthouse'
    if 'plot' in s: return 'plot'
    if 'commercial' in s: return 'commercial'
    return 'apartment'

def string_to_uuid(string_val):
    """Deterministically convert any string ID (e.g. 'Y81239177' or '581492917') into a valid UUID string."""
    return uuid.uuid5(uuid.NAMESPACE_DNS, str(string_val).strip())

def import_all_csvs():
    print("==============================================================================")
    print(" VERIXA POSTGRESQL CSV DATA IMPORTER")
    print("==============================================================================\n")

    if not os.path.exists(PROP_CSV_PATH) or not os.path.exists(IMG_CSV_PATH):
        raise FileNotFoundError("Master CSV files not found in ml/CSV!")

    df_prop = pd.read_csv(PROP_CSV_PATH)
    df_img = pd.read_csv(IMG_CSV_PATH)

    print(f"Loaded Properties CSV: {len(df_prop)} rows")
    print(f"Loaded Images CSV:     {len(df_img)} rows\n")

    # 1. Create or get default Locality in database
    default_locality, _ = Locality.objects.get_or_create(
        name="Ahmedabad Central",
        defaults={
            "city": "Ahmedabad",
            "state": "Gujarat",
            "pincode": "380001",
            "latitude": 23.022500,
            "longitude": 72.571400
        }
    )

    # Cache for created localities by area name
    locality_cache = {}
    
    def get_locality_for_address(addr):
        addr_str = str(addr)
        for area in ["Chandkheda", "Sindhu Bhavan", "Sola", "Thaltej", "Gota", "Satellite"]:
            if area.lower() in addr_str.lower():
                if area not in locality_cache:
                    loc, _ = Locality.objects.get_or_create(
                        name=f"{area}, Ahmedabad",
                        defaults={
                            "city": "Ahmedabad",
                            "state": "Gujarat",
                            "pincode": "380015",
                            "latitude": 23.030000,
                            "longitude": 72.520000
                        }
                    )
                    locality_cache[area] = loc
                return locality_cache[area]
        return default_locality

    # Flush old records so DB matches CSV count 1-to-1
    PropertyImage.objects.all().delete()
    Property.objects.all().delete()

    # 2. Import Properties into PostgreSQL
    print("Importing Properties into PostgreSQL database 'verixa_db'...")
    created_props = 0
    updated_props = 0
    property_uuid_map = {} # maps raw_id -> Property instance

    for idx, row in df_prop.iterrows():
        raw_id = str(row['property_id']).strip()
        prop_uuid = string_to_uuid(f"{raw_id}_{idx}")

        loc = get_locality_for_address(row.get('address', ''))

        prop_data = {
            'locality': loc,
            'rera_number': None if pd.isna(row.get('rera_number')) or str(row.get('rera_number')).lower() in ['not registered', 'nan', 'null'] else str(row.get('rera_number')),
            'property_name': str(row.get('property_name', 'Property Listing')),
            'property_type': map_property_type(row.get('property_type')),
            'transaction_type': 'resale' if str(row.get('transaction_type')).lower() == 'resale' else 'new',
            'price': float(row['price']) if pd.notna(row.get('price')) else 5000000.0,
            'price_per_sqft': float(row['price_per_sqft']) if pd.notna(row.get('price_per_sqft')) else 5000.0,
            'bhk': int(row['bhk']) if pd.notna(row.get('bhk')) else 2,
            'carpet_area': float(row['carpet_area']) if pd.notna(row.get('carpet_area')) else 1000.0,
            'builtup_area': float(row['builtup_area']) if pd.notna(row.get('builtup_area')) and float(row['builtup_area']) > 0 else None,
            'super_builtup_area': float(row['super_builtup_area']) if pd.notna(row.get('super_builtup_area')) and float(row['super_builtup_area']) > 0 else None,
            'bathrooms': int(row['bathrooms']) if pd.notna(row.get('bathrooms')) else 2,
            'balconies': int(row['balconies']) if pd.notna(row.get('balconies')) else 1,
            'parking_spaces': 1,
            'floor_number': int(row['floor_number']) if pd.notna(row.get('floor_number')) else 1,
            'total_floors': int(row['total_floors']) if pd.notna(row.get('total_floors')) else 5,
            'furnishing_status': map_furnishing(row.get('furnishing_status')),
            'facing': map_facing(row.get('facing')),
            'construction_age': max(0, 2026 - int(row['construction_year'])) if pd.notna(row.get('construction_year')) else 5,
            'address': str(row.get('address', 'Ahmedabad')),
            'latitude': float(row['latitude']) if pd.notna(row.get('latitude')) else 23.030000,
            'longitude': float(row['longitude']) if pd.notna(row.get('longitude')) else 72.520000,
            'status': map_status(row.get('status')),
            'description': str(row.get('description', ''))
        }

        prop_obj, created = Property.objects.update_or_create(
            property_id=prop_uuid,
            defaults=prop_data
        )

        property_uuid_map[raw_id] = prop_obj

        if created:
            created_props += 1
        else:
            updated_props += 1

    print(f"✅ Properties import complete: {created_props} Created, {updated_props} Updated (Total: {Property.objects.count()})\n")

    # 3. Import Property Images into PostgreSQL
    print("Importing Property Images into PostgreSQL database 'verixa_db'...")
    created_imgs = 0
    updated_imgs = 0

    for idx, row in df_img.iterrows():
        raw_img_id = str(row['image_id']).strip()
        raw_prop_id = str(row['property_id']).strip()

        img_uuid = string_to_uuid(f"{raw_img_id}_{idx}")

        # Check if parent property exists in DB
        prop_obj = property_uuid_map.get(raw_prop_id)
        if not prop_obj:
            prop_uuid = string_to_uuid(raw_prop_id)
            prop_obj = Property.objects.filter(property_id=prop_uuid).first()

        if not prop_obj:
            continue

        img_data = {
            'property': prop_obj,
            'image_url': str(row['image_url']).strip(),
            'image_type': 'interior' if str(row.get('image_type')).lower() == 'property' else 'elevation',
            'display_order': int(row['display_order']) if pd.notna(row.get('display_order')) else 1,
            'is_primary': bool(row.get('is_primary', False))
        }

        img_obj, created = PropertyImage.objects.update_or_create(
            image_id=img_uuid,
            defaults=img_data
        )

        if created:
            created_imgs += 1
        else:
            updated_imgs += 1

    print(f"✅ Property Images import complete: {created_imgs} Created, {updated_imgs} Updated (Total: {PropertyImage.objects.count()})\n")

    print("==============================================================================")
    print(" DATABASE IMPORT SUMMARY (PostgreSQL verixa_db)")
    print("==============================================================================")
    print(f"  • Total Properties in DB:      {Property.objects.count()}")
    print(f"  • Total Property Images in DB: {PropertyImage.objects.count()}")
    print(f"  • Total Localities in DB:      {Locality.objects.count()}")
    print("==============================================================================")

if __name__ == '__main__':
    import_all_csvs()

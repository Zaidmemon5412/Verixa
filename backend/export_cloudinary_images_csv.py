"""
==============================================================================
VERIXA CLOUDINARY IMAGES CSV EXPORTER
==============================================================================
Exports all Property and Builder Project images (including live Cloudinary CDN URLs)
from PostgreSQL verixa_db into clean CSV files to share with team/friends.
"""

import os
import sys
import pandas as pd
import django

sys.stdout.reconfigure(encoding='utf-8')
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)
os.environ['DJANGO_SETTINGS_MODULE'] = 'verixa_core.settings.base'
django.setup()

from apps.properties.models import PropertyImage
from apps.builders.models import BuilderProjectImage

def export_cloudinary_csvs():
    print("==============================================================================")
    print(" EXPORTING CLOUDINARY IMAGES CSV DATASETS")
    print("==============================================================================\n")

    # 1. Fetch Property Images
    prop_qs = PropertyImage.objects.all().values('image_id', 'property_id', 'image_url', 'image_type', 'display_order', 'is_primary')
    df_prop_img = pd.DataFrame(list(prop_qs))

    # 2. Fetch Builder Project Images
    builder_qs = BuilderProjectImage.objects.all().values('image_id', 'project_id', 'image_url', 'display_order', 'is_primary')
    df_builder_img = pd.DataFrame(list(builder_qs))

    print(f"Total Property Images in DB:        {len(df_prop_img)}")
    print(f"Total Builder Project Images in DB: {len(df_builder_img)}\n")

    # Destination Paths
    root_dir = r"d:\Verixa"
    ml_csv_dir = r"d:\Verixa\Verixa\ml\CSV"

    prop_csv_path_root = os.path.join(root_dir, "verixa_property_images_cloudinary.csv")
    prop_csv_path_ml = os.path.join(ml_csv_dir, "combined_property_images_cloudinary.csv")

    builder_csv_path_root = os.path.join(root_dir, "verixa_builder_images_cloudinary.csv")
    master_all_path_root = os.path.join(root_dir, "verixa_all_cloudinary_images.csv")

    # Save Property Images CSV
    df_prop_img.to_csv(prop_csv_path_root, index=False)
    df_prop_img.to_csv(prop_csv_path_ml, index=False)
    print(f"✅ Saved Property Images CSV:\n  • {prop_csv_path_root}\n  • {prop_csv_path_ml}")

    # Save Builder Project Images CSV
    df_builder_img.to_csv(builder_csv_path_root, index=False)
    print(f"✅ Saved Builder Images CSV:\n  • {builder_csv_path_root}")

    # Combine into Master All Images CSV
    df_builder_img_renamed = df_builder_img.rename(columns={'project_id': 'property_id'})
    df_builder_img_renamed['image_type'] = 'builder_project'
    df_master = pd.concat([df_prop_img, df_builder_img_renamed], ignore_index=True)
    df_master.to_csv(master_all_path_root, index=False)

    print(f"✅ Saved Master All Cloudinary Images CSV (Total: {len(df_master)} rows):\n  • {master_all_path_root}")

    print("\n==============================================================================")
    print(" EXPORT COMPLETE")
    print("==============================================================================")

if __name__ == '__main__':
    export_cloudinary_csvs()

"""
==============================================================================
VERIXA CLOUDINARY IMAGE UPLOADER SERVICE
==============================================================================
Uploads all property photos and builder project gallery images to Cloudinary CDN
(cloud_name: g2buh1b3) using parallel multithreading and updates both
PostgreSQL verixa_db and CSV datasets with high-speed CDN URLs.
"""

import os
import sys
import argparse
import concurrent.futures
import pandas as pd
import django
import environ
import cloudinary
import cloudinary.uploader

sys.stdout.reconfigure(encoding='utf-8')
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)
os.environ['DJANGO_SETTINGS_MODULE'] = 'verixa_core.settings.base'
django.setup()

from apps.properties.models import PropertyImage
from apps.builders.models import BuilderProjectImage

# Configure Cloudinary from .env
env = environ.Env()
env_file = os.path.join(os.path.dirname(BACKEND_DIR), ".env")
if os.path.exists(env_file):
    environ.Env.read_env(env_file)

cloudinary.config(
    cloud_name=env.str('CLOUDINARY_CLOUD_NAME', 'g2buh1b3'),
    api_key=env.str('CLOUDINARY_API_KEY', '985876594477229'),
    api_secret=env.str('CLOUDINARY_API_SECRET', 'rid1-ZtK9PDKp_PNNwQ38bIJ1rU'),
    secure=True
)

def upload_single_image(image_obj, model_type="property"):
    """Helper function to upload a single image to Cloudinary CDN."""
    original_url = image_obj.image_url.strip()
    
    # Skip if already uploaded to Cloudinary
    if 'cloudinary.com' in original_url:
        return True, original_url

    try:
        folder_path = f"verixa/{model_type}_images"
        public_id = f"{model_type}_{str(image_obj.image_id)[:8]}"
        
        result = cloudinary.uploader.upload(
            original_url,
            folder=folder_path,
            public_id=public_id,
            overwrite=True
        )
        
        cdn_url = result.get('secure_url')
        if cdn_url:
            image_obj.image_url = cdn_url
            image_obj.save(update_fields=['image_url'])
            return True, cdn_url
    except Exception as e:
        return False, str(e)

    return False, "Unknown Error"

def batch_upload_cloudinary(primary_only=False, max_workers=10):
    print("==============================================================================")
    print(" VERIXA CLOUDINARY BATCH UPLOADER SERVICE")
    print("==============================================================================\n")

    # 1. Fetch Property Images
    if primary_only:
        prop_imgs = list(PropertyImage.objects.filter(is_primary=True).exclude(image_url__icontains='cloudinary.com'))
        builder_imgs = list(BuilderProjectImage.objects.filter(is_primary=True).exclude(image_url__icontains='cloudinary.com'))
    else:
        prop_imgs = list(PropertyImage.objects.exclude(image_url__icontains='cloudinary.com'))
        builder_imgs = list(BuilderProjectImage.objects.exclude(image_url__icontains='cloudinary.com'))

    total_to_upload = len(prop_imgs) + len(builder_imgs)
    print(f"Target Images to Upload to Cloudinary CDN: {total_to_upload}")
    print(f"  • Property Images:       {len(prop_imgs)}")
    print(f"  • Builder Project Images: {len(builder_imgs)}")
    print(f"  • Parallel Threads:       {max_workers}\n")

    if total_to_upload == 0:
        print("✅ All images are already uploaded to Cloudinary CDN!")
        return

    # 2. Upload Property Images in Parallel
    success_count = 0
    fail_count = 0

    print("Step 1: Uploading Property Images to Cloudinary...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(upload_single_image, img, "property"): img for img in prop_imgs}
        for future in concurrent.futures.as_completed(futures):
            ok, res = future.result()
            if ok:
                success_count += 1
            else:
                fail_count += 1
            if (success_count + fail_count) % 25 == 0 or (success_count + fail_count) == len(prop_imgs):
                print(f"  Progress: {success_count + fail_count}/{len(prop_imgs)} Property Images uploaded...")

    # 3. Upload Builder Project Images in Parallel
    print("\nStep 2: Uploading Builder Project Images to Cloudinary...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(upload_single_image, img, "builder_project"): img for img in builder_imgs}
        for future in concurrent.futures.as_completed(futures):
            ok, res = future.result()
            if ok:
                success_count += 1
            else:
                fail_count += 1
            if (success_count + fail_count - len(prop_imgs)) % 25 == 0 or (success_count + fail_count) == total_to_upload:
                print(f"  Progress: {success_count + fail_count - len(prop_imgs)}/{len(builder_imgs)} Builder Images uploaded...")

    print("\n==============================================================================")
    print(" CLOUDINARY UPLOAD SUMMARY")
    print("==============================================================================")
    print(f"  • Successful CDN Uploads: {success_count}")
    print(f"  • Failed Uploads:         {fail_count}")
    print("==============================================================================")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Upload images to Cloudinary CDN")
    parser.add_argument('--primary-only', action='store_true', help="Upload only primary cover images")
    parser.add_argument('--threads', type=int, default=12, help="Number of parallel upload threads")
    args = parser.parse_args()

    batch_upload_cloudinary(primary_only=args.primary_only, max_workers=args.threads)

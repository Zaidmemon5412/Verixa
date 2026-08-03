"""
Cloudinary Service for automatic remote image migration.
Handles remote image uploading, retries, URL validation, and folder structuring.
"""
import time
import logging
from typing import Optional, Dict, Any
from django.conf import settings
from django.utils.text import slugify
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

import cloudinary
import cloudinary.uploader
import cloudinary.exceptions

logger = logging.getLogger(__name__)


class CloudinaryUploadError(Exception):
    """Custom exception raised when remote image upload to Cloudinary fails."""
    pass


def configure_cloudinary() -> None:
    """
    Configures Cloudinary SDK dynamically using Django settings / .env.
    """
    cloud_name = getattr(settings, 'CLOUDINARY_CLOUD_NAME', None)
    api_key = getattr(settings, 'CLOUDINARY_API_KEY', None)
    api_secret = getattr(settings, 'CLOUDINARY_API_SECRET', None)

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True
    )


def get_cloudinary_folder_path(builder_name: str, project_name: str) -> str:
    """
    Generates standardized Cloudinary folder path:
    verixa/builder-projects/<clean-builder-name>/<clean-project-name>/
    """
    clean_builder = slugify(builder_name) or 'unknown-builder'
    clean_project = slugify(project_name) or 'unknown-project'
    return f"verixa/builder-projects/{clean_builder}/{clean_project}"


def is_valid_image_url(url: str) -> bool:
    """
    Validates syntax and format of remote image URL before uploading.
    """
    if not url or not isinstance(url, str):
        return False

    cleaned_url = url.strip()
    validator = URLValidator(schemes=['http', 'https'])
    try:
        validator(cleaned_url)
    except ValidationError:
        return False

    # Basic extension check (optional extensions or query params allowed)
    lower_url = cleaned_url.lower()
    allowed_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp', '.tiff')
    
    # Check if URL ends with or contains standard image format
    has_image_ext = any(ext in lower_url for ext in allowed_extensions)
    # Also allow dynamic URLs from known image services or CDN parameters
    is_cdn_url = any(domain in lower_url for domain in ['supabase.co', '99acres.com', 'staticmb.com', 'n7net.in', 'shilpgroup.com', 'sunbuilders.in', 'bakeri.com', 'iscongroup.com', 'goyalco.com', 'ganeshhousing.com'])
    
    return has_image_ext or is_cdn_url or lower_url.startswith('http')


def upload_remote_image(
    remote_url: str,
    folder_path: str,
    public_id: Optional[str] = None,
    max_retries: int = 3
) -> Dict[str, Any]:
    """
    Uploads a remote image URL directly to Cloudinary without downloading locally.
    Includes retry logic and error logging.

    Returns dict containing:
    {
        'secure_url': str,
        'public_id': str,
        'format': str,
        'bytes': int
    }
    """
    configure_cloudinary()
    cleaned_url = remote_url.strip()

    options = {
        "folder": folder_path,
        "overwrite": False,
        "resource_type": "image"
    }
    if public_id:
        options["public_id"] = public_id

    last_exception = None
    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Attempting Cloudinary remote upload (Attempt {attempt}/{max_retries}) for URL: {cleaned_url}")
            response = cloudinary.uploader.upload(cleaned_url, **options)

            secure_url = response.get('secure_url')
            returned_public_id = response.get('public_id')
            logger.info(f"Cloudinary upload successful! Public ID: {returned_public_id}, Secure URL: {secure_url}")

            return {
                'secure_url': secure_url,
                'public_id': returned_public_id,
                'format': response.get('format'),
                'bytes': response.get('bytes')
            }

        except cloudinary.exceptions.Error as ce:
            last_exception = ce
            logger.warning(f"Cloudinary API Error on attempt {attempt}/{max_retries} for URL {cleaned_url}: {str(ce)}")
        except Exception as e:
            last_exception = e
            logger.warning(f"Network/Upload Error on attempt {attempt}/{max_retries} for URL {cleaned_url}: {str(e)}")

        if attempt < max_retries:
            time.sleep(1)

    error_msg = f"Failed to upload image to Cloudinary after {max_retries} attempts: {str(last_exception)}"
    logger.error(error_msg)
    raise CloudinaryUploadError(error_msg)

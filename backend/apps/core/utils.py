import os
import uuid
from django.utils.text import slugify


def upload_to_uuid_folder(instance, filename):
    """
    Generates a unique file path for uploads to prevent filename conflicts.
    Uploads are organized under: media/uploads/<model_name>/<uuid>.<extension>
    """
    ext = filename.split('.')[-1]
    new_filename = f"{uuid.uuid4()}.{ext}"
    class_name = instance.__class__.__name__.lower()
    return os.path.join(f"uploads/{class_name}/", new_filename)


def generate_unique_slug(model_class, text_field_value, slug_field_name='slug'):
    """
    Utility to auto-generate unique slugs for locations or property records.
    """
    slug_candidate = slugify(text_field_value)
    unique_slug = slug_candidate
    counter = 1

    # Loop to check and append index counters if slug exists
    while model_class.objects.filter(**{slug_field_name: unique_slug}).exists():
        unique_slug = f"{slug_candidate}-{counter}"
        counter += 1

    return unique_slug

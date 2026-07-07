import os
import mimetypes
from django.core.exceptions import ValidationError

def validate_image_file(file):
    """
    Validates uploaded images.
    Restrictions: JPEG, PNG, WEBP. Max size 5MB.
    """
    max_size = 5 * 1024 * 1024  # 5MB
    if file.size > max_size:
        raise ValidationError(f"File size exceeds 5MB limit. (Current size: {file.size / (1024 * 1024):.2f}MB)")
    
    ext = os.path.splitext(file.name)[1].lower()
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    if ext not in valid_extensions:
        raise ValidationError(f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(valid_extensions)}")

    # Check MIME type if available
    content_type = getattr(file, 'content_type', '')
    if content_type:
        valid_mime_types = ['image/jpeg', 'image/png', 'image/webp']
        if content_type not in valid_mime_types:
            raise ValidationError(f"Unsupported file MIME type '{content_type}'. Allowed MIME types: {', '.join(valid_mime_types)}")


def validate_document_file(file):
    """
    Validates uploaded documents.
    Restrictions: PDF, DOCX, PNG, JPEG. Max size 10MB.
    """
    max_size = 10 * 1024 * 1024  # 10MB
    if file.size > max_size:
        raise ValidationError(f"File size exceeds 10MB limit. (Current size: {file.size / (1024 * 1024):.2f}MB)")
    
    ext = os.path.splitext(file.name)[1].lower()
    valid_extensions = ['.pdf', '.docx', '.png', '.jpeg', '.jpg']
    if ext not in valid_extensions:
        raise ValidationError(f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(valid_extensions)}")

    # Check MIME type if available
    content_type = getattr(file, 'content_type', '')
    if content_type:
        valid_mime_types = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'image/png',
            'image/jpeg',
            'image/jpg'
        ]
        if content_type not in valid_mime_types:
            raise ValidationError(f"Unsupported file MIME type '{content_type}'. Allowed MIME types: {', '.join(valid_mime_types)}")

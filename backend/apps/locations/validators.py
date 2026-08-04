"""
Validators for the locations app.
Defines reusable field validation functions for locality name, city, state, pincode,
latitude, longitude, place name, place type, distance, and travel time.
"""
import re
from decimal import Decimal, InvalidOperation
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_locality_name(value: str) -> str:
    """
    Validates locality name:
    - Must be a valid string.
    - Trim extra leading, trailing, and intermediate spaces.
    - Minimum 3 characters.
    - Maximum 255 characters.
    - Standard characters only (letters, numbers, spaces, & - . , ' / ( ))
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("Locality name must be a valid string."), code='invalid_type')
        
    cleaned_name = " ".join(value.split())
    
    if len(cleaned_name) < 3:
        raise ValidationError(
            _("Locality name must be at least 3 characters long."),
            code='locality_name_too_short'
        )
        
    if len(cleaned_name) > 255:
        raise ValidationError(
            _("Locality name must be at most 255 characters long."),
            code='locality_name_too_long'
        )
        
    if not re.match(r'^[a-zA-Z0-9\s&\-.,\'/()]+$', cleaned_name):
        raise ValidationError(
            _("Locality name contains invalid characters."),
            code='locality_name_invalid_characters'
        )
        
    return cleaned_name


def validate_city(value: str) -> str:
    """
    Validates city name:
    - Must be a valid string.
    - Trim extra leading, trailing, and intermediate spaces.
    - Minimum 2 characters.
    - Maximum 100 characters.
    - Standard characters only (letters, spaces, & - . , ' / ( ))
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("City must be a valid string."), code='invalid_type')
        
    cleaned_city = " ".join(value.split())
    
    if len(cleaned_city) < 2:
        raise ValidationError(
            _("City name must be at least 2 characters long."),
            code='city_too_short'
        )
        
    if len(cleaned_city) > 100:
        raise ValidationError(
            _("City name must be at most 100 characters long."),
            code='city_too_long'
        )
        
    if not re.match(r'^[a-zA-Z\s&\-.,\'/()]+$', cleaned_city):
        raise ValidationError(
            _("City name contains invalid characters."),
            code='city_invalid_characters'
        )
        
    return cleaned_city


def validate_state(value: str) -> str:
    """
    Validates state name:
    - Must be a valid string.
    - Trim extra leading, trailing, and intermediate spaces.
    - Minimum 2 characters.
    - Maximum 100 characters.
    - Standard characters only (letters, spaces, & - . , ' / ( ))
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("State must be a valid string."), code='invalid_type')
        
    cleaned_state = " ".join(value.split())
    
    if len(cleaned_state) < 2:
        raise ValidationError(
            _("State name must be at least 2 characters long."),
            code='state_too_short'
        )
        
    if len(cleaned_state) > 100:
        raise ValidationError(
            _("State name must be at most 100 characters long."),
            code='state_too_long'
        )
        
    if not re.match(r'^[a-zA-Z\s&\-.,\'/()]+$', cleaned_state):
        raise ValidationError(
            _("State name contains invalid characters."),
            code='state_invalid_characters'
        )
        
    return cleaned_state


def validate_pincode(value: str) -> str:
    """
    Validates pin code formatting:
    - Must be a valid string or numeric representation.
    - Must be exactly 6 digits.
    - Must be a valid Indian PIN code (cannot start with 0).
    """
    if not value:
        raise ValidationError(_("Pincode cannot be empty."), code='empty_pincode')
        
    cleaned_pincode = str(value).strip()
    
    if not re.match(r'^[1-9]\d{5}$', cleaned_pincode):
        raise ValidationError(
            _("Pincode must be a valid 6-digit Indian PIN code not starting with 0."),
            code='invalid_pincode'
        )
        
    return cleaned_pincode


def validate_latitude(value) -> Decimal:
    """
    Validates latitude:
    - Must be between -90 and 90.
    """
    if value is None:
        raise ValidationError(_("Latitude cannot be null."), code='null_latitude')
        
    try:
        lat = Decimal(str(value))
    except (ValueError, TypeError, InvalidOperation):
        raise ValidationError(_("Latitude must be a valid decimal number."), code='invalid_latitude_type')
        
    if lat < Decimal('-90') or lat > Decimal('90'):
        raise ValidationError(
            _("Latitude must be between -90 and 90 degrees."),
            code='latitude_out_of_range'
        )
        
    return lat


def validate_longitude(value) -> Decimal:
    """
    Validates longitude:
    - Must be between -180 and 180.
    """
    if value is None:
        raise ValidationError(_("Longitude cannot be null."), code='null_longitude')
        
    try:
        lon = Decimal(str(value))
    except (ValueError, TypeError, InvalidOperation):
        raise ValidationError(_("Longitude must be a valid decimal number."), code='invalid_longitude_type')
        
    if lon < Decimal('-180') or lon > Decimal('180'):
        raise ValidationError(
            _("Longitude must be between -180 and 180 degrees."),
            code='longitude_out_of_range'
        )
        
    return lon


def validate_place_name(value: str) -> str:
    """
    Validates nearby place name:
    - Must be a valid string.
    - Trim extra leading, trailing, and intermediate spaces.
    - Minimum 3 characters.
    - Maximum 255 characters.
    - Standard characters only (letters, numbers, spaces, & - . , ' / ( ))
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("Place name must be a valid string."), code='invalid_type')
        
    cleaned_name = " ".join(value.split())
    
    if len(cleaned_name) < 3:
        raise ValidationError(
            _("Place name must be at least 3 characters long."),
            code='place_name_too_short'
        )
        
    if len(cleaned_name) > 255:
        raise ValidationError(
            _("Place name must be at most 255 characters long."),
            code='place_name_too_long'
        )
        
    if not re.match(r'^[a-zA-Z0-9\s&\-.,\'/()]+$', cleaned_name):
        raise ValidationError(
            _("Place name contains invalid characters."),
            code='place_name_invalid_characters'
        )
        
    return cleaned_name


def validate_place_type(value: str) -> str:
    """
    Validates place type:
    - Must be a valid string.
    - Trim extra leading, trailing, and intermediate spaces.
    - Minimum 2 characters.
    - Maximum 100 characters.
    - Standard characters only (letters, numbers, spaces, & - . , ' / ( ))
    """
    if not value or not isinstance(value, str):
        raise ValidationError(_("Place type must be a valid string."), code='invalid_type')
        
    cleaned_type = " ".join(value.split())
    
    if len(cleaned_type) < 2:
        raise ValidationError(
            _("Place type must be at least 2 characters long."),
            code='place_type_too_short'
        )
        
    if len(cleaned_type) > 100:
        raise ValidationError(
            _("Place type must be at most 100 characters long."),
            code='place_type_too_long'
        )
        
    if not re.match(r'^[a-zA-Z0-9\s&\-.,\'/()]+$', cleaned_type):
        raise ValidationError(
            _("Place type contains invalid characters."),
            code='place_type_invalid_characters'
        )
        
    return cleaned_type


def validate_distance(value) -> Decimal:
    """
    Validates distance:
    - Must be positive (greater than 0).
    """
    if value is None:
        raise ValidationError(_("Distance cannot be null."), code='null_distance')
        
    try:
        dist = Decimal(str(value))
    except (ValueError, TypeError, InvalidOperation):
        raise ValidationError(_("Distance must be a valid decimal number."), code='invalid_distance_type')
        
    if dist <= Decimal('0'):
        raise ValidationError(
            _("Distance must be a positive number greater than 0."),
            code='distance_not_positive'
        )
        
    return dist


def validate_travel_time(value) -> int:
    """
    Validates travel time:
    - Cannot be negative.
    - Must be an integer.
    """
    if value is None:
        raise ValidationError(_("Travel time cannot be null."), code='null_travel_time')
        
    try:
        if isinstance(value, float):
            raise ValueError
        t_time = int(value)
    except (ValueError, TypeError):
        raise ValidationError(_("Travel time must be a valid integer."), code='invalid_travel_time_type')
        
    if t_time < 0:
        raise ValidationError(
            _("Travel time cannot be negative."),
            code='travel_time_negative'
        )
        
    return t_time


def validate_distance_km(value) -> Decimal:
    """
    Validates distance_km:
    - Must be a non-negative decimal.
    """
    if value is None:
        return value
        
    try:
        dist = Decimal(str(value))
    except (ValueError, TypeError, InvalidOperation):
        raise ValidationError(_("Distance (km) must be a valid decimal number."), code='invalid_distance_km_type')
        
    if dist < Decimal('0'):
        raise ValidationError(
            _("Distance (km) cannot be negative."),
            code='distance_km_negative'
        )
        
    return dist


def validate_rating(value) -> Decimal:
    """
    Validates rating:
    - Must be between 0.0 and 5.0.
    """
    if value is None:
        return value

    try:
        r = Decimal(str(value))
    except (ValueError, TypeError, InvalidOperation):
        raise ValidationError(_("Rating must be a valid decimal number."), code='invalid_rating_type')

    if r < Decimal('0.0') or r > Decimal('5.0'):
        raise ValidationError(
            _("Rating must be between 0.0 and 5.0."),
            code='rating_out_of_range'
        )

    return r


def validate_address(value: str) -> str:
    """
    Validates address:
    - Must be a string if provided.
    - Trim whitespace.
    """
    if not value:
        return ""
    if not isinstance(value, str):
        raise ValidationError(_("Address must be a valid string."), code='invalid_address_type')
    return value.strip()


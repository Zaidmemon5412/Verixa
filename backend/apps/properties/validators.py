"""
Validators for the properties app.
Ensures data integrity before models hit the database.
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def validate_positive_number(value, field_name="Value"):
    if value is not None and value < 0:
        raise ValidationError(
            _(f"{field_name} must be a positive number."),
            code='invalid_positive'
        )

def validate_positive_nonzero(value, field_name="Value"):
    if value is not None and value <= 0:
        raise ValidationError(
            _(f"{field_name} must be strictly greater than zero."),
            code='invalid_nonzero'
        )

def validate_latitude(value):
    if value is not None and not (-90 <= value <= 90):
        raise ValidationError(
            _("Latitude must be between -90 and 90."),
            code='invalid_latitude'
        )

def validate_longitude(value):
    if value is not None and not (-180 <= value <= 180):
        raise ValidationError(
            _("Longitude must be between -180 and 180."),
            code='invalid_longitude'
        )

def validate_property_data(data):
    """
    Comprehensive validation for property data dictionary.
    """
    validate_positive_number(data.get('price'), "Price")
    validate_positive_number(data.get('price_per_sqft'), "Price Per SqFt")
    validate_positive_number(data.get('bhk'), "BHK")
    
    if data.get('carpet_area') is not None:
        validate_positive_nonzero(data.get('carpet_area'), "Carpet Area")
    
    if data.get('builtup_area') is not None:
        validate_positive_nonzero(data.get('builtup_area'), "Builtup Area")
        
    if data.get('land_area') is not None:
        validate_positive_number(data.get('land_area'), "Land Area")
        
    validate_latitude(data.get('latitude'))
    validate_longitude(data.get('longitude'))
    
    # Logic validation
    if (data.get('carpet_area') and data.get('builtup_area') and 
            data['builtup_area'] < data['carpet_area']):
        raise ValidationError(
            _("Builtup Area cannot be less than Carpet Area."),
            code='invalid_area_logic'
        )

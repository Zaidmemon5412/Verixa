from rest_framework import serializers
from .models import (
    Property,
    Amenity,
    PropertyAmenity,
    PropertyImage,
    PropertyDocument,
    PriceHistory,
    PropertyScore,
    PropertySource,
)

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['amenity_id', 'amenity_name']


class PropertyAmenitySerializer(serializers.ModelSerializer):
    amenity = AmenitySerializer(read_only=True)
    amenity_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = PropertyAmenity
        fields = ['property', 'amenity', 'amenity_id']
        read_only_fields = ['property']


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = [
            'image_id', 'image_url', 'image_type', 
            'display_order', 'is_primary'
        ]


class PropertyDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyDocument
        fields = [
            'document_id', 'document_name', 'document_type', 
            'document_url', 'ocr_status', 'verification_status', 'uploaded_at'
        ]
        read_only_fields = ['uploaded_at']


class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = ['history_id', 'price', 'recorded_date']


class PropertyScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyScore
        fields = [
            'score_id', 'predicted_price', 'fair_price_score',
            'builder_score', 'locality_score', 'connectivity_score',
            'investment_score', 'risk_score', 'confidence_score', 'updated_at'
        ]
        read_only_fields = ['updated_at']


class PropertySourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertySource
        fields = [
            'source_id', 'source_name', 'source_url', 
            'scraped_at', 'last_verified_at'
        ]


class PropertySerializer(serializers.ModelSerializer):
    """
    Main serializer for Property.
    Includes nested read-only representations for related objects,
    while accepting flat ID inputs for writes (builder, locality).
    """
    images = PropertyImageSerializer(many=True, read_only=True)
    documents = PropertyDocumentSerializer(many=True, read_only=True)
    price_histories = PriceHistorySerializer(many=True, read_only=True)
    score = PropertyScoreSerializer(read_only=True)
    sources = PropertySourceSerializer(many=True, read_only=True)
    
    # We serialize property_amenities to show amenity names but allow adding via related operations
    amenities = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'property_id', 'builder', 'locality', 'rera_number', 
            'property_name', 'property_type', 'transaction_type', 
            'price', 'price_per_sqft', 'bhk', 'carpet_area', 
            'builtup_area', 'land_area', 'address', 'latitude', 
            'longitude', 'status', 'launch_date', 'completion_date', 
            'description', 'created_at', 'updated_at',
            
            # Nested read-only relations
            'images', 'documents', 'price_histories', 'score', 
            'sources', 'amenities'
        ]
        read_only_fields = ['property_id', 'created_at', 'updated_at']

    def get_amenities(self, obj):
        # Return a list of amenity names for easy viewing
        return [pa.amenity.amenity_name for pa in obj.property_amenities.all()]

from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import (
    PropertyImage, PropertyDocument, Property, Amenity, PropertyAmenity,
    PropertyListing, PropertyLegal
)
from .validators import validate_amenity_name
from apps.accounts.models import User
from apps.builders.models import Builder

class PropertyImageSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='image_id', read_only=True)
    image = serializers.URLField(source='image_url', read_only=True)
    descriptions = serializers.CharField(
        source='image_type',
        required=False,
        allow_blank=True,
        allow_null=True
    )

    class Meta:
        model = PropertyImage
        fields = ['id', 'property', 'image', 'is_primary', 'display_order', 'descriptions']
        read_only_fields = ['id', 'property', 'image']

    def to_internal_value(self, data):
        # Allow singular 'description' or plural 'descriptions'
        description_val = data.get('description') or data.get('descriptions')
        if description_val:
            val = str(description_val).strip().lower()
            # Normalize to one of the valid model image_type choices
            if val in ['elevation', 'floor_plan', 'interior', 'exterior', 'other']:
                data['image_type'] = val
            else:
                # Default logic for generic text description
                if any(x in val for x in ['living', 'room', 'interior', 'inside', 'bedroom', 'kitchen']):
                    data['image_type'] = 'interior'
                elif any(x in val for x in ['floor', 'plan', 'layout']):
                    data['image_type'] = 'floor_plan'
                elif any(x in val for x in ['exterior', 'outside', 'facade', 'elevation']):
                    data['image_type'] = 'exterior'
                else:
                    data['image_type'] = 'other'
            
            # Map descriptions to image_type so serializers can save it properly
            data['descriptions'] = data['image_type']

        return super().to_internal_value(data)

    def validate(self, attrs):
        # Add validation to protect read-only fields during updates
        if self.instance:
            if 'property' in self.initial_data:
                raise serializers.ValidationError({"property": "The property field is read-only."})
            if 'image' in self.initial_data or 'image_url' in self.initial_data:
                raise serializers.ValidationError({"image": "The image field is read-only."})
            if 'id' in self.initial_data or 'image_id' in self.initial_data:
                raise serializers.ValidationError({"id": "The id field is read-only."})
        return attrs


class PropertyDocumentSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='document_id', read_only=True)
    file = serializers.URLField(source='document_url', read_only=True)
    metadata = serializers.SerializerMethodField()

    class Meta:
        model = PropertyDocument
        fields = ['id', 'property', 'file', 'document_type', 'ocr_status', 'verification_status', 'metadata']
        read_only_fields = ['id', 'property', 'file']

    def to_internal_value(self, data):
        # Enforce read-only rules for status flags on creation before other checks
        if not self.instance:
            errors = {}
            if 'ocr_status' in data:
                errors['ocr_status'] = "OCR status cannot be set on creation."
            if 'verification_status' in data:
                errors['verification_status'] = "Verification status cannot be set on creation."
            if errors:
                raise serializers.ValidationError(errors)

        # Map uppercase document types or variants to valid model choices
        if 'document_type' in data:
            doc_type = str(data['document_type']).strip().lower()
            if doc_type in ['title_deed', 'deed', 'sale_deed', 'sale deed / title deed']:
                data['document_type'] = 'deed'
            elif doc_type in ['layout_plan', 'approved_layout_plan', 'layout plan']:
                data['document_type'] = 'layout_plan'
            elif doc_type in ['tax_receipt', 'property_tax_receipt', 'tax receipt']:
                data['document_type'] = 'tax_receipt'
            elif doc_type in ['zoning_plan', 'zoning_clearance', 'zoning plan']:
                data['document_type'] = 'zoning_plan'
            elif doc_type in ['rera_cert', 'rera_certificate', 'rera cert']:
                data['document_type'] = 'rera_cert'
            elif doc_type in ['other', 'other_document', 'other document']:
                data['document_type'] = 'other'
            else:
                data['document_type'] = 'other'
                
        return super().to_internal_value(data)

    def get_metadata(self, obj):
        # Construct and return custom document metadata dictionary
        return {
            "document_name": obj.document_name,
            "uploaded_at": obj.uploaded_at.isoformat() if obj.uploaded_at else None,
            "file_extension": obj.document_url.split('.')[-1].lower() if obj.document_url else None
        }

    def validate(self, attrs):
        # Enforce read-only rules for status flags on creation
        if not self.instance:
            if 'ocr_status' in self.initial_data:
                raise serializers.ValidationError({"ocr_status": "OCR status cannot be set on creation."})
            if 'verification_status' in self.initial_data:
                raise serializers.ValidationError({"verification_status": "Verification status cannot be set on creation."})
        return attrs


class AmenitySerializer(serializers.ModelSerializer):
    """
    Read-only serializer for presenting Amenity metadata.
    """
    class Meta:
        model = Amenity
        fields = ['amenity_id', 'amenity_name']
        read_only_fields = fields


class AmenityCreateSerializer(serializers.ModelSerializer):
    """
    Serializer handling creation of new Amenity instances.
    """
    class Meta:
        model = Amenity
        fields = ['amenity_id', 'amenity_name']
        read_only_fields = ['amenity_id']

    def validate_amenity_name(self, value: str) -> str:
        try:
            return validate_amenity_name(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))


class AmenityUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer handling updates to existing Amenity instances.
    """
    class Meta:
        model = Amenity
        fields = ['amenity_name']

    def validate_amenity_name(self, value: str) -> str:
        try:
            # Exclude current instance when validating unique name
            exclude_id = self.instance.amenity_id if self.instance else None
            return validate_amenity_name(value, exclude_id=exclude_id)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))


class PropertyAmenitySerializer(serializers.ModelSerializer):
    """
    Serializer for presenting Property-Amenity mapping metadata.
    """
    property_id = serializers.PrimaryKeyRelatedField(
        source='property',
        queryset=Property.objects.all(),
        label="Property"
    )
    amenity_id = serializers.PrimaryKeyRelatedField(
        source='amenity',
        queryset=Amenity.objects.all(),
        label="Amenity"
    )

    class Meta:
        model = PropertyAmenity
        fields = ['id', 'property_id', 'amenity_id']


class PropertyAmenityCreateSerializer(serializers.ModelSerializer):
    """
    Serializer handling creation of Property-Amenity mappings.
    Checks that relations exist and prevents duplicate mappings.
    """
    property_id = serializers.PrimaryKeyRelatedField(
        source='property',
        queryset=Property.objects.all(),
        label="Property"
    )
    amenity_id = serializers.PrimaryKeyRelatedField(
        source='amenity',
        queryset=Amenity.objects.all(),
        label="Amenity"
    )

    class Meta:
        model = PropertyAmenity
        fields = ['id', 'property_id', 'amenity_id']
        read_only_fields = ['id']


class PropertyAmenityUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer handling updates to Property-Amenity mappings.
    Checks constraints when mapping values are updated.
    """
    property_id = serializers.PrimaryKeyRelatedField(
        source='property',
        queryset=Property.objects.all(),
        required=False,
        label="Property"
    )
    amenity_id = serializers.PrimaryKeyRelatedField(
        source='amenity',
        queryset=Amenity.objects.all(),
        required=False,
        label="Amenity"
    )

    class Meta:
        model = PropertyAmenity
        fields = ['property_id', 'amenity_id']

    def validate(self, attrs):
        # Fall back to instance values if not provided in request
        property_obj = attrs.get('property', self.instance.property if self.instance else None)
        amenity_obj = attrs.get('amenity', self.instance.amenity if self.instance else None)

        if property_obj and amenity_obj:
            query = PropertyAmenity.objects.filter(property=property_obj, amenity=amenity_obj)
            if self.instance:
                query = query.exclude(id=self.instance.id)
            if query.exists():
                raise serializers.ValidationError(
                    "This property-amenity mapping already exists."
                )
        return attrs


class PropertySerializer(serializers.ModelSerializer):
    """
    Serializer for the Property model, exposing basic and detailed specifications.
    """
    class Meta:
        model = Property
        fields = [
            'property_id', 'builder', 'locality', 'rera_number', 'property_name',
            'property_type', 'transaction_type', 'price', 'price_per_sqft', 'bhk',
            'carpet_area', 'builtup_area', 'super_builtup_area', 'bathrooms',
            'balconies', 'parking_spaces', 'floor_number', 'total_floors',
            'furnishing_status', 'facing', 'construction_age', 'land_area',
            'address', 'latitude', 'longitude', 'status', 'launch_date',
            'completion_date', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['property_id', 'created_at', 'updated_at']


class PropertyListingSerializer(serializers.ModelSerializer):
    """
    Serializer for managing property listings, enforcing presence of owner or builder.
    """
    listing_id = serializers.UUIDField(read_only=True)
    property_id = serializers.PrimaryKeyRelatedField(
        source='property',
        queryset=Property.objects.all()
    )
    owner_id = serializers.PrimaryKeyRelatedField(
        source='owner',
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    builder_id = serializers.PrimaryKeyRelatedField(
        source='builder',
        queryset=Builder.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = PropertyListing
        fields = [
            'listing_id', 'property_id', 'listed_by_type', 'owner_id',
            'builder_id', 'contact_name', 'contact_phone', 'contact_email',
            'is_verified', 'listing_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['listing_id', 'created_at', 'updated_at']

    def validate(self, attrs):
        owner = attrs.get('owner', getattr(self.instance, 'owner', None))
        builder = attrs.get('builder', getattr(self.instance, 'builder', None))

        if not owner and not builder:
            raise serializers.ValidationError(
                "A property listing must have at least one of owner_id or builder_id specified."
            )
        return attrs


class PropertyLegalSerializer(serializers.ModelSerializer):
    """
    Serializer for managing legal information of a property.
    """
    legal_id = serializers.UUIDField(read_only=True)
    property_id = serializers.PrimaryKeyRelatedField(
        source='property',
        queryset=Property.objects.all()
    )
    verified_by_id = serializers.PrimaryKeyRelatedField(
        source='verified_by',
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = PropertyLegal
        fields = [
            'legal_id', 'property_id', 'survey_number', 'khata_number',
            'na_converted', 'verification_status', 'verified_by_id',
            'verified_at', 'remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['legal_id', 'created_at', 'updated_at']


class PropertyCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new Property.
    """
    class Meta:
        model = Property
        fields = [
            'property_id', 'builder', 'locality', 'rera_number', 'property_name',
            'property_type', 'transaction_type', 'price', 'price_per_sqft', 'bhk',
            'carpet_area', 'builtup_area', 'super_builtup_area', 'bathrooms',
            'balconies', 'parking_spaces', 'floor_number', 'total_floors',
            'furnishing_status', 'facing', 'construction_age', 'land_area',
            'address', 'latitude', 'longitude', 'status', 'launch_date',
            'completion_date', 'description'
        ]

    def validate(self, attrs):
        price = attrs.get('price')
        if price is not None and price < 0:
            raise serializers.ValidationError({"price": "Price cannot be negative."})
            
        carpet_area = attrs.get('carpet_area')
        if carpet_area is not None and carpet_area <= 0:
            raise serializers.ValidationError({"carpet_area": "Carpet area must be greater than 0."})

        floor_number = attrs.get('floor_number')
        total_floors = attrs.get('total_floors')
        if floor_number is not None and total_floors is not None:
            if floor_number > total_floors:
                raise serializers.ValidationError({"floor_number": "Floor number cannot exceed total floors."})
        return attrs


class PropertyUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating an existing Property.
    """
    class Meta:
        model = Property
        fields = [
            'builder', 'locality', 'rera_number', 'property_name',
            'property_type', 'transaction_type', 'price', 'price_per_sqft', 'bhk',
            'carpet_area', 'builtup_area', 'super_builtup_area', 'bathrooms',
            'balconies', 'parking_spaces', 'floor_number', 'total_floors',
            'furnishing_status', 'facing', 'construction_age', 'land_area',
            'address', 'latitude', 'longitude', 'status', 'launch_date',
            'completion_date', 'description'
        ]

    def validate(self, attrs):
        price = attrs.get('price', getattr(self.instance, 'price', None))
        if price is not None and price < 0:
            raise serializers.ValidationError({"price": "Price cannot be negative."})

        floor_number = attrs.get('floor_number', getattr(self.instance, 'floor_number', None))
        total_floors = attrs.get('total_floors', getattr(self.instance, 'total_floors', None))
        if floor_number is not None and total_floors is not None:
            if floor_number > total_floors:
                raise serializers.ValidationError({"floor_number": "Floor number cannot exceed total floors."})
        return attrs


class PropertyListSerializer(serializers.ModelSerializer):
    """
    Lightweight list serializer for Property list endpoints.
    """
    locality_name = serializers.CharField(source='locality.name', read_only=True)
    builder_name = serializers.CharField(source='builder.builder_name', read_only=True, default=None)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'property_id', 'property_name', 'locality_name', 'builder_name',
            'property_type', 'transaction_type', 'price', 'price_per_sqft',
            'bhk', 'carpet_area', 'furnishing_status', 'facing', 'status',
            'primary_image', 'created_at'
        ]

    def get_primary_image(self, obj):
        primary_img = obj.images.filter(is_primary=True).first() or obj.images.first()
        return primary_img.image_url if primary_img else None


from apps.locations.serializers import NearbyPlaceSerializer


class PropertyDetailSerializer(serializers.ModelSerializer):
    """
    Comprehensive detailed serializer for a Property including nested relations.
    """
    locality_name = serializers.CharField(source='locality.name', read_only=True)
    builder_name = serializers.CharField(source='builder.builder_name', read_only=True, default=None)
    images = PropertyImageSerializer(many=True, read_only=True)
    documents = PropertyDocumentSerializer(many=True, read_only=True)
    listings = PropertyListingSerializer(many=True, read_only=True)
    legal_info = PropertyLegalSerializer(read_only=True)
    nearby_places_grouped = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'property_id', 'builder', 'builder_name', 'locality', 'locality_name',
            'rera_number', 'property_name', 'property_type', 'transaction_type',
            'price', 'price_per_sqft', 'bhk', 'carpet_area', 'builtup_area',
            'super_builtup_area', 'bathrooms', 'balconies', 'parking_spaces',
            'floor_number', 'total_floors', 'furnishing_status', 'facing',
            'construction_age', 'land_area', 'address', 'latitude', 'longitude',
            'status', 'launch_date', 'completion_date', 'description',
            'images', 'documents', 'listings', 'legal_info', 'nearby_places_grouped',
            'created_at', 'updated_at'
        ]

    def get_nearby_places_grouped(self, obj):
        grouped = obj.get_nearby_places_grouped()
        result = {}
        for place_type, places in grouped.items():
            result[place_type] = NearbyPlaceSerializer(places, many=True).data
        return result



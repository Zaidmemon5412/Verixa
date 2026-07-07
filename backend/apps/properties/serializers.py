from rest_framework import serializers
from .models import PropertyImage, PropertyDocument, Property

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

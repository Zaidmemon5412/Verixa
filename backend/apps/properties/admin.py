from django.contrib import admin
from .models import (
    Property,
    Amenity,
    PropertyAmenity,
    PropertyImage,
    PropertyDocument,
    PriceHistory,
    PropertyScore,
    PropertySource,
    PropertyListing,
    PropertyLegal,
)


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ('image_url', 'image_type', 'display_order', 'is_primary')


class PropertyDocumentInline(admin.TabularInline):
    model = PropertyDocument
    extra = 1


class PropertyAmenityInline(admin.TabularInline):
    model = PropertyAmenity
    extra = 1


class PriceHistoryInline(admin.TabularInline):
    model = PriceHistory
    extra = 1


class PropertyScoreInline(admin.StackedInline):
    model = PropertyScore
    can_delete = False


class PropertyListingInline(admin.TabularInline):
    model = PropertyListing
    extra = 1


class PropertyLegalInline(admin.StackedInline):
    model = PropertyLegal
    can_delete = False


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        'property_name', 'property_id', 'locality', 'builder', 'property_type',
        'price', 'bhk', 'furnishing_status', 'facing', 'status', 'rera_number'
    )
    list_filter = ('locality', 'property_type', 'transaction_type', 'bhk', 'furnishing_status', 'facing', 'status', 'locality__city')
    search_fields = ('property_name', 'property_id', 'rera_number', 'locality__name', 'builder__builder_name', 'address')
    inlines = [
        PropertyAmenityInline,
        PropertyImageInline,
        PropertyDocumentInline,
        PriceHistoryInline,
        PropertyScoreInline,
        PropertyListingInline,
        PropertyLegalInline,
    ]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PropertyListing)
class PropertyListingAdmin(admin.ModelAdmin):
    list_display = (
        'listing_id', 'property', 'listed_by_type', 'owner',
        'builder', 'contact_name', 'is_verified', 'listing_status', 'created_at'
    )
    list_filter = ('listed_by_type', 'listing_status', 'is_verified')
    search_fields = ('property__property_name', 'contact_name', 'contact_email', 'contact_phone')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PropertyLegal)
class PropertyLegalAdmin(admin.ModelAdmin):
    list_display = (
        'legal_id', 'property', 'survey_number', 'khata_number',
        'na_converted', 'verification_status', 'verified_by', 'verified_at', 'created_at'
    )
    list_filter = ('verification_status', 'na_converted')
    search_fields = ('property__property_name', 'survey_number', 'khata_number', 'remarks')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ('amenity_name',)
    search_fields = ('amenity_name',)
    ordering = ('amenity_name',)


@admin.register(PropertyAmenity)
class PropertyAmenityAdmin(admin.ModelAdmin):
    list_display = ('property', 'amenity')
    search_fields = ('property__property_name', 'amenity__amenity_name')
    list_filter = ('amenity',)
    ordering = ('property', 'amenity')


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ('property', 'image_type', 'display_order', 'is_primary')
    list_filter = ('property', 'image_type', 'is_primary')
    search_fields = ('property__property_name', 'image_type')
    ordering = ('property', 'display_order')


@admin.register(PropertyDocument)
class PropertyDocumentAdmin(admin.ModelAdmin):
    list_display = ('document_name', 'property', 'document_type', 'ocr_status', 'verification_status', 'uploaded_at')
    list_filter = ('property', 'document_type', 'ocr_status', 'verification_status')
    search_fields = ('document_name', 'property__property_name')
    ordering = ('-uploaded_at',)
    actions = ['trigger_verification']

    @admin.action(description="Trigger verification for selected documents")
    def trigger_verification(self, request, queryset):
        from .services import PropertyDocumentService
        count = 0
        for doc in queryset:
            PropertyDocumentService.update_document_status(
                document_id=doc.pk,
                ocr_status='completed',
                verification_status='verified'
            )
            count += 1
        self.message_user(request, f"Triggered verification and updated status to verified for {count} documents.")


@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('property', 'price', 'recorded_date')
    search_fields = ('property__property_name',)


@admin.register(PropertyScore)
class PropertyScoreAdmin(admin.ModelAdmin):
    list_display = ('property', 'predicted_price', 'fair_price_score', 'confidence_score', 'updated_at')
    search_fields = ('property__property_name',)


@admin.register(PropertySource)
class PropertySourceAdmin(admin.ModelAdmin):
    list_display = ('property', 'source_name', 'scraped_at', 'last_verified_at')
    list_filter = ('source_name',)
    search_fields = ('property__property_name', 'source_name')


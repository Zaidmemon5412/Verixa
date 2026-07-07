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
)


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1


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


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        'property_name', 'locality', 'builder', 'property_type',
        'price', 'bhk', 'status', 'rera_number'
    )
    list_filter = ('property_type', 'transaction_type', 'status', 'locality__city')
    search_fields = ('property_name', 'rera_number', 'locality__name', 'builder__builder_name')
    inlines = [
        PropertyAmenityInline,
        PropertyImageInline,
        PropertyDocumentInline,
        PriceHistoryInline,
        PropertyScoreInline
    ]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ('amenity_name',)
    search_fields = ('amenity_name',)


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

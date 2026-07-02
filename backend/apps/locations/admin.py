from django.contrib import admin
from .models import Locality, NearbyPlace


class NearbyPlaceInline(admin.TabularInline):
    model = NearbyPlace
    extra = 1


@admin.register(Locality)
class LocalityAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'state', 'pincode', 'latitude', 'longitude')
    search_fields = ('name', 'city', 'pincode')
    list_filter = ('state', 'city')
    inlines = [NearbyPlaceInline]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(NearbyPlace)
class NearbyPlaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'locality', 'type', 'distance', 'travel_time')
    search_fields = ('name', 'locality__name', 'type')
    list_filter = ('type',)
    readonly_fields = ('created_at', 'updated_at')

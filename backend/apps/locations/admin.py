"""
Admin configurations for the locations app.
Registers Locality and NearbyPlace models and customizes lists, filters, searches, and orderings.
"""
from django.contrib import admin
from .models import Locality, NearbyPlace


class NearbyPlaceInline(admin.TabularInline):
    model = NearbyPlace
    extra = 1
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Locality)
class LocalityAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'state', 'pincode', 'latitude', 'longitude')
    search_fields = ('name', 'city', 'pincode')
    list_filter = ('state', 'city')
    ordering = ('city', 'name')
    inlines = [NearbyPlaceInline]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(NearbyPlace)
class NearbyPlaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'locality', 'distance', 'travel_time')
    search_fields = ('name', 'locality__name', 'type')
    list_filter = ('type', 'locality__city')
    ordering = ('locality', 'distance')
    readonly_fields = ('created_at', 'updated_at')

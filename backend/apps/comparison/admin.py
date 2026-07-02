from django.contrib import admin
from .models import ComparisonSession, ComparisonProperty


class ComparisonPropertyInline(admin.TabularInline):
    model = ComparisonProperty
    extra = 1


@admin.register(ComparisonSession)
class ComparisonSessionAdmin(admin.ModelAdmin):
    list_display = ('comparison_name', 'user', 'created_at', 'updated_at')
    search_fields = ('comparison_name', 'user__full_name', 'user__username')
    list_filter = ('created_at',)
    inlines = [ComparisonPropertyInline]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ComparisonProperty)
class ComparisonPropertyAdmin(admin.ModelAdmin):
    list_display = ('comparison', 'property', 'added_at')
    search_fields = ('comparison__comparison_name', 'property__property_name')
    list_filter = ('added_at',)

from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('property', 'user', 'report_type', 'generated_at')
    search_fields = ('property__property_name', 'user__full_name', 'report_type')
    list_filter = ('report_type', 'generated_at')

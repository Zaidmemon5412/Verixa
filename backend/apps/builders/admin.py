from django.contrib import admin
from .models import Builder


@admin.register(Builder)
class BuilderAdmin(admin.ModelAdmin):
    list_display = ('builder_name', 'company_name', 'rera_registration_no', 'established_year', 'email', 'phone')
    search_fields = ('builder_name', 'company_name', 'rera_registration_no', 'email')
    list_filter = ('established_year',)
    readonly_fields = ('created_at', 'updated_at')

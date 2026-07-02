from django.contrib import admin
from .models import Enquiry


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ('property', 'user', 'status', 'created_at')
    search_fields = ('property__property_name', 'user__full_name', 'message')
    list_filter = ('status', 'created_at')

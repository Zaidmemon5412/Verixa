from django.contrib import admin
from .models import Builder, BuilderProject, BuilderProjectImage


@admin.register(Builder)
class BuilderAdmin(admin.ModelAdmin):
    list_display = (
        'builder_name',
        'company_name',
        'rera_registration_no',
        'email',
        'phone',
        'established_year',
    )
    search_fields = ('builder_name', 'company_name', 'rera_registration_no', 'email')
    list_filter = ('established_year',)
    ordering = ('builder_name',)
    readonly_fields = ('created_at', 'updated_at')


class BuilderProjectImageInline(admin.TabularInline):
    model = BuilderProjectImage
    extra = 1
    fields = ('image_url', 'display_order', 'is_primary', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(BuilderProject)
class BuilderProjectAdmin(admin.ModelAdmin):
    list_display = (
        'project_name',
        'builder',
        'property_type',
        'project_status',
        'city',
        'locality',
        'primary_bhk',
        'price',
        'created_at',
    )
    search_fields = (
        'project_name',
        'builder__builder_name',
        'rera_number',
        'locality',
        'city',
        'pincode',
    )
    list_filter = (
        'project_status',
        'property_type',
        'transaction_type',
        'city',
        'state',
        'primary_bhk',
    )
    ordering = ('-created_at', 'project_name')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [BuilderProjectImageInline]


@admin.register(BuilderProjectImage)
class BuilderProjectImageAdmin(admin.ModelAdmin):
    list_display = ('project', 'display_order', 'is_primary', 'image_url', 'created_at')
    list_filter = ('is_primary',)
    search_fields = ('project__project_name', 'image_url')
    ordering = ('project', 'display_order')


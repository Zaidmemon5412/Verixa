from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, SavedProperty


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'full_name', 'email', 'role', 'phone', 'is_staff', 'created_at')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Profile Data', {'fields': ('role', 'phone', 'full_name', 'password_hash', 'profile_image')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Profile Data', {
            'classes': ('wide',),
            'fields': ('role', 'phone', 'email', 'full_name', 'password_hash', 'profile_image'),
        }),
    )
    search_fields = ('username', 'full_name', 'email', 'phone')
    ordering = ('-created_at',)


@admin.register(SavedProperty)
class SavedPropertyAdmin(admin.ModelAdmin):
    list_display = ('user', 'property', 'saved_at')
    search_fields = ('user__full_name', 'user__username', 'property__property_name')
    list_filter = ('saved_at',)

"""
Custom permissions for the properties app.
Defines access control policies for property models, listings, and legal documents.
"""
from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow administrators to edit or delete objects.
    Read permissions are allowed for any request.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or getattr(request.user, 'role', '') == 'admin'))


class IsListingOwnerOrBuilderOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow only the listing owner, listed builder, or an admin to modify/delete a listing.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_staff or getattr(request.user, 'role', '') == 'admin':
            return True
        if hasattr(obj, 'owner') and obj.owner == request.user:
            return True
        return False

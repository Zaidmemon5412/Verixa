"""
Permissions for the accounts app.
Defines granular role-based and object-level authorization policies for DRF endpoints.
"""
from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has a `user` or `owner` field.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object.
        owner = getattr(obj, 'user', None) or getattr(obj, 'owner', None)
        return owner == request.user


class IsAgentUser(permissions.BasePermission):
    """
    Allows access only to authenticated users with the 'agent' role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', None) == 'agent'
        )


class IsVerifierUser(permissions.BasePermission):
    """
    Allows access only to authenticated users with the 'verifier' role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', None) == 'verifier'
        )


class IsPlatformAdmin(permissions.BasePermission):
    """
    Allows access only to authenticated users with the 'admin' role or superusers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (getattr(request.user, 'role', None) == 'admin' or request.user.is_superuser)
        )

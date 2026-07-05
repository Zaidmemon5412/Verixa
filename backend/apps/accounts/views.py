"""
Views for the accounts app.
Handles incoming REST API requests, invokes appropriate services layer functions,
and returns structured JSON responses following production best practices.
"""
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ProfileUpdateSerializer,
    ChangePasswordSerializer,
    GoogleOAuthSerializer,
)
from .services import (
    register_user,
    login_user,
    update_profile,
    change_password,
)


class RegisterView(APIView):
    """
    API View to register new users in the platform.
    Allows anyone to register.
    """
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Save via service function
            user = register_user(serializer.validated_data)
            user_data = UserSerializer(user).data
            return Response({
                "success": True,
                "message": "User registered successfully.",
                "data": user_data
            }, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message,
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    API View to authenticate users.
    Returns JWT access/refresh tokens alongside serialized user profile info.
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            if 'non_field_errors' in errors:
                error_msg = str(errors['non_field_errors'][0])
                if "Invalid email or password" in error_msg:
                    return Response({
                        "success": False,
                        "message": error_msg,
                        "data": {}
                    }, status=status.HTTP_401_UNAUTHORIZED)
                elif "disabled" in error_msg or "inactive" in error_msg:
                    return Response({
                        "success": False,
                        "message": error_msg,
                        "data": {}
                    }, status=status.HTTP_403_FORBIDDEN)
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Authenticate via service function
            user = login_user(email=email, password=password)
            
            # Generate Simple JWT tokens
            refresh = RefreshToken.for_user(user)
            user_data = UserSerializer(user).data

            return Response({
                "success": True,
                "message": "Login successful.",
                "data": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": user_data
                }
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message,
                "data": {}
            }, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(APIView):
    """
    API View for retrieving or updating the authenticated user's profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response({
            "success": True,
            "message": "Profile retrieved successfully.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        serializer = ProfileUpdateSerializer(
            instance=request.user, 
            data=request.data, 
            context={"request": request}
        )
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        # Update profile via service function
        user = update_profile(request.user, serializer.validated_data)
        user_data = UserSerializer(user).data
        
        return Response({
            "success": True,
            "message": "Profile updated successfully.",
            "data": user_data
        }, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """
    API View to change the authenticated user's password.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Change password via service function
            change_password(
                user=request.user,
                old_password=serializer.validated_data['old_password'],
                new_password=serializer.validated_data['new_password']
            )
            return Response({
                "success": True,
                "message": "Password changed successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message,
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    API View to logout users.
    Blacklists the active refresh token to invalidate the session.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({
                "success": False,
                "message": "Refresh token is required.",
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Invalidate the token using blacklist
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({
                "success": True,
                "message": "Logout successful.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response({
                "success": False,
                "message": "Invalid token or token already blacklisted.",
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)


class GoogleOAuthView(APIView):
    """
    Placeholder API View for Google OAuth integration.
    """
    permission_classes = [AllowAny]
    serializer_class = GoogleOAuthSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({
            "success": False,
            "message": "Google OAuth integration not implemented yet.",
            "data": {}
        }, status=status.HTTP_501_NOT_IMPLEMENTED)

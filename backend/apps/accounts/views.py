"""
Views for the accounts app.
Handles incoming HTTP requests, invokes appropriate service logic,
and returns JSON responses via Django REST Framework.
"""
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User
from .serializers import UserSerializer, UserRegisterSerializer, GoogleOAuthSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing, editing, and managing user profile instances.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegisterSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()


class GoogleOAuthView(APIView):
    """
    API View to handle authentication callback/sign-in using Google OAuth credentials.
    Prepares payload for service verification and issues JWT tokens upon success.
    """
    permission_classes = [AllowAny]
    serializer_class = GoogleOAuthSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Authentication/Verification service logic will go here
        return Response(
            {"message": "Google OAuth endpoint placeholder. Verification logic not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )

"""
Views for Password Reset functionality in accounts app.
"""
import logging
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .password_reset_serializers import (
    ForgotPasswordSerializer,
    VerifyResetTokenSerializer,
    ResetPasswordSerializer,
)
from .services import (
    send_password_reset_email,
    verify_password_reset_token,
    reset_password_with_token,
)

logger = logging.getLogger(__name__)


class ForgotPasswordView(APIView):
    """
    API View to request a password reset email.
    Public endpoint. Does not leak whether the email exists.
    """
    permission_classes = [AllowAny]
    serializer_class = ForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            email = serializer.validated_data['email']
            send_password_reset_email(email)
            return Response({
                "success": True,
                "message": "Password reset instructions have been sent to your email address.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {"detail": str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error processing forgot password request")
            return Response({
                "success": False,
                "message": f"Failed to deliver email: {str(e)}",
                "data": {"detail": str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)



class VerifyResetTokenView(APIView):
    """
    API View to verify the validity of a password reset token.
    Public endpoint.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        uid = request.query_params.get('uid')
        token = request.query_params.get('token')

        serializer = VerifyResetTokenSerializer(data={'uid': uid, 'token': token})
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            verify_password_reset_token(
                uidb64=serializer.validated_data['uid'],
                token=serializer.validated_data['token']
            )
            return Response({
                "success": True,
                "message": "Password reset token is valid.",
                "data": {
                    "valid": True,
                    "uid": serializer.validated_data['uid'],
                    "token": serializer.validated_data['token']
                }
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {"valid": False}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error verifying reset token")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResetPasswordView(APIView):
    """
    API View to set a new password using a valid reset token.
    Public endpoint.
    """
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "message": "Validation failed.",
                "data": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            reset_password_with_token(
                uidb64=serializer.validated_data['uid'],
                token=serializer.validated_data['token'],
                new_password=serializer.validated_data['new_password']
            )
            return Response({
                "success": True,
                "message": "Password has been reset successfully.",
                "data": {}
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({
                "success": False,
                "message": e.message if hasattr(e, 'message') else str(e),
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Error resetting password")
            return Response({
                "success": False,
                "message": "An internal server error occurred.",
                "data": {"detail": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

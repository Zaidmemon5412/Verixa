"""
Unit and integration tests for Password Reset module in accounts app.
"""
from django.urls import reverse
from django.core import mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import User


class PasswordResetAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username='resetuser',
            email='reset@example.com',
            password='OldPassword123!',
            full_name='Reset User',
            role='buyer'
        )

        self.forgot_url = reverse('accounts:forgot-password')
        self.verify_url = reverse('accounts:reset-password-verify')
        self.reset_url = reverse('accounts:reset-password')

    def test_forgot_password_success(self):
        payload = {"email": "reset@example.com"}
        response = self.client.post(self.forgot_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Password Reset Request", mail.outbox[0].subject)
        self.assertIn(self.user.email, mail.outbox[0].to)

    def test_forgot_password_nonexistent_email_silent_success(self):
        payload = {"email": "nonexistent@example.com"}
        response = self.client.post(self.forgot_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(len(mail.outbox), 0)

    def test_verify_reset_token_valid(self):
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.get(f"{self.verify_url}?uid={uidb64}&token={token}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertTrue(response.data["data"]["valid"])

    def test_verify_reset_token_invalid(self):
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        invalid_token = "invalid-token-12345"

        response = self.client.get(f"{self.verify_url}?uid={uidb64}&token={invalid_token}")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertFalse(response.data["data"]["valid"])

    def test_reset_password_success(self):
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        payload = {
            "uid": uidb64,
            "token": token,
            "new_password": "NewSecurePassword123!",
            "confirm_password": "NewSecurePassword123!"
        }
        response = self.client.post(self.reset_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

        # Verify old password no longer works and new password works
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewSecurePassword123!"))
        self.assertFalse(self.user.check_password("OldPassword123!"))

    def test_reset_password_token_reuse_fails(self):
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        payload = {
            "uid": uidb64,
            "token": token,
            "new_password": "NewSecurePassword123!",
            "confirm_password": "NewSecurePassword123!"
        }
        # First reset succeeds
        response1 = self.client.post(self.reset_url, data=payload, format='json')
        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        # Second reset with same token fails (token reuse protection)
        payload["new_password"] = "AnotherPassword123!"
        payload["confirm_password"] = "AnotherPassword123!"
        response2 = self.client.post(self.reset_url, data=payload, format='json')
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response2.data["success"])

    def test_reset_password_mismatched_passwords_fails(self):
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        payload = {
            "uid": uidb64,
            "token": token,
            "new_password": "NewSecurePassword123!",
            "confirm_password": "DifferentPassword123!"
        }
        response = self.client.post(self.reset_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_reset_password_weak_password_fails(self):
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        payload = {
            "uid": uidb64,
            "token": token,
            "new_password": "weak",
            "confirm_password": "weak"
        }
        response = self.client.post(self.reset_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

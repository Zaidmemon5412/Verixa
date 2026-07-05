"""
Tests for the accounts app.
Defines unit and integration test cases for User models, validators, and serializers.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.request import Request
from rest_framework import status
from django.test.client import RequestFactory
from rest_framework.test import APITestCase

from .validators import (
    validate_email,
    validate_password_strength,
    validate_full_name,
    validate_phone_number,
)
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ProfileUpdateSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()


class UserModelTestCase(TestCase):
    """
    Test suite for the User model and its associated manager.
    """
    def setUp(self):
        self.user_data = {
            "email": "testuser@example.com",
            "password": "SecurePassword123!",
            "username": "test_user_1",
            "full_name": "Test User One",
            "role": "buyer",
        }

    def test_create_user(self):
        """
        Verify that creating a normal user is successful and enforces the custom manager.
        """
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, self.user_data["email"])
        self.assertEqual(user.username, self.user_data["username"])
        self.assertTrue(user.check_password(self.user_data["password"]))
        self.assertEqual(user.role, "buyer")
        self.assertFalse(user.is_staff)

    def test_create_superuser(self):
        """
        Verify that creating a superuser correctly applies administrative roles.
        """
        superuser_data = self.user_data.copy()
        superuser_data["email"] = "adminuser@example.com"
        superuser_data["username"] = "admin_user_1"
        superuser_data["role"] = "admin"

        admin = User.objects.create_superuser(**superuser_data)
        self.assertEqual(admin.email, superuser_data["email"])
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)


class ValidatorsTestCase(TestCase):
    """
    Test suite for the custom field validator functions.
    """
    def test_validate_email(self):
        # Valid cases
        self.assertEqual(validate_email("TEST@EXAMPLE.COM"), "test@example.com")
        self.assertEqual(validate_email("  user.name+tag@domain.co.in "), "user.name+tag@domain.co.in")
        
        # Invalid cases
        invalid_emails = ["invalid-email", "invalid@domain", "@no-local.com", "space in@email.com"]
        for email in invalid_emails:
            with self.assertRaises(DjangoValidationError):
                validate_email(email)

    def test_validate_password_strength(self):
        # Valid password (min 8 chars, mixed case, digit, special char)
        validate_password_strength("P@ssword123")
        validate_password_strength("aB1!cDe2#fG3$")

        # Invalid cases
        invalid_passwords = [
            "short1!",       # Too short (< 8)
            "A"*129 + "1!",  # Too long (> 128)
            "password123!",  # No uppercase
            "PASSWORD123!",  # No lowercase
            "Password!",     # No digit
            "Password123",   # No special character
        ]
        for pwd in invalid_passwords:
            with self.assertRaises(DjangoValidationError):
                validate_password_strength(pwd)

    def test_validate_full_name(self):
        # Valid cases (trimming spaces, alphabets only)
        self.assertEqual(validate_full_name("John Doe"), "John Doe")
        self.assertEqual(validate_full_name("  John   Michael   Doe  "), "John Michael Doe")

        # Invalid cases
        invalid_names = [
            "Jo",            # Too short (< 3)
            "J" * 101,       # Too long (> 100)
            "John Doe 123",  # Contains digits
            "John @ Doe",    # Contains symbols
        ]
        for name in invalid_names:
            with self.assertRaises(DjangoValidationError):
                validate_full_name(name)

    def test_validate_phone_number(self):
        # Valid Indian mobile formats
        self.assertEqual(validate_phone_number("9876543210"), "9876543210")
        self.assertEqual(validate_phone_number("+919876543210"), "9876543210")
        self.assertEqual(validate_phone_number("918876543210"), "8876543210")
        self.assertEqual(validate_phone_number("07876543210"), "7876543210")

        # Invalid cases
        invalid_phones = [
            "5876543210",    # Doesn't start with 6-9
            "987654321",     # Too short
            "98765432100",    # Too long
            "987654321a",    # Non-digit
        ]
        for phone in invalid_phones:
            with self.assertRaises(DjangoValidationError):
                validate_phone_number(phone)


class SerializersTestCase(TestCase):
    """
    Test suite for Register, Login, ProfileUpdate, and ChangePassword serializers.
    """
    def setUp(self):
        self.factory = RequestFactory()
        self.register_data = {
            "full_name": "Alice Smith",
            "username": "alice_smith",
            "email": "alice@example.com",
            "phone": "9876543210",
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!",
        }
        # Pre-create a user for login/duplicate testing
        self.existing_user = User.objects.create_user(
            email="existing@example.com",
            username="existing_user",
            password="ExistingPassword123!",
            full_name="Existing User",
            phone="8765432109",
        )

    def test_register_serializer_success(self):
        serializer = RegisterSerializer(data=self.register_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.email, "alice@example.com")
        self.assertEqual(user.full_name, "Alice Smith")
        self.assertEqual(user.phone, "9876543210")
        self.assertTrue(user.check_password("SecurePassword123!"))

    def test_register_serializer_password_mismatch(self):
        data = self.register_data.copy()
        data["confirm_password"] = "DifferentPassword123!"
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("confirm_password", serializer.errors)

    def test_register_serializer_duplicates(self):
        # Test duplicate email
        data = self.register_data.copy()
        data["email"] = "existing@example.com"
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

        # Test duplicate username
        data = self.register_data.copy()
        data["username"] = "existing_user"
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("username", serializer.errors)

        # Test duplicate phone
        data = self.register_data.copy()
        data["phone"] = "8765432109"
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("phone", serializer.errors)

    def test_login_serializer_success(self):
        data = {
            "email": "existing@example.com",
            "password": "ExistingPassword123!"
        }
        serializer = LoginSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["user"], self.existing_user)

    def test_login_serializer_failure(self):
        data = {
            "email": "existing@example.com",
            "password": "WrongPassword!"
        }
        serializer = LoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_profile_update_serializer(self):
        # Create request context with existing user
        request = self.factory.put('/profile/')
        request.user = self.existing_user

        data = {
            "full_name": "Updated Full Name",
            "phone": "9988776655",
            "profile_image": "http://example.com/img.jpg"
        }
        serializer = ProfileUpdateSerializer(
            instance=self.existing_user,
            data=data,
            context={"request": request}
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_user = serializer.save()
        self.assertEqual(updated_user.full_name, "Updated Full Name")
        self.assertEqual(updated_user.phone, "9988776655")
        self.assertEqual(updated_user.profile_image, "http://example.com/img.jpg")

    def test_change_password_serializer_success(self):
        request = self.factory.post('/change-password/')
        request.user = self.existing_user

        data = {
            "old_password": "ExistingPassword123!",
            "new_password": "NewSecurePassword123!",
            "confirm_password": "NewSecurePassword123!",
        }
        serializer = ChangePasswordSerializer(data=data, context={"request": request})
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_change_password_serializer_mismatch(self):
        request = self.factory.post('/change-password/')
        request.user = self.existing_user

        data = {
            "old_password": "ExistingPassword123!",
            "new_password": "NewSecurePassword123!",
            "confirm_password": "DifferentConfirmPassword123!",
        }
        serializer = ChangePasswordSerializer(data=data, context={"request": request})
        self.assertFalse(serializer.is_valid())
        self.assertIn("confirm_password", serializer.errors)


class APIViewsTestCase(APITestCase):
    """
    Test suite for accounts API view endpoints: Register, Login, Logout, Profile, and Password Change.
    """
    def setUp(self):
        self.register_url = '/api/accounts/register/'
        self.login_url = '/api/accounts/login/'
        self.logout_url = '/api/accounts/logout/'
        self.profile_url = '/api/accounts/profile/'
        self.change_password_url = '/api/accounts/change-password/'

        self.user_data = {
            "email": "existing@example.com",
            "username": "existing_user",
            "password": "ExistingPassword123!",
            "full_name": "Existing User",
            "phone": "9876543210",
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_api_register_success(self):
        data = {
            "full_name": "New User",
            "username": "new_user",
            "email": "newuser@example.com",
            "phone": "9988776655",
            "password": "NewPassword123!",
            "confirm_password": "NewPassword123!",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["email"], "newuser@example.com")

    def test_api_register_validation_failure(self):
        data = {
            "full_name": "New User",
            "username": "new_user",
            "email": "invalid-email",
            "password": "pwd",
            "confirm_password": "pwd",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_api_login_success(self):
        data = {
            "email": "existing@example.com",
            "password": "ExistingPassword123!"
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("access", response.data["data"])
        self.assertIn("refresh", response.data["data"])
        self.assertEqual(response.data["data"]["user"]["email"], "existing@example.com")

    def test_api_login_failure(self):
        data = {
            "email": "existing@example.com",
            "password": "WrongPassword!"
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data["success"])

    def test_api_profile_retrieval_and_update(self):
        # Unauthenticated request
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Authenticate client
        self.client.force_authenticate(user=self.user)

        # Retrieve profile
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["email"], "existing@example.com")

        # Update profile
        update_data = {
            "full_name": "Jane Doe",
            "phone": "9998887776",
        }
        response = self.client.put(self.profile_url, update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["full_name"], "Jane Doe")
        self.assertEqual(response.data["data"]["phone"], "9998887776")

    def test_api_change_password_success(self):
        self.client.force_authenticate(user=self.user)
        data = {
            "old_password": "ExistingPassword123!",
            "new_password": "NewPassword123!",
            "confirm_password": "NewPassword123!",
        }
        response = self.client.post(self.change_password_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

    def test_api_logout_success(self):
        self.client.force_authenticate(user=self.user)
        # Login to generate token
        login_data = {
            "email": "existing@example.com",
            "password": "ExistingPassword123!"
        }
        login_response = self.client.post(self.login_url, login_data)
        refresh_token = login_response.data["data"]["refresh"]

        # Logout with refresh token
        logout_data = {"refresh": refresh_token}
        response = self.client.post(self.logout_url, logout_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])


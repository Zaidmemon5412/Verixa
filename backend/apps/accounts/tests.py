"""
Tests for the accounts app.
Defines unit and integration test cases for User models, serializers, and views.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model

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

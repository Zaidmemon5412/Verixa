"""
Tests for the builders app.
Defines unit and integration test cases for Builder models, validators, serializers, and REST endpoints.
"""
import uuid
from django.core.exceptions import ValidationError as DjangoValidationError
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Builder
from .validators import (
    validate_builder_name,
    validate_email,
    validate_phone_number,
    validate_website_url,
    validate_rera_registration_no,
    validate_established_year,
)


class BuilderValidatorTests(APITestCase):
    """
    Unit tests for the Builder field validators.
    """

    def test_validate_builder_name(self):
        # Valid names
        self.assertEqual(validate_builder_name("DLF Limited"), "DLF Limited")
        self.assertEqual(validate_builder_name("  Godrej   Properties  "), "Godrej Properties")
        self.assertEqual(validate_builder_name("L&T Realty (Group)"), "L&T Realty (Group)")

        # Invalid names
        invalid_names = [
            "Jo",  # Too short
            "A" * 256,  # Too long
            "Builder@123",  # Invalid characters
        ]
        for name in invalid_names:
            with self.assertRaises(DjangoValidationError):
                validate_builder_name(name)

    def test_validate_email(self):
        # Valid emails
        self.assertEqual(validate_email("info@builder.com"), "info@builder.com")
        self.assertEqual(validate_email("  SALES@realty.co.in "), "sales@realty.co.in")

        # Invalid emails
        invalid_emails = ["invalid-email", "info@", "@domain.com", "info@domain"]
        for email in invalid_emails:
            with self.assertRaises(DjangoValidationError):
                validate_email(email)

    def test_validate_phone_number(self):
        # Valid E.164 phones
        self.assertEqual(validate_phone_number("+919876543210"), "+919876543210")
        self.assertEqual(validate_phone_number("9876543210"), "9876543210")

        # Invalid phones
        invalid_phones = ["123", "invalid-phone", "+12345678901234567"]
        for phone in invalid_phones:
            with self.assertRaises(DjangoValidationError):
                validate_phone_number(phone)

    def test_validate_website_url(self):
        # Valid websites
        self.assertEqual(validate_website_url("https://www.dlf.in"), "https://www.dlf.in")
        self.assertEqual(validate_website_url("http://realty.com"), "http://realty.com")

        # Invalid websites
        invalid_urls = ["www.dlf.in", "ftp://realty.com", "http://", "invalid-url"]
        for url in invalid_urls:
            with self.assertRaises(DjangoValidationError):
                validate_website_url(url)

    def test_validate_rera_registration_no(self):
        # Valid RERA formats
        self.assertEqual(validate_rera_registration_no("rera-mh-123"), "RERA-MH-123")
        self.assertEqual(validate_rera_registration_no("PRM/KA/RERA/12"), "PRM/KA/RERA/12")

        # Invalid RERA formats
        invalid_reras = ["RER", "RERA@123", "A" * 101]
        for rera in invalid_reras:
            with self.assertRaises(DjangoValidationError):
                validate_rera_registration_no(rera)

    def test_validate_established_year(self):
        # Valid years
        self.assertEqual(validate_established_year(1800), 1800)
        self.assertEqual(validate_established_year("2026"), 2026)

        # Invalid years
        invalid_years = [1799, 2101, "invalid", None]
        for year in invalid_years:
            with self.assertRaises(DjangoValidationError):
                validate_established_year(year)


class BuilderAPITests(APITestCase):
    """
    Integration tests verifying Builder CRUD endpoints.
    """

    def setUp(self):
        self.valid_payload = {
            "builder_name": "Godrej Properties",
            "company_name": "Godrej Properties Ltd",
            "rera_registration_no": "RERA-MH-99999",
            "office_address": "Godrej One, Vikhroli, Mumbai",
            "phone": "+919999999999",
            "email": "contact@godrejproperties.com",
            "website": "https://www.godrejproperties.com",
            "established_year": 1990,
            "about": "Leading real estate developer in India."
        }
        # In this project, the URL configuration for builders might not be mounted on root yet, 
        # but BuilderViewSet is registered under empty prefix in urls.py.
        # We can resolve endpoints using names: 'builders:builder-list', 'builders:builder-detail'.
        self.list_url = reverse('builders:builder-list')

    def test_create_builder_success(self):
        """
        Verify that a valid builder profile can be created successfully.
        """
        response = self.client.post(self.list_url, data=self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["builder_name"], "Godrej Properties")
        self.assertEqual(response.data["data"]["rera_registration_no"], "RERA-MH-99999")

    def test_create_builder_duplicate_rera(self):
        """
        Verify that creating a builder with duplicate RERA number fails.
        """
        # Create first
        self.client.post(self.list_url, data=self.valid_payload, format='json')
        
        # Try creating duplicate RERA
        duplicate_payload = self.valid_payload.copy()
        duplicate_payload["builder_name"] = "Other Builder Ltd"
        
        response = self.client.post(self.list_url, data=duplicate_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_create_builder_validation_errors(self):
        """
        Verify that validation errors on email, phone, website, year are caught.
        """
        invalid_payload = self.valid_payload.copy()
        invalid_payload["email"] = "invalid-email"
        invalid_payload["phone"] = "123"
        invalid_payload["website"] = "www.invalid.com"
        invalid_payload["established_year"] = 1750
        
        response = self.client.post(self.list_url, data=invalid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertIn("email", response.data["data"])
        self.assertIn("phone", response.data["data"])
        self.assertIn("website", response.data["data"])
        self.assertIn("established_year", response.data["data"])

    def test_get_all_builders(self):
        """
        Verify that all builders are listed.
        """
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        
    def test_get_builder_detail_success(self):
        """
        Verify retrieving a single builder by ID works.
        """
        create_response = self.client.post(self.list_url, data=self.valid_payload, format='json')
        builder_id = create_response.data["data"]["builder_id"]
        
        detail_url = reverse('builders:builder-detail', kwargs={'pk': builder_id})
        response = self.client.get(detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["builder_id"], builder_id)

    def test_get_builder_detail_not_found(self):
        """
        Verify retrieving a non-existent builder ID returns 404.
        """
        fake_uuid = str(uuid.uuid4())
        detail_url = reverse('builders:builder-detail', kwargs={'pk': fake_uuid})
        response = self.client.get(detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data["success"])

    def test_update_builder_success(self):
        """
        Verify updating non-protected builder fields works.
        """
        create_response = self.client.post(self.list_url, data=self.valid_payload, format='json')
        builder_id = create_response.data["data"]["builder_id"]
        
        detail_url = reverse('builders:builder-detail', kwargs={'pk': builder_id})
        update_payload = {
            "builder_name": "Godrej Properties Updated Name",
            "company_name": "Godrej Group Updated",
            "established_year": 1992
        }
        
        response = self.client.put(detail_url, data=update_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["builder_name"], "Godrej Properties Updated Name")
        self.assertEqual(response.data["data"]["company_name"], "Godrej Group Updated")

    def test_update_builder_protected_field(self):
        """
        Verify that attempting to update a protected field like RERA number ignores it.
        """
        create_response = self.client.post(self.list_url, data=self.valid_payload, format='json')
        builder_id = create_response.data["data"]["builder_id"]
        
        detail_url = reverse('builders:builder-detail', kwargs={'pk': builder_id})
        update_payload = {
            "rera_registration_no": "RERA-MH-CHANGED-ILLEGALLY"
        }
        
        response = self.client.put(detail_url, data=update_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # RERA registration no should remain unchanged
        self.assertEqual(response.data["data"]["rera_registration_no"], "RERA-MH-99999")

    def test_delete_builder(self):
        """
        Verify deleting a builder works.
        """
        create_response = self.client.post(self.list_url, data=self.valid_payload, format='json')
        builder_id = create_response.data["data"]["builder_id"]
        
        detail_url = reverse('builders:builder-detail', kwargs={'pk': builder_id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        
        # Verify it's gone
        get_response = self.client.get(detail_url)
        self.assertEqual(get_response.status_code, status.HTTP_404_NOT_FOUND)

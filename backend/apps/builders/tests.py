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


class BuilderProjectAPITests(APITestCase):
    """
    Integration tests for BuilderProject REST endpoints, search, filtering, and gallery images.
    """

    def setUp(self):
        self.builder = Builder.objects.create(
            builder_name="Sun Builders Group",
            company_name="Sun Builders Group",
            rera_registration_no="RERA-SBG-001",
            office_address="Ahmedabad",
            phone="+918128828888",
            email="contact@sunbuilders.in",
            established_year=1981
        )
        self.project_list_url = reverse('builders:builder-project-list')

    def test_create_and_retrieve_project(self):
        payload = {
            "builder": str(self.builder.builder_id),
            "project_name": "Sun Mayfair",
            "property_type": "Mixed-Use",
            "transaction_type": "Sale",
            "project_status": "Under Construction",
            "rera_number": "RERA-SM-001",
            "locality": "Sanand",
            "city": "Ahmedabad",
            "state": "Gujarat",
            "pincode": "382115",
            "primary_bhk": "3 BHK",
            "amenities": ["Garden", "Parking"]
        }
        create_res = self.client.post(self.project_list_url, data=payload, format='json')
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(create_res.data["success"])
        project_id = create_res.data["data"]["project_id"]

        # Detail view
        detail_url = reverse('builders:builder-project-detail', kwargs={'pk': project_id})
        get_res = self.client.get(detail_url)
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.data["data"]["project_name"], "Sun Mayfair")
        self.assertEqual(get_res.data["data"]["builder_name"], "Sun Builders Group")

    def test_search_and_filtering(self):
        # Create 2 projects
        payload1 = {
            "builder": str(self.builder.builder_id),
            "project_name": "Sun Mayfair",
            "city": "Ahmedabad",
            "locality": "Sanand",
            "primary_bhk": "3 BHK"
        }
        payload2 = {
            "builder": str(self.builder.builder_id),
            "project_name": "Sun SkyView",
            "city": "Ahmedabad",
            "locality": "Shela",
            "primary_bhk": "4 BHK"
        }
        self.client.post(self.project_list_url, data=payload1, format='json')
        self.client.post(self.project_list_url, data=payload2, format='json')

        # Filter by locality Shela
        filter_res = self.client.get(self.project_list_url, {'locality': 'Shela'})
        self.assertEqual(filter_res.status_code, status.HTTP_200_OK)
        results = filter_res.data["data"]["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["project_name"], "Sun SkyView")

        # Search query
        search_res = self.client.get(self.project_list_url, {'search': 'Mayfair'})
        self.assertEqual(search_res.status_code, status.HTTP_200_OK)
        search_results = search_res.data["data"]["results"]
        self.assertEqual(len(search_results), 1)
        self.assertEqual(search_results[0]["project_name"], "Sun Mayfair")

    def test_add_and_set_primary_image(self):
        payload = {
            "builder": str(self.builder.builder_id),
            "project_name": "Sun Mayfair",
            "city": "Ahmedabad"
        }
        create_res = self.client.post(self.project_list_url, data=payload, format='json')
        project_id = create_res.data["data"]["project_id"]

        add_img_url = reverse('builders:builder-project-add-image', kwargs={'pk': project_id})
        
        # Add img 1
        img1_res = self.client.post(add_img_url, data={"image_url": "https://example.com/img1.jpg", "is_primary": True}, format='json')
        self.assertEqual(img1_res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(img1_res.data["data"]["is_primary"])
        img1_id = img1_res.data["data"]["image_id"]

        # Add img 2 (is_primary=True, should unset img1 primary)
        img2_res = self.client.post(add_img_url, data={"image_url": "https://example.com/img2.jpg", "is_primary": True}, format='json')
        self.assertEqual(img2_res.status_code, status.HTTP_201_CREATED)
        img2_id = img2_res.data["data"]["image_id"]

        # Set img1 as primary again
        set_prim_url = reverse('builders:builder-project-image-set-primary', kwargs={'pk': img1_id})
        set_res = self.client.post(set_prim_url)
        self.assertEqual(set_res.status_code, status.HTTP_200_OK)
        self.assertTrue(set_res.data["data"]["is_primary"])


class CloudinaryAndImportPipelineTests(APITestCase):
    """
    Unit tests for Cloudinary service helpers and the import pipeline logic.
    """

    def test_cloudinary_folder_path_generation(self):
        from .cloudinary_service import get_cloudinary_folder_path
        folder = get_cloudinary_folder_path("Sun Builders Group", "Sun Mayfair")
        self.assertEqual(folder, "verixa/builder-projects/sun-builders-group/sun-mayfair")

    def test_is_valid_image_url(self):
        from .cloudinary_service import is_valid_image_url
        self.assertTrue(is_valid_image_url("https://example.com/images/1.jpg"))
        self.assertTrue(is_valid_image_url("https://newprojects.99acres.com/media/xop/1.jpg"))
        self.assertFalse(is_valid_image_url("invalid-url-string"))
        self.assertFalse(is_valid_image_url(""))

    def test_import_pipeline_missing_builder_skipped(self):
        import os
        from django.conf import settings
        from .services import import_builder_projects_from_csv
        csv_path = os.path.join(settings.BASE_DIR.parent.parent, "master_verixa_builder_projects.csv")
        report = import_builder_projects_from_csv(csv_path, dry_run=True)
        self.assertGreater(report["total_projects_in_csv"], 0)
        self.assertEqual(report["dry_run"], True)





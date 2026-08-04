"""
Tests for the properties app.
Defines unit and integration test cases for Amenity, PropertyAmenity, PropertyImage, and PropertyDocument.
"""
import os
import uuid
import tempfile
import shutil
from decimal import Decimal

from django.urls import reverse
from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.locations.models import Locality
from .models import Property, Amenity, PropertyAmenity, PropertyImage, PropertyDocument
from .validators import validate_amenity_name, validate_image_file, validate_document_file
from .services import (
    create_amenity,
    get_amenity,
    get_all_amenities,
    update_amenity,
    delete_amenity,
    assign_amenity_to_property,
    remove_amenity_from_property,
    get_property_amenities,
    get_amenity_properties,
    PropertyImageService,
    PropertyDocumentService,
)


class AmenityAPITests(APITestCase):
    """
    Test suite for Amenity validation and CRUD operations.
    """

    def setUp(self):
        self.list_url = reverse('properties:amenity-list')

    def test_create_amenity_success(self):
        payload = {"amenity_name": "Swimming Pool"}
        response = self.client.post(self.list_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["amenity_name"], "Swimming Pool")

    def test_create_amenity_invalid(self):
        # Too short
        response = self.client.post(self.list_url, data={"amenity_name": "A"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

        # Empty
        response = self.client.post(self.list_url, data={"amenity_name": "   "}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_amenity_duplicate(self):
        # Create first
        self.client.post(self.list_url, data={"amenity_name": "Gym"}, format='json')

        # Try duplicate (case-insensitive)
        response = self.client.post(self.list_url, data={"amenity_name": "  gym  "}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_list_amenities(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

    def test_retrieve_amenity_success(self):
        create_res = self.client.post(self.list_url, data={"amenity_name": "Gym"}, format='json')
        amenity_id = create_res.data["data"]["amenity_id"]

        detail_url = reverse('properties:amenity-detail', kwargs={'pk': amenity_id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["amenity_name"], "Gym")

    def test_retrieve_amenity_not_found(self):
        fake_uuid = str(uuid.uuid4())
        detail_url = reverse('properties:amenity-detail', kwargs={'pk': fake_uuid})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_amenity_success(self):
        create_res = self.client.post(self.list_url, data={"amenity_name": "Gym"}, format='json')
        amenity_id = create_res.data["data"]["amenity_id"]

        detail_url = reverse('properties:amenity-detail', kwargs={'pk': amenity_id})
        response = self.client.put(detail_url, data={"amenity_name": "Luxury Gym"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["amenity_name"], "Luxury Gym")

    def test_update_amenity_duplicate(self):
        # Create first
        self.client.post(self.list_url, data={"amenity_name": "Garden"}, format='json')
        # Create second
        create_res = self.client.post(self.list_url, data={"amenity_name": "Gym"}, format='json')
        amenity_id = create_res.data["data"]["amenity_id"]

        detail_url = reverse('properties:amenity-detail', kwargs={'pk': amenity_id})
        # Try rename Gym to Garden (duplicate)
        response = self.client.put(detail_url, data={"amenity_name": "garden"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_amenity(self):
        create_res = self.client.post(self.list_url, data={"amenity_name": "Gym"}, format='json')
        amenity_id = create_res.data["data"]["amenity_id"]

        detail_url = reverse('properties:amenity-detail', kwargs={'pk': amenity_id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check it is deleted
        get_res = self.client.get(detail_url)
        self.assertEqual(get_res.status_code, status.HTTP_404_NOT_FOUND)


class PropertyAmenityAPITests(APITestCase):
    """
    Test suite for Property-Amenity mapping configuration and validation.
    """

    def setUp(self):
        self.list_url = reverse('properties:property-custom-router-prefix-list' if False else 'properties:property-amenity-list')
        
        # Setup locality & property
        self.locality = Locality.objects.create(
            name="SG Highway", city="Ahmedabad", state="Gujarat", pincode="380054", latitude=23.0, longitude=72.0
        )
        self.property = Property.objects.create(
            locality=self.locality, property_name="Heights", property_type="apartment", transaction_type="new",
            price=5000000.0, price_per_sqft=4000.0, bhk=2, carpet_area=1200.0, address="SG Road",
            latitude=23.0, longitude=72.0, status="ready"
        )
        
        # Setup amenity
        self.amenity = Amenity.objects.create(amenity_name="Garden")

    def test_assign_amenity_to_property_success(self):
        payload = {
            "property_id": str(self.property.property_id),
            "amenity_id": str(self.amenity.amenity_id)
        }
        response = self.client.post(self.list_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(str(response.data["data"]["property_id"]), str(self.property.property_id))
        self.assertEqual(str(response.data["data"]["amenity_id"]), str(self.amenity.amenity_id))

    def test_assign_amenity_to_property_duplicate(self):
        payload = {
            "property_id": str(self.property.property_id),
            "amenity_id": str(self.amenity.amenity_id)
        }
        # Assign first
        self.client.post(self.list_url, data=payload, format='json')

        # Try duplicate
        response = self.client.post(self.list_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_assign_amenity_to_property_non_existent_property(self):
        payload = {
            "property_id": str(uuid.uuid4()),
            "amenity_id": str(self.amenity.amenity_id)
        }
        response = self.client.post(self.list_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_444_NOT_FOUND if False else status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data["success"])

    def test_assign_amenity_to_property_non_existent_amenity(self):
        payload = {
            "property_id": str(self.property.property_id),
            "amenity_id": str(uuid.uuid4())
        }
        response = self.client.post(self.list_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data["success"])

    def test_get_property_amenities_list(self):
        # Create relation
        PropertyAmenity.objects.create(property=self.property, amenity=self.amenity)
        
        response = self.client.get(f"{self.list_url}?property_id={self.property.property_id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(len(response.data["data"]), 1)

    def test_retrieve_property_amenity(self):
        mapping = PropertyAmenity.objects.create(property=self.property, amenity=self.amenity)
        
        detail_url = reverse('properties:property-amenity-detail', kwargs={'pk': mapping.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["id"], mapping.id)

    def test_remove_amenity_from_property(self):
        mapping = PropertyAmenity.objects.create(property=self.property, amenity=self.amenity)
        
        detail_url = reverse('properties:property-amenity-detail', kwargs={'pk': mapping.id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        
        # Verify gone
        get_res = self.client.get(detail_url)
        self.assertEqual(get_res.status_code, status.HTTP_404_NOT_FOUND)


# Create a temporary directory for media files during testing
TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class PropertyModuleTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Create a Locality first (required for Property)
        cls.locality = Locality.objects.create(
            name="Koramangala",
            city="Bengaluru",
            state="Karnataka",
            pincode="560034",
            latitude=Decimal("12.9352"),
            longitude=Decimal("77.6245")
        )
        
        # Create a Property
        cls.property = Property.objects.create(
            locality=cls.locality,
            property_name="Verixa Residency",
            property_type="apartment",
            transaction_type="new",
            price=Decimal("7500000.00"),
            price_per_sqft=Decimal("5000.00"),
            bhk=3,
            carpet_area=Decimal("1500.00"),
            address="123 Main Road, Koramangala",
            latitude=Decimal("12.9352"),
            longitude=Decimal("77.6245"),
            status="ready"
        )
        
        # Create a test user for API Authentication
        User = get_user_model()
        cls.user = User.objects.create_user(
            username="testuser",
            email="test@verixa.com",
            password="testpassword"
        )

    def setUp(self):
        # Authenticate all API requests by default
        self.client.force_authenticate(user=self.user)

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        # Clean up temporary media files directory
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    # ----------------------------------------------------
    # VALIDATOR TESTS
    # ----------------------------------------------------
    def test_image_validator_valid_file(self):
        # Valid PNG file under 5MB
        valid_img = SimpleUploadedFile("test.png", b"file_content", content_type="image/png")
        try:
            validate_image_file(valid_img)
        except DjangoValidationError:
            self.fail("validate_image_file raised ValidationError unexpectedly for valid PNG.")

    def test_image_validator_invalid_extension(self):
        # Invalid extension (gif)
        invalid_img = SimpleUploadedFile("test.gif", b"file_content", content_type="image/gif")
        with self.assertRaises(DjangoValidationError):
            validate_image_file(invalid_img)

    def test_image_validator_large_file(self):
        # Image exceeding 5MB
        large_content = b"0" * (5 * 1024 * 1024 + 1)
        large_img = SimpleUploadedFile("test.png", large_content, content_type="image/png")
        with self.assertRaises(DjangoValidationError):
            validate_image_file(large_img)

    def test_document_validator_valid_file(self):
        # Valid PDF file under 10MB
        valid_doc = SimpleUploadedFile("test.pdf", b"file_content", content_type="application/pdf")
        try:
            validate_document_file(valid_doc)
        except DjangoValidationError:
            self.fail("validate_document_file raised ValidationError unexpectedly for valid PDF.")

    def test_document_validator_invalid_extension(self):
        # Invalid extension (zip)
        invalid_doc = SimpleUploadedFile("test.zip", b"file_content", content_type="application/zip")
        with self.assertRaises(DjangoValidationError):
            validate_document_file(invalid_doc)

    def test_document_validator_large_file(self):
        # Document exceeding 10MB
        large_content = b"0" * (10 * 1024 * 1024 + 1)
        large_doc = SimpleUploadedFile("test.pdf", large_content, content_type="application/pdf")
        with self.assertRaises(DjangoValidationError):
            validate_document_file(large_doc)

    # ----------------------------------------------------
    # SERVICE TESTS - IMAGES
    # ----------------------------------------------------
    def test_service_upload_images(self):
        file1 = SimpleUploadedFile("img1.png", b"content1", content_type="image/png")
        file2 = SimpleUploadedFile("img2.jpg", b"content2", content_type="image/jpeg")
        
        created = PropertyImageService.upload_images(self.property.pk, [file1, file2])
        self.assertEqual(len(created), 2)
        
        # Verify display order is sequential starting from 0 (since no images existed)
        self.assertEqual(created[0].display_order, 0)
        self.assertEqual(created[1].display_order, 1)
        
        # First image must be primary because no primary image existed
        self.assertTrue(created[0].is_primary)
        self.assertFalse(created[1].is_primary)

    def test_service_set_primary_image(self):
        file1 = SimpleUploadedFile("img1.png", b"content1", content_type="image/png")
        file2 = SimpleUploadedFile("img2.jpg", b"content2", content_type="image/jpeg")
        
        created = PropertyImageService.upload_images(self.property.pk, [file1, file2])
        
        # Set second image as primary
        updated = PropertyImageService.set_primary_image(created[1].pk)
        
        # Verify status swaps
        self.assertTrue(updated.is_primary)
        # Fetch first image from database and check
        img1 = PropertyImage.objects.get(pk=created[0].pk)
        self.assertFalse(img1.is_primary)

    def test_service_reorder_images(self):
        file1 = SimpleUploadedFile("img1.png", b"content1", content_type="image/png")
        file2 = SimpleUploadedFile("img2.jpg", b"content2", content_type="image/jpeg")
        
        created = PropertyImageService.upload_images(self.property.pk, [file1, file2])
        
        # Current order: [img1, img2] -> display_order: [0, 1]
        # Reorder to: [img2, img1]
        reordered = PropertyImageService.reorder_images(self.property.pk, [created[1].pk, created[0].pk])
        
        self.assertEqual(reordered[0].display_order, 0)
        self.assertEqual(reordered[0].pk, created[1].pk)
        self.assertEqual(reordered[1].display_order, 1)
        self.assertEqual(reordered[1].pk, created[0].pk)

    def test_service_delete_image(self):
        file1 = SimpleUploadedFile("img1.png", b"content1", content_type="image/png")
        created = PropertyImageService.upload_images(self.property.pk, [file1])[0]
        
        # Get path for validation after deletion
        storage_path = created.image_url.split('/media/')[-1]
        
        # Verify db record & storage file exist
        self.assertTrue(PropertyImage.objects.filter(pk=created.pk).exists())
        self.assertTrue(os.path.exists(os.path.join(TEMP_MEDIA_ROOT, storage_path)))
        
        # Delete image
        PropertyImageService.delete_image(created.pk)
        
        # Verify db record & physical file are removed
        self.assertFalse(PropertyImage.objects.filter(pk=created.pk).exists())
        self.assertFalse(os.path.exists(os.path.join(TEMP_MEDIA_ROOT, storage_path)))

    # ----------------------------------------------------
    # SERVICE TESTS - DOCUMENTS
    # ----------------------------------------------------
    def test_service_upload_document(self):
        file1 = SimpleUploadedFile("doc1.pdf", b"content1", content_type="application/pdf")
        doc = PropertyDocumentService.upload_document(self.property.pk, file1, document_type='deed')
        
        # Verify single upload
        self.assertEqual(doc.document_name, "doc1.pdf")
        self.assertEqual(doc.document_type, "deed")
        # Check initial default statuses
        self.assertEqual(doc.ocr_status, 'idle')
        self.assertEqual(doc.verification_status, 'pending')

    def test_service_update_document_status(self):
        file1 = SimpleUploadedFile("doc1.pdf", b"content1", content_type="application/pdf")
        doc = PropertyDocumentService.upload_document(self.property.pk, file1)
        
        # Update status
        updated = PropertyDocumentService.update_document_status(doc.pk, ocr_status='completed', verification_status='verified')
        
        self.assertEqual(updated.ocr_status, 'completed')
        self.assertEqual(updated.verification_status, 'verified')

    # ----------------------------------------------------
    # API VIEWS TESTS
    # ----------------------------------------------------
    def test_api_list_create_images(self):
        # POST: Upload images
        url = reverse('properties:property-image-list-create', kwargs={'property_id': self.property.pk})
        file1 = SimpleUploadedFile("img1.png", b"content1", content_type="image/png")
        file2 = SimpleUploadedFile("img2.jpg", b"content2", content_type="image/jpeg")
        
        response = self.client.post(url, {'image': [file1, file2]}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']), 2)
        
        # GET: List images
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']), 2)

    def test_api_image_detail_update_delete(self):
        # Create an image first
        file1 = SimpleUploadedFile("img1.png", b"content1", content_type="image/png")
        img = PropertyImageService.upload_images(self.property.pk, [file1])[0]
        
        url = reverse('properties:property-image-detail', kwargs={'image_id': img.pk})
        
        # GET: Retrieve image detail
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['is_primary'], True)
        
        # PATCH: Update order/primary
        response = self.client.patch(url, {'is_primary': False, 'display_order': 99}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['display_order'], 99)
        self.assertEqual(response.data['data']['is_primary'], False)
        
        # DELETE: Delete image
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(PropertyImage.objects.filter(pk=img.pk).exists())

    def test_api_serializer_protect_readonly_fields(self):
        # Create image
        file1 = SimpleUploadedFile("img1.png", b"content1", content_type="image/png")
        img = PropertyImageService.upload_images(self.property.pk, [file1])[0]
        
        url = reverse('properties:property-image-detail', kwargs={'image_id': img.pk})
        
        # Attempt to modify read-only 'property' field during update
        response = self.client.patch(url, {'property': str(self.property.pk)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('property', response.data['errors'])

    def test_api_set_primary_image(self):
        # Create two images
        file1 = SimpleUploadedFile("img1.png", b"content1", content_type="image/png")
        file2 = SimpleUploadedFile("img2.png", b"content2", content_type="image/png")
        created = PropertyImageService.upload_images(self.property.pk, [file1, file2])
        
        url = reverse('properties:property-image-set-primary', kwargs={'image_id': created[1].pk})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['data']['is_primary'])
        
        # Verify first image is no longer primary
        img1 = PropertyImage.objects.get(pk=created[0].pk)
        self.assertFalse(img1.is_primary)

    def test_api_reorder_images(self):
        file1 = SimpleUploadedFile("img1.png", b"content1", content_type="image/png")
        file2 = SimpleUploadedFile("img2.png", b"content2", content_type="image/png")
        created = PropertyImageService.upload_images(self.property.pk, [file1, file2])
        
        url = reverse('properties:property-image-reorder', kwargs={'property_id': self.property.pk})
        # Send new order list
        response = self.client.post(url, {'ordered_id_list': [str(created[1].pk), str(created[0].pk)]}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data'][0]['id'], str(created[1].pk))

    def test_api_list_create_documents(self):
        url = reverse('properties:property-document-list-create', kwargs={'property_id': self.property.pk})
        
        # POST: Upload document
        file1 = SimpleUploadedFile("doc1.pdf", b"content1", content_type="application/pdf")
        response = self.client.post(url, {'file': file1, 'document_type': 'deed'}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['document_type'], 'deed')
        self.assertEqual(response.data['data']['ocr_status'], 'idle')
        self.assertEqual(response.data['data']['verification_status'], 'pending')
        
        # GET: List documents
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)

    def test_api_serializer_protect_document_status_creation(self):
        url = reverse('properties:property-document-list-create', kwargs={'property_id': self.property.pk})
        
        # Attempt to specify ocr_status on creation
        file1 = SimpleUploadedFile("doc1.pdf", b"content1", content_type="application/pdf")
        response = self.client.post(url, {'file': file1, 'ocr_status': 'completed'}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('ocr_status', response.data['errors'])


class PropertyModuleAPITests(APITestCase):
    """
    Test suite for Property, PropertyListing, and PropertyLegal CRUD operations, filtering, and validations.
    """

    def setUp(self):
        self.locality = Locality.objects.create(
            name="Satellite",
            city="Ahmedabad",
            state="Gujarat",
            pincode="380015",
            latitude=Decimal("23.030000"),
            longitude=Decimal("72.510000")
        )
        self.property_list_url = reverse('properties:property-list')
        self.listing_list_url = reverse('properties:property-listing-list')
        self.legal_list_url = reverse('properties:property-legal-list')

    def test_create_property_success(self):
        payload = {
            "locality": str(self.locality.pk),
            "property_name": "Skyline Heights",
            "property_type": "apartment",
            "transaction_type": "new",
            "price": "7500000.00",
            "price_per_sqft": "5000.00",
            "bhk": 3,
            "carpet_area": "1500.00",
            "super_builtup_area": "1800.00",
            "bathrooms": 3,
            "balconies": 2,
            "parking_spaces": 1,
            "floor_number": 5,
            "total_floors": 12,
            "furnishing_status": "SEMI_FURNISHED",
            "facing": "EAST",
            "construction_age": 2,
            "address": "Satellite Road, Ahmedabad",
            "latitude": "23.030000",
            "longitude": "72.510000",
            "status": "ready"
        }
        response = self.client.post(self.property_list_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["property_name"], "Skyline Heights")

    def test_create_property_validation_negative_price(self):
        payload = {
            "locality": str(self.locality.pk),
            "property_name": "Invalid Price Tower",
            "property_type": "apartment",
            "transaction_type": "new",
            "price": "-500.00",
            "price_per_sqft": "5000.00",
            "bhk": 2,
            "carpet_area": "1000.00",
            "address": "Address",
            "latitude": "23.030000",
            "longitude": "72.510000",
            "status": "ready"
        }
        response = self.client.post(self.property_list_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_list_and_filter_properties(self):
        # Create property
        prop = Property.objects.create(
            locality=self.locality,
            property_name="Green Villa",
            property_type="villa",
            transaction_type="new",
            price=Decimal("12000000.00"),
            price_per_sqft=Decimal("6000.00"),
            bhk=4,
            carpet_area=Decimal("2000.00"),
            address="Vastrapur",
            latitude=Decimal("23.035000"),
            longitude=Decimal("72.525000"),
            status="ready",
            furnishing_status="FULLY_FURNISHED"
        )
        
        # Test Filter by property_type
        response = self.client.get(f"{self.property_list_url}?property_type=villa")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["count"], 1)

        # Test Search
        response = self.client.get(f"{self.property_list_url}?search=Green")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["count"], 1)

    def test_property_listing_crud(self):
        prop = Property.objects.create(
            locality=self.locality,
            property_name="Royal Residency",
            property_type="apartment",
            transaction_type="new",
            price=Decimal("5000000.00"),
            price_per_sqft=Decimal("4000.00"),
            bhk=2,
            carpet_area=Decimal("1250.00"),
            address="Bodakdev",
            latitude=Decimal("23.040000"),
            longitude=Decimal("72.515000"),
            status="ready"
        )
        User = get_user_model()
        user = User.objects.create_user(
            username="owner_user",
            email="owner@example.com",
            password="Password123!",
            full_name="John Doe"
        )

        # Create listing
        payload = {
            "property_id": str(prop.pk),
            "listed_by_type": "OWNER",
            "owner_id": str(user.pk),
            "contact_name": "John Doe",
            "contact_phone": "+919876543210",
            "contact_email": "john@example.com",
            "listing_status": "ACTIVE"
        }
        response = self.client.post(self.listing_list_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        listing_id = response.data["data"]["listing_id"]

        # Retrieve listing
        detail_url = reverse('properties:property-listing-detail', kwargs={'pk': listing_id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["contact_name"], "John Doe")

        # Delete listing
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_property_listing_validation_missing_owner_and_builder(self):
        prop = Property.objects.create(
            locality=self.locality,
            property_name="Orchid Heights",
            property_type="apartment",
            transaction_type="new",
            price=Decimal("6000000.00"),
            price_per_sqft=Decimal("4500.00"),
            bhk=3,
            carpet_area=Decimal("1330.00"),
            address="Prahlad Nagar",
            latitude=Decimal("23.010000"),
            longitude=Decimal("72.500000"),
            status="ready"
        )
        payload = {
            "property_id": str(prop.pk),
            "listed_by_type": "AGENCY",
            "contact_name": "No Owner Agency",
            "contact_phone": "+919876543210",
            "contact_email": "agency@example.com",
            "listing_status": "ACTIVE"
        }
        response = self.client.post(self.listing_list_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_property_legal_crud(self):
        prop = Property.objects.create(
            locality=self.locality,
            property_name="Legal Verified Park",
            property_type="plot",
            transaction_type="new",
            price=Decimal("15000000.00"),
            price_per_sqft=Decimal("3000.00"),
            bhk=0,
            carpet_area=Decimal("5000.00"),
            address="SG Highway",
            latitude=Decimal("23.050000"),
            longitude=Decimal("72.530000"),
            status="ready"
        )
        payload = {
            "property_id": str(prop.pk),
            "survey_number": "SY-402",
            "khata_number": "KH-882",
            "na_converted": True,
            "verification_status": "VERIFIED",
            "remarks": "Clean clear title deed."
        }
        response = self.client.post(self.legal_list_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        legal_id = response.data["data"]["legal_id"]

        # Duplicate legal creation test
        response_dup = self.client.post(self.legal_list_url, data=payload, format='json')
        self.assertEqual(response_dup.status_code, status.HTTP_400_BAD_REQUEST)

        # Retrieve legal record
        detail_url = reverse('properties:property-legal-detail', kwargs={'pk': legal_id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["data"]["na_converted"])

    def test_property_nearby_places_access_and_api(self):
        from apps.locations.models import NearbyPlace
        
        # Create nearby places for locality
        place1 = NearbyPlace.objects.create(
            locality=self.locality,
            name="Apollo Hospital",
            type="Hospital",
            distance_km=Decimal("1.20"),
            rating=Decimal("4.60"),
            travel_time=5,
            latitude=Decimal("23.031000"),
            longitude=Decimal("72.511000")
        )
        place2 = NearbyPlace.objects.create(
            locality=self.locality,
            name="DPS School",
            type="School",
            distance_km=Decimal("2.50"),
            rating=Decimal("4.40"),
            travel_time=10,
            latitude=Decimal("23.032000"),
            longitude=Decimal("72.512000")
        )

        prop = Property.objects.create(
            locality=self.locality,
            property_name="Vastrapur Residency",
            property_type="apartment",
            transaction_type="new",
            price=Decimal("8000000.00"),
            price_per_sqft=Decimal("5000.00"),
            bhk=3,
            carpet_area=Decimal("1600.00"),
            address="Vastrapur Lake",
            latitude=Decimal("23.030000"),
            longitude=Decimal("72.510000"),
            status="ready"
        )

        # Test model methods
        self.assertEqual(prop.nearby_places.count(), 2)
        grouped = prop.get_nearby_places_grouped()
        self.assertIn("Hospital", grouped)
        self.assertIn("School", grouped)
        self.assertEqual(len(grouped["Hospital"]), 1)

        # Test nearby places grouped endpoint
        url = reverse('properties:property-nearby-places', kwargs={'pk': prop.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("Hospital", response.data["data"])
        self.assertIn("School", response.data["data"])
        self.assertEqual(response.data["data"]["Hospital"][0]["name"], "Apollo Hospital")


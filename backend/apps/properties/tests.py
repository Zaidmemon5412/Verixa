import tempfile
import shutil
import os
from decimal import Decimal

from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError as DjangoValidationError
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from apps.locations.models import Locality
from .models import Property, PropertyImage, PropertyDocument
from .validators import validate_image_file, validate_document_file
from .services import PropertyImageService, PropertyDocumentService

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
        url = reverse('property-image-list-create', kwargs={'property_id': self.property.pk})
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
        
        url = reverse('property-image-detail', kwargs={'image_id': img.pk})
        
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
        
        url = reverse('property-image-detail', kwargs={'image_id': img.pk})
        
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
        
        url = reverse('property-image-set-primary', kwargs={'image_id': created[1].pk})
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
        
        url = reverse('property-image-reorder', kwargs={'property_id': self.property.pk})
        # Send new order list
        response = self.client.post(url, {'ordered_id_list': [str(created[1].pk), str(created[0].pk)]}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data'][0]['id'], str(created[1].pk))

    def test_api_list_create_documents(self):
        url = reverse('property-document-list-create', kwargs={'property_id': self.property.pk})
        
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
        url = reverse('property-document-list-create', kwargs={'property_id': self.property.pk})
        
        # Attempt to specify ocr_status on creation
        file1 = SimpleUploadedFile("doc1.pdf", b"content1", content_type="application/pdf")
        response = self.client.post(url, {'file': file1, 'ocr_status': 'completed'}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('ocr_status', response.data['errors'])

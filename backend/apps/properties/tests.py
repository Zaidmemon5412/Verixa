"""
Tests for the properties app.
Defines unit and integration test cases for Amenity and PropertyAmenity resources.
"""
import uuid
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.locations.models import Locality
from .models import Property, Amenity, PropertyAmenity


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

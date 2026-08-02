"""
Unit tests for Saved Properties feature in accounts module.
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import User, SavedProperty
from apps.properties.models import Property
from apps.locations.models import Locality


class SavedPropertiesAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username='testbuyer',
            email='buyer@example.com',
            password='Password123!',
            full_name='Test Buyer',
            role='buyer'
        )
        self.other_user = User.objects.create_user(
            username='otherbuyer',
            email='other@example.com',
            password='Password123!',
            full_name='Other Buyer',
            role='buyer'
        )

        self.locality = Locality.objects.create(
            name='Test Locality',
            city='Ahmedabad',
            state='Gujarat',
            pincode='380015',
            latitude=23.0225,
            longitude=72.5714
        )

        self.property1 = Property.objects.create(
            property_name='Luxury Residency 1',
            property_type='apartment',
            transaction_type='new',
            price=7500000.00,
            price_per_sqft=5000.00,
            bhk=3,
            carpet_area=1500.00,
            latitude=23.0225,
            longitude=72.5714,
            locality=self.locality,
            status='ready'
        )

        self.property2 = Property.objects.create(
            property_name='Green Villa 2',
            property_type='villa',
            transaction_type='new',
            price=12000000.00,
            price_per_sqft=6000.00,
            bhk=4,
            carpet_area=2000.00,
            latitude=23.0225,
            longitude=72.5714,
            locality=self.locality,
            status='ready'
        )

        self.list_create_url = reverse('accounts:saved-property-list')

    def test_save_property_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.list_create_url, {
            "property_id": str(self.property1.property_id)
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(SavedProperty.objects.filter(user=self.user).count(), 1)

    def test_save_property_duplicate_fails(self):
        self.client.force_authenticate(user=self.user)
        SavedProperty.objects.create(user=self.user, property=self.property1)
        
        response = self.client.post(self.list_create_url, {
            "property_id": str(self.property1.property_id)
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_list_saved_properties(self):
        self.client.force_authenticate(user=self.user)
        SavedProperty.objects.create(user=self.user, property=self.property1)
        SavedProperty.objects.create(user=self.user, property=self.property2)

        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["count"], 2)

    def test_check_saved_status(self):
        self.client.force_authenticate(user=self.user)
        saved = SavedProperty.objects.create(user=self.user, property=self.property1)

        check_url = reverse('accounts:saved-property-check-status', kwargs={'property_id': str(self.property1.property_id)})
        response = self.client.get(check_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["data"]["is_saved"])
        self.assertEqual(response.data["data"]["saved_id"], str(saved.id))

    def test_remove_saved_property(self):
        self.client.force_authenticate(user=self.user)
        saved = SavedProperty.objects.create(user=self.user, property=self.property1)

        delete_url = reverse('accounts:saved-property-detail', kwargs={'pk': str(saved.id)})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(SavedProperty.objects.filter(user=self.user).count(), 0)

    def test_unauthenticated_access_denied(self):
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

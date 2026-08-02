"""
Tests for the Comparison app.
"""
from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import User
from apps.locations.models import Locality
from apps.properties.models import Property
from .models import ComparisonSession, ComparisonProperty


class ComparisonAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username='compuser',
            email='comp@example.com',
            password='Password123!',
            full_name='Comp User',
            role='buyer'
        )

        self.locality = Locality.objects.create(
            name='Satellite',
            city='Ahmedabad',
            state='Gujarat',
            pincode='380015',
            latitude=Decimal('23.0225'),
            longitude=Decimal('72.5714')
        )

        self.property1 = Property.objects.create(
            property_name='Satellite Villa 1',
            property_type='villa',
            transaction_type='new',
            price=Decimal('15000000.00'),
            price_per_sqft=Decimal('6000.00'),
            bhk=4,
            carpet_area=Decimal('2500.00'),
            latitude=Decimal('23.0225'),
            longitude=Decimal('72.5714'),
            locality=self.locality,
            status='ready'
        )

        self.property2 = Property.objects.create(
            property_name='Satellite Apartment 2',
            property_type='apartment',
            transaction_type='new',
            price=Decimal('8500000.00'),
            price_per_sqft=Decimal('5500.00'),
            bhk=3,
            carpet_area=Decimal('1550.00'),
            latitude=Decimal('23.0225'),
            longitude=Decimal('72.5714'),
            locality=self.locality,
            status='ready'
        )

        self.list_create_url = reverse('comparison:comparison-session-list')

    def test_create_comparison_session(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            "comparison_name": "Best Satellite Homes",
            "property_ids": [str(self.property1.property_id)]
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["comparison_name"], "Best Satellite Homes")
        self.assertEqual(len(response.data["data"]["compared_properties"]), 1)

    def test_list_user_comparison_sessions(self):
        self.client.force_authenticate(user=self.user)
        ComparisonSession.objects.create(user=self.user, comparison_name="Session 1")
        ComparisonSession.objects.create(user=self.user, comparison_name="Session 2")

        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 2)

    def test_add_and_remove_property_from_comparison(self):
        self.client.force_authenticate(user=self.user)
        session = ComparisonSession.objects.create(user=self.user, comparison_name="Compare Session")
        
        # Add property
        add_url = reverse('comparison:comparison-session-add-property', kwargs={'pk': str(session.comparison_id)})
        response = self.client.post(add_url, data={"property_id": str(self.property1.property_id)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(ComparisonProperty.objects.filter(comparison=session).count(), 1)

        # Remove property
        remove_url = reverse('comparison:comparison-session-remove-property', kwargs={
            'pk': str(session.comparison_id),
            'property_id': str(self.property1.property_id)
        })
        response = self.client.delete(remove_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(ComparisonProperty.objects.filter(comparison=session).count(), 0)

    def test_delete_comparison_session(self):
        self.client.force_authenticate(user=self.user)
        session = ComparisonSession.objects.create(user=self.user, comparison_name="To Delete")
        
        detail_url = reverse('comparison:comparison-session-detail', kwargs={'pk': str(session.comparison_id)})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(ComparisonSession.objects.filter(comparison_id=session.comparison_id).exists())

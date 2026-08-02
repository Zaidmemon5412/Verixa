"""
Unit tests for the Enquiries app.
"""
from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import User
from apps.locations.models import Locality
from apps.properties.models import Property
from .models import Enquiry


class EnquiryAPITests(APITestCase):

    def setUp(self):
        self.buyer = User.objects.create_user(
            username='enqbuyer',
            email='buyer@enquiry.com',
            password='Password123!',
            full_name='Enquiry Buyer',
            role='buyer'
        )
        self.admin = User.objects.create_user(
            username='enqadmin',
            email='admin@enquiry.com',
            password='Password123!',
            full_name='Platform Admin',
            role='admin'
        )

        self.locality = Locality.objects.create(
            name='Bodakdev',
            city='Ahmedabad',
            state='Gujarat',
            pincode='380054',
            latitude=Decimal('23.0390'),
            longitude=Decimal('72.5075')
        )

        self.property = Property.objects.create(
            property_name='Bodakdev Heights',
            property_type='apartment',
            transaction_type='new',
            price=Decimal('9500000.00'),
            price_per_sqft=Decimal('5800.00'),
            bhk=3,
            carpet_area=Decimal('1637.00'),
            latitude=Decimal('23.0390'),
            longitude=Decimal('72.5075'),
            locality=self.locality,
            status='ready'
        )

        self.list_create_url = reverse('inquiries:enquiry-list')

    def test_create_enquiry(self):
        self.client.force_authenticate(user=self.buyer)
        payload = {
            "property_id": str(self.property.property_id),
            "message": "Is this property available for immediate possession?"
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["status"], "pending")
        self.assertEqual(Enquiry.objects.filter(user=self.buyer).count(), 1)

    def test_get_user_enquiries(self):
        self.client.force_authenticate(user=self.buyer)
        Enquiry.objects.create(user=self.buyer, property=self.property, message="First enquiry message")

        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["count"], 1)

    def test_update_enquiry_status_by_admin(self):
        enquiry = Enquiry.objects.create(user=self.buyer, property=self.property, message="Enquiry for status update")
        self.client.force_authenticate(user=self.admin)
        
        status_url = reverse('inquiries:enquiry-update-status', kwargs={'pk': str(enquiry.enquiry_id)})
        response = self.client.patch(status_url, data={"status": "replied"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["status"], "replied")
        
        enquiry.refresh_from_db()
        self.assertEqual(enquiry.status, "replied")

    def test_delete_enquiry(self):
        enquiry = Enquiry.objects.create(user=self.buyer, property=self.property, message="Enquiry to be deleted")
        self.client.force_authenticate(user=self.buyer)

        detail_url = reverse('inquiries:enquiry-detail', kwargs={'pk': str(enquiry.enquiry_id)})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Enquiry.objects.filter(enquiry_id=enquiry.enquiry_id).exists())

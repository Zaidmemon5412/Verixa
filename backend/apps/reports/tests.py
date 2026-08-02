"""
Unit tests for the Reports app.
"""
from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import User
from apps.locations.models import Locality
from apps.properties.models import Property
from .models import Report


class ReportAPITests(APITestCase):

    def setUp(self):
        self.buyer = User.objects.create_user(
            username='repbuyer',
            email='buyer@report.com',
            password='Password123!',
            full_name='Report Buyer',
            role='buyer'
        )

        self.locality = Locality.objects.create(
            name='Prahlad Nagar',
            city='Ahmedabad',
            state='Gujarat',
            pincode='380015',
            latitude=Decimal('23.0120'),
            longitude=Decimal('72.5100')
        )

        self.property = Property.objects.create(
            property_name='Prahlad Residency',
            property_type='apartment',
            transaction_type='new',
            price=Decimal('8000000.00'),
            price_per_sqft=Decimal('5333.33'),
            bhk=3,
            carpet_area=Decimal('1500.00'),
            latitude=Decimal('23.0120'),
            longitude=Decimal('72.5100'),
            locality=self.locality,
            status='ready'
        )

        self.list_create_url = reverse('reports:report-list')

    def test_generate_report(self):
        self.client.force_authenticate(user=self.buyer)
        payload = {
            "property_id": str(self.property.property_id),
            "report_type": "Valuation Estimation"
        }
        response = self.client.post(self.list_create_url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["report_type"], "Valuation Estimation")
        self.assertTrue(Report.objects.filter(user=self.buyer).exists())

    def test_get_user_reports(self):
        self.client.force_authenticate(user=self.buyer)
        Report.objects.create(
            user=self.buyer,
            property=self.property,
            report_type="Legal Verification",
            report_url="https://verixa.com/reports/legal_1.pdf"
        )

        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["count"], 1)

    def test_delete_report(self):
        report = Report.objects.create(
            user=self.buyer,
            property=self.property,
            report_type="Market Analytics",
            report_url="https://verixa.com/reports/market_1.pdf"
        )
        self.client.force_authenticate(user=self.buyer)

        detail_url = reverse('reports:report-detail', kwargs={'pk': str(report.report_id)})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Report.objects.filter(report_id=report.report_id).exists())

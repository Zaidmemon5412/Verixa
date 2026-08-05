import uuid
from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from apps.locations.models import Locality, NearbyPlace
from apps.properties.models import Property, Builder


class NearbyIntelligenceAPITests(TestCase):
    """
    Integration tests for Nearby Intelligence REST API endpoints:
    - GET /api/properties/<id>/nearby/
    - GET /api/localities/<id>/nearby/
    - GET /api/nearby/
    """

    def setUp(self):
        self.client = APIClient()
        self.locality = Locality.objects.create(
            name="Science City",
            city="Ahmedabad",
            state="Gujarat",
            pincode="380060",
            latitude=Decimal("23.078900"),
            longitude=Decimal("72.505000"),
        )

        self.builder = Builder.objects.create(
            builder_name="Godrej Properties",
            company_name="Godrej Properties Ltd",
            rera_registration_no="PR/GJ/AHMEDABAD/123",
            office_address="SG Highway, Ahmedabad",
            phone="9876543210",
            email="contact@godrej.com",
            established_year=1990,
        )

        self.property = Property.objects.create(
            property_name="Godrej Celestial",
            property_type="apartment",
            transaction_type="new",
            locality=self.locality,
            builder=self.builder,
            price=Decimal("12500000.00"),
            price_per_sqft=Decimal("6500.00"),
            bhk=3,
            carpet_area=Decimal("1500.00"),
            address="Science City Road",
            latitude=Decimal("23.079200"),
            longitude=Decimal("72.505500"),
            status="ready",
        )

        self.place1 = NearbyPlace.objects.create(
            locality=self.locality,
            name="Science City Park",
            type="Park",
            latitude=Decimal("23.079500"),
            longitude=Decimal("72.506000"),
            address="Science City",
            travel_time=2,
            source="OpenStreetMap",
        )
        self.place2 = NearbyPlace.objects.create(
            locality=self.locality,
            name="CIMS Hospital",
            type="Hospital",
            latitude=Decimal("23.085000"),
            longitude=Decimal("72.510000"),
            address="Science City Road",
            travel_time=6,
            source="OpenStreetMap",
        )

    def test_property_nearby_api_success(self):
        url = reverse('properties:property-nearby', kwargs={'pk': self.property.property_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["property_id"], str(self.property.property_id))
        self.assertEqual(response.data["locality"], "Science City")
        self.assertEqual(response.data["total_count"], 2)
        
        nearby_list = response.data["nearby_places"]
        self.assertIn("distance_m", nearby_list[0])
        self.assertIn("distance_km", nearby_list[0])
        # Verify nearest place comes first
        self.assertEqual(nearby_list[0]["name"], "Science City Park")

    def test_property_nearby_api_with_category_filter(self):
        url = reverse('properties:property-nearby', kwargs={'pk': self.property.property_id})
        response = self.client.get(url, {'category': 'Hospital'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_count"], 1)
        self.assertEqual(response.data["nearby_places"][0]["category"], "Hospital")

    def test_property_nearby_api_invalid_property_id(self):
        fake_uuid = uuid.uuid4()
        url = reverse('properties:property-nearby', kwargs={'pk': fake_uuid})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data["success"])

    def test_locality_nearby_api_success(self):
        url = reverse('locations:locality-nearby', kwargs={'pk': self.locality.locality_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["locality_id"], str(self.locality.locality_id))
        self.assertEqual(response.data["total_count"], 2)

    def test_global_nearby_api_success(self):
        url = reverse('locations:global-nearby-places')
        response = self.client.get(url, {'locality': 'Science City'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["total_count"], 2)

    def test_global_nearby_api_with_category_and_radius(self):
        url = reverse('locations:global-nearby-places')
        response = self.client.get(url, {
            'locality': str(self.locality.locality_id),
            'category': 'Park',
            'radius': '1000'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_count"], 1)
        self.assertEqual(response.data["nearby_places"][0]["name"], "Science City Park")

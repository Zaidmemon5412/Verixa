"""
Tests for the locations app validation and serialization layers.
"""
from decimal import Decimal
from django.core.exceptions import ValidationError as DjangoValidationError
from django.test import TestCase, override_settings
from rest_framework import serializers, status

from .models import Locality, NearbyPlace
from .validators import (
    validate_locality_name,
    validate_city,
    validate_state,
    validate_pincode,
    validate_latitude,
    validate_longitude,
    validate_place_name,
    validate_place_type,
    validate_distance,
    validate_travel_time,
)
from .serializers import (
    LocalitySerializer,
    LocalityCreateSerializer,
    LocalityUpdateSerializer,
    NearbyPlaceSerializer,
    NearbyPlaceCreateSerializer,
    NearbyPlaceUpdateSerializer,
)


class LocationValidatorTests(TestCase):
    """
    Unit tests for reusable field validators in locations app.
    """

    def test_validate_locality_name_valid(self):
        self.assertEqual(validate_locality_name("Indiranagar"), "Indiranagar")
        self.assertEqual(validate_locality_name("  Koramangala 4th   Block  "), "Koramangala 4th Block")
        self.assertEqual(validate_locality_name("Sector-21 (East)"), "Sector-21 (East)")

    def test_validate_locality_name_invalid(self):
        invalid_names = [
            "Ab",  # Too short
            "A" * 256,  # Too long
            "Indira@Nagar",  # Invalid characters
            "",  # Empty
            None,  # Not a string
        ]
        for name in invalid_names:
            with self.assertRaises(DjangoValidationError):
                validate_locality_name(name)

    def test_validate_city_valid(self):
        self.assertEqual(validate_city("Bengaluru"), "Bengaluru")
        self.assertEqual(validate_city(" New   Delhi  "), "New Delhi")
        self.assertEqual(validate_city("Navi-Mumbai"), "Navi-Mumbai")

    def test_validate_city_invalid(self):
        invalid_cities = [
            "A",  # Too short
            "C" * 101,  # Too long
            "Mumbai123",  # Numbers not allowed in city
            "",
            None,
        ]
        for city in invalid_cities:
            with self.assertRaises(DjangoValidationError):
                validate_city(city)

    def test_validate_state_valid(self):
        self.assertEqual(validate_state("Karnataka"), "Karnataka")
        self.assertEqual(validate_state(" Uttar   Pradesh  "), "Uttar Pradesh")

    def test_validate_state_invalid(self):
        invalid_states = [
            "K",  # Too short
            "S" * 101,  # Too long
            "Goa9",  # Numbers not allowed
            "",
            None,
        ]
        for state in invalid_states:
            with self.assertRaises(DjangoValidationError):
                validate_state(state)

    def test_validate_pincode_valid(self):
        self.assertEqual(validate_pincode("560001"), "560001")
        self.assertEqual(validate_pincode("  110011  "), "110011")
        self.assertEqual(validate_pincode(400001), "400001")

    def test_validate_pincode_invalid(self):
        invalid_pincodes = [
            "011001",  # Starts with 0 (Indian pincodes start with 1-9)
            "56001",  # 5 digits
            "5600011",  # 7 digits
            "56000A",  # Contains characters
            "",
            None,
        ]
        for pin in invalid_pincodes:
            with self.assertRaises(DjangoValidationError):
                validate_pincode(pin)

    def test_validate_latitude_valid(self):
        self.assertEqual(validate_latitude("12.971598"), Decimal("12.971598"))
        self.assertEqual(validate_latitude(-45.5), Decimal("-45.5"))
        self.assertEqual(validate_latitude(90), Decimal("90"))
        self.assertEqual(validate_latitude(-90), Decimal("-90"))

    def test_validate_latitude_invalid(self):
        invalid_lats = [
            90.0001,  # Out of range
            -91.0,  # Out of range
            "invalid-decimal",
            None,
        ]
        for lat in invalid_lats:
            with self.assertRaises(DjangoValidationError):
                validate_latitude(lat)

    def test_validate_longitude_valid(self):
        self.assertEqual(validate_longitude("77.594562"), Decimal("77.594562"))
        self.assertEqual(validate_longitude(-120.5), Decimal("-120.5"))
        self.assertEqual(validate_longitude(180), Decimal("180"))
        self.assertEqual(validate_longitude(-180), Decimal("-180"))

    def test_validate_longitude_invalid(self):
        invalid_lons = [
            180.0001,  # Out of range
            -181.0,  # Out of range
            "invalid-decimal",
            None,
        ]
        for lon in invalid_lons:
            with self.assertRaises(DjangoValidationError):
                validate_longitude(lon)

    def test_validate_place_name_valid(self):
        self.assertEqual(validate_place_name("Kempegowda Metro Station"), "Kempegowda Metro Station")
        self.assertEqual(validate_place_name("  Phoenix   Marketcity  "), "Phoenix Marketcity")

    def test_validate_place_name_invalid(self):
        invalid_names = [
            "Ph",
            "A" * 256,
            "Station#1",
            "",
            None,
        ]
        for name in invalid_names:
            with self.assertRaises(DjangoValidationError):
                validate_place_name(name)

    def test_validate_place_type_valid(self):
        self.assertEqual(validate_place_type("Metro Station"), "Metro Station")
        self.assertEqual(validate_place_type("  Hospital  "), "Hospital")

    def test_validate_place_type_invalid(self):
        invalid_types = [
            "H",
            "T" * 101,
            "School@",
            "",
            None,
        ]
        for t in invalid_types:
            with self.assertRaises(DjangoValidationError):
                validate_place_type(t)

    def test_validate_distance_valid(self):
        self.assertEqual(validate_distance("2.5"), Decimal("2.5"))
        self.assertEqual(validate_distance(0.1), Decimal("0.1"))

    def test_validate_distance_invalid(self):
        invalid_dists = [
            0,  # Positive only (greater than 0)
            -0.5,  # Negative
            "invalid",
            None,
        ]
        for dist in invalid_dists:
            with self.assertRaises(DjangoValidationError):
                validate_distance(dist)

    def test_validate_travel_time_valid(self):
        self.assertEqual(validate_travel_time("15"), 15)
        self.assertEqual(validate_travel_time(0), 0)

    def test_validate_travel_time_invalid(self):
        invalid_times = [
            -1,  # Negative
            12.5,  # Float
            "invalid",
            None,
        ]
        for t in invalid_times:
            with self.assertRaises(DjangoValidationError):
                validate_travel_time(t)


class LocalitySerializerTests(TestCase):
    """
    Tests for LocalitySerializer, LocalityCreateSerializer, and LocalityUpdateSerializer.
    """

    def setUp(self):
        self.locality_data = {
            "name": "Koramangala",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560034",
            "latitude": "12.9352",
            "longitude": "77.6245",
            "description": "Premium residential and commercial hub.",
        }
        self.locality = Locality.objects.create(**self.locality_data)

    def test_locality_serializer_read_only(self):
        serializer = LocalitySerializer(instance=self.locality)
        self.assertEqual(serializer.data["name"], "Koramangala")
        self.assertEqual(serializer.data["pincode"], "560034")
        self.assertIn("locality_id", serializer.data)

    def test_locality_create_serializer_success(self):
        data = self.locality_data.copy()
        data["name"] = "Indiranagar"
        data["pincode"] = " 560038 "  # Test whitespace cleanup
        serializer = LocalityCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        locality = serializer.save()
        self.assertEqual(locality.name, "Indiranagar")
        self.assertEqual(locality.pincode, "560038")

    def test_locality_create_serializer_duplicate_constraint(self):
        # Already exists a Koramangala, Bengaluru, Karnataka
        data = self.locality_data.copy()
        data["name"] = "  Koramangala  "  # Cleaned matches
        serializer = LocalityCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)

    def test_locality_create_serializer_invalid_fields(self):
        data = self.locality_data.copy()
        data["pincode"] = "001234"  # Invalid Indian PIN
        data["latitude"] = "120.0"  # Out of range
        serializer = LocalityCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("pincode", serializer.errors)
        self.assertIn("latitude", serializer.errors)

    def test_locality_update_serializer_success(self):
        data = {
            "name": "Koramangala Extension",
            "pincode": "560035",
        }
        serializer = LocalityUpdateSerializer(instance=self.locality, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_locality = serializer.save()
        self.assertEqual(updated_locality.name, "Koramangala Extension")
        self.assertEqual(updated_locality.pincode, "560035")
        # Ensure city remains same
        self.assertEqual(updated_locality.city, "Bengaluru")

    def test_locality_update_serializer_read_only_fields(self):
        original_id = self.locality.locality_id
        original_created_at = self.locality.created_at
        data = {
            "locality_id": "00000000-0000-0000-0000-000000000000",
            "name": "Koramangala Updated",
        }
        serializer = LocalityUpdateSerializer(instance=self.locality, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_locality = serializer.save()
        self.assertEqual(updated_locality.locality_id, original_id)
        self.assertEqual(updated_locality.name, "Koramangala Updated")


class NearbyPlaceSerializerTests(TestCase):
    """
    Tests for NearbyPlaceSerializer, NearbyPlaceCreateSerializer, and NearbyPlaceUpdateSerializer.
    """

    def setUp(self):
        self.locality = Locality.objects.create(
            name="Whitefield",
            city="Bengaluru",
            state="Karnataka",
            pincode="560066",
            latitude="12.9698",
            longitude="77.7499",
        )
        self.place_data = {
            "locality": self.locality,
            "name": "Manipal Hospital Whitefield",
            "type": "Hospital",
            "distance": "1.80",
            "distance_km": "1.80",
            "address": "HAL Old Airport Rd, Whitefield",
            "rating": "4.50",
            "travel_time": 8,
            "latitude": "12.9702",
            "longitude": "77.7450",
        }
        self.nearby_place = NearbyPlace.objects.create(**self.place_data)

    def test_nearby_place_serializer_read(self):
        serializer = NearbyPlaceSerializer(instance=self.nearby_place)
        self.assertEqual(serializer.data["name"], "Manipal Hospital Whitefield")
        self.assertEqual(serializer.data["locality"]["name"], "Whitefield")
        self.assertEqual(serializer.data["address"], "HAL Old Airport Rd, Whitefield")
        self.assertEqual(serializer.data["rating"], "4.50")
        self.assertEqual(serializer.data["distance_km"], "1.80")

    def test_nearby_place_create_serializer_success(self):
        data = {
            "locality": self.locality.locality_id,
            "name": "Whitefield Railway Station",
            "type": "Railway Station",
            "distance_km": "3.50",
            "address": "Whitefield Main Rd",
            "rating": "4.20",
            "travel_time": 12,
            "latitude": "12.9800",
            "longitude": "77.7550",
        }
        serializer = NearbyPlaceCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        place = serializer.save()
        self.assertEqual(place.name, "Whitefield Railway Station")
        self.assertEqual(place.locality, self.locality)
        self.assertEqual(place.distance_km, Decimal("3.50"))
        self.assertEqual(place.rating, Decimal("4.20"))

    def test_nearby_place_create_serializer_invalid_locality(self):
        import uuid
        data = {
            "locality": uuid.uuid4(),  # Non-existent locality
            "name": "Random Mall",
            "type": "Mall",
            "distance": "2.0",
            "travel_time": 5,
            "latitude": "12.9800",
            "longitude": "77.7550",
        }
        serializer = NearbyPlaceCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("locality", serializer.errors)

    def test_nearby_place_create_serializer_invalid_fields(self):
        data = {
            "locality": self.locality.locality_id,
            "name": "Whitefield Railway Station",
            "type": "Railway Station",
            "distance": "-1.5",  # Must be positive
            "rating": "6.5",     # Out of range 0-5
            "travel_time": -5,  # Cannot be negative
            "latitude": "95.0",  # Out of range
            "longitude": "77.7550",
        }
        serializer = NearbyPlaceCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("distance", serializer.errors)
        self.assertIn("rating", serializer.errors)
        self.assertIn("travel_time", serializer.errors)
        self.assertIn("latitude", serializer.errors)

    def test_nearby_place_update_serializer_success(self):
        data = {
            "distance_km": "2.25",
            "rating": "4.80",
            "travel_time": 10,
        }
        serializer = NearbyPlaceUpdateSerializer(instance=self.nearby_place, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_place = serializer.save()
        self.assertEqual(updated_place.distance_km, Decimal("2.25"))
        self.assertEqual(updated_place.rating, Decimal("4.80"))
        self.assertEqual(updated_place.travel_time, 10)

    def test_nearby_place_update_serializer_read_only_fields(self):
        another_locality = Locality.objects.create(
            name="Marathahalli",
            city="Bengaluru",
            state="Karnataka",
            pincode="560037",
            latitude="12.9562",
            longitude="77.7019",
        )
        data = {
            "locality": another_locality.locality_id,  # Read-only field
            "name": "Updated Hospital Name",
        }
        serializer = NearbyPlaceUpdateSerializer(instance=self.nearby_place, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_place = serializer.save()
        self.assertEqual(updated_place.locality, self.locality)  # Unchanged
        self.assertEqual(updated_place.name, "Updated Hospital Name")


@override_settings(SUPPORTED_CITIES=['Ahmedabad', 'Bengaluru'], SUPPORTED_STATES=['Gujarat', 'Karnataka'])
class LocationServiceTests(TestCase):
    """
    Tests for the locations business logic services layer.
    """

    def setUp(self):
        self.locality_data = {
            "name": "Whitefield",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560066",
            "latitude": "12.9698",
            "longitude": "77.7499",
        }
        self.locality = Locality.objects.create(**self.locality_data)

    def test_create_locality_service(self):
        from .services import create_locality
        data = {
            "name": "Marathahalli",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560037",
            "latitude": "12.9562",
            "longitude": "77.7019",
        }
        locality = create_locality(data)
        self.assertEqual(locality.name, "Marathahalli")
        self.assertIsNotNone(locality.locality_id)

    def test_create_locality_service_duplicate(self):
        from .services import create_locality
        with self.assertRaises(DjangoValidationError):
            create_locality(self.locality_data)

    def test_get_locality_service(self):
        from .services import get_locality
        retrieved = get_locality(self.locality.locality_id)
        self.assertEqual(retrieved.name, "Whitefield")

    def test_get_locality_service_not_found(self):
        from .services import get_locality
        import uuid
        with self.assertRaises(Locality.DoesNotExist):
            get_locality(uuid.uuid4())

    def test_get_all_localities_service(self):
        from .services import get_all_localities
        localities = get_all_localities()
        self.assertEqual(localities.count(), 1)

    def test_update_locality_service(self):
        from .services import update_locality
        updated = update_locality(self.locality, {"name": "Whitefield East"})
        self.assertEqual(updated.name, "Whitefield East")

    def test_delete_locality_service(self):
        from .services import delete_locality
        delete_locality(self.locality)
        with self.assertRaises(Locality.DoesNotExist):
            self.locality.refresh_from_db()

    def test_create_nearby_place_service(self):
        from .services import create_nearby_place
        data = {
            "locality": self.locality,
            "name": "Forum Mall",
            "type": "Mall",
            "distance": "1.5",
            "travel_time": 5,
            "latitude": "12.9700",
            "longitude": "77.7500",
        }
        place = create_nearby_place(data)
        self.assertEqual(place.name, "Forum Mall")
        self.assertIsNotNone(place.place_id)

    def test_get_nearby_place_service(self):
        from .services import get_nearby_place
        place = NearbyPlace.objects.create(
            locality=self.locality,
            name="Forum Mall",
            type="Mall",
            distance="1.5",
            travel_time=5,
            latitude="12.9700",
            longitude="77.7500",
        )
        retrieved = get_nearby_place(place.place_id)
        self.assertEqual(retrieved.name, "Forum Mall")

    def test_get_all_nearby_places_service(self):
        from .services import get_all_nearby_places
        NearbyPlace.objects.create(
            locality=self.locality,
            name="Forum Mall",
            type="Mall",
            distance="1.5",
            travel_time=5,
            latitude="12.9700",
            longitude="77.7500",
        )
        places = get_all_nearby_places()
        self.assertEqual(places.count(), 1)

    def test_update_nearby_place_service(self):
        from .services import update_nearby_place
        place = NearbyPlace.objects.create(
            locality=self.locality,
            name="Forum Mall",
            type="Mall",
            distance="1.5",
            travel_time=5,
            latitude="12.9700",
            longitude="77.7500",
        )
        updated = update_nearby_place(place, {"name": "Forum Value Mall", "distance": Decimal("1.80")})
        self.assertEqual(updated.name, "Forum Value Mall")
        self.assertEqual(updated.distance, Decimal("1.80"))

    def test_delete_nearby_place_service(self):
        from .services import delete_nearby_place
        place = NearbyPlace.objects.create(
            locality=self.locality,
            name="Forum Mall",
            type="Mall",
            distance="1.5",
            travel_time=5,
            latitude="12.9700",
            longitude="77.7500",
        )
        delete_nearby_place(place)
        with self.assertRaises(NearbyPlace.DoesNotExist):
            place.refresh_from_db()

    def test_create_locality_service_unsupported_city(self):
        from .services import create_locality
        data = {
            "name": "Marathahalli",
            "city": "Mumbai",
            "state": "Karnataka",
            "pincode": "560037",
            "latitude": "12.9562",
            "longitude": "77.7019",
        }
        with self.assertRaises(DjangoValidationError) as ctx:
            create_locality(data)
        self.assertEqual(ctx.exception.code, 'unsupported_city')

    def test_create_locality_service_unsupported_state(self):
        from .services import create_locality
        data = {
            "name": "Marathahalli",
            "city": "Bengaluru",
            "state": "Maharashtra",
            "pincode": "560037",
            "latitude": "12.9562",
            "longitude": "77.7019",
        }
        with self.assertRaises(DjangoValidationError) as ctx:
            create_locality(data)
        self.assertEqual(ctx.exception.code, 'unsupported_state')

    def test_update_locality_service_unsupported_city(self):
        from .services import update_locality
        with self.assertRaises(DjangoValidationError) as ctx:
            update_locality(self.locality, {"city": "Mumbai"})
        self.assertEqual(ctx.exception.code, 'unsupported_city')


from rest_framework.test import APITestCase
from django.test import override_settings
from django.urls import reverse


@override_settings(
    ROOT_URLCONF='apps.locations.urls',
    SUPPORTED_CITIES=['Ahmedabad', 'Bengaluru'],
    SUPPORTED_STATES=['Gujarat', 'Karnataka']
)
class LocationAPITests(APITestCase):
    """
    Integration tests for the REST API endpoints.
    """

    def setUp(self):
        self.locality = Locality.objects.create(
            name="Whitefield",
            city="Bengaluru",
            state="Karnataka",
            pincode="560066",
            latitude="12.9698",
            longitude="77.7499",
        )
        self.place = NearbyPlace.objects.create(
            locality=self.locality,
            name="Manipal Hospital",
            type="Hospital",
            distance="1.8",
            travel_time=8,
            latitude="12.9702",
            longitude="77.7450",
        )
        self.list_locality_url = reverse('locality-list')
        self.list_place_url = reverse('nearby-place-list')

    def test_list_localities(self):
        response = self.client.get(self.list_locality_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK if hasattr(status, 'HTTP_200_OK') else 200)
        self.assertTrue(response.data["success"])
        self.assertEqual(len(response.data["data"]), 1)

    def test_retrieve_locality_success(self):
        url = reverse('locality-detail', kwargs={'pk': self.locality.locality_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["name"], "Whitefield")

    def test_retrieve_locality_not_found(self):
        import uuid
        url = reverse('locality-detail', kwargs={'pk': uuid.uuid4()})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "Locality not found.")

    def test_create_locality_success(self):
        payload = {
            "name": "Marathahalli",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560037",
            "latitude": "12.9562",
            "longitude": "77.7019",
        }
        response = self.client.post(self.list_locality_url, data=payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["name"], "Marathahalli")

    def test_create_locality_validation_error(self):
        payload = {
            "name": "M",  # Too short
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "060037",  # Invalid pincode
            "latitude": "95.0",  # Out of range
            "longitude": "77.7019",
        }
        response = self.client.post(self.list_locality_url, data=payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "Validation failed.")

    def test_update_locality_success(self):
        url = reverse('locality-detail', kwargs={'pk': self.locality.locality_id})
        payload = {"name": "Whitefield Phase 1"}
        response = self.client.put(url, data=payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["name"], "Whitefield Phase 1")

    def test_delete_locality_success(self):
        url = reverse('locality-detail', kwargs={'pk': self.locality.locality_id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["message"], "Locality deleted successfully.")

    def test_list_nearby_places(self):
        response = self.client.get(self.list_place_url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertEqual(len(response.data["data"]), 1)

    def test_retrieve_nearby_place_success(self):
        url = reverse('nearby-place-detail', kwargs={'pk': self.place.place_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["name"], "Manipal Hospital")

    def test_retrieve_nearby_place_not_found(self):
        import uuid
        url = reverse('nearby-place-detail', kwargs={'pk': uuid.uuid4()})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "Nearby place not found.")

    def test_create_nearby_place_success(self):
        payload = {
            "locality": self.locality.locality_id,
            "name": "Forum Mall",
            "type": "Mall",
            "distance": "1.5",
            "travel_time": 5,
            "latitude": "12.9700",
            "longitude": "77.7500",
        }
        response = self.client.post(self.list_place_url, data=payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["name"], "Forum Mall")

    def test_create_nearby_place_not_found_locality(self):
        import uuid
        payload = {
            "locality": uuid.uuid4(),  # Non-existent
            "name": "Forum Mall",
            "type": "Mall",
            "distance": "1.5",
            "travel_time": 5,
            "latitude": "12.9700",
            "longitude": "77.7500",
        }
        response = self.client.post(self.list_place_url, data=payload, format='json')
        self.assertEqual(response.status_code, 404)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "Locality not found.")

    def test_update_nearby_place_success(self):
        url = reverse('nearby-place-detail', kwargs={'pk': self.place.place_id})
        payload = {"distance": "2.10", "travel_time": 10}
        response = self.client.put(url, data=payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["distance"], "2.10")

    def test_delete_nearby_place_success(self):
        url = reverse('nearby-place-detail', kwargs={'pk': self.place.place_id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["message"], "Nearby place deleted successfully.")

    def test_create_locality_unsupported_city(self):
        payload = {
            "name": "Marathahalli",
            "city": "Mumbai",
            "state": "Karnataka",
            "pincode": "560037",
            "latitude": "12.9562",
            "longitude": "77.7019",
        }
        response = self.client.post(self.list_locality_url, data=payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])
        self.assertIn("Mumbai", response.data["message"])


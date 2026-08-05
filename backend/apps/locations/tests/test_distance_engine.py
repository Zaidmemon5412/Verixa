from decimal import Decimal
from django.test import TestCase

from apps.locations.models import Locality, NearbyPlace
from apps.locations.distance_engine import (
    DistanceEngine,
    calculate_haversine_distance_m_and_km,
    validate_coordinates,
    parse_radius_meters,
)


class DistanceEngineUnitTests(TestCase):
    """
    Unit tests for Distance Engine calculations, coordinate validation, and filters.
    """

    def setUp(self):
        self.locality = Locality.objects.create(
            name="Satellite",
            city="Ahmedabad",
            state="Gujarat",
            pincode="380015",
            latitude=Decimal("23.022500"),
            longitude=Decimal("72.571400"),
        )
        self.place1 = NearbyPlace.objects.create(
            locality=self.locality,
            name="Satellite Bus Terminal",
            type="Bus Stop",
            latitude=Decimal("23.023000"),
            longitude=Decimal("72.572000"),
            address="Satellite Main Road",
            travel_time=2,
            source="OpenStreetMap",
        )
        self.place2 = NearbyPlace.objects.create(
            locality=self.locality,
            name="Shreyas High School",
            type="School",
            latitude=Decimal("23.030000"),
            longitude=Decimal("72.580000"),
            address="Ambawadi",
            travel_time=5,
            source="OpenStreetMap",
        )
        self.place3 = NearbyPlace.objects.create(
            locality=self.locality,
            name="Zydus Hospital",
            type="Hospital",
            latitude=Decimal("23.060000"),
            longitude=Decimal("72.600000"),
            address="Thaltej",
            travel_time=15,
            source="OpenStreetMap",
        )

    def test_haversine_distance_calculation(self):
        # Calculate distance between origin (23.0225, 72.5714) and place1 (23.0230, 72.5720)
        dist_m, dist_km = calculate_haversine_distance_m_and_km(23.0225, 72.5714, 23.0230, 72.5720)
        self.assertGreater(dist_m, 0)
        self.assertLess(dist_m, 200)  # ~80 meters
        self.assertEqual(dist_km, round(dist_m / 1000.0, 2))

    def test_validate_coordinates(self):
        valid, lat, lon = validate_coordinates("23.0225", "72.5714")
        self.assertTrue(valid)
        self.assertEqual(lat, 23.0225)
        self.assertEqual(lon, 72.5714)

        invalid_lat, _, _ = validate_coordinates("95.0", "72.5714")
        self.assertFalse(invalid_lat)

        invalid_none, _, _ = validate_coordinates(None, "72.5714")
        self.assertFalse(invalid_none)

    def test_parse_radius_meters(self):
        self.assertEqual(parse_radius_meters("5000"), 5000)
        self.assertEqual(parse_radius_meters("5"), 5000)  # 5 km -> 5000 meters
        self.assertEqual(parse_radius_meters("2.5"), 2500)
        self.assertIsNone(parse_radius_meters("-10"))
        self.assertIsNone(parse_radius_meters("invalid"))

    def test_distance_engine_sorting_nearest_first(self):
        places = NearbyPlace.objects.filter(locality=self.locality)
        results = DistanceEngine.calculate_distances(
            origin_lat=23.0225,
            origin_lon=72.5714,
            nearby_places=places
        )

        self.assertEqual(len(results), 3)
        # Verify nearest is place1 (Bus Stop), then place2 (School), then place3 (Hospital)
        self.assertEqual(results[0]["name"], "Satellite Bus Terminal")
        self.assertEqual(results[1]["name"], "Shreyas High School")
        self.assertEqual(results[2]["name"], "Zydus Hospital")
        self.assertLessEqual(results[0]["distance_m"], results[1]["distance_m"])
        self.assertLessEqual(results[1]["distance_m"], results[2]["distance_m"])

    def test_distance_engine_category_filtering(self):
        places = NearbyPlace.objects.filter(locality=self.locality)
        results = DistanceEngine.calculate_distances(
            origin_lat=23.0225,
            origin_lon=72.5714,
            nearby_places=places,
            category="Hospital"
        )
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["category"], "Hospital")

    def test_distance_engine_radius_filtering(self):
        places = NearbyPlace.objects.filter(locality=self.locality)
        # Search radius = 1000 meters (1 km)
        results = DistanceEngine.calculate_distances(
            origin_lat=23.0225,
            origin_lon=72.5714,
            nearby_places=places,
            radius=1000
        )
        # Should only include place1 (~80m) and place2 (~1.2km excluded)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "Satellite Bus Terminal")

    def test_distance_engine_invalid_origin_coordinates(self):
        places = NearbyPlace.objects.filter(locality=self.locality)
        results = DistanceEngine.calculate_distances(
            origin_lat=None,
            origin_lon=72.5714,
            nearby_places=places
        )
        self.assertEqual(results, [])

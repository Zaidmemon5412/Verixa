import uuid
from django.core.management.base import BaseCommand
from apps.locations.models import Locality
from apps.properties.models import Property

LOCALITY_COORDINATES = {
    "Chandkheda": {"lat": 23.111558, "lng": 72.574001, "pin": "382424"},
    "Thaltej": {"lat": 23.050000, "lng": 72.500000, "pin": "380059"},
    "Satellite": {"lat": 23.030000, "lng": 72.516700, "pin": "380015"},
    "Sola": {"lat": 23.076700, "lng": 72.525000, "pin": "380060"},
    "Gota": {"lat": 23.102200, "lng": 72.535000, "pin": "382481"},
    "Science City": {"lat": 23.085000, "lng": 72.502000, "pin": "380060"},
    "Jagatpur": {"lat": 23.118000, "lng": 72.545000, "pin": "382470"},
    "Sindhu Bhavan Road": {"lat": 23.042000, "lng": 72.498000, "pin": "380059"},
    "Nigam Nagar": {"lat": 23.110444, "lng": 72.591892, "pin": "382424"},
    "D Cabin": {"lat": 23.034875, "lng": 72.580120, "pin": "382424"},
    "Godrej Garden City": {"lat": 23.118762, "lng": 72.555953, "pin": "382470"},
    "Science Park": {"lat": 23.087000, "lng": 72.504000, "pin": "380060"},
    "Bhaikakanagar": {"lat": 23.048000, "lng": 72.501000, "pin": "380059"}
}

def determine_locality_name(address, prop_name=""):
    text = f"{address} {prop_name}".lower()
    if 'sindhu bhavan' in text: return 'Sindhu Bhavan Road'
    if 'science city' in text: return 'Science City'
    if 'science park' in text: return 'Science Park'
    if 'bhaikaka' in text: return 'Bhaikakanagar'
    if 'thaltej' in text: return 'Thaltej'
    if 'satellite' in text: return 'Satellite'
    if 'sola' in text: return 'Sola'
    if 'gota' in text: return 'Gota'
    if 'jagatpur' in text: return 'Jagatpur'
    if 'godrej garden city' in text or 'godrej' in text: return 'Godrej Garden City'
    if 'd cabin' in text: return 'D Cabin'
    if 'nigam nagar' in text: return 'Nigam Nagar'
    if 'chandkheda' in text: return 'Chandkheda'
    return 'Chandkheda'

class Command(BaseCommand):
    help = "Seeds database Locality models and links all properties to their corresponding locality foreign keys in Django Admin."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting Locality seeding & Property FK linkage..."))

        locality_objs = {}
        for loc_name, info in LOCALITY_COORDINATES.items():
            loc, created = Locality.objects.get_or_create(
                name=loc_name,
                city="Ahmedabad",
                state="Gujarat",
                defaults={
                    "pincode": info["pin"],
                    "latitude": info["lat"],
                    "longitude": info["lng"],
                    "description": f"{loc_name} residential micro-market, Ahmedabad, Gujarat."
                }
            )
            locality_objs[loc_name] = loc
            action = "Created" if created else "Retrieved"
            self.stdout.write(f"  [{action}] Locality: {loc.name} ({loc.locality_id})")

        # Link all properties in DB to their true locality object
        properties = Property.objects.all()
        updated_count = 0
        for prop in properties:
            target_name = determine_locality_name(prop.address or "", prop.property_name or "")
            target_loc = locality_objs.get(target_name) or locality_objs["Chandkheda"]
            
            if prop.locality != target_loc:
                prop.locality = target_loc
                prop.save(update_fields=['locality'])
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded {len(locality_objs)} Localities and updated {updated_count} Property locality foreign keys!"
        ))

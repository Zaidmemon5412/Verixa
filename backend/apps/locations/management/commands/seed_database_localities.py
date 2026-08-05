import uuid
from django.core.management.base import BaseCommand
from apps.locations.models import Locality
from apps.properties.models import Property

LOCALITY_COORDINATES = {
    "Satellite": {"lat": 23.030000, "lng": 72.516700, "pin": "380015"},
    "Thaltej": {"lat": 23.050000, "lng": 72.500000, "pin": "380059"},
    "Gota": {"lat": 23.102200, "lng": 72.535000, "pin": "382481"},
    "Chandkheda": {"lat": 23.111558, "lng": 72.574001, "pin": "382424"},
    "Sola": {"lat": 23.076700, "lng": 72.525000, "pin": "380060"}
}

def determine_locality_name(address, prop_name=""):
    text = f"{address} {prop_name}".lower()
    if 'sindhu bhavan' in text or 'bhaikaka' in text or 'thaltej' in text:
        return 'Thaltej'
    if 'science city' in text or 'science park' in text or 'sola' in text:
        return 'Sola'
    if 'satellite' in text:
        return 'Satellite'
    if 'jagatpur' in text or 'godrej' in text or 'gota' in text:
        return 'Gota'
    if 'd cabin' in text or 'nigam nagar' in text or 'chandkheda' in text:
        return 'Chandkheda'
    return 'Chandkheda'

class Command(BaseCommand):
    help = "Seeds database Locality models and links all properties strictly to the 5 core target localities (Sola, Gota, Chandkheda, Satellite, Thaltej)."

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

        # Re-link all properties in DB to their true locality object
        properties = Property.objects.all()
        updated_count = 0
        for prop in properties:
            target_name = determine_locality_name(prop.address or "", prop.property_name or "")
            target_loc = locality_objs.get(target_name) or locality_objs["Chandkheda"]
            
            if prop.locality != target_loc:
                prop.locality = target_loc
                prop.save(update_fields=['locality'])
                updated_count += 1

        # Delete any localities not in the 5 core target localities
        deleted_cnt, _ = Locality.objects.exclude(name__in=LOCALITY_COORDINATES.keys()).delete()
        self.stdout.write(f"Cleaned up {deleted_cnt} non-target locality records.")

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded exactly {len(locality_objs)} Localities ({', '.join(locality_objs.keys())}) and updated {updated_count} Property locality foreign keys!"
        ))

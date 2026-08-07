import os
import sys
import django

# Initialize Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'verixa_core.settings.base')
django.setup()

from apps.locations.models import Locality, NearbyPlace
from apps.locations.services import sync_locality_nearby_places
from apps.properties.models import Property

def run():
    print("=" * 60)
    print("Starting OpenStreetMap Nearby Places Generation")
    print("=" * 60)

    localities = Locality.objects.all()
    print(f"Found {localities.count()} localities in database.")

    total_imported = 0
    total_skipped = 0

    for loc in localities:
        print(f"Syncing nearby places for locality: {loc.name} ({loc.city})...")
        stats = sync_locality_nearby_places(locality=loc, radius_km=5.0, force=True)
        print(f"  -> {loc.name}: {stats.get('imported')} imported, {stats.get('skipped')} skipped, {stats.get('failed')} failed")
        total_imported += stats.get("imported", 0)
        total_skipped += stats.get("skipped", 0)

    maninagar = Locality.objects.filter(name__icontains="Maninagar").first()
    if maninagar:
        nb_count = NearbyPlace.objects.filter(locality=maninagar).count()
        cats = list(NearbyPlace.objects.filter(locality=maninagar).values_list("type", flat=True).distinct())
        print(f"\n[Maninagar Nearby Places] Total: {nb_count} places populated across categories: {cats}")

    print("=" * 60)
    print(f"Nearby Places Generation Complete. Total Imported: {total_imported}")
    print("=" * 60)

if __name__ == "__main__":
    run()

import time
import logging
from django.core.management.base import BaseCommand
# pyrefly: ignore [missing-import]
from apps.locations.models import Locality
# pyrefly: ignore [missing-import]
from apps.locations.services import sync_locality_nearby_places

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = (
        "Automatically populates the NearbyPlace database table locality-wise "
        "by searching OpenStreetMap (Overpass API) within a configurable radius."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--locality-id",
            type=str,
            default=None,
            help="Filter import for a specific Locality UUID."
        )
        parser.add_argument(
            "--city",
            type=str,
            default=None,
            help="Filter import for localities within a specific city."
        )
        parser.add_argument(
            "--radius",
            type=float,
            default=5.0,
            help="Configurable search radius in kilometers (default: 5.0 KM)."
        )
        parser.add_argument(
            "--force",
            action="store_true",
            default=False,
            help="Force re-fetch and update existing NearbyPlace records."
        )

    def handle(self, *args, **options):
        start_time = time.time()
        locality_id = options.get("locality_id")
        city = options.get("city")
        radius_km = options.get("radius", 5.0)
        force = options.get("force", False)

        self.stdout.write(
            self.style.SUCCESS(
                f"Starting Nearby Places Import (OSM Engine):\n"
                f" - Search Radius : {radius_km} KM\n"
                f" - Target City   : {city or 'All Cities'}\n"
                f" - Locality ID   : {locality_id or 'All Localities'}\n"
                f" - Force Update  : {force}\n"
            )
        )

        # Filter Localities
        localities_qs = Locality.objects.all()
        if locality_id:
            localities_qs = localities_qs.filter(locality_id=locality_id)
        if city:
            localities_qs = localities_qs.filter(city__iexact=city)

        total_localities = localities_qs.count()
        if total_localities == 0:
            self.stdout.write(self.style.WARNING("No localities found matching the specified criteria."))
            return

        total_imported_places = 0
        total_duplicate_places = 0
        total_failed_requests = 0

        self.stdout.write(self.style.NOTICE(f"Processing {total_localities} localities..."))

        for idx, locality in enumerate(localities_qs, start=1):
            self.stdout.write(
                f"[{idx}/{total_localities}] Syncing places for locality: "
                f"{locality.name}, {locality.city} ({locality.latitude}, {locality.longitude})..."
            )
            
            loc_stats = sync_locality_nearby_places(
                locality=locality,
                radius_km=radius_km,
                force=force
            )

            imported = loc_stats.get("imported", 0)
            skipped = loc_stats.get("skipped", 0)
            failed = loc_stats.get("failed", 0)

            total_imported_places += imported
            total_duplicate_places += skipped
            total_failed_requests += failed

            if failed > 0:
                self.stdout.write(
                    self.style.WARNING(
                        f"  -> Finished {locality.name}: {imported} imported, "
                        f"{skipped} skipped duplicates, {failed} failed request(s)."
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  -> Finished {locality.name}: {imported} imported, "
                        f"{skipped} skipped duplicates."
                    )
                )

            # Brief pause between locality API calls to respect Overpass API rate limits
            if idx < total_localities:
                time.sleep(1.0)

        processing_time = round(time.time() - start_time, 2)

        # Print Formatted Final Import Report
        self.stdout.write("\n" + "=" * 55)
        self.stdout.write(self.style.SUCCESS("         NEARBY PLACES IMPORT REPORT"))
        self.stdout.write("=" * 55)
        self.stdout.write(f"  Total Localities       : {total_localities}")
        self.stdout.write(f"  Imported Places        : {total_imported_places}")
        self.stdout.write(f"  Duplicate Places       : {total_duplicate_places}")
        self.stdout.write(f"  Failed Requests        : {total_failed_requests}")
        self.stdout.write(f"  Processing Time        : {processing_time} seconds")
        self.stdout.write("=" * 55 + "\n")

"""
Automated Data Consistency Audit for Verixa Locality Insights
Verifies 100% field-by-field equality between:
1. GET /locations/localities/ (list endpoint)
2. GET /locations/localities/<id>/analytics/ (analytics endpoint)
3. LocalityScorecardEngine calculations directly
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'verixa_core.settings')
import django
django.setup()

from rest_framework.test import APIClient
from apps.locations.models import Locality
from apps.locations.scorecard_engine import LocalityScorecardEngine

FIELDS_TO_COMPARE = [
    'avgPrice',
    'avgPriceNum',
    'psf',
    'psfNum',
    'rentalYield',
    'growthScore',
    'traffic',
    'trafficDesc',
    'safety',
    'safetyDesc',
    'scorecard',
    'verdict',
    'verdictSummary',
    'properties_count',
    'infra',
    'priceTrends',
]

def run_audit():
    client = APIClient()
    list_response = client.get('/api/locations/localities/')
    if list_response.status_code != 200:
        print(f"FAILED: /api/locations/localities/ returned HTTP {list_response.status_code}")
        sys.exit(1)
        
    list_data = list_response.json().get('data', [])
    print(f"Retrieved {len(list_data)} localities from list endpoint.")

    target_localities = Locality.objects.all()
    mismatches = 0
    total_checks = 0

    for loc in target_localities:
        loc_id = str(loc.locality_id)
        engine_metrics = LocalityScorecardEngine(loc).calculate_metrics_and_scores()
        
        # Find item in list response
        list_item = next((item for item in list_data if str(item.get('locality_id')) == loc_id or item.get('name') == loc.name), None)
        if not list_item:
            print(f"FAILED: Locality '{loc.name}' (id={loc_id}) missing from list endpoint output!")
            mismatches += 1
            continue

        # Fetch detail analytics response
        analytics_response = client.get(f'/api/locations/localities/{loc_id}/analytics/')
        if analytics_response.status_code != 200:
            print(f"FAILED: Locality '{loc.name}' analytics endpoint returned HTTP {analytics_response.status_code}")
            mismatches += 1
            continue
            
        analytics_item = analytics_response.json()

        # Field-by-field audit
        for field in FIELDS_TO_COMPARE:
            total_checks += 1
            val_list = list_item.get(field)
            val_analytics = analytics_item.get(field)
            val_engine = engine_metrics.get(field)

            if val_list != val_analytics or val_list != val_engine:
                print(f"MISMATCH in Locality '{loc.name}' for field '{field}':")
                print(f"  List API     : {val_list}")
                print(f"  Analytics API: {val_analytics}")
                print(f"  Engine Direct: {val_engine}")
                mismatches += 1

    print("=" * 65)
    print(f"AUDIT SUMMARY: Checked {total_checks} fields across {len(target_localities)} localities.")
    if mismatches == 0:
        print(">>> SUCCESS: 100% PERFECT FIELD-BY-FIELD DATA PARITY ACHIEVED <<<")
    else:
        print(f">>> FAILURE: Found {mismatches} data mismatches! <<<")
        sys.exit(1)
    print("=" * 65)

run_audit()

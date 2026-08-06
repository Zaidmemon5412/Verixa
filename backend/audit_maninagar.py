import os
import sys
import uuid
import json
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'verixa_core.settings.base')
django.setup()

import pandas as pd
from django.db import models
from apps.properties.models import Property, PropertyImage, PropertyScore, PropertyLegal
from apps.locations.models import Locality, NearbyPlace
from apps.builders.models import Builder

def audit():
    results = {}

    # PHASE 1: DATABASE VALIDATION
    maninagar_props = Property.objects.filter(locality__name__icontains="Maninagar")
    prop_count = maninagar_props.count()
    
    maninagar_imgs = PropertyImage.objects.filter(property__locality__name__icontains="Maninagar")
    img_count = maninagar_imgs.count()

    pids = list(maninagar_props.values_list('property_id', flat=True))
    unique_pids = len(set(pids))
    duplicate_pids = len(pids) - unique_pids

    orphan_imgs = PropertyImage.objects.filter(property__isnull=True).count()

    props_with_scores = PropertyScore.objects.filter(property__in=maninagar_props).count()
    props_with_legal = PropertyLegal.objects.filter(property__in=maninagar_props).count()

    results['phase_1_database'] = {
        'total_properties': prop_count,
        'total_images': img_count,
        'duplicate_property_ids': duplicate_pids,
        'orphan_images': orphan_imgs,
        'properties_with_scores': props_with_scores,
        'properties_with_legal': props_with_legal,
        'pass': (prop_count == 96 and img_count == 375 and duplicate_pids == 0 and orphan_imgs == 0)
    }

    # PHASE 2: IMAGE / CLOUDINARY VALIDATION
    urls = list(maninagar_imgs.values_list('image_url', flat=True))
    valid_urls = [u for u in urls if u and (u.startswith('http://') or u.startswith('https://'))]
    local_urls = [u for u in urls if u and not u.startswith('http')]
    missing_urls = [u for u in urls if not u]

    results['phase_2_images'] = {
        'total_images': len(urls),
        'valid_http_urls': len(valid_urls),
        'local_path_urls': len(local_urls),
        'missing_urls': len(missing_urls),
        'pass': (len(valid_urls) == 375 and len(local_urls) == 0 and len(missing_urls) == 0)
    }

    # PHASE 3: DATA PRESERVATION AUDIT
    df_src_p = pd.read_csv(r"d:\Verixa\Maninagar.csv")
    df_src_img = pd.read_csv(r"d:\Verixa\Maninagar_img.csv")

    src_p_count = len(df_src_p)
    src_img_count = len(df_src_img)

    results['phase_3_preservation'] = {
        'source_csv_properties': src_p_count,
        'database_properties': prop_count,
        'properties_lost': src_p_count - prop_count,
        'source_csv_images': src_img_count,
        'database_images': img_count,
        'images_lost': src_img_count - img_count,
        'pass': (src_p_count == prop_count and src_img_count == img_count)
    }

    # PHASE 4 & 5: ML & LEGAL DATA AUDIT
    sample_scores = PropertyScore.objects.filter(property__in=maninagar_props).first()
    sample_legal = PropertyLegal.objects.filter(property__in=maninagar_props).first()

    results['phase_4_5_ml_legal'] = {
        'score_predicted_price': str(sample_scores.predicted_price) if sample_scores else None,
        'score_confidence': sample_scores.confidence_score if sample_scores else None,
        'legal_status': sample_legal.verification_status if sample_legal else None,
        'survey_number': sample_legal.survey_number if sample_legal else None,
        'khata_number': sample_legal.khata_number if sample_legal else None,
        'na_converted': sample_legal.na_converted if sample_legal else None,
        'pass': (sample_scores is not None and sample_legal is not None)
    }

    # PHASE 6: MAP & COORDINATES VALIDATION
    coords = list(maninagar_props.values_list('latitude', 'longitude'))
    valid_coords = [c for c in coords if c[0] is not None and c[1] is not None and 20 <= float(c[0]) <= 25 and 70 <= float(c[1]) <= 75]
    unique_coords = len(set(coords))

    results['phase_6_coordinates'] = {
        'total_properties': len(coords),
        'valid_coordinates_count': len(valid_coords),
        'unique_coordinates_count': unique_coords,
        'identical_coords_all': (unique_coords == 1),
        'pass': (len(valid_coords) == 96 and unique_coords > 1)
    }

    # PHASE 7: NEARBY PLACES VALIDATION
    loc = Locality.objects.filter(name__icontains="Maninagar").first()
    raw_nearby = list(loc.nearby_places.values('name', 'type', 'distance_km')) if loc else []
    nearby_places = [{'name': p['name'], 'type': p['type'], 'distance_km': float(p['distance_km'])} for p in raw_nearby]

    results['phase_7_nearby_places'] = {
        'locality_found': loc.name if loc else None,
        'total_nearby_places': len(nearby_places),
        'place_categories': list(set(p['type'] for p in nearby_places)),
        'sample_places': nearby_places[:3],
        'pass': (len(nearby_places) >= 8)
    }

    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    audit()

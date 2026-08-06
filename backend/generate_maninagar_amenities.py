import os
import sys
import django
import pandas as pd

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'verixa_core.settings.base')
django.setup()

from apps.properties.models import Property, Amenity, PropertyAmenity

def run():
    standard_amenities = [
        '24/7 Water Supply',
        '24x7 Security & CCTV',
        'Car Parking',
        "Children's Play Area",
        'Clubhouse',
        'Fire Fighting Systems',
        'Gated Community',
        'Gymnasium',
        'Intercom Facility',
        'Landscaped Garden',
        'Lifts / Elevator',
        'Power Backup',
        'Visitor Parking',
        'Rainwater Harvesting'
    ]

    amenity_objs = {}
    for name in standard_amenities:
        obj, _ = Amenity.objects.get_or_create(amenity_name=name)
        amenity_objs[name] = obj

    maninagar_props = Property.objects.filter(locality__name__icontains='Maninagar')

    created_count = 0
    export_rows = []

    for p in maninagar_props:
        assigned = ['24/7 Water Supply', 'Car Parking', '24x7 Security & CCTV']
        
        desc = (p.description or '').lower()
        total_floors = p.total_floors or 4
        
        if total_floors >= 3 or 'lift' in desc or 'elevator' in desc:
            assigned.append('Lifts / Elevator')
        if 'garden' in desc or 'park' in desc:
            assigned.append('Landscaped Garden')
        if 'club' in desc or p.bhk >= 3:
            assigned.append("Children's Play Area")
            assigned.append('Power Backup')
        if p.bhk >= 3 or total_floors >= 5:
            assigned.append('Fire Fighting Systems')
            assigned.append('Gated Community')
        if p.bhk >= 4 or total_floors >= 7:
            assigned.append('Gymnasium')
            assigned.append('Intercom Facility')
            assigned.append('Visitor Parking')

        assigned = list(set(assigned))

        for a_name in assigned:
            a_obj = amenity_objs[a_name]
            pa, created = PropertyAmenity.objects.get_or_create(
                property=p,
                amenity=a_obj
            )
            if created:
                created_count += 1
            
            export_rows.append({
                'property_id': str(p.property_id),
                'property_name': p.property_name,
                'amenity_id': str(a_obj.amenity_id),
                'amenity_name': a_obj.amenity_name
            })

    print(f'Successfully created {created_count} PropertyAmenity mappings for Maninagar!')

    df_amenities = pd.DataFrame(export_rows)
    csv_path = r'd:\Verixa\Maninagar_amenities.csv'
    df_amenities.to_csv(csv_path, index=False)
    print(f'Exported {len(df_amenities)} amenity rows to: {csv_path}')

if __name__ == '__main__':
    run()

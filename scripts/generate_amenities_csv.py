import pandas as pd
import uuid
import random
import os

def generate_property_amenities():
    input_path = r'd:\Verixa\combined_property_data.csv'
    output_path = r'd:\Verixa\properties_amenity.csv'

    df_props = pd.read_csv(input_path)
    unique_prop_ids = df_props['property_id'].dropna().unique()

    # Catalog of standard real estate amenities
    AMENITIES = [
        'Gymnasium',
        'Swimming Pool',
        '24x7 Security & CCTV',
        'Power Backup',
        'Clubhouse',
        "Children's Play Area",
        'Landscaped Garden',
        'Intercom Facility',
        'Fire Fighting Systems',
        'Car Parking',
        'Lifts / Elevator',
        'Jogging & Cycling Track',
        'Rainwater Harvesting',
        'Indoor Games Room',
        'Gated Community',
        'Maintenance Staff',
        'Multipurpose Hall',
        'Visitor Parking',
        '24/7 Water Supply',
        'Sewage Treatment Plant'
    ]

    # Generate fixed deterministic UUIDs for each amenity name
    AMENITY_MAP = {
        name: str(uuid.uuid5(uuid.NAMESPACE_DNS, f'verixa.amenity.{name}')) 
        for name in AMENITIES
    }

    rows = []
    for prop_id in unique_prop_ids:
        # Seed random generator with property_id for reproducible selection
        rng = random.Random(str(prop_id))
        selected_amenities = rng.sample(AMENITIES, 5)
        
        for amenity_name in selected_amenities:
            rows.append({
                'property_id': prop_id,
                'amenity_id': AMENITY_MAP[amenity_name],
                'amenity_name': amenity_name
            })

    df_out = pd.DataFrame(rows)
    df_out.to_csv(output_path, index=False)

    print(f"Successfully generated {output_path}")
    print(f"Total rows: {len(df_out)}")
    print(f"Unique properties: {df_out['property_id'].nunique()}")
    print("\nFirst 10 rows preview:")
    print(df_out.head(10).to_string())

if __name__ == '__main__':
    generate_property_amenities()

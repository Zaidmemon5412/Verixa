import os
import json
import uuid
import pandas as pd
import numpy as np
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime

def load_env(env_path):
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env_vars[k.strip()] = v.strip().strip('"').strip("'")
    return env_vars

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    workspace_dir = os.path.dirname(root_dir) if os.path.basename(root_dir) == 'backend' else root_dir
    
    # Try finding .env file
    env_file = os.path.join(workspace_dir, '.env')
    if not os.path.exists(env_file):
        env_file = os.path.join(root_dir, '.env')

    env_vars = load_env(env_file)
    db_host = env_vars.get('DB_HOST', '127.0.0.1')
    db_port = int(env_vars.get('DB_PORT', 5432))
    db_name = env_vars.get('DB_NAME', 'verixa_db')
    db_user = env_vars.get('DB_USER', 'postgres')
    db_pass = env_vars.get('DB_PASSWORD', 'Samil86.')

    print("==================================================")
    print("      Verixa Exact CSV to PostgreSQL Importer     ")
    print("==================================================")
    print(f" Target Host: {db_host}:{db_port}")
    print(f" Target DB:   {db_name}")
    print(f" User:        {db_user}")
    print("==================================================")

    conn = psycopg2.connect(
        host=db_host,
        port=db_port,
        dbname=db_name,
        user=db_user,
        password=db_pass
    )
    conn.autocommit = False
    cur = conn.cursor()

    try:
        # Search directory for CSVs
        csv_dir = workspace_dir
        
        # 1. BUILDERS_BUILDER
        b_file = os.path.join(csv_dir, 'builders_builder.csv')
        if os.path.exists(b_file):
            print(f"\n[1/6] Importing {os.path.basename(b_file)} -> builders_builder...")
            df_b = pd.read_csv(b_file)
            df_b = df_b.replace({np.nan: None})
            
            records = []
            for _, r in df_b.iterrows():
                records.append((
                    str(r['created_at']),
                    str(r['updated_at']),
                    str(r['builder_id']),
                    str(r['builder_name']),
                    str(r['company_name']),
                    str(r['rera_registration_no']),
                    str(r['office_address']),
                    str(r['phone']),
                    str(r['email']),
                    r['website'],
                    int(r['established_year']),
                    r['about']
                ))
            
            sql = """
                INSERT INTO builders_builder (
                    created_at, updated_at, builder_id, builder_name, company_name, 
                    rera_registration_no, office_address, phone, email, website, 
                    established_year, about
                ) VALUES %s
                ON CONFLICT (builder_id) DO UPDATE SET
                    builder_name = EXCLUDED.builder_name,
                    company_name = EXCLUDED.company_name,
                    phone = EXCLUDED.phone,
                    email = EXCLUDED.email,
                    updated_at = EXCLUDED.updated_at;
            """
            execute_values(cur, sql, records)
            print(f"  --> Inserted/Updated {len(records)} records in builders_builder.")

        # 2. BUILDERS_BUILDERPROJECT
        bp_file = os.path.join(csv_dir, 'builders_builderproject.csv')
        if os.path.exists(bp_file):
            print(f"\n[2/6] Importing {os.path.basename(bp_file)} -> builders_builderproject...")
            df_bp = pd.read_csv(bp_file)
            df_bp = df_bp.replace({np.nan: None})

            records = []
            for _, r in df_bp.iterrows():
                amenities_raw = r.get('amenities')
                if isinstance(amenities_raw, str) and amenities_raw.strip():
                    amenities_list = [a.strip() for a in amenities_raw.split('|') if a.strip()]
                else:
                    amenities_list = []

                # Convert numeric fields
                lat = float(r['latitude']) if r.get('latitude') is not None else None
                lng = float(r['longitude']) if r.get('longitude') is not None else None

                records.append((
                    str(r['created_at']),
                    str(r['updated_at']),
                    str(r['project_id']),
                    str(r['project_name']),
                    r.get('property_type'),
                    r.get('transaction_type'),
                    r.get('project_status'),
                    r.get('rera_number'),
                    r.get('launch_date'),
                    r.get('completion_date'),
                    r.get('construction_type'),
                    r.get('land_area'),
                    r.get('price'),
                    r.get('price_per_sqft'),
                    r.get('primary_bhk'),
                    r.get('bhk_variants'),
                    r.get('carpet_area'),
                    r.get('super_builtup_area'),
                    r.get('builtup_area'),
                    r.get('project_description'),
                    json.dumps(amenities_list),
                    r.get('website_url'),
                    lat,
                    lng,
                    r.get('locality'),
                    r.get('city'),
                    r.get('state'),
                    r.get('pincode'),
                    r.get('location'),
                    str(r['builder_id'])
                ))

            sql = """
                INSERT INTO builders_builderproject (
                    created_at, updated_at, project_id, project_name, property_type,
                    transaction_type, project_status, rera_number, launch_date, completion_date,
                    construction_type, land_area, price, price_per_sqft, primary_bhk,
                    bhk_variants, carpet_area, super_builtup_area, builtup_area, project_description,
                    amenities, website_url, latitude, longitude, locality, city, state,
                    pincode, location, builder_id
                ) VALUES %s
                ON CONFLICT (project_id) DO UPDATE SET
                    project_name = EXCLUDED.project_name,
                    price = EXCLUDED.price,
                    updated_at = EXCLUDED.updated_at;
            """
            execute_values(cur, sql, records)
            print(f"  --> Inserted/Updated {len(records)} records in builders_builderproject.")

        # 3. BUILDER_BUILDERIMAGES -> builders_builderprojectimage
        bi_file = os.path.join(csv_dir, 'builder_builderimages.csv')
        if os.path.exists(bi_file):
            print(f"\n[3/6] Importing {os.path.basename(bi_file)} -> builders_builderprojectimage...")
            df_bi = pd.read_csv(bi_file)
            df_bi = df_bi.replace({np.nan: None})

            records = []
            for _, r in df_bi.iterrows():
                is_primary = str(r['is_primary']).lower() in ['true', '1', 'yes', 't']
                records.append((
                    str(r['image_id']),
                    str(r['image_url']),
                    int(r['display_order']),
                    is_primary,
                    str(r['created_at']),
                    str(r['project_id'])
                ))

            sql = """
                INSERT INTO builders_builderprojectimage (
                    image_id, image_url, display_order, is_primary, created_at, project_id
                ) VALUES %s
                ON CONFLICT (image_id) DO UPDATE SET
                    image_url = EXCLUDED.image_url,
                    display_order = EXCLUDED.display_order,
                    is_primary = EXCLUDED.is_primary;
            """
            execute_values(cur, sql, records)
            print(f"  --> Inserted/Updated {len(records)} records in builders_builderprojectimage.")

        # 4. PRE-CREATE MISSING LOCALITIES
        p_file = os.path.join(csv_dir, 'properties_property.csv')
        if os.path.exists(p_file):
            df_p = pd.read_csv(p_file)
            loc_ids = df_p['locality_id'].dropna().unique()
            now_str = datetime.utcnow().isoformat()
            
            cur.execute("SELECT locality_id FROM locations_locality")
            existing_loc_ids = set(str(row[0]) for row in cur.fetchall())

            loc_records = []
            for idx, lid in enumerate(loc_ids):
                lid_str = str(lid)
                if lid_str not in existing_loc_ids:
                    loc_records.append((
                        now_str, now_str, lid_str, f'Chandkheda Sector {idx+1}', 'Ahmedabad', 'Gujarat', '382424', 23.114818, 72.565680, 'Chandkheda locality sector'
                    ))
            
            if loc_records:
                loc_sql = """
                    INSERT INTO locations_locality (
                        created_at, updated_at, locality_id, name, city, state, pincode, latitude, longitude, description
                    ) VALUES %s
                    ON CONFLICT (locality_id) DO NOTHING;
                """
                execute_values(cur, loc_sql, loc_records)
                print(f"\nEnsured {len(loc_records)} missing localities exist in locations_locality.")

            # 4B. PROPERTIES_PROPERTY
            print(f"\n[4/6] Importing {os.path.basename(p_file)} -> properties_property...")
            df_p = df_p.replace({np.nan: None})

            records = []
            for _, r in df_p.iterrows():
                def parse_date(v):
                    if not v or str(v).lower() in ['nan', 'none', 'unspecified']:
                        return None
                    return str(v)

                records.append((
                    str(r['created_at']),
                    str(r['updated_at']),
                    str(r['property_id']),
                    r.get('rera_number'),
                    str(r['property_name']),
                    str(r['property_type']),
                    str(r['transaction_type']),
                    float(r['price']),
                    float(r['price_per_sqft']),
                    int(r['bhk']),
                    float(r['carpet_area']),
                    float(r['builtup_area']) if r.get('builtup_area') is not None else None,
                    float(r['land_area']) if r.get('land_area') is not None else None,
                    str(r['address']),
                    float(r['latitude']),
                    float(r['longitude']),
                    str(r['status']),
                    parse_date(r.get('launch_date')),
                    parse_date(r.get('completion_date')),
                    r.get('description'),
                    str(r['builder_id']) if r.get('builder_id') else None,
                    str(r['locality_id']),
                    int(r['balconies']) if r.get('balconies') is not None else None,
                    int(r['bathrooms']) if r.get('bathrooms') is not None else None,
                    int(r['construction_age']) if r.get('construction_age') is not None else None,
                    r.get('facing'),
                    int(r['floor_number']) if r.get('floor_number') is not None else None,
                    r.get('furnishing_status'),
                    int(r['parking_spaces']) if r.get('parking_spaces') is not None else None,
                    float(r['super_builtup_area']) if r.get('super_builtup_area') is not None else None,
                    int(r['total_floors']) if r.get('total_floors') is not None else None,
                ))

            sql = """
                INSERT INTO properties_property (
                    created_at, updated_at, property_id, rera_number, property_name,
                    property_type, transaction_type, price, price_per_sqft, bhk,
                    carpet_area, builtup_area, land_area, address, latitude,
                    longitude, status, launch_date, completion_date, description,
                    builder_id, locality_id, balconies, bathrooms, construction_age,
                    facing, floor_number, furnishing_status, parking_spaces, super_builtup_area,
                    total_floors
                ) VALUES %s
                ON CONFLICT (property_id) DO UPDATE SET
                    property_name = EXCLUDED.property_name,
                    price = EXCLUDED.price,
                    updated_at = EXCLUDED.updated_at;
            """
            execute_values(cur, sql, records)
            print(f"  --> Inserted/Updated {len(records)} records in properties_property.")

        # 5. PROPERTIES_PROPERTYIMAGES -> properties_propertyimage
        pi_file = os.path.join(csv_dir, 'properties_propertyimages.csv')
        if os.path.exists(pi_file):
            print(f"\n[5/6] Importing {os.path.basename(pi_file)} -> properties_propertyimage...")
            df_pi = pd.read_csv(pi_file)
            df_pi = df_pi.replace({np.nan: None})

            records = []
            for _, r in df_pi.iterrows():
                is_primary = str(r['is_primary']).lower() in ['true', '1', 'yes', 't']
                records.append((
                    str(r['image_id']),
                    str(r['image_url']),
                    str(r['image_type']),
                    int(r['display_order']),
                    is_primary,
                    str(r['property_id'])
                ))

            sql = """
                INSERT INTO properties_propertyimage (
                    image_id, image_url, image_type, display_order, is_primary, property_id
                ) VALUES %s
                ON CONFLICT (image_id) DO UPDATE SET
                    image_url = EXCLUDED.image_url,
                    display_order = EXCLUDED.display_order,
                    is_primary = EXCLUDED.is_primary;
            """
            execute_values(cur, sql, records)
            print(f"  --> Inserted/Updated {len(records)} records in properties_propertyimage.")

        # 6. PROPERTIES_AMENITY & PROPERTIES_PROPERTYAMENITY
        pa_file = os.path.join(csv_dir, 'properties_amenity.csv')
        if os.path.exists(pa_file):
            print(f"\n[6/6] Importing {os.path.basename(pa_file)} -> properties_amenity & properties_propertyamenity...")
            df_pa = pd.read_csv(pa_file)
            df_pa = df_pa.replace({np.nan: None})

            # Insert unique amenities
            unique_amenities = df_pa[['amenity_id', 'amenity_name']].drop_duplicates()
            amenity_records = []
            for _, r in unique_amenities.iterrows():
                amenity_records.append((
                    str(r['amenity_id']),
                    str(r['amenity_name'])
                ))

            amenity_sql = """
                INSERT INTO properties_amenity (amenity_id, amenity_name)
                VALUES %s
                ON CONFLICT (amenity_id) DO UPDATE SET
                    amenity_name = EXCLUDED.amenity_name;
            """
            execute_values(cur, amenity_sql, amenity_records)
            print(f"  --> Inserted/Updated {len(amenity_records)} records in properties_amenity.")

            # Truncate existing rows in properties_propertyamenity to ensure clean re-import
            cur.execute("TRUNCATE TABLE properties_propertyamenity RESTART IDENTITY CASCADE;")

            prop_amenity_records = []
            seen_pairs = set()
            for _, r in df_pa.iterrows():
                pid = str(r['property_id'])
                aid = str(r['amenity_id'])
                if (pid, aid) not in seen_pairs:
                    seen_pairs.add((pid, aid))
                    prop_amenity_records.append((pid, aid))

            prop_amenity_sql = """
                INSERT INTO properties_propertyamenity (property_id, amenity_id)
                VALUES %s
                ON CONFLICT (property_id, amenity_id) DO NOTHING;
            """
            execute_values(cur, prop_amenity_sql, prop_amenity_records)
            print(f"  --> Truncated table and inserted {len(prop_amenity_records)} records into properties_propertyamenity directly from properties_amenity.csv.")

        # 7. PROPERTIES_PROPERTYLEGAL -> properties_propertylegal
        pl_file = os.path.join(csv_dir, 'properties_propertylegal.csv')
        if os.path.exists(pl_file):
            print(f"\n[7/7] Importing {os.path.basename(pl_file)} -> properties_propertylegal...")
            df_pl = pd.read_csv(pl_file).replace({np.nan: None})

            cur.execute("SELECT user_id FROM accounts_user;")
            valid_users = set(str(r[0]) for r in cur.fetchall())
            default_user = list(valid_users)[0] if valid_users else None

            pl_records = []
            for _, r in df_pl.iterrows():
                na_conv = str(r['na_converted']).lower() in ['true', '1', 'yes', 't']
                def parse_val(v):
                    if v is None or str(v).strip().lower() in ['nan', 'none', 'null', '']:
                        return None
                    return str(v)

                v_user = parse_val(r.get('verified_by_id'))
                if v_user and v_user not in valid_users:
                    v_user = default_user

                pl_records.append((
                    str(r['created_at']),
                    str(r['updated_at']),
                    str(r['legal_id']),
                    str(r['property_id']),
                    parse_val(r.get('survey_number')),
                    parse_val(r.get('khata_number')),
                    na_conv,
                    parse_val(r.get('verification_status')),
                    parse_val(r.get('verified_at')),
                    v_user,
                    parse_val(r.get('remarks'))
                ))

            pl_sql = """
                INSERT INTO properties_propertylegal (
                    created_at, updated_at, legal_id, property_id, survey_number,
                    khata_number, na_converted, verification_status, verified_at,
                    verified_by_id, remarks
                ) VALUES %s
                ON CONFLICT (legal_id) DO UPDATE SET
                    property_id = EXCLUDED.property_id,
                    survey_number = EXCLUDED.survey_number,
                    khata_number = EXCLUDED.khata_number,
                    na_converted = EXCLUDED.na_converted,
                    verification_status = EXCLUDED.verification_status,
                    verified_at = EXCLUDED.verified_at,
                    verified_by_id = EXCLUDED.verified_by_id,
                    remarks = EXCLUDED.remarks,
                    updated_at = EXCLUDED.updated_at;
            """
            execute_values(cur, pl_sql, pl_records)
            print(f"  --> Inserted/Updated {len(pl_records)} records in properties_propertylegal.")

        conn.commit()
        print("\n==================================================")
        print(" SUCCESS: All CSV data inserted into PostgreSQL!   ")
        print("==================================================")

    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Failed to import: {e}")
        raise e
    finally:
        conn.close()

if __name__ == '__main__':
    main()

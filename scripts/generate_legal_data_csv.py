import csv
import uuid
import random
from datetime import datetime, timedelta

def generate_property_legal_csv():
    input_path = r'd:\Verixa\combined_property_data.csv'
    output_path = r'd:\Verixa\properties_propertylegal.csv'

    unique_prop_ids = []
    with open(input_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            pid = row.get('property_id', '').strip()
            if pid and pid not in unique_prop_ids:
                unique_prop_ids.append(pid)

    verified_remarks = [
        "RERA & NA converted. Clear marketability title verified by legal counsel.",
        "A-Khata documentation fully verified. Sub-registrar deed registered cleanly.",
        "Occupancy Certificate (OC) & Possession certificate verified.",
        "Encumbrance Certificate (EC) clear for past 30 years. Bank loan pre-approved.",
        "Verified boundary survey and municipal layout plan approval."
    ]

    pending_remarks = [
        "NA conversion order submitted to collector office. Awaiting final stamp.",
        "Property tax clearance receipt pending for current financial year.",
        "Title verification in progress at local sub-registrar office.",
        "Builder NOC verified; awaiting joint development agreement sign-off.",
        "Layout plan approval under verification by urban development authority."
    ]

    rejected_remarks = [
        "Disputed survey boundary lines reported in local revenue records.",
        "Unapproved agricultural land conversion. Pending litigation.",
        "B-Khata property; lack of valid Occupancy Certificate (OC).",
        "Discrepancy found between survey sketch and on-site carpet area.",
        "Encroachment notice issued by local municipal corporation."
    ]

    rows = []
    statuses = ['VERIFIED', 'VERIFIED', 'VERIFIED', 'PENDING', 'REJECTED']

    status_counts = {'VERIFIED': 0, 'PENDING': 0, 'REJECTED': 0}

    for prop_id_str in unique_prop_ids:
        rng = random.Random(str(prop_id_str))

        prop_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, str(prop_id_str)))
        legal_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"verixa.legal.{prop_id_str}"))

        status = rng.choice(statuses)
        status_counts[status] += 1

        if status == 'VERIFIED':
            na_converted = 'TRUE'
            remarks = rng.choice(verified_remarks)
            verified_at = (datetime.now() - timedelta(days=rng.randint(10, 180))).isoformat() + "Z"
            verified_by_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, "verixa.admin.user"))
        elif status == 'PENDING':
            na_converted = rng.choice(['TRUE', 'FALSE'])
            remarks = rng.choice(pending_remarks)
            verified_at = ""
            verified_by_id = ""
        else:  # REJECTED
            na_converted = 'FALSE'
            remarks = rng.choice(rejected_remarks)
            verified_at = (datetime.now() - timedelta(days=rng.randint(5, 60))).isoformat() + "Z"
            verified_by_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, "verixa.auditor.user"))

        survey_num = f"Survey No. {rng.randint(10, 899)}/{rng.choice(['1A', '2B', '3', '4C', '5'])}"
        khata_type = rng.choice(['A-Khata', 'A-Khata', 'B-Khata', 'E-Khata'])
        khata_num = f"{khata_type} #{rng.randint(10000, 99999)}"

        created_at = (datetime.now() - timedelta(days=rng.randint(180, 365))).isoformat() + "Z"
        updated_at = (datetime.now() - timedelta(days=rng.randint(1, 30))).isoformat() + "Z"

        rows.append({
            'legal_id': legal_id,
            'property_id': prop_uuid,
            'survey_number': survey_num,
            'khata_number': khata_num,
            'na_converted': na_converted,
            'verification_status': status,
            'verified_at': verified_at,
            'verified_by_id': verified_by_id,
            'remarks': remarks,
            'created_at': created_at,
            'updated_at': updated_at
        })

    fieldnames = [
        'legal_id', 'property_id', 'survey_number', 'khata_number',
        'na_converted', 'verification_status', 'verified_at', 'verified_by_id',
        'remarks', 'created_at', 'updated_at'
    ]

    with open(output_path, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Successfully created {output_path}")
    print(f"Total rows: {len(rows)}")
    print("Verification status breakdown:")
    for k, v in status_counts.items():
        print(f"  {k}: {v}")

if __name__ == '__main__':
    generate_property_legal_csv()

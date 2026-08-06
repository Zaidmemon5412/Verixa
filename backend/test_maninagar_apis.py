import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_apis():
    print("==================================================")
    print("Executing Complete REST API Audit for Maninagar")
    print("==================================================")
    
    # 1. Properties API with locality=Maninagar filter
    r1 = requests.get(f"{BASE_URL}/properties/?locality=Maninagar")
    print(f"1. GET /properties/?locality=Maninagar -> Status: {r1.status_code}")
    res1 = r1.json()
    d1 = res1.get('data', {})
    count1 = d1.get('count', 0) if isinstance(d1, dict) else 0
    results1 = d1.get('results', []) if isinstance(d1, dict) else []
    print(f"   Properties Returned: {count1}")
    
    sample_pid = results1[0]['property_id'] if results1 else None

    # 2. Property Details API
    if sample_pid:
        r2 = requests.get(f"{BASE_URL}/properties/{sample_pid}/")
        print(f"2. GET /properties/{sample_pid}/ -> Status: {r2.status_code}")
        
        # 3. Fair Price API
        r3 = requests.get(f"{BASE_URL}/properties/{sample_pid}/fair-price/")
        print(f"3. GET /properties/{sample_pid}/fair-price/ -> Status: {r3.status_code}")
        if r3.status_code == 200:
            print(f"   Fair Price Output: {r3.json().get('data', {}).get('predicted_fair_price')}")

        # 4. Property Audit API
        r4 = requests.get(f"{BASE_URL}/properties/{sample_pid}/audit/")
        print(f"4. GET /properties/{sample_pid}/audit/ -> Status: {r4.status_code}")
        if r4.status_code == 200:
            print(f"   Audit Category Tabs Available: {list(r4.json().get('data', {}).keys())}")

    # 5. Localities API
    r5 = requests.get(f"{BASE_URL}/locations/localities/")
    print(f"5. GET /locations/localities/ -> Status: {r5.status_code}")
    if r5.status_code == 200:
        locs = r5.json().get('data', [])
        maninagar_loc = [l for l in locs if 'maninagar' in str(l).lower()]
        print(f"   Maninagar Locality Object Found in API: {len(maninagar_loc) > 0}")

    print("==================================================")

if __name__ == '__main__':
    test_apis()

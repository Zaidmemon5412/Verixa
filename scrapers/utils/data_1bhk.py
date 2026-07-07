import pandas as pd
import re
from bs4 import BeautifulSoup

def clean_price(price_str):
    """Cleans raw price strings (₹ 65 L) and converts to a numeric float value."""
    if not price_str:
        return 0.0
    price_str = price_str.lower().replace(',', '').replace('₹', '').strip()
    try:
        if 'cr' in price_str:
            return float(price_str.replace('cr', '').strip()) * 10000000
        elif 'l' in price_str or 'lac' in price_str:
            return float(price_str.replace('l', '').replace('lac', '').strip()) * 100000
        return float(price_str)
    except ValueError:
        return 0.0

def clean_area(area_str):
    """Strips non-numeric characters from area strings (e.g. 1,450 sq.ft.)."""
    if not area_str:
        return 0.0
    area_str = re.sub(r'[^\d.]', '', area_str)
    return float(area_str) if area_str else 0.0

def extract_bhk(prop_type_str):
    """Extracts the integer BHK value from property types."""
    match = re.search(r'(\d+)\s*BHK', str(prop_type_str), re.IGNORECASE)
    return int(match.group(1)) if match else None

def convert_txt_to_csv(txt_file_path, output_csv_path):
    print(f"Reading {txt_file_path}...")
    try:
        with open(txt_file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except FileNotFoundError:
        print(f"Error: The file {txt_file_path} was not found.")
        return

    # Parse HTML with BeautifulSoup
    soup = BeautifulSoup(html_content, 'html.parser')
    data = []

    # 99acres uses these specific CSS classes to wrap property cards
    property_cards = soup.find_all('div', class_=re.compile(r'(srpTuple__srpTupleBox|tupleNew__tupleWrap|projectTuple__wrap)'))
    
    print(f"Found {len(property_cards)} property cards. Extracting data...")

    for card in property_cards:
        # Locality Extract
        location_elem = card.find(class_=re.compile(r'(tupleNew__locationName|srpTuple__propertyName|projectTuple__subHeadingTitle)'))
        locality_name = location_elem.get_text(strip=True) if location_elem else "Unknown Locality"
        
        # Builder Extract
        builder_elem = card.find(class_=re.compile(r'(styles__builderTxt|srpTuple__dealerDesc|projectTuple__builderName)'))
        builder_name = builder_elem.get_text(strip=True) if builder_elem else "Unknown Builder"
        
        # Property Type & BHK Extract
        prop_type_elem = card.find(class_=re.compile(r'(tupleNew__propType|srpTuple__propertyType)'))
        prop_type_str = prop_type_elem.get_text(strip=True) if prop_type_elem else "Apartment"
        bhk = extract_bhk(prop_type_str)
        
        # Price Extract
        price_elem = card.find(class_=re.compile(r'(tupleNew__priceValWrap|srpTuple__priceTxt|projectTuple__price)'))
        raw_price = price_elem.get_text(strip=True) if price_elem else "0"
        price_val = clean_price(raw_price)
        
        # Area Extract
        area_elem = card.find(class_=re.compile(r'(tupleNew__area1Type|srpTuple__areaWrap|projectTuple__area)'))
        raw_area = area_elem.get_text(strip=True) if area_elem else "0"
        area_val = clean_area(raw_area)
        
        # Description Extract
        desc_elem = card.find(class_=re.compile(r'(tupleNew__descText|srpTuple__descMore|projectTuple__descText)'))
        description = desc_elem.get_text(strip=True) if desc_elem else ""
        
        # Derive custom fields
        price_per_sqft = round(price_val / area_val, 2) if area_val > 0 else 0.0
        property_name = f"{bhk or 'Luxury'} BHK in {locality_name}"

        # Append to our data list
        data.append({
            'Builder_Name': builder_name,
            'Locality': locality_name,
            'City': 'Ahmedabad',
            'Property_Name': property_name,
            'Property_Type': prop_type_str,
            'BHK': bhk,
            'Transaction_Type': 'Sale',
            'Price_String': raw_price,
            'Price_INR': price_val,
            'Area_String': raw_area,
            'Builtup_Area_SqFt': area_val,
            'Price_Per_SqFt': price_per_sqft,
            'Description': description
        })

    # Convert dictionary list to pandas DataFrame
    df = pd.DataFrame(data)
    
    # Save the dataframe to a CSV file
    df.to_csv(output_csv_path, index=False, encoding='utf-8-sig')
    print(f"Success! {len(df)} rows of data saved to '{output_csv_path}'")

if __name__ == "__main__":
    # Ensure '99.acres.txt' is in the same directory as this script
    INPUT_FILE = "99.acres.txt" 
    OUTPUT_FILE = "99acres_property_data.csv"
    
    convert_txt_to_csv(INPUT_FILE, OUTPUT_FILE)
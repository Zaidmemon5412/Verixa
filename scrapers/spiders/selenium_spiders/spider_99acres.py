import time
import random
import re
import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# ==========================================
# 1. DATA CLEANERS (TEXT TO NUMBERS)
# ==========================================

def clean_price(price_str):
    """Converts text like '₹ 45 Lac' to 4500000.0 for accurate ML training"""
    if not price_str or 'request' in price_str.lower():
        return None
    try:
        num = float(re.findall(r"[-+]?\d*\.\d+|\d+", price_str)[0])
        if 'Lac' in price_str or 'L' in price_str:
            return num * 100000
        elif 'Cr' in price_str:
            return num * 10000000
        return num
    except:
        return None

def clean_area(area_str):
    """Extracts pure numbers and converts Sq.Yards (Gaj) to Sq.Ft."""
    if not area_str:
        return None
    try:
        num = float(re.findall(r"[-+]?\d*\.\d+|\d+", area_str)[0])
        if 'yrd' in area_str.lower() or 'yard' in area_str.lower():
            num = num * 9  # 1 Sq.Yard = 9 Sq.Ft
        return round(num, 2)
    except:
        return None

# ==========================================
# 2. STEALTH BROWSER SETUP
# ==========================================

def setup_stealth_driver():
    chrome_options = Options()
    # Masking as a normal user to avoid Cloudflare blocks
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--window-size=1366,768")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    return driver

# ==========================================
# 3. CORE SCRAPING LOGIC
# ==========================================

def scrape_for_verixa_db(driver, url, target_bhk, target_locality):
    scraped_data = []
    
    print(f"\n---> Loading 99acres: {target_locality} ({target_bhk} BHK)...")
    driver.get(url)
    
    # INFINITE SCROLL HACK: Forces 99acres to load all properties on one page
    print("---> Initiating stealth scrolling...")
    for i in range(15):
        driver.execute_script("window.scrollBy(0, 800);")
        time.sleep(random.uniform(2.2, 3.8))
        
    time.sleep(3) # Final render wait
        
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    
    # ADVANCED FALLBACK LOGIC: Handles PseudoTupleRevamp, srpTuple, and projectTuple
    property_cards = soup.find_all('div', class_=lambda c: c and ('PseudoTupleRevamp__' in c or 'srpTuple__tupleDetails' in c or 'projectTuple__' in c))
    
    print(f"---> Found {len(property_cards)} raw property cards.")
    
    if len(property_cards) == 0:
         print("❌ STILL NO CARDS FOUND. The HTML might be deeply nested or CAPTCHA blocked.")
         return []

    for card in property_cards:
        # Schema matching your properties_property table
        property_info = {
            'property_name': 'Unknown',
            'property_type': 'Flat',
            'transaction_type': 'Unknown',
            'price': None,
            'price_per_sqft': None,
            'bhk': target_bhk,
            'carpet_area': None,
            'builder_name': 'Unknown',
            'rera_number': None,          
            'status': 'Active',
            'locality_name': target_locality 
        }
        
        card_text_lower = card.text.lower()
        
        # 1. Price
        try:
            price_tag = card.find('td', id='srp_tuple_price') or card.find(class_=lambda c: c and 'price' in c.lower())
            if price_tag:
                 property_info['price'] = clean_price(price_tag.text.strip())
        except:
            pass
            
        # 2. Property Title
        try:
            title_tag = card.find('h2', class_=lambda c: c and 'title' in c.lower())
            property_info['property_name'] = title_tag.text.strip() if title_tag else f"{target_bhk} BHK Flat"
        except:
            property_info['property_name'] = f"{target_bhk} BHK Flat"
            
        # 3. Carpet Area
        try:
            area_tag = card.find('td', id='srp_tuple_primary_area') or card.find(class_=lambda c: c and 'area' in c.lower())
            if area_tag:
                property_info['carpet_area'] = clean_area(area_tag.text.strip())
        except:
            pass

        # 4. Builder Name
        try:
            builder_tag = card.find('div', class_=lambda c: c and 'buildername' in c.lower())
            property_info['builder_name'] = builder_tag.text.strip() if builder_tag else "Individual Owner"
        except:
            pass
            
        # 5. Transaction Type (Resale vs New)
        if 'resale' in card_text_lower or 'old' in card_text_lower or 'owner' in card_text_lower:
            property_info['transaction_type'] = 'Resale'
        else:
            property_info['transaction_type'] = 'New Property'

        # 6. RERA Registration Info
        try:
            rera_tag = card.find('div', class_=lambda c: c and 'rerabadge' in c.lower())
            if rera_tag:
                property_info['rera_number'] = rera_tag.text.strip()
        except:
            pass

        # 7. Price Per SqFt Calculation (Crucial for your ML Trend Forecasting)
        if property_info['price'] and property_info['carpet_area']:
            property_info['price_per_sqft'] = round(property_info['price'] / property_info['carpet_area'], 2)

        # FINAL QUALITY CHECK: Only save data that has both Price and Area for ML
        if property_info['price'] and property_info['carpet_area']:
            scraped_data.append(property_info)
            
    return scraped_data

# ==========================================
# 4. EXECUTION
# ==========================================

if __name__ == "__main__":
    # The verified SG Highway 1 BHK URL
    URL = "https://www.99acres.com/search/property/buy/residential-apartments/ahmedabad?city=45&bedroom_num=1&property_type=1&preference=S&area_unit=1&res_com=R"
    
    print("Launching Selenium...")
    driver = setup_stealth_driver()
    
    try:
        raw_data = scrape_for_verixa_db(
            driver=driver, 
            url=URL, 
            target_bhk=1, 
            target_locality="SG Highway"
        )
        
        df = pd.DataFrame(raw_data)
        
        print("\n" + "="*45)
        print(" VERIXA PIPELINE: SCRAPING SUMMARY")
        print("="*45)
        print(f"Total valid database-ready rows: {len(df)}")
        
        if len(df) > 0:
            filename = "Verixa_SG_Highway_1BHK.csv"
            
            # Reorder columns to exactly match your database schema visualization
            column_order = [
                'property_name', 'property_type', 'transaction_type', 
                'price', 'price_per_sqft', 'bhk', 'carpet_area', 
                'builder_name', 'rera_number', 'status', 'locality_name'
            ]
            df = df[column_order]
            
            # Save to CSV
            df.to_csv(filename, index=False)
            print(f"\n✅ Success! Data safely exported to: {filename}")
            print("\nPreview of the extracted data:")
            print(df[['property_name', 'transaction_type', 'price', 'rera_number']].head(4))
        else:
            print("\n❌ WARNING: No valid data was extracted. 99acres might be blocking elements or formatting text weirdly.")
            
    except Exception as e:
        print(f"Critial Error during execution: {e}")
        
    finally:
        print("\nClosing browser...")
        driver.quit()
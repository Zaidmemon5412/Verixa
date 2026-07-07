# import re
import pandas as pd
# from bs4 import BeautifulSoup

# # ==========================================
# # 1. DATA CLEANERS (TEXT TO NUMBERS)
# # ==========================================
# def clean_price(price_str):
#     if not price_str or 'request' in price_str.lower():
#         return None
#     try:
#         num = float(re.findall(r"[-+]?\d*\.\d+|\d+", price_str)[0])
#         if 'lac' in price_str.lower() or 'l' in price_str.lower():
#             return num * 100000
#         elif 'cr' in price_str.lower():
#             return num * 10000000
#         return num
#     except:
#         return None

# def clean_area(area_str):
#     if not area_str:
#         return None
#     try:
#         num = float(re.findall(r"[-+]?\d*\.\d+|\d+", area_str)[0])
#         # Gujarat standard: Convert Gaj/Yards to Sq.Ft.
#         if 'yrd' in area_str.lower() or 'yard' in area_str.lower():
#             num = num * 9
#         return round(num, 2)
#     except:
#         return None

# # ==========================================
# # 2. OFFLINE SCRAPING LOGIC
# # ==========================================
# def parse_local_html(file_path, target_bhk, target_locality):
#     scraped_data = []
    
#     print(f"\n---> Reading HTML from local file: {file_path}...")
#     try:
#         with open(file_path, 'r', encoding='utf-8') as file:
#             html_content = file.read()
#     except FileNotFoundError:
#         print(f"❌ Error: File '{file_path}' not found in the directory.")
#         return []

#     soup = BeautifulSoup(html_content, 'html.parser')
    
#     # ⚠️ ADVANCED FALLBACK LOGIC FOR 99ACRES DIVS
#     property_cards = soup.find_all('div', class_=lambda c: c and any(keyword in c for keyword in ['Tuple', 'tuple', 'projectInnerCount', 'srpCard', 'propertyCard']))
    
#     print(f"---> Found {len(property_cards)} raw property cards in the text file.")
#     if len(property_cards) == 0:
#         print("❌ Warning: 0 cards found. Please make sure the .txt file contains the correct HTML elements.")
#         return []

#     for idx, card in enumerate(property_cards):
#         property_info = {
#             'property_name': f"{target_bhk} BHK Flat",
#             'property_type': 'Flat',
#             'transaction_type': 'Unknown',
#             'price': None,
#             'price_per_sqft': None,
#             'bhk': target_bhk,
#             'carpet_area': None,
#             'builder_name': 'Unknown',
#             'rera_number': None,          
#             'status': 'Active',
#             'locality_name': target_locality 
#         }
        
#         card_text_lower = card.text.lower()
        
#         # 1. PRICE DEEP SEARCH
#         try:
#             price_elem = card.find('td', id='srp_tuple_price') or card.find(text=re.compile(r'₹|Lac|Cr|Price', re.IGNORECASE))
#             if price_elem:
#                 property_info['price'] = clean_price(price_elem.text.strip() if hasattr(price_elem, 'text') else str(price_elem))
#         except: pass
            
#         # 2. TITLE SEARCH
#         try:
#             title_tag = card.find('h2') or card.find('a', class_=lambda c: c and 'title' in c.lower())
#             if title_tag:
#                 property_info['property_name'] = title_tag.text.strip()
#         except: pass
            
#         # 3. AREA DEEP SEARCH
#         try:
#             area_elem = card.find(text=re.compile(r'sq\.ft|sq\.yrd|sq ft|sq yrd', re.IGNORECASE))
#             if area_elem:
#                 property_info['carpet_area'] = clean_area(str(area_elem))
#             else:
#                 area_tag = card.find('td', id='srp_tuple_primary_area') or card.find(class_=lambda c: c and 'area' in c.lower())
#                 if area_tag:
#                     property_info['carpet_area'] = clean_area(area_tag.text.strip())
#         except: pass

#         # 4. BUILDER SEARCH
#         try:
#             builder_tag = card.find('div', class_=lambda c: c and ('builder' in c.lower() or 'dealer' in c.lower()))
#             if builder_tag:
#                 property_info['builder_name'] = builder_tag.text.strip()
#         except: pass
            
#         # 5. TRANSACTION TYPE
#         if 'resale' in card_text_lower or 'old' in card_text_lower or 'owner' in card_text_lower:
#             property_info['transaction_type'] = 'Resale'
#         else:
#             property_info['transaction_type'] = 'New Property'

#         # 6. RERA NUMBER
#         try:
#             rera_tag = card.find('div', class_=lambda c: c and 'rera' in c.lower())
#             if rera_tag:
#                 property_info['rera_number'] = rera_tag.text.strip()
#         except: pass

#         # 7. PRICE PER SQFT CALCULATION
#         if property_info['price'] and property_info['carpet_area']:
#             property_info['price_per_sqft'] = round(property_info['price'] / property_info['carpet_area'], 2)

#         # Output extraction status to terminal
#         print(f"Card {idx+1} Extract -> Price: {property_info['price']} | Area: {property_info['carpet_area']}")
        
#         # Save if at least Price is found
#         if property_info['price']:
#             scraped_data.append(property_info)
            
#     return scraped_data

# # ==========================================
# # 3. EXECUTION
# # ==========================================
# if __name__ == "__main__":
    
#     # EXACT FILE NAME OF YOUR SAVED HTML TEXT FILE
#     HTML_FILE = "99acres.txt" 
    
#     TARGET_LOCALITY = "SG Highway"
#     TARGET_BHK = 1
#     OUTPUT_CSV_NAME = "Verixa_SG_Highway_1BHK.csv"
    
#     print("Starting Offline Parser...")
    
#     try:
#         raw_data = parse_local_html(HTML_FILE, TARGET_BHK, TARGET_LOCALITY)
#         df = pd.DataFrame(raw_data)
        
#         print("\n" + "="*45)
#         print(" VERIXA PIPELINE: OFFLINE SCRAPING SUMMARY")
#         print("="*45)
#         print(f"Total valid database-ready rows: {len(df)}")
        
#         if len(df) > 0:
#             column_order = [
#                 'property_name', 'property_type', 'transaction_type', 
#                 'price', 'price_per_sqft', 'bhk', 'carpet_area', 
#                 'builder_name', 'rera_number', 'status', 'locality_name'
#             ]
#             df = df[column_order]
#             df.to_csv(OUTPUT_CSV_NAME, index=False)
#             print(f"\n✅ Success! Data safely exported to: {OUTPUT_CSV_NAME}")
#         else:
#             print("\n❌ WARNING: No valid data was extracted. Ensure your 99acres.txt contains the actual property cards.")
            
#     except Exception as e:
#         print(f"Critical Error during execution: {e}")

df = pd.read_csv("Verixa_SG_Highway_1BHK.csv")
df
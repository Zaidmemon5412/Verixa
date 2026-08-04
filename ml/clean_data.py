"""
==============================================================================
Verixa ML Data Cleaning & Combining Script
==============================================================================
This script cleans all real estate CSV datasets in Verixa/ml/CSV/ for ML modeling
and data analysis while preserving 100% of rows and columns.
It also outputs 2 master combined CSV files:
  1. combined_property_data.csv (All property data combined)
  2. combined_property_images.csv (All property image metadata combined)
"""

import os
import re
import sys
import pandas as pd
import numpy as np

# Ensure UTF-8 output formatting
sys.stdout.reconfigure(encoding='utf-8')

# Helper functions for robust numeric parsing

def parse_price(val):
    """Convert price string (e.g., '₹ 60 Lac', '₹ 1.2 Cr', '₹ 68.7 - 72.93 Lac') to numeric INR float."""
    if pd.isna(val):
        return np.nan
    s = str(val).strip()
    if 'price on request' in s.lower() or 'on request' in s.lower():
        return np.nan
    
    s_clean = s.replace('₹', '').replace('Rs', '').replace(',', '').strip()
    is_cr = 'cr' in s_clean.lower() or 'crore' in s_clean.lower()
    is_lac = 'lac' in s_clean.lower() or 'lakh' in s_clean.lower()
    
    if '-' in s_clean:
        parts = s_clean.split('-')
        nums = []
        for p in parts:
            found = re.findall(r'\d+\.?\d*', p)
            if found:
                nums.append(float(found[0]))
        val_num = sum(nums) / len(nums) if nums else np.nan
    else:
        found = re.findall(r'\d+\.?\d*', s_clean)
        val_num = float(found[0]) if found else np.nan
        
    if pd.isna(val_num):
        return np.nan
        
    if is_cr:
        return val_num * 10_000_000.0
    elif is_lac:
        return val_num * 100_000.0
    else:
        return val_num

def parse_sqft(val):
    """Convert sqft string (e.g., '765 sqft', '635 - 673 sqft') to numeric float."""
    if pd.isna(val):
        return np.nan
    s = str(val).replace(',', '').replace('sqft', '').replace('sq.ft', '').strip()
    if not s:
        return np.nan
    if '-' in s:
        parts = s.split('-')
        nums = []
        for p in parts:
            found = re.findall(r'\d+\.?\d*', p)
            if found:
                nums.append(float(found[0]))
        return sum(nums) / len(nums) if nums else np.nan
    found = re.findall(r'\d+\.?\d*', s)
    return float(found[0]) if found else np.nan

def parse_floor(val):
    """Convert floor string (e.g., 'G', 'Ground', '6') to numeric float."""
    if pd.isna(val):
        return np.nan
    s = str(val).strip().upper()
    if s in ['G', 'GROUND', 'GROUND FLOOR', 'GF']:
        return 0.0
    found = re.findall(r'\d+\.?\d*', s)
    return float(found[0]) if found else np.nan

def parse_currency_per_sqft(val):
    """Convert price_per_sqft string (e.g., '₹ 4,761') to numeric float."""
    if pd.isna(val):
        return np.nan
    s = str(val).replace('₹', '').replace('Rs', '').replace(',', '').strip()
    found = re.findall(r'\d+\.?\d*', s)
    return float(found[0]) if found else np.nan

def format_date_to_numeric_month(val):
    """Convert date string like '23-Jul-26' to numeric month format '23-07-26'."""
    if pd.isna(val) or not str(val).strip() or str(val).strip().lower() in ['nan', 'none', 'unspecified']:
        return 'Unspecified'
    s = str(val).strip()
    try:
        dt = pd.to_datetime(s, format='%d-%b-%y')
        return dt.strftime('%d-%m-%y')
    except Exception:
        try:
            dt = pd.to_datetime(s)
            return dt.strftime('%d-%m-%y')
        except Exception:
            return s


def clean_property_df(df, filename):
    """Cleans a main property dataset while preserving 100% of rows and columns."""
    initial_rows, initial_cols = df.shape
    
    # 1. Strip whitespace from all string columns
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].astype(str).str.strip()
            df[col] = df[col].replace({'nan': np.nan, 'None': np.nan, '': np.nan})

    # 2. Parse numeric strings
    df['price'] = df['price'].apply(parse_price)
    df['price_per_sqft'] = df['price_per_sqft'].apply(parse_currency_per_sqft)
    df['carpet_area'] = df['carpet_area'].apply(parse_sqft)
    df['builtup_area'] = df['builtup_area'].apply(parse_sqft)
    df['super_builtup_area'] = df['super_builtup_area'].apply(parse_sqft)
    df['floor_number'] = df['floor_number'].apply(parse_floor)
    df['total_floors'] = pd.to_numeric(df['total_floors'], errors='coerce')
    df['construction_year'] = pd.to_numeric(df['construction_year'], errors='coerce')

    # 3. Inter-dependent numeric imputations
    
    # Impute price_per_sqft where price and carpet_area exist
    mask_ppsf = df['price_per_sqft'].isna() & df['price'].notna() & df['carpet_area'].notna() & (df['carpet_area'] > 0)
    df.loc[mask_ppsf, 'price_per_sqft'] = (df.loc[mask_ppsf, 'price'] / df.loc[mask_ppsf, 'carpet_area']).round(2)

    # Impute price where price_per_sqft and carpet_area exist
    mask_price = df['price'].isna() & df['price_per_sqft'].notna() & df['carpet_area'].notna()
    df.loc[mask_price, 'price'] = (df.loc[mask_price, 'price_per_sqft'] * df.loc[mask_price, 'carpet_area']).round(2)

    # Impute carpet_area where price and price_per_sqft exist
    mask_ca = df['carpet_area'].isna() & df['price'].notna() & df['price_per_sqft'].notna() & (df['price_per_sqft'] > 0)
    df.loc[mask_ca, 'carpet_area'] = (df.loc[mask_ca, 'price'] / df.loc[mask_ca, 'price_per_sqft']).round(2)

    # Impute builtup_area and super_builtup_area using carpet_area ratios if available
    builtup_ratio = (df['builtup_area'] / df['carpet_area']).median()
    if pd.isna(builtup_ratio) or builtup_ratio == 0:
        builtup_ratio = 1.2
    
    super_ratio = (df['super_builtup_area'] / df['carpet_area']).median()
    if pd.isna(super_ratio) or super_ratio == 0:
        super_ratio = 1.4

    mask_ba = df['builtup_area'].isna() & df['carpet_area'].notna()
    df.loc[mask_ba, 'builtup_area'] = (df.loc[mask_ba, 'carpet_area'] * builtup_ratio).round(2)

    mask_sa = df['super_builtup_area'].isna() & df['carpet_area'].notna()
    df.loc[mask_sa, 'super_builtup_area'] = (df.loc[mask_sa, 'carpet_area'] * super_ratio).round(2)

    # Grouped BHK median imputations for remaining numeric NaNs
    for col in ['carpet_area', 'builtup_area', 'super_builtup_area', 'price', 'price_per_sqft']:
        if df[col].isna().sum() > 0:
            bhk_medians = df.groupby('bhk')[col].transform('median')
            df[col] = df[col].fillna(bhk_medians)
            df[col] = df[col].fillna(df[col].median())

    # Impute floor_number and total_floors & convert to INTEGER
    median_floor = df['floor_number'].median() if not pd.isna(df['floor_number'].median()) else 1.0
    df['floor_number'] = df['floor_number'].fillna(median_floor).round().astype('int64')

    median_total_floors = df['total_floors'].median() if not pd.isna(df['total_floors'].median()) else 5.0
    df['total_floors'] = df['total_floors'].fillna(df[['floor_number']].apply(lambda r: max(r['floor_number'], median_total_floors), axis=1)).round().astype('int64')

    # Builder ID
    df['builder_id'] = pd.to_numeric(df['builder_id'], errors='coerce').fillna(0).astype('int64')

    # Construction Year
    median_year = df['construction_year'].median() if not pd.isna(df['construction_year'].median()) else 2020.0
    df['construction_year'] = df['construction_year'].fillna(median_year).astype('int64')

    # Categorical & Text Field Imputations
    df['rera_number'] = df['rera_number'].fillna('Not Registered')
    df['facing'] = df['facing'].fillna('Unspecified')
    df['furnishing_status'] = df['furnishing_status'].fillna('Unspecified')

    # Timestamps (convert month name to numeric format e.g. 23-Jul-26 -> 23-07-26)
    if 'created_at' in df.columns:
        df['created_at'] = df['created_at'].apply(format_date_to_numeric_month)
    if 'updated_at' in df.columns:
        df['updated_at'] = df['updated_at'].fillna(df['created_at'])
        df['updated_at'] = df['updated_at'].apply(format_date_to_numeric_month)

    # Entirely / mostly empty metadata columns (land_area, launch_date, completion_date)
    df['land_area'] = df['land_area'].fillna(0.0)
    df['launch_date'] = df['launch_date'].fillna('Unspecified')
    df['completion_date'] = df['completion_date'].fillna('Unspecified')

    # Verification: assert row and column preservation
    final_rows, final_cols = df.shape
    assert initial_rows == final_rows, f"Row count mismatch in {filename}: {initial_rows} vs {final_rows}"
    assert initial_cols == final_cols, f"Column count mismatch in {filename}: {initial_cols} vs {final_cols}"

    return df


def clean_image_df(df, filename):
    """Cleans image datasets while preserving rows and columns."""
    initial_rows, initial_cols = df.shape
    
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].astype(str).str.strip()

    df['display_order'] = pd.to_numeric(df['display_order'], errors='coerce').fillna(1).astype(int)
    df['is_primary'] = df['is_primary'].astype(str).str.lower().map({'true': True, '1': True, 'false': False, '0': False}).fillna(False)

    final_rows, final_cols = df.shape
    assert initial_rows == final_rows, f"Row count mismatch in {filename}: {initial_rows} vs {final_rows}"
    assert initial_cols == final_cols, f"Column count mismatch in {filename}: {initial_cols} vs {final_cols}"
    return df


def clean_amenities_df(df, filename):
    """Cleans amenity dataset while preserving rows and columns."""
    initial_rows, initial_cols = df.shape
    
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].astype(str).str.strip()

    final_rows, final_cols = df.shape
    assert initial_rows == final_rows, f"Row count mismatch in {filename}: {initial_rows} vs {final_rows}"
    assert initial_cols == final_cols, f"Column count mismatch in {filename}: {initial_cols} vs {final_cols}"
    return df


def main():
    csv_dir = r"d:\Verixa\Verixa\ml\CSV"
    
    property_files = ["Chandkheda.csv", "SindhuBhavan.csv", "Sola.csv", "Thaltej.csv", "gota_data.csv", "Satellite.csv"]
    image_files = ["Chandkheda_img.csv", "SindhuBhavan_img.csv", "Sola_img.csv", "Thaltej_img.csv", "gota_images.csv", "Satellite_img.csv"]

    cleaned_prop_dfs = []
    cleaned_img_dfs = []

    print("=== Cleaning Property Data Files ===")
    for f in property_files:
        file_path = os.path.join(csv_dir, f)
        df_raw = pd.read_csv(file_path)
        df_cleaned = clean_property_df(df_raw, f)
        df_cleaned.to_csv(file_path, index=False)
        cleaned_prop_dfs.append(df_cleaned)
        print(f"  -> Cleaned '{f}' (Shape: {df_cleaned.shape})")

    print("\n=== Cleaning Property Image Files ===")
    for f in image_files:
        file_path = os.path.join(csv_dir, f)
        df_raw = pd.read_csv(file_path)
        df_cleaned = clean_image_df(df_raw, f)
        df_cleaned.to_csv(file_path, index=False)
        cleaned_img_dfs.append(df_cleaned)
        print(f"  -> Cleaned '{f}' (Shape: {df_cleaned.shape})")

    print("\n=== Clean Gota Amenities File ===")
    amenities_path = os.path.join(csv_dir, "gota_amenities.csv")
    df_amenities = pd.read_csv(amenities_path)
    df_amenities_cleaned = clean_amenities_df(df_amenities, "gota_amenities.csv")
    df_amenities_cleaned.to_csv(amenities_path, index=False)
    print(f"  -> Cleaned 'gota_amenities.csv' (Shape: {df_amenities_cleaned.shape})")

    # Combine into 2 master CSV files
    print("\n=== Generating 2 Combined Master CSV Files ===")
    combined_property_df = pd.concat(cleaned_prop_dfs, ignore_index=True)
    combined_image_df = pd.concat(cleaned_img_dfs, ignore_index=True)

    master_prop_path = os.path.join(csv_dir, "combined_property_data.csv")
    master_img_path = os.path.join(csv_dir, "combined_property_images.csv")

    combined_property_df.to_csv(master_prop_path, index=False)
    combined_image_df.to_csv(master_img_path, index=False)

    print(f"  -> 1. 'combined_property_data.csv' created with shape: {combined_property_df.shape}")
    print(f"  -> 2. 'combined_property_images.csv' created with shape: {combined_image_df.shape}")
    print("\nData cleaning & combining pipeline completed successfully!")

if __name__ == '__main__':
    main()

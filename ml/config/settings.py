"""
==============================================================================
Verixa ML Engine - Configuration Settings
==============================================================================
Central configuration file defining dataset paths, feature groupings,
target variable, hyperparameter search spaces, and valuation verdict rules.
"""

import os
from pathlib import Path

# Base Paths
ML_DIR = Path(__file__).resolve().parent.parent
BASE_DIR = ML_DIR.parent
DATA_DIR = ML_DIR / "CSV"
DATA_PATH = DATA_DIR / "combined_property_data.csv"

# Output Artifact Paths
MODEL_DIR = ML_DIR / "models"
MODEL_FILE_PATH = MODEL_DIR / "verixa_price_model.joblib"
METADATA_FILE_PATH = MODEL_DIR / "model_metadata.json"
PLOTS_DIR = ML_DIR / "plots"

# Ensure directories exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)

# Machine Learning Feature Specifications
TARGET_COL = "price"

# Features to exclude from direct model input (e.g. IDs, text, price_per_sqft to prevent target leakage)
EXCLUDED_COLS = [
    "property_id",
    "rera_number",
    "property_name",
    "address",
    "description",
    "created_at",
    "updated_at",
    "price",             # Target variable
    "price_per_sqft",    # Derived directly from target / carpet_area (LEAKAGE PREVENTION)
    "land_area",
    "launch_date",
    "completion_date"
]

# Feature Categorizations
NUMERIC_FEATURES = [
    "carpet_area",
    "builtup_area",
    "super_builtup_area",
    "bhk",
    "bathrooms",
    "balconies",
    "floor_number",
    "total_floors",
    "construction_year",
    "latitude",
    "longitude"
]

CATEGORICAL_FEATURES = [
    "locality_id",
    "property_type",
    "transaction_type",
    "furnishing_status",
    "facing",
    "status"
]

# Engineered Features added by VerixaFeatureEngineer
ENGINEERED_NUMERIC_FEATURES = [
    "property_age",
    "floor_ratio",
    "area_efficiency",
    "bath_bhk_ratio"
]

# Current Analysis Year for property age calculation
CURRENT_YEAR = 2026

# Valuation Verdict Thresholds (% difference between Listed Price and Predicted Fair Price)
# Formula: diff_pct = ((listed_price - predicted_fair_price) / predicted_fair_price) * 100
VERDICT_THRESHOLDS = {
    "EXCELLENT_DEAL": -15.0,      # diff_pct <= -15%
    "GOOD_DEAL": -5.0,            # -15% < diff_pct <= -5%
    "FAIR_PRICE_MAX": 5.0,        # -5% < diff_pct < +5%
    "SLIGHTLY_OVERPRICED": 15.0   # +5% <= diff_pct < +15%
}

VERDICT_LABELS = {
    "EXCELLENT_DEAL": "Excellent Deal",
    "GOOD_DEAL": "Good Deal",
    "FAIR_PRICE": "Fair Price",
    "SLIGHTLY_OVERPRICED": "Slightly Overpriced",
    "HIGHLY_OVERPRICED": "Highly Overpriced"
}

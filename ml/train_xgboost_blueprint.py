"""
==============================================================================
VERIXA REAL ESTATE ML ENGINE - XGBOOST AVM & OSM BLUEPRINT
==============================================================================
Project: VERIXA Real Estate Platform
Author: Ansari Faizanalam Firojalam
Institution: Department of CSE, LJ University
Winning Model: XGBOOST REGRESSOR
Evaluation: AVM Valuation & Locality Connectivity Score (1 - 10 Scale)
==============================================================================
"""

import os
import sys
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.spatial import cKDTree
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from xgboost import XGBRegressor
import joblib

# Ensure UTF-8 output formatting
sys.stdout.reconfigure(encoding='utf-8')

ML_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_DIR = os.path.join(ML_DIR, "CSV")
MODELS_DIR = os.path.join(ML_DIR, "models")
PLOTS_DIR = os.path.join(ML_DIR, "plots")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)

MODEL_PKL_PATH = os.path.join(MODELS_DIR, "verixa_xgboost_full_matrix_avm.pkl")
MODEL_JOBLIB_PATH = os.path.join(MODELS_DIR, "verixa_xgboost_full_matrix_avm.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "xgboost_blueprint_metadata.json")

# Define Ahmedabad Metro & Highway Spatial Centroids
METRO_NODES = np.array([
    [23.0505, 72.5170], # Thaltej Metro Station
    [23.0485, 72.5320], # Doordarshan Kendra Metro Station
    [23.0380, 72.5520], # Commerce Six Road Metro Station
    [23.0410, 72.5680], # SP Stadium Metro Station
    [23.0330, 72.5780], # Old High Court / Income Tax Metro Station
    [23.0120, 72.5830], # Paldi Metro Station
    [22.9980, 72.5890], # Vasna / APMC Metro Station
    [23.0980, 72.5880], # Sabarmati Metro Station
    [23.1160, 72.5790], # Motera Stadium Metro Station
])

HIGHWAY_NODES = np.array([
    [23.1180, 72.5400], # SG Highway - Gota Flyover
    [23.0900, 72.5320], # SG Highway - Sola Bridge
    [23.0550, 72.5120], # SG Highway - Thaltej Cross Roads
    [23.0320, 72.5050], # SG Highway - Sindhu Bhavan / Pakwan
    [23.0150, 72.5010], # SG Highway - ISCON Cross Roads
    [22.9950, 72.4980], # SG Highway - YMCA / Prahladnagar
    [23.1350, 72.5650], # SP Ring Road - Vaishno Devi Circle
    [23.1120, 72.6100], # SP Ring Road - Tapovan Circle
    [23.0480, 72.4680], # SP Ring Road - Bopal Flyover
])

def extract_osm_spatial_features(df):
    """
    Computes spatial distances to Ahmedabad Metro and SG Highway/SP Ring Road
    using Spatial cKDTree, and calculates the 1-10 Locality Connectivity Rating.
    """
    metro_tree = cKDTree(METRO_NODES)
    highway_tree = cKDTree(HIGHWAY_NODES)

    lat = df['latitude'].replace(0.0, np.nan).fillna(df['latitude'].median()).values
    lon = df['longitude'].replace(0.0, np.nan).fillna(df['longitude'].median()).values
    prop_coords = np.column_stack((lat, lon))

    metro_dists, _ = metro_tree.query(prop_coords)
    highway_dists, _ = highway_tree.query(prop_coords)

    # Approx 111 km per degree coordinate
    dist_metro_km = np.round(metro_dists * 111.0, 2)
    dist_highway_km = np.round(highway_dists * 111.0, 2)

    # Locality Connectivity Rating Exponential Distance Decay Formula (1 to 10 Scale)
    s_metro = 10.0 * np.exp(-0.3 * dist_metro_km)
    s_highway = 10.0 * np.exp(-0.4 * dist_highway_km)
    verixa_connectivity_rating = np.round((0.55 * s_metro + 0.45 * s_highway).clip(1.0, 10.0), 1)

    df['dist_metro_km'] = dist_metro_km
    df['dist_highway_km'] = dist_highway_km
    df['verixa_connectivity_rating'] = verixa_connectivity_rating
    return df

def preprocess_17_features(df):
    """
    Preprocesses and encodes all 17 Property Attributes as specified in the blueprint.
    """
    df = df.copy()

    # 1. Spatial OSM features
    df = extract_osm_spatial_features(df)

    # 2. Domain Feature Engineering
    df['construction_age'] = (2026 - pd.to_numeric(df['construction_year'], errors='coerce').fillna(2020)).clip(lower=0)
    
    # Usable Living Space Ratio (carpet_efficiency)
    super_area = np.where(df['super_builtup_area'] == 0, df['carpet_area'], df['super_builtup_area'])
    df['carpet_efficiency'] = np.round(df['carpet_area'] / super_area, 4)

    # Floor Elevation Ratio
    tot_floors = np.where(df['total_floors'] == 0, 1, df['total_floors'])
    df['floor_ratio'] = np.round(df['floor_number'] / tot_floors, 4)

    # Ordinal Furnishing Status (Unfurnished=0, Semifurnished=1, Fully Furnished=2)
    furnish_map = {'Unfurnished': 0, 'Semifurnished': 1, 'Furnished': 2}
    furnish_str = df['furnishing_status'].astype(str).str.extract(r'(Furnished|Semifurnished|Unfurnished)')[0]
    df['furnishing_num'] = furnish_str.map(furnish_map).fillna(1).astype(int)

    # Binary Construction Status (Ready to Move=1, Under Construction=0)
    df['status_num'] = np.where(df['status'].astype(str).str.lower().str.contains('ready'), 1, 0)

    # Parking allocation numeric
    df['parking_num'] = pd.to_numeric(df['parking_spaces'].astype(str).str.extract(r'(\d+)')[0], errors='coerce').fillna(1).astype(int)

    # One-Hot Encoding for property_type, transaction_type, and facing
    df_encoded = pd.get_dummies(df, columns=['property_type', 'transaction_type', 'facing'], drop_first=True)

    feature_cols = [
        'bhk', 'super_builtup_area', 'carpet_area', 'builtup_area', 'bathrooms',
        'balconies', 'parking_num', 'floor_number', 'total_floors', 'furnishing_num',
        'construction_age', 'status_num', 'latitude', 'longitude', 'carpet_efficiency',
        'floor_ratio', 'dist_metro_km', 'dist_highway_km', 'verixa_connectivity_rating'
    ] + [c for c in df_encoded.columns if c.startswith(('property_type_', 'transaction_type_', 'facing_'))]

    X = df_encoded[feature_cols].apply(pd.to_numeric, errors='coerce').fillna(0)
    y = df_encoded['price']

    return df, X, y, feature_cols

def train_and_evaluate_xgboost():
    print("==============================================================================")
    print(" VERIXA REAL ESTATE ML ENGINE - XGBOOST BLUEPRINT TRAINING")
    print("==============================================================================\n")

    csv_path = os.path.join(CSV_DIR, "combined_property_data.csv")
    df_raw = pd.read_csv(csv_path)
    print(f"Loaded combined dataset from '{csv_path}' with shape: {df_raw.shape}")

    df_proc, X, y_raw, feature_cols = preprocess_17_features(df_raw)
    y_log = np.log1p(y_raw)

    # 80/20 Train/Test Split
    X_train, X_test, y_train_log, y_test_log, y_train_raw, y_test_raw = train_test_split(
        X, y_log, y_raw, test_size=0.20, random_state=42
    )

    # Train Winning XGBoost Regressor Model
    xgb_model = XGBRegressor(
        n_estimators=400,
        learning_rate=0.03,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )

    print("\nTraining XGBoost Regressor Model (n_estimators=400, lr=0.03, max_depth=6)...")
    xgb_model.fit(X_train, y_train_log)

    # Evaluation on Test Set
    y_pred_log = xgb_model.predict(X_test)
    y_pred_raw = np.expm1(y_pred_log)

    mae = mean_absolute_error(y_test_raw, y_pred_raw)
    rmse = np.sqrt(mean_squared_error(y_test_raw, y_pred_raw))
    r2 = r2_score(y_test_raw, y_pred_raw)

    # 5-Fold Cross Validation
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(xgb_model, X, y_log, cv=kf, scoring="r2")
    mean_cv_r2 = cv_scores.mean()

    print("\n==============================================================================")
    print(" MODEL EVALUATION METRICS (XGBOOST AVM BLUEPRINT)")
    print("==============================================================================")
    print(f"  • Model Architecture:            XGBoost Regressor (Winning Model)")
    print(f"  • 5-Fold Cross Validation R²:    {mean_cv_r2:.4f}")
    print(f"  • Test Set R² Accuracy Score:    {r2:.4f} ({r2*100:.2f}%)")
    print(f"  • Test Mean Absolute Error (MAE): ₹{mae:,.2f} ({mae/100000:.2f} Lakhs)")
    print(f"  • Test Root Mean Sq Error (RMSE):₹{rmse:,.2f} ({rmse/100000:.2f} Lakhs)")
    print("==============================================================================\n")

    # Serialize Model Artifacts
    joblib.dump(xgb_model, MODEL_PKL_PATH)
    joblib.dump(xgb_model, MODEL_JOBLIB_PATH)
    print(f"Saved trained XGBoost model to: {MODEL_PKL_PATH}")

    metadata = {
        "project": "VERIXA Real Estate Platform",
        "author": "Ansari Faizanalam Firojalam",
        "institution": "Department of CSE, LJ University",
        "winning_model": "XGBoost Regressor",
        "test_r2_score": round(r2, 4),
        "cv_r2_score": round(mean_cv_r2, 4),
        "test_mae_lakhs": round(mae / 100000.0, 2),
        "test_rmse_lakhs": round(rmse / 100000.0, 2),
        "feature_count": len(feature_cols),
        "feature_columns": feature_cols
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=4)
    print(f"Saved model metadata JSON to: {METADATA_PATH}")

    # Plot Feature Importance
    fig, ax = plt.subplots(figsize=(10, 6))
    importances = xgb_model.feature_importances_
    feat_imp = pd.DataFrame({"Feature": feature_cols, "Importance": importances})
    feat_imp = feat_imp.sort_values(by="Importance", ascending=False).head(15)

    sns.barplot(x="Importance", y="Feature", data=feat_imp, hue="Feature", palette="magma", legend=False, ax=ax)
    ax.set_title("Verixa XGBoost AVM - Top 15 Feature Importances", fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS_DIR, "xgboost_feature_importance.png"), dpi=300)
    plt.close()

    return xgb_model, feature_cols

if __name__ == '__main__':
    train_and_evaluate_xgboost()

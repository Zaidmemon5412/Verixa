"""
==============================================================================
VERIXA REAL ESTATE ML ENGINE - AREA PREDICTIONS BLUEPRINT GENERATOR
==============================================================================
Generates area-wise predictions, OSM connectivity ratings (1-10 scale),
locality rate indices, usable living space ratios, and Smart Deal Badges
as specified in the LJ University CSE Blueprint.
"""

import os
import sys
import numpy as np
import pandas as pd
import joblib

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

ML_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_DIR = os.path.join(ML_DIR, "CSV")
MODELS_DIR = os.path.join(ML_DIR, "models")
MODEL_PKL_PATH = os.path.join(MODELS_DIR, "verixa_xgboost_full_matrix_avm.pkl")

from train_xgboost_blueprint import preprocess_17_features

def format_inr(val):
    if val is None or pd.isna(val):
        return "N/A"
    val = float(val)
    if abs(val) >= 10_000_000.0:
        return f"₹{val/10_000_000.0:.2f} Cr"
    elif abs(val) >= 100_000.0:
        return f"₹{val/100_000.0:.2f} Lac"
    else:
        return f"₹{val:,.0f}"

def get_deal_badge(ratio):
    if ratio <= 0.90:
        return "🔥 HOT DEAL / UNDERPRICED"
    elif ratio <= 1.10:
        return "FAIR MARKET VALUE"
    else:
        return "⚠️ OVERPRICED"

def generate_blueprint_predictions():
    print("==============================================================================")
    print(" VERIXA XGBOOST BLUEPRINT PREDICTION GENERATOR")
    print("==============================================================================\n")

    if not os.path.exists(MODEL_PKL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PKL_PATH}. Run train_xgboost_blueprint.py first!")

    xgb_model = joblib.load(MODEL_PKL_PATH)
    expected_feature_names = xgb_model.get_booster().feature_names

    area_files = {
        "Chandkheda": "Chandkheda.csv",
        "Sindhu Bhavan": "SindhuBhavan.csv",
        "Sola": "Sola.csv",
        "Thaltej": "Thaltej.csv",
        "Gota": "gota_data.csv",
        "Satellite": "Satellite.csv"
    }

    summary_records = []
    area_dfs = []

    for area_name, filename in area_files.items():
        file_path = os.path.join(CSV_DIR, filename)
        df_area_raw = pd.read_csv(file_path)

        # Apply spatial & feature engineering
        df_proc, X, y_raw, _ = preprocess_17_features(df_area_raw)

        # Reindex features to match exact trained model feature columns
        X_aligned = X.reindex(columns=expected_feature_names, fill_value=0)

        # XGBoost Prediction (Target was log1p)
        log_preds = xgb_model.predict(X_aligned)
        predicted_prices = np.expm1(log_preds)

        df_area_raw['dist_metro_km'] = df_proc['dist_metro_km']
        df_area_raw['dist_highway_km'] = df_proc['dist_highway_km']
        df_area_raw['verixa_connectivity_rating'] = df_proc['verixa_connectivity_rating']
        df_area_raw['carpet_efficiency'] = df_proc['carpet_efficiency']
        df_area_raw['floor_ratio'] = df_proc['floor_ratio']

        df_area_raw['xgboost_predicted_price'] = np.round(predicted_prices, 2)
        df_area_raw['predicted_price_formatted'] = [format_inr(p) for p in predicted_prices]
        
        # Mispricing ratio = Listed Price / Predicted Fair Price
        mispricing_ratios = df_area_raw['price'] / df_area_raw['xgboost_predicted_price']
        df_area_raw['mispricing_ratio'] = np.round(mispricing_ratios, 4)
        df_area_raw['deal_badge'] = mispricing_ratios.apply(get_deal_badge)

        # Price per sqft benchmark
        df_area_raw['predicted_price_per_sqft'] = np.round(df_area_raw['xgboost_predicted_price'] / df_area_raw['carpet_area'], 2)

        # Save area predictions CSV
        out_filename = filename.replace('.csv', '_blueprint_predictions.csv')
        out_path = os.path.join(CSV_DIR, out_filename)
        df_area_raw.to_csv(out_path, index=False)

        # Area metrics
        avg_listed = df_area_raw['price'].mean()
        avg_predicted = df_area_raw['xgboost_predicted_price'].mean()
        avg_sqft_rate = df_area_raw['predicted_price_per_sqft'].mean()
        avg_rating = df_area_raw['verixa_connectivity_rating'].mean()

        badge_counts = df_area_raw['deal_badge'].value_counts().to_dict()

        summary_records.append({
            "Area": area_name,
            "Properties": len(df_area_raw),
            "Avg Listed Price": format_inr(avg_listed),
            "Avg XGBoost Fair Price": format_inr(avg_predicted),
            "Locality Rate Index": f"₹{avg_sqft_rate:,.0f}/sqft",
            "Avg Connectivity Rating": f"{avg_rating:.1f} / 10",
            "Hot Deals (≤0.90)": badge_counts.get("🔥 HOT DEAL / UNDERPRICED", 0),
            "Fair Market (0.91-1.10)": badge_counts.get("FAIR MARKET VALUE", 0),
            "Overpriced (≥1.11)": badge_counts.get("⚠️ OVERPRICED", 0),
            "Output CSV": out_filename
        })

        area_dfs.append(df_area_raw)
        print(f"[{area_name:<14}] | Properties: {len(df_area_raw):<3} | Avg Listed: {format_inr(avg_listed):<12} | Avg XGBoost Fair: {format_inr(avg_predicted):<12} | Rating: {avg_rating:.1f}/10")

    # Combine into master output CSV
    combined_master_path = os.path.join(CSV_DIR, "combined_xgboost_blueprint_predictions.csv")
    pd.concat(area_dfs, ignore_index=True).to_csv(combined_master_path, index=False)
    print(f"\nSaved combined master blueprint prediction dataset to: {combined_master_path}")

    summary_df = pd.DataFrame(summary_records)
    print("\n==============================================================================")
    print(" VERIXA XGBOOST BLUEPRINT AREA-WISE SUMMARY TABLE")
    print("==============================================================================")
    print(summary_df.to_string(index=False))

if __name__ == '__main__':
    generate_blueprint_predictions()

"""
==============================================================================
Verixa ML Engine - Production Django Prediction Service
==============================================================================
Clean architecture prediction service providing single property fair market price
valuation, listed price comparison, price difference percentage, and 5-tier valuation verdict.
"""

import sys
import numpy as np
import pandas as pd

from ml.config.settings import (
    CATEGORICAL_FEATURES,
    NUMERIC_FEATURES,
    VERDICT_LABELS,
    VERDICT_THRESHOLDS,
)
from ml.model_loader import get_production_model, get_production_metadata


def format_inr_currency(val_inr):
    """
    Formats a raw numerical INR value into human-readable Indian Rupee strings (Lakhs / Crores).
    Example: 7000000 -> '₹70.00 Lakhs', 15000000 -> '₹1.50 Crore'
    """
    if val_inr is None or pd.isna(val_inr):
        return "N/A"
    
    val_inr = float(val_inr)
    if abs(val_inr) >= 10_000_000.0:
        crores = val_inr / 10_000_000.0
        return f"₹{crores:.2f} Crore"
    elif abs(val_inr) >= 100_000.0:
        lakhs = val_inr / 100_000.0
        return f"₹{lakhs:.2f} Lakhs"
    else:
        return f"₹{val_inr:,.0f}"


def calculate_valuation_verdict(listed_price, predicted_fair_price):
    """
    Calculates the price difference, percentage difference, and determines
    the 5-tier Verixa Valuation Verdict.
    
    Parameters:
        listed_price (float): The seller's asking/listed price in INR.
        predicted_fair_price (float): Verixa ML model predicted fair price in INR.
        
    Returns:
        tuple: (price_difference, diff_percentage, verdict_key, verdict_label, verdict_color)
    """
    price_difference = listed_price - predicted_fair_price
    diff_percentage = (price_difference / predicted_fair_price) * 100.0

    if diff_percentage <= VERDICT_THRESHOLDS["EXCELLENT_DEAL"]:
        verdict_key = "EXCELLENT_DEAL"
        verdict_label = VERDICT_LABELS["EXCELLENT_DEAL"]
        verdict_color = "#27ae60"  # Dark Green
    elif diff_percentage <= VERDICT_THRESHOLDS["GOOD_DEAL"]:
        verdict_key = "GOOD_DEAL"
        verdict_label = VERDICT_LABELS["GOOD_DEAL"]
        verdict_color = "#2ecc71"  # Light Green
    elif diff_percentage < VERDICT_THRESHOLDS["FAIR_PRICE_MAX"]:
        verdict_key = "FAIR_PRICE"
        verdict_label = VERDICT_LABELS["FAIR_PRICE"]
        verdict_color = "#3498db"  # Blue
    elif diff_percentage < VERDICT_THRESHOLDS["SLIGHTLY_OVERPRICED"]:
        verdict_key = "SLIGHTLY_OVERPRICED"
        verdict_label = VERDICT_LABELS["SLIGHTLY_OVERPRICED"]
        verdict_color = "#e67e22"  # Orange
    else:
        verdict_key = "HIGHLY_OVERPRICED"
        verdict_label = VERDICT_LABELS["HIGHLY_OVERPRICED"]
        verdict_color = "#e74c3c"  # Red

    return price_difference, round(diff_percentage, 2), verdict_key, verdict_label, verdict_color


class VerixaValuationService:
    """
    Django Service Layer for Property Fair Market Price Prediction.
    """

    def __init__(self):
        self.model_pipeline = get_production_model()
        self.metadata = get_production_metadata()

    def _prepare_input_dataframe(self, payload):
        """
        Validates and formats dictionary payload into a Pandas DataFrame
        matching the expected feature schema.
        """
        data = {}

        # Numeric Defaults
        defaults_numeric = {
            "carpet_area": 1000.0,
            "builtup_area": 1200.0,
            "super_builtup_area": 1400.0,
            "bhk": 2,
            "bathrooms": 2,
            "balconies": 1,
            "floor_number": 2,
            "total_floors": 10,
            "construction_year": 2020,
            "latitude": 23.08,
            "longitude": 72.53
        }

        # Categorical Defaults
        defaults_categorical = {
            "locality_id": 6046,
            "property_type": "Apartment",
            "transaction_type": "Resale",
            "furnishing_status": "Semifurnished",
            "facing": "East",
            "status": "Ready to move"
        }

        for num_feat in NUMERIC_FEATURES:
            val = payload.get(num_feat, defaults_numeric.get(num_feat, 0.0))
            data[num_feat] = [float(val)]

        for cat_feat in CATEGORICAL_FEATURES:
            val = payload.get(cat_feat, defaults_categorical.get(cat_feat, "Unspecified"))
            data[cat_feat] = [str(val)]

        return pd.DataFrame(data)

    def predict(self, payload):
        """
        Main Service API to predict fair market value and verdict.
        
        Parameters:
            payload (dict): Property specifications and optional listed price.
                            Example:
                            {
                                "listed_price": 7000000,
                                "carpet_area": 945,
                                "builtup_area": 1215,
                                "super_builtup_area": 1260,
                                "bhk": 2,
                                "bathrooms": 2,
                                "balconies": 1,
                                "floor_number": 6,
                                "total_floors": 12,
                                "locality_id": 6081,
                                "furnishing_status": "Semifurnished",
                                "facing": "East"
                            }
                            
        Returns:
            dict: Structured prediction results including listed price, predicted fair price,
                  price difference, percentage difference, verdict, and formatted currency strings.
        """
        # Prepare DataFrame
        df_input = self._prepare_input_dataframe(payload)

        # Execute Scikit-Learn Pipeline Prediction (Target is log1p)
        log_pred = self.model_pipeline.predict(df_input)[0]
        predicted_fair_price = float(np.expm1(log_pred))

        # Extract or estimate listed price
        listed_price = float(payload.get("listed_price", predicted_fair_price))

        # Calculate Valuation Verdict
        price_diff, diff_pct, verdict_key, verdict_label, verdict_color = calculate_valuation_verdict(
            listed_price, predicted_fair_price
        )

        return {
            "success": True,
            "model_version": self.metadata.get("model_name", "Verixa-Ensemble-v1"),
            "valuation": {
                "listed_price": round(listed_price, 2),
                "listed_price_formatted": format_inr_currency(listed_price),
                "predicted_fair_price": round(predicted_fair_price, 2),
                "predicted_fair_price_formatted": format_inr_currency(predicted_fair_price),
                "price_difference": round(price_diff, 2),
                "price_difference_formatted": format_inr_currency(price_diff),
                "diff_percentage": diff_pct,
                "verdict_key": verdict_key,
                "verdict": verdict_label,
                "verdict_color": verdict_color,
            },
            "property_summary": {
                "bhk": int(df_input["bhk"].values[0]),
                "carpet_area_sqft": float(df_input["carpet_area"].values[0]),
                "locality_id": int(df_input["locality_id"].values[0]),
                "furnishing_status": df_input["furnishing_status"].values[0]
            }
        }


# Module level service helper function for Django Views
_service_instance = None

def get_prediction_service():
    """Returns singleton instance of VerixaValuationService."""
    global _service_instance
    if _service_instance is None:
        _service_instance = VerixaValuationService()
    return _service_instance

def predict_property_fair_price(payload):
    """
    Convenience function for Django API View / Serializer calls.
    Usage:
        result = predict_property_fair_price(request.data)
    """
    service = get_prediction_service()
    return service.predict(payload)

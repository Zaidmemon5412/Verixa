"""
Production prediction service for calculating Verixa AI Fair Market Price
and Model Confidence Score for real estate properties.
"""
import os
import pandas as pd
import numpy as np
from typing import Dict, Any, Union

from utils import logger, format_price_inr
from model_loader import get_model_loader, ModelLoader


class FairPricePredictionService:
    """
    Production service to predict fair market value and confidence score.
    """

    def __init__(self, models_dir: str = None):
        self.loader = get_model_loader(models_dir=models_dir)

    def calculate_confidence_score(self, features_dict: Dict[str, Any], predicted_price: float) -> float:
        """
        Calculates a dynamic confidence score percentage (70% - 98%) based on:
        1. Feature completeness (presence of carpet_area, bhk, locality_name, etc.)
        2. Reasonable price-per-sqft boundaries.
        3. Model tree estimator variance (if available).
        """
        base_confidence = 88.0

        # 1. Feature completeness bonus/penalty
        essential_keys = ['carpet_area', 'bhk', 'locality_name', 'property_type', 'furnishing_status']
        present_count = sum(1 for k in essential_keys if features_dict.get(k) is not None)
        completeness_factor = (present_count / len(essential_keys)) * 7.0

        # 2. Area ratio validation
        area = float(features_dict.get('carpet_area') or features_dict.get('builtup_area') or 0)
        area_factor = 0.0
        if area > 0:
            psf = predicted_price / area
            # Typical price per sqft ranges in target localities (₹3,000 to ₹120,000 / sqft)
            if 3000 <= psf <= 120000:
                area_factor = 3.0
            else:
                area_factor = -5.0

        # 3. Estimator variance check if tree ensemble
        model = self.loader.model
        variance_bonus = 0.0
        if hasattr(model, 'estimators_'):
            try:
                # Calculate prediction across all individual trees
                X_trans = self.loader.preprocessor.transform(pd.DataFrame([features_dict]))
                tree_preds = [tree.predict(X_trans)[0] for tree in model.estimators_[:30]]
                std_dev = np.std(tree_preds)
                cv = std_dev / (predicted_price + 1e-5) # Coefficient of variation
                if cv < 0.10:
                    variance_bonus = 2.0
                elif cv > 0.25:
                    variance_bonus = -3.0
            except Exception:
                pass

        total_confidence = base_confidence + completeness_factor + area_factor + variance_bonus
        # Clip between 70% and 98%
        return round(float(np.clip(total_confidence, 70.0, 98.5)), 1)

    def predict_fair_price(self, input_features: Union[Dict[str, Any], pd.DataFrame]) -> Dict[str, Any]:
        """
        Predicts fair price for a property feature dictionary or DataFrame.

        Parameters:
            input_features: dict containing property attributes (e.g. bhk, carpet_area, locality_name, etc.)

        Returns:
            dict containing:
                - predicted_fair_price (float)
                - predicted_fair_price_formatted (str)
                - confidence_score (float)
                - model_type (str)
        """
        if isinstance(input_features, dict):
            features_dict = input_features
            df_input = pd.DataFrame([input_features])
        elif isinstance(input_features, pd.DataFrame):
            features_dict = input_features.iloc[0].to_dict()
            df_input = input_features
        else:
            raise ValueError("Input features must be a dictionary or pandas DataFrame.")

        # Transform features via loaded preprocessor
        X_trans = self.loader.preprocessor.transform(df_input)

        # Predict price via loaded best model
        raw_pred = self.loader.model.predict(X_trans)[0]
        predicted_price = float(np.maximum(raw_pred, 100_000)) # Floor at ₹1 Lakh

        # Calculate confidence score
        confidence_score = self.calculate_confidence_score(features_dict, predicted_price)

        formatted_price = format_price_inr(predicted_price)

        result = {
            "predicted_fair_price": round(predicted_price, 2),
            "predicted_fair_price_formatted": formatted_price,
            "confidence_score": confidence_score,
            "model_type": self.loader.model_info["model_type"],
        }

        logger.info(f"Fair Price Prediction Result: {result['predicted_fair_price_formatted']} | Confidence: {confidence_score}%")
        return result


# Singleton prediction function helper
_prediction_service_instance = None

def predict_property_fair_price(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Helper function for quick inference on property features.
    """
    global _prediction_service_instance
    if _prediction_service_instance is None:
        _prediction_service_instance = FairPricePredictionService()
    return _prediction_service_instance.predict_fair_price(features)


if __name__ == "__main__":
    # Test Prediction Service with Sample Property Input
    sample_input = {
        "bhk": 3,
        "carpet_area": 1450.0,
        "builtup_area": 1650.0,
        "super_builtup_area": 2100.0,
        "bathrooms": 3,
        "balconies": 2,
        "parking_spaces": 1,
        "floor_number": 5,
        "total_floors": 12,
        "construction_age": 2,
        "locality_name": "Satellite",
        "property_type": "APARTMENT",
        "transaction_type": "RESALE",
        "furnishing_status": "SEMI_FURNISHED",
        "facing": "EAST",
        "status": "READY"
    }

    service = FairPricePredictionService()
    prediction = service.predict_fair_price(sample_input)
    import json
    print("\nSample Property Inference Test:")
    print(json.dumps(prediction, indent=2))

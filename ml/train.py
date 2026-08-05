"""
Model training, evaluation, automated model selection, and serialization
for the Verixa AI Fair Price Prediction Engine.
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any

from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

# Regression Models
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor, GradientBoostingRegressor

try:
    from xgboost import XGBRegressor
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

from utils import logger, load_raw_dataset, format_price_inr
from preprocessing import DataPreprocessor


class ModelTrainer:
    """
    Automated trainer that evaluates multiple regression algorithms,
    selects the highest performing model, and serializes artifacts.
    """

    def __init__(self, models_dir: str = None):
        if models_dir is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            models_dir = os.path.join(base_dir, "models")
        self.models_dir = models_dir
        os.makedirs(self.models_dir, exist_ok=True)

        self.preprocessor = DataPreprocessor()
        self.best_model = None
        self.best_model_name = ""
        self.best_metrics = {}
        self.all_results = {}

    def get_candidate_models(self) -> Dict[str, Any]:
        """
        Instantiates candidate regression models for benchmark evaluation.
        """
        candidates = {
            "LinearRegression": LinearRegression(),
            "DecisionTree": DecisionTreeRegressor(max_depth=12, random_state=42),
            "RandomForest": RandomForestRegressor(n_estimators=150, max_depth=15, random_state=42, n_jobs=-1),
            "ExtraTrees": ExtraTreesRegressor(n_estimators=150, max_depth=15, random_state=42, n_jobs=-1),
            "GradientBoosting": GradientBoostingRegressor(n_estimators=150, learning_rate=0.08, max_depth=6, random_state=42),
        }

        if HAS_XGBOOST:
            candidates["XGBoost"] = XGBRegressor(
                n_estimators=150,
                learning_rate=0.08,
                max_depth=6,
                random_state=42,
                n_jobs=-1
            )

        return candidates

    def train_and_evaluate(self) -> Dict[str, Any]:
        """
        Executes end-to-end preprocessing, train-test split, model training,
        evaluation matrix computation, best model selection, and serialization.
        """
        logger.info("=== Starting AI Fair Price Model Training Pipeline ===")
        
        # 1. Load Dataset
        df_raw = load_raw_dataset()

        # 2. Fit Preprocessor & Transform Features
        X_trans, y, cleaned_df = self.preprocessor.fit_transform(df_raw)

        # 3. Train-Test Split (80% Train, 20% Test)
        X_train, X_test, y_train, y_test = train_test_split(
            X_trans, y, test_size=0.20, random_state=42
        )

        logger.info(f"Training split: {X_train.shape[0]} samples | Test split: {X_test.shape[0]} samples")

        # 4. Train & Benchmark Models
        candidate_models = self.get_candidate_models()
        best_score = -float('inf')

        logger.info("-" * 75)
        logger.info(f"{'Model Name':<20} | {'R² Score':<10} | {'MAE (₹)':<15} | {'RMSE (₹)':<15}")
        logger.info("-" * 75)

        for name, model in candidate_models.items():
            try:
                # Fit model
                model.fit(X_train, y_train)

                # Predictions
                y_pred = model.predict(X_test)

                # Calculate metrics
                r2 = float(r2_score(y_test, y_pred))
                mae = float(mean_absolute_error(y_test, y_pred))
                rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))

                self.all_results[name] = {
                    "r2_score": round(r2, 4),
                    "mae": round(mae, 2),
                    "rmse": round(rmse, 2),
                    "mae_formatted": format_price_inr(mae),
                    "rmse_formatted": format_price_inr(rmse)
                }

                logger.info(f"{name:<20} | {r2:<10.4f} | {format_price_inr(mae):<15} | {format_price_inr(rmse):<15}")

                # Selection strategy: Best R² score
                if r2 > best_score:
                    best_score = r2
                    self.best_model = model
                    self.best_model_name = name
                    self.best_metrics = self.all_results[name]

            except Exception as e:
                logger.error(f"Failed training candidate model '{name}': {e}")

        logger.info("-" * 75)
        logger.info(f"🏆 BEST MODEL SELECTED: {self.best_model_name} (R²: {self.best_metrics['r2_score']:.4f})")

        # 5. Save Artifacts
        best_model_path = os.path.join(self.models_dir, "best_model.pkl")
        preprocessor_path = os.path.join(self.models_dir, "preprocessor.pkl")
        metrics_report_path = os.path.join(self.models_dir, "metrics_report.json")

        joblib.dump(self.best_model, best_model_path)
        logger.info(f"Saved best model ({self.best_model_name}) to: {best_model_path}")

        self.preprocessor.save(preprocessor_path)

        # Save Metrics JSON Report
        report_payload = {
            "selected_best_model": self.best_model_name,
            "best_metrics": self.best_metrics,
            "all_model_evaluations": self.all_results,
            "training_samples": int(X_train.shape[0]),
            "test_samples": int(X_test.shape[0]),
            "feature_count": int(X_trans.shape[1])
        }

        with open(metrics_report_path, "w") as f:
            json.dump(report_payload, f, indent=4)
        logger.info(f"Saved evaluation metrics report to: {metrics_report_path}")

        logger.info("=== Model Training & Evaluation Complete ===")
        return report_payload


if __name__ == "__main__":
    trainer = ModelTrainer()
    results = trainer.train_and_evaluate()
    print("\nTraining Results Summary:")
    print(json.dumps(results, indent=2))

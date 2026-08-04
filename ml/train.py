"""
==============================================================================
Verixa ML Engine - Model Training, Evaluation & Serialization
==============================================================================
Loads cleaned property datasets, executes feature engineering, compares multiple
regression algorithms (Linear Regression, Decision Tree, Random Forest, Gradient Boosting),
evaluates using 5-Fold Cross-Validation, generates diagnostic plots, and serializes the production model via joblib.
"""

import json
import os
import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

# Add parent directory to sys.path to enable package imports
sys.path.insert(0, str(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from ml.config.settings import (
    DATA_PATH,
    EXCLUDED_COLS,
    METADATA_FILE_PATH,
    MODEL_FILE_PATH,
    PLOTS_DIR,
    TARGET_COL,
)
from ml.preprocessing import create_full_pipeline

# Ensure UTF-8 output formatting
sys.stdout.reconfigure(encoding='utf-8')
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')


def load_data():
    """Loads cleaned property dataset from CSV and splits into features (X) and raw target (y)."""
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Cleaned dataset not found at {DATA_PATH}. Run clean_data.py first!")
    
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded dataset from '{DATA_PATH}' with shape: {df.shape}")

    # Drop target and excluded non-feature columns
    feature_cols = [c for c in df.columns if c not in EXCLUDED_COLS]
    X = df[feature_cols].copy()
    y_raw = df[TARGET_COL].values
    
    # Log-transformation of target to handle price skewness: y_log = log(price + 1)
    y_log = np.log1p(y_raw)
    
    return df, X, y_raw, y_log


def evaluate_models(X_train, y_train_log, X_test, y_test_raw, k_folds=5):
    """
    Trains and compares multiple regression models using 5-Fold Cross Validation
    and evaluates out-of-fold generalization on the test set.
    """
    candidate_models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree": DecisionTreeRegressor(max_depth=6, random_state=42),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=1),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=150, learning_rate=0.08, max_depth=4, random_state=42)
    }

    results = {}
    kf = KFold(n_splits=k_folds, shuffle=True, random_state=42)

    print("\n==============================================================================")
    print(" 1. MODEL EVALUATION & COMPARISON (5-FOLD CROSS-VALIDATION)")
    print("==============================================================================")

    for name, model in candidate_models.items():
        pipeline = create_full_pipeline(model)
        
        # Cross-validation R2 on log-scaled target
        cv_r2_scores = cross_val_score(pipeline, X_train, y_train_log, cv=kf, scoring="r2", n_jobs=1)
        mean_cv_r2 = cv_r2_scores.mean()

        # Fit on training set and predict on test set
        pipeline.fit(X_train, y_train_log)
        y_pred_log = pipeline.predict(X_test)
        
        # Exponentiate predictions back to real INR currency scale
        y_pred_raw = np.expm1(y_pred_log)

        # Test set metrics on original currency scale
        test_r2 = r2_score(y_test_raw, y_pred_raw)
        test_mae = mean_absolute_error(y_test_raw, y_pred_raw)
        test_rmse = np.sqrt(mean_squared_error(y_test_raw, y_pred_raw))

        results[name] = {
            "pipeline": pipeline,
            "mean_cv_r2": mean_cv_r2,
            "test_r2": test_r2,
            "test_mae": test_mae,
            "test_rmse": test_rmse,
            "y_pred_raw": y_pred_raw
        }

        print(f"[{name:<18}] 5-Fold CV R²: {mean_cv_r2:.4f} | Test R²: {test_r2:.4f} | Test MAE: ₹{test_mae:,.0f} | Test RMSE: ₹{test_rmse:,.0f}")

    return results


def generate_visualizations(results, winner_name, best_pipeline, X_test, y_test_raw):
    """
    Generates and saves 4 publication-quality ML diagnostic charts in ml/plots/.
    """
    print("\n==============================================================================")
    print(" 2. GENERATING MODEL EVALUATION VISUALIZATIONS")
    print("==============================================================================")

    # 1. Model Comparison Chart
    fig, ax = plt.subplots(figsize=(9, 5))
    names = list(results.keys())
    cv_r2s = [results[n]["mean_cv_r2"] for n in names]
    test_r2s = [results[n]["test_r2"] for n in names]

    x = np.arange(len(names))
    width = 0.35

    ax.bar(x - width/2, cv_r2s, width, label='5-Fold CV R²', color='#3498db')
    ax.bar(x + width/2, test_r2s, width, label='Test Set R²', color='#2ecc71')

    ax.set_ylabel('R² Score')
    ax.set_title('Verixa ML - Model Comparison (R² Score)', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(names)
    ax.set_ylim(0, 1.0)
    ax.legend(loc='lower right')
    plt.tight_layout()
    plot_path1 = os.path.join(PLOTS_DIR, "model_comparison.png")
    plt.savefig(plot_path1, dpi=300)
    plt.close()
    print(f"Saved plot: [model_comparison.png] -> {plot_path1}")

    # Predict with tuned model
    best_y_pred_log = best_pipeline.predict(X_test)
    best_y_pred_raw = np.expm1(best_y_pred_log)

    # 2. Actual vs Predicted Price Scatter Plot
    fig, ax = plt.subplots(figsize=(8, 6))
    y_test_lakhs = y_test_raw / 100_000.0
    pred_lakhs = best_y_pred_raw / 100_000.0

    ax.scatter(y_test_lakhs, pred_lakhs, alpha=0.7, color='#2c3e50', edgecolors='w', s=60)
    max_val = max(y_test_lakhs.max(), pred_lakhs.max())
    ax.plot([0, max_val], [0, max_val], 'r--', label='Perfect 1:1 Prediction Line')

    ax.set_xlabel('Actual Price (₹ Lakhs)', fontsize=12)
    ax.set_ylabel('Predicted Fair Price (₹ Lakhs)', fontsize=12)
    ax.set_title(f'Verixa Fair Price Model - Actual vs Predicted ({winner_name})', fontsize=13, fontweight='bold')
    ax.legend()
    plt.tight_layout()
    plot_path2 = os.path.join(PLOTS_DIR, "actual_vs_predicted.png")
    plt.savefig(plot_path2, dpi=300)
    plt.close()
    print(f"Saved plot: [actual_vs_predicted.png] -> {plot_path2}")

    # 3. Residuals Distribution Plot
    fig, ax = plt.subplots(figsize=(8, 5))
    residuals_lakhs = (y_test_raw - best_y_pred_raw) / 100_000.0
    sns.histplot(residuals_lakhs, kde=True, ax=ax, color='#e74c3c', bins=20)

    ax.axvline(0, color='black', linestyle='--', linewidth=1.5)
    ax.set_xlabel('Residuals Error (Actual - Predicted in ₹ Lakhs)', fontsize=12)
    ax.set_ylabel('Frequency', fontsize=12)
    ax.set_title('Verixa Model Residuals Distribution', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plot_path3 = os.path.join(PLOTS_DIR, "residuals_distribution.png")
    plt.savefig(plot_path3, dpi=300)
    plt.close()
    print(f"Saved plot: [residuals_distribution.png] -> {plot_path3}")

    # 4. Feature Importance Plot
    regressor = best_pipeline.named_steps["regressor"]
    if hasattr(regressor, "feature_importances_"):
        preprocessor = best_pipeline.named_steps["preprocessor"]
        feature_names = preprocessor.get_feature_names_out()
        importances = regressor.feature_importances_
        
        # Clean feature names for display
        clean_names = [f.replace("num__", "").replace("cat__", "").replace("locality_id_", "Locality_") for f in feature_names]
        
        feat_imp_df = pd.DataFrame({"Feature": clean_names, "Importance": importances})
        feat_imp_df = feat_imp_df.sort_values(by="Importance", ascending=False).head(15)

        fig, ax = plt.subplots(figsize=(10, 6))
        sns.barplot(x="Importance", y="Feature", data=feat_imp_df, hue="Feature", palette="viridis", legend=False, ax=ax)
        ax.set_title(f'Top 15 Most Important Property Features ({winner_name})', fontsize=13, fontweight='bold')
        ax.set_xlabel('Relative Feature Importance', fontsize=12)
        plt.tight_layout()
        plot_path4 = os.path.join(PLOTS_DIR, "feature_importance.png")
        plt.savefig(plot_path4, dpi=300)
        plt.close()
        print(f"Saved plot: [feature_importance.png] -> {plot_path4}")


def save_model_artifacts(best_pipeline, winner_name, best_test_r2, best_test_mae, best_test_rmse, feature_cols):
    """
    Serializes the trained production pipeline using joblib and exports metadata JSON.
    """
    print("\n==============================================================================")
    print(" 3. SERIALIZING PRODUCTION MODEL ARTIFACTS")
    print("==============================================================================")

    # Save Pipeline
    joblib.dump(best_pipeline, MODEL_FILE_PATH)
    print(f"Exported trained joblib model to: {MODEL_FILE_PATH}")

    # Save Metadata JSON
    metadata = {
        "model_name": winner_name,
        "test_r2_score": round(best_test_r2, 4),
        "test_mae_inr": round(best_test_mae, 2),
        "test_rmse_inr": round(best_test_rmse, 2),
        "test_mae_lakhs": round(best_test_mae / 100_000.0, 2),
        "feature_columns": feature_cols,
        "target_transform": "np.log1p",
        "saved_model_path": str(MODEL_FILE_PATH)
    }

    with open(METADATA_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=4)
    print(f"Exported model metadata JSON to: {METADATA_FILE_PATH}")


def main():
    print("Starting Verixa ML Pipeline Training & Evaluation System...\n")
    
    # Load and prepare data
    df, X, y_raw, y_log = load_data()
    
    # Train / Test Split
    X_train, X_test, y_train_log, y_test_log, y_train_raw, y_test_raw = train_test_split(
        X, y_log, y_raw, test_size=0.20, random_state=42
    )

    # Model evaluation
    results = evaluate_models(X_train, y_train_log, X_test, y_test_raw, k_folds=5)

    # Select winner based on highest test R2 score
    winner_name = max(results, key=lambda k: results[k]["test_r2"])
    best_pipeline = results[winner_name]["pipeline"]
    best_test_r2 = results[winner_name]["test_r2"]
    best_test_mae = results[winner_name]["test_mae"]
    best_test_rmse = results[winner_name]["test_rmse"]

    print(f"\n🏆 WINNING MODEL ARCHITECTURE: [{winner_name}] (Test R² = {best_test_r2:.4f})")
    print(f"  • R² Score:  {best_test_r2:.4f}")
    print(f"  • MAE:       ₹{best_test_mae:,.2f} ({best_test_mae/100000:.2f} Lakhs)")
    print(f"  • RMSE:      ₹{best_test_rmse:,.2f} ({best_test_rmse/100000:.2f} Lakhs)")

    # Visualizations
    generate_visualizations(results, winner_name, best_pipeline, X_test, y_test_raw)

    # Save joblib model & metadata
    save_model_artifacts(best_pipeline, winner_name, best_test_r2, best_test_mae, best_test_rmse, list(X.columns))

    print("\n✅ Verixa ML Training Pipeline execution completed successfully!")


if __name__ == '__main__':
    main()

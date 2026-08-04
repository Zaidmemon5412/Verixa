"""
==============================================================================
Verixa ML Engine - Feature Engineering & Preprocessing Pipeline
==============================================================================
Provides custom domain-specific feature engineering transformers and scikit-learn
ColumnTransformers for standardizing numeric features and one-hot encoding categoricals.
"""

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from ml.config.settings import (
    CATEGORICAL_FEATURES,
    CURRENT_YEAR,
    ENGINEERED_NUMERIC_FEATURES,
    NUMERIC_FEATURES,
)


class VerixaFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Custom Scikit-Learn Transformer for Verixa Real Estate Feature Engineering.
    Calculates domain-specific metrics: property age, floor ratio, area efficiency,
    and bathroom-to-BHK ratio.
    """

    def __init__(self, current_year=CURRENT_YEAR):
        self.current_year = current_year

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        
        # 1. Property Age
        if "construction_year" in X.columns:
            X["property_age"] = (self.current_year - X["construction_year"]).clip(lower=0)
        else:
            X["property_age"] = 5  # default baseline

        # 2. Floor Ratio (high-rise level relative to total building height)
        if "floor_number" in X.columns and "total_floors" in X.columns:
            X["floor_ratio"] = (X["floor_number"] / (X["total_floors"] + 1)).clip(0, 1)
        else:
            X["floor_ratio"] = 0.5

        # 3. Area Efficiency (usable carpet area vs super builtup area)
        if "carpet_area" in X.columns and "super_builtup_area" in X.columns:
            X["area_efficiency"] = (X["carpet_area"] / (X["super_builtup_area"] + 1e-5)).clip(0, 1)
        else:
            X["area_efficiency"] = 0.75

        # 4. Bathrooms to BHK Ratio
        if "bathrooms" in X.columns and "bhk" in X.columns:
            X["bath_bhk_ratio"] = (X["bathrooms"] / (X["bhk"] + 1e-5)).clip(0.5, 3.0)
        else:
            X["bath_bhk_ratio"] = 1.0

        return X


def build_preprocessor():
    """
    Constructs the ColumnTransformer for scaling numeric features and one-hot encoding categoricals.
    """
    all_numeric_features = NUMERIC_FEATURES + ENGINEERED_NUMERIC_FEATURES

    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown="ignore", sparse_output=False)

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, all_numeric_features),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ],
        remainder="drop"
    )
    return preprocessor


def create_full_pipeline(regressor_model):
    """
    Wraps Feature Engineering, Column Preprocessor, and Regressor into a single Scikit-Learn Pipeline.
    
    Parameters:
        regressor_model: An uninstantiated or instantiated scikit-learn regressor.
        
    Returns:
        Pipeline: Complete end-to-end processing & regression pipeline.
    """
    pipeline = Pipeline(
        steps=[
            ("feature_engineer", VerixaFeatureEngineer()),
            ("preprocessor", build_preprocessor()),
            ("regressor", regressor_model)
        ]
    )
    return pipeline

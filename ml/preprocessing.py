"""
Data cleaning, feature engineering, and preprocessing pipeline for
the Verixa AI Fair Price Prediction Engine.
"""
import os
import joblib
import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any

from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

from utils import logger, load_raw_dataset

# Defined feature columns
NUMERICAL_FEATURES = [
    'bhk',
    'carpet_area',
    'builtup_area',
    'super_builtup_area',
    'bathrooms',
    'balconies',
    'parking_spaces',
    'floor_number',
    'total_floors',
    'construction_age',
]

CATEGORICAL_FEATURES = [
    'locality_name',
    'property_type',
    'transaction_type',
    'furnishing_status',
    'facing',
    'status',
]

TARGET_COLUMN = 'price'


class AddressLocalityExtractor(BaseEstimator, TransformerMixin):
    """
    Custom transformer to extract locality name from address string.
    """
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        return X


class DataPreprocessor:
    """
    Production-ready preprocessor encapsulating data cleaning, outlier removal,
    feature engineering, and Scikit-Learn ColumnTransformer pipeline.
    """

    def __init__(self):
        self.numerical_features = NUMERICAL_FEATURES
        self.categorical_features = CATEGORICAL_FEATURES
        self.target_column = TARGET_COLUMN
        self.pipeline = None
        self.is_fitted = False

    def extract_locality_name(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Extracts clean locality name from address or location column if missing.
        """
        df = df.copy()
        if 'locality_name' not in df.columns:
            if 'address' in df.columns:
                def parse_loc(addr):
                    if pd.isna(addr):
                        return 'Other'
                    parts = [p.strip() for p in str(addr).split(',')]
                    if len(parts) >= 2:
                        # Return second last or middle item as locality (e.g. "Satellite, Ahmedabad" -> "Satellite")
                        for part in reversed(parts[:-1]):
                            if part.lower() not in ['ahmedabad', 'gujarat', 'india', '']:
                                return part
                        return parts[0]
                    return parts[0] if parts else 'Other'
                
                df['locality_name'] = df['address'].apply(parse_loc)
            else:
                df['locality_name'] = 'Other'

        return df

    def clean_dataset(self, df: pd.DataFrame, is_training: bool = True) -> pd.DataFrame:
        """
        Cleans data types, handles nulls, and removes price/area outliers.
        """
        logger.info("Starting data cleaning and feature engineering...")
        df = df.copy()

        # 1. Extract locality name
        df = self.extract_locality_name(df)

        # 2. Convert numeric columns
        for col in self.numerical_features:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            else:
                df[col] = np.nan

        # Fill builtup / super_builtup defaults if missing from carpet_area
        if 'carpet_area' in df.columns:
            df['carpet_area'] = pd.to_numeric(df['carpet_area'], errors='coerce')
            if 'builtup_area' in df.columns:
                df['builtup_area'] = df['builtup_area'].fillna(df['carpet_area'] * 1.15)
            if 'super_builtup_area' in df.columns:
                df['super_builtup_area'] = df['super_builtup_area'].fillna(df['carpet_area'] * 1.40)

        # Default values for integer count features
        for col in ['bhk', 'bathrooms', 'balconies', 'parking_spaces']:
            if col in df.columns:
                df[col] = df[col].fillna(1)

        for col in ['floor_number', 'total_floors']:
            if col in df.columns:
                df[col] = df[col].fillna(1)

        if 'construction_age' in df.columns:
            df['construction_age'] = df['construction_age'].fillna(3)

        # 3. Categorical string normalization
        for col in self.categorical_features:
            if col in df.columns:
                df[col] = df[col].astype(str).str.strip().str.upper()
                df[col] = df[col].replace({'NONE': 'UNFURNISHED', 'NAN': 'UNFURNISHED', 'NULL': 'UNFURNISHED'})
            else:
                df[col] = 'UNKNOWN'

        # 4. Target cleaning and outlier removal for training
        if is_training and self.target_column in df.columns:
            df[self.target_column] = pd.to_numeric(df[self.target_column], errors='coerce')
            df = df.dropna(subset=[self.target_column])
            
            # Remove invalid zero or negative prices
            df = df[df[self.target_column] > 100_000]

            # Remove extreme outliers (1st to 99th percentile)
            q_low = df[self.target_column].quantile(0.005)
            q_high = df[self.target_column].quantile(0.995)
            df = df[(df[self.target_column] >= q_low) & (df[self.target_column] <= q_high)]

            # Remove area outliers
            if 'carpet_area' in df.columns:
                df = df[(df['carpet_area'] > 100) & (df['carpet_area'] < 20_000)]

            # Remove duplicates
            subset_cols = [c for c in ['property_name', 'address', 'price', 'carpet_area'] if c in df.columns]
            if subset_cols:
                df = df.drop_duplicates(subset=subset_cols)

            logger.info(f"Cleaned training dataset shape: {df.shape}")

        return df

    def build_pipeline(self) -> ColumnTransformer:
        """
        Creates Scikit-Learn ColumnTransformer for numeric & categorical features.
        """
        num_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])

        cat_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])

        preprocessor_pipeline = ColumnTransformer(
            transformers=[
                ('num', num_transformer, self.numerical_features),
                ('cat', cat_transformer, self.categorical_features),
            ],
            remainder='drop'
        )

        return preprocessor_pipeline

    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, pd.DataFrame]:
        """
        Fits preprocessor on training DataFrame and transforms features and target.
        """
        cleaned_df = self.clean_dataset(df, is_training=True)
        
        X = cleaned_df[self.numerical_features + self.categorical_features]
        y = cleaned_df[self.target_column].values

        self.pipeline = self.build_pipeline()
        X_trans = self.pipeline.fit_transform(X)
        self.is_fitted = True

        logger.info(f"Fitted preprocessor feature matrix shape: {X_trans.shape}")
        return X_trans, y, cleaned_df

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """
        Transforms input feature DataFrame using fitted preprocessor pipeline.
        """
        if not self.is_fitted or self.pipeline is None:
            raise RuntimeError("Preprocessor must be fitted before calling transform.")

        cleaned_df = self.clean_dataset(df, is_training=False)
        X = cleaned_df[self.numerical_features + self.categorical_features]
        return self.pipeline.transform(X)

    def save(self, file_path: str):
        """
        Serializes preprocessor instance to disk using joblib.
        """
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        joblib.dump(self, file_path)
        logger.info(f"Saved preprocessor to: {file_path}")

    @staticmethod
    def load(file_path: str) -> "DataPreprocessor":
        """
        Loads serialized preprocessor instance from disk.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Preprocessor file not found at: {file_path}")
        preprocessor = joblib.load(file_path)
        logger.info(f"Loaded preprocessor from: {file_path}")
        return preprocessor

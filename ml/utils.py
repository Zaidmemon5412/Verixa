"""
Utility functions for data loading, logging, and currency formatting
for the Verixa Machine Learning Module.
"""
import os
import logging
import pandas as pd

logger = logging.getLogger("verixa_ml")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] %(name)s: %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


def get_dataset_path() -> str:
    """
    Locates the dataset CSV file inside ml/data/ or ml/ or root.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(base_dir, "data", "properties_property.csv"),
        os.path.join(base_dir, "properties_property.csv"),
        os.path.join(os.path.dirname(base_dir), "properties_property.csv"),
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    raise FileNotFoundError("properties_property.csv dataset file could not be found.")


def load_raw_dataset() -> pd.DataFrame:
    """
    Loads raw properties dataset from CSV file.
    """
    csv_path = get_dataset_path()
    logger.info(f"Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    logger.info(f"Loaded raw dataset shape: {df.shape}")
    return df


def format_price_inr(price: float) -> str:
    """
    Formats a numeric price into Lakhs / Crores formatted string.
    Example:
        5500000.0 -> "₹55.00 Lakh"
        12500000.0 -> "₹1.25 Cr"
    """
    if price is None or pd.isna(price) or price <= 0:
        return "₹0.00"

    price = float(price)
    if price >= 10_000_000:
        cr_val = price / 10_000_000
        return f"₹{cr_val:.2f} Cr"
    elif price >= 100_000:
        lakh_val = price / 100_000
        return f"₹{lakh_val:.2f} Lakh"
    else:
        return f"₹{price:,.0f}"

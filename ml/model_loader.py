"""
==============================================================================
Verixa ML Engine - Singleton Model Loader
==============================================================================
Thread-safe cached model loading service for high-performance production inference
in Django. Ensures the joblib model and pipeline are loaded into memory once.
"""

import json
import os
import threading
import joblib

from ml.config.settings import METADATA_FILE_PATH, MODEL_FILE_PATH


class ModelLoader:
    """
    Singleton class managing the life cycle and in-memory loading of the
    trained Verixa Joblib Pipeline Model and its metadata JSON.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ModelLoader, cls).__new__(cls)
                cls._instance._model = None
                cls._instance._metadata = None
                cls._instance._load_model()
            return cls._instance

    def _load_model(self):
        """Loads the trained Joblib model and metadata from disk."""
        if not os.path.exists(MODEL_FILE_PATH):
            raise FileNotFoundError(
                f"Production model not found at '{MODEL_FILE_PATH}'. Please run train.py first!"
            )
        
        # Load Joblib Pipeline Model
        self._model = joblib.load(MODEL_FILE_PATH)
        
        # Load Metadata JSON
        if os.path.exists(METADATA_FILE_PATH):
            with open(METADATA_FILE_PATH, "r", encoding="utf-8") as f:
                self._metadata = json.load(f)
        else:
            self._metadata = {}

    def get_model(self):
        """Returns the loaded Scikit-Learn Joblib Pipeline."""
        if self._model is None:
            self._load_model()
        return self._model

    def get_metadata(self):
        """Returns the model metadata dictionary."""
        if self._metadata is None:
            self._load_model()
        return self._metadata

    def reload_model(self):
        """Forces reload of model from disk (useful after retraining)."""
        with self._lock:
            self._load_model()


# Module-level convenience functions
def get_production_model():
    """Helper function to retrieve the cached production model instance."""
    return ModelLoader().get_model()

def get_production_metadata():
    """Helper function to retrieve the model metadata dictionary."""
    return ModelLoader().get_metadata()

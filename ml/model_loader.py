"""
Model loader module for safely loading serialized preprocessor and best model artifacts.
"""
import os
import joblib
from utils import logger
from preprocessing import DataPreprocessor


class ModelLoader:
    """
    Singleton model loader that caches loaded artifacts in memory.
    """
    _instance = None
    _preprocessor = None
    _model = None
    _model_info = None

    def __new__(cls, models_dir: str = None):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            if models_dir is None:
                base_dir = os.path.dirname(os.path.abspath(__file__))
                models_dir = os.path.join(base_dir, "models")
            cls._instance.models_dir = models_dir
            cls._instance._load_artifacts()
        return cls._instance

    def _load_artifacts(self):
        preprocessor_path = os.path.join(self.models_dir, "preprocessor.pkl")
        best_model_path = os.path.join(self.models_dir, "best_model.pkl")

        if not os.path.exists(preprocessor_path):
            raise FileNotFoundError(f"Preprocessor artifact missing at: {preprocessor_path}. Run ml/train.py first.")
        if not os.path.exists(best_model_path):
            raise FileNotFoundError(f"Best model artifact missing at: {best_model_path}. Run ml/train.py first.")

        logger.info("Loading preprocessor and best model from disk...")
        self._preprocessor = DataPreprocessor.load(preprocessor_path)
        self._model = joblib.load(best_model_path)
        self._model_info = {
            "model_type": type(self._model).__name__,
            "preprocessor_path": preprocessor_path,
            "best_model_path": best_model_path,
        }
        logger.info(f"Successfully loaded {self._model_info['model_type']} artifact.")

    @property
    def preprocessor(self) -> DataPreprocessor:
        return self._preprocessor

    @property
    def model(self):
        return self._model

    @property
    def model_info(self) -> dict:
        return self._model_info


def get_model_loader(models_dir: str = None) -> ModelLoader:
    """
    Helper function to access cached ModelLoader instance.
    """
    return ModelLoader(models_dir=models_dir)

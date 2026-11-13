"""
Asynchronous Celery background tasks for the properties app.
Handles compute-heavy Tesseract OCR document verification and ML fair-price
recalculation out-of-band with fault-tolerant retry policies.
"""
import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    name='properties.recompute_property_fair_price_task',
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
    max_retries=3,
    acks_late=True,
)
def recompute_property_fair_price_task(self, property_id: str) -> dict:
    """
    Runs XGBoost/RandomForest ensemble fair-price inference in the background
    for the specified property.
    """
    import sys
    from pathlib import Path
    from .models import Property

    try:
        prop = Property.objects.select_related('locality').get(property_id=property_id)
    except Property.DoesNotExist:
        logger.warning("[Celery Task] Property %s no longer exists; skipping valuation.", property_id)
        return {"status": "skipped", "reason": "not_found"}

    ml_dir = Path(__file__).resolve().parent.parent.parent.parent / 'ml'
    if str(ml_dir) not in sys.path:
        sys.path.insert(0, str(ml_dir))

    # pyrefly: ignore [missing-import]
    from prediction_service import predict_property_fair_price

    features = {
        "bhk": prop.primary_bhk or 2,
        "carpet_area": float(prop.carpet_area or 1200),
        "builtup_area": float(prop.builtup_area or 1400),
        "locality_name": prop.locality.name if prop.locality else "Satellite",
        "property_type": prop.property_type or "Apartment",
        "furnishing_status": prop.furnishing_status or "Semi-Furnished",
    }
    pred_res = predict_property_fair_price(features)
    predicted_price = float(pred_res.get("predicted_fair_price", float(prop.price or 0)))
    confidence_score = float(pred_res.get("confidence_score", 95.0))

    logger.info(
        "[Celery Task] Computed fair price for Property %s: %.2f (confidence=%.1f%%)",
        property_id,
        predicted_price,
        confidence_score,
    )
    return {
        "status": "completed",
        "property_id": str(property_id),
        "predicted_fair_price": predicted_price,
        "confidence_score": confidence_score,
    }


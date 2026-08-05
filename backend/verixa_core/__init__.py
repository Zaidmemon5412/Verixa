try:
    from .celery import app as celery_app
    __all__ = ('celery_app',)
except (ImportError, ModuleNotFoundError) as err:
    import logging
    logging.getLogger(__name__).warning(f"Celery integration disabled (ModuleNotFoundError: {err})")
    celery_app = None
    __all__ = ()


# Python 3.14 Compatibility Patch for Django Template Context Copying
try:
    from django.template.context import BaseContext
    def _patched_basecontext_copy(self):
        duplicate = self.__class__.__new__(self.__class__)
        for k, v in self.__dict__.items():
            if k != 'dicts':
                setattr(duplicate, k, v)
        duplicate.dicts = self.dicts.copy()
        return duplicate

    BaseContext.__copy__ = _patched_basecontext_copy
except Exception:
    pass

try:
    from .celery import app as celery_app
    __all__ = ('celery_app',)
except Exception:
    pass

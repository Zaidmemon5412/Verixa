from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'

    def ready(self):
        """
        Perform application initialization such as registering signal receivers.
        """
        import apps.accounts.signals  # noqa

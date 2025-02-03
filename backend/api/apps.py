from django.apps import AppConfig
from utils.translations import load_translations

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        from . import translation # noqa: F401
        load_translations()
import sys
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./carouselify.db"
    secret: str = "change-me-in-production"
    polar_access_token: str = ""
    polar_webhook_secret: str = ""
    polar_organization_id: str = ""
    polar_product_id: str = ""
    polar_server: str = "production"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    subscriptions_enabled: bool = False
    admin_email: str = ""
    environment: str = "development"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

if settings.secret == "change-me-in-production" and settings.environment == "production":
    print("FATAL: SECRET env var is still set to the insecure default 'change-me-in-production'", file=sys.stderr)
    sys.exit(1)

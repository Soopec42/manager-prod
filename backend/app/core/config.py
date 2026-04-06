from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "SupportFlow API"
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "1CIRRGofNn7BVxTOQJjjDNwsuYxsAcqdLHBrFUDlP75"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = "postgresql://soop:gumanoid99@localhost:5432/projectfsp"

    model_config = SettingsConfigDict (
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


setting = Settings()
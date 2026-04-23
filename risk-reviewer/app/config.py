from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./data/reviews.db"
    upload_dir: str = "./data/uploads"

    ollama_base_url: str = "http://localhost:11434"
    text_model: str = "gemma2:2b"
    vision_model: str = "llava:7b"
    ai_timeout_seconds: int = 120

    max_upload_mb: int = 25

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

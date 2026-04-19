from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Loan Management System"
    secret_key: str = "change-this-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    testing: bool = False
    auto_create_tables: bool = True
    seed_default_admin: bool = True

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/loan_management"
    perkeso_check_url: str = "https://eis.perkeso.gov.my/eisportal/insured/appl/check"
    perkeso_timeout_ms: int = 30000
    perkeso_headless: bool = True

    # AI moderation. provider = "ollama" | "gemini" | "disabled"
    ai_provider: str = "ollama"
    ai_model: str = "gemma2:2b"
    ai_timeout_seconds: int = 60
    ollama_base_url: str = "http://localhost:11434"
    gemini_api_key: str = ""
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

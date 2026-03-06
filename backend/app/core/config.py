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

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

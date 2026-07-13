from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    project_name: str = "StadiumAI NOC"
    version: str = "0.1.0"
    
    # GCP Config
    gcp_project: str = "stadiumai-project"
    
    # Neo4j Config — no defaults for secrets
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str  # REQUIRED — must be set via env or .env
    
    # Gemini Config
    gemini_api_key: Optional[str] = None
    
    # Redis Config
    redis_url: str = "redis://localhost:6379"
    
    # Auth
    jwt_secret: str
    
    # CORS
    cors_origins: str = "http://localhost:5173"
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List, Dict

# Domain Constants for Stadium Operations
DEFAULT_STADIUM_ID: str = "STAD-01"

STADIUM_ZONES: List[str] = [
    "Z-CONC-N", "Z-GATE-E", "Z-PLAZ-E", "Z-VIP-S", "Z-ESC-S", 
    "Z-SEAT-W1", "Z-CONC-W", "Z-CORN-NW", "Z-CORN-NE", "Z-FOOD-N", 
    "Z-MERC", "Z-MED-1"
]

PLAYBOOK_MESSAGES: Dict[str, str] = {
    "PB-MED-01": "Medical First Responders Dispatched",
    "PB-FIRE-02": "Fire Safety Team Dispatched",
    "PB-CROWD-03": "Crowd Management Operations Dispatched",
    "PB-SEC-01": "Stadium Security Alpha Dispatched",
    "PB-DEFAULT": "Rapid Response Unit Dispatched"
}

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
    demo_account_username: str = "noc_operator"
    demo_account_password_hash: str
    
    # CORS
    cors_origins: str = "http://localhost:5173"
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()

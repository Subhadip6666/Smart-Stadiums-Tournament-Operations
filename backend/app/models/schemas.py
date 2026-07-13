from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class StandardResponse(BaseModel):
    data: Any
    meta: Dict[str, str] = Field(default_factory=dict)

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[List[str]] = None

class ErrorResponse(BaseModel):
    error: ErrorDetail

# Navigation Schemas
class RouteSegment(BaseModel):
    id: str
    name: str
    type: str

class RouteResponse(BaseModel):
    route_id: str
    mode: str
    segments: List[RouteSegment]
    total_walk_time_s: int

# Chat Schemas
class ChatContext(BaseModel):
    zone_id: Optional[str] = None
    stadium_id: Optional[str] = None
    match_id: Optional[str] = None

from enum import Enum

class SupportedLanguage(str, Enum):
    EN = "en"
    ES = "es"
    AR = "ar"
    FR = "fr"
    DE = "de"
    IT = "it"
    PT = "pt"
    ZH = "zh"
    JA = "ja"
    KO = "ko"
    RU = "ru"
    HI = "hi"

class ChatRequest(BaseModel):
    session_id: str
    message: str
    language: SupportedLanguage
    context: Optional[ChatContext] = None

class ChatAction(BaseModel):
    type: str
    label: str
    endpoint: str

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    language: str
    suggested_actions: List[ChatAction] = []
    confidence: float
    sources: List[str] = []

# Incident Schemas
class IncidentRequest(BaseModel):
    type: str
    severity: int = Field(ge=1, le=5)
    description: str
    zone_id: str
    stadium_id: str
    reporter_role: str

class IncidentTriage(BaseModel):
    recommended_severity: int
    reasoning: str
    recommended_playbook: str
    nearest_teams: List[Dict[str, Any]]

class IncidentResponse(BaseModel):
    incident_id: str
    status: str
    ai_triage: IncidentTriage
    created_at: str

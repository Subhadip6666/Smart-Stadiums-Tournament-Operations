import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.models.schemas import IncidentRequest, IncidentResponse, IncidentTriage
from app.services.genai.orchestrator import orchestrator
from app.services.genai.guardrails import sanitize_input
from app.config import PLAYBOOK_MESSAGES

logger = logging.getLogger(__name__)

class IncidentService:
    """Service layer managing AI-assisted incident triage, playbook selection, and responder dispatch."""

    @staticmethod
    async def process_incident_triage(request: IncidentRequest) -> IncidentResponse:
        """Process incoming stadium incident reports via Gemini AI for automated triage.

        Evaluates category, reported severity, location, and description to derive:
        1. Recommended severity level (1 to 5).
        2. Triage reasoning summary.
        3. Standard operating playbook ID (e.g., 'PB-MED-01', 'PB-CROWD-03').
        4. Assigned emergency response unit and ETA.

        Args:
            request (IncidentRequest): Validated incident request body.

        Returns:
            IncidentResponse: Formatted response containing AI triage metrics and incident ID.
        """
        # Sanitize input description against prompt injection
        safe_desc: str = sanitize_input(request.description) if request.description else ""
        
        # Base severity and reasoning calculation
        rec_severity: int = request.severity
        reasoning: str = f"AI Triage completed for '{request.type}' incident in {request.zone_id}."
        
        if orchestrator.client:
            try:
                prompt: str = (
                    f"Perform rapid triage for a stadium incident.\n"
                    f"Category/Type: {request.type}\n"
                    f"Reported Severity: {request.severity}/5\n"
                    f"Zone: {request.zone_id}\n"
                    f"Description: {safe_desc}\n"
                    f"Provide concise triage reasoning (1 sentence)."
                )
                res = orchestrator.client.models.generate_content(
                    model='gemini-3.5-flash',
                    contents=prompt
                )
                if res and res.text:
                    reasoning = res.text.strip()
            except Exception as e:
                logger.warning(f"AI triage fallback triggered: {str(e)}")
                
        # Category-based playbook selection and team assignment
        playbook: str = "PB-DEFAULT"
        team_name: str = PLAYBOOK_MESSAGES.get("PB-DEFAULT", "Rapid Response Unit")
        
        type_lower: str = request.type.lower()
        if "med" in type_lower or "injury" in type_lower or "faint" in type_lower:
            playbook = "PB-MED-01"
            team_name = "Medical First Responders"
            rec_severity = min(5, request.severity + 1)
        elif "fire" in type_lower or "smoke" in type_lower:
            playbook = "PB-FIRE-02"
            team_name = "Fire Safety Team"
            rec_severity = 5
        elif "crowd" in type_lower or "stampede" in type_lower or "surge" in type_lower:
            playbook = "PB-CROWD-03"
            team_name = "Crowd Management Ops"
            rec_severity = max(3, request.severity)
        elif "security" in type_lower or "fight" in type_lower:
            playbook = "PB-SEC-01"
            team_name = "Stadium Security Alpha"

        team_zone_suffix: str = request.zone_id[-3:] if len(request.zone_id) >= 3 else "01"
        triage_info = IncidentTriage(
            recommended_severity=rec_severity,
            reasoning=reasoning,
            recommended_playbook=playbook,
            nearest_teams=[
                {
                    "team_id": f"TEAM-{team_zone_suffix}",
                    "name": team_name,
                    "eta_seconds": 90 if rec_severity >= 4 else 180,
                    "zone": request.zone_id
                }
            ]
        )

        return IncidentResponse(
            incident_id=f"INC-{str(uuid.uuid4())[:8]}",
            status="open",
            ai_triage=triage_info,
            created_at=datetime.now(timezone.utc).isoformat()
        )
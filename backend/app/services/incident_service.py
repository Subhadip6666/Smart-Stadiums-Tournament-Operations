import logging
import uuid
from datetime import datetime, timezone
from app.models.schemas import IncidentRequest, IncidentResponse, IncidentTriage
from app.services.genai.orchestrator import orchestrator
from app.services.genai.guardrails import sanitize_input

logger = logging.getLogger(__name__)

class IncidentService:
    @staticmethod
    async def process_incident_triage(request: IncidentRequest) -> IncidentResponse:
        """Processes an incoming incident report using Gemini AI for automated triage.
        
        Evaluates incident type, severity, and description to calculate recommended
        severity rating, reasoning, response playbook, and dispatched response team.
        """
        # Sanitize input description
        safe_desc = sanitize_input(request.description) if request.description else ""
        
        # Base severity calculation
        rec_severity = request.severity
        reasoning = f"AI Triage completed for '{request.type}' incident in {request.zone_id}."
        
        if orchestrator.client:
            try:
                prompt = (
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
                
        # Category-based playbook and severity adjustment logic
        playbook = "PB-DEFAULT"
        team_name = "Rapid Response Unit"
        
        type_lower = request.type.lower()
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

        triage = IncidentTriage(
            recommended_severity=rec_severity,
            reasoning=reasoning,
            recommended_playbook=playbook,
            nearest_teams=[
                {
                    "team_id": f"TEAM-{request.zone_id[-3:] if len(request.zone_id) >= 3 else '01'}",
                    "name": team_name,
                    "eta_seconds": 90 if rec_severity >= 4 else 180,
                    "zone": request.zone_id
                }
            ]
        )

        return IncidentResponse(
            incident_id=f"INC-{str(uuid.uuid4())[:8]}",
            status="open",
            ai_triage=triage,
            created_at=datetime.now(timezone.utc).isoformat()
        )
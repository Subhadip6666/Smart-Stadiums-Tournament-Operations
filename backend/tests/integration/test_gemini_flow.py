import pytest
from app.services.genai.orchestrator import orchestrator
from app.services.incident_service import IncidentService
from app.models.schemas import IncidentRequest

@pytest.mark.asyncio
async def test_gemini_orchestrator_fallback_flow():
    """Verify GenAI orchestrator returns graceful fallback response when API key is missing."""
    res = await orchestrator.get_chat_response("session-1", "Where is Gate A?", "en")
    assert res.session_id == "session-1"
    assert res.reply is not None

@pytest.mark.asyncio
async def test_incident_triage_ai_flow():
    """Verify incident service AI triage pipeline."""
    req = IncidentRequest(
        type="Medical Emergency",
        severity=4,
        description="Fan collapsed near concourse",
        zone_id="Z-GATE-E",
        stadium_id="STAD-01",
        reporter_role="steward"
    )
    res = await IncidentService.process_incident_triage(req)
    assert res.ai_triage.recommended_severity == 5
    assert res.ai_triage.recommended_playbook == "PB-MED-01"
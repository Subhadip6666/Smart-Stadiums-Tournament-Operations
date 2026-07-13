from fastapi import APIRouter, Depends
from datetime import datetime
import uuid
from app.dependencies import verify_token
from app.models.schemas import StandardResponse, IncidentRequest, IncidentResponse, IncidentTriage

router = APIRouter(dependencies=[Depends(verify_token)])

@router.post("", response_model=StandardResponse, status_code=201)
async def create_incident(request: IncidentRequest):
    # Dummy logic to simulate AI triage
    triage = IncidentTriage(
        recommended_severity=request.severity + 1 if request.severity < 5 else 5,
        reasoning="AI has determined this is a critical situation based on the description.",
        recommended_playbook="PB-DEFAULT",
        nearest_teams=[
            {"team_id": "MT-01", "name": "Medical Team 1", "eta_seconds": 120, "zone": request.zone_id}
        ]
    )
    
    response = IncidentResponse(
        incident_id=f"INC-{str(uuid.uuid4())[:8]}",
        status="open",
        ai_triage=triage,
        created_at=datetime.utcnow().isoformat() + "Z"
    )
    
    return StandardResponse(data=response)

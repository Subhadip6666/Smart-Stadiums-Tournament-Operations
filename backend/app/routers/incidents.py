from fastapi import APIRouter, Depends
from app.dependencies import verify_token
from app.models.schemas import StandardResponse, IncidentRequest
from app.services.incident_service import IncidentService

router = APIRouter(dependencies=[Depends(verify_token)])

@router.post("", response_model=StandardResponse, status_code=201)
async def create_incident(request: IncidentRequest):
    response_data = await IncidentService.process_incident_triage(request)
    return StandardResponse(data=response_data)

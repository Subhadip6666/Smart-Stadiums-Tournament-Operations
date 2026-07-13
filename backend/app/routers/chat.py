from fastapi import APIRouter, Depends
from app.dependencies import verify_token
from app.models.schemas import StandardResponse, ChatRequest, ChatResponse
from app.services.genai.orchestrator import orchestrator

router = APIRouter(dependencies=[Depends(verify_token)])

@router.post("/message", response_model=StandardResponse)
async def send_message(request: ChatRequest):
    response: ChatResponse = await orchestrator.get_chat_response(
        session_id=request.session_id,
        message=request.message,
        language=request.language
    )
    
    return StandardResponse(data=response)

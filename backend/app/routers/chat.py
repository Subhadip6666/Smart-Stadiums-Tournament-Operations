from fastapi import APIRouter, HTTPException
from app.models.schemas import StandardResponse, ChatRequest, ChatResponse
from app.services.genai.orchestrator import orchestrator

# Public endpoint — anonymous fans use multilingual AI chat without auth.
# Guardrails are enforced unconditionally in the orchestrator:
#   orchestrator.get_chat_response() → sanitize_input() → Gemini API → validate_output()
router = APIRouter()

# Max message length for anonymous public input (cost/abuse mitigation)
MAX_CHAT_MESSAGE_LENGTH = 500

@router.post("/message", response_model=StandardResponse)
async def send_message(request: ChatRequest):
    # Enforce input length limit on anonymous public endpoint
    if len(request.message) > MAX_CHAT_MESSAGE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Message exceeds maximum length of {MAX_CHAT_MESSAGE_LENGTH} characters"
        )

    response: ChatResponse = await orchestrator.get_chat_response(
        session_id=request.session_id,
        message=request.message,
        language=request.language
    )
    
    return StandardResponse(data=response)

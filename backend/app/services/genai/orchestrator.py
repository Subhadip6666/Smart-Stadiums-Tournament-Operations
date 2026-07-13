from google import genai
from google.genai import types
from app.config import settings
from app.models.schemas import ChatResponse
from app.services.genai.guardrails import sanitize_input, validate_output
import json

class GenAIOrchestrator:
    def __init__(self):
        self.client = genai.Client(api_key=settings.gemini_api_key) if settings.gemini_api_key else None
        self.system_instruction = (
            "You are a helpful stadium assistant for the FIFA World Cup 2026. "
            "You help fans find their way, get information about facilities, and report issues. "
            "Always be concise and polite. Respond in the language requested by the user."
        )

    async def get_chat_response(self, session_id: str, message: str, language: str) -> ChatResponse:
        if not self.client:
            # Fallback if no API key
            return ChatResponse(
                session_id=session_id,
                reply="GenAI is currently offline.",
                language=language,
                confidence=0.0
            )

        try:
            safe_message = sanitize_input(message)
            prompt = f"User asks in {language}: {safe_message}"
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=self.system_instruction,
                ),
            )
            
            reply = response.text or "I could not generate a response."
            
            if not validate_output(reply):
                reply = "I cannot fulfill that request."
            
            return ChatResponse(
                session_id=session_id,
                reply=reply,
                language=language,
                confidence=0.9,
                sources=["gemini"]
            )
        except Exception as e:
            import logging
            logging.error(f"GenAI call failed: {str(e)}")
            return ChatResponse(
                session_id=session_id,
                reply="An error occurred while generating the response.",
                language=language,
                confidence=0.0
            )

orchestrator = GenAIOrchestrator()

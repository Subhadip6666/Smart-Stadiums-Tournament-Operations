import re

def sanitize_input(message: str) -> str:
    """Basic sanitizer to strip common prompt injection vectors."""
    # Remove system-level directives
    patterns = [
        r"(?i)\bignore\b.*\binstructions?\b",
        r"(?i)\bdisregard\b",
        r"(?i)\bsystem prompt\b",
        r"(?i)\byou are no longer\b",
        r"(?i)\bforget everything\b"
    ]
    
    sanitized = message
    for pattern in patterns:
        sanitized = re.sub(pattern, "[REDACTED]", sanitized)
        
    return sanitized

def validate_output(reply: str) -> bool:
    """Ensure the GenAI reply doesn't leak the system prompt or constraints."""
    forbidden = [
        "FIFA World Cup 2026", # Context term, but shouldn't be repeated verbatim if asked about system instructions
        "system_instruction",
        "system prompt"
    ]
    
    # Just a naive check, if it returns False, we should return a fallback message
    for term in forbidden:
        if term.lower() in reply.lower():
            return False
            
    return True
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config import settings
from jose import jwt
from datetime import datetime, timedelta
import bcrypt

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Validate against fixed demo account
    if request.username != settings.demo_account_username:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check password hash
    password_bytes = request.password.encode("utf-8")
    hash_bytes = settings.demo_account_password_hash.encode("utf-8")
    
    if not bcrypt.checkpw(password_bytes, hash_bytes):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    # Issue JWT token (valid for 8 hours for a NOC shift)
    expires = datetime.utcnow() + timedelta(hours=8)
    payload = {
        "sub": request.username,
        "role": "operator",
        "exp": expires
    }
    
    token = jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
    return LoginResponse(access_token=token)

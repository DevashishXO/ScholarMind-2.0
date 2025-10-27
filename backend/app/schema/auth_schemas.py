from pydantic import BaseModel, EmailStr
from typing import Optional

class EmailCheckIn(BaseModel):
    email: EmailStr

class SendOtpIn(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class VerifyOtpIn(BaseModel):
    email: EmailStr
    otp: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    is_verified: bool
    name: Optional[str] = None
    google_id: Optional[str] = None

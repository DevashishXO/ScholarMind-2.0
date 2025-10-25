from datetime import datetime, timedelta
from typing import Dict, Any
import secrets
import hmac
import hashlib

from jose import jwt, JWTError

from app.core.config import settings

JWT_ALGORITHM = "HS256"

def gen_otp(length: int | None = None) -> str:
    length = length or settings.OTP_LENGTH
    return "".join(secrets.choice("0123456789") for _ in range(length))

def hash_otp(otp: str, salt: str) -> str:
    return hmac.new(salt.encode("utf-8"), otp.encode("utf-8"), hashlib.sha256).hexdigest()

def create_jwt(payload: Dict[str, Any]) -> str:
    to_encode = payload.copy()
    exp = datetime.utcnow() + timedelta(seconds=settings.JWT_EXPIRES_SECONDS)
    to_encode.update({"exp": exp})
    token = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def decode_jwt(token: str) -> Dict[str, Any]:
    try:
        data = jwt.decode(token, settings.JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return data
    except JWTError as exc:
        raise

def constant_time_compare(a: str, b: str) -> bool:
    return hmac.compare_digest(a, b)

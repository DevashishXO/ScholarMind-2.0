# app/services/email_service.py
from typing import Optional
import httpx
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

RESEND_URL = "https://api.resend.com/emails"

async def send_otp_email(to_email: str, otp: str, name: Optional[str] = None) -> dict:
    if not settings.RESEND_API_KEY:
        raise RuntimeError("RESEND_API_KEY not configured")
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    html = f"""
    <div>
      <p>Hi {name or ''},</p>
      <p>Your verification code is <strong>{otp}</strong>. It will expire in {settings.OTP_TTL_SECONDS // 60} minutes.</p>
    </div>
    """
    payload = {
        "from": settings.RESEND_FROM_EMAIL,
        "to": [to_email],
        "subject": "Your verification code",
        "html": html,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(RESEND_URL, headers=headers, json=payload)
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.error("Resend API error: %s - %s", resp.status_code, resp.text)
            raise
        return resp.json()

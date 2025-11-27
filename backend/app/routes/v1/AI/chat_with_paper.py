from fastapi import APIRouter
from pydantic.main import BaseModel, Optional
import httpx
import os
from fastapi.encoders import jsonable_encoder

router = APIRouter()
AI_BACKEND_URL = os.getenv("AI_BACKEND_URL", "http://localhost:8001")

class ChatWithPaper(BaseModel):
    paper_id: str
    pdf_url: Optional[str] = None

@router.post("/")
async def chat_with_paper(payload: dict):
    
    try:
        encoded_payload = jsonable_encoder(payload)
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{AI_BACKEND_URL}/api/v1/chat-with-paper/",
                json=encoded_payload,
                headers={"Content-Type": "application/json"},
            )
        
        # Raise an error if AI backend returns non-2xx status
        response.raise_for_status()
        
        return {"message": "Chat with paper functionality is not implemented yet."}
    
    except Exception as e:
        return {"error": str(e)}

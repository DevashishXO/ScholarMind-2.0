from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from engine.rag_llm import get_bot_response

router = APIRouter()

class SearchQuery(BaseModel):
    user_query: str


# ==== Route ====
@router.post("/")
async def handle_search(payload: SearchQuery):
    """
    Receives structured search data and performs AI pipeline operations.
    """
    try:
        payload = payload.model_dump()
        print("✅ Received payload:", payload)
        
        response = get_bot_response(payload)
        print("✅ AI response:", response)

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")

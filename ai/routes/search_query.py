from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from engine.smart_search import get_resposne_smart_search

router = APIRouter()


class SearchQuery(BaseModel):
    keywords: Optional[List[str]]
    title: Optional[str]
    authors: Optional[List[str]]
    year: Optional[int]
    arxiv_id: Optional[str]
    results_per_page: Optional[int]
    page: Optional[int]


# ==== Route ====
@router.post("/")
async def handle_search(payload: SearchQuery):
    """
    Receives structured search data and performs AI pipeline operations.
    """
    try:
        # payload = payload.model_dump()
        print("✅ Received payload:", payload)
        
        response = get_resposne_smart_search(payload)
        print("✅ AI response:", response)

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")

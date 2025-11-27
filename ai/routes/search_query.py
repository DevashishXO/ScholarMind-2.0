from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from engine.rag_llm import get_llm_response

router = APIRouter()

class DateRange(BaseModel):
    from_: datetime = Field(..., alias="from")
    to: datetime


class Filters(BaseModel):
    dateRange: Optional[DateRange] = None
    journal_ref: Optional[List[str]] = None


class SearchQuery(BaseModel):
    query_keywords: List[str]
    filters: Optional[Filters] = None


# ==== Route ====
@router.post("/")
async def handle_search(payload: SearchQuery):
    """
    Receives structured search data and performs AI pipeline operations.
    """
    try:
        # payload = payload.model_dump()
        print("✅ Received payload:", payload)
        
        # response = get_llm_response(payload)
        # print("✅ AI response:", response)

        return 

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")

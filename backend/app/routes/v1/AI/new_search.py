from fastapi import APIRouter, HTTPException
from fastapi.params import Depends
from app.schema.new_search_schema import SmartSearch
import httpx
import os
from fastapi.encoders import jsonable_encoder

from app.utils.get_user import get_current_user

router = APIRouter()
AI_BACKEND_URL = os.getenv("AI_BACKEND_URL", "http://localhost:8001")

# ==== Route ====
@router.post("/")
async def new_query(payload: SmartSearch):
    """
    Forwards a structured new query search request to the AI backend.
    """
    try:

        encoded_payload = jsonable_encoder(payload.model_dump(by_alias=True))
        print("new payload", encoded_payload)
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{AI_BACKEND_URL}/api/v1/search/",
                json=encoded_payload,
                headers={"Content-Type": "application/json"},
            )

        # Raise an error if AI backend returns non-2xx status
        response.raise_for_status()

        # Return AI backend’s response to frontend
        return response.json()

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"AI backend error: {e.response.text}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

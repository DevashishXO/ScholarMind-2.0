from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import Optional
import httpx
import os
from fastapi.encoders import jsonable_encoder

router = APIRouter()
AI_BACKEND_URL = os.getenv("AI_BACKEND_URL", "http://localhost:8001")

class ChatWithPaper(BaseModel):
    pdf_url: Optional[str] = None
    query: Optional[str] = None


@router.post("/")
async def chat_with_paper(
    payload: ChatWithPaper,
    paper_id: str = Query(..., description="The ID of the paper to chat with"),
):
    try:
        encoded_payload = jsonable_encoder(payload)
        print("Received Payload:", encoded_payload)
        print("Paper ID:", paper_id)

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{AI_BACKEND_URL}/api/v1/chat-with-paper/",
                json={
                    "paper_id": paper_id,
                    **encoded_payload
                },
                headers={"Content-Type": "application/json"},
            )

        # Raise if not 200/201 etc.
        response.raise_for_status()

        # Return actual AI backend response
        return response.json()

    except httpx.HTTPStatusError as e:
        return {"error": f"AI backend returned an error: {str(e)}"}

    except Exception as e:
        return {"error": str(e)}
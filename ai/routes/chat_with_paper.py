from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from engine.chat_pdf_handler import get_response_from_chat

router = APIRouter()

@router.post("/")
async def chat_with_paper(request: Request):
    try:
        payload = await request.json()

        # Validate fields
        question = payload.get("query")
        pdf_url = payload.get("pdf_url")

        if not question or not pdf_url:
            raise HTTPException(
                status_code=400, 
                detail="Both 'query' and 'pdf_url' are required."
            )

        # Call your chat handler (sync function)
        response = get_response_from_chat(question, pdf_url)

        return JSONResponse(content=response)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")

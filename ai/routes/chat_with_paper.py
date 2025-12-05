from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from engine.chat_pdf_handler import get_response_from_chat
from engine.smart_report_handler import get_generate_report

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
        
        
@router.post("/generate-report")
async def generate_report(request: Request):
    try:
        payload = await request.json()

        # Validate fields
        pdf_url = payload.get("pdf_url")

        if not pdf_url:
            raise HTTPException(
                status_code=400, 
                detail="'pdf_url' is required."
            )

        # Call your chat handler (sync function)
        response = get_generate_report(pdf_url)

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")
        


"""
Production-ready API handler for Smart Report feature.

AVAILABLE FUNCTIONS FOR FRONTEND:
1. smart_report_api(arxiv_id: str, pdf_url: str = None) -> dict
   - Generates comprehensive research report for a paper
   - Input: arXiv ID (e.g., "arxiv:1706.03762") and optional PDF URL
   - Output: {"status": "success", "report": "...", "citations": [...], "metadata": {...}}

RESPONSE LOGGING:
- All responses saved to data/api_responses/last_smart_report_response.json
- Timestamped archives: smart_report_YYYYMMDD_HHMMSS.json

USAGE EXAMPLE:
    from engine.smart_report_handler import smart_report_api
    
    result = smart_report_api(
        pdf_url="https://arxiv.org/pdf/1706.03762.pdf"
    )
    
    if result["status"] == "success":
        print(result["report"])  # Markdown-formatted report
        for cite in result["citations"]:
            print(f"[{cite['number']}] Page {cite['page']}")
    else:
        print(f"Error: {result['message']}")
"""

from engine.smart_report import generate_smart_report
from engine.pdf_processor import is_pdf_processed
from engine.db_client import get_chroma_client
from utils.logger import log
import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
RESPONSES_DIR = os.path.join(DATA_DIR, "api_responses")
os.makedirs(RESPONSES_DIR, exist_ok=True)


def save_response(response_data: dict):
    """Save smart report response to JSON file for debugging."""
    latest_path = os.path.join(RESPONSES_DIR, "last_smart_report_response.json")
    with open(latest_path, "w", encoding="utf-8") as f:
        json.dump(response_data, f, ensure_ascii=False, indent=2)
    
    log(f"💾 Smart report response saved to {latest_path}")
    return latest_path


def extract_arxiv_id_from_url(pdf_url: str) -> str:
    """
    Extract arxiv ID from PDF URL.
    
    Examples:
    - "https://arxiv.org/pdf/1706.03762.pdf" → "arxiv:1706.03762"
    - "https://arxiv.org/pdf/2502.07036v2.pdf" → "arxiv:2502.07036v2"
    - "http://arxiv.org/pdf/2502.07036v2" → "arxiv:2502.07036v2"
    """
    import re
    
    # Extract the arxiv ID from URL
    match = re.search(r'(\d{4}\.\d{4,5}(?:v\d+)?)', pdf_url)
    if match:
        return f"arxiv:{match.group(1)}"
    
    return None


def smart_report_api(pdf_url: str) -> dict:  # ← CHANGE: Only pdf_url input
    """
    Backend API: Generate comprehensive smart research report.
    
    FRONTEND INPUT:
        pdf_url (str): Full arXiv PDF URL
                       Example: "https://arxiv.org/pdf/1706.03762.pdf"
                       Example: "http://arxiv.org/pdf/2502.07036v2"
    
    FRONTEND OUTPUT:
        Success case:
        {
            "status": "success",
            "report": "# 🔬 Research Assistant Report\n\n## 📄 Paper Information\n...",
            "arxiv_id": "arxiv:1706.03762",
            "citations": [
                {
                    "number": 1,
                    "page": 3,
                    "chunk_index": 5,
                    "preview": "First 300 chars of cited chunk..."
                },
                ...
            ],
            "metadata": {
                "reading_time_minutes": 45,
                "page_count": 9,
                "sections_generated": 7,
                "llm_calls": 1,
                "chunks_analyzed": 50,
                "citations_found": 8
            },
            "timestamp": "2025-12-05T10:30:45.123456"
        }
        
        Already processing case:
        {
            "status": "processing",
            "message": "Paper is being processed. This may take 30-60 seconds.",
            "arxiv_id": "arxiv:1706.03762",
            "timestamp": "..."
        }
        
        Error case:
        {
            "status": "error",
            "message": "Paper not processed and no PDF URL provided",
            "arxiv_id": "arxiv:1706.03762",
            "timestamp": "..."
        }
    
    FRONTEND INTEGRATION NOTES:
        1. Markdown Report: Use markdown renderer to display report
        2. Citations: Parse [N] in report text and link to citations array
        3. Confidence: No explicit confidence in synthesis (uses best available data)
        4. Waiting: If status="processing", show loader and retry after 60 seconds
        5. Error Handling: If error, check if pdf_url needed and re-submit
    
    USAGE EXAMPLE:
        from engine.smart_report_handler import smart_report_api
        
        # Case 1: Paper already processed
        result = smart_report_api("arxiv:1706.03762")
        
        # Case 2: Paper not processed (need PDF URL)
        result = smart_report_api(
            arxiv_id="arxiv:1706.03762",
            pdf_url="https://arxiv.org/pdf/1706.03762.pdf"
        )
        
        if result["status"] == "success":
            # Display report
            render_markdown(result["report"])
            
            # Make citations clickable
            for cite in result["citations"]:
                print(f"[{cite['number']}] Page {cite['page']}")
        elif result["status"] == "error":
            print(f"Error: {result['message']}")
    """
    
    response = {
        "operation": "smart_report",
        "timestamp": datetime.now().isoformat()
    }
    
    # Extract arxiv_id from pdf_url
    arxiv_id = extract_arxiv_id_from_url(pdf_url)  # ← ADD THIS
    
    if not arxiv_id:
        response.update({
            "status": "error",
            "message": "Invalid PDF URL format. Expected: https://arxiv.org/pdf/XXXX.XXXXXvN.pdf"
        })
        save_response(response)
        log(f"❌ Invalid PDF URL: {pdf_url}")
        return response
    
    log(f"🔄 Smart Report request for {arxiv_id}")
    response["arxiv_id"] = arxiv_id
    response["pdf_url"] = pdf_url
    
    # Check if paper is already processed
    is_processed = is_pdf_processed(arxiv_id)
    
    if not is_processed and not pdf_url:
        response.update({
            "status": "error",
            "message": "Paper not processed and no PDF URL provided. Please provide pdf_url parameter."
        })
        save_response(response)
        log(f"❌ Paper not processed and no PDF URL: {arxiv_id}")
        return response
    
    log(f"📚 Generating smart report...")
    
    # Fetch paper metadata for better context
    try:
        client = get_chroma_client()
        papers_coll = client.get_collection("papers_collection")
        metadata_result = papers_coll.get(ids=[arxiv_id])
        paper_metadata = metadata_result["metadatas"][0] if metadata_result and metadata_result["metadatas"] else None
    except Exception as e:
        log(f"⚠️ Could not fetch paper metadata: {e}")
        paper_metadata = None
    
    # Generate synthesis
    result = generate_smart_report(arxiv_id, pdf_url, paper_metadata)
    
    response.update(result)
    
    save_response(response)
    
    if result["status"] == "success":
        log(f"✅ Smart Report complete: {result['metadata']['reading_time_minutes']} min read, {result['metadata']['citations_found']} citations")
    else:
        log(f"❌ Smart Report failed: {result.get('message', 'Unknown error')}")
    
    return response


def get_generate_report(pdf_url:str):
    if not pdf_url:
        raise ValueError("PDF URL required")
    
    # Generate synthesis
    result = smart_report_api(pdf_url)     
    return result


# ============================================================================
# Manual Testing Interface
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*80)
    print("🧪 SMART REPORT API - Manual Testing")
    print("="*80)
    
    pdf_url = input("Enter PDF URL (e.g., https://arxiv.org/pdf/2502.07036v2.pdf): ").strip()

    if not pdf_url:
        print("❌ PDF URL required")
        exit(1)

    print(f"\n🔄 Generating smart report for {pdf_url}...")
    result = smart_report_api(pdf_url) 
    
    print("\n" + "="*80)
    print("RESULT:")
    print("="*80)
    
    if result["status"] == "success":
        print(f"\n✅ Status: SUCCESS")
        print(f"\n📖 Report:\n")
        print(result["report"])
        
        print(f"\n\n📌 Citations Found: {len(result['citations'])}")
        for cite in result["citations"]:
            print(f"  [{cite['number']}] Page {cite['page']} - {cite['preview'][:100]}...")
        
        print(f"\n\n📊 Metadata:")
        for key, value in result["metadata"].items():
            print(f"  {key}: {value}")
    
    else:
        print(f"\n❌ Status: ERROR")
        print(f"Message: {result['message']}")
    
    print(f"\n💾 Full response: data/api_responses/last_smart_report_response.json")
    print("="*80)
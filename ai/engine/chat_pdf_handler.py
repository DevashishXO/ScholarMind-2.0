"""
Production-ready API handler for frontend integration.

AVAILABLE FUNCTIONS FOR FRONTEND:
1. process_paper_api(pdf_url: str) -> dict
   - Processes a research paper from arXiv URL
   - Input: Full arXiv PDF URL (e.g., "https://arxiv.org/pdf/1706.03762.pdf")
   - Output: {"status": "success", "arxiv_id": "arxiv:1706.03762", "chunks_processed": 66, ...}

2. chat_api(arxiv_id: str, user_question: str) -> dict
   - Chat with a processed paper
   - Input: arXiv ID (e.g., "arxiv:1706.03762") and user's question
   - Output: {"status": "success", "answer": "...", "citations": [...], "metadata": {...}}

3. get_paper_summary_api(arxiv_id: str) -> dict [OPTIONAL]
   - Retrieve full paper summary
   - Input: arXiv ID
   - Output: {"status": "success", "summary": "Full markdown summary..."}

RESPONSE LOGGING:
- All responses are saved to data/api_responses/ for debugging
- last_process_response.json: Latest processing result
- last_chat_response.json: Latest chat result
- Timestamped archives: process_YYYYMMDD_HHMMSS.json, chat_YYYYMMDD_HHMMSS.json
"""
from engine.chat_engine import chat_with_pdf
from engine.pdf_processor import process_pdf, is_pdf_processed
from utils.logger import log
import re
import json
import os
from datetime import datetime
from urllib.parse import urlparse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
RESPONSES_DIR = os.path.join(DATA_DIR, "api_responses")
os.makedirs(RESPONSES_DIR, exist_ok=True)

def save_response(response_data: dict, operation: str):
    """Save API response to JSON file for debugging."""
    # timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    latest_path = os.path.join(RESPONSES_DIR, f"last_{operation}_response.json")
    with open(latest_path, "w", encoding="utf-8") as f:
        json.dump(response_data, f, ensure_ascii=False, indent=2)
    
    # archive_path = os.path.join(RESPONSES_DIR, f"{operation}_{timestamp}.json")
    # with open(archive_path, "w", encoding="utf-8") as f:
    #     json.dump(response_data, f, ensure_ascii=False, indent=2)
    
    log(f"💾 Response saved to {latest_path}")
    return latest_path

def extract_arxiv_id_from_url(pdf_url: str) -> tuple:
    """
    Extract arXiv ID from URL.
    
    Args:
        pdf_url: e.g., "https://arxiv.org/pdf/2511.01463.pdf"
    
    Returns:
        (is_valid, arxiv_id, error_message)
    """
    try:
        parsed = urlparse(pdf_url)
        
        # Check if it's an arxiv.org URL
        if "arxiv.org" not in parsed.netloc:
            return False, None, "URL must be from arxiv.org"
        
        # Extract ID from path
        # Expected formats:
        # - https://arxiv.org/pdf/2511.01463.pdf
        # - https://arxiv.org/abs/2511.01463
        path_parts = parsed.path.strip("/").split("/")
        
        if len(path_parts) < 2:
            return False, None, "Invalid arXiv URL format"
        
        # Get the ID (last part, remove .pdf if present)
        arxiv_number = path_parts[-1].replace(".pdf", "")
        
        # Validate ID format (YYMM.NNNNN or YYMM.NNNNNN)
        if not re.match(r'^\d{4}\.\d{5,6}(v\d+)?$', arxiv_number):
            return False, None, f"Invalid arXiv ID format: {arxiv_number}"
        
        arxiv_id = f"arxiv:{arxiv_number}"
        return True, arxiv_id, None
        
    except Exception as e:
        return False, None, f"URL parsing error: {str(e)}"

def extract_citations_from_answer(answer_text: str) -> list:
    """Extract citation numbers from answer text like [1], [3][5]."""
    pattern = r'\[(\d+)\]'
    citations = re.findall(pattern, answer_text)
    return [int(c) for c in citations]

def process_paper_api(pdf_url: str) -> dict:
    """
    Backend API: Process a research paper from arXiv URL.
    
    FRONTEND INPUT:
        pdf_url (str): Full arXiv PDF URL
                       Example: "https://arxiv.org/pdf/1706.03762.pdf"
    
    FRONTEND OUTPUT:
        Success case:
        {
            "status": "success",
            "message": "Successfully processed 66 chunks",
            "arxiv_id": "arxiv:1706.03762",
            "chunks_processed": 66,
            "summary_preview": "First 500 characters of summary...",
            "timestamp": "2025-11-27T00:24:41.838969"
        }
        
        Already processed case:
        {
            "status": "already_processed",
            "message": "Paper arxiv:1706.03762 has already been processed. Use chat API to query it.",
            "arxiv_id": "arxiv:1706.03762",
            "timestamp": "..."
        }
        
        Error case:
        {
            "status": "error",
            "message": "Invalid URL: URL must be from arxiv.org",
            "timestamp": "..."
        }
    
    USAGE EXAMPLE:
        from engine.chat_pdf_handler import process_paper_api
        
        result = process_paper_api("https://arxiv.org/pdf/1706.03762.pdf")
        
        if result["status"] == "success":
            print(f"Processed {result['chunks_processed']} chunks")
            arxiv_id = result["arxiv_id"]  # Use this for chat_api()
        elif result["status"] == "already_processed":
            arxiv_id = result["arxiv_id"]
            # Proceed to chat
        else:
            print(f"Error: {result['message']}")
    """

    response = {
        "operation": "process_paper",
        "pdf_url": pdf_url,
        "timestamp": datetime.now().isoformat()
    }
    
    is_valid, arxiv_id, error_msg = extract_arxiv_id_from_url(pdf_url)
    
    if not is_valid:
        response.update({
            "status": "error",
            "message": f"Invalid URL: {error_msg}"
        })
        save_response(response, "process")
        log(f"❌ Invalid URL: {error_msg}")
        return response
    
    response["arxiv_id"] = arxiv_id
    log(f"✅ Extracted arXiv ID: {arxiv_id}")
    
    if is_pdf_processed(arxiv_id):
        response.update({
            "status": "already_processed",
            "message": f"Paper {arxiv_id} has already been processed. Use chat API to query it."
        })
        save_response(response, "process")
        log(f"ℹ️ Paper already processed: {arxiv_id}")
        return response
    
    log(f"📄 Processing paper {arxiv_id} from {pdf_url}...")
    result = process_pdf(arxiv_id, pdf_url)
    
    if result["status"] == "success":
        response.update({
            "status": "success",
            "message": f"Successfully processed {result['chunks_processed']} chunks",
            "chunks_processed": result['chunks_processed'],
            "summary_preview": result['summary'][:500] + "..." if len(result['summary']) > 500 else result['summary']
        })
    else:
        response.update({
            "status": "error",
            "message": result["message"]
        })
    
    save_response(response, "process")
    return response

def chat_api(arxiv_id: str, user_question: str) -> dict:
    """
    Backend API: Chat with a processed research paper.
    
    FRONTEND INPUT:
        arxiv_id (str): arXiv identifier
                        Example: "arxiv:1706.03762" or just "1706.03762" (auto-normalized)
        user_question (str): User's natural language question
                             Example: "What are the key findings of this paper?"
    
    FRONTEND OUTPUT:
        Success case:
        {
            "status": "success",
            "arxiv_id": "arxiv:1706.03762",
            "question": "what were the key findings?",
            "answer": "### Key Findings\n\nThe paper presents...[3][7]...",  # Markdown formatted
            "citations": [
                {
                    "citation_number": 3,         # Matches [3] in answer text
                    "page": 13,                   # Page number in original PDF
                    "chunk_index": 62,            # Internal chunk ID
                    "similarity": 61,             # Relevance score (0-100)
                    "text_preview": "First 300 chars...",  # For tooltips
                    "full_text": "Complete chunk text..."  # For detailed citation view
                },
                ...
            ],
            "metadata": {
                "chunks_retrieved": 12,           # Total chunks searched
                "chunks_cited": 3,                # Chunks actually cited in answer
                "avg_similarity": 60.0,           # Average relevance score
                "similarity_range": {"min": 58, "max": 62}
            },
            "timestamp": "2025-11-27T00:25:24.125117"
        }
        
        Error case:
        {
            "status": "error",
            "message": "This paper has not been processed yet. Please process it first.",
            "arxiv_id": "arxiv:1706.03762",
            "timestamp": "..."
        }
    
    USAGE EXAMPLE:
        from engine.chat_pdf_handler import chat_api
        
        result = chat_api(
            arxiv_id="arxiv:1706.03762",
            user_question="What are the key findings?"
        )
        
        if result["status"] == "success":
            # Display answer (it's markdown formatted)
            print(result["answer"])
            
            # Make citations clickable
            for cite in result["citations"]:
                print(f"[{cite['citation_number']}] Page {cite['page']}: {cite['text_preview']}")
        else:
            print(f"Error: {result['message']}")
    
    FRONTEND INTEGRATION NOTES:
        1. Parse answer text and replace [N] with clickable links
        2. Use text_preview for hover tooltips
        3. Use full_text for detailed citation modal/sidebar
        4. Show metadata.avg_similarity as "Answer confidence"
    """
    
    if not arxiv_id.startswith("arxiv:"):
        arxiv_id = f"arxiv:{arxiv_id}"
    
    response = {
        "operation": "chat",
        "arxiv_id": arxiv_id,
        "question": user_question,
        "timestamp": datetime.now().isoformat()
    }
    
    result = chat_with_pdf(arxiv_id, user_question)
    
    if "Error" in result.get("answer", "") or result.get("answer", "").startswith("This paper has not been processed"):
        response.update({
            "status": "error",
            "message": result["answer"]
        })
        save_response(response, "chat")
        return response
    
    cited_numbers = extract_citations_from_answer(result["answer"])
    
    citations = []
    for num in sorted(set(cited_numbers)):
        if num in result["chunk_metadata"]:
            meta = result["chunk_metadata"][num]
            chunk_text = result["chunks_used"][num - 1] if num <= len(result["chunks_used"]) else ""
            
            citations.append({
                "citation_number": num,
                "page": meta["page"],
                "chunk_index": meta["chunk_index"],
                "similarity": meta["similarity"],
                "text_preview": chunk_text[:300] + "..." if len(chunk_text) > 300 else chunk_text,
                "full_text": chunk_text
            })
    
    avg_similarity = sum(result["chunk_similarities"]) / len(result["chunk_similarities"]) if result["chunk_similarities"] else 0
    
    response.update({
        "status": "success",
        "answer": result["answer"],
        "citations": citations,
        "metadata": {
            "chunks_retrieved": len(result["chunks_used"]),
            "chunks_cited": len(citations),
            "avg_similarity": round(avg_similarity, 2),
            "similarity_range": {
                "min": min(result["chunk_similarities"]) if result["chunk_similarities"] else 0,
                "max": max(result["chunk_similarities"]) if result["chunk_similarities"] else 0
            }
        }
    })
    
    save_response(response, "chat")
    return response

# ============================================================================
# Manual Testing Interface (For local testing only)
# ============================================================================


# if __name__ == "__main__":
#     print("\n" + "="*80)
#     print("🧪 MANUAL TESTING - Backend API Functions")
#     print("="*80)
    
#     # Test 1: Process Paper
#     print("\n--- TEST 1: Process Paper ---")
#     test_url = input("Enter arXiv PDF URL: ").strip()
    
#     if test_url:
#         print(f"\n🔄 Processing {test_url}...")
#         process_result = process_paper_api(test_url)
#         print("\nRESULT:")
#         print(json.dumps(process_result, indent=2, ensure_ascii=False))
        
#         if process_result["status"] in ["success", "already_processed"]:
#             arxiv_id = process_result["arxiv_id"]
            
#             # Test 2: Chat
#             print("\n--- TEST 2: Chat with Paper ---")
#             question = input(f"\nAsk a question about {arxiv_id}: ").strip()
            
#             if question:
#                 print(f"\n🔄 Querying {arxiv_id}...")
#                 chat_result = chat_api(arxiv_id, question)
                
#                 print("\nANSWER:")
#                 print(chat_result.get("answer", chat_result.get("message", "No answer")))
                
#                 if chat_result["status"] == "success":
#                     print("\nCITATIONS:")
#                     for cite in chat_result["citations"]:
#                         print(f"\n[{cite['citation_number']}] Page {cite['page']} (Similarity: {cite['similarity']}%)")
#                         print(f"Preview: {cite['text_preview']}")
                    
#                     print("\nMETADATA:")
#                     print(json.dumps(chat_result["metadata"], indent=2))
                
#                 print(f"\n💾 Full response: data/api_responses/last_chat_response.json")
    
#     print("\n" + "="*80)
#     print("✅ Testing complete. Check data/api_responses/ for JSON outputs.")
#     print("="*80)
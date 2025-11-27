"""
Smart Search API - Hybrid keyword + semantic search for research papers.

USAGE:
    from engine.smart_search import smart_search_api
    
    result = smart_search_api({
        "keywords": ["transformer"],
        "title": "Attention Is All You Need",
        "authors": ["Vaswani"],
        "year": 2017,
        "arxiv_id": None,
        "page": 1
    })
"""

from engine.db_client import get_chroma_client
from models.embedder import Embedder
from utils.logger import log
import re
import json
import os
from datetime import datetime

# Response logging
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
RESPONSES_DIR = os.path.join(DATA_DIR, "api_responses")
os.makedirs(RESPONSES_DIR, exist_ok=True)

# Constants
RESULTS_PER_PAGE = 20
MAX_RESULTS = 100

def save_response(response_data: dict):
    """Save search response to JSON file for debugging."""
    # Latest response only (no timestamped archive)
    # timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    latest_path = os.path.join(RESPONSES_DIR, "last_smart_search_response.json")
    with open(latest_path, "w", encoding="utf-8") as f:
        json.dump(response_data, f, ensure_ascii=False, indent=2)

    # Timestamped archive
    # archive_path = os.path.join(RESPONSES_DIR, f"smart_search_{timestamp}.json")
    # with open(archive_path, "w", encoding="utf-8") as f:
    #     json.dump(response_data, f, ensure_ascii=False, indent=2)
    
    log(f"💾 Search response saved to {latest_path}")
    return latest_path

def normalize_arxiv_id(arxiv_id: str) -> str:
    """
    Normalize arXiv ID to 'arxiv:XXXX.XXXXXvN' format.
    
    Args:
        arxiv_id: "2508.09224v1" or "arxiv:2508.09224v1" or "2508.09224"
    
    Returns:
        "arxiv:2508.09224v1"
    """
    if arxiv_id is None:
        return None
    
    arxiv_id = arxiv_id.strip()
    
    # Already has prefix
    if arxiv_id.startswith("arxiv:"):
        return arxiv_id
    
    # Add prefix
    return f"arxiv:{arxiv_id}"

def validate_filters(filters: dict) -> tuple:
    """
    Validate search filters.
    
    Returns:
        (is_valid, error_message)
    """
    # Check if at least one filter is provided
    has_filter = any([
        filters.get("keywords"),
        filters.get("title"),
        filters.get("authors"),
        filters.get("year"),
        filters.get("arxiv_id")
    ])
    
    if not has_filter:
        return False, "At least one search parameter is required"
    
    # Validate year format
    if filters.get("year") is not None:
        year = filters["year"]
        if not isinstance(year, int) or year < 1900 or year > 2099:
            return False, "Year must be a 4-digit number between 1900-2099"
    
    # Validate page number
    page = filters.get("page", 1)
    if not isinstance(page, int) or page < 1:
        return False, "Page number must be >= 1"
    
    return True, None

def build_metadata_filters(filters: dict) -> dict:
    """
    Build ChromaDB metadata filter from user input.
    
    Args:
        filters: {
            "title": "Attention Is All You Need",
            "authors": ["Vaswani"],
            "year": 2017,
            "arxiv_id": "arxiv:1706.03762"
        }
    
    Returns:
        ChromaDB where filter: {"$and": [...]}
    """
    conditions = []
    
    # Year filter (exact match)
    if filters.get("year"):
        conditions.append({"year": {"$eq": filters["year"]}})
    
    # arXiv ID filter (exact match)
    if filters.get("arxiv_id"):
        normalized_id = normalize_arxiv_id(filters["arxiv_id"])
        conditions.append({"id": {"$eq": normalized_id}})
    
    # Title filter (partial match - case insensitive)
    if filters.get("title"):
        # ChromaDB doesn't support case-insensitive LIKE, so we'll filter post-retrieval
        pass
    
    # Authors filter (partial match - case insensitive)
    if filters.get("authors"):
        # ChromaDB doesn't support case-insensitive LIKE, so we'll filter post-retrieval
        pass
    
    # Return combined filter
    if conditions:
        return {"$and": conditions} if len(conditions) > 1 else conditions[0]
    
    return None

def post_filter_results(results: list, filters: dict) -> list:
    """
    Apply filters that ChromaDB doesn't support natively (title, authors).
    
    Args:
        results: List of papers from ChromaDB
        filters: User filters
    
    Returns:
        Filtered list of papers
    """
    filtered = results
    
    # Title filter (case-insensitive partial match)
    if filters.get("title"):
        title_query = filters["title"].lower()
        filtered = [
            paper for paper in filtered
            if title_query in paper["metadata"]["title"].lower()
        ]
    
    # Authors filter (case-insensitive partial match on ANY author)
    if filters.get("authors"):
        author_queries = [author.lower() for author in filters["authors"]]
        filtered = [
            paper for paper in filtered
            if any(
                author_query in paper["metadata"]["authors"].lower()
                for author_query in author_queries
            )
        ]
    
    return filtered

def determine_match_type(filters: dict, paper_metadata: dict) -> str:
    """
    Determine match quality (exact/partial/semantic).
    
    Args:
        filters: User search filters
        paper_metadata: Paper metadata from ChromaDB
    
    Returns:
        "exact", "partial", or "semantic"
    """
    exact_matches = 0
    total_metadata_filters = 0
    
    # Check arXiv ID (always exact if matched)
    if filters.get("arxiv_id"):
        normalized_id = normalize_arxiv_id(filters["arxiv_id"])
        if normalized_id == paper_metadata.get("id"):
            return "exact"
    
    # Check title match
    if filters.get("title"):
        total_metadata_filters += 1
        if filters["title"].lower() in paper_metadata.get("title", "").lower():
            exact_matches += 1
    
    # Check year match
    if filters.get("year"):
        total_metadata_filters += 1
        if filters["year"] == paper_metadata.get("year"):
            exact_matches += 1
    
    # Check author match
    if filters.get("authors"):
        total_metadata_filters += 1
        authors_str = paper_metadata.get("authors", "").lower()
        if any(author.lower() in authors_str for author in filters["authors"]):
            exact_matches += 1
    
    # Classify
    if total_metadata_filters == 0:
        return "semantic"  # Only keywords provided
    elif exact_matches == total_metadata_filters:
        return "exact"  # All metadata filters matched
    elif exact_matches > 0:
        return "partial"  # Some metadata filters matched
    else:
        return "semantic"  # No metadata matched, only semantic similarity

def get_fallback_results(collection, limit: int = 20) -> list:
    """
    Get fallback results when no matches found.
    Returns most recent papers.
    
    Args:
        collection: ChromaDB collection
        limit: Number of papers to return
    
    Returns:
        List of paper dictionaries
    """
    try:
        # Get recent papers (no filters)
        results = collection.get(
            include=["metadatas", "documents"],
            limit=limit
        )
        
        papers = []
        for i in range(len(results["ids"])):
            paper = {
                "metadata": results["metadatas"][i],
                "document": results["documents"][i],
                "distance": 0.0
            }
            papers.append(paper)
        
        # Sort by year (newest first)
        papers.sort(key=lambda x: x["metadata"].get("year", 0), reverse=True)
        
        return papers[:limit]
    
    except Exception as e:
        log(f"❌ Fallback query failed: {e}")
        return []

def smart_search_api(filters: dict) -> dict:
    """
    Smart Search API - Hybrid keyword + metadata search.
    
    Args:
        filters: {
            "keywords": ["transformer", "attention"],  // Optional
            "title": "Attention Is All You Need",      // Optional
            "authors": ["Vaswani"],                    // Optional
            "year": 2017,                              // Optional
            "arxiv_id": "1706.03762",                  // Optional
            "page": 1                                  // Optional, default: 1
        }
    
    Returns:
        {
            "status": "success" | "error",
            "results": [
                {
                    "arxiv_id": "arxiv:1706.03762",
                    "title": "...",
                    "authors": "...",
                    "year": 2017,
                    "abstract": "...",
                    "pdf_link": "...",
                    "link": "...",
                    "match_type": "exact" | "partial" | "semantic"
                }
            ],
            "pagination": {
                "current_page": 1,
                "total_pages": 7,
                "total_results": 134,
                "per_page": 20
            },
            "metadata": {
                "filters_applied": {...},
                "used_fallback": false,
                "fallback_message": null
            },
            "timestamp": "..."
        }
    """
    response = {
        "operation": "smart_search",
        "timestamp": datetime.now().isoformat()
    }
    
    # Step 1: Validate filters
    is_valid, error_msg = validate_filters(filters)
    if not is_valid:
        response.update({
            "status": "error",
            "message": error_msg
        })
        save_response(response)
        log(f"❌ Validation failed: {error_msg}")
        return response
    
    # Step 2: Get ChromaDB collection
    try:
        client = get_chroma_client()
        collection = client.get_collection("papers_collection")
        log(f"✅ Connected to papers_collection")
    except Exception as e:
        response.update({
            "status": "error",
            "message": f"Database error: {str(e)}"
        })
        save_response(response)
        log(f"❌ Database error: {e}")
        return response
    
    # Step 3: Build query
    keywords = filters.get("keywords", [])
    page = filters.get("page", 1)
    
    # Track if we're doing semantic search
    use_semantic_search = bool(keywords)
    
    # Combine keywords into single query for semantic search
    if use_semantic_search:
        query_text = " ".join(keywords)
        embedder = Embedder()
        query_embedding = embedder.encode(query_text)
        log(f"🔍 Semantic search query: '{query_text}'")
    else:
        query_embedding = None
        log(f"🔍 Metadata-only search (no keywords)")
    
    # Step 4: Build metadata filter
    where_filter = build_metadata_filters(filters)
    
    # Step 5: Query ChromaDB
    try:
        if use_semantic_search:
            # Semantic search with optional metadata filters
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=MAX_RESULTS,
                where=where_filter,
                include=["metadatas", "documents", "distances"]
            )
        else:
            # Metadata-only search (no semantic component)
            # Get all papers matching metadata filters
            results = collection.get(
                where=where_filter,
                include=["metadatas", "documents"]
            )
            
            # Convert to query format
            results = {
                "ids": [results["ids"]],
                "metadatas": [results["metadatas"]],
                "documents": [results["documents"]],
                "distances": [[0.0] * len(results["ids"])]  # No similarity scores
            }
        
        log(f"✅ Retrieved {len(results['ids'][0])} papers from ChromaDB")
    
    except Exception as e:
        response.update({
            "status": "error",
            "message": f"Search error: {str(e)}"
        })
        save_response(response)
        log(f"❌ Search error: {e}")
        return response
    
    # Step 6: Post-filter results (title, authors)
    papers = []
    for i in range(len(results["ids"][0])):
        paper = {
            "metadata": results["metadatas"][0][i],
            "document": results["documents"][0][i],
            "distance": results["distances"][0][i]  # Always available now
        }
        papers.append(paper)
    
    papers = post_filter_results(papers, filters)
    log(f"✅ After post-filtering: {len(papers)} papers")
    
    # Step 7: Sort by similarity (if semantic search was used)
    if use_semantic_search:
        papers.sort(key=lambda x: x["distance"])
    else:
        # Sort by year (newest first) for metadata-only searches
        papers.sort(key=lambda x: x["metadata"].get("year", 0), reverse=True)
    
    # Step 8: Paginate results + Fallback
    total_results = len(papers)
    
    # ✅ FALLBACK: If no results, show recent papers
    used_fallback = False
    if total_results == 0:
        log(f"⚠️ No matches found. Using fallback (recent papers)...")
        papers = get_fallback_results(collection, RESULTS_PER_PAGE)
        total_results = len(papers)
        used_fallback = True
    
    total_pages = (total_results + RESULTS_PER_PAGE - 1) // RESULTS_PER_PAGE
    start_idx = (page - 1) * RESULTS_PER_PAGE
    end_idx = start_idx + RESULTS_PER_PAGE
    paginated_papers = papers[start_idx:end_idx]
    
    # Step 9: Format results
    formatted_results = []
    for paper in paginated_papers:
        metadata = paper["metadata"]
        
        formatted_results.append({
            "arxiv_id": metadata.get("id", ""),
            "title": metadata.get("title", ""),
            "authors": metadata.get("authors", ""),
            "year": metadata.get("year", 0),
            "abstract": paper["document"],
            "pdf_link": metadata.get("pdf_link", ""),
            "link": metadata.get("link", ""),
            "match_type": determine_match_type(filters, metadata) if not used_fallback else "fallback"
        })
    
    # Step 10: Build response
    response.update({
        "status": "success",
        "results": formatted_results,
        "pagination": {
            "current_page": page,
            "total_pages": total_pages,
            "total_results": total_results,
            "per_page": RESULTS_PER_PAGE
        },
        "metadata": {
            "filters_applied": {
                k: v for k, v in filters.items()
                if v is not None and v != [] and k != "page"
            },
            "used_fallback": used_fallback,
            "fallback_message": "No exact matches found. Showing recent papers." if used_fallback else None
        }
    })
    
    save_response(response)
    log(f"✅ Search complete: {len(formatted_results)} results on page {page}/{total_pages}")
    
    return response

def get_resposne_smart_search(filters):
    print("Filters",filters)
    
    payload = {
        "keywords": filters.keywords,
        "title": filters.title,
        "authors": filters.authors,
        "year": filters.year,
        "arxiv_id": filters.arxiv_id,
        "page": filters.page
    }
    
    
    result = smart_search_api(filters=payload)
    
    return result
    

# ============================================================================
# Manual Testing Interface
# ============================================================================

# if __name__ == "__main__":
#     print("\n" + "="*80)
#     print("🧪 SMART SEARCH - Manual Testing")
#     print("="*80)
    
    # Test Case 1: Keyword search 
    # print("\n--- TEST 1: Keyword Search ---")
    # result1 = smart_search_api({
    #     "keywords": ["language model"], 
    #     "title": None,
    #     "authors": [],
    #     "year": None,
    #     "arxiv_id": None,
    #     "page": 1
    # })
    # print(f"Status: {result1['status']}")
    # if result1['status'] == 'success':
    #     print(f"Results: {len(result1['results'])}")
    #     print(f"Total: {result1['pagination']['total_results']}")
    #     if result1['results']:
    #         print(f"Top result: {result1['results'][0]['title']}")
    #         print(f"Match type: {result1['results'][0]['match_type']}")
    #     if result1['metadata'].get('used_fallback'):
    #         print(f"⚠️ Fallback used: {result1['metadata']['fallback_message']}")
    
    # Test Case 2: Title + Author search
    # print("\n--- TEST 2: Title + Author Search ---")
    # result2 = smart_search_api({
    #     "keywords": [],
    #     "title": "Stochastic Chameleons",  
    #     "authors": ["Ziling Cheng"],       
    #     "year": None,
    #     "arxiv_id": None,
    #     "page": 1
    # })
    # print(f"Status: {result2['status']}")
    # if result2['status'] == 'success':
    #     print(f"Results: {len(result2['results'])}")
    #     if result2['results']:
    #         print(f"Top result: {result2['results'][0]['title']}")
    #         print(f"Match type: {result2['results'][0]['match_type']}")
    #     if result2['metadata'].get('used_fallback'):
    #         print(f"⚠️ Fallback used: {result2['metadata']['fallback_message']}")
    
    # # Test Case 3: arXiv ID direct lookup
    # print("\n--- TEST 3: arXiv ID Lookup ---")
    # result3 = smart_search_api({
    #     "keywords": [],
    #     "title": None,
    #     "authors": [],
    #     "year": None,
    #     "arxiv_id": "2508.09224v1",  
    #     "page": 1
    # })
    # print(f"Status: {result3['status']}")
    # if result3['status'] == 'success':
    #     print(f"Results: {len(result3['results'])}")
    #     if result3['results']:
    #         print(f"Found: {result3['results'][0]['title']}")
    #         print(f"Match type: {result3['results'][0]['match_type']}")
    #     if result3['metadata'].get('used_fallback'):
    #         print(f"⚠️ Fallback used: {result3['metadata']['fallback_message']}")
    
    # # Test Case 4: Year filter (2025 - should have results)
    # print("\n--- TEST 4: Year Filter (2025) ---")
    # result4 = smart_search_api({
    #     "keywords": [],
    #     "title": None,
    #     "authors": [],
    #     "year": 2025,  # ✅ Recent year with data
    #     "arxiv_id": None,
    #     "page": 1
    # })
    # print(f"Status: {result4['status']}")
    # if result4['status'] == 'success':
    #     print(f"Results: {len(result4['results'])}")
    #     print(f"Total papers from 2025: {result4['pagination']['total_results']}")
    #     if result4['results']:
    #         print(f"Sample result: {result4['results'][0]['title']}")
    #     if result4['metadata'].get('used_fallback'):
    #         print(f"⚠️ Fallback used: {result4['metadata']['fallback_message']}")
    
    # print("\n" + "="*80)
    # print("✅ Testing complete. Check data/api_responses/last_smart_search_response.json")
    # print("="*80)
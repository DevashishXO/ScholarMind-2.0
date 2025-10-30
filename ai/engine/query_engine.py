from .db_client import get_chroma_client
from ai.models.embedder import Embedder
from ai.utils.logger import log
from .indexing import fetch_arxiv_and_index

def hybrid_search_papers(query: str, top_k: int = 5, similarity_threshold: float = 0.4, min_results: int = 50, check_results: int = 100):
    """
    Hybrid search: Try local DB first, else fetch from arXiv and update DB.
    Only fetch from arXiv if local DB has fewer than min_results or the best similarity is too low.
    """
    client = get_chroma_client()
    collection = client.get_collection("papers_collection")
    embedder = Embedder()

    query_embedding = embedder.encode(query)
    collection_size_before = collection.count()
    # Query for more than min_results to check if DB is exhausted
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=check_results
    )

    found = results and results.get("documents") and len(results["documents"][0]) > 0
    num_found = len(results["documents"][0]) if found else 0
    high_score = False

    best_score = None
    if found and "distances" in results and num_found > 0:
        best_score = 1 - results["distances"][0][0]
        high_score = best_score >= similarity_threshold

    log(f"Local DB returned {num_found} papers for query '{query}'.")
    # Only fetch from arXiv if not enough results or similarity is too low
    if num_found < min_results or (num_found >= min_results and not high_score):
        shortfall = max(min_results - num_found, 0)
        log(f"⚠️ Local results insufficient by {shortfall} papers (found {num_found}, need at least {min_results}), or similarity below threshold.")
        log("🔄 Fetching from arXiv and updating ChromaDB...")
        fetch_arxiv_and_index(query=query, max_results=max(top_k*5, min_results), min_results=min_results)
        # Re-query after updating DB
        collection_size_after = collection.count()
        log(f"ChromaDB collection size before update: {collection_size_before}, after update: {collection_size_after}")
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=check_results
        )
        docs = results["documents"][0][:top_k]
        metadatas = results["metadatas"][0][:top_k]
        distances = results["distances"][0][:top_k]
    else:
        log("✅ Using local ChromaDB results.")
        docs = results["documents"][0][:top_k]
        metadatas = results["metadatas"][0][:top_k]
        distances = results["distances"][0][:top_k]
        collection_size_after = collection_size_before

    similarity_scores = [int(round((1 - d) * 100)) for d in distances]
    highest_score = max(similarity_scores) if similarity_scores else None
    lowest_score = min(similarity_scores) if similarity_scores else None

    print(f"\n🔍 Top {top_k} matching papers for: '{query}'\n")
    for i, doc in enumerate(docs):
        metadata = metadatas[i]
        score = similarity_scores[i] if i < len(similarity_scores) else None

        print(f"Result #{i+1}:")
        print(f"Title: {metadata.get('title', 'N/A')}")
        print(f"Authors: {metadata.get('authors', 'N/A')}")
        print(f"Year: {metadata.get('year', 'N/A')}")
        print(f"PDF Link: {metadata.get('pdf_link', 'N/A')}")
        print(f"Summary: {doc}\n")
        if score is not None:
            print(f"Similarity Score: {score}")
        print("-" * 90)
    
    print(f"\nHighest similarity score: {highest_score}")
    print(f"Lowest similarity score: {lowest_score}")
    print("\n✅Done searching papers (hybrid mode).\n")

    return {
        "query": query,
        "results": [
            {
                "title": metadatas[i].get('title', 'N/A'),
                "authors": metadatas[i].get('authors', 'N/A'),
                "year": metadatas[i].get('year', 'N/A'),
                "pdf_link": metadatas[i].get('pdf_link', 'N/A'),
                "summary": docs[i],
                "similarity_score": similarity_scores[i],
                "arxiv_id": metadatas[i].get('id', 'N/A'),
                "source": metadatas[i].get('source', 'N/A'),
                "link": metadatas[i].get('link', 'N/A')
            }
            for i in range(len(docs))
        ],
        "highest_score": highest_score,
        "lowest_score": lowest_score
    }    
from .db_client import get_chroma_client
from models.embedder import Embedder
from utils.logger import log

def search_papers(query: str, top_k: int = 5):
    """
    Searches for papers in the ChromaDB collection based on a query string.

    Args:
        query (str): The search query.
        top_k (int): Number of top results to return. Defaults to 5.

    Returns:
        list of dict: Each dict contains 'id', 'title', 'authors', 'abstract', 'link', 'year', 'source', and 'score'.
    """

    client = get_chroma_client()
    collection = client.get_collection("papers_collection")
    embedder = Embedder()

    query_embedding = embedder.encode(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    if not results or not results.get("documents") or len(results["documents"][0]) == 0:
        log("No results found for the query in the local database.")
        return
    
    print(f"\n🔍 Top {top_k} matching papers for: '{query}'\n")
    for i, doc in enumerate(results["documents"][0]):
        metadata = results["metadatas"][0][i]
        score = results["distances"][0][i] if "distances" in results else None

        print(f"Result #{i+1}:")
        print(f"Title: {metadata.get('title', 'N/A')}")
        print(f"Authors: {metadata.get('authors', 'N/A')}")
        print(f"Year: {metadata.get('year', 'N/A')}")
        print(f"PDF Link: {metadata.get('pdf_link', 'N/A')}")
        print(f"Summary: {doc}\n")

        if score is not None:
            print(f"Similarity Score: {1 - score:.4f}")
        
        print("-" * 90)

    print("\n✅Done searching papers in the local database.\n")

if __name__ == "__main__":
    query = input("Enter your research query: ").strip()
    top_k = int(input("How many results to display? (default=5): ") or 5)
    search_papers(query, top_k)
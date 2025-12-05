import arxiv
import chromadb
from models.embedder import Embedder
from utils.logger import log
from engine.db_client import get_chroma_client


def get_or_create_collection(client, name= "papers_collection"):
    """
    Retrieves an existing collection or creates a new one if it doesn't exist.

    Args:
        client (chromadb.Client): The Chroma client object.
        name (str): The name of the collection. Defaults to 'papers_collection'.

    Returns:
        chromadb.Collection: A ChromaDB collection ready for adding papers.

    Notes:
        Each collection stores embeddings, metadata, and documents.
        Metadata can include title, authors, link, year, source, etc.
    """
    collections = [c.name for c in client.list_collections()]
    log(f"Existing collections: {collections}")

    if name in collections:
        collection = client.get_collection(name)
        log(f"✅ Loaded existing collection '{name}' with {collection.count()} documents.")

    else:
        collection = client.create_collection(name, configuration={
            "hnsw": {"space": "cosine"}
        })
        log(f"🆕 Created new collection '{name}'.")
    return collection

def add_papers_to_index(collection: chromadb.Collection, papers: list):
    """
    Adds papers to the ChromaDB collection after embedding their abstracts.

    Args:
        collection (chromadb.Collection): ChromaDB collection to store papers.
        papers (list of dict): Each dict must contain:
            - 'id' (str): Unique paper identifier (e.g., arXiv ID)
            - 'title' (str)
            - 'authors' (str)
            - 'abstract' (str)
            - 'link' (str)
            - 'year' (int)
            - 'pdf_link' (str)
            - 'source' (str)

    Notes:
        - Abstracts are embedded using Embedder and stored in the collection.
        - Metadata stored in the collection includes title, authors, link, year, source.
        - This forms the RAG assistant's database for semantic search.
    """
    embedder = Embedder()
    
    abstracts = [p["abstract"] for p in papers]
    ids = [p["id"] for p in papers]
    metadatas = [{k: p[k] for k in p if k != "abstract"} for p in papers]

    log(f"Encoding {len(papers)} papers...")
    embeddings = embedder.encode(abstracts).tolist()

    collection.add(
        ids=ids,
        documents=abstracts,
        embeddings=embeddings,
        metadatas=metadatas
    )
    log(f"Added {len(papers)} papers to index.")

    """
    Fetches recent papers from Arxiv based on a query and indexes them into ChromaDB.
    
    Args:
        query (str): Search keyword(s) for Arxiv.
        max_results (int): Maximum number of papers to fetch (default=10).
    
    Steps:
        1. Initialize Chroma client and collection.
        2. Query Arxiv API and parse papers.
        3. Generate embeddings for abstracts.
        4. Add papers with metadata to the collection.
    """
def fetch_arxiv_and_index(query: str = "machine learning", max_results: int = 1000, fallback_query: str = None, min_results: int = 50):
    client = get_chroma_client()
    collection = get_or_create_collection(client)

    log(f"Fetching up to {max_results} papers from Arxiv for query: '{query}'...")
    arxiv_client = arxiv.Client(page_size=100, delay_seconds=3, num_retries=5)
    search = arxiv.Search(
        query=query,
        max_results=max_results,
        sort_by=arxiv.SortCriterion.SubmittedDate
    )

    papers = []
    try:
        for result in arxiv_client.results(search):
            paper = {
                "id": f"arxiv:{result.entry_id.split('/')[-1]}",
                "title": result.title.strip(),
                "authors": ", ".join([author.name for author in result.authors]),
                "abstract": result.summary.strip(),
                "link": result.entry_id,
                "year": result.published.year,
                "pdf_link": result.pdf_url,
                "source": "arXiv",
                "doi": result.doi if result.doi else None,
                "journal_ref": result.journal_ref if result.journal_ref else None,
                "primary_category": result.primary_category,
                "categories": ", ".join(result.categories),
                "comment": result.comment if result.comment else None,
                "published_date": result.published.strftime("%Y-%m-%d"),
                "updated_date": result.updated.strftime("%Y-%m-%d")
            }
            papers.append(paper)
    except Exception as e:
        log(f"🛑 Critical API Error encountered: {type(e).__name__} - {e}")
        log("Processing partial results gathered before the failure.")        

    if len(papers) < min_results and fallback_query:
        log(f"Only {len(papers)} papers found for '{query}'. Trying fallback query: '{fallback_query}'")
        # Try fallback query
        return fetch_arxiv_and_index(query=fallback_query, max_results=max_results, fallback_query=None, min_results=min_results)

    if not papers:
        log("No papers found for this query.")
        return

    add_papers_to_index(collection, papers)
    log(f"✅ Successfully indexed {len(papers)} papers from Arxiv for '{query}'.")

# if __name__ == "__main__":
#     fetch_arxiv_and_index(query="machine learning ", max_results=100)

#     client = get_chroma_client()
#     collection = get_or_create_collection(client)
#     log(f"Documents in collection: {collection.count()}")
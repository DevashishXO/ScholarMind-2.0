import os
import arxiv
import chromadb
from chromadb.config import Settings
from models.embedder import Embedder
from utils.logger import log

def get_chroma_client(db_path: str = "data/chroma_db") -> chromadb.Client:
    """
    Initializes and returns a persistent ChromaDB client.
    
    Args:
        db_path (str): Path to the directory where ChromaDB persists its data.
                       Defaults to 'data/chroma_db'.

    Returns:
        chromadb.Client: A ChromaDB client instance with disk persistence.

    Notes:
        Persistence ensures that embeddings, documents, and metadata are saved
        to disk and reloaded when the client is restarted.
    """
    os.makedirs(db_path, exist_ok=True)
    client = chromadb.Client(Settings(
        persist_directory=db_path,
        anonymized_telemetry=False
    ))
    log(f"ChromaDB client initialized with persistence at: {db_path}")
    return client

def get_or_create_collection(client: chromadb.Client, name: str = "papers_collection") -> chromadb.Collection:
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
    existing_collections = [c.name for c in client.list_collections()]
    if name in existing_collections:
        collection = client.get_collection(name)
        log(f"Loaded existing collection '{name}' with {collection.count()} documents.")
    else:
        collection = client.create_collection(name)
        log(f"Created new collection '{name}'.")
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
    embeddings = embedder.encode(abstracts).tolist()  # convert to list for ChromaDB

    collection.add(
        ids=ids,
        documents=abstracts,
        embeddings=embeddings,
        metadatas=metadatas
    )
    log(f"Added {len(papers)} papers to index.")


def bootstrap_index():
    """
    Demo function to populate the ChromaDB collection with a few sample papers.
    This helps test that the indexing engine works before connecting to real APIs.

    Steps:
        1. Initializes Chroma client and collection.
        2. Defines a small set of sample papers with full metadata.
        3. Adds them to the collection using add_papers_to_index.
        4. Logs completion.
    """
    client = get_chroma_client()
    collection = get_or_create_collection(client)

    sample_papers = [
        {
            "id": "arxiv:2501.001",
            "title": "Advances in Solid-State Battery Technology",
            "authors": "Doe, J.; Smith, A.",
            "abstract": "This paper discusses breakthroughs in solid-state electrolyte materials and high-energy-density batteries.",
            "link": "https://arxiv.org/abs/2501.001",
            "year": 2025,
            "source": "arXiv"
        },
        {
            "id": "arxiv:2501.002",
            "title": "Machine Learning in Energy Storage Materials",
            "authors": "Lee, B.; Kumar, N.",
            "abstract": "We present an ML framework for predicting ionic conductivity and optimizing battery materials.",
            "link": "https://arxiv.org/abs/2501.002",
            "year": 2025,
            "source": "arXiv"
        }
    ]

    add_papers_to_index(collection, sample_papers)
    log("✅ Bootstrap indexing complete.")

if __name__ == "__main__":
    bootstrap_index()
    client = get_chroma_client()
    collection = get_or_create_collection(client)
    print("Document count in collection:", collection.count())

    result = collection.get(include=['metadatas', 'documents'])
    for meta, doc in zip(result['metadatas'], result['documents']):
        print("Metadata:", meta)
        print("Abstract:", doc)
        print("-" * 50)

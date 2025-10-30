import concurrent.futures
from .indexing import fetch_arxiv_and_index, get_or_create_collection
from ai.utils.logger import log
from ai.engine.db_client import get_chroma_client

DOMAINS = [
    "machine learning",
    "computer vision",
    "NLP",
    "IOT",
    "language models",
    "deep learning",
    "reinforcement learning",
    "quantum computing",
    "cybersecurity",
    "VLSI design"
]

PAPERS_PER_DOMAIN = 100

DOMAIN_FALLBACKS = {
    "IOT": "internet of things",
    "language models": "transformers",
    "deep learning": "neural networks",
    "reinforcement learning": "RL algorithms",
    "quantum computing": "quantum algorithms",
    "cybersecurity": "information security",
    "VLSI design": "integrated circuits"
}

def fetch_and_index_domain(domain):
    try:
        fallback = DOMAIN_FALLBACKS.get(domain)
        log(f"--- Starting indexing for domain: {domain} ---")
        fetch_arxiv_and_index(query=domain, max_results=1000, fallback_query=fallback) #Trying to fetch a large number of papers
        client = get_chroma_client()
        collection = client.get_collection("papers_collection")
        count_after = collection.count() # Checking document count after indexing
        log(f"+++ Finished indexing for domain: {domain}. Collection now has {count_after} documents. +++") 
    except Exception as e:
        log(f"🛑 Error indexing domain '{domain}': {e}")

# if __name__ == "__main__":
#     log("=== Bulk domain indexing started ===")
#     client = get_chroma_client()
#     get_or_create_collection(client)
#     with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
#         executor.map(fetch_and_index_domain, DOMAINS)
#     log("=== Bulk domain indexing completed ===")

#     # Logging final document count
#     collection = client.get_collection("papers_collection")
#     log(f"Total documents in collection: {collection.count()}")
import os
from chromadb import PersistentClient
from utils.logger import log

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(PROJECT_ROOT, "data", "chroma_db")

os.makedirs(DB_PATH, exist_ok=True)

_client = PersistentClient(path=DB_PATH)
log(f"✅ Persistent ChromaDB client created. DB path: {DB_PATH}")

def get_chroma_client():
    """
    Returns a persistent Chroma client. Each process calling this will
    connect to the same local DuckDB/Parquet backend.
    """
    return _client

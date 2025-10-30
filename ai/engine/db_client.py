import os
from chromadb import PersistentClient
from ai.utils.logger import log

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
CHROMA_DB_PATH = os.path.join(DATA_DIR, "chroma_db")
os.makedirs(CHROMA_DB_PATH, exist_ok=True)

_client = PersistentClient(path=CHROMA_DB_PATH)
log(f"✅ Persistent ChromaDB client created. DB path: {CHROMA_DB_PATH}")

def get_chroma_client():
    """
    Returns a persistent Chroma client. Each process calling this will
    connect to the same local DuckDB/Parquet backend.
    """
    return _client
from engine.db_client import get_chroma_client
from utils.logger import log

def reset_pdf_chunks_collection():
    """Delete and recreate pdf_chunks collection with cosine metric."""
    client = get_chroma_client()
    
    try:
        client.delete_collection("pdf_chunks")
        log("🗑️ Deleted old pdf_chunks collection")
    except:
        log("ℹ️ No existing pdf_chunks collection to delete")
    
    collection = client.create_collection(
        "pdf_chunks",
        metadata={"hnsw:space": "cosine"}
    )
    log("✅ Created new pdf_chunks collection with cosine metric")
    return collection

if __name__ == "__main__":
    reset_pdf_chunks_collection()
    print("Done. Now reprocess your PDFs.")
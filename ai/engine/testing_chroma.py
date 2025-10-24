from .indexing import  get_or_create_collection, log
from engine.db_client import get_chroma_client


client = get_chroma_client()
log(f"Client object id: {id(client)}")
collection = get_or_create_collection(client)
log(f"Documents in collection: {collection.count()}")

collections = client.list_collections()
for col in collections:
    log(f"Collection Name: {col.name}, Document Count: {col.count()}")
    # Fetch and log documents in the collection
    documents = col.get(include=['documents', 'metadatas'])
    for doc, meta in zip(documents['documents'], documents['metadatas']):
        log(f"Document: {doc}, Metadata: {meta}")
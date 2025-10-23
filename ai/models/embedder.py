from sentence_transformers import SentenceTransformer
import threading
import numpy as np

class Embedder:
    """
    Singleton wrapper for SentenceTransformer to avoid multiple model loads.
    Thread-safe for potential multi-query scenarios in the future.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(Embedder, cls).__new__(cls)
                    cls._instance.model = SentenceTransformer(model_name)
        return cls._instance
    
    def encode(self, texts, normalize: bool = True):
        """
        Encodes a single string or list of strings to embeddings.
        Args:
            texts: str or List[str]
            normalize: if True, return L2-normalized vectors (useful for cosine similarity)
        Returns:
            np.ndarray of shape (n, d)
        """
        single = False
        if isinstance(texts, str):
            texts = [texts]
            single = True
        emb = self.model.encode(texts, show_progress_bar=False)
        emb = np.array(emb)
        if normalize:
            norms = np.linalg.norm(emb, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            emb = emb / norms
        return emb[0] if single else emb

import numpy as np
from embedder import Embedder

emb = Embedder()
v = emb.encode("solid state batteries")

print("First 10 dims:", v[:10])
print("Norm:", np.linalg.norm(v))

import requests
from pypdf import PdfReader
from io import BytesIO
from models.embedder import Embedder
from engine.db_client import get_chroma_client
from utils.logger import log
from utils.llm_client import call_groq_llm

CHUNK_SIZE = 800
OVERLAP = 200

def _get_pdf_collection():
    """Get or create pdf_chunks collection with cosine metric."""
    client = get_chroma_client()
    try:
        collection = client.get_collection("pdf_chunks")
        if collection.metadata.get("hnsw:space") != "cosine":
            log("⚠️ Existing collection doesn't use cosine. Run reset_pdf_collection.py first!")
        return collection
    except:
        return client.create_collection("pdf_chunks", metadata={"hnsw:space": "cosine"})

def _extract_text_with_page_tracking(reader):
    """Extract text and track which character belongs to which page."""
    page_texts = []
    char_to_page = []  # Maps character index to page number
    current_char = 0
    
    for page_num, page in enumerate(reader.pages, 1):
        text = page.extract_text()
        if text:
            page_texts.append(text)
            # Track page for each character
            for _ in range(len(text)):
                char_to_page.append(page_num)
            current_char += len(text)
    
    full_text = "".join(page_texts)
    return full_text, char_to_page

def _get_page_for_chunk(chunk_start: int, char_to_page: list) -> int:
    """Get page number for a chunk starting at chunk_start."""
    if chunk_start >= len(char_to_page):
        return char_to_page[-1] if char_to_page else 1
    return char_to_page[chunk_start]

def _adaptive_summary_sampling(full_text: str, text_len: int) -> str:
    """Adaptively sample paper sections with methodology emphasis."""
    
    # If short paper, use all
    if text_len <= 28000:
        log(f"ℹ️ Short paper ({text_len} chars), using full text")
        return f"=== FULL PAPER ===\n{full_text}"
    
    # For longer papers, use 4-section strategy
    # 1. Beginning (Abstract + Intro): 12k
    section_1 = full_text[:12000]
    
    # 2. Early-middle (Methodology - usually after intro): 10k
    # Start at ~20% through paper (after intro) to ~40%
    method_start = int(text_len * 0.20)
    method_end = int(text_len * 0.40)
    section_2 = full_text[method_start:method_end][:10000]
    
    # 3. Late-middle (Results/Experiments): 6k
    # From ~60% to ~75% (before conclusion/refs)
    results_start = int(text_len * 0.60)
    results_end = int(text_len * 0.75)
    section_3 = full_text[results_start:results_end][:6000]
    
    # 4. End (Discussion/Conclusion): Last 8k, skip last 2k (refs)
    section_4 = full_text[-10000:-2000]
    
    combined = f"""
=== ABSTRACT & INTRODUCTION ===
{section_1}

=== METHODOLOGY (Core Technical Approach) ===
{section_2}

=== RESULTS & EXPERIMENTS ===
{section_3}

=== DISCUSSION & CONCLUSION ===
{section_4}
"""
    
    log(f"ℹ️ Sampled {len(combined)} chars from {text_len} total (4 strategic sections)")
    return combined

def _generate_paper_summary(full_text: str, arxiv_id: str, text_len: int) -> str:
    """Generate comprehensive summary with balanced coverage."""
    log(f"🤖 Generating full paper summary for {arxiv_id}...")
    
    combined_context = _adaptive_summary_sampling(full_text, text_len)
    
    system_prompt = (
        "You are a research paper analyst. Generate a comprehensive technical summary with balanced coverage of all sections.\n\n"
        "## Structure (use these headings):\n\n"
        "### 1. Title & Core Topic\n"
        "State the exact paper title and main research area.\n\n"
        "### 2. Research Problem\n"
        "What specific gap, challenge, or question does this paper address?\n\n"
        "### 3. Main Contributions\n"
        "List the key novel contributions (3-5 items). Be specific: name architectures, algorithms, theorems, datasets, or findings.\n\n"
        "### 4. Methodology\n"
        "Describe the core technical approach:\n"
        "- What framework/model/algorithm is proposed or used?\n"
        "- What are the key components and how do they work?\n"
        "- What equations, architectures, or formulations are central?\n"
        "Note: Focus on the *technical approach*, not training details.\n\n"
        "### 5. Experimental Setup (if applicable)\n"
        "If the paper includes experiments, summarize:\n"
        "- Datasets used\n"
        "- Baseline methods compared against\n"
        "- Evaluation metrics\n"
        "- Key hyperparameters (optimizer, learning rate, etc.)\n"
        "If no experiments, state: 'Not applicable (theoretical paper)' or similar.\n\n"
        "### 6. Key Results\n"
        "Quantitative and qualitative findings. Include specific numbers, comparisons, and insights.\n\n"
        "### 7. Limitations & Future Work\n"
        "What limitations do the authors explicitly acknowledge? What future directions do they propose?\n"
        "If not discussed, state: 'Not explicitly discussed in the provided excerpts.'\n\n"
        "### 8. Broader Impact & Applications\n"
        "Potential applications, relevance to other fields, or societal implications.\n\n"
        "## Critical Instructions:\n"
        "- Extract SPECIFIC technical details: equation names, parameter symbols, architecture components\n"
        "- Use exact terminology from the paper\n"
        "- Balance coverage: no section should dominate unless it's the paper's primary focus\n"
        "- This summary must support answering questions about ANY aspect of the paper\n"
        "- If a section is not present in the excerpts, acknowledge it clearly\n"
        "- Avoid generic phrases; be precise and technical"
    )
    
    user_prompt = f"Analyze this research paper and provide a structured technical summary:\n\n{combined_context}"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        summary = call_groq_llm(messages, json_mode=False, max_tokens=4000, temperature=0.15)
        log(f"✅ Generated summary ({len(summary)} chars)")
        return summary
    except Exception as e:
        log(f"❌ Summary generation failed: {e}")
        return f"Summary generation failed: {e}"

def process_pdf(arxiv_id: str, pdf_url: str):

    """
    Process PDF: extract text with page tracking, chunk, embed, summarize, store.
    
    INTERNAL FUNCTION - Called by chat_pdf_handler.process_paper_api()
    
    Args:
        arxiv_id: e.g., "arxiv:1706.03762"
        pdf_url: e.g., "https://arxiv.org/pdf/1706.03762.pdf"
    
    Returns:
        {
            "status": "success" | "error",
            "message": str,
            "chunks_processed": int (if success),
            "summary": str (if success)
        }
    """

    log(f"📄 Processing PDF for {arxiv_id}...")
    
    # Step 1: Download
    try:
        response = requests.get(pdf_url, timeout=30)
        response.raise_for_status()
        pdf_file = BytesIO(response.content)
        log(f"✅ Downloaded PDF from {pdf_url}")
    except Exception as e:
        log(f"❌ Download failed: {e}")
        return {"status": "error", "message": f"Download failed: {e}"}
    
    # Step 2: Extract with page tracking
    try:
        reader = PdfReader(pdf_file)
        full_text_raw, char_to_page = _extract_text_with_page_tracking(reader)
        
        if not full_text_raw.strip():
            log(f"⚠️ No text extracted")
            return {"status": "error", "message": "No extractable text"}
        
        # Clean text (but keep char positions aligned)
        full_text = full_text_raw.replace("-\n", "").replace("\n", " ")
        full_text = " ".join(full_text.split())
        
        # Recompute char_to_page after cleaning (approximate)
        # Simpler: just track original positions
        
        log(f"✅ Extracted {len(full_text)} chars from {len(reader.pages)} pages")
    except Exception as e:
        log(f"❌ Extraction failed: {e}")
        return {"status": "error", "message": f"Extraction failed: {e}"}
    
    # Step 3: Generate summary
    paper_summary = _generate_paper_summary(full_text, arxiv_id, len(full_text))
    
    # Step 4: Chunk with page tracking
    chunks = []
    chunk_metadata = []
    start = 0
    chunk_idx = 0
    
    while start < len(full_text):
        end = start + CHUNK_SIZE
        chunk_text = full_text[start:end]
        
        # Determine page number for this chunk
        # Use midpoint of chunk for page assignment
        chunk_midpoint = start + (end - start) // 2
        page_num = _get_page_for_chunk(chunk_midpoint, char_to_page)
        
        chunks.append(chunk_text)
        chunk_metadata.append({
            "chunk_index": chunk_idx,
            "page_number": page_num,
            "char_start": start,
            "char_end": min(end, len(full_text))
        })
        
        start += (CHUNK_SIZE - OVERLAP)
        chunk_idx += 1
    
    log(f"✅ Created {len(chunks)} chunks across {len(reader.pages)} pages")
    
    # Step 5: Embed
    try:
        embedder = Embedder()
        embeddings = embedder.encode(chunks, normalize=True)
        log(f"✅ Embedded {len(chunks)} chunks")
    except Exception as e:
        log(f"❌ Embedding failed: {e}")
        return {"status": "error", "message": f"Embedding failed: {e}"}
    
    # Step 6: Store with page numbers
    try:
        collection = _get_pdf_collection()
        
        ids = [f"{arxiv_id}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "arxiv_id": arxiv_id,
                "chunk_index": meta["chunk_index"],
                "page_number": meta["page_number"],
                "total_chunks": len(chunks),
                "type": "chunk"
            }
            for meta in chunk_metadata
        ]
        
        collection.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings.tolist(),
            metadatas=metadatas
        )
        
        # Store summary
        summary_embedding = embedder.encode(paper_summary, normalize=True)
        collection.add(
            ids=[f"{arxiv_id}_SUMMARY"],
            documents=[paper_summary],
            embeddings=[summary_embedding.tolist()],
            metadatas=[{
                "arxiv_id": arxiv_id,
                "type": "summary",
                "total_chunks": len(chunks)
            }]
        )
        
        log(f"✅ Stored {len(chunks)} chunks + summary for {arxiv_id}")
    except Exception as e:
        log(f"❌ Storage failed: {e}")
        return {"status": "error", "message": f"Storage failed: {e}"}
    
    return {
        "status": "success",
        "chunks_processed": len(chunks),
        "arxiv_id": arxiv_id,
        "summary": paper_summary
    }

def is_pdf_processed(arxiv_id: str) -> bool:
    """Check if PDF is already processed."""
    try:
        client = get_chroma_client()
        collection = client.get_collection("pdf_chunks")
        results = collection.get(where={"arxiv_id": arxiv_id}, limit=1)
        return len(results["ids"]) > 0
    except:
        return False

if __name__ == "__main__":
    test_arxiv_id = "arxiv:2511.01463"
    test_pdf_url = "https://arxiv.org/pdf/2511.01463.pdf"
    result = process_pdf(test_arxiv_id, test_pdf_url)
    print(result)
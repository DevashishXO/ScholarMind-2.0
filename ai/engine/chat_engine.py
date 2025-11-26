from models.embedder import Embedder
from engine.db_client import get_chroma_client
from utils.llm_client import call_groq_llm
from utils.logger import log

def _get_paper_summary(arxiv_id: str, collection) -> str:
    """Retrieve the pre-generated paper summary."""
    try:
        results = collection.get(
            ids=[f"{arxiv_id}_SUMMARY"],
            include=["documents"]
        )
        if results and results["documents"]:
            return results["documents"][0]
    except:
        pass
    return None

def _detect_query_intent(question: str) -> dict:
    """Detect user's likely intent (soft guidance, non-restrictive)."""
    q = question.lower()
    
    return {
        "limitations": any(w in q for w in ["drawback", "limitation", "challenge", "weakness", "problem", "shortcoming"]),
        "contributions": any(w in q for w in ["contribution", "novelty", "innovation", "advance", "propose", "introduce"]),
        "methodology": any(w in q for w in ["method", "approach", "algorithm", "how does", "technique", "implement"]),
        "results": any(w in q for w in ["result", "finding", "performance", "accuracy", "outcome", "achieve"]),
        "future_work": any(w in q for w in ["future", "improvement", "extension", "next step", "scope"])
    }

def _get_theme_specific_guidance(intent: dict) -> str:
    """
    Generate non-intrusive theme-specific guidance based on detected intent.
    Returns addendum to base prompt, not a replacement.
    """
    active_themes = [k for k, v in intent.items() if v]
    
    if not active_themes:
        return ""
    
    # Theme-specific hints (probabilistic, not definitive)
    theme_guides = {
        "methodology": (
            "\n**Theme Hint:** The query may relate to methodology. If so:\n"
            "- Distinguish between core technical approach (architecture, algorithms) and experimental setup (optimizer, batch size)\n"
            "- Prioritize explaining 'how the method works' over 'how it was trained'\n"
            "- Focus on novel algorithmic or architectural contributions"
        ),
        "contributions": (
            "\n**Theme Hint:** The query may relate to contributions/novelty. If so:\n"
            "- Highlight what is NEW in this paper vs. prior work\n"
            "- Emphasize theoretical advances, new models, new datasets, or new insights\n"
            "- Distinguish between incremental improvements and major breakthroughs"
        ),
        "results": (
            "\n**Theme Hint:** The query may relate to experimental results. If so:\n"
            "- Prioritize quantitative findings (numbers, percentages, comparisons)\n"
            "- Include comparisons to baselines if available\n"
            "- Mention statistical significance or confidence intervals if stated"
        ),
        "limitations": (
            "\n**Theme Hint:** The query may relate to limitations/drawbacks. If so:\n"
            "- ONLY cite limitations explicitly stated by the authors\n"
            "- Clearly distinguish between author-acknowledged limitations and potential concerns you infer\n"
            "- If no explicit limitations are found, state so clearly rather than speculating"
        ),
        "future_work": (
            "\n**Theme Hint:** The query may relate to future work/improvements. If so:\n"
            "- Focus on future directions explicitly proposed by the authors\n"
            "- Distinguish between 'next steps authors suggest' and 'gaps you observe'\n"
            "- If no future work is discussed, state so clearly"
        )
    }
    
    # Combine active themes (prioritize by detection order)
    guidance = ""
    for theme in ["methodology", "contributions", "results", "limitations", "future_work"]:
        if intent.get(theme, False):
            guidance += theme_guides[theme]
            break  # Use only the first detected theme to avoid prompt bloat
    
    return guidance

def chat_with_pdf(arxiv_id: str, user_question: str, top_k: int = 12):

    """
    Generalized chat with theme-aware prompting.
    
    INTERNAL FUNCTION - Called by chat_pdf_handler.chat_api()
    
    Args:
        arxiv_id: e.g., "arxiv:1706.03762"
        user_question: User's natural language question
        top_k: Number of chunks to retrieve (default: 12)
    
    Returns:
        {
            "answer": str,
            "chunks_used": list[str],
            "chunk_similarities": list[int],
            "chunk_metadata": dict,  # Maps citation numbers to page/chunk info
            "arxiv_id": str,
            "has_summary": bool
        }
    """

    log(f"💬 Chat query for {arxiv_id}: {user_question}")
    
    intent = _detect_query_intent(user_question)
    detected_themes = [k for k, v in intent.items() if v]
    log(f"ℹ️ Detected probable themes: {detected_themes if detected_themes else ['general']}")
    
    embedder = Embedder()
    question_embedding = embedder.encode(user_question, normalize=True)
    
    try:
        client = get_chroma_client()
        collection = client.get_collection("pdf_chunks")
        
        paper_summary = _get_paper_summary(arxiv_id, collection)
        
        if not paper_summary:
            log(f"⚠️ No summary found for {arxiv_id}")
            return {
                "answer": "This paper has not been processed yet. Please process it first.",
                "chunks_used": [],
                "chunk_similarities": [],
                "chunk_metadata": [],
                "arxiv_id": arxiv_id
            }
        
        # Adaptive retrieval based on theme
        retrieval_k = 30 if intent.get("methodology") else 20
        if intent.get("limitations") or intent.get("future_work"):
            retrieval_k = 20
        
        results = collection.query(
            query_embeddings=[question_embedding.tolist()],
            n_results=retrieval_k,
            where={
                "$and": [
                    {"arxiv_id": arxiv_id},
                    {"type": "chunk"}
                ]
            }
        )
        
        if not results or not results.get("documents") or len(results["documents"][0]) == 0:
            chunks = []
            distances = []
            metadatas = []
        else:
            all_chunks = results["documents"][0]
            all_distances = results["distances"][0]
            all_metadatas = results["metadatas"][0]
            
            # Aggressive re-ranking: filter low-quality chunks
            scored_chunks = []
            for chunk, dist, meta in zip(all_chunks, all_distances, all_metadatas):
                page = meta.get("page_number", 999)
                chunk_lower = chunk.lower()
                
                # Skip obvious appendix/meta content
                skip_patterns = [
                    "neurips checklist", "acknowledgment", "appendix",
                    "references", "bibliography", "checklist",
                    "broader impact statement", "ethics statement"
                ]
                if any(pattern in chunk_lower for pattern in skip_patterns):
                    continue  # Skip this chunk entirely
                
                # Apply page-based boosting
                if intent.get("methodology"):
                    if page <= 12:  # Main content
                        boost = -0.08  # Strong boost
                    elif page <= 18:
                        boost = 0.0
                    else:  # Appendix
                        boost = 0.20  # Strong penalty
                else:
                    boost = 0.0
                
                adjusted_dist = dist + boost
                scored_chunks.append((adjusted_dist, chunk, dist, meta))
            
            if not scored_chunks:
                # Fallback if all chunks were filtered
                scored_chunks = [(d, c, d, m) for c, d, m in zip(all_chunks, all_distances, all_metadatas)]
            
            scored_chunks.sort(key=lambda x: x[0])
            chunks = [x[1] for x in scored_chunks[:top_k]]
            distances = [x[2] for x in scored_chunks[:top_k]]
            metadatas = [x[3] for x in scored_chunks[:top_k]]
            
            log(f"✅ Filtered {len(all_chunks)} → {len(scored_chunks)} → {len(chunks)} chunks")
    
    except Exception as e:
        log(f"❌ Retrieval failed: {e}")
        return {
            "answer": f"Error: {e}",
            "chunks_used": [],
            "chunk_similarities": [],
            "chunk_metadata": [],
            "arxiv_id": arxiv_id
        }
    
    # Build context with citation mapping
    context = f"# Paper Summary\n\n{paper_summary}\n\n"
    citation_map = {}  # Map [N] -> {page, chunk_idx, similarity}
    
    if chunks:
        context += "# Relevant Excerpts\n\n"
        for i, (chunk, d, md) in enumerate(zip(chunks, distances, metadatas), 1):
            cos_sim = 1.0 - d
            similarity_pct = int(((cos_sim + 1.0) / 2.0) * 100)
            similarity_pct = max(0, min(100, similarity_pct))
            
            page = md.get("page_number", "?")
            chunk_idx = md.get("chunk_index", "?")
            
            # Store citation metadata for frontend
            citation_map[i] = {
                "page": page,
                "chunk_index": chunk_idx,
                "similarity": similarity_pct
            }
            
            context += f"[{i}] (Page {page}, Sim {similarity_pct}%)\n{chunk}\n\n"
    
    # Get theme-specific guidance
    theme_guidance = _get_theme_specific_guidance(intent)
    
    # Base prompt (universal)
    base_prompt = (
        "You are a technical research paper assistant.\n\n"
        "You have access to:\n"
        "1. **Paper Summary**: Comprehensive overview of the entire paper\n"
        "2. **Excerpts**: Specific relevant text segments with page numbers\n\n"
        "## Universal Instructions:\n"
        "- Answer using the provided context (summary + excerpts)\n"
        "- Cite excerpts as [N] where N is the excerpt number (e.g., [1], [3][5])\n"
        "- Do NOT cite [Summary] or [Paper Summary] - it's for background only\n"
        "- If information is insufficient, clearly state: 'The provided excerpts do not contain details about [topic]'\n"
        "- Do NOT fabricate technical details, equations, or results\n"
        "- Prefer citing excerpts over paraphrasing summary (excerpts are traceable to pages)\n"
        "- Use Markdown: headings, bullets, bold for key terms\n"
        "- Be technically precise and comprehensive"
    )
    
    system_prompt = base_prompt + theme_guidance
    
    user_prompt = (
        f"Paper: {arxiv_id}\n\n"
        f"{context}\n"
        f"Question: {user_question}\n\n"
        f"Answer comprehensively using the summary and excerpts. Cite excerpts as [N]."
    )
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        answer = call_groq_llm(messages, json_mode=False, max_tokens=2048, temperature=0.2)
        answer = answer.replace("[Summary]", "").replace("[summary]", "").replace("[Paper Summary]", "")
        log(f"✅ Generated answer ({len(answer)} chars)")
    except Exception as e:
        log(f"❌ LLM failed: {e}")
        answer = f"Error: {e}"
    
    similarities = []
    if distances:
        for d in distances:
            cos_sim = 1.0 - d
            pct = int(((cos_sim + 1.0) / 2.0) * 100)
            similarities.append(max(0, min(100, pct)))
    
    return {
        "answer": answer,
        "chunks_used": chunks,
        "chunk_similarities": similarities,
        "chunk_metadata": citation_map,  # NEW: Citation mapping for frontend
        "arxiv_id": arxiv_id,
        "has_summary": True
    }

if __name__ == "__main__":
    test_arxiv_id = input("Enter arXiv ID: ").strip()
    question = input("Ask a question: ").strip()
    
    result = chat_with_pdf(test_arxiv_id, question)
    
    print("\n" + "="*80)
    print("ANSWER:")
    print("="*80)
    print(result["answer"])
    print("\n" + "="*80)
    print(f"Similarities: {result['chunk_similarities']}")
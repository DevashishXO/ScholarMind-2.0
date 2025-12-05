from engine.pdf_processor import process_pdf, is_pdf_processed
from utils.llm_client import call_groq_llm
from utils.logger import log
from engine.db_client import get_chroma_client
from models.embedder import Embedder
import re


def extract_citations_from_markdown(markdown_text: str) -> list:
    """Extract citation numbers from markdown like [1], [3][5]."""
    pattern = r'\[(\d+)\]'
    citations = re.findall(pattern, markdown_text)
    return sorted(set([int(c) for c in citations]))


def generate_smart_report(arxiv_id: str, pdf_url: str = None, paper_metadata: dict = None) -> dict:
    """
    Generate comprehensive smart research report for a paper.
    
    ✅ OPTIMIZED: 7 LLM calls → 1 LLM call
    ✅ PRESERVES: Reading time, page count, metadata, citation extraction
    
    Args:
        arxiv_id: e.g., "arxiv:1706.03762"
        pdf_url: Optional. If paper not processed, this is needed.
        paper_metadata: Optional. Paper metadata from smart_search
    
    Returns:
        {
            "status": "success" | "error",
            "report": "Markdown-formatted smart report",
            "arxiv_id": "arxiv:1706.03762",
            "citations": [1, 3, 5, ...],  # ✅ NEW: Citation numbers found
            "metadata": {
                "reading_time_minutes": 45,
                "page_count": 9,
                "sections_generated": 7,
                "llm_calls": 1  # ✅ OPTIMIZED
            }
        }
    """
    
    # Step 1: Ensure paper is processed
    if not is_pdf_processed(arxiv_id):
        if not pdf_url:
            return {
                "status": "error",
                "message": "Paper not processed and no PDF URL provided"
            }
        
        log(f"📄 Paper {arxiv_id} not processed. Downloading and processing now...")
        result = process_pdf(arxiv_id, pdf_url)
        
        if result["status"] != "success":
            return result
        
        log(f"✅ Paper processed successfully")
    
    # Step 2: Get paper metadata (if not provided)
    if not paper_metadata:
        try:
            client = get_chroma_client()
            papers_coll = client.get_collection("papers_collection")
            metadata_result = papers_coll.get(ids=[arxiv_id])
            if metadata_result and metadata_result["metadatas"]:
                paper_metadata = metadata_result["metadatas"][0]
            else:
                paper_metadata = {}
        except Exception as e:
            log(f"⚠️ Could not fetch metadata: {e}")
            paper_metadata = {}
    
    # Step 3: ✅ OPTIMIZED - Retrieve ALL chunks in ONE query
    try:
        embedder = Embedder()
        client = get_chroma_client()
        chunks_coll = client.get_collection("pdf_chunks")
        
        # Combined query covering all 7 topics
        combined_query = " ".join([
            "main contributions novelty innovation",
            "methodology approach techniques algorithm",
            "experimental results findings performance metrics",
            "limitations challenges drawbacks",
            "future work extensions next steps",
            "prerequisites background knowledge requirements",
            "practical applications real-world use cases impact"
        ])
        
        combined_embedding = embedder.encode(combined_query, normalize=True)
        
        # Get 50 most relevant chunks (covers all topics)
        results = chunks_coll.query(
            query_embeddings=[combined_embedding.tolist()],
            n_results=50,
            where={
                "$and": [
                    {"arxiv_id": arxiv_id},
                    {"type": "chunk"}
                ]
            },
            include=["documents", "metadatas", "distances"]
        )
        
        if not results or not results.get("documents"):
            log(f"⚠️ No chunks found for {arxiv_id}")
            return {"status": "error", "message": "No paper content found"}
        
        chunks = results["documents"][0]
        metadatas = results["metadatas"][0]
        
        log(f"✅ Retrieved {len(chunks)} chunks in single query")
        
    except Exception as e:
        log(f"❌ Chunk retrieval failed: {e}")
        return {"status": "error", "message": f"Chunk retrieval failed: {e}"}
    
    # Step 4: Get paper summary
    try:
        # ✅ Try to get cached summary first
        summary_result = chunks_coll.get(
            ids=[f"{arxiv_id}_SUMMARY"],
            include=["documents"]
        )
        
        if summary_result and summary_result["documents"] and summary_result["documents"][0]:
            paper_summary = summary_result["documents"][0]
            log(f"✅ Retrieved cached summary (saved ~4 seconds!)")
        else:
            log(f"⚠️ No cached summary found for {arxiv_id}")
            paper_summary = "Summary not available"
        
    except Exception as e:
        log(f"⚠️ Summary retrieval failed: {e}")
        paper_summary = "Summary not available"
    
    # Step 5: Build context with all chunks
    context = f"# Paper Summary\n\n{paper_summary}\n\n# Relevant Excerpts\n\n"
    for i, (chunk, metadata) in enumerate(zip(chunks, metadatas), 1):
        page = metadata.get("page_number", "?")
        context += f"[{i}] (Page {page})\n{chunk}\n\n"
    
    # Step 6: ✅ SINGLE LLM CALL - Generate all 7 sections at once
    system_prompt = (
        "You are a research assistant generating a comprehensive paper synthesis.\n"
        "Analyze the paper across 7 dimensions and return ONLY valid Markdown.\n"
        "For each section, cite excerpts as [N] where N matches the excerpt number.\n"
        "If a dimension is not addressed in excerpts, state so explicitly.\n"
        "Do NOT hallucinate or infer beyond what's in the excerpts.\n"
    )
    
    user_prompt = f"""Analyze this paper comprehensively across ALL 7 sections:

{context}

Generate EXACTLY these 7 sections in Markdown (no numbering, preserve emojis):

## 📌 Why This Paper Matters
Main contributions and novelty. 2-3 paragraphs with citations [N].

## 📚 Prerequisites
Background knowledge needed to understand this paper. Bullet points.

## 🛠️ Methodology
Core technical approach, algorithms, and architecture. 2-3 paragraphs with citations.

## 📊 Key Results
Quantitative experimental findings and metrics. Include numbers, comparisons, and significance.

## 💡 Practical Applications
Real-world use cases and impact. Bullet points.

## ⚠️ Limitations
Author-stated limitations ONLY. If not found, state: "The provided excerpts do not explicitly discuss limitations."

## 🔮 Future Work
Author-suggested future directions ONLY. If not found, state: "The provided excerpts do not discuss proposed future work."

CRITICAL: Return ONLY Markdown. No preamble, no explanations. Start with ## 📌."""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        report_content = call_groq_llm(messages, json_mode=False, max_tokens=4000, temperature=0.2)
        log(f"✅ Generated synthesis in 1 LLM call ({len(report_content)} chars)")
    except Exception as e:
        log(f"❌ Synthesis generation failed: {e}")
        return {"status": "error", "message": f"Synthesis failed: {e}"}
    
    # Step 7: ✅ PRESERVE - Calculate reading time and page count
    try:
        max_page = max(m.get("page_number", 0) for m in metadatas) if metadatas else 0
        reading_time = max(max_page * 5, 30)  # 5 min/page, minimum 30 mins
    except:
        max_page = 0
        reading_time = 45
    
    # Step 8: ✅ NEW - Extract citations from report
    citation_numbers = extract_citations_from_markdown(report_content)
    
    # Build citation details for frontend
    citations = []
    for cite_num in citation_numbers:
        if cite_num <= len(chunks):
            citations.append({
                "number": cite_num,
                "page": metadatas[cite_num - 1].get("page_number", "?"),
                "chunk_index": metadatas[cite_num - 1].get("chunk_index", "?"),
                "preview": chunks[cite_num - 1][:300] + "..." if len(chunks[cite_num - 1]) > 300 else chunks[cite_num - 1]
            })
    
    # Step 9: ✅ PRESERVE - Format metadata
    title = paper_metadata.get("title", "Unknown Title") if paper_metadata else "Unknown Title"
    authors = paper_metadata.get("authors", "Unknown Authors") if paper_metadata else "Unknown Authors"
    year = paper_metadata.get("year", "Unknown Year") if paper_metadata else "Unknown Year"
    arxiv_link = paper_metadata.get("link", f"https://arxiv.org/abs/{arxiv_id.replace('arxiv:', '')}") if paper_metadata else f"https://arxiv.org/abs/{arxiv_id.replace('arxiv:', '')}"
    pdf_link = paper_metadata.get("pdf_link", f"https://arxiv.org/pdf/{arxiv_id.replace('arxiv:', '')}.pdf") if paper_metadata else f"https://arxiv.org/pdf/{arxiv_id.replace('arxiv:', '')}.pdf"
    categories = paper_metadata.get("categories", "") if paper_metadata else ""
    comment = paper_metadata.get("comment", "") if paper_metadata else ""
    
    # Step 10: ✅ PRESERVE - Build final report with all metadata sections
    final_report = f"""# 🔬 Research Assistant Report

## 📄 Paper Information

**Title:** {title}  
**Authors:** {authors}  
**Year:** {year}  
**arXiv ID:** [{arxiv_id}]({arxiv_link})  
**Categories:** {categories if categories else "Not specified"}  
{f"**Publication Info:** {comment}" if comment else "No Information provided by the author or publisher."}

---

## ⏱️ Reading Guide

**Estimated Reading Time:** ~{reading_time} minutes ({max_page} pages)

**Recommended Approach:**
1. Read "Why This Paper Matters" + "Prerequisites" (~10 min)
2. Read "Methodology" (~15 min)
3. Read "Key Results" (~15 min)
4. Read "Practical Applications" (~5 min)
5. Review "Limitations" and "Future Work" (~5 min)

**[📥 Download PDF]({pdf_link})**

---

{report_content}

---

## 🎓 Recommended Reading Order

If you're new to this topic:
1. **Start here:** "Why This Paper Matters" + "Prerequisites"
2. **Understand:** "Methodology"
3. **See evidence:** "Key Results"
4. **Apply knowledge:** "Practical Applications"
5. **Think critically:** "Limitations" and "Future Work"

---

## 📖 Citation

```bibtex
@article{{{arxiv_id.replace('arxiv:', '')}}},
  title={{{title}}},
  author={{{authors}}},
  year={{{year}}},
  url={{{arxiv_link}}}
}}
```

---

*Smart Report generated by ScholarMind | {len(chunks)} excerpts analyzed *
"""
    
    log(f"✅ Synthesis report complete: {reading_time} min read, {len(citations)} citations")
    
    return {
        "status": "success",
        "report": final_report,
        "arxiv_id": arxiv_id,
        "citations": citations,  # ✅ NEW: Citation details
        "metadata": {
            "reading_time_minutes": reading_time,
            "page_count": max_page,
            "sections_generated": 7,
            "llm_calls": 1,  # ✅ OPTIMIZED
            "chunks_analyzed": len(chunks),
            "citations_found": len(citations)
        }
    }
from .query_engine import hybrid_search_papers
from utils.llm_client import call_groq_llm
import json
import os

TOP_K = 7
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

def build_context_from_papers(papers):
    context = ""
    for idx, paper in enumerate(papers, 1):
        context += (
            f"[{idx}] Title: {paper['title']}\n"
            f"   Authors: {paper['authors']}\n"
            f"   Year: {paper['year']}\n"
            f"   PDF Link: {paper['pdf_link']}\n"
            f"   Similarity Score: {paper['similarity_score']}/100\n"
            f"   Summary: {paper['summary']}\n\n"
        )
    return context

def rag_answer(user_query, top_k=5):
    """
    Performs retrieval-augmented generation (RAG) to answer a research question.
    Retrieves relevant papers and uses them as context for the LLM to generate an answer.
    """
    
    retrieval = hybrid_search_papers(user_query, top_k)
    papers = retrieval["results"]
    context = build_context_from_papers(papers)

    system_prompt = (
        "You are ScholarMind, a retrieval-augmented generation (RAG) research assistant.\n\n"
        "**CRITICAL: You MUST return ONLY a valid JSON object. No text before or after the JSON.**\n\n"
        "Instructions:\n"
        "- Answer the user's question using ONLY the provided papers.\n"
        "- Your answer should be well-structured and formatted in Markdown:\n"
        "  - Use ## for main headings, ### for subheadings\n"
        "  - Use **bold** for emphasis, *italics* for secondary emphasis\n"
        "  - Use bullet points (- item) or numbered lists (1. item) where appropriate\n"
        "  - Use > for blockquotes if citing key statements\n"
        "  - Use \\n\\n for paragraph breaks\n"
        "- Cite papers by their number in square brackets, e.g., [1], [2].\n"
        "- Prefer citing papers with higher similarity scores.\n"
        "- Do NOT use information from outside the provided papers.\n"
        "- Return a JSON object with exactly two keys:\n"
        "  {\n"
        "    \"answer\": \"<your markdown-formatted answer string>\",\n"
        "    \"citations\": [{\"number\": int, \"title\": str, \"authors\": str, \"year\": int, \"pdf_link\": str}]\n"
        "  }\n\n"
        "Context:\n"
        "You will receive numbered papers with title, authors, year, PDF link, summary, and similarity score (0-100, higher = more relevant)."
    )

    user_prompt = (
        f"User question:\n{user_query}\n\n"
        f"Relevant papers:\n{context}\n\n"
        "Example Output (copy this structure exactly):\n"
        "{\n"
        "  \"answer\": \"## Overview\\n\\nIn-context learning enables language models to **perform new tasks** by conditioning on examples provided in the prompt.\\n\\n### Key Findings\\n\\n- **Generalization**: [1] demonstrates that large models can generalize to unseen tasks with only a few examples\\n- **Mechanisms**: [2] explores the mechanisms behind this ability and highlights the importance of model scale\\n- **Performance**: [3] provides empirical results showing that in-context learning performance improves with more diverse training data\\n\\n> These papers suggest that in-context learning is a *flexible and scalable* approach for adapting language models to a wide range of tasks without retraining.\",\n"
        "  \"citations\": [\n"
        "    {\"number\": 1, \"title\": \"In-Context Learning in Language Models\", \"authors\": \"Jane Doe, John Smith\", \"year\": 2023, \"pdf_link\": \"http://arxiv.org/pdf/1234.5678v1\"},\n"
        "    {\"number\": 2, \"title\": \"Mechanisms of Few-Shot Generalization\", \"authors\": \"Alice Lee, Bob Kim\", \"year\": 2022, \"pdf_link\": \"http://arxiv.org/pdf/2345.6789v1\"},\n"
        "    {\"number\": 3, \"title\": \"Scaling Laws for In-Context Learning\", \"authors\": \"Carlos Ruiz, Priya Patel\", \"year\": 2021, \"pdf_link\": \"http://arxiv.org/pdf/3456.7890v1\"}\n"
        "  ]\n"
        "}"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    answer = call_groq_llm(messages)
    try:
        answer_json = json.loads(answer)
        retrieval["answer_json"] = answer_json
    except Exception as e:
        retrieval["answer_json"] = None
        retrieval["answer_parse_error"] = str(e)
    retrieval["answer"] = answer
    return retrieval

if __name__ == "__main__":
    user_query = input("Enter your research question: ").strip()
    result = rag_answer(user_query, top_k=TOP_K)
    print("\n--- LLM Answer ---\n")
    print(result["answer_json"])

    output_path = os.path.join(DATA_DIR, "last_rag_response.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"\nSaved response to {output_path}")
    
def get_llm_response(payload: dict):
    user_keywords = payload.get("query_keywords", "")
    user_query = ""
    for keyword in user_keywords:
        user_query += keyword + ""
    
    result = rag_answer(user_query, top_k=TOP_K)
    # print("\n--- LLM Answer ---\n")
    # print(result)

    # output_path = os.path.join(DATA_DIR, "last_rag_response.json")
    # with open(output_path, "w", encoding="utf-8") as f:
    #     json.dump(result, f, ensure_ascii=False, indent=2)
    # print(f"\nSaved response to {output_path}")
    return result
    
def get_bot_response(payload: dict):
    user_query = payload.get("user_query", "")
    
    result = rag_answer(user_query, top_k=TOP_K)
    return result
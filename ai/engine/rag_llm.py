from .query_engine import hybrid_search_papers
from ai.utils.llm_client import call_groq_llm
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
        "You are ScholarMind, a retrieval-augmented generation (RAG) research assistant. Your job is to answer research questions using the provided papers as evidence.\n\n"
        "Instructions:\n"
        "- Read the user's question and the list of relevant papers.\n"
        "- Answer the question concisely, using only information from the provided papers.\n"
        "- When you use information from a paper, cite it by its number in square brackets, e.g., [1], [2].\n"
        "- Prefer citing papers with higher similarity scores when possible, as they are more relevant to the user's question.\n"
        "- Do not use information from outside the provided papers.\n"
        "- After your answer, provide a \"citations\" section as a JSON array, listing each cited paper with its number, title, authors, year, and PDF link, in the order they were first cited.\n"
        "- Return your output as a JSON object with two keys: \"answer\" (string) and \"citations\" (array of objects as described).\n\n"
        "Context:\n"
        "You will receive a list of papers, each with a number, title, authors, year, PDF link, summary, and similarity score. The similarity score (out of 100) indicates how relevant the paper is to the user's question (higher is more relevant). Use only these for your answer."
    )

    user_prompt = (
        f"User question:\n{user_query}\n\n"
        f"Relevant papers:\n{context}\n"
        "Example Output:\n"
        "{\n"
        "  \"answer\": \"In-context learning enables language models to perform new tasks by conditioning on examples provided in the prompt. For instance, [1] demonstrates that large models can generalize to unseen tasks with only a few examples, while [2] explores the mechanisms behind this ability and highlights the importance of model scale. Additionally, [3] provides empirical results showing that in-context learning performance improves with more diverse training data. Together, these papers suggest that in-context learning is a flexible and scalable approach for adapting language models to a wide range of tasks without retraining.\",\n"
        "  \"citations\": [\n"
        "    {\n"
        "      \"number\": 1,\n"
        "      \"title\": \"In-Context Learning in Language Models\",\n"
        "      \"authors\": \"Jane Doe, John Smith\",\n"
        "      \"year\": 2023,\n"
        "      \"pdf_link\": \"http://arxiv.org/pdf/1234.5678v1\"\n"
        "    },\n"
        "    {\n"
        "      \"number\": 2,\n"
        "      \"title\": \"Mechanisms of Few-Shot Generalization\",\n"
        "      \"authors\": \"Alice Lee, Bob Kim\",\n"
        "      \"year\": 2022,\n"
        "      \"pdf_link\": \"http://arxiv.org/pdf/2345.6789v1\"\n"
        "    },\n"
        "    {\n"
        "      \"number\": 3,\n"
        "      \"title\": \"Scaling Laws for In-Context Learning\",\n"
        "      \"authors\": \"Carlos Ruiz, Priya Patel\",\n"
        "      \"year\": 2021,\n"
        "      \"pdf_link\": \"http://arxiv.org/pdf/3456.7890v1\"\n"
        "    }\n"
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
    print(result["answer"])

    output_path = os.path.join(DATA_DIR, "last_rag_response.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"\nSaved response to {output_path}")
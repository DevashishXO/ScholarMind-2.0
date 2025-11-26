# ScholarMind Backend Integration Guide

## 🎯 Overview
This backend provides AI-powered research paper analysis with citation-aware chat.

## 📦 Available API Functions

### 1. Process Paper
```python
from engine.chat_pdf_handler import process_paper_api

result = process_paper_api(pdf_url="https://arxiv.org/pdf/1706.03762.pdf")
```

**Input:**
- `pdf_url` (string): Full arXiv PDF URL

**Output:**
```json
{
  "status": "success",
  "arxiv_id": "arxiv:1706.03762",
  "chunks_processed": 66,
  "summary_preview": "First 500 chars...",
  "timestamp": "2025-11-27T00:24:41"
}
```

**Status Values:**
- `"success"`: Paper processed successfully
- `"already_processed"`: Paper exists in database (skip to chat)
- `"error"`: Invalid URL or processing failed

---

### 2. Chat with Paper
```python
from engine.chat_pdf_handler import chat_api

result = chat_api(
    arxiv_id="arxiv:1706.03762",
    user_question="What are the key findings?"
)
```

**Input:**
- `arxiv_id` (string): arXiv ID (with or without "arxiv:" prefix)
- `user_question` (string): User's natural language question

**Output:**
```json
{
  "status": "success",
  "answer": "### Key Findings\n\nThe paper...[3][7]...",
  "citations": [
    {
      "citation_number": 3,
      "page": 13,
      "similarity": 61,
      "text_preview": "300 char preview...",
      "full_text": "Complete chunk..."
    }
  ],
  "metadata": {
    "chunks_retrieved": 12,
    "chunks_cited": 3,
    "avg_similarity": 60.0
  }
}
```

**Status Values:**
- `"success"`: Answer generated successfully
- `"error"`: Paper not processed or query failed

---

### 3. Get Full Summary (Optional)
```python
from engine.chat_pdf_handler import get_paper_summary_api

result = get_paper_summary_api(arxiv_id="arxiv:1706.03762")
```

**Output:**
```json
{
  "status": "success",
  "summary": "Full markdown summary (3000-5000 chars)..."
}
```

---

## 🔧 Frontend Integration Examples

### React/Next.js Example
```typescript
// Process paper
async function processPaper(pdfUrl: string) {
  const response = await fetch('/api/process', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({pdf_url: pdfUrl})
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    return data.arxiv_id;
  } else if (data.status === 'already_processed') {
    return data.arxiv_id; // Can proceed to chat
  } else {
    throw new Error(data.message);
  }
}

// Chat
async function chatWithPaper(arxivId: string, question: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({arxiv_id: arxivId, user_question: question})
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    return data;
  } else {
    throw new Error(data.message);
  }
}

// Render answer with clickable citations
function renderAnswer(answerMarkdown: string, citations: Citation[]) {
  let html = markdownToHtml(answerMarkdown);
  
  citations.forEach(cite => {
    html = html.replace(
      `[${cite.citation_number}]`,
      `<a href="#cite-${cite.citation_number}" 
          title="Page ${cite.page}: ${cite.text_preview}"
          class="citation-link">
        [${cite.citation_number}]
      </a>`
    );
  });
  
  return html;
}
```

---

## 📊 Response Files for Testing

All API responses are logged to `data/api_responses/`:
- `last_process_response.json`: Latest processing result
- `last_chat_response.json`: Latest chat result
- Timestamped archives for debugging

**Use these to preview the exact JSON structure your frontend will receive.**

---

## 🚨 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `"Invalid URL: URL must be from arxiv.org"` | Non-arXiv URL | Validate URL on frontend |
| `"Paper not processed yet"` | Trying to chat before processing | Call `process_paper_api()` first |
| `"Invalid arXiv ID format"` | Malformed URL | Check URL format |

### Example Error Response
```json
{
  "status": "error",
  "message": "Invalid URL: URL must be from arxiv.org",
  "timestamp": "2025-11-27T00:30:00"
}
```

---

## 🎨 UI Recommendations

1. **Processing Page**: Show progress spinner while `process_paper_api()` runs
2. **Chat Interface**: Render `answer` as Markdown with syntax highlighting
3. **Citations Panel**: Show `citations` array in sidebar
   - Use `text_preview` for hover tooltips
   - Use `full_text` for detailed modal view
4. **Confidence Indicator**: Display `metadata.avg_similarity` as confidence bar

---

## 🧪 Testing

Run manual test:
```bash
python -m engine.chat_pdf_handler
```

Check response files:
```bash
cat data/api_responses/last_chat_response.json
```

---

## 📋 API Function Signatures

### process_paper_api
```python
def process_paper_api(pdf_url: str) -> dict:
    """
    Process a research paper from arXiv URL.
    
    Args:
        pdf_url: Full arXiv PDF URL (e.g., "https://arxiv.org/pdf/1706.03762.pdf")
    
    Returns:
        dict with keys: status, message, arxiv_id, chunks_processed, summary_preview, timestamp
    """
```

### chat_api
```python
def chat_api(arxiv_id: str, user_question: str) -> dict:
    """
    Chat with a processed research paper.
    
    Args:
        arxiv_id: arXiv ID (e.g., "arxiv:1706.03762" or "1706.03762")
        user_question: User's natural language question
    
    Returns:
        dict with keys: status, arxiv_id, question, answer, citations, metadata, timestamp
    """
```

### get_paper_summary_api (Optional)
```python
def get_paper_summary_api(arxiv_id: str) -> dict:
    """
    Retrieve full summary of a processed paper.
    
    Args:
        arxiv_id: arXiv ID
    
    Returns:
        dict with keys: status, arxiv_id, summary, timestamp
    """
```

---

## 🔗 Citation Structure

Each citation in the `citations` array has:

```typescript
interface Citation {
  citation_number: number;    // Matches [N] in answer text
  page: number;               // Page number in original PDF
  chunk_index: number;        // Internal chunk ID
  similarity: number;         // Relevance score (0-100)
  text_preview: string;       // First 300 characters
  full_text: string;          // Complete chunk text
}
```

---

## 💡 Tips for Integration

1. **URL Validation**: Validate arXiv URLs on frontend before sending to backend
2. **Loading States**: Processing can take 30-60 seconds for large papers
3. **Error Messages**: Display backend error messages directly to users
4. **Citation Linking**: Make `[N]` clickable and scroll to citation details
5. **Markdown Rendering**: Use a library like `react-markdown` or `marked.js`
6. **Confidence Display**: Show `avg_similarity` as a percentage or progress bar

---

## 🐛 Debugging

If you encounter issues:

1. Check `data/api_responses/last_*.json` for the exact backend response
2. Verify the arXiv URL format is correct
3. Ensure the paper was processed before attempting chat
4. Check backend logs for detailed error messages

---

## 📞 Support

For issues or questions, contact the backend team with:
- The arXiv URL or ID
- The exact error message from the response
- Contents of `last_process_response.json` or `last_chat_response.json`

# Smart Search Guide

## Overview

This guide covers the **Smart Search** feature for ScholarlyHub. Smart Search combines **keyword matching** with **semantic search** to find research papers based on multiple criteria (title, authors, year, keywords, arXiv ID).

---

## UI Changes

Add a **Smart Search** section/panel in the UI with the following input fields:

1. **Keywords** (multi-value input)

   - Allow users to enter multiple keywords
   - Examples: "transformer", "attention mechanism", "neural networks"
2. **Title** (text input)

   - Partial match supported
   - Example: "Attention Is All You Need"
3. **Authors** (multi-value input)

   - Allow multiple author names
   - Example: "Vaswani", "Shazeer"
4. **Year** (number input)

   - Single year value
   - Example: 2017
5. **arXiv ID** (text input)

   - Direct lookup by arXiv ID
   - Example: "1706.03762"
6. **Results per Page** (optional, default: 20)

---

## API Endpoint

**Endpoint:** `/smart-search` (POST)

### Request Payload Structure

```json
{
  "keywords": ["transformer", "attention"],
  "title": "Attention Is All You Need",
  "authors": ["Vaswani", "Shazeer"],
  "year": 2017,
  "arxiv_id": "1706.03762",
  "page": 1,
  "results_per_page": 20
}
```

**All fields are optional** – users can mix and match any combination.

### Response Structure

```json
{
  "status": "success",
  "total_results": 42,
  "page": 1,
  "results_per_page": 20,
  "results": [
    {
      "arxiv_id": "1706.03762",
      "title": "Attention Is All You Need",
      "authors": "Ashish Vaswani, Noam Shazeer, Niki Parmar, ...",
      "year": 2017,
      "abstract": "The dominant sequence transduction models...",
      "pdf_link": "https://arxiv.org/pdf/1706.03762",
      "link": "https://arxiv.org/abs/1706.03762",
      "similarity": 95,
      "match_type": "exact"
    },
    ...
  ],
  "timestamp": "2025-01-27T12:34:56.789Z"
}
```

## Match Type Explanation

The `match_type` field indicates why a paper appeared in results:

| Match Type | Meaning | Example |
|------------|---------|---------|
| `"exact"` | All provided metadata filters matched | User searched "Stochastic Chameleons" + "Ziling Cheng" → Found exact paper |
| `"partial"` | Some metadata filters matched | User searched "language model" + year:2025 → Found papers from 2025 |
| `"semantic"` | Only keyword similarity (no metadata match) | User searched "transformer" → Found papers with similar abstracts |
| `"fallback"` | No matches found, showing recent papers | User searched obscure terms → System shows latest papers |

### Frontend Display Recommendations

**Color-coded badges:**
- 🟢 **Exact Match** (`exact`)
- 🟡 **Good Match** (`partial`)
- 🔵 **Related** (`semantic`)
- ⚪ **Suggested** (`fallback`)

**When `used_fallback: true`:**
Display warning message:
```
⚠️ No exact matches found. Showing recent papers.
```

---

## Field Behavior

| Field                | Type             | Behavior                                              |
| -------------------- | ---------------- | ----------------------------------------------------- |
| `keywords`         | Array of strings | Semantic search against abstract embeddings           |
| `title`            | String           | Partial/fuzzy match (case-insensitive)                |
| `authors`          | Array of strings | Match if any author name appears in the authors field |
| `year`             | Integer          | Exact match only                                      |
| `arxiv_id`         | String           | Exact match (direct lookup)                           |
| `page`             | Integer          | Pagination offset (1-indexed)                         |
| `results_per_page` | Integer          | How many results to return per page (default: 20)     |

---

## Expected Backend Response

### Success Response (with results)

```json
{
  "status": "success",
  "results": [...],
  "pagination": {...},
  "metadata": {
    "filters_applied": {...},
    "used_fallback": false,
    "fallback_message": null
  }
}
```

### Success Response (fallback mode)

When no exact matches are found, the backend returns recent papers with a fallback flag:

```json
{
  "status": "success",
  "results": [...],  // Recent papers
  "pagination": {...},
  "metadata": {
    "filters_applied": {...},
    "used_fallback": true,
    "fallback_message": "No exact matches found. Showing recent papers."
  }
}
```

**Frontend Action:** Display the fallback message above results:
```
⚠️ No exact matches found. Showing recent papers instead.
```

---

## Validation Rules

1. **At least one filter must be provided** (cannot send empty request)
2. **Year must be valid** (4-digit number, e.g., 2017)
3. **Page must be >= 1**
4. **Results per page** must be between 1 and 100

### Example Validation Errors

```json
{
  "status": "error",
  "error": "At least one search parameter is required",
  "timestamp": "2025-01-27T12:34:56.789Z"
}
```

```json
{
  "status": "error",
  "error": "Invalid year: must be a 4-digit number",
  "timestamp": "2025-01-27T12:34:56.789Z"
}
```


---

## Example Use Cases

### Use Case 1: Keyword Search

**User Input:**

```
Keywords: ["transformer", "attention mechanism"]
```

**Expected Behavior:**

- Semantic search against abstracts
- Return papers most similar to "transformer attention mechanism"
- Match type: `"semantic"`

---

### Use Case 2: Author + Year Filter

**User Input:**

```
Authors: ["Vaswani"]
Year: 2017
```

**Expected Behavior:**

- Filter papers where `authors` contains "Vaswani" AND `year == 2017`
- Match type: `"partial"` or `"exact"` if both filters matched

---

### Use Case 3: arXiv ID Direct Lookup

**User Input:**

```
arXiv ID: "1706.03762"
```

**Expected Behavior:**

- Direct lookup by `arxiv_id`
- Should return exactly 1 result (if exists)
- Match type: `"exact"`

---

### Use Case 4: Hybrid Search (Keywords + Filters)

**User Input:**

```
Keywords: ["deep learning", "neural networks"]
Year: 2020
Authors: ["LeCun"]
```

**Expected Behavior:**

- Semantic search for keywords
- Filter results by year == 2020 AND authors contains "LeCun"
- Match type: `"partial"` (semantic + metadata)

---


**Response:**

```json
{
  "status": "success",
  "total_results": 150,
  "page": 2,
  "results_per_page": 20,
  "results": [ /* next 20 results */ ]
}
```

---

## Notes for Frontend Developer (M)

1. **Multi-value inputs:**

   - Use tag/chip input components for `keywords` and `authors`
   - Send arrays: `["keyword1", "keyword2"]`
2. **Optional fields:**

   - All fields are optional – users can leave them blank
   - Send only populated fields in the request
3. **Pagination:**

   - Show "Next/Previous" buttons
   - Display "Showing X-Y of Z results"
4. **Match type indicator:**

   - Show badge/label for `match_type` (exact, partial, semantic)
   - Color code: exact (green), partial (blue), semantic (purple)
5. **Similarity score:**

   - Display `similarity` percentage (0-100%)
   - Can be used for result relevance indicator
6. **Error handling:**

   - Display validation errors inline (e.g., "Year must be a 4-digit number")
   - Show user-friendly message for internal errors

---


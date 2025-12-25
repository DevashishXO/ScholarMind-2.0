# **ScholarMind**

> **AI-Powered Research Assistance Platform**

An intelligent research assistance platform that helps academics discover, analyze, and understand research papers through advanced semantic search, AI-powered chat, and comprehensive report generation, currently operating with **ZERO INFRASTRUCTURAL COST.**

---

## Authors

| **Archita Bhargava**                                                                                    | **Devashish Nagpal**                                                                     | **Miheer Gautam**                                                                      |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| AI Pipeline                                                                                                   | AI Pipeline Lead & Research                                                                    | Full-Stack Lead & UI/UX Design                                                               |
| [LinkedIn](https://www.linkedin.com/in/archita-bhargava-7966bb248/) • [GitHub](https://github.com/Architabhargava) | [LinkedIn](https://www.linkedin.com/in/devashishnagpal/) • [GitHub](https://github.com/DevashishXO) | [LinkedIn](https://www.linkedin.com/in/miheer-gautam) • [GitHub](https://github.com/Miheergautam) |

**Made with ❤️ in Jaipur**

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#-key-features)
- [Why ScholarMind](#-why-scholarmind)
- [Architecture](#%EF%B8%8F-architecture)
- [Installation](#-installation)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Contributing	](#-contributing)
- [License](#-license)
- [Roadmap](#%EF%B8%8F-roadmap)

---

## Overview

**ScholarMind** is a comprehensive research platform powered by advanced AI and machine learning. It revolutionizes how researchers discover and interact with academic papers by combining:

- **Hybrid Search Engine**: Semantic + keyword-based paper discovery
- **Interactive Chat**: Ask questions directly about paper content
- **Smart Reports**: AI-generated comprehensive paper summaries
- **Research Bot**: Conversational AI for research assistance
- **Scholar Profiles**: Integration with Google Scholar for researcher insights
- **Smart Collections**: Organize and manage research papers efficiently

Whether you're a student, professor, or research scientist, ScholarMind accelerates your research workflow by making papers more discoverable and understandable.

---

## Key Features

### 🔍 **Smart Search**

- Hybrid search combining semantic and keyword-based retrieval
- Filter by keywords, authors, year, title, and arXiv ID
- Real-time relevance scoring and match type indicators
- Pagination support for large result sets

### 💬 **Chat with Papers**

- Ask natural language questions about research papers
- Dedicated chatbot for every research paper
- Citation-aware responses with source references
- Context-aware answers with similarity scoring
- Support for PDF processing and indexing

### 📊 **Smart Reports**

- One-click comprehensive paper analysis
- 7-section structured reports:
  - Why This Paper Matters
  - Prerequisites
  - Methodology
  - Key Results
  - Practical Applications
  - Limitations
  - Future Work
- Automatic reading time estimation
- Citation extraction and tracking

### 🤖 **Research Bot**

- Conversational AI for general research questions
- Multi-turn dialogue support
- RAG-based answers with source citations
- Integration with indexed paper database

### 👤 **Scholar Profiles**

- Google Scholar integration (based on the user's consent)
- Automatic publication fetching
- Citation metrics and h-index tracking
- Co-author network visualization
- Research interest tagging

### 📚 **Collections Management**

- Organize papers into custom collections
- Categorize and tag papers
- Save highlights and notes
- Share collections with collaborators

---

## Why ScholarMind?

| Feature                        | ScholarMind                     | Traditional Methods    |
| ------------------------------ | ------------------------------- | ---------------------- |
| **Paper Understanding**  | AI-powered chat & summaries     | Manual reading         |
| **Search Quality**       | Semantic + keyword hybrid       | Keyword only           |
| **Time to Insights**     | Minutes with smart reports      | Hours of reading       |
| **Citation Tracking**    | Automatic with context          | Manual tracking        |
| **Multi-Paper Analysis** | Research Bot across database    | Single paper at a time |
| **Scholar Profiles**     | Auto-synced from Google Scholar | Manual data entry      |

### Key Advantages

✅ **Faster Research**: Find relevant papers and understand them in minutes, not hours

✅ **Better Discovery**: Semantic search finds related papers keyword systems miss

✅ **Academic Integrity**: All answers are citation-backed with source tracking

✅ **Personalized Experience**: Profile-based recommendations and interest tracking

✅ **Open & Transparent**: Built on open-source models and frameworks

✅ **Privacy First**: Your research activity stays private by default

---

## Architecture

ScholarMind uses a modern three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│           Frontend (React/TypeScript)          	  │
│         User Interface & Application Logic              │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┴────────────┬──────────────────┐
    │                         │                  │
┌───▼──────────────┐  ┌──────▼──────────┐  ┌───▼─────────┐
│  Backend Gateway │  │   AI Engine     │  │  Services   │
│  (FastAPI)       │  │   (FastAPI)     │  │  (External) │
│                  │  │                 │  │             │
│ • Auth           │  │ • Search        │  │ • arXiv     │
│ • Profile Mgmt   │  │ • Chat          │  │ • Scholar   │
│ • Collections    │  │ • Reports       │  │ • Crossref  │
│ • Routing        │  │ • Embeddings    │  │ • Unpaywall │
└────────┬─────────┘  └────────┬────────┘  └─────────────┘
         │                     │
    ┌────▼─────────────────────▼──────┐
    │        Data Layer                │
    │  ┌──────────────────────────┐   │
    │  │   MongoDB (Profiles)     │   │
    │  │   ChromaDB (Embeddings)  │   │
    │  │   Vector Indexes         │   │
    │  └──────────────────────────┘   │
    └───────────────────────────────────┘
```

### Technology Stack

**Frontend**

- React 18+ with TypeScript
- Tailwind CSS for styling
- React Query for state management
- React Router for navigation
- Lucide Icons & Markdown rendering

**Backend (Gateway)**

- FastAPI (async Python)
- Motor for async MongoDB
- OAuth 2.0 authentication
- CORS & security middleware

**AI Engine**

- FastAPI with async support
- ChromaDB for vector embeddings
- Sentence Transformers for embeddings
- Groq LLM for text generation
- PyPDF for document processing

**Infrastructure**

- MongoDB (document store)
- ChromaDB (vector database)
- arXiv API (paper indexing)
- Google Scholar (profile scraping)

---

## Installation

### Prerequisites

- **Node.js** 18+ (Frontend)
- **Python** 3.10+ (Backend & AI)
- **MongoDB** 5.0+ (Database)
- **Git** for version control

### Quick Start

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/Miheergautam/ScholarMind-2.0.git
cd ScholarMind-2.0
```

#### 2️⃣ Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your configuration
VITE_API_URL=http://localhost:8000
VITE_AI_API_URL=http://localhost:8001

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

#### 3️⃣ Setup Backend (Gateway)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Update .env with your settings
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=scholarmind
CORS_ORIGINS=http://localhost:5173

# Run migrations (if any)
python -m alembic upgrade head

# Start backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at `http://localhost:8000`

#### 4️⃣ Setup AI Engine

```bash
cd ai

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Update .env with your settings
GROQ_API_KEY=your_groq_api_key
MONGO_URI=mongodb://localhost:27017
CHROMA_DB_PATH=./data/chroma_db

# Start AI engine
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

AI Engine will be available at `http://localhost:8001`

#### 5️⃣ Database Setup

```bash
# MongoDB connection
# Start MongoDB (local or cloud)
mongod  # Local MongoDB

# Initialize collections (optional automation scripts in backend)
python backend/scripts/init_db.py
```

### Environment Variables

#### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:8000
VITE_AI_API_URL=http://localhost:8001
```

#### Backend (`.env`)

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=scholarmind
SESSION_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:5173
GROQ_API_KEY=your_groq_api_key
```

#### AI Engine (`.env`)

```env
GROQ_API_KEY=your_groq_api_key
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=scholarmind
CHROMA_DB_PATH=./data/chroma_db
CORS_ORIGINS=http://localhost:5173,http://localhost:8000
```

---

## Getting Started

### 1. First Time Setup

1. **Create an Account**

   - Visit `http://localhost:5173`
   - Sign up with email or Google OAuth
   - Verify OTP sent to your email
2. **Complete Onboarding**

   - Step 1: Select your role (Student/Professor/Researcher)
   - Step 2: Academic background
   - Step 3: Link Google Scholar profile
   - Step 4: Select research topics
   - Step 5: Define your goals
3. **Explore Dashboard**

   - View personalized stats
   - See recent activity
   - Access quick actions

### 2. Using Smart Search

```typescript
// Example: Search for papers on transformers
{
  keywords: ["transformer", "attention mechanism"],
  authors: ["Vaswani"],
  year: 2017,
  results_per_page: 20
}
```

Results include:

- Paper title, authors, abstract
- Citation count and year
- Relevance score (0-100%)
- Match type (exact/partial/semantic)
- Direct PDF link

### 3. Chat with Papers

1. **Find a Paper** via Smart Search
2. **Open Paper View**
3. **Start Chatting** with the Research Assistant
4. **Ask Questions**:
   - "What are the key findings?"
   - "Explain the methodology"
   - "What datasets were used?"
5. **Citations** are auto-linked to source excerpts

### 4. Generate Smart Reports

```typescript
// One-click comprehensive analysis
POST /api/v1/chat-with-paper/generate-report
{
  pdf_url: "https://arxiv.org/pdf/1706.03762.pdf"
}
```

Report includes 7 sections with automatic citations.

### 5. Use Research Bot

- Ask cross-paper research questions
- Get answers backed by multiple sources
- Cite relevant papers automatically
- Multi-turn conversation support

---

## Project Structure

```
ScholarMind-2.0/
├── frontend/                  # React TypeScript application
│   ├── src/
│   │   ├── api/              # API client services
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # Global state management
│   │   └── services/         # Business logic
│   ├── components/           # React components
│   │   ├── Home/            # Dashboard & search UI
│   │   ├── PaperChat/       # Chat interface
│   │   ├── PaperView/       # Paper details view
│   │   ├── Onboarding/      # Setup flow
│   │   └── Landing/         # Marketing pages
│   ├── pages/               # Page components
│   ├── lib/                 # Utilities & types
│   └── routes/              # Route definitions
│
├── backend/                  # Gateway & user management
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── core/            # Config & security
│   │   ├── routes/          # API endpoints
│   │   │   ├── v1/
│   │   │   │   ├── auth_routes.py
│   │   │   │   ├── profile_routes.py
│   │   │   │   ├── my_collection.py
│   │   │   │   └── AI/      # AI service routing
│   │   ├── schema/          # Pydantic models
│   │   ├── services/        # Business logic
│   │   │   ├── google_oauth.py
│   │   │   ├── google_scholarly.py
│   │   │   └── email_service.py
│   │   ├── utils/           # Helpers
│   │   └── middlewares/     # Custom middleware
│   └── requirements.txt
│
├── ai/                       # AI Engine
│   ├── main.py              # FastAPI app
│   ├── routes/              # API endpoints
│   │   ├── search_query.py  # Smart search
│   │   ├── chat_with_paper.py
│   │   └── research_bot.py
│   ├── engine/              # Core AI logic
│   │   ├── smart_search.py  # Hybrid search
│   │   ├── chat_engine.py   # Chat logic
│   │   ├── smart_report.py  # Report generation
│   │   ├── pdf_processor.py # Document processing
│   │   ├── indexing.py      # Vector indexing
│   │   ├── query_engine.py  # Query processing
│   │   └── db_client.py     # Database client
│   ├── models/              # ML models
│   │   └── embedder.py      # Embedding model
│   ├── utils/               # Utilities
│   │   ├── llm_client.py    # LLM integration
│   │   └── logger.py
│   ├── data/                # Data storage
│   │   ├── api_responses/   # API response logs
│   │   └── chroma_db/       # Vector database
│   ├── Integration_Guide.md
│   ├── Smart_Search_Guide.md
│   └── requirements.txt
│
└── README.md               # This file
```

---

## Configuration

### Database Connection

**MongoDB Atlas (Cloud)**

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/scholarmind?retryWrites=true&w=majority
```

**Local MongoDB**

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=scholarmind
```

### LLM Configuration

**Using Groq**

```env
GROQ_API_KEY=your_api_key_here
LLM_MODEL=mixtral-8x7b-32768
```

### API Keys

Required API keys:

- **Groq API**: For LLM text generation
- **Google OAuth**: For authentication
- **Optional**: SerpAPI (for enhanced Scholar scraping)

### Vector Database

ChromaDB automatically initializes at `./data/chroma_db`. For production:

- Use persistent storage with backups
- Consider managed ChromaDB Cloud
- Monitor embedding quality

---

## API Documentation

### Smart Search API

**Endpoint**: `POST /api/smart-search`

```python
# Request
{
  "keywords": ["transformer", "attention"],
  "authors": ["Vaswani"],
  "title": "Attention Is All You Need",
  "year": 2017,
  "arxiv_id": "1706.03762",
  "page": 1,
  "results_per_page": 20
}

# Response
{
  "status": "success",
  "total_results": 42,
  "results": [
    {
      "arxiv_id": "1706.03762",
      "title": "Attention Is All You Need",
      "authors": "Ashish Vaswani, Noam Shazeer, ...",
      "abstract": "The dominant sequence transduction models...",
      "year": 2017,
      "similarity": 95,
      "match_type": "exact"
    }
  ]
}
```

See `ai/Smart_Search_Guide.md` for complete details.

### Chat API

**Endpoint**: `POST /api/chat-with-paper`

```python
# Request
{
  "arxiv_id": "arxiv:1706.03762",
  "user_question": "What are the key findings?"
}

# Response
{
  "status": "success",
  "answer": "### Key Findings\n\nThe paper...[3][7]...",
  "citations": [
    {
      "citation_number": 3,
      "page": 13,
      "similarity": 61,
      "text_preview": "..."
    }
  ]
}
```

See `ai/Integration_Guide.md` for complete API reference.

### Smart Report API

**Endpoint**: `POST /api/chat-with-paper/generate-report`

```python
# Request
{
  "pdf_url": "https://arxiv.org/pdf/1706.03762.pdf"
}

# Response
{
  "status": "success",
  "report": "# 🔬 Research Assistant Report\n\n...",
  "citations": [
    {
      "number": 1,
      "page": 3,
      "preview": "..."
    }
  ],
  "metadata": {
    "reading_time_minutes": 45,
    "page_count": 9,
    "sections_generated": 7
  }
}
```

---

## License

This project is licensed under the **MIT License.**

```
MIT License

Copyright (c) 2025 ScholarMind Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## Acknowledgments

- [Groq](https://groq.com) for LLM APIs
- [ChromaDB](https://www.trychroma.com/) for vector database
- [MongoDB](https://www.mongodb.com/) for data storage
- [arXiv.org](https://arxiv.org/) for paper metadata
- [Google Scholar](https://scholar.google.com/) for researcher profiles
- Open-source community for amazing tools and libraries

---

⭐ If you find ScholarMind helpful, please star this repository!

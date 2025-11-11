#!/usr/bin/env python3
"""
ScholarMind Async Scraper – Optimized for Speed
-----------------------------------------------
✅ Async HTTP requests with httpx (5–10× faster)
✅ Concurrent enrichment for each publication
✅ No MongoDB dependency
✅ Returns clean structured data ready for JSON response
"""

import asyncio
import httpx
import urllib.parse
import difflib
from datetime import datetime, timezone
from typing import Dict, Optional, List
from app.core.config import settings

# --------------------- Config ---------------------
SERPAPI_KEY = settings.SERPAPI_KEY
SEMANTIC_SCHOLAR_BASE = settings.SEMANTIC_SCHOLAR_BASE
CROSSREF_BASE = settings.CROSSREF_BASE
UNPAYWALL_BASE = settings.UNPAYWALL_BASE
UNPAYWALL_EMAIL = settings.UNPAYWALL_EMAIL

HEADERS = {"User-Agent": "ScholarMind/2.0 (https://scholarmind.ai)"}


# --------------------- Async HTTP Utility ---------------------
async def async_get(client: httpx.AsyncClient, url: str, params=None, retries=2, timeout=15):
    for attempt in range(retries):
        try:
            resp = await client.get(url, params=params, headers=HEADERS, timeout=timeout)
            if resp.status_code == 200:
                return resp
        except Exception:
            await asyncio.sleep(0.5 * (attempt + 1))
    return None


# --------------------- Async API Queries ---------------------
async def query_crossref(client, title: str) -> Optional[Dict]:
    if not title:
        return None
    params = {"query.title": title, "rows": 3}
    r = await async_get(client, CROSSREF_BASE, params=params)
    if not r:
        return None
    try:
        data = r.json().get("message", {}).get("items", [])
        if not data:
            return None
        target = title.lower()
        best = max(
            data,
            key=lambda i: difflib.SequenceMatcher(None, target, " ".join(i.get("title", [])).lower()).ratio(),
        )
        return best
    except Exception:
        return None


async def query_semantic(client, title: str) -> Optional[Dict]:
    if not title:
        return None
    params = {
        "query": title,
        "limit": 1,
        "fields": "title,year,authors,abstract,topics,citationCount,influentialCitationCount",
    }
    r = await async_get(client, SEMANTIC_SCHOLAR_BASE, params=params)
    if not r:
        return None
    try:
        data = r.json().get("data", [])
        return data[0] if data else None
    except Exception:
        return None


async def query_unpaywall(client, doi: str) -> Optional[Dict]:
    if not doi:
        return None
    url = f"{UNPAYWALL_BASE}{urllib.parse.quote(doi)}?email={UNPAYWALL_EMAIL}"
    r = await async_get(client, url)
    if not r:
        return None
    try:
        data = r.json()
        if data.get("is_oa"):
            pdf = data.get("best_oa_location", {}).get("url_for_pdf")
            return {"is_open_access": True, "oa_pdf_url": pdf}
        return {"is_open_access": False}
    except Exception:
        return None


# --------------------- SerpApi Client ---------------------
async def fetch_serpapi_profile(scholar_id: str) -> Dict:
    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google_scholar_author",
        "author_id": scholar_id,
        "api_key": SERPAPI_KEY,
        "hl": "en",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=30)
        return resp.json()


# --------------------- Scraper Logic ---------------------
class ScholarMindScraper:
    def __init__(self):
        pass

    def extract_scholar_id(self, url: str) -> str:
        if "user=" not in url:
            raise ValueError("Invalid Google Scholar URL")
        return url.split("user=")[1].split("&")[0]

    def normalize_metrics(self, cited_by: Dict) -> Dict:
        table = cited_by.get("table", [])
        def safe(i, k, s, d=0):
            try:
                return table[i][k][s]
            except Exception:
                return d
        return {
            "citations": {"all": safe(0, "citations", "all"), "since_2019": safe(0, "citations", "since_2019")},
            "h_index": {"all": safe(1, "h_index", "all"), "since_2019": safe(1, "h_index", "since_2019")},
            "i10_index": {"all": safe(2, "i10_index", "all"), "since_2019": safe(2, "i10_index", "since_2019")},
        }

    def normalize_citation_graph(self, cited_by: Dict):
        graph = cited_by.get("graph", [])
        return [{"year": g.get("year"), "citations": g.get("citations")} for g in graph]

    async def enrich_publication(self, client, art: dict) -> dict:
        title = art.get("title")
        if not title:
            return {}
        enriched = {
            "title": title,
            "year": art.get("year"),
            "venue": art.get("publication"),
            "citation_count": (art.get("cited_by") or {}).get("value", 0),
        }

        # Run API calls concurrently
        crossref, sem = await asyncio.gather(
            query_crossref(client, title),
            query_semantic(client, title),
        )

        if crossref:
            doi = crossref.get("DOI")
            enriched.update({
                "doi": doi,
                "publisher": crossref.get("publisher"),
                "abstract": crossref.get("abstract"),
                "pages": crossref.get("page"),
            })
            # Fetch BibTeX & OA concurrently
            bibtex_task = client.get(
                f"https://api.crossref.org/works/{urllib.parse.quote(doi)}/transform/application/x-bibtex"
            ) if doi else None
            oa_task = query_unpaywall(client, doi) if doi else None
            if bibtex_task and oa_task:
                bibtex, oa = await asyncio.gather(bibtex_task, oa_task)
                enriched["bibtex"] = bibtex.text if bibtex.status_code == 200 else None
                if oa:
                    enriched.update(oa)

        if sem:
            enriched["semantic_topics"] = [t.get("topic") for t in sem.get("topics", [])]
            enriched["citation_count"] = sem.get("citationCount", enriched["citation_count"])
            if not enriched.get("abstract") and sem.get("abstract"):
                enriched["abstract"] = sem["abstract"]

        enriched["details_fetched"] = True
        return enriched

    async def onboard(self, scholar_url: str) -> Dict:
        scholar_id = self.extract_scholar_id(scholar_url)
        serp_data = await fetch_serpapi_profile(scholar_id)
        author = serp_data.get("author", {})
        cited_by = author.get("cited_by", {}) or {}

        async with httpx.AsyncClient(timeout=30) as client:
            publications = serp_data.get("articles", [])
            enriched_tasks = [self.enrich_publication(client, art) for art in publications]
            enriched_pubs = await asyncio.gather(*enriched_tasks)

        return {
            "scholar_id": scholar_id,
            "name": author.get("name"),
            "affiliation": author.get("affiliations"),
            "email": author.get("email"),
            "profile_picture": author.get("thumbnail"),
            "interests": author.get("interests", []),
            "metrics": self.normalize_metrics(cited_by),
            "citation_graph": self.normalize_citation_graph(cited_by),
            "co_authors": author.get("co_authors", []),
            "publications": [p for p in enriched_pubs if p],
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }


# --------------------- Public Entry ---------------------
async def fetchScholarlyProfile(scholar_url: str) -> Dict:
    scraper = ScholarMindScraper()
    return await scraper.onboard(scholar_url)

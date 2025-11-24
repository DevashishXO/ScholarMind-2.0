#!/usr/bin/env python3
"""
ScholarMind Scraper v2.0 - Complete Profile & Publications
-----------------------------------------------------------
SerpAPI for profile info (name, affiliation, metrics, citation graph, co-authors)
Full pagination to get ALL publications (100 per page max)
Detailed article info via view_citation (abstract, authors, description)
Enrichment via Crossref & Semantic Scholar (DOI, BibTeX, open access)
Async + concurrent processing for speed
"""

import asyncio
import httpx
import urllib.parse
import difflib
import re
from datetime import datetime, timezone
from typing import Dict, Optional, List, Any
from dataclasses import dataclass
from app.core.config import settings

# --------------------- Config ---------------------
SERPAPI_KEY = settings.SERPAPI_KEY
SERPAPI_BASE = "https://serpapi.com/search.json"
SEMANTIC_SCHOLAR_BASE = settings.SEMANTIC_SCHOLAR_BASE
CROSSREF_BASE = settings.CROSSREF_BASE
UNPAYWALL_BASE = settings.UNPAYWALL_BASE
UNPAYWALL_EMAIL = settings.UNPAYWALL_EMAIL

HEADERS = {"User-Agent": "ScholarMind/2.0 (https://scholarmind.ai)"}
PAGE_SIZE = 100  # Max allowed by SerpAPI
CONCURRENT_LIMIT = 5  # Concurrent detail/enrichment requests


@dataclass
class ScraperConfig:
    max_publications: int = 0  # 0 = all
    fetch_article_details: bool = True  # Use view_citation for full details
    enrich_with_crossref: bool = True
    enrich_with_semantic: bool = True
    fetch_bibtex: bool = True
    fetch_open_access: bool = True
    sort_by: str = "cited_by"  # 'cited_by', 'pubdate', 'title'


# --------------------- HTTP Utilities ---------------------
async def async_get(
    client: httpx.AsyncClient,
    url: str,
    params: dict = None,
    retries: int = 3,
    timeout: int = 20
) -> Optional[httpx.Response]:
    """GET with retry and exponential backoff"""
    for attempt in range(retries):
        try:
            resp = await client.get(url, params=params, headers=HEADERS, timeout=timeout)
            if resp.status_code == 200:
                return resp
            if resp.status_code == 429:
                await asyncio.sleep(2 ** attempt)
                continue
        except (httpx.TimeoutException, httpx.ConnectError):
            await asyncio.sleep(1 * (attempt + 1))
        except Exception:
            break
    return None


# --------------------- SerpAPI Functions ---------------------
async def fetch_serpapi(client: httpx.AsyncClient, params: dict) -> Optional[dict]:
    """Generic SerpAPI request"""
    params["api_key"] = SERPAPI_KEY
    resp = await async_get(client, SERPAPI_BASE, params=params, timeout=30)
    if resp:
        return resp.json()
    return None


async def fetch_author_profile(client: httpx.AsyncClient, scholar_id: str) -> dict:
    """Fetch basic profile info + first page of articles"""
    params = {
        "engine": "google_scholar_author",
        "author_id": scholar_id,
        "hl": "en",
        "num": PAGE_SIZE,
    }
    return await fetch_serpapi(client, params) or {}


async def fetch_articles_page(
    client: httpx.AsyncClient,
    scholar_id: str,
    start: int,
    sort_by: str = "cited_by"
) -> List[dict]:
    """Fetch a single page of articles"""
    sort_param = None
    if sort_by == "pubdate":
        sort_param = "pubdate"
    elif sort_by == "title":
        sort_param = "title"
    
    params = {
        "engine": "google_scholar_author",
        "author_id": scholar_id,
        "hl": "en",
        "start": start,
        "num": PAGE_SIZE,
    }
    if sort_param:
        params["sort"] = sort_param
    
    data = await fetch_serpapi(client, params)
    return data.get("articles", []) if data else []


async def fetch_all_articles(
    client: httpx.AsyncClient,
    scholar_id: str,
    sort_by: str = "cited_by",
    max_publications: int = 0
) -> List[dict]:
    """Paginate through ALL articles"""
    all_articles = []
    start = 0
    
    while True:
        articles = await fetch_articles_page(client, scholar_id, start, sort_by)
        
        if not articles:
            break
        
        all_articles.extend(articles)
        
        # Check limits
        if max_publications > 0 and len(all_articles) >= max_publications:
            all_articles = all_articles[:max_publications]
            break
        
        # If we got fewer than PAGE_SIZE, we've reached the end
        if len(articles) < PAGE_SIZE:
            break
        
        start += PAGE_SIZE
        await asyncio.sleep(0.3)  # Rate limit courtesy
    
    return all_articles


async def fetch_article_citation_details(
    client: httpx.AsyncClient,
    scholar_id: str,
    citation_id: str
) -> Optional[dict]:
    """
    Fetch full article details using view_citation.
    Returns: title, authors, publication_date, journal, description (abstract), 
             total_citations, etc.
    """
    params = {
        "engine": "google_scholar_author",
        "author_id": scholar_id,
        "hl": "en",
        "view_op": "view_citation",
        "citation_id": citation_id,
    }
    data = await fetch_serpapi(client, params)
    return data.get("citation") if data else None


# --------------------- Enrichment APIs ---------------------
async def query_crossref(client: httpx.AsyncClient, title: str) -> Optional[dict]:
    """Query Crossref for DOI, publisher, etc."""
    if not title:
        return None
    params = {"query.title": title, "rows": 3}
    resp = await async_get(client, CROSSREF_BASE, params=params)
    if not resp:
        return None
    try:
        items = resp.json().get("message", {}).get("items", [])
        if not items:
            return None
        # Find best match
        target = title.lower()
        best = max(
            items,
            key=lambda x: difflib.SequenceMatcher(
                None, target, " ".join(x.get("title", [])).lower()
            ).ratio()
        )
        score = difflib.SequenceMatcher(
            None, target, " ".join(best.get("title", [])).lower()
        ).ratio()
        return best if score > 0.75 else None
    except Exception:
        return None


async def query_semantic_scholar(client: httpx.AsyncClient, title: str) -> Optional[dict]:
    """Query Semantic Scholar for topics, citation counts, abstract"""
    if not title:
        return None
    params = {
        "query": title,
        "limit": 1,
        "fields": "title,year,authors,abstract,topics,citationCount,influentialCitationCount,openAccessPdf,venue",
    }
    resp = await async_get(client, SEMANTIC_SCHOLAR_BASE, params=params)
    if not resp:
        return None
    try:
        data = resp.json().get("data", [])
        return data[0] if data else None
    except Exception:
        return None


async def query_unpaywall(client: httpx.AsyncClient, doi: str) -> Optional[dict]:
    """Query Unpaywall for open access PDF links"""
    if not doi:
        return None
    url = f"{UNPAYWALL_BASE}{urllib.parse.quote(doi)}?email={UNPAYWALL_EMAIL}"
    resp = await async_get(client, url)
    if not resp:
        return None
    try:
        data = resp.json()
        return {
            "is_open_access": data.get("is_oa", False),
            "oa_pdf_url": data.get("best_oa_location", {}).get("url_for_pdf") if data.get("is_oa") else None,
        }
    except Exception:
        return None


async def fetch_bibtex(client: httpx.AsyncClient, doi: str) -> Optional[str]:
    """Fetch BibTeX from Crossref"""
    if not doi:
        return None
    url = f"https://api.crossref.org/works/{urllib.parse.quote(doi)}/transform/application/x-bibtex"
    try:
        resp = await client.get(url, headers=HEADERS, timeout=10)
        return resp.text if resp.status_code == 200 else None
    except Exception:
        return None


# --------------------- Main Scraper Class ---------------------
class ScholarMindScraper:
    def __init__(self, config: ScraperConfig = None):
        self.config = config or ScraperConfig()
        self.semaphore = asyncio.Semaphore(CONCURRENT_LIMIT)
    
    def extract_scholar_id(self, url: str) -> str:
        """Extract scholar ID from Google Scholar URL"""
        if "user=" not in url:
            raise ValueError("Invalid Google Scholar URL - missing 'user=' parameter")
        return url.split("user=")[1].split("&")[0]
    
    def normalize_metrics(self, cited_by: dict) -> dict:
        """Parse citation metrics table"""
        table = cited_by.get("table", [])
        
        def get_val(idx: int, key: str, sub: str) -> int:
            try:
                v = table[idx].get(key, {}).get(sub)
                return int(v) if v else 0
            except (IndexError, KeyError, TypeError, ValueError):
                return 0
        
        return {
            "citations": {"all": get_val(0, "citations", "all"), "since_2019": get_val(0, "citations", "since_2019")},
            "h_index": {"all": get_val(1, "h_index", "all"), "since_2019": get_val(1, "h_index", "since_2019")},
            "i10_index": {"all": get_val(2, "i10_index", "all"), "since_2019": get_val(2, "i10_index", "since_2019")},
        }
    
    def normalize_citation_graph(self, cited_by: dict) -> List[dict]:
        """Extract yearly citation data"""
        return [{"year": g.get("year"), "citations": g.get("citations")} for g in cited_by.get("graph", [])]
    
    def normalize_co_authors(self, co_authors: List) -> List[dict]:
        """Parse co-author list"""
        if not co_authors:
            return []
        return [
            {
                "name": a.get("name", "Unknown"),
                "scholar_id": a.get("author_id") or a.get("scholar_id"),
                "affiliation": a.get("affiliations") or a.get("affiliation"),
                "thumbnail": a.get("thumbnail"),
            }
            for a in co_authors
        ]
    
    def normalize_interests(self, interests: List) -> List[str]:
        """Extract interest titles"""
        if not interests:
            return []
        return [i.get("title") if isinstance(i, dict) else str(i) for i in interests]
    
    async def enrich_article(
        self,
        client: httpx.AsyncClient,
        article: dict,
        scholar_id: str
    ) -> dict:
        """Enrich a single article with full details"""
        async with self.semaphore:
            title = article.get("title", "")
            citation_id = article.get("citation_id")
            
            enriched = {
                "title": title,
                "citation_id": citation_id,
                "link": article.get("link"),
                "authors": article.get("authors"),
                "publication": article.get("publication"),
                "year": article.get("year"),
                "cited_by_count": (article.get("cited_by") or {}).get("value", 0),
                "cited_by_link": (article.get("cited_by") or {}).get("link"),
            }
            
            # 1. Fetch full details from SerpAPI view_citation
            if self.config.fetch_article_details and citation_id:
                details = await fetch_article_citation_details(client, scholar_id, citation_id)
                if details:
                    enriched.update({
                        "title": details.get("title") or title,
                        "authors": details.get("authors") or enriched["authors"],
                        "publication_date": details.get("publication_date"),
                        "journal": details.get("journal"),
                        "volume": details.get("volume"),
                        "issue": details.get("issue"),
                        "pages": details.get("pages"),
                        "publisher": details.get("publisher"),
                        "description": details.get("description"),  # This is the abstract!
                        "total_citations": details.get("total_citations"),
                        "public_access": details.get("public_access"),
                        "resources": details.get("resources", []),
                    })
            
            # 2. Concurrent enrichment from Crossref & Semantic Scholar
            tasks = []
            if self.config.enrich_with_crossref:
                tasks.append(query_crossref(client, title))
            else:
                tasks.append(asyncio.coroutine(lambda: None)())
            
            if self.config.enrich_with_semantic:
                tasks.append(query_semantic_scholar(client, title))
            else:
                tasks.append(asyncio.coroutine(lambda: None)())
            
            crossref_data, semantic_data = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process Crossref data
            if crossref_data and not isinstance(crossref_data, Exception):
                doi = crossref_data.get("DOI")
                enriched["doi"] = doi
                enriched["publisher"] = enriched.get("publisher") or crossref_data.get("publisher")
                enriched["issn"] = crossref_data.get("ISSN", [None])[0] if crossref_data.get("ISSN") else None
                
                # Get abstract if not from view_citation
                if not enriched.get("description") and crossref_data.get("abstract"):
                    enriched["description"] = re.sub(r'<[^>]+>', '', crossref_data.get("abstract", "")).strip()
                
                # Fetch BibTeX and Open Access concurrently
                if doi:
                    extra_tasks = []
                    if self.config.fetch_bibtex:
                        extra_tasks.append(fetch_bibtex(client, doi))
                    if self.config.fetch_open_access:
                        extra_tasks.append(query_unpaywall(client, doi))
                    
                    if extra_tasks:
                        results = await asyncio.gather(*extra_tasks, return_exceptions=True)
                        idx = 0
                        if self.config.fetch_bibtex:
                            if not isinstance(results[idx], Exception):
                                enriched["bibtex"] = results[idx]
                            idx += 1
                        if self.config.fetch_open_access:
                            if not isinstance(results[idx], Exception) and results[idx]:
                                enriched.update(results[idx])
            
            # Process Semantic Scholar data
            if semantic_data and not isinstance(semantic_data, Exception):
                enriched["semantic_topics"] = [t.get("topic") for t in semantic_data.get("topics", []) if t.get("topic")]
                enriched["influential_citations"] = semantic_data.get("influentialCitationCount", 0)
                enriched["venue"] = enriched.get("journal") or semantic_data.get("venue")
                
                # Use S2 abstract if still missing
                if not enriched.get("description") and semantic_data.get("abstract"):
                    enriched["description"] = semantic_data.get("abstract")
                
                # Open access from S2
                if semantic_data.get("openAccessPdf") and not enriched.get("oa_pdf_url"):
                    enriched["oa_pdf_url"] = semantic_data["openAccessPdf"].get("url")
                    enriched["is_open_access"] = True
            
            enriched["enriched"] = True
            return enriched
    
    async def scrape(self, scholar_url: str) -> dict:
        """Main entry: scrape complete profile with all publications"""
        scholar_id = self.extract_scholar_id(scholar_url)
        
        async with httpx.AsyncClient(timeout=30) as client:
            # 1. Fetch basic profile info
            profile_data = await fetch_author_profile(client, scholar_id)
            author = profile_data.get("author", {})
            cited_by = profile_data.get("cited_by", {})
            
            # 2. Fetch ALL articles with pagination
            all_articles = await fetch_all_articles(
                client,
                scholar_id,
                sort_by=self.config.sort_by,
                max_publications=self.config.max_publications
            )
            
            # 3. Enrich each article concurrently
            enrich_tasks = [
                self.enrich_article(client, art, scholar_id)
                for art in all_articles
            ]
            enriched_articles = await asyncio.gather(*enrich_tasks, return_exceptions=True)
            
            # Filter out errors
            publications = [
                p for p in enriched_articles
                if p and not isinstance(p, Exception)
            ]
        
        # Build final response
        return {
            "scholar_id": scholar_id,
            "name": author.get("name"),
            "affiliation": author.get("affiliations"),
            "email": author.get("email"),
            "profile_picture": author.get("thumbnail"),
            "homepage": author.get("website"),
            "interests": self.normalize_interests(author.get("interests", [])),
            "metrics": self.normalize_metrics(cited_by),
            "citation_graph": self.normalize_citation_graph(cited_by),
            "co_authors": self.normalize_co_authors(profile_data.get("co_authors", [])),
            "publications": publications,
            "total_publications": len(publications),
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }


# --------------------- Public API ---------------------
async def fetchScholarlyProfile(
    scholar_url: str,
    max_publications: int = 0,
    fetch_details: bool = True,
    enrich: bool = True,
    sort_by: str = "cited_by"
) -> dict:
    """
    Fetch complete Google Scholar profile with ALL publications.
    
    Args:
        scholar_url: Google Scholar profile URL
        max_publications: Limit publications (0 = unlimited)
        fetch_details: Get full article details via view_citation (abstract, etc.)
        enrich: Enrich with Crossref/Semantic Scholar (DOI, BibTeX, topics)
        sort_by: Sort by 'cited_by' (default), 'pubdate', or 'title'
    
    Returns:
        Complete profile with:
        - Profile info (name, affiliation, email, interests)
        - Metrics (citations, h-index, i10-index)
        - Citation graph (yearly breakdown)
        - Co-authors list
        - All publications with full details
    """
    config = ScraperConfig(
        max_publications=max_publications,
        fetch_article_details=fetch_details,
        enrich_with_crossref=enrich,
        enrich_with_semantic=enrich,
        fetch_bibtex=enrich,
        fetch_open_access=enrich,
        sort_by=sort_by,
    )
    scraper = ScholarMindScraper(config)
    return await scraper.scrape(scholar_url)


async def fetch_and_update_scholarly(user_id, db) -> None:
    """Fetch profile and update MongoDB"""
    profile = await db.profiles.find_one({"user_id": user_id})
    if not profile or not profile.get("googleScholarUrl"):
        return
    
    data = await fetchScholarlyProfile(profile["googleScholarUrl"])
    
    await db.profiles.update_one(
        {"user_id": user_id},
        {"$set": {"scholarlyProfile": data, "updatedAt": datetime.now(timezone.utc)},"scholarlyProfileStatus": "completed"}
    )
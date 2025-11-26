import asyncio
import aiohttp
from typing import Optional, Dict, List
from datetime import datetime
from scholarly import scholarly, ProxyGenerator
import time
from functools import wraps

from pydantic import BaseModel, Field


# Your existing models
class ScholarlyMetrics(BaseModel):
    citations: Dict[str, int] = Field(default_factory=lambda: {"all": 0, "since_2019": 0})
    h_index: Dict[str, int] = Field(default_factory=lambda: {"all": 0, "since_2019": 0})
    i10_index: Dict[str, int] = Field(default_factory=lambda: {"all": 0, "since_2019": 0})


class CitationGraphPoint(BaseModel):
    year: Optional[int] = None
    citations: Optional[int] = None


class CoAuthor(BaseModel):
    name: str
    scholar_id: Optional[str] = None
    affiliation: Optional[str] = None


class Publication(BaseModel):
    title: str
    authors: Optional[str] = None
    year: Optional[int] = None
    venue: Optional[str] = None
    citation_count: Optional[int] = 0
    cited_by_count: Optional[int] = 0
    doi: Optional[str] = None
    publisher: Optional[str] = None
    pages: Optional[str] = None
    url: Optional[str] = None
    abstract: Optional[str] = None
    bibtex: Optional[str] = None
    oa_pdf_url: Optional[str] = None
    crossref_score: Optional[float] = None
    details_fetched: bool = False
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ScholarlyProfile(BaseModel):
    scholar_id: str
    name: str
    affiliation: Optional[str] = None
    email: Optional[str] = None
    profile_picture: Optional[str] = None
    website: Optional[str] = None
    interests: List[str] = Field(default_factory=list)
    co_authors: List[CoAuthor] = Field(default_factory=list)
    metrics: ScholarlyMetrics = Field(default_factory=ScholarlyMetrics)
    citation_graph: List[CitationGraphPoint] = Field(default_factory=list)
    publications: List[Publication] = Field(default_factory=list)
    scraping_status: Optional[str] = "profile_fetched"
    profile_fetched_at: Optional[datetime] = None
    details_fetched_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


def rate_limit(calls_per_second: float = 1.0):
    """Rate limiting decorator"""
    min_interval = 1.0 / calls_per_second
    last_called = [0.0]
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            if elapsed < min_interval:
                await asyncio.sleep(min_interval - elapsed)
            result = await func(*args, **kwargs)
            last_called[0] = time.time()
            return result
        return wrapper
    return decorator


class ScholarScraper:
    """
    Optimized scraper that minimizes SerpAPI usage:
    - Uses scholarly library for ALL data (free, handles pagination)
    - Uses Crossref for publication metadata enrichment (free)
    - Uses Unpaywall for OA PDFs (free)
    """
    
    def __init__(self, serpapi_key: Optional[str] = None, use_proxy: bool = False):
        self.serpapi_key = serpapi_key
        
        # Setup scholarly with proxy if needed (to avoid IP blocks)
        if use_proxy:
            pg = ProxyGenerator()
            pg.FreeProxies()  # or pg.ScraperAPI('your_key') for paid proxy
            scholarly.use_proxy(pg)
    
    async def scrape_scholar(
        self, 
        scholar_id: str,
        fetch_publications: bool = True,
        enrich_publications: bool = True,
        max_publications: Optional[int] = None
    ) -> ScholarlyProfile:
        """
        Scrape complete scholar profile with minimal API usage
        
        Args:
            scholar_id: Google Scholar ID
            fetch_publications: Whether to fetch publications
            enrich_publications: Whether to enrich with Crossref/Unpaywall
            max_publications: Limit number of publications (None = all)
        """
        print(f"🔍 Scraping scholar: {scholar_id}")
        
        # Step 1: Get profile data (uses scholarly - FREE)
        profile_data = await self._fetch_profile_scholarly(scholar_id)
        
        # Step 2: Get all publications with pagination (uses scholarly - FREE)
        if fetch_publications:
            publications = await self._fetch_all_publications(
                scholar_id, 
                max_publications
            )
            profile_data.publications = publications
            
            # Step 3: Enrich publications with metadata (FREE APIs)
            if enrich_publications:
                await self._enrich_publications(profile_data.publications)
        
        profile_data.updated_at = datetime.utcnow()
        profile_data.scraping_status = "complete"
        
        print(f"✅ Scraped {profile_data.name}: {len(profile_data.publications)} publications")
        return profile_data
    
    async def _fetch_profile_scholarly(self, scholar_id: str) -> ScholarlyProfile:
        """Fetch profile using scholarly library (FREE)"""
        print("📊 Fetching profile data...")
        
        # Run scholarly in thread pool (it's synchronous)
        loop = asyncio.get_event_loop()
        author = await loop.run_in_executor(
            None, 
            lambda: scholarly.search_author_id(scholar_id)
        )
        author = await loop.run_in_executor(None, lambda: scholarly.fill(author))
        
        # Parse metrics
        metrics = ScholarlyMetrics(
            citations={
                "all": author.get('citedby', 0),
                "since_2019": author.get('citedby5y', 0)
            },
            h_index={
                "all": author.get('hindex', 0),
                "since_2019": author.get('hindex5y', 0)
            },
            i10_index={
                "all": author.get('i10index', 0),
                "since_2019": author.get('i10index5y', 0)
            }
        )
        
        # Parse citation graph
        citation_graph = []
        if 'cites_per_year' in author:
            citation_graph = [
                CitationGraphPoint(year=int(year), citations=count)
                for year, count in author['cites_per_year'].items()
            ]
        
        # Parse co-authors
        co_authors = []
        if 'coauthors' in author:
            for coauthor in author['coauthors']:
                co_authors.append(CoAuthor(
                    name=coauthor.get('name', ''),
                    scholar_id=coauthor.get('scholar_id'),
                    affiliation=coauthor.get('affiliation')
                ))
        
        profile = ScholarlyProfile(
            scholar_id=scholar_id,
            name=author.get('name', ''),
            affiliation=author.get('affiliation'),
            email=author.get('email'),
            profile_picture=author.get('url_picture'),
            website=author.get('homepage'),
            interests=author.get('interests', []),
            co_authors=co_authors,
            metrics=metrics,
            citation_graph=citation_graph,
            profile_fetched_at=datetime.utcnow()
        )
        
        return profile
    
    async def _fetch_all_publications(
        self, 
        scholar_id: str, 
        max_publications: Optional[int] = None
    ) -> List[Publication]:
        """
        Fetch ALL publications with automatic pagination (FREE)
        scholarly library handles pagination automatically
        """
        print("📚 Fetching publications (with pagination)...")
        
        loop = asyncio.get_event_loop()
        author = await loop.run_in_executor(
            None, 
            lambda: scholarly.search_author_id(scholar_id)
        )
        author = await loop.run_in_executor(None, lambda: scholarly.fill(author))
        
        publications = []
        count = 0
        
        # scholarly automatically handles pagination
        for pub in author.get('publications', []):
            if max_publications and count >= max_publications:
                break
            
            # Fill publication details (this gets abstract, citations, etc.)
            try:
                pub_filled = await loop.run_in_executor(
                    None, 
                    lambda p=pub: scholarly.fill(p)
                )
            except Exception as e:
                print(f"⚠️  Error filling publication: {e}")
                pub_filled = pub
            
            # Parse authors properly (can be string or list)
            authors_raw = pub_filled.get('bib', {}).get('author', [])
            if isinstance(authors_raw, list):
                authors_str = ', '.join(authors_raw)
            else:
                authors_str = str(authors_raw) if authors_raw else ''
            
            publication = Publication(
                title=pub_filled.get('bib', {}).get('title', ''),
                authors=authors_str,
                year=self._parse_year(pub_filled.get('bib', {}).get('pub_year')),
                venue=pub_filled.get('bib', {}).get('venue', ''),
                citation_count=pub_filled.get('num_citations', 0),
                abstract=pub_filled.get('bib', {}).get('abstract'),
                url=pub_filled.get('pub_url'),
                details_fetched=True
            )
            
            publications.append(publication)
            count += 1
            
            if count % 10 == 0:
                print(f"  📄 Fetched {count} publications...")
        
        print(f"✅ Fetched total {len(publications)} publications")
        return publications
    
    @rate_limit(calls_per_second=0.5)  # Be nice to Crossref API
    async def _enrich_with_crossref(self, publication: Publication):
        """Enrich publication with Crossref metadata (FREE)"""
        if not publication.title:
            return
        
        try:
            async with aiohttp.ClientSession() as session:
                # Search Crossref by title
                params = {
                    'query.title': publication.title,
                    'rows': 1
                }
                url = 'https://api.crossref.org/works'
                
                async with session.get(url, params=params) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        items = data.get('message', {}).get('items', [])
                        
                        if items:
                            item = items[0]
                            publication.doi = item.get('DOI')
                            publication.publisher = item.get('publisher')
                            publication.crossref_score = item.get('score')
                            
                            # Get abstract if available
                            if 'abstract' in item and not publication.abstract:
                                publication.abstract = item['abstract']
                            
                            # Get pages
                            if 'page' in item:
                                publication.pages = item['page']
        
        except Exception as e:
            print(f"⚠️  Crossref error for '{publication.title[:50]}': {e}")
    
    @rate_limit(calls_per_second=0.5)  # Be nice to Unpaywall
    async def _enrich_with_unpaywall(self, publication: Publication):
        """Get open access PDF URL from Unpaywall (FREE)"""
        if not publication.doi:
            return
        
        try:
            async with aiohttp.ClientSession() as session:
                # Unpaywall requires email in query
                url = f'https://api.unpaywall.org/v2/{publication.doi}'
                params = {'email': 'your-email@example.com'}  # Replace with your email
                
                async with session.get(url, params=params) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        
                        # Get best OA location
                        if data.get('is_oa') and data.get('best_oa_location'):
                            publication.oa_pdf_url = data['best_oa_location'].get('url_for_pdf')
        
        except Exception as e:
            print(f"⚠️  Unpaywall error for DOI {publication.doi}: {e}")
    
    async def _enrich_publications(self, publications: List[Publication]):
        """Enrich all publications with Crossref and Unpaywall data"""
        print(f"🔬 Enriching {len(publications)} publications with metadata...")
        
        for i, pub in enumerate(publications):
            # Enrich with Crossref
            await self._enrich_with_crossref(pub)
            
            # Enrich with Unpaywall (only if we have DOI)
            if pub.doi:
                await self._enrich_with_unpaywall(pub)
            
            if (i + 1) % 10 == 0:
                print(f"  ✨ Enriched {i + 1}/{len(publications)} publications")
        
        print("✅ Enrichment complete")
    
    @staticmethod
    def _parse_year(year_str) -> Optional[int]:
        """Parse year from various formats"""
        if not year_str:
            return None
        try:
            return int(str(year_str))
        except (ValueError, TypeError):
            return None


async def fetch_and_update_scholarly(user_id, db):
    """
    Fetch scholarly profile and update in database
    
    Args:
        user_id: User ID to fetch profile for
        db: Database connection with profiles collection
    """
    try:
        profile = await db.profiles.find_one({"user_id": user_id})
        
        if not profile:
            raise ValueError(f"Profile not found for user_id: {user_id}")
        
        scholar_url = profile.get("googleScholarUrl")
        if not scholar_url:
            raise ValueError("No Google Scholar URL found in user profile")
        
        # Extract scholar ID more safely
        if "user=" in scholar_url:
            scholar_id = scholar_url.split("user=")[1].split("&")[0]
        else:
            raise ValueError("Invalid Google Scholar URL format")
        
        scraper = ScholarScraper(use_proxy=False)
        
        data = await scraper.scrape_scholar(
            scholar_id=scholar_id,
            fetch_publications=True,
            enrich_publications=True,
            max_publications=None  # Fetch all publications
        )
        
        # Convert to dict for MongoDB
        data_dict = data.dict()
        
        # Update database
        result = await db.profiles.update_one(
            {"user_id": user_id}, 
            {"$set": {
                "scholarlyProfile": data_dict,
                "scholarlyProfileStatus": "completed",
                "updated_at": datetime.utcnow()
            }}
        )
        
        print(f"✅ Successfully updated scholarly profile for user {user_id}")
        return True
        
    except Exception as e:
        print(f"❌ Error updating scholarly profile: {e}")
        # Update status to failed
        await db.profiles.update_one(
            {"user_id": user_id}, 
            {"$set": {
                "scholarlyProfileStatus": "failed",
                "updated_at": datetime.utcnow()
            }}
        )
        raise
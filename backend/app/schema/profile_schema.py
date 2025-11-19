from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, *args, **kwargs):
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError(f"Invalid ObjectId: {v}")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        json_schema = handler(core_schema)
        json_schema.update(type="string")
        return json_schema

class ScholarlyMetrics(BaseModel):
    """Citation and impact metrics for a scholar"""
    citations: Dict[str, int] = Field(
        default_factory=lambda: {"all": 0, "since_2019": 0},
        description="Total citations (all-time and since 2019)"
    )
    h_index: Dict[str, int] = Field(
        default_factory=lambda: {"all": 0, "since_2019": 0},
        description="H-index metrics"
    )
    i10_index: Dict[str, int] = Field(
        default_factory=lambda: {"all": 0, "since_2019": 0},
        description="i10-index metrics"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "citations": {"all": 1250, "since_2019": 450},
                "h_index": {"all": 15, "since_2019": 10},
                "i10_index": {"all": 25, "since_2019": 12}
            }
        }


class CitationGraphPoint(BaseModel):
    """A single point on the citation graph"""
    year: Optional[int] = None
    citations: Optional[int] = None

    class Config:
        json_schema_extra = {
            "example": {"year": 2023, "citations": 45}
        }


class CoAuthor(BaseModel):
    """Co-author information"""
    name: str = Field(..., description="Co-author name")
    scholar_id: Optional[str] = Field(None, description="Google Scholar ID")
    affiliation: Optional[str] = Field(None, description="Co-author affiliation")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Dr. Jane Smith",
                "scholar_id": "xyz123abc",
                "affiliation": "Stanford University"
            }
        }


class Publication(BaseModel):
    """Publication/Research paper information"""
    title: str = Field(..., description="Publication title")
    authors: Optional[str] = Field(None, description="Authors (comma-separated)")
    year: Optional[int] = Field(None, description="Publication year")
    venue: Optional[str] = Field(None, description="Conference/Journal name")
    citation_count: Optional[int] = Field(default=0, description="Citation count")
    cited_by_count: Optional[int] = Field(default=0, description="Cited by count (from SerpAPI)")
    influential_citations: Optional[int] = Field(default=0, description="Influential citation count")
    
    # Publication metadata
    doi: Optional[str] = Field(None, description="Digital Object Identifier")
    publisher: Optional[str] = Field(None, description="Publisher name")
    volume: Optional[str] = Field(None, description="Volume number")
    pages: Optional[str] = Field(None, description="Page numbers")
    url: Optional[str] = Field(None, description="Publication URL")
    
    # Content and references
    abstract: Optional[str] = Field(None, description="Abstract text")
    bibtex: Optional[str] = Field(None, description="BibTeX citation")
    semantic_topics: List[str] = Field(default_factory=list, description="Topics from Semantic Scholar")
    
    # Open access information
    is_open_access: Optional[bool] = Field(default=False, description="Is open access available")
    oa_pdf_url: Optional[str] = Field(None, description="Open access PDF URL")
    
    # Metadata
    crossref_score: Optional[float] = Field(None, description="Crossref match score")
    details_fetched: bool = Field(default=False, description="Whether full details were fetched")
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Deep Learning Architecture for NLP",
                "authors": "John Doe, Jane Smith",
                "year": 2023,
                "venue": "NeurIPS",
                "citation_count": 25,
                "doi": "10.1234/example",
                "abstract": "This paper presents...",
                "is_open_access": True,
                "details_fetched": True
            }
        }


class ScholarlyProfile(BaseModel):
    """Complete scholarly profile with metrics and publications"""
    scholar_id: str = Field(..., description="Unique Google Scholar user ID")
    name: str = Field(..., description="Scholar name")
    
    # Contact and profile info
    affiliation: Optional[str] = Field(None, description="Current affiliation")
    email: Optional[str] = Field(None, description="Email address")
    profile_picture: Optional[str] = Field(None, description="Profile picture URL")
    website: Optional[str] = Field(None, description="Personal website URL")
    
    # Research info
    interests: List[str] = Field(
        default_factory=list,
        description="Research interests/areas"
    )
    
    # Network and impact
    co_authors: List[CoAuthor] = Field(
        default_factory=list,
        description="List of co-authors"
    )
    metrics: ScholarlyMetrics = Field(
        default_factory=ScholarlyMetrics,
        description="Citation and impact metrics"
    )
    citation_graph: List[CitationGraphPoint] = Field(
        default_factory=list,
        description="Citation trend over years"
    )
    
    # Publications
    publications: List[Publication] = Field(
        default_factory=list,
        description="List of publications"
    )
    
    # Status tracking
    scraping_status: Optional[str] = Field(
        default="profile_fetched",
        description="Current scraping status"
    )
    profile_fetched_at: Optional[datetime] = Field(
        None,
        description="When profile was fetched"
    )
    details_fetched_at: Optional[datetime] = Field(
        None,
        description="When publication details were fetched"
    )
    
    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Record creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "scholar_id": "2A_f0WAAAAAJ",
                "name": "Dr. John Smith",
                "affiliation": "MIT",
                "email": "john@mit.edu",
                "interests": ["Machine Learning", "NLP", "Computer Vision"],
                "metrics": {
                    "citations": {"all": 1250, "since_2019": 450},
                    "h_index": {"all": 15, "since_2019": 10},
                    "i10_index": {"all": 25, "since_2019": 12}
                },
                "publications": [],
                "co_authors": [],
                "citation_graph": [],
                "scraping_status": "profile_fetched"
            }
        }

class ProfileBase(BaseModel):
    # Step 1 fields
    role: Optional[str] = None
    academicLevel: Optional[str] = None
    
    # Step 2 fields
    institution: Optional[str] = None
    highestDegree: Optional[str] = None
    primaryField: Optional[str] = None
    
    # Step 3 fields
    googleScholarUrl: Optional[str] = None
    otherLinks: Optional[str] = None
    researchDescription: Optional[str] = None
    researchInterests: Optional[List[str]] = None
    recentPublications: Optional[str] = None
    
    # Step 4 fields
    activeTopics: Optional[List[str]] = None
    learningTopics: Optional[List[str]] = None
    
    # Step 5 fields
    goals: Optional[List[str]] = None
    
    # Existing fields (kept for backward compatibility)
    name: Optional[str] = None
    bio: Optional[str] = None
    picture: Optional[str] = None
    email: Optional[str] = None
    scholarlyProfile: Optional[ScholarlyProfile] = None

    model_config = ConfigDict(
        arbitrary_types_allowed=True
    )


class ProfileCreate(ProfileBase):
    # user_id: PyObjectId = Field(..., alias="user_id")
    onboardingComplete: bool = False
    onboardingStep: int = 1


class ProfileUpdate(ProfileBase):
    onboardingComplete: Optional[bool] = None
    onboardingStep: Optional[int] = None

class ProfileOut(ProfileBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., alias="user_id")
    onboardingComplete: bool
    onboardingStep: int
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
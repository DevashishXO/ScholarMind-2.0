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
    citations: Dict[str, int] = Field(
        default_factory=lambda: {"all": 0, "since_2019": 0}
    )
    h_index: Dict[str, int] = Field(
        default_factory=lambda: {"all": 0, "since_2019": 0}
    )
    i10_index: Dict[str, int] = Field(
        default_factory=lambda: {"all": 0, "since_2019": 0}
    )


class CitationGraphPoint(BaseModel):
    year: int
    citations: int


class CoAuthor(BaseModel):
    name: str
    link: Optional[str] = None
    author_id: Optional[str] = None
    affiliation: Optional[str] = None


# -------------------- Publication Schema --------------------

class Publication(BaseModel):
    title: str
    authors: Optional[str] = None
    year: Optional[int] = None
    venue: Optional[str] = None
    cited_by_count: Optional[int] = 0
    citation_count: Optional[int] = 0
    influential_citations: Optional[int] = 0
    doi: Optional[str] = None
    publisher: Optional[str] = None
    volume: Optional[str] = None
    pages: Optional[str] = None
    abstract: Optional[str] = None
    bibtex: Optional[str] = None
    semantic_topics: Optional[List[str]] = []
    is_open_access: Optional[bool] = False
    oa_pdf_url: Optional[str] = None
    url: Optional[str] = None
    crossref_score: Optional[float] = None
    details_fetched: bool = False
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# -------------------- Author Profile Schema --------------------

class ScholarlyProfile(BaseModel):
    scholar_id: str = Field(..., description="Unique Scholar user ID")
    name: str
    affiliation: Optional[str] = None
    email: Optional[str] = None
    profile_picture: Optional[str] = None
    website: Optional[str] = None
    interests: List[str] = Field(default_factory=list)
    co_authors: List[CoAuthor] = Field(default_factory=list)
    metrics: ScholarlyMetrics = Field(default_factory=ScholarlyMetrics)
    citation_graph: List[CitationGraphPoint] = Field(default_factory=list)
    scraping_status: Optional[str] = "profile_fetched"
    profile_fetched_at: Optional[datetime] = None
    details_fetched_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    publications: List[Publication] = Field(default_factory=list)

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "scholar_id": "RTTPBAYAAAAJ",
                "name": "Devika Kataria",
                "affiliation": "Department of Electronics, XYZ University",
                "email": "devika@xyz.edu",
                "profile_picture": "https://scholar.googleusercontent.com/citations?user=RTTPBAYAAAAJ",
                "interests": ["Automation", "IoT", "Control Systems"],
                "metrics": {
                    "citations": {"all": 205, "since_2019": 180},
                    "h_index": {"all": 9, "since_2019": 7},
                    "i10_index": {"all": 7, "since_2019": 5}
                },
                "citation_graph": [
                    {"year": 2020, "citations": 15},
                    {"year": 2021, "citations": 22},
                    {"year": 2022, "citations": 35}
                ],
                "co_authors": [
                    {"name": "P Mehta", "link": "https://scholar.google.com/citations?user=ABC123"},
                    {"name": "A Singh"}
                ],
                "publications": [
                    {
                        "title": "Fundamentals of Automation Engineering",
                        "year": 2021,
                        "venue": "Springer",
                        "doi": "10.1007/978-3-030-XXXX",
                        "publisher": "Springer",
                        "citation_count": 42,
                        "semantic_topics": ["Automation", "Education"],
                        "is_open_access": True,
                        "oa_pdf_url": "https://link.springer.com/pdf/10.1007/978-3-030-XXXX.pdf",
                        "abstract": "This paper introduces a hybrid project-based learning approach...",
                        "bibtex": "@inproceedings{kataria2021fundamentals,...}",
                        "details_fetched": True
                    }
                ]
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
    
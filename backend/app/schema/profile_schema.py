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
    
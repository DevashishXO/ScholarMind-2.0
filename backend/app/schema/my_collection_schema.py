from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

def generate_uuid() -> str:
    return str(uuid.uuid4())
    
class Category(BaseModel):
    code:str
    label: str
    is_primary: bool    

class Paper(BaseModel):
    paper_id: str = Field(default_factory=generate_uuid)
    title: Optional[str] = None
    authors: Optional[List[str]] = []
    year: Optional[int] = None
    source: Optional[str] = None     # e.g., "arXiv", "Google Scholar", "IEEE"
    url: Optional[str] = None
    abstract: Optional[str] = None   # optional future expansion
    doi: Optional[str] = None
    primary_category: Optional[str] = None
    categories: Optional[List[Category]] = []
    published_date: Optional[str] = None
    pdfUrl: Optional[str] = None

class Collection(BaseModel):
    user_id: str
    profile_id: str
    collection_name: Optional[str] = None
    saved_papers: Optional[List[Paper]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

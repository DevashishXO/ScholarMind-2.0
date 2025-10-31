from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Initial schema
class DateRange(BaseModel):
    from_: datetime = Field(..., alias="from")
    to: datetime

class Filters(BaseModel):
    dateRange: Optional[DateRange] = None
    journal_ref: Optional[List[str]] = None

class NewSearch(BaseModel):
    query_keywords: List[str]
    filters: Optional[Filters] = None
    
class BotQuery(BaseModel):
    user_query: str
    
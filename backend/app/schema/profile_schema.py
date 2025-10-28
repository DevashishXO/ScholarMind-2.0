from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class ProfileBase(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None

    academicLevel: Optional[str] = None
    field: Optional[str] = None
    subfield: Optional[str] = None
    researchInterests: Optional[List[str]] = None

    preferredPaperTypes: Optional[List[str]] = None
    recencyPreference: Optional[str] = None
    favoriteAuthors: Optional[List[str]] = None

    goals: Optional[List[str]] = None


class ProfileCreate(ProfileBase):
    user_id: str = Field(..., description="User ID who owns this profile")
    onboardingComplete: bool = False
    onboardingStep: int = 1


class ProfileUpdate(ProfileBase):
    onboardingComplete: Optional[bool] = None
    onboardingStep: Optional[int] = None


class ProfileOut(ProfileBase):
    id: str = Field(..., alias="_id")
    user_id: str
    onboardingComplete: bool
    onboardingStep: int
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True
        orm_mode = True

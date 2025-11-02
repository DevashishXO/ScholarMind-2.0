from site import USER_BASE
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
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
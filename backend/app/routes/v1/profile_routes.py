from fastapi import APIRouter, Depends, HTTPException, status, Request
from datetime import datetime
from app.schema.profile_schema import ProfileCreate, ProfileUpdate, ProfileOut
from app.utils.get_user import get_current_user
from app.utils.db import get_db_from_request

router = APIRouter()

# Create profile 
@router.post("/", response_model=ProfileOut)
async def create_profile(request: Request, profile: ProfileCreate, user=Depends(get_current_user)):
    db = get_db_from_request(request)

    existing = await db.profiles.find_one({"user_id": profile.user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")

    profile_dict = profile.dict()
    profile_dict["createdAt"] = datetime.utcnow()
    profile_dict["updatedAt"] = datetime.utcnow()

    await db.profiles.insert_one(profile_dict)
    return profile_dict


# Get current user's profile
@router.get("/me", response_model=ProfileOut)
async def get_my_profile(request: Request, user=Depends(get_current_user)):
    db = get_db_from_request(request)

    profile = await db.profiles.find_one({"user_id": user["_id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


# Update profile
@router.patch("/", response_model=ProfileOut)
async def update_profile(request: Request, updates: ProfileUpdate, user=Depends(get_current_user)):
    db = get_db_from_request(request)

    profile = await db.profiles.find_one({"user_id": user["_id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    update_data["onboardingStep"] = profile["onboardingStep"] +1

    await db.profiles.update_one({"user_id": user["_id"]}, {"$set": update_data})
    updated = await db.profiles.find_one({"user_id": user["_id"]})
    
    return updated

from fastapi import APIRouter, Depends, HTTPException,Request,BackgroundTasks
from datetime import datetime
from app.schema.profile_schema import ProfileCreate, ProfileUpdate
from app.utils.get_user import get_current_user
from app.utils.db import get_db_from_request

from app.services.google_scholarly import fetch_and_update_scholarly

router = APIRouter()

# Create profile
@router.post("/")
async def create_profile(request: Request, profile: ProfileCreate, background_tasks: BackgroundTasks, user=Depends(get_current_user)):
    db = get_db_from_request(request)

    existing = await db.profiles.find_one({"user_id": user["_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")

    profile_dict = profile.dict(by_alias=True)
    profile_dict["createdAt"] = datetime.utcnow()
    profile_dict["updatedAt"] = datetime.utcnow()
    profile_dict["user_id"] = user["_id"]
    profile_dict["name"] = user["name"]
    profile_dict["email"] = user["email"]
    profile_dict["picture"] = user["picture"]
    

    result = await db.profiles.insert_one(profile_dict) 
    background_tasks.add_task(fetch_and_update_scholarly, user["_id"], db)
    
    created_profile = await db.profiles.find_one({"_id": result.inserted_id})
    created_profile["user_id"] = str(created_profile["user_id"])
    created_profile["_id"] = str(created_profile["_id"])
    return {
        "message":"Profile Created Successfully",
    }

# Get current user's profile
@router.get("/me")
async def get_my_profile(request: Request, user=Depends(get_current_user)):
    db = get_db_from_request(request)

    profile = await db.profiles.find_one({"user_id": user["_id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profile["_id"] = str(profile["_id"])
    profile["user_id"] = str(profile["user_id"])

    return profile


# Update profile
@router.patch("/")
async def update_profile(
    request: Request, 
    updates: ProfileUpdate, 
    user=Depends(get_current_user),
    onboarding_step: int = None  # Optional parameter to control onboarding step
):
    db = get_db_from_request(request)

    profile = await db.profiles.find_one({"user_id": user["_id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = {k: v for k, v in updates.dict(exclude_unset=True).items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    # Handle onboarding step progression
    if onboarding_step is not None:
        # Use explicit step provided
        update_data["onboardingStep"] = onboarding_step
    elif updates.onboardingStep is not None:
        # Use step from update object
        update_data["onboardingStep"] = updates.onboardingStep
    else:
        # Auto-increment only if no step is provided and user is completing a step
        current_step = profile.get("onboardingStep", 1)
        # Only auto-increment if we're actually updating profile fields (not just step)
        if update_data and len(update_data) > 1:  # More than just updatedAt
            update_data["onboardingStep"] = min(current_step + 1, 5)  # Cap at step 5

    await db.profiles.update_one({"user_id": user["_id"]}, {"$set": update_data})
    updated = await db.profiles.find_one({"user_id": user["_id"]})
    updated["user_id"] = str(updated["user_id"])    
    updated["_id"] = str(updated["_id"])    
    
    return {
        "message":"Profile Updated Successfully",
        "data": updated
    }


# Complete onboarding
@router.patch("/complete-onboarding")
async def complete_onboarding(request: Request, user=Depends(get_current_user)):
    db = get_db_from_request(request)

    profile = await db.profiles.find_one({"user_id": user["_id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = {
        "onboardingComplete": True,
        "onboardingStep": 5,  # Final step
        "updatedAt": datetime.utcnow()
    }

    await db.profiles.update_one({"user_id": user["_id"]}, {"$set": update_data})
    updated = await db.profiles.find_one({"user_id": user["_id"]})
    updated["user_id"] = str(updated["user_id"])    
    updated["_id"] = str(updated["_id"])    
    
    return{
        "message":"Onboarding Completed",
    }


# Get onboarding status
@router.get("/onboarding-status")
async def get_onboarding_status(request: Request, user=Depends(get_current_user)):
    db = get_db_from_request(request)

    profile = await db.profiles.find_one({"user_id": user["_id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return {
        "onboardingComplete": profile.get("onboardingComplete", False),
        "onboardingStep": profile.get("onboardingStep", 1),
        "totalSteps": 5
    }
    
# add scholarly data into profile
# @router.patch("/add-scholarly-data")
# async def update_scholarly_data(request: Request, user=Depends(get_current_user)):
#     db = get_db_from_request(request)

#     profile = await db.profiles.find_one({"user_id": user["_id"]})
#     if not profile:
#         raise HTTPException(status_code=404, detail="Profile not found")

#     google_scholar_url = profile.get("googleScholarUrl", "")
#     print(google_scholar_url)
#     data = await fetchScholarlyProfile(google_scholar_url)
#     update_data = {
#         "scholarlyProfile": data,
#         "updatedAt": datetime.utcnow()
#     }

#     await db.profiles.update_one({"user_id": user["_id"]}, {"$set": update_data})
#     updated = await db.profiles.find_one({"user_id": user["_id"]})
#     updated["user_id"] = str(updated["user_id"])    
#     updated["_id"] = str(updated["_id"])    
    
#     return{
#         "message":"Scholarly Data Updated",
#     }
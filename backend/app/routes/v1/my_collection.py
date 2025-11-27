from fastapi import APIRouter, Request, Depends, HTTPException
from datetime import datetime
from bson import ObjectId

from app.schema.my_collection_schema import (
    Collection,
    Paper
)
from app.utils.get_user import get_current_user, get_db_from_request

router = APIRouter()


# Create Collection
@router.post("/")
async def create_collection(request: Request, user=Depends(get_current_user)):
    payload = await request.json()  # payload is a dict
    db = get_db_from_request(request)

    # Fetch profile
    profile = await db.profiles.find_one({"user_id": user["_id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile_id = str(profile["_id"])

    # Extract collection_name
    collection_name = payload.get("collection_name")
    if not collection_name:
        raise HTTPException(status_code=400, detail="collection_name is required")

    # Check for duplicate collection name for this user
    existing = await db.mycollections.find_one({
        "user_id": str(user["_id"]),
        "collection_name": collection_name
    })

    if existing:
        raise HTTPException(status_code=400, detail="Collection already exists")

    # Create new collection object
    new_collection = Collection(
        user_id=str(user["_id"]),
        profile_id=profile_id,
        collection_name=collection_name,
        saved_papers=[],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    
    insert_result = await db.mycollections.insert_one(new_collection.dict())
    
    created_collection = await db.mycollections.find_one({
        "_id": insert_result.inserted_id
    })
    
    created_collection["_id"] = str(created_collection["_id"])
    
    return {
        "message": "Collection created",
        "collection": created_collection
    }


# Get All Collections
@router.get("/")
async def get_collections(request: Request, user=Depends(get_current_user)):
    db = get_db_from_request(request)

    collections = await db.mycollections.find(
        {"user_id": str(user["_id"])}
    ).to_list(None)

    # Convert ObjectId → str
    for col in collections:
        col["_id"] = str(col["_id"])

    return {"collections": collections}

# Get Single Collection
@router.get("/{collection_id}")
async def get_single_collection(collection_id: str, request: Request, user=Depends(get_current_user)):
    db = get_db_from_request(request)

    collection = await db.mycollections.find_one({
        "_id": ObjectId(collection_id),
        "user_id": str(user["_id"])
    })
    
    collection["_id"] = str(collection["_id"])

    if not collection:
        raise HTTPException(404, "Collection not found")

    return collection

# Add Paper to Collection
@router.post("/{collection_id}/papers")
async def add_paper(collection_id: str, request: Request, user=Depends(get_current_user)):
    db = get_db_from_request(request)

    # 1. Read JSON body
    payload = await request.json()

    # 2. Convert to Pydantic model
    paper = Paper(**payload)

    # 3. Convert to dict for MongoDB
    paper_dict = paper.model_dump()
    
    existing = await db.mycollections.find_one({
        "_id": ObjectId(collection_id),
        "user_id": str(user["_id"]),
        "saved_papers": {"$elemMatch": {"title": paper_dict["title"]}}
    })
    
    if existing:
        raise HTTPException(409, "Paper already exists in collection")
    
    # 4. Update collection
    result = await db.mycollections.update_one(
        {"_id": ObjectId(collection_id), "user_id": str(user["_id"])},
        {
            "$push": {"saved_papers": paper_dict},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )

    # 5. Check update result
    if result.modified_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Collection not found or update failed"
        )

    return {"message": "Paper added", "paper": paper_dict}

# # Remove Paper From Collection
@router.delete("/{collection_id}/papers/{paper_id}")
async def remove_paper(collection_id: str, paper_id: str, request: Request, user=Depends(get_current_user)):
    db = get_db_from_request(request)

    result = await db.mycollections.update_one(
        {"_id": ObjectId(collection_id), "user_id": str(user["_id"])},
        {
            "$pull": {"saved_papers": {"paper_id": paper_id}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )

    if result.modified_count == 0:
        raise HTTPException(404, "Paper or collection not found")

    return {"message": "Paper removed"}


# # Delete Entire Collection
@router.delete("/{collection_id}")
async def delete_collection(collection_id: str, request: Request, user=Depends(get_current_user)):
    db = get_db_from_request(request)

    result = await db.mycollections.delete_one({
        "_id": ObjectId(collection_id),
        "user_id": str(user["_id"])
    })

    if result.deleted_count == 0:
        raise HTTPException(404, "Collection not found")

    return {"message": "Collection deleted"}

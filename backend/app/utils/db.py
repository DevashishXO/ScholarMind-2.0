# app/utils/db.py
from fastapi import Request, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

def get_db_from_request(request: Request) -> AsyncIOMotorDatabase:
    db = getattr(request.app.state, "db", None)
    if db is None:
        raise HTTPException(status_code=500, detail="Database not configured")
    return db

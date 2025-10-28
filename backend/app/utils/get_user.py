from fastapi import Depends, HTTPException, Request, status
from jose import jwt, JWTError
from utils.db import get_db_from_request
from core.config import settings

async def get_current_user(request: Request):
    token = request.cookies.get("access_token")  

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token is invalid or expired")

    # Get MongoDB instance
    db = get_db_from_request(request)
    user = await db.users.find_one({"_id": user_id})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

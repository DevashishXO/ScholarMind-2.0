from fastapi import Depends, HTTPException, Request, status
from jose import jwt, JWTError
from app.utils.db import get_db_from_request
from app.core.config import settings
from bson import ObjectId

async def get_current_user(request: Request):
    token = request.cookies.get("access_token")  

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token is invalid or expired")

    # Get MongoDB instance
    db = get_db_from_request(request)
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    print(user)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

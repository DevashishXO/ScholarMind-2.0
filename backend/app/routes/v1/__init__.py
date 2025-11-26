from fastapi import APIRouter
from .auth_routes import router as auth_router
from .profile_routes import router as profile_router
from .AI import api_router as ai_router
from .my_collection import router as my_collection_router

api_router = APIRouter()

# Include routes
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profile_router, prefix="/profile", tags=["Profile"])
api_router.include_router(my_collection_router, prefix="/my_collection", tags=["My Collection"])
api_router.include_router(ai_router)

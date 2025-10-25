from fastapi import APIRouter
from .auth_routes import router as auth_router

api_router = APIRouter()

# Include routes
api_router.include_router(auth_router, prefix="/auth")

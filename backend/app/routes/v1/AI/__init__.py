from fastapi import APIRouter
from .new_search import router as new_search_router
from .research_bot_routes import router as research_bot_router

api_router = APIRouter()

api_router.include_router(new_search_router, prefix="/search-query", tags=["Search"])
api_router.include_router(research_bot_router, prefix="/research-bot", tags=["ResearchBot"])

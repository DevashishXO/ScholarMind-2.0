from fastapi import APIRouter
from .search_query import router as new_search_router
from .research_bot import router as research_bot_router
from .chat_with_paper import router as chat_with_paper_router
# modules import
from engine import rag_llm, chat_pdf_handler, smart_search

router = APIRouter()
router.include_router(new_search_router, prefix="/search")
router.include_router(research_bot_router, prefix="/research-bot")
router.include_router(chat_with_paper_router, prefix="/chat-with-paper")
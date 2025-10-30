from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os

load_dotenv()

app = FastAPI(title="ScholarMind AI Backend", version="1.0.0")

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173, http://localhost:8080").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Required for OAuth session support
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", "super-secret-session-key"),
    same_site="lax",
    https_only=False  # Change to True in production with HTTPS!
)

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

if not MONGO_URI or not MONGO_DB_NAME:
    raise ValueError("Missing MONGO_URI or MONGO_DB_NAME in .env file")

#Startup event - connect DB
@app.on_event("startup")
async def connect_to_mongo():
    app.state.mongo_client = AsyncIOMotorClient(MONGO_URI)
    app.state.db = app.state.mongo_client[MONGO_DB_NAME]
    print("Connected to MongoDB")

#Shutdown event - close DB connection
@app.on_event("shutdown")
async def close_mongo_connection():
    app.state.mongo_client.close()
    print("MongoDB connection closed")

@app.get("/")
async def root():
    return {"message": "ScholarMind AI backend is live 🚀"}
from fastapi import APIRouter, Request, HTTPException, Response, status
from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta
import secrets
from bson import ObjectId

from app.core.config import settings
from app.core import security
from app.services.email_service import send_otp_email
from app.services import google_oauth
from app.utils.db import get_db_from_request
from app.schema.auth_schemas import EmailCheckIn, SendOtpIn, VerifyOtpIn, UserOut

router = APIRouter(tags=["auth"])

@router.get("/")
async def health():
    return {"ok": True}

@router.post("/check-email")
async def check_email(payload: EmailCheckIn, request: Request):
    db = get_db_from_request(request)
    existing = await db.users.find_one({"email": payload.email.lower().strip()})
    return {"exists": bool(existing)}

@router.post("/send-otp")
async def send_otp(payload: SendOtpIn, request: Request):
    db = get_db_from_request(request)
    email = payload.email.lower().strip()

    otp = security.gen_otp()
    salt = secrets.token_urlsafe(16)
    otp_hash = security.hash_otp(otp, salt)
    expires_at = datetime.utcnow() + timedelta(seconds=settings.OTP_TTL_SECONDS)

    doc = {
        "email": email,
        "otp_hash": otp_hash,
        "salt": salt,
        "expires_at": expires_at,
        "tries": 0,
        "created_at": datetime.utcnow(),
    }

    await db.otps.update_one({"email": email}, {"$set": doc}, upsert=True)
    try:
        await send_otp_email(email, otp, payload.name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")
    return {"ok": True, "message": "OTP sent if email reachable"}

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    # authlib uses request.session — ensure SessionMiddleware is enabled 
    return await google_oauth.oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request):
    db = get_db_from_request(request)
    token = await google_oauth.oauth.google.authorize_access_token(request)
    userinfo = token.get("userinfo")
    if userinfo is None:
        try:
            userinfo = await google_oauth.oauth.google.parse_id_token(request, token)
        except Exception:
            userinfo = {}
    email = userinfo.get("email")
    name = userinfo.get("name")
    google_id = userinfo.get("sub")
    picture = userinfo.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Unable to retrieve email from Google")

    email = email.lower().strip()
    # generate and store OTP record
    otp = security.gen_otp()
    salt = secrets.token_urlsafe(16)
    otp_hash = security.hash_otp(otp, salt)
    expires_at = datetime.utcnow() + timedelta(seconds=settings.OTP_TTL_SECONDS)

    await db.otps.update_one(
        {"email": email},
        {"$set": {
            "email": email,
            "otp_hash": otp_hash,
            "salt": salt,
            "expires_at": expires_at,
            "tries": 0,
            "created_at": datetime.utcnow(),
            "pending_profile": {
                "google_id": google_id,
                "name": name,
                "picture": picture
            }
        }},
        upsert=True
    )

    try:
        await send_otp_email(email, otp, name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")

    redirect_target = f"{settings.FRONTEND_URL}verify-otp?email={email}&sendOtp=true"
    return RedirectResponse(url=redirect_target)

@router.post("/verify-otp")
async def verify_otp(payload: VerifyOtpIn, response: Response, request: Request):
    db = get_db_from_request(request)
    email = payload.email.lower().strip()
    rec = await db.otps.find_one({"email": email})
    if not rec:
        raise HTTPException(status_code=400, detail="OTP not found or expired")

    if rec.get("expires_at") is None or rec["expires_at"] < datetime.utcnow():
        await db.otps.delete_one({"email": email})
        raise HTTPException(status_code=400, detail="OTP expired")

    if rec.get("tries", 0) >= settings.OTP_MAX_TRIES:
        await db.otps.delete_one({"email": email})
        raise HTTPException(status_code=429, detail="Too many attempts")

    salt = rec.get("salt")
    if not salt:
        raise HTTPException(status_code=400, detail="Invalid OTP record")

    provided_hash = security.hash_otp(payload.otp, salt)
    if not security.constant_time_compare(provided_hash, rec.get("otp_hash", "")):
        await db.otps.update_one({"email": email}, {"$inc": {"tries": 1}})
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # create or update user
    user = await db.users.find_one({"email": email})
    now = datetime.utcnow()
    if not user:
        user_doc = {
            "email": email,
            "is_verified": True,
            "created_at": now,
            "updated_at": now
        }
        pending_profile = rec.get("pending_profile")
        if pending_profile:
            if pending_profile.get("google_id"):
                user_doc["google_id"] = pending_profile.get("google_id")
            if pending_profile.get("name"):
                user_doc["name"] = pending_profile.get("name")
            if pending_profile.get("picture"):
                user_doc["picture"] = pending_profile.get("picture")
        result = await db.users.insert_one(user_doc)
        user = await db.users.find_one({"_id": result.inserted_id})
    else:
        update_payload = {"is_verified": True, "updated_at": now}
        pending_profile = rec.get("pending_profile")
        if pending_profile and pending_profile.get("google_id"):
            update_payload["google_id"] = pending_profile.get("google_id")
        if pending_profile and pending_profile.get("name"):
            update_payload["name"] = pending_profile.get("name")
        if pending_profile and pending_profile.get("picture"):
            update_payload["picture"] = pending_profile.get("picture")
        await db.users.update_one({"_id": user["_id"]}, {"$set": update_payload})
        user = await db.users.find_one({"_id": user["_id"]})

    await db.otps.delete_one({"email": email})

    token = security.create_jwt({"sub": str(user["_id"]), "email": user["email"]})
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=settings.JWT_EXPIRES_SECONDS,
        path="/"
    )

    return {"ok": True, "email": user["email"]}

@router.get("/me")
async def me(request: Request):
    token = request.cookies.get(settings.AUTH_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        data = security.decode_jwt(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    sub = data.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    db = get_db_from_request(request)
    user = await db.users.find_one({"_id": ObjectId(sub)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user": UserOut(
            id=str(user["_id"]),
            email=user.get("email"),
            is_verified=user.get("is_verified", False),
            name=user.get("name"),
            google_id=user.get("google_id"),
            picture=user.get("picture"),
        ),
        "email": user["email"],
        "otpVerified": True,
        "onboardingComplete": False
    }

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(settings.AUTH_COOKIE_NAME, path="/")
    return {"ok": True}

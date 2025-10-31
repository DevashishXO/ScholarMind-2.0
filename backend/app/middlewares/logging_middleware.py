import time
import json
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("gateway-logger")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        try:
            # Read body (careful: can only read once, so we cache it)
            body_bytes = await request.body()
            body_str = body_bytes.decode("utf-8") if body_bytes else "{}"

            # Log incoming request (truncate if large)
            truncated_body = body_str[:1000] + ("..." if len(body_str) > 1000 else "")
            logger.info(f"➡️ Incoming {request.method} {request.url.path} | Body: {truncated_body}")

            # Continue with request
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000

            logger.info(f"✅ Completed {request.method} {request.url.path} | "
                        f"Status: {response.status_code} | Time: {process_time:.2f} ms")

            return response

        except Exception as e:
            logger.error(f"❌ Error processing {request.method} {request.url.path}: {str(e)}")
            return JSONResponse(status_code=500, content={"detail": "Internal server error"})

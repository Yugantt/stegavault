from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import Base, engine
from app.modules.auth import router as auth_router
from app.modules.auth.models import LoginLog, User  # noqa: F401
from app.modules.crypto import crypto
from app.modules.history import router as history_router
from app.modules.history.models import History  # noqa: F401
from app.modules.stego import LSBEngine, StegoService
from app.modules.stego.router import router as stego_router, set_stego_service
from app.shared.exceptions import AppError
from app.shared.logging import setup_logging

setup_logging()

_stego_service = StegoService(engine=LSBEngine(), crypto=crypto)
set_stego_service(_stego_service)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,
    lifespan=lifespan,
)

app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.code, "message": exc.message},
    )


app.include_router(auth_router, prefix="/api/v1")
app.include_router(stego_router, prefix="/api/v1")
app.include_router(history_router, prefix="/api/v1")


@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "app": settings.APP_NAME}

import asyncio
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.modules.auth.deps import get_current_user
from app.modules.auth.models import User
from app.modules.history.service import log_operation
from app.modules.media.image.validator import validate_image
from app.modules.stego.capacity import image_capacity_bytes
from app.modules.stego.service import StegoService

router = APIRouter(prefix="/stego", tags=["stego"])

_stego_service: StegoService | None = None


def set_stego_service(svc: StegoService) -> None:
    global _stego_service
    _stego_service = svc


def get_stego_service() -> StegoService:
    if _stego_service is None:
        raise RuntimeError("StegoService not initialized")
    return _stego_service


@router.post("/capacity")
async def capacity(
    cover: UploadFile = File(...),
    _: User = Depends(get_current_user),
):
    with tempfile.TemporaryDirectory() as tmp:
        cover_path = Path(tmp) / "cover.png"
        cover_path.write_bytes(await cover.read())
        validate_image(cover_path)
        max_bytes = await asyncio.to_thread(image_capacity_bytes, cover_path)
    return {"max_payload_bytes": max_bytes}


@router.post("/hide")
async def hide(
    cover: UploadFile = File(...),
    secret: str = Form(...),
    password: str | None = Form(None),
    current: User = Depends(get_current_user),
    service: StegoService = Depends(get_stego_service),
    db: AsyncSession = Depends(get_db),
):
    filename = cover.filename or "cover.png"
    stem = Path(filename).stem
    secret_bytes = secret.encode("utf-8")

    try:
        with tempfile.TemporaryDirectory() as tmp:
            cover_path = Path(tmp) / "cover.png"
            output_path = Path(tmp) / "stego.png"
            cover_path.write_bytes(await cover.read())
            validate_image(cover_path)

            result = await asyncio.to_thread(
                service.hide, cover_path, secret_bytes, password, output_path
            )
            stego_bytes = output_path.read_bytes()
    except Exception as e:
        await log_operation(
            db,
            user_id=current.id,
            module="image",
            action="hide",
            filename=filename,
            status="failed",
        )
        raise e

    out_name = f"{stem}_veiled.png"

    await log_operation(
        db,
        user_id=current.id,
        module="image",
        action="hide",
        filename=filename,
        output_filename=out_name,
        message_length=len(secret_bytes),
        file_size=len(stego_bytes),
    )

    return Response(
        content=stego_bytes,
        media_type="image/png",
        headers={
            "Content-Disposition": f'attachment; filename="{out_name}"',
            "X-StegaVault-Encrypted": str(result["encrypted"]).lower(),
            "X-StegaVault-Payload-Bytes": str(result["payload_bytes"]),
        },
    )


@router.post("/extract")
async def extract(
    stego: UploadFile = File(...),
    password: str | None = Form(None),
    current: User = Depends(get_current_user),
    service: StegoService = Depends(get_stego_service),
    db: AsyncSession = Depends(get_db),
):
    filename = stego.filename or "stego.png"
    file_bytes = await stego.read()

    try:
        with tempfile.TemporaryDirectory() as tmp:
            stego_path = Path(tmp) / "stego.png"
            stego_path.write_bytes(file_bytes)
            validate_image(stego_path)
            result = await asyncio.to_thread(service.extract, stego_path, password)
    except Exception as e:
        await log_operation(
            db,
            user_id=current.id,
            module="image",
            action="extract",
            filename=filename,
            file_size=len(file_bytes),
            status="failed",
        )
        raise e

    await log_operation(
        db,
        user_id=current.id,
        module="image",
        action="extract",
        filename=filename,
        message_length=len(result["secret"]),
        file_size=len(file_bytes),
    )

    return {
        "secret": result["secret"].decode("utf-8", errors="replace"),
        "encrypted": result["encrypted"],
        "compressed": result["compressed"],
        "bytes": len(result["secret"]),
    }

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.modules.auth.deps import get_current_user
from app.modules.auth.models import User
from app.modules.history.schemas import HistoryList, HistoryStats
from app.modules.history.service import delete_entry, get_stats, list_history

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=HistoryList)
async def get_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    module: str | None = Query(None),
    action: str | None = Query(None),
    current: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await list_history(
        db,
        user_id=current.id,
        limit=limit,
        offset=offset,
        module=module,
        action=action,
    )


@router.get("/stats", response_model=HistoryStats)
async def stats(
    current: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_stats(db, user_id=current.id)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    entry_id: UUID,
    current: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ok = await delete_entry(db, user_id=current.id, entry_id=entry_id)
    if not ok:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Entry not found")
    return None

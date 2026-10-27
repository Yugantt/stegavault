import logging
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.history.models import History
from app.modules.history.schemas import HistoryList, HistoryStats

logger = logging.getLogger(__name__)


async def log_operation(
    db: AsyncSession,
    *,
    user_id: UUID,
    module: str,
    action: str,
    filename: str,
    output_filename: str | None = None,
    message_length: int = 0,
    file_size: int = 0,
    status: str = "success",
) -> History | None:
    """Insert one audit row. Never raises - logging must not break user flow."""
    try:
        row = History(
            user_id=user_id,
            module=module,
            action=action,
            filename=filename,
            output_filename=output_filename,
            message_length=message_length,
            file_size=file_size,
            status=status,
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row
    except Exception as e:  # noqa: BLE001
        await db.rollback()
        logger.warning("History log failed: %s", e)
        return None


async def list_history(
    db: AsyncSession,
    *,
    user_id: UUID,
    limit: int = 50,
    offset: int = 0,
    module: str | None = None,
    action: str | None = None,
) -> HistoryList:
    stmt = select(History).where(History.user_id == user_id)
    if module:
        stmt = stmt.where(History.module == module)
    if action:
        stmt = stmt.where(History.action == action)

    total_result = await db.execute(
        select(func.count()).select_from(stmt.subquery())
    )
    total = total_result.scalar_one()

    stmt = stmt.order_by(History.created_at.desc()).limit(limit).offset(offset)
    rows = (await db.execute(stmt)).scalars().all()

    return HistoryList(total=total, limit=limit, offset=offset, items=rows)


async def get_stats(db: AsyncSession, *, user_id: UUID) -> HistoryStats:
    total = (
        await db.execute(
            select(func.count()).where(History.user_id == user_id)
        )
    ).scalar_one()

    hides = (
        await db.execute(
            select(func.count()).where(
                History.user_id == user_id, History.action == "hide"
            )
        )
    ).scalar_one()

    extracts = (
        await db.execute(
            select(func.count()).where(
                History.user_id == user_id, History.action == "extract"
            )
        )
    ).scalar_one()

    failures = (
        await db.execute(
            select(func.count()).where(
                History.user_id == user_id, History.status == "failed"
            )
        )
    ).scalar_one()

    return HistoryStats(
        total_operations=total,
        hides=hides,
        extracts=extracts,
        failures=failures,
    )


async def delete_entry(db: AsyncSession, *, user_id: UUID, entry_id: UUID) -> bool:
    result = await db.execute(
        select(History).where(
            History.id == entry_id, History.user_id == user_id
        )
    )
    row = result.scalar_one_or_none()
    if row is None:
        return False
    await db.delete(row)
    await db.commit()
    return True

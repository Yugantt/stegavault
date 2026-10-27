from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class HistoryEntry(BaseModel):
    id: UUID
    module: str
    action: str
    filename: str
    output_filename: str | None
    message_length: int
    file_size: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class HistoryList(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[HistoryEntry]


class HistoryStats(BaseModel):
    total_operations: int
    hides: int
    extracts: int
    failures: int

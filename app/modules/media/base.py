from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any


class MediaHandler(ABC):
    @abstractmethod
    def validate(self, path: Path) -> None:
        """Raise exception if invalid."""
        ...

    @abstractmethod
    def load(self, path: Path) -> Any: ...

    @abstractmethod
    def save(self, data: Any, path: Path) -> None: ...

    @abstractmethod
    def preview(self, path: Path, max_size: int = 400) -> bytes:
        """Return thumbnail bytes."""
        ...

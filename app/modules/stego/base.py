from abc import ABC, abstractmethod
from pathlib import Path


class StegoEngine(ABC):
    @abstractmethod
    def capacity_bits(self, cover: Path) -> int: ...

    @abstractmethod
    def embed(self, cover: Path, payload: bytes, output: Path) -> None: ...

    @abstractmethod
    def extract(self, stego: Path) -> bytes: ...

    @abstractmethod
    def detect(self, file_path: Path) -> float: ...

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class EncryptedPayload:
    """Encrypted output: ciphertext + params needed for decrypt."""
    ciphertext: bytes
    nonce: bytes
    salt: bytes

    def to_bytes(self) -> bytes:
        """Wire format: salt(16) + nonce(12) + ciphertext."""
        return self.salt + self.nonce + self.ciphertext

    @classmethod
    def from_bytes(cls, data: bytes) -> "EncryptedPayload":
        if len(data) < 28:
            raise ValueError("Payload too short")
        return cls(
            salt=data[:16],
            nonce=data[16:28],
            ciphertext=data[28:],
        )


class CryptoEngine(ABC):
    @abstractmethod
    def encrypt(self, plaintext: bytes, password: str) -> EncryptedPayload: ...

    @abstractmethod
    def decrypt(self, payload: EncryptedPayload, password: str) -> bytes: ...

    @abstractmethod
    def encrypt_blob(self, plaintext: bytes, password: str) -> bytes: ...

    @abstractmethod
    def decrypt_blob(self, blob: bytes, password: str) -> bytes: ...

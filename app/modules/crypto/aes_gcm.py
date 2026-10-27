import os

from argon2.low_level import Type, hash_secret_raw
from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.config import settings
from app.modules.crypto.interface import CryptoEngine, EncryptedPayload


class AESGCMCrypto(CryptoEngine):
    SALT_SIZE = 16
    NONCE_SIZE = 12
    KEY_SIZE = 32

    def _derive_key(self, password: str, salt: bytes) -> bytes:
        return hash_secret_raw(
            secret=password.encode("utf-8"),
            salt=salt,
            time_cost=settings.ARGON2_TIME_COST,
            memory_cost=settings.ARGON2_MEMORY_COST,
            parallelism=settings.ARGON2_PARALLELISM,
            hash_len=self.KEY_SIZE,
            type=Type.ID,
        )

    def encrypt(self, plaintext: bytes, password: str) -> EncryptedPayload:
        salt = os.urandom(self.SALT_SIZE)
        nonce = os.urandom(self.NONCE_SIZE)
        key = self._derive_key(password, salt)
        aesgcm = AESGCM(key)
        ciphertext = aesgcm.encrypt(nonce, plaintext, None)
        return EncryptedPayload(ciphertext=ciphertext, nonce=nonce, salt=salt)

    def decrypt(self, payload: EncryptedPayload, password: str) -> bytes:
        key = self._derive_key(password, payload.salt)
        aesgcm = AESGCM(key)
        try:
            return aesgcm.decrypt(payload.nonce, payload.ciphertext, None)
        except InvalidTag as e:
            raise ValueError("Wrong password or corrupted data") from e

    def encrypt_blob(self, plaintext: bytes, password: str) -> bytes:
        return self.encrypt(plaintext, password).to_bytes()

    def decrypt_blob(self, blob: bytes, password: str) -> bytes:
        return self.decrypt(EncryptedPayload.from_bytes(blob), password)


crypto = AESGCMCrypto()

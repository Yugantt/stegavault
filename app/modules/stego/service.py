import zlib
from pathlib import Path

from app.modules.crypto import CryptoEngine
from app.modules.stego import payload as p
from app.modules.stego.base import StegoEngine
from app.modules.stego.exceptions import (
    CapacityExceededError,
    PasswordRequiredError,
)


class StegoService:
    def __init__(self, engine: StegoEngine, crypto: CryptoEngine):
        self.engine = engine
        self.crypto = crypto

    def hide(self, cover, secret, password, output):
        flags = 0

        compressed = zlib.compress(secret, level=9)
        if len(compressed) < len(secret):
            body = compressed
            flags |= p.FLAG_COMPRESSED
        else:
            body = secret

        if password:
            body = self.crypto.encrypt_blob(body, password)
            flags |= p.FLAG_ENCRYPTED

        wrapped = p.wrap(body, flags=flags)

        cap = self.engine.capacity_bits(cover)
        needed = len(wrapped) * 8
        if needed > cap:
            raise CapacityExceededError(
                f"Needs {needed} bits, cover holds {cap} bits"
            )

        self.engine.embed(cover, wrapped, output)

        return {
            "encrypted": bool(flags & p.FLAG_ENCRYPTED),
            "compressed": bool(flags & p.FLAG_COMPRESSED),
            "payload_bytes": len(wrapped),
            "capacity_bytes": cap // 8,
        }

    def extract(self, stego, password):
        wrapped = self.engine.extract(stego)
        flags, body = p.unwrap(wrapped)

        if flags & p.FLAG_ENCRYPTED:
            if not password:
                raise PasswordRequiredError("Password required")
            body = self.crypto.decrypt_blob(body, password)

        if flags & p.FLAG_COMPRESSED:
            body = zlib.decompress(body)

        return {
            "secret": body,
            "encrypted": bool(flags & p.FLAG_ENCRYPTED),
            "compressed": bool(flags & p.FLAG_COMPRESSED),
        }

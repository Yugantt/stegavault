from pathlib import Path

import numpy as np
from PIL import Image

from app.modules.stego.base import StegoEngine
from app.modules.stego.capacity import image_capacity_bits
from app.modules.stego.exceptions import (
    CapacityExceededError,
    CorruptedPayloadError,
    NoHiddenDataError,
)
from app.modules.stego.payload import HEADER_SIZE, MAGIC_SIZE, MAGIC, parse_header


class LSBEngine(StegoEngine):
    def capacity_bits(self, cover: Path) -> int:
        return image_capacity_bits(cover)

    def embed(self, cover: Path, payload: bytes, output: Path) -> None:
        with Image.open(cover) as im:
            img = np.array(im.convert("RGB"))

        bits = np.unpackbits(np.frombuffer(payload, dtype=np.uint8))
        if len(bits) > img.size:
            raise CapacityExceededError(
                f"Payload needs {len(bits)} bits, cover holds {img.size}"
            )

        flat = img.flatten()
        flat[: len(bits)] = (flat[: len(bits)] & 0xFE) | bits
        out = flat.reshape(img.shape)

        Image.fromarray(out).save(output, format="PNG")

    def extract(self, stego: Path) -> bytes:
        with Image.open(stego) as im:
            img = np.array(im.convert("RGB"))

        flat = img.flatten()
        header_bits = HEADER_SIZE * 8
        if flat.size < header_bits:
            raise NoHiddenDataError("File too small to contain payload")

        header = np.packbits(flat[:header_bits] & 1).tobytes()

        if header[:MAGIC_SIZE] != MAGIC:
            raise NoHiddenDataError("No StegaVault payload detected")

        try:
            flags, body_length = parse_header(header)
        except ValueError as e:
            raise CorruptedPayloadError(f"Bad header: {e}") from e

        total_bits = header_bits + body_length * 8
        if flat.size < total_bits:
            raise CorruptedPayloadError("Payload truncated")

        # Return FULL wrapped payload (header + body), not just body
        all_bits = flat[:total_bits] & 1
        return np.packbits(all_bits).tobytes()

    def detect(self, file_path: Path) -> float:
        try:
            self.extract(file_path)
            return 1.0
        except Exception:
            return 0.0

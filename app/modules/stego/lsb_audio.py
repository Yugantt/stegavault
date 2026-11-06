import numpy as np
from io import BytesIO
import soundfile as sf

MAGIC = b"SVENC1:"  # 7 bytes — same as image payload format


class LSBAudioEngine:
    """LSB steganography for WAV audio files using soundfile (handles MP3 metadata)."""

    def _read(self, audio_bytes: bytes):
        data, sr = sf.read(BytesIO(audio_bytes), dtype="int16")
        return sr, data

    def _write(self, sr: int, data: np.ndarray) -> bytes:
        out = BytesIO()
        sf.write(out, data, sr, format="WAV", subtype="PCM_16")
        return out.getvalue()

    def capacity_bits(self, audio_bytes: bytes) -> int:
        _, data = self._read(audio_bytes)
        return int(data.size)

    def capacity_bytes(self, audio_bytes: bytes) -> int:
        return self.capacity_bits(audio_bytes) // 8

    def embed(self, audio_bytes: bytes, payload: bytes) -> bytes:
        sr, data = self._read(audio_bytes)
        bits = np.unpackbits(np.frombuffer(payload, dtype=np.uint8))
        flat = data.flatten().astype(np.int16)

        if len(bits) > len(flat):
            raise ValueError(f"Payload too large: need {len(bits)} bits, audio has {len(flat)} samples")

        flat[: len(bits)] = (flat[: len(bits)] & ~1) | bits.astype(np.int16)
        data = flat.reshape(data.shape)
        return self._write(sr, data)

    def extract_bits(self, audio_bytes: bytes, n_bits: int) -> bytes:
        _, data = self._read(audio_bytes)
        flat = data.flatten().astype(np.int16)

        if n_bits > len(flat):
            raise ValueError(f"Not enough samples: need {n_bits}, have {len(flat)}")

        bits = (flat[:n_bits] & 1).astype(np.uint8)
        return np.packbits(bits).tobytes()

    def detect(self, audio_bytes: bytes) -> bool:
        try:
            header = self.extract_bits(audio_bytes, len(MAGIC) * 8)
            return header == MAGIC
        except Exception:
            return False

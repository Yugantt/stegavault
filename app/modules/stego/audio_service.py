import tempfile
from pathlib import Path
from pydub import AudioSegment
from app.modules.stego.lsb_audio import LSBAudioEngine, MAGIC

class AudioStegoService:
    def __init__(self):
        self.engine = LSBAudioEngine()

    def _to_wav(self, input_path: Path, output_path: Path):
        audio = AudioSegment.from_file(input_path)
        audio = audio.set_sample_width(2)          # 16-bit PCM
        audio = audio.set_channels(1)              # Mono (simplifies LSB)
        audio = audio.set_frame_rate(44100)        # Standard rate
        # Export with explicit codec + no tags
        audio.export(
            output_path,
            format="wav",
            codec="pcm_s16le",
            parameters=["-map_metadata", "-1"],   # strip ALL metadata
        )

    def _to_mp3(self, input_wav: Path, output_mp3: Path):
        audio = AudioSegment.from_wav(input_wav)
        audio.export(output_mp3, format="mp3", bitrate="192k")

    def hide(self, cover_path: Path, secret_bytes: bytes, password: str | None, output_path: Path) -> dict:
        ext = cover_path.suffix.lower()
        with tempfile.TemporaryDirectory() as tmp:
            work_wav = Path(tmp) / "work.wav"
            
            if ext != ".wav":
                self._to_wav(cover_path, work_wav)
            else:
                work_wav = cover_path

            payload = secret_bytes
            flags = 0
            if password:
                from app.modules.crypto.aes_gcm import crypto
                payload = crypto.encrypt_blob(payload, password)
                flags |= 0x01

            header = MAGIC + bytes([flags]) + len(payload).to_bytes(4, "big")
            wire = header + payload

            stego_wav_bytes = self.engine.embed(work_wav.read_bytes(), wire)
            stego_wav_path = Path(tmp) / "stego.wav"
            stego_wav_path.write_bytes(stego_wav_bytes)

            if ext == ".wav":
                output_path.write_bytes(stego_wav_bytes)
            else:
                self._to_mp3(stego_wav_path, output_path)

            return {"encrypted": bool(password), "payload_bytes": len(payload)}

    def extract(self, stego_path: Path, password: str | None) -> dict:
        ext = stego_path.suffix.lower()
        with tempfile.TemporaryDirectory() as tmp:
            work_wav = Path(tmp) / "work.wav"
            
            if ext != ".wav":
                self._to_wav(stego_path, work_wav)
            else:
                work_wav = stego_path

            data = work_wav.read_bytes()
            
            if not self.engine.detect(data):
                raise ValueError("No hidden data found in this audio")

            header_bytes = self.engine.extract_bits(data, 12 * 8)
            if len(header_bytes) < 12 or header_bytes[:7] != MAGIC:
                raise ValueError("Corrupted payload header")

            flags = header_bytes[7]
            length = int.from_bytes(header_bytes[8:12], "big")

            if length <= 0 or length > 50_000_000:
                raise ValueError("Invalid payload length")

            all_bytes = self.engine.extract_bits(data, (12 + length) * 8)
            body = all_bytes[12 : 12 + length]
            
            encrypted = bool(flags & 0x01)
            
            if encrypted:
                if not password:
                    raise ValueError("Password required")
                from app.modules.crypto.aes_gcm import crypto
                try:
                    body = crypto.decrypt_blob(body, password)
                except Exception:
                    raise ValueError("Incorrect password or corrupted data")

            return {"secret": body, "encrypted": encrypted, "compressed": False}


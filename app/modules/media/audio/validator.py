from pathlib import Path
from pydantic import BaseModel
import puremagic

ALLOWED_AUDIO_MIMES = {
    "audio/wav", "audio/x-wav", "audio/wave",
    "audio/mpeg", "audio/mp3"
}

class ValidatedAudio(BaseModel):
    data: bytes
    mime: str
    ext: str
    size: int

def validate_audio(content: bytes, filename: str) -> ValidatedAudio:
    if not content:
        raise ValueError("Empty file")

    # Detect by magic bytes — more robust than puremagic for MP3
    if content[:4] == b"RIFF":
        mime = "audio/wav"
    elif content[:3] == b"ID3" or content[:2] == b"\xff\xfb":
        mime = "audio/mpeg"  # MP3
    else:
        try:
            mime = puremagic.from_string(content, mime=True)
        except puremagic.PureError:
            raise ValueError(f"Could not detect file type for '{filename}'")

    if mime not in ALLOWED_AUDIO_MIMES:
        raise ValueError(f"Unsupported audio format: {mime}. Only WAV/MP3 allowed.")

    ext = Path(filename).suffix.lower() or ".wav"
    return ValidatedAudio(data=content, mime=mime, ext=ext, size=len(content))

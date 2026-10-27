from io import BytesIO
from pathlib import Path

from PIL import Image


def generate_preview(path: Path, max_size: int = 400) -> bytes:
    """Generate WebP thumbnail (small payload for slow internet)."""
    with Image.open(path) as img:
        img = img.convert("RGB")
        img.thumbnail((max_size, max_size))

        buf = BytesIO()
        img.save(buf, format="WEBP", quality=80, method=4)
        return buf.getvalue()

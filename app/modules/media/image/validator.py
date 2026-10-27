from pathlib import Path

import puremagic

from app.config import settings
from app.shared.exceptions import ValidationError

ALLOWED_MIME = {"image/png", "image/jpeg", "image/bmp"}


def validate_image(path: Path, max_mb: int | None = None) -> str:
    """Validate image by magic bytes + size. Returns MIME type."""
    if not path.exists():
        raise ValidationError("File does not exist")

    size_mb = path.stat().st_size / (1024 * 1024)
    limit = max_mb or settings.MAX_IMAGE_SIZE_MB
    if size_mb > limit:
        raise ValidationError(f"File too large ({size_mb:.1f} MB > {limit} MB)")

    try:
        mime = puremagic.from_file(str(path), mime=True)
    except puremagic.PureError as e:
        raise ValidationError(f"Cannot detect file type: {e}") from e

    if mime not in ALLOWED_MIME:
        raise ValidationError(
            f"Unsupported format: {mime}. Allowed: PNG, JPEG, BMP"
        )

    return mime

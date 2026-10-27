from pathlib import Path

import numpy as np
from PIL import Image

from app.modules.media.base import MediaHandler
from app.modules.media.image.preview import generate_preview
from app.modules.media.image.validator import validate_image


class ImageHandler(MediaHandler):
    def validate(self, path: Path) -> None:
        validate_image(path)

    def load(self, path: Path) -> Image.Image:
        self.validate(path)
        return Image.open(path).convert("RGB")

    def load_array(self, path: Path) -> np.ndarray:
        return np.array(self.load(path))

    def save(self, data: Image.Image | np.ndarray, path: Path) -> None:
        if isinstance(data, np.ndarray):
            data = Image.fromarray(data)
        data.save(path, format="PNG", optimize=True)

    def preview(self, path: Path, max_size: int = 400) -> bytes:
        return generate_preview(path, max_size)


image_handler = ImageHandler()

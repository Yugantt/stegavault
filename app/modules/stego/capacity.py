from pathlib import Path

from PIL import Image

from app.modules.stego.payload import HEADER_SIZE


def image_capacity_bits(path: Path) -> int:
    with Image.open(path) as img:
        w, h = img.size
    return w * h * 3


def image_capacity_bytes(path: Path) -> int:
    total_bits = image_capacity_bits(path)
    overhead_bits = HEADER_SIZE * 8
    if total_bits < overhead_bits:
        return 0
    return (total_bits - overhead_bits) // 8

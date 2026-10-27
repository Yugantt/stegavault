"""Payload wire format.

Layout (12-byte header + body):
    [ MAGIC (7 bytes) ][ FLAGS (1 byte) ][ LENGTH (4 bytes BE) ][ BODY (N bytes) ]
"""

MAGIC = b"SVENC1:"
MAGIC_SIZE = len(MAGIC)
FLAGS_SIZE = 1
LENGTH_SIZE = 4
HEADER_SIZE = MAGIC_SIZE + FLAGS_SIZE + LENGTH_SIZE  # 12

FLAG_ENCRYPTED = 0x01
FLAG_COMPRESSED = 0x02


def wrap(body: bytes, *, flags: int) -> bytes:
    if len(body) > 0xFFFFFFFF:
        raise ValueError("Payload too large (>4 GiB)")
    header = MAGIC + bytes([flags]) + len(body).to_bytes(LENGTH_SIZE, "big")
    return header + body


def unwrap(data: bytes) -> tuple[int, bytes]:
    if len(data) < HEADER_SIZE:
        raise ValueError("Payload too short")
    if data[:MAGIC_SIZE] != MAGIC:
        raise ValueError("Bad magic")
    flags = data[MAGIC_SIZE]
    length = int.from_bytes(data[MAGIC_SIZE + FLAGS_SIZE : HEADER_SIZE], "big")
    body = data[HEADER_SIZE : HEADER_SIZE + length]
    if len(body) != length:
        raise ValueError("Truncated body")
    return flags, body


def parse_header(header: bytes) -> tuple[int, int]:
    if len(header) < HEADER_SIZE or header[:MAGIC_SIZE] != MAGIC:
        raise ValueError("Bad header")
    flags = header[MAGIC_SIZE]
    length = int.from_bytes(header[MAGIC_SIZE + FLAGS_SIZE : HEADER_SIZE], "big")
    return flags, length

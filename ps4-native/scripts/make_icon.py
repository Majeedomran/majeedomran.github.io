#!/usr/bin/env python3
"""Generate a small original M4 HUB PS4 icon using only Python's standard library."""
import struct
import zlib
import sys

W = H = 512
pixels = bytearray()
glyphs = {
    "M": ["10001","11011","10101","10101","10001","10001","10001"],
    "4": ["00010","00110","01010","10010","11111","00010","00010"],
}
def blend(base, overlay, amount):
    return tuple(int(base[i] * (1 - amount) + overlay[i] * amount) for i in range(3))

for y in range(H):
    pixels.append(0)
    for x in range(W):
        t = y / (H - 1)
        base = blend((7, 14, 27), (13, 38, 55), t)
        # Soft teal central panel
        if 62 <= x < 450 and 62 <= y < 450:
            edge = min(x - 62, 449 - x, y - 62, 449 - y)
            if edge < 8:
                base = (35, 201, 184)
            else:
                base = (16, 31, 49)
        # Simple geometric M4 lettering, centered and blocky
        for char, ox in (("M", 148), ("4", 278)):
            if 0 <= x - ox < 5 * 18 and 0 <= y - 170 < 7 * 18:
                gx = (x - ox) // 18
                gy = (y - 170) // 18
                if glyphs[char][gy][gx] == "1":
                    base = (239, 250, 250)
        # Accent bar
        if 142 <= x < 370 and 330 <= y < 342:
            base = (35, 201, 184)
        pixels.extend((*base, 255))

def chunk(kind, data):
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xffffffff)

raw = bytes(pixels)
png = b"\x89PNG\r\n\x1a\n"
png += chunk(b"IHDR", struct.pack(">2I5B", W, H, 8, 6, 0, 0, 0))
png += chunk(b"IDAT", zlib.compress(raw, 9))
png += chunk(b"IEND", b"")
with open(sys.argv[1] if len(sys.argv) > 1 else "sce_sys/icon0.png", "wb") as f:
    f.write(png)

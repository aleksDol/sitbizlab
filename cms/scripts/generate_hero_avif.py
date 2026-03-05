#!/usr/bin/env python3
"""
One-off script: generate AVIF versions of MiniApps hero images from WebP.
Run from repo root: python cms/scripts/generate_hero_avif.py
Requires: pip install pillow-avif-plugin
"""
from pathlib import Path

import pillow_avif  # noqa: F401 - registers AVIF with Pillow
from PIL import Image

ASSETS_DIR = Path(__file__).resolve().parent.parent / "pages" / "static" / "site" / "assets"
HERO_FILES = [
    "hero-img-miniApp.webp",
    "hero-img-miniApp-mobile.webp",
]

AVIF_QUALITY = 75  # balance size/quality
AVIF_SPEED = 6    # 0=slower/better, 10=faster


def main():
    if not ASSETS_DIR.is_dir():
        print(f"Assets dir not found: {ASSETS_DIR}")
        return 1
    for name in HERO_FILES:
        src = ASSETS_DIR / name
        if not src.is_file():
            print(f"Skip (missing): {src}")
            continue
        out_name = name.replace(".webp", ".avif")
        dst = ASSETS_DIR / out_name
        try:
            img = Image.open(src)
            img.save(dst, "AVIF", quality=AVIF_QUALITY, speed=AVIF_SPEED)
            a, b = src.stat().st_size, dst.stat().st_size
            pct = (1 - b / a) * 100 if a else 0
            print(f"OK: {name} -> {out_name}  ({a // 1024} KB -> {b // 1024} KB, -{pct:.0f}%)")
        except Exception as e:
            print(f"Error {name}: {e}")
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

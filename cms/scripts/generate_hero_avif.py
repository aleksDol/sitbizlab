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
# (filename, max_width or None, quality_avif, quality_webp for resized)
# max_width = resize for LCP (mobile viewport); None = no resize
HERO_CONFIG = [
    ("hero-img-miniApp.webp", None, 75, None),           # desktop
    ("hero-img-miniApp-mobile.webp", 828, 65, 78),       # mobile: resize + lower size for LCP
]

AVIF_SPEED = 6  # 0=slower/better, 10=faster


def main():
    if not ASSETS_DIR.is_dir():
        print(f"Assets dir not found: {ASSETS_DIR}")
        return 1
    for item in HERO_CONFIG:
        name = item[0]
        max_width, q_avif, q_webp = item[1], item[2], item[3]
        src = ASSETS_DIR / name
        if not src.is_file():
            print(f"Skip (missing): {src}")
            continue
        try:
            img = Image.open(src).convert("RGB")
            orig_size = src.stat().st_size
            if max_width and img.width > max_width:
                ratio = max_width / img.width
                new_h = int(img.height * ratio)
                img = img.resize((max_width, new_h), Image.Resampling.LANCZOS)
                print(f"Resized to {max_width}px width")
            out_avif = ASSETS_DIR / name.replace(".webp", ".avif")
            img.save(out_avif, "AVIF", quality=q_avif, speed=AVIF_SPEED)
            size_avif = out_avif.stat().st_size
            print(f"OK: {name} -> {out_avif.name}  ({orig_size // 1024} KB -> {size_avif // 1024} KB)")
            if q_webp is not None and max_width:
                img.save(src, "WEBP", quality=q_webp, method=6)
                print(f"    WebP overwritten at quality {q_webp}  ({src.stat().st_size // 1024} KB)")
        except Exception as e:
            print(f"Error {name}: {e}")
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

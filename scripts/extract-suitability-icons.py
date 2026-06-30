"""
Extract the suitability symbol baked into the top-left of legacy product feature images
(green house = outdoor, blue wall+floor = wall/floor, red wall = wall-only) and emit them as
standalone transparent PNG overlay layers.

Why: the icons are currently embedded in the photography. To layer suitability onto product
images programmatically (and to one day ship clean photos without the baked-in mark), we need
the icons as their own assets. This is the extraction half of that work — the clean-photo half
comes later.

Method per image:
  1. crop the top-left region (icons always sit there over the white page margin)
  2. classify the dominant icon hue (red / green / blue) from saturated pixels
  3. for the chosen representative per class: trim to the icon's bounding box, then flood-fill
     near-white from the border to alpha 0 (keeps interior whites, e.g. mortar lines)

Run:  python scripts/extract-suitability-icons.py
"""

from __future__ import annotations

import glob
import os
import re
from collections import deque

from PIL import Image

MEDIA = os.path.join("apps", "cms", "media")
OUT_DIRS = [
    os.path.join("packages", "ui", "assets", "suitability"),
    os.path.join("apps", "web", "public", "suitability"),
]

# Skip the resized derivatives Payload generated; we only want the master feature images.
SIZE_SUFFIX = re.compile(r"-\d+x\d+(?:x\d+)?(?:-\d+)?\.png$", re.IGNORECASE)


def is_master_fi(name: str) -> bool:
    base = os.path.basename(name)
    if "F.I" not in base and "F-I" not in base:
        return False
    # Allow the canonical size token in the product name, but drop the small thumbnails.
    return not re.search(r"-(?:150x150|300x\d+|400x\d+|768x768)\.png$", base, re.IGNORECASE)


def classify(crop: Image.Image) -> tuple[str | None, dict[str, int]]:
    """Return (class, counts) by counting saturated red/green/blue-dominant pixels."""
    counts = {"red": 0, "green": 0, "blue": 0}
    px = crop.load()
    w, h = crop.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y][:3]
            mx, mn = max(r, g, b), min(r, g, b)
            if mx - mn < 45:  # too grey/white/black to be the coloured icon
                continue
            if mx < 60:  # near-black outline; ignore
                continue
            if r == mx and r - g > 30 and r - b > 30:
                counts["red"] += 1
            elif g == mx and g - r > 20 and g - b > 10:
                counts["green"] += 1
            elif b == mx and b - r > 20 and b - g > 10:
                counts["blue"] += 1
    best = max(counts, key=counts.get)
    return (best if counts[best] > 40 else None), counts


def _row_has_colour(px, w: int, y: int) -> bool:
    for x in range(w):
        r, g, b = px[x, y][:3]
        if max(r, g, b) - min(r, g, b) >= 40 and max(r, g, b) >= 60:
            return True
    return False


def icon_band(crop: Image.Image, gap_rows: int = 6) -> int:
    """Bottom y of the top-left icon, cut at the first white gap before the tile starts.

    The icon sits in the white top margin; the tile photo below also has saturated pixels
    (e.g. wood/terrazzo) that would otherwise pollute the bbox. Walking down from the icon's
    first coloured row and stopping at a run of blank rows isolates the icon from the tile.
    """
    px = crop.load()
    w, h = crop.size
    top = next((y for y in range(h) if _row_has_colour(px, w, y)), None)
    if top is None:
        return h
    blanks = 0
    for y in range(top, h):
        if _row_has_colour(px, w, y):
            blanks = 0
        else:
            blanks += 1
            if blanks >= gap_rows:
                return y - gap_rows + 1
    return h


def color_bbox(crop: Image.Image) -> tuple[int, int, int, int] | None:
    px = crop.load()
    w, _ = crop.size
    h = icon_band(crop)
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y][:3]
            mx, mn = max(r, g, b), min(r, g, b)
            if mx - mn >= 40 and mx >= 60:
                xs.append(x)
                ys.append(y)
    if not xs:
        return None
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def flood_transparent(img: Image.Image) -> Image.Image:
    """RGBA copy with border-connected near-white pixels set to alpha 0."""
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size

    def near_white(x: int, y: int) -> bool:
        r, g, b, _ = px[x, y]
        return min(r, g, b) >= 228 and (max(r, g, b) - min(r, g, b)) <= 22

    seen = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            if near_white(x, y):
                q.append((x, y))
                seen[y][x] = True
    for y in range(h):
        for x in (0, w - 1):
            if near_white(x, y) and not seen[y][x]:
                q.append((x, y))
                seen[y][x] = True
    while q:
        x, y = q.popleft()
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and near_white(nx, ny):
                seen[ny][nx] = True
                q.append((nx, ny))
    return img


def main() -> None:
    files = [f for f in glob.glob(os.path.join(MEDIA, "*.png")) if is_master_fi(f)]
    # class -> (score, filename)
    best: dict[str, tuple[int, str]] = {}
    print(f"Scanning {len(files)} feature images…")
    for f in files:
        try:
            im = Image.open(f).convert("RGB")
        except Exception as e:  # noqa: BLE001
            print("  skip", os.path.basename(f), e)
            continue
        w, h = im.size
        crop = im.crop((0, 0, int(w * 0.30), int(h * 0.30)))
        cls, counts = classify(crop)
        if cls is None:
            continue
        score = counts[cls]
        if cls not in best or score > best[cls][0]:
            best[cls] = (score, f)

    label_map = {"green": "outdoor", "blue": "wall-floor", "red": "wall"}
    for d in OUT_DIRS:
        os.makedirs(d, exist_ok=True)

    print("\nChosen representatives:")
    for hue, label in label_map.items():
        if hue not in best:
            print(f"  {label:11s} ({hue}): NONE FOUND")
            continue
        score, f = best[hue]
        print(f"  {label:11s} ({hue}): {os.path.basename(f)}  [score {score}]")
        im = Image.open(f).convert("RGB")
        w, h = im.size
        region = im.crop((0, 0, int(w * 0.30), int(h * 0.30)))
        bb = color_bbox(region)
        if bb is None:
            continue
        pad = 8
        x0 = max(0, bb[0] - pad)
        y0 = max(0, bb[1] - pad)
        x1 = min(region.size[0], bb[2] + pad)
        y1 = min(region.size[1], bb[3] + pad)
        icon = region.crop((x0, y0, x1, y1))
        icon = flood_transparent(icon)
        for d in OUT_DIRS:
            icon.save(os.path.join(d, f"{label}.png"))
    print("\nDone.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Сборка hero-анимации «Свободное пространство».

Что делает:
  1. Вырезает скетч стадиона из source.png, переводит тушь в альфа-канал
     и делит его на два слоя: контуры (sketch-lines.webp) и тонкую
     штриховку (sketch-hatch.webp).
  2. Переводит надпись в кривые (Roboto Condensed 500, OFL), каждую букву
     отдельным <path>, и ставит буквы по центрам букв оригинала.
  3. Собирает ../hero/index.html со встроенным SVG (стили в hero.css).

Запуск:  python3 build.py        (нужны Pillow, numpy, fonttools)
"""
import json
import os
from pathlib import Path

import numpy as np
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageChops, ImageFilter

SRC = Path(__file__).resolve().parent
OUT = SRC.parent / "hero"
P = json.loads((SRC / "params.json").read_text(encoding="utf-8"))


def r(v):
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s


# ---------------------------------------------------------------- скетч
def build_sketch():
    sk = P["sketch"]
    src = Image.open(SRC / "source.png").convert("L").crop(tuple(sk["crop"]))
    c = np.asarray(src).astype(float)
    paper, ink = sk["paper"], sk["ink"]
    alpha = Image.fromarray((np.clip((paper - c) / (paper - ink), 0, 1) * 255).astype("uint8"))

    # Контуры — всё, что переживает морфологическое открытие 3×3
    # (линии толще ~2 px и заливки). Остаток — тонкая штриховка.
    binary = alpha.point(lambda v: 255 if v > 90 else 0)
    opened = binary.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    thick = opened.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1))
    lines = ImageChops.multiply(alpha, thick)
    hatch = ImageChops.subtract(alpha, lines)

    w = sk["width"]
    h = round(src.height * w / src.width)
    levels = sk["alphaLevels"]
    for name, layer in (("lines", lines), ("hatch", hatch)):
        a = np.asarray(layer.resize((w, h), Image.LANCZOS)).astype(float)
        # Несколько уровней альфы: сглаживание сохраняется, а lossless WebP
        # жмёт такую картинку в 2–3 раза лучше lossy.
        a = (np.round(a / 255 * (levels - 1)) / (levels - 1) * 255).astype("uint8")
        im = Image.new("RGBA", (w, h), (17, 17, 17, 255))
        im.putalpha(Image.fromarray(a))
        im.save(OUT / f"sketch-{name}.webp", "WEBP", lossless=True, quality=100, method=6)
    return w, h


# ---------------------------------------------------------------- надпись
def build_wordmark():
    t = P["text"]
    font = TTFont(SRC / t["font"])
    gs, cmap = font.getGlyphSet(), font.getBestCmap()
    upm, cap = font["head"].unitsPerEm, font["OS/2"].sCapHeight
    s = t["capHeight"] / cap
    sx = s * t["scaleX"]
    em = t["capHeight"] / cap * upm  # кегль в единицах SVG
    out = []
    for line in t["lines"]:
        for i, (ch, (x0, x1)) in enumerate(zip(line["chars"], line["runs"])):
            g = gs[cmap[ord(ch)]]
            bp = BoundsPen(gs)
            g.draw(bp)
            gx0, _, gx1, _ = bp.bounds
            cx = (x0 + x1 + 1) / 2
            dx = cx - (gx0 + gx1) / 2 * sx
            pen = SVGPathPen(gs, ntos=lambda v: r(v))
            g.draw(TransformPen(pen, (sx, 0, 0, -s, dx, line["baseline"])))
            out.append((i, pen.getCommands()))
    return out, em


def main():
    OUT.mkdir(exist_ok=True)
    w, h = build_sketch()
    glyphs, em = build_wordmark()
    track = em * P["text"]["trackFrom"]

    vb = P["logo"]["viewBox"]
    leaf_vb = P["logo"]["leafViewBox"]
    vx, vy, vw, vh = vb
    lx, ly, lw, lh = leaf_vb
    hinge = (P["logo"]["hingeX"] - lx) / lw * 100
    leaf_style = (
        f"left:{(lx - vx) / vw * 100:.3f}%;top:{(ly - vy) / vh * 100:.3f}%;"
        f"width:{lw / vw * 100:.3f}%;height:{lh / vh * 100:.3f}%;"
        f"transform-origin:{hinge:.2f}% 50%"
    )
    wipe = P["text"]["wipe"]

    letters = "\n".join(
        f'        <path class="sp-ch" style="--dx:{r(i * track)}px" d="{d}"/>' for i, d in glyphs
    )

    def pens(cls, items):
        return "\n".join(
            f'          <path class="{cls}" pathLength="1" stroke-width="{p["w"]}" '
            f'style="--d:{p["delay"]}s;--t:{p["dur"]}s" d="{p["d"]}"/>'
            for p in items
        )

    sk = P["sketch"]
    html = f"""<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Свободное пространство</title>
  <link rel="preload" href="sketch-lines.webp" as="image" type="image/webp">
  <link rel="stylesheet" href="hero.css">
</head>
<body>
<!-- ═══ HERO: начало блока для переноса на сайт ═══ -->
<section class="sp-hero" aria-labelledby="sp-title">
  <h1 class="sp-logo" id="sp-title">
    <span class="sp-vh">Свободное пространство</span>
    <svg class="sp-logo__art" viewBox="{' '.join(map(str, vb))}" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="sp-frame-clip"><path d="{P['logo']['frameClip']}"/></clipPath>
        <linearGradient id="sp-wipe-grad">
          <stop offset="{wipe['solid']}" stop-color="#fff"/>
          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <mask id="sp-text-mask" maskUnits="userSpaceOnUse" x="{vx}" y="{vy}" width="{vw * 3}" height="{vh}">
          <rect class="sp-wipe" x="{wipe['x']}" y="{vy}" width="{wipe['w']}" height="{vh}" fill="url(#sp-wipe-grad)" style="--from:{-wipe['travel']}px"/>
        </mask>
      </defs>
      <path class="sp-line sp-frame" pathLength="1" clip-path="url(#sp-frame-clip)" d="{P['logo']['frame']}"/>
      <g class="sp-word" mask="url(#sp-text-mask)">
{letters}
      </g>
    </svg>
    <span class="sp-leaf" style="{leaf_style}">
      <svg viewBox="{' '.join(map(str, leaf_vb))}" aria-hidden="true" focusable="false">
        <path class="sp-line sp-leaf__line" pathLength="1" d="{P['logo']['leaf']}"/>
      </svg>
    </span>
  </h1>

  <div class="sp-sketch">
    <svg viewBox="0 0 {w} {h}" aria-hidden="true" focusable="false">
      <defs>
        <mask id="sp-mask-lines" maskUnits="userSpaceOnUse" x="-60" y="-60" width="{w + 120}" height="{h + 120}">
          <g class="sp-pens">
{pens('sp-pen', sk['pens'])}
          </g>
        </mask>
        <mask id="sp-mask-hatch" maskUnits="userSpaceOnUse" x="-60" y="-60" width="{w + 120}" height="{h + 120}">
          <g class="sp-pens">
{pens('sp-pen', [dict(p, delay=round(p['delay'] + sk['hatchShift'], 2), dur=sk['hatchDur']) for p in sk['pens']])}
          </g>
        </mask>
      </defs>
      <image href="sketch-lines.webp" width="{w}" height="{h}" mask="url(#sp-mask-lines)"/>
      <image href="sketch-hatch.webp" width="{w}" height="{h}" mask="url(#sp-mask-hatch)"/>
    </svg>
  </div>
</section>
<!-- ═══ HERO: конец блока ═══ -->
</body>
</html>
"""
    (OUT / "index.html").write_text(html, encoding="utf-8")
    total = 0
    for f in sorted(OUT.iterdir()):
        total += f.stat().st_size
        print(f"{f.name:22} {f.stat().st_size / 1024:6.1f} КБ")
    print(f"{'итого':22} {total / 1024:6.1f} КБ")


if __name__ == "__main__":
    main()

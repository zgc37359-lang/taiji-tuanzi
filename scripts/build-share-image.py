"""生成竖屏分享图（2160×2880 与 1080×1440）。

依赖：Pillow，以及 Windows 中文字体 msyhbd.ttc / msyh.ttc 与 CascadiaMono.ttf。
用法：python scripts/build-share-image.py
"""

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SHEET = ROOT / "spritesheet.webp"
OUT_DIR = ROOT / "assets" / "share"

W, H = 2160, 2880
CELL_W, CELL_H = 192, 208

BOLD = "C:/Windows/Fonts/msyhbd.ttc"
REGULAR = "C:/Windows/Fonts/msyh.ttc"
MONO = "C:/Windows/Fonts/CascadiaMono.ttf"

INK = (248, 240, 220, 255)
SUB = (198, 216, 200, 255)
GOLD = (246, 212, 117, 255)
MUTED = (150, 178, 156, 255)
CODE = (214, 236, 218, 255)

BASE = "https://github.com/zgc37359-lang/taiji-tuanzi/raw/main"
CURL = [
    "curl -fsSL \\",
    "  " + BASE + "/install.sh | sh",
]
PS1 = "irm " + BASE + "/install.ps1 | iex"


def gradient(size, top, bottom):
    img = Image.new("RGB", size, top)
    draw = ImageDraw.Draw(img)
    for y in range(size[1]):
        t = y / (size[1] - 1)
        draw.line(
            [(0, y), (size[0], y)],
            fill=tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3)),
        )
    return img


def fit(path, text, max_width, start_size, floor=18):
    size = start_size
    while size > floor:
        font = ImageFont.truetype(path, size, index=0)
        if font.getlength(text) <= max_width:
            return font
        size -= 1
    return ImageFont.truetype(path, floor, index=0)


def centered(draw, y, text, font, fill):
    width = font.getlength(text)
    draw.text(((W - width) / 2, y), text, font=font, fill=fill)


def main():
    canvas = gradient((W, H), (20, 53, 47), (61, 106, 88)).convert("RGBA")
    draw = ImageDraw.Draw(canvas, "RGBA")

    for radius, alpha in ((980, 14), (760, 18), (540, 22)):
        draw.ellipse(
            [(1080 - radius, 1120 - radius), (1080 + radius, 1120 + radius)],
            outline=(228, 216, 174, alpha),
            width=3,
        )

    tag_font = ImageFont.truetype(REGULAR, 40, index=0)
    title_font = ImageFont.truetype(BOLD, 200, index=0)
    sub_font = ImageFont.truetype(REGULAR, 54, index=0)
    card_title_font = ImageFont.truetype(BOLD, 50, index=0)
    label_font = ImageFont.truetype(REGULAR, 28, index=0)
    hint_font = ImageFont.truetype(REGULAR, 28, index=0)
    feet_font = ImageFont.truetype(REGULAR, 42, index=0)
    foot_font = ImageFont.truetype(REGULAR, 34, index=0)

    centered(draw, 130, "C O D E X   P E T   ·   v 2", tag_font, GOLD)
    centered(draw, 175, "太极团子", title_font, INK)
    centered(draw, 455, "一只打太极的青玉团子", sub_font, SUB)
    centered(draw, 525, "装进 Codex，陪你写完每一段代码", sub_font, SUB)

    sheet = Image.open(SHEET).convert("RGBA")
    pet = sheet.crop((0, 0, CELL_W, CELL_H))
    scale = 4.7
    pet = pet.resize((round(CELL_W * scale), round(CELL_H * scale)), Image.LANCZOS)
    canvas.alpha_composite(pet, (round((W - pet.width) / 2), 640))

    card_x, card_y, card_w, card_h = 135, 1700, W - 270, 700
    draw.rounded_rectangle(
        [(card_x, card_y), (card_x + card_w, card_y + card_h)],
        radius=44,
        fill=(10, 32, 27, 235),
        outline=(228, 216, 174, 90),
        width=3,
    )
    pad = 78
    inner = card_w - pad * 2
    draw.text((card_x + pad, card_y + 62), "一行安装", font=card_title_font, fill=INK)

    draw.text((card_x + pad, card_y + 168), "macOS / Linux", font=label_font, fill=GOLD)
    mono_font = fit(MONO, CURL[1], inner, 40)
    y = card_y + 214
    for line in CURL:
        draw.text((card_x + pad, y), line, font=mono_font, fill=CODE)
        y += 80

    draw.text((card_x + pad, card_y + 390), "Windows（PowerShell）", font=label_font, fill=GOLD)
    ps_font = fit(MONO, PS1, inner, 36)
    draw.text((card_x + pad, card_y + 436), PS1, font=ps_font, fill=CODE)

    draw.text(
        (card_x + pad, card_y + 580),
        "加 TAIJI_TUANZI_EDITIONS=1 可同时安装初版配色与 v1 兼容包",
        font=hint_font,
        fill=MUTED,
    )

    centered(draw, 2520, "73 帧   ·   9 动作   ·   16 向视线   ·   MIT 开源", feet_font, SUB)
    centered(draw, 2680, "github.com/zgc37359-lang/taiji-tuanzi", foot_font, GOLD)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    big = OUT_DIR / "vertical-2160x2880.png"
    canvas.convert("RGB").save(big, "PNG", optimize=True)
    small = OUT_DIR / "vertical-1080x1440.png"
    canvas.convert("RGB").resize((1080, 1440), Image.LANCZOS).save(small, "PNG", optimize=True)

    print(f"命令字号：curl {mono_font.size}px（宽 {mono_font.getlength(CURL[1]):.0f}px / 上限 {inner:.0f}px）")
    print(f"           ps1 {ps_font.size}px（宽 {ps_font.getlength(PS1):.0f}px）")
    for path in (big, small):
        print(path.name, Image.open(path).size, f"{os.path.getsize(path) / 1024:.0f} KB")
    assert mono_font.getlength(CURL[1]) <= inner and ps_font.getlength(PS1) <= inner


if __name__ == "__main__":
    main()
